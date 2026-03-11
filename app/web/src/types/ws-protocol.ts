// Mirrors backend app/api/ws/protocol.py

export type MessageType =
  | "start_session"
  | "end_session"
  | "session_started"
  | "session_handle"
  | "interrupted"
  | "reconnecting"
  | "reconnected"
  | "error";

// Binary media frame tag bytes
export const MEDIA_TAG_IMAGE = 0x01;
export const MEDIA_TAG_AUDIO = 0x02;

export interface StartSessionMessage {
  type: "start_session";
  coach_id: string;
  session_handle?: string;
}

export interface EndSessionMessage {
  type: "end_session";
}

export interface SessionStartedMessage {
  type: "session_started";
  session_id: string;
}

export interface SessionHandleMessage {
  type: "session_handle";
  handle: string;
}

export interface InterruptedMessage {
  type: "interrupted";
}

export interface ReconnectingMessage {
  type: "reconnecting";
}

export interface ReconnectedMessage {
  type: "reconnected";
}

export interface ErrorMessage {
  type: "error";
  message: string;
}

export type ServerMessage =
  | SessionStartedMessage
  | SessionHandleMessage
  | InterruptedMessage
  | ReconnectingMessage
  | ReconnectedMessage
  | ErrorMessage;
