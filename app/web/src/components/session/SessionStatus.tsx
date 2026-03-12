"use client";

import type { ConnectionStatus } from "@/lib/ws-client";

interface Props {
  coachName: string;
  status: ConnectionStatus;
  elapsed: number; // seconds
}

const STATUS_CONFIG: Record<
  ConnectionStatus,
  { label: string; color: string; dot: string; ring?: string }
> = {
  disconnected: { label: "Disconnected", color: "text-(--muted)", dot: "bg-(--muted)/40" },
  connecting: {
    label: "Connecting…",
    color: "text-(--warning)",
    dot: "bg-(--warning) animate-pulse",
  },
  connected: {
    label: "Live",
    color: "text-(--success)",
    dot: "bg-(--success) animate-pulse",
    ring: "border-(--success)/20",
  },
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
  const isLive = status === "connected";

  return (
    <output
      className={`flex items-center gap-2.5 px-4 py-2 bg-(--surface-elevated) rounded-lg border transition-colors ${
        cfg.ring ?? "border-(--border)"
      }`}
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
      <span className="font-medium text-sm">{coachName}</span>
      <span className="w-px h-3 bg-(--border)" />
      <span className={`text-xs ${cfg.color}`}>{cfg.label}</span>
      {isLive && elapsed > 0 && (
        <span className="text-xs text-(--muted) font-mono tabular-nums" aria-hidden="true">
          {formatElapsed(elapsed)}
        </span>
      )}
    </output>
  );
}
