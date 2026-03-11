"use client";

import type { ConnectionStatus } from "@/lib/ws-client";

interface Props {
  status: ConnectionStatus;
  micActive: boolean;
  screenSharing: boolean;
  onStart: () => void;
  onStop: () => void;
  onToggleMic: () => void;
}

export function SessionControls({
  status,
  micActive,
  screenSharing,
  onStart,
  onStop,
  onToggleMic,
}: Props) {
  const isActive = status === "connected" || status === "reconnecting";
  const isConnecting = status === "connecting";

  return (
    <div className="flex items-center gap-3">
      {!isActive && !isConnecting ? (
        <button
          type="button"
          onClick={onStart}
          className="flex items-center gap-2 px-5 py-2.5 bg-(--accent) hover:bg-(--accent-hover) text-white rounded-lg font-medium text-sm transition-colors"
        >
          <span>▶</span> Start Session
        </button>
      ) : (
        <>
          {/* Mic toggle */}
          <button
            type="button"
            onClick={onToggleMic}
            title={micActive ? "Mute microphone" : "Unmute microphone"}
            className={`p-2.5 rounded-lg border text-sm font-medium transition-colors ${
              micActive
                ? "bg-(--accent)/20 border-(--accent) text-(--accent)"
                : "bg-(--surface-elevated) border-(--border) text-(--muted) hover:border-(--accent)"
            }`}
          >
            {micActive ? "🎙 Mic On" : "🔇 Mic Off"}
          </button>

          {/* Screen share status */}
          <div
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium ${
              screenSharing
                ? "bg-(--success)/10 border-(--success)/30 text-(--success)"
                : "bg-(--surface-elevated) border-(--border) text-(--muted)"
            }`}
          >
            <span>{screenSharing ? "🖥 Sharing" : "📵 No Screen"}</span>
          </div>

          {/* Stop session */}
          <button
            type="button"
            onClick={onStop}
            className="flex items-center gap-2 px-4 py-2.5 bg-(--error)/10 hover:bg-(--error)/20 border border-(--error)/30 text-(--error) rounded-lg font-medium text-sm transition-colors"
          >
            ■ Stop
          </button>
        </>
      )}

      {isConnecting && (
        <div className="flex items-center gap-2 px-4 py-2.5 text-(--warning) text-sm">
          <span className="animate-spin">⟳</span> Connecting…
        </div>
      )}
    </div>
  );
}
