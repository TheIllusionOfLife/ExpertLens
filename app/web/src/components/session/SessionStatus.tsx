"use client";

import type { ConnectionStatus } from "@/lib/ws-client";

interface Props {
  coachName: string;
  status: ConnectionStatus;
  elapsed: number; // seconds
}

const STATUS_CONFIG: Record<ConnectionStatus, { label: string; color: string; dot: string }> = {
  disconnected: { label: "Disconnected", color: "text-(--muted)", dot: "bg-(--muted)" },
  connecting: {
    label: "Connecting…",
    color: "text-(--warning)",
    dot: "bg-(--warning) animate-pulse",
  },
  connected: { label: "Live", color: "text-(--success)", dot: "bg-(--success) animate-pulse" },
  reconnecting: {
    label: "Reconnecting…",
    color: "text-(--warning)",
    dot: "bg-(--warning) animate-pulse",
  },
  error: { label: "Error", color: "text-(--error)", dot: "bg-(--error)" },
};

function formatElapsed(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function SessionStatus({ coachName, status, elapsed }: Props) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-(--surface-elevated) rounded-lg border border-(--border)">
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      <span className="font-medium text-sm">{coachName}</span>
      <span className={`text-xs ${cfg.color}`}>{cfg.label}</span>
      {status === "connected" && elapsed > 0 && (
        <span className="text-xs text-(--muted) ml-auto font-mono">{formatElapsed(elapsed)}</span>
      )}
    </div>
  );
}
