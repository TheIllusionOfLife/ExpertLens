"""WebSocket handler: bridges browser client ↔ Gemini Live API."""
import asyncio
import logging

from fastapi import WebSocket, WebSocketDisconnect

from app.api.ws.audio import is_valid_pcm_chunk
from app.api.ws.gemini_session import GeminiLiveSession
from app.api.ws.protocol import (
    MEDIA_TAG_AUDIO,
    MEDIA_TAG_IMAGE,
    ErrorMessage,
    MessageType,
    ReconnectedMessage,
    ReconnectingMessage,
    SessionStartedMessage,
    parse_control_message,
)

logger = logging.getLogger(__name__)


class SessionHandler:
    """Handles a single WebSocket session between browser and Gemini."""

    def __init__(self, websocket: WebSocket, coach_id: str):
        self._ws = websocket
        self._coach_id = coach_id
        self._gemini: GeminiLiveSession | None = None
        self._audio_queue: asyncio.Queue[bytes] = asyncio.Queue(maxsize=100)
        self._gemini_task: asyncio.Task | None = None

    async def run(self) -> None:
        """Main session loop: receive from client, forward to Gemini."""
        try:
            await self._wait_for_start()
        except WebSocketDisconnect:
            logger.info(f"Client disconnected before session start (coach={self._coach_id})")
            return
        except Exception as e:
            await self._send_error(str(e))
            return

        try:
            await self._run_media_loop()
        except WebSocketDisconnect:
            logger.info(f"Client disconnected (coach={self._coach_id})")
        except Exception as e:
            logger.error(f"Session error: {e}")
            await self._send_error(str(e))
        finally:
            await self._cleanup()

    async def _wait_for_start(self) -> None:
        """Wait for start_session control message from client."""
        raw = await self._ws.receive_text()
        msg = parse_control_message(raw)

        if msg.get("type") != MessageType.START_SESSION:
            raise ValueError(f"Expected start_session, got: {msg.get('type')}")

        coach_id = msg.get("coach_id", self._coach_id)
        saved_handle = msg.get("session_handle")

        # Build system instruction (minimal stub — PR3 adds full grounding)
        from agent.prompts.base import build_system_instruction
        system_instruction = build_system_instruction(coach_id=coach_id)

        gemini = GeminiLiveSession(
            system_instruction=system_instruction,
            on_audio_response=self._enqueue_audio,
            on_reconnecting=self._notify_reconnecting,
            on_reconnected=self._notify_reconnected,
        )
        self._gemini = gemini

        # Start Gemini session in background
        self._gemini_task = asyncio.create_task(
            gemini.connect(saved_handle=saved_handle),
            name=f"gemini-session-{coach_id}",
        )

        # Give Gemini a moment to connect before sending started
        await asyncio.sleep(0.5)

        await self._ws.send_text(
            SessionStartedMessage(session_id=f"session-{coach_id}").model_dump_json()
        )

        # Start background task to forward audio from Gemini to client
        asyncio.create_task(self._forward_audio_loop(), name="audio-forward")

    async def _run_media_loop(self) -> None:
        """Receive binary media frames from client and forward to Gemini."""
        while True:
            message = await self._ws.receive()

            if "text" in message:
                await self._handle_control_message(message["text"])
            elif "bytes" in message:
                await self._handle_media_frame(message["bytes"])

    async def _handle_control_message(self, raw: str) -> None:
        """Handle JSON control messages (end_session, etc.)."""
        try:
            msg = parse_control_message(raw)
            if msg.get("type") == MessageType.END_SESSION:
                raise WebSocketDisconnect(code=1000)
        except WebSocketDisconnect:
            raise
        except Exception as e:
            logger.warning(f"Invalid control message: {e}")

    async def _handle_media_frame(self, data: bytes) -> None:
        """Route binary frames to Gemini by media type tag."""
        if len(data) < 2:
            return

        tag = data[0]
        payload = data[1:]

        if not self._gemini or not self._gemini.is_connected:
            return

        if tag == MEDIA_TAG_IMAGE:
            await self._gemini.send_image(payload)
        elif tag == MEDIA_TAG_AUDIO:
            if is_valid_pcm_chunk(payload):
                await self._gemini.send_audio(payload)
        else:
            logger.debug(f"Unknown media tag: {tag:#04x}")

    def _enqueue_audio(self, pcm_bytes: bytes) -> None:
        """Callback from Gemini session — enqueue audio for forwarding to client."""
        try:
            self._audio_queue.put_nowait(pcm_bytes)
        except asyncio.QueueFull:
            logger.debug("Audio queue full, dropping chunk")

    async def _forward_audio_loop(self) -> None:
        """Forward Gemini audio responses to the WebSocket client as binary frames."""
        while True:
            try:
                pcm_bytes = await asyncio.wait_for(self._audio_queue.get(), timeout=30.0)
                # Tag byte 0x02 = audio
                await self._ws.send_bytes(bytes([MEDIA_TAG_AUDIO]) + pcm_bytes)
            except TimeoutError:
                continue
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.warning(f"Audio forward error: {e}")
                break

    def _notify_reconnecting(self) -> None:
        """Called by GeminiSession when GoAway received — notify client."""
        asyncio.create_task(
            self._ws.send_text(ReconnectingMessage().model_dump_json()),
            name="notify-reconnecting",
        )

    def _notify_reconnected(self) -> None:
        """Called by GeminiSession after successful reconnection."""
        asyncio.create_task(
            self._ws.send_text(ReconnectedMessage().model_dump_json()),
            name="notify-reconnected",
        )

    async def _send_error(self, message: str) -> None:
        """Send error message to client."""
        try:
            await self._ws.send_text(ErrorMessage(message=message).model_dump_json())
        except Exception:
            pass

    async def _cleanup(self) -> None:
        """Clean up Gemini session on disconnect."""
        if self._gemini:
            await self._gemini.close()
        if self._gemini_task and not self._gemini_task.done():
            self._gemini_task.cancel()
            try:
                await self._gemini_task
            except asyncio.CancelledError:
                pass


async def websocket_session_endpoint(websocket: WebSocket, coach_id: str) -> None:
    """FastAPI WebSocket endpoint entry point."""
    await websocket.accept()
    handler = SessionHandler(websocket=websocket, coach_id=coach_id)
    await handler.run()
