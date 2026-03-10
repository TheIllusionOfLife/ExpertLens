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

# Image constraints
JPEG_MIME = "image/jpeg"


@dataclass
class SessionState:
    """Tracks Gemini session state for resumption."""

    handle: str | None = None
    is_connected: bool = False
    reconnect_attempts: int = 0


class GeminiLiveSession:
    """
    Manages a Gemini Live API session.

    Handles:
    - Connection with contextWindowCompression (SlidingWindow) to avoid 2-min image cutoff
    - Session resumption via saved handle (for ~10min WebSocket limit)
    - GoAway handling: save handle → close → reconnect
    - Streaming audio/image to Gemini and receiving audio responses
    """

    MAX_RECONNECT_ATTEMPTS = 3
    RECONNECT_DELAY_SECONDS = 1.0

    def __init__(
        self,
        system_instruction: str,
        on_audio_response: Callable[[bytes], None] | None = None,
        on_reconnecting: Callable[[], None] | None = None,
        on_reconnected: Callable[[], None] | None = None,
    ):
        self._system_instruction = system_instruction
        self._on_audio_response = on_audio_response
        self._on_reconnecting = on_reconnecting
        self._on_reconnected = on_reconnected

        self._client = genai.Client(api_key=settings.gemini_api_key)
        self._session: Any = None
        self._state = SessionState()
        self._receive_task: asyncio.Task | None = None
        self._send_lock = asyncio.Lock()

    @property
    def session_handle(self) -> str | None:
        return self._state.handle

    @property
    def is_connected(self) -> bool:
        return self._state.is_connected

    def _build_config(self) -> types.LiveConnectConfig:
        """Build Gemini Live session config."""
        tools = self._build_tools()
        return types.LiveConnectConfig(
            system_instruction=self._system_instruction,
            response_modalities=[types.Modality.AUDIO],
            context_window_compression=types.ContextWindowCompressionConfig(
                sliding_window=types.SlidingWindow(),
            ),
            session_resumption=types.SessionResumptionConfig(),
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Aoede")
                )
            ),
            tools=tools if tools else None,
        )

    def _build_tools(self) -> list[types.Tool]:
        """Build tool definitions for the agent."""
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
            )
        ]

    async def connect(self, saved_handle: str | None = None) -> None:
        """Open a Gemini Live session, optionally resuming from a saved handle."""
        config = self._build_config()

        if saved_handle:
            config.session_resumption = types.SessionResumptionConfig(handle=saved_handle)
            logger.info("Connecting with saved handle for session resumption")

        try:
            async with self._client.aio.live.connect(
                model=settings.gemini_live_model, config=config
            ) as session:
                self._session = session
                self._state.is_connected = True
                self._state.reconnect_attempts = 0
                logger.info("Gemini Live session connected")
                await self._run_session()
        except Exception as e:
            logger.error(f"Gemini session error: {e}")
            self._state.is_connected = False
            raise

    async def _run_session(self) -> None:
        """Run the receive loop for the current session."""
        try:
            async for response in self._session.receive():
                await self._handle_response(response)
        except Exception as e:
            logger.warning(f"Session receive loop ended: {e}")
        finally:
            self._state.is_connected = False

    async def _handle_response(self, response: Any) -> None:
        """Process a response from Gemini."""
        # Handle session resumption handle updates
        if hasattr(response, "session_resumption_update") and response.session_resumption_update:
            update = response.session_resumption_update
            if hasattr(update, "new_handle") and update.new_handle:
                self._state.handle = update.new_handle
                logger.debug(f"Session handle updated: {self._state.handle[:8]}...")

        # Handle GoAway — server is about to close the connection
        if hasattr(response, "go_away") and response.go_away:
            logger.info("Received GoAway from Gemini, initiating session resumption")
            await self._handle_go_away()
            return

        # Handle audio response data
        if hasattr(response, "data") and response.data:
            if self._on_audio_response:
                self._on_audio_response(response.data)

        # Handle tool calls (NON_BLOCKING: WHEN_IDLE)
        if hasattr(response, "tool_call") and response.tool_call:
            await self._handle_tool_call(response.tool_call)

    async def _handle_go_away(self) -> None:
        """Handle GoAway by notifying client and reconnecting with saved handle."""
        if self._on_reconnecting:
            self._on_reconnecting()

        saved_handle = self._state.handle
        self._state.is_connected = False

        for attempt in range(self.MAX_RECONNECT_ATTEMPTS):
            try:
                await asyncio.sleep(self.RECONNECT_DELAY_SECONDS * (attempt + 1))
                logger.info(f"Reconnect attempt {attempt + 1}/{self.MAX_RECONNECT_ATTEMPTS}")
                await self.connect(saved_handle=saved_handle)
                if self._on_reconnected:
                    self._on_reconnected()
                return
            except Exception as e:
                logger.error(f"Reconnect attempt {attempt + 1} failed: {e}")

        logger.error("All reconnect attempts failed")

    async def _handle_tool_call(self, tool_call: Any) -> None:
        """Handle function calls from Gemini (stub — real impl in PR3)."""
        from agent.tools.knowledge import get_coach_knowledge_stub
        from agent.tools.preferences import get_user_preferences_stub

        responses = []
        for fc in tool_call.function_calls:
            args = fc.args or {}
            if fc.name == "get_coach_knowledge":
                result = get_coach_knowledge_stub(args.get("topic", ""))
            elif fc.name == "get_user_preferences":
                result = get_user_preferences_stub(args.get("user_id", ""))
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
                        media_chunks=[
                            types.Blob(data=jpeg_bytes, mime_type=JPEG_MIME)
                        ]
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
                        media_chunks=[
                            types.Blob(data=pcm_bytes, mime_type=INPUT_MIME)
                        ]
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
        """Close the Gemini session."""
        self._state.is_connected = False
        if self._session:
            try:
                await self._session.close()
            except Exception:
                pass
            self._session = None
