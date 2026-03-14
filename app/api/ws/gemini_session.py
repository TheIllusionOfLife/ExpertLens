"""Gemini Live API session manager with context window compression and session resumption."""

import asyncio
import logging
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from google import genai
from google.genai import types

from app.api.config import settings
from app.api.ws.audio import INPUT_MIME

logger = logging.getLogger(__name__)

JPEG_MIME = "image/jpeg"
MAX_RECONNECT_ATTEMPTS = 3
RECONNECT_DELAY_SECONDS = 1.0


@dataclass
class SessionState:
    """Tracks Gemini session state for resumption."""

    handle: str | None = None
    is_connected: bool = False


class GeminiLiveSession:
    """
    Manages a Gemini Live API session.

    Lifecycle:
    - Call `run(saved_handle=...)` — this is the top-level loop that handles reconnection.
    - Each reconnect attempt calls `_connect_once()`, which opens a single `async with connect()`
      context, runs the receive loop, and exits cleanly.
    - GoAway is handled by setting `_reconnect_requested = True` and breaking out of the
      receive loop, so reconnection always happens OUTSIDE the previous session context.
    - `connected_event` is set once the session is open; the handler waits on this before
      sending `session_started` to the client.
    """

    def __init__(
        self,
        system_instruction: str,
        coach_id: str = "default",
        user_id: str = "default",
        on_audio_response: Callable[[bytes], None] | None = None,
        on_session_handle: Callable[[str], None] | None = None,
        on_reconnecting: Callable[[], None] | None = None,
        on_reconnected: Callable[[], None] | None = None,
        on_interrupted: Callable[[], None] | None = None,
        on_text_response: Callable[[str, bool], None] | None = None,
        on_input_text: Callable[[str], None] | None = None,
    ):
        self._system_instruction = system_instruction
        self._coach_id = coach_id
        self._user_id = user_id
        self._on_audio_response = on_audio_response
        self._on_session_handle = on_session_handle
        self._on_reconnecting = on_reconnecting
        self._on_reconnected = on_reconnected
        self._on_interrupted = on_interrupted
        self._on_text_response = on_text_response
        self._on_input_text = on_input_text

        self._client = genai.Client(api_key=settings.gemini_api_key)
        self._session: Any = None
        self._state = SessionState()
        self._send_lock = asyncio.Lock()
        self._reconnect_requested = False
        self._closed = False

        # Set when the session is open and ready to receive media
        self.connected_event = asyncio.Event()

    @property
    def session_handle(self) -> str | None:
        return self._state.handle

    @property
    def is_connected(self) -> bool:
        return self._state.is_connected

    def _build_config(self, saved_handle: str | None = None) -> types.LiveConnectConfig:
        """Build Gemini Live session config."""
        resumption_config = (
            types.SessionResumptionConfig(handle=saved_handle)
            if saved_handle
            else types.SessionResumptionConfig()
        )
        return types.LiveConnectConfig(
            system_instruction=self._system_instruction,
            response_modalities=[types.Modality.AUDIO],
            output_audio_transcription=types.AudioTranscriptionConfig(),
            input_audio_transcription=types.AudioTranscriptionConfig(),
            context_window_compression=types.ContextWindowCompressionConfig(
                sliding_window=types.SlidingWindow(),
            ),
            session_resumption=resumption_config,
            speech_config=types.SpeechConfig(),
            tools=self._build_tools(),
        )

    def _build_tools(self) -> list[types.Tool]:
        """Build tool declarations for the agent."""
        return [
            types.Tool(
                function_declarations=[
                    types.FunctionDeclaration(
                        name="get_coach_knowledge",
                        description="Retrieve detailed knowledge for a specific topic.",
                        parameters=types.Schema(
                            type=types.Type.OBJECT,
                            properties={
                                "topic": types.Schema(
                                    type=types.Type.STRING,
                                    description="Topic to look up (e.g., 'modifiers', 'shortcuts')",
                                )
                            },
                            required=["topic"],
                        ),
                    ),
                    types.FunctionDeclaration(
                        name="get_user_preferences",
                        description="Get the current user's coaching preferences.",
                        parameters=types.Schema(
                            type=types.Type.OBJECT,
                            properties={
                                "user_id": types.Schema(
                                    type=types.Type.STRING,
                                    description="The user ID to get preferences for",
                                )
                            },
                            required=["user_id"],
                        ),
                    ),
                ]
            ),
            types.Tool(google_search=types.GoogleSearch()),
        ]

    async def run(self, saved_handle: str | None = None) -> None:
        """
        Top-level run loop — handles reconnection after GoAway.

        This is the method to call from the WebSocket handler as a background task.
        Reconnection always happens here, OUTSIDE the previous session context.
        """
        current_handle = saved_handle
        is_reconnect = False
        for attempt in range(MAX_RECONNECT_ATTEMPTS + 1):
            if self._closed:
                break
            self._reconnect_requested = False
            try:
                await self._connect_once(current_handle, is_reconnect=is_reconnect)
            except Exception as e:
                logger.error(f"Session error on attempt {attempt}: {e}")
                self._state.is_connected = False
                if not self._reconnect_requested:
                    raise

            if self._closed or not self._reconnect_requested:
                break

            # GoAway was received — reconnect with the latest saved handle
            current_handle = self._state.handle
            logger.info(
                f"GoAway reconnect {attempt + 1}/{MAX_RECONNECT_ATTEMPTS}, "
                f"handle={'set' if current_handle else 'none'}"
            )
            if self._on_reconnecting:
                self._on_reconnecting()

            await asyncio.sleep(RECONNECT_DELAY_SECONDS)
            is_reconnect = True

    async def _connect_once(self, saved_handle: str | None, *, is_reconnect: bool = False) -> None:
        """Open a single Gemini Live session and run its receive loop."""
        config = self._build_config(saved_handle)
        if saved_handle:
            logger.info("Connecting with saved handle for session resumption")

        async with self._client.aio.live.connect(
            model=settings.gemini_live_model, config=config
        ) as session:
            self._session = session
            self._state.is_connected = True
            self.connected_event.set()
            logger.info("Gemini Live session connected")
            # Notify client only after the new session is confirmed open
            if is_reconnect and self._on_reconnected:
                self._on_reconnected()

            try:
                logger.info("Starting receive loop")
                # session.receive() yields messages for one model turn then
                # exhausts.  Wrap in an outer loop so we keep listening for
                # subsequent turns (user speaks again → new model turn).
                while not self._closed and not self._reconnect_requested:
                    async for response in session.receive():
                        await self._handle_response(response)
                        if self._reconnect_requested or self._closed:
                            break
                    logger.debug("receive() iterator exhausted, re-entering for next turn")
            except Exception:
                logger.exception("Receive loop error")
                raise
            finally:
                logger.info("Receive loop finished, cleaning up")
                self._state.is_connected = False
                self._session = None

    async def _handle_response(self, response: Any) -> None:
        """Dispatch a response from Gemini to the appropriate handler."""
        # Log response types for diagnostics
        parts = []
        if hasattr(response, "session_resumption_update") and response.session_resumption_update:
            parts.append("resumption")
        if hasattr(response, "go_away") and response.go_away:
            parts.append("go_away")
        sc = getattr(response, "server_content", None)
        if sc:
            if sc.model_turn and sc.model_turn.parts:
                part_types = []
                for p in sc.model_turn.parts:
                    if hasattr(p, "inline_data") and p.inline_data:
                        part_types.append(f"audio({len(p.inline_data.data)}b)")
                    elif hasattr(p, "text") and p.text:
                        part_types.append("text")
                parts.append(f"model_turn[{','.join(part_types)}]")
            if sc.turn_complete:
                parts.append("turn_complete")
        if hasattr(response, "tool_call") and response.tool_call:
            parts.append("tool_call")
        logger.info(f"Response: {' | '.join(parts) if parts else 'empty'}")

        # Session resumption handle — save and emit to client for persistence
        if hasattr(response, "session_resumption_update") and response.session_resumption_update:
            update = response.session_resumption_update
            if hasattr(update, "new_handle") and update.new_handle:
                new_handle: str = update.new_handle
                self._state.handle = new_handle
                logger.debug(f"Session handle updated: {new_handle[:8]}...")
                if self._on_session_handle:
                    self._on_session_handle(new_handle)

        # GoAway — request reconnection after current response processing
        if hasattr(response, "go_away") and response.go_away:
            logger.info("Received GoAway from Gemini")
            self._reconnect_requested = True
            return

        # Barge-in: model turn was interrupted by user speech
        sc = getattr(response, "server_content", None)
        if sc and getattr(sc, "interrupted", False):
            logger.info("Model interrupted by user (barge-in)")
            if self._on_interrupted:
                self._on_interrupted()

        # Audio response data — extract from inline_data parts directly
        if sc and sc.model_turn and sc.model_turn.parts:
            for part in sc.model_turn.parts:
                if hasattr(part, "inline_data") and part.inline_data and part.inline_data.data:
                    if self._on_audio_response:
                        self._on_audio_response(part.inline_data.data)

        # Output transcription — text alongside audio for display
        if sc and sc.output_transcription and sc.output_transcription.text:
            if self._on_text_response:
                finished = bool(sc.output_transcription.finished)
                self._on_text_response(sc.output_transcription.text, finished)

        # Input transcription — user speech text
        if sc and hasattr(sc, 'input_transcription') and sc.input_transcription:
            if sc.input_transcription.text and sc.input_transcription.finished:
                if self._on_input_text:
                    self._on_input_text(sc.input_transcription.text)

        # Tool calls
        if hasattr(response, "tool_call") and response.tool_call:
            await self._handle_tool_call(response.tool_call)

    async def _handle_tool_call(self, tool_call: Any) -> None:
        """Handle function calls from Gemini."""
        from agent.tools.knowledge import get_coach_knowledge
        from agent.tools.preferences import get_user_preferences

        function_calls = tool_call.function_calls if tool_call.function_calls else []
        responses = []
        for fc in function_calls:
            args = fc.args or {}
            if fc.name == "get_coach_knowledge":
                # Normalize to canonical software_name (same rules as base.py prompt builder)
                software_name = self._coach_id.strip().lower().replace("-", "_").replace(" ", "_")
                result = await get_coach_knowledge(
                    software_name=software_name,
                    topic=args.get("topic", ""),
                )
            elif fc.name == "get_user_preferences":
                # Always use session user_id — ignore agent-supplied value to prevent injection
                result = await get_user_preferences(user_id=self._user_id)
            else:
                result = {"error": f"Unknown tool: {fc.name}"}

            responses.append(
                types.FunctionResponse(
                    id=fc.id,
                    name=fc.name,
                    response=result,
                )
            )

        if responses:
            await self.send_tool_response(responses)

    async def send_image(self, jpeg_bytes: bytes) -> None:
        """Send a JPEG image frame to Gemini."""
        if not self._session or not self._state.is_connected:
            return
        async with self._send_lock:
            try:
                await self._session.send(
                    input=types.LiveClientRealtimeInput(
                        media_chunks=[types.Blob(data=jpeg_bytes, mime_type=JPEG_MIME)]
                    )
                )
            except Exception as e:
                logger.warning(f"Failed to send image frame: {e}")

    async def send_audio(self, pcm_bytes: bytes) -> None:
        """Send PCM 16-bit 16kHz audio to Gemini."""
        if not self._session or not self._state.is_connected:
            return
        async with self._send_lock:
            try:
                await self._session.send(
                    input=types.LiveClientRealtimeInput(
                        media_chunks=[types.Blob(data=pcm_bytes, mime_type=INPUT_MIME)]
                    )
                )
            except Exception as e:
                logger.warning(f"Failed to send audio chunk: {e}")

    async def send_tool_response(self, responses: list[types.FunctionResponse]) -> None:
        """Send tool call responses back to Gemini."""
        if not self._session or not self._state.is_connected:
            return
        async with self._send_lock:
            try:
                await self._session.send(
                    input=types.LiveClientToolResponse(function_responses=responses)
                )
            except Exception as e:
                logger.warning(f"Failed to send tool response: {e}")

    async def close(self) -> None:
        """Signal the session to stop and close. Prevents any further reconnection."""
        self._closed = True
        self._state.is_connected = False
        if self._session:
            try:
                await self._session.close()
            except Exception:
                pass
            self._session = None
