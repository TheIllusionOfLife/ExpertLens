"""WebSocket message protocol: JSON text frames for control plane, binary frames for media."""

from enum import StrEnum
from typing import Any

from pydantic import BaseModel, ConfigDict


class MessageType(StrEnum):
    # Client → Server
    START_SESSION = "start_session"
    END_SESSION = "end_session"
    # Server → Client
    SESSION_STARTED = "session_started"
    SESSION_HANDLE = "session_handle"  # Emit latest resumption handle to client
    RECONNECTING = "reconnecting"
    RECONNECTED = "reconnected"
    ERROR = "error"


# Binary frame media tags (1-byte prefix)
MEDIA_TAG_IMAGE = 0x01
MEDIA_TAG_AUDIO = 0x02

# Max payload sizes to guard against oversized frames
MAX_IMAGE_BYTES = 2 * 1024 * 1024  # 2 MB
MAX_AUDIO_BYTES = 64 * 1024  # 64 KB


class StartSessionMessage(BaseModel):
    model_config = ConfigDict(extra="forbid")
    type: MessageType = MessageType.START_SESSION
    coach_id: str
    session_handle: str | None = None  # For resumption


class EndSessionMessage(BaseModel):
    type: MessageType = MessageType.END_SESSION


class SessionStartedMessage(BaseModel):
    type: MessageType = MessageType.SESSION_STARTED
    session_id: str


class SessionHandleMessage(BaseModel):
    type: MessageType = MessageType.SESSION_HANDLE
    handle: str


class ReconnectingMessage(BaseModel):
    type: MessageType = MessageType.RECONNECTING


class ReconnectedMessage(BaseModel):
    type: MessageType = MessageType.RECONNECTED


class ErrorMessage(BaseModel):
    type: MessageType = MessageType.ERROR
    message: str


def parse_control_message(data: str) -> dict[str, Any]:
    """Parse a JSON control message from the client."""
    import json

    return json.loads(data)
