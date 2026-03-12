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

const PlayIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M5 3l14 9-14 9V3z" />
  </svg>
);

const StopIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="4" y="4" width="16" height="16" rx="2" />
  </svg>
);

const MicIcon = ({ muted }: { muted?: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10v2a7 7 0 0014 0v-2M12 19v3M9 22h6" />
    {muted && <line x1="3" y1="3" x2="21" y2="21" />}
  </svg>
);

const MonitorIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);

const MonitorOffIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
    <line x1="3" y1="3" x2="21" y2="21" />
  </svg>
);

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
    <div className="flex items-center gap-2">
      {!isActive && !isConnecting ? (
        <button
          type="button"
          onClick={onStart}
          className="flex items-center gap-2 px-5 py-2.5 bg-(--accent) hover:bg-(--accent-hover) text-white rounded-lg font-medium text-sm transition-colors"
        >
          <PlayIcon />
          Start Session
        </button>
      ) : (
        <>
          {/* Mic toggle */}
          <button
            type="button"
            onClick={onToggleMic}
            title={micActive ? "Mute microphone" : "Unmute microphone"}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
              micActive
                ? "bg-(--accent-glow) border-(--accent)/30 text-(--accent)"
                : "bg-(--surface-elevated) border-(--border) text-(--muted) hover:border-(--accent)/30"
            }`}
          >
            <MicIcon muted={!micActive} />
            {micActive ? "Mic On" : "Mic Off"}
          </button>

          {/* Screen share status */}
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${
              screenSharing
                ? "bg-(--success)/8 border-(--success)/25 text-(--success)"
                : "bg-(--surface-elevated) border-(--border) text-(--muted)"
            }`}
          >
            {screenSharing ? <MonitorIcon /> : <MonitorOffIcon />}
            {screenSharing ? "Sharing" : "No Screen"}
          </div>

          {/* Stop session */}
          <button
            type="button"
            onClick={onStop}
            className="flex items-center gap-2 px-4 py-2 bg-(--error) hover:opacity-90 text-white rounded-lg font-semibold text-sm transition-all"
          >
            <StopIcon />
            Stop
          </button>
        </>
      )}

      {isConnecting && (
        <div className="flex items-center gap-2 px-4 py-2 text-(--warning) text-sm">
          <span className="animate-spin inline-block">⟳</span>
          Connecting…
        </div>
      )}
    </div>
  );
}
