"use client";
// WebSocket connection manager: connect, send binary/text, receive, reconnect

import type { ServerMessage } from "@/types/ws-protocol";
import { MEDIA_TAG_AUDIO, MEDIA_TAG_IMAGE } from "@/types/ws-protocol";

const WS_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000")
  .replace(/\/+$/, "") // strip trailing slashes before protocol swap
  .replace(/^http/, "ws");

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

export interface WsClientOptions {
  coachId: string;
  savedHandle?: string;
  onMessage: (msg: ServerMessage) => void;
  onAudio: (pcm: ArrayBuffer) => void;
  onStatusChange: (status: ConnectionStatus) => void;
}

const MAX_RECONNECT_ATTEMPTS = 10;

export class WsClient {
  private ws: WebSocket | null = null;
  private options: WsClientOptions;
  private stopped = false;
  private _currentHandle: string | undefined;
  private _reconnectAttempts = 0;

  constructor(options: WsClientOptions) {
    this.options = options;
    this._currentHandle = options.savedHandle;
  }

  get currentHandle(): string | undefined {
    return this._currentHandle;
  }

  connect(): void {
    if (this.ws) this.disconnect();
    this.stopped = false;
    this.options.onStatusChange("connecting");

    const url = `${WS_URL}/ws/session/${encodeURIComponent(this.options.coachId)}`;
    this.ws = new WebSocket(url);
    this.ws.binaryType = "arraybuffer";

    this.ws.onopen = () => {
      // Send start_session control message
      this.sendText({
        type: "start_session",
        coach_id: this.options.coachId,
        session_handle: this._currentHandle,
      });
    };

    this.ws.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        this._handleBinary(event.data);
      } else if (typeof event.data === "string") {
        this._handleText(event.data);
      }
    };

    this.ws.onclose = (event) => {
      if (this.stopped) return;
      if (event.code === 1000) {
        this._reconnectAttempts = 0;
        this.options.onStatusChange("disconnected");
      } else {
        // Unexpected close — auto-reconnect with exponential backoff
        if (this._reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          this.options.onStatusChange("error");
          return;
        }
        this.options.onStatusChange("reconnecting");
        const delay = Math.min(30000, 1000 * 2 ** this._reconnectAttempts);
        this._reconnectAttempts++;
        setTimeout(() => {
          if (!this.stopped) this.connect();
        }, delay);
      }
    };

    this.ws.onerror = () => {
      this.options.onStatusChange("error");
    };
  }

  private _handleText(raw: string): void {
    try {
      const msg = JSON.parse(raw) as ServerMessage;
      if (msg.type === "session_handle") {
        this._currentHandle = msg.handle;
      }
      this.options.onMessage(msg);
      if (msg.type === "session_started" || msg.type === "reconnected") {
        this._reconnectAttempts = 0;
        this.options.onStatusChange("connected");
      } else if (msg.type === "reconnecting") {
        this.options.onStatusChange("reconnecting");
      }
    } catch {
      console.warn("Invalid server message:", raw);
    }
  }

  private _handleBinary(buf: ArrayBuffer): void {
    if (buf.byteLength < 2) return;
    const view = new Uint8Array(buf);
    const tag = view[0];
    const payload = buf.slice(1);
    if (tag === MEDIA_TAG_AUDIO) {
      this.options.onAudio(payload);
    }
  }

  sendImage(jpeg: Blob): void {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    jpeg.arrayBuffer().then((buf) => {
      // Re-check after async: socket may have closed during arrayBuffer() conversion
      if (ws.readyState !== WebSocket.OPEN) return;
      const frame = new Uint8Array(1 + buf.byteLength);
      frame[0] = MEDIA_TAG_IMAGE;
      frame.set(new Uint8Array(buf), 1);
      ws.send(frame.buffer);
    });
  }

  sendAudio(pcm: ArrayBuffer): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const frame = new Uint8Array(1 + pcm.byteLength);
    frame[0] = MEDIA_TAG_AUDIO;
    frame.set(new Uint8Array(pcm), 1);
    this.ws.send(frame.buffer);
  }

  sendText(msg: object): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(msg));
  }

  disconnect(): void {
    this.stopped = true;
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.sendText({ type: "end_session" });
      }
      this.ws.close(1000);
      this.ws = null;
    }
  }
}
