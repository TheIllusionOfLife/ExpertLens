"""WebSocket handler: bridges browser client ↔ Gemini Live API."""

import asyncio
import logging
import time

from fastapi import WebSocket, WebSocketDisconnect

from agent.memory.summarize import summarize_session
from agent.prompts.base import build_system_instruction_from_firestore
from app.api.auth import decode_token
from app.api.config import settings
from app.api.db.coach_repo import get_coach
from app.api.db.session_repo import create_session as create_fs_session
from app.api.db.session_repo import end_session as end_fs_session
from app.api.ws.audio import is_valid_pcm_chunk
from app.api.ws.gemini_session import GeminiLiveSession
from app.api.ws.protocol import (
    MAX_AUDIO_BYTES,
    MAX_IMAGE_BYTES,
    MEDIA_TAG_AUDIO,
    MEDIA_TAG_IMAGE,
    ErrorMessage,
    InterruptedMessage,
    MessageType,
    ReconnectedMessage,
    ReconnectingMessage,
    SessionHandleMessage,
    SessionStartedMessage,
    StartSessionMessage,
    TextResponseMessage,
    parse_control_message,
)

logger = logging.getLogger(__name__)

_MAX_TURN_CHARS = 500  # truncate a single very long turn
_MAX_TRANSCRIPT_TURNS = 30  # cap total turns stored

# Per-user WebSocket session rate limiter: tracks recent session start timestamps.
_SESSION_RATE_WINDOW = 60.0  # seconds
_SESSION_RATE_LIMIT = 3  # max sessions per window
_user_session_starts: dict[str, list[float]] = {}


def _append_transcript(transcript: list[str], speaker: str, text: str) -> None:
    """Append a turn to transcript with truncation and cap."""
    turn = text[:_MAX_TURN_CHARS]
    transcript.append(f"{speaker}: {turn}")
    if len(transcript) > _MAX_TRANSCRIPT_TURNS:
        transcript.pop(0)


class SessionHandler:
    """Handles a single WebSocket session between browser and Gemini."""

    def __init__(self, websocket: WebSocket, coach_id: str):
        self._ws = websocket
        self._coach_id = coach_id
        self._gemini: GeminiLiveSession | None = None
        self._audio_queue: asyncio.Queue[bytes] = asyncio.Queue(maxsize=500)
        self._gemini_task: asyncio.Task | None = None
        self._audio_forward_task: asyncio.Task | None = None
        self._firestore_session_id: str | None = None
        # Serialize all WebSocket writes to prevent concurrent send race conditions
        self._ws_send_lock = asyncio.Lock()
        # Transcript accumulation for end-of-session summarization
        self._current_turn_text: str = ""
        self._transcript: list[str] = []  # interleaved User/Coach turns
        self._timeout_task: asyncio.Task | None = None

    async def run(self) -> None:
        """Main session loop."""
        # Validate Origin header to guard WebSocket against cross-origin requests
        origin = self._ws.headers.get("origin", "")
        if origin and origin not in settings.cors_origins_list:
            await self._ws.close(code=4003, reason="Origin not allowed")
            return

        try:
            await self._wait_for_start()
        except WebSocketDisconnect:
            logger.info(f"Client disconnected before session start (coach={self._coach_id})")
            await self._cleanup()
            return
        except Exception:
            logger.exception("Session setup failed")
            await self._send_error("Session setup failed")
            await self._cleanup()
            return

        try:
            await self._run_media_loop()
        except WebSocketDisconnect:
            logger.info(f"Client disconnected (coach={self._coach_id})")
        except Exception:
            logger.exception("Session error")
            await self._send_error("Session error")
        finally:
            await self._cleanup()

    async def _wait_for_start(self) -> None:
        """Wait for start_session control message, open Gemini session, confirm to client."""
        try:
            raw = await asyncio.wait_for(self._ws.receive_text(), timeout=10.0)
        except TimeoutError:
            await self._ws.close(code=4008, reason="Start message timeout")
            return
        try:
            msg = StartSessionMessage.model_validate_json(raw)
        except Exception as e:
            raise ValueError(f"Invalid start_session message: {e}") from e

        if msg.coach_id != self._coach_id:
            raise ValueError(f"coach_id mismatch: path={self._coach_id!r}, body={msg.coach_id!r}")

        coach_id = self._coach_id
        saved_handle = msg.session_handle

        if msg.token:
            try:
                payload = decode_token(msg.token)
                user_id = payload.sub
            except Exception:
                await self._ws.close(code=4001, reason="Invalid token")
                return
        else:
            await self._ws.close(code=4001, reason="Authentication required")
            return

        # Per-user session rate limiting
        now = time.monotonic()
        starts = _user_session_starts.get(user_id, [])
        starts = [t for t in starts if now - t < _SESSION_RATE_WINDOW]
        if len(starts) >= _SESSION_RATE_LIMIT:
            await self._ws.close(code=4029, reason="Rate limited")
            return
        starts.append(now)
        _user_session_starts[user_id] = starts

        # Authorization: verify user can access this coach. Fail-closed on error.
        try:
            coach = await get_coach(coach_id)
        except Exception as e:
            logger.error(f"Failed to load coach for auth check (coach={coach_id}): {e}")
            await self._ws.close(code=4003, reason="Authorization check failed")
            return

        if not coach:
            await self._ws.close(code=4003, reason="Coach not found")
            return

        if coach.owner_id is not None and coach.owner_id != user_id:
            await self._ws.close(code=4003, reason="Not authorized")
            return

        # Non-blocking knowledge status checks (informational only)
        if coach.knowledge_status == "building":
            logger.info(f"Session started while knowledge is still building (coach={coach_id})")
        elif coach.knowledge_status == "error":
            await self._send_error(
                "Knowledge generation failed; session will use base model training only"
            )

        # Build system instruction and create Firestore session record in parallel.
        system_instruction, fs_session = await asyncio.gather(
            build_system_instruction_from_firestore(coach_id=coach_id, user_id=user_id),
            create_fs_session(coach_id, user_id),
            return_exceptions=True,
        )
        if isinstance(fs_session, BaseException):
            logger.warning(f"Failed to create Firestore session: {fs_session}")
        else:
            self._firestore_session_id = fs_session.session_id
        if isinstance(system_instruction, BaseException):
            raise system_instruction
        assert isinstance(system_instruction, str)

        gemini = GeminiLiveSession(
            system_instruction=system_instruction,
            coach_id=coach_id,
            user_id=user_id,
            on_audio_response=self._enqueue_audio,
            on_session_handle=self._notify_session_handle,
            on_reconnecting=self._notify_reconnecting,
            on_reconnected=self._notify_reconnected,
            on_interrupted=self._notify_interrupted,
            on_text_response=self._notify_text_response,
            on_input_text=self._notify_input_text,
        )
        self._gemini = gemini

        # Start Gemini run loop in background (handles reconnection internally)
        self._gemini_task = asyncio.create_task(
            gemini.run(saved_handle=saved_handle),
            name=f"gemini-session-{coach_id}",
        )

        # Wait for Gemini to confirm connection before telling the client
        try:
            timeout = settings.gemini_connect_timeout
            await asyncio.wait_for(gemini.connected_event.wait(), timeout=timeout)
        except TimeoutError as e:
            self._gemini_task.cancel()
            secs = int(settings.gemini_connect_timeout)
            raise RuntimeError(f"Gemini session failed to connect within {secs} seconds") from e

        await self._ws_send(
            SessionStartedMessage(
                session_id=self._firestore_session_id or f"session-{coach_id}"
            ).model_dump_json(),
            is_text=True,
        )

        # Start managed audio forward task
        self._audio_forward_task = asyncio.create_task(
            self._forward_audio_loop(), name="audio-forward"
        )
        self._timeout_task = asyncio.create_task(
            self._enforce_session_limit(), name="session-timeout"
        )

        # Monitor the Gemini task so we know if it dies
        self._gemini_task.add_done_callback(self._on_gemini_task_done)

    @staticmethod
    def _log_task_exception(task: asyncio.Task) -> None:
        """Done callback for fire-and-forget tasks — log exceptions instead of silencing."""
        if not task.cancelled() and task.exception():
            logger.warning(f"Background task {task.get_name()} failed: {task.exception()}")

    def _on_gemini_task_done(self, task: asyncio.Task) -> None:
        """Log when the Gemini background task finishes."""
        if task.cancelled():
            logger.info("Gemini task cancelled")
        elif task.exception():
            logger.error(f"Gemini task failed: {task.exception()}")
        else:
            logger.warning("Gemini task finished (receive loop ended)")

    async def _run_media_loop(self) -> None:
        """Receive binary media frames (and control messages) from client."""
        while True:
            message = await self._ws.receive()

            if "text" in message:
                await self._handle_control_message(message["text"])
            elif "bytes" in message:
                await self._handle_media_frame(message["bytes"])

    async def _handle_control_message(self, raw: str) -> None:
        """Handle JSON control messages."""
        try:
            msg = parse_control_message(raw)
            if msg.get("type") == MessageType.END_SESSION:
                raise WebSocketDisconnect(code=1000)
        except WebSocketDisconnect:
            raise
        except Exception as e:
            logger.warning(f"Invalid control message: {e}")

    async def _handle_media_frame(self, data: bytes) -> None:
        """Route binary frames to Gemini by media type tag, with size validation."""
        if len(data) < 2:
            return

        tag = data[0]
        payload = data[1:]

        if tag == MEDIA_TAG_IMAGE:
            if len(payload) > MAX_IMAGE_BYTES:
                logger.warning(f"Image frame too large ({len(payload)} bytes), dropping")
                return
        elif tag == MEDIA_TAG_AUDIO:
            if len(payload) > MAX_AUDIO_BYTES:
                logger.warning(f"Audio frame too large ({len(payload)} bytes), dropping")
                return
        else:
            logger.debug(f"Unknown media tag: {tag:#04x}")
            return

        if not self._gemini or not self._gemini.is_connected:
            return

        if tag == MEDIA_TAG_IMAGE:
            await self._gemini.send_image(payload)
        elif tag == MEDIA_TAG_AUDIO:
            if is_valid_pcm_chunk(payload):
                await self._gemini.send_audio(payload)

    def _enqueue_audio(self, pcm_bytes: bytes) -> None:
        """Callback from Gemini session — enqueue audio for forwarding."""
        try:
            self._audio_queue.put_nowait(pcm_bytes)
        except asyncio.QueueFull:
            logger.debug("Audio queue full, dropping chunk")

    async def _forward_audio_loop(self) -> None:
        """Forward Gemini audio to the WebSocket client as binary frames."""
        while True:
            try:
                pcm_bytes = await asyncio.wait_for(self._audio_queue.get(), timeout=30.0)
                await self._ws_send(bytes([MEDIA_TAG_AUDIO]) + pcm_bytes, is_text=False)
            except TimeoutError:
                continue
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.warning(f"Audio forward error: {e}")
                continue

    async def _ws_send(self, payload: str | bytes, *, is_text: bool) -> None:
        """Serialize all WebSocket sends to prevent concurrent write races."""
        async with self._ws_send_lock:
            try:
                if is_text:
                    await self._ws.send_text(payload)  # type: ignore[arg-type]
                else:
                    await self._ws.send_bytes(payload)  # type: ignore[arg-type]
            except Exception as e:
                logger.debug(f"WebSocket send error: {e}")

    def _notify_session_handle(self, handle: str) -> None:
        """Emit the latest session handle to the client for cross-reconnect persistence."""
        asyncio.create_task(
            self._ws_send(SessionHandleMessage(handle=handle).model_dump_json(), is_text=True),
            name="notify-handle",
        )

    def _notify_interrupted(self) -> None:
        """Called by GeminiSession when model turn is interrupted by user barge-in."""
        # Drop incomplete turn — interrupted speech is not useful for summarization
        self._current_turn_text = ""
        # Flush pending audio so the client doesn't keep playing stale audio
        while not self._audio_queue.empty():
            try:
                self._audio_queue.get_nowait()
            except asyncio.QueueEmpty:
                break
        task = asyncio.create_task(
            self._ws_send(InterruptedMessage().model_dump_json(), is_text=True),
            name="notify-interrupted",
        )
        task.add_done_callback(self._log_task_exception)

    def _notify_text_response(self, text: str, finished: bool) -> None:
        """Called by GeminiSession when output transcription text arrives."""
        if not self._current_turn_text and text.strip():
            logger.debug("Output transcription started (chunk_len=%d)", len(text))
        self._current_turn_text += text
        if finished:
            if self._current_turn_text.strip():
                _append_transcript(self._transcript, "Coach", self._current_turn_text)
            self._current_turn_text = ""
        task = asyncio.create_task(
            self._ws_send(
                TextResponseMessage(text=text, finished=finished).model_dump_json(),
                is_text=True,
            ),
            name="notify-text",
        )
        task.add_done_callback(self._log_task_exception)

    def _notify_reconnecting(self) -> None:
        """Called by GeminiSession when GoAway received."""
        asyncio.create_task(
            self._ws_send(ReconnectingMessage().model_dump_json(), is_text=True),
            name="notify-reconnecting",
        )

    def _notify_reconnected(self) -> None:
        """Called by GeminiSession after successful reconnection."""
        asyncio.create_task(
            self._ws_send(ReconnectedMessage().model_dump_json(), is_text=True),
            name="notify-reconnected",
        )

    async def _enforce_session_limit(self) -> None:
        await asyncio.sleep(settings.max_session_seconds)
        mins = settings.max_session_seconds // 60
        await self._send_error(
            f"Session ended after {mins} minutes. Start a new session to continue."
        )
        if self._gemini:
            await self._gemini.close()
        try:
            await self._ws.close(code=1000, reason="Session time limit reached")
        except Exception:
            pass

    def _notify_input_text(self, text: str) -> None:
        """Called by GeminiSession when input transcription completes."""
        if text.strip():
            _append_transcript(self._transcript, "User", text)

    async def _send_error(self, message: str) -> None:
        """Send error message to client."""
        await self._ws_send(ErrorMessage(message=message).model_dump_json(), is_text=True)

    async def _cleanup(self) -> None:
        """Cancel all background tasks and close Gemini session."""
        if self._timeout_task and not self._timeout_task.done():
            self._timeout_task.cancel()
            try:
                await self._timeout_task
            except asyncio.CancelledError:
                pass

        if self._audio_forward_task and not self._audio_forward_task.done():
            self._audio_forward_task.cancel()
            try:
                await self._audio_forward_task
            except asyncio.CancelledError:
                pass

        if self._gemini:
            await self._gemini.close()

        if self._gemini_task and not self._gemini_task.done():
            self._gemini_task.cancel()
            try:
                await self._gemini_task
            except asyncio.CancelledError:
                pass

        if self._firestore_session_id:
            # Flush any pending turn text that never received a finished=True event
            if self._current_turn_text.strip():
                _append_transcript(self._transcript, "Coach", self._current_turn_text)
                self._current_turn_text = ""

            summary, last_topics = "", []
            logger.info(f"Session cleanup: {len(self._transcript)} transcript turns accumulated")
            if self._transcript:
                try:
                    summary, last_topics = await asyncio.wait_for(
                        summarize_session(self._coach_id, self._transcript),
                        timeout=15.0,
                    )
                except Exception as e:
                    logger.warning(f"Failed to generate session summary: {e}")
            try:
                await end_fs_session(
                    self._firestore_session_id, summary=summary, last_topics=last_topics
                )
            except Exception as e:
                logger.warning(f"Failed to end Firestore session: {e}")


async def websocket_session_endpoint(websocket: WebSocket, coach_id: str) -> None:
    """FastAPI WebSocket endpoint entry point."""
    await websocket.accept()
    handler = SessionHandler(websocket=websocket, coach_id=coach_id)
    await handler.run()
