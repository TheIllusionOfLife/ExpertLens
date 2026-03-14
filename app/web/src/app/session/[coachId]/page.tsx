"use client";

import { CoachIcon } from "@/components/CoachIcon";
import { AudioCapture } from "@/components/session/AudioCapture";
import { AudioPlayback, type AudioPlaybackHandle } from "@/components/session/AudioPlayback";
import { ScreenCapture } from "@/components/session/ScreenCapture";
import { SessionControls } from "@/components/session/SessionControls";
import { SessionStatus } from "@/components/session/SessionStatus";
import { getCoach } from "@/lib/api-client";
import { type ConnectionStatus, WsClient } from "@/lib/ws-client";
import type { Coach } from "@/types/coach";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M5 3l14 9-14 9V3z" />
  </svg>
);

const MonitorIcon = ({ size = 14, className }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);

const DEFAULT_TIPS = [
  "Speak naturally — barge-in to interrupt the coach at any time",
  'Ask "what should I do next?" if you\'re stuck',
  'Say "explain that again" for more detail',
];

function Tips({ items = DEFAULT_TIPS }: { items?: string[] }) {
  return (
    <div className="w-full p-5 bg-(--surface) border border-(--border) rounded-xl text-xs text-(--muted) space-y-2">
      <p className="font-medium text-(--foreground)/60 uppercase tracking-wide text-[10px]">Tips</p>
      {items.map((tip) => (
        <p key={tip}>{tip}</p>
      ))}
    </div>
  );
}

const STEPS = (softwareName: string) => [
  "Click Start Session below",
  `Share your ${softwareName} window when prompted`,
  "Ask questions or work naturally — the coach watches and listens",
];

export default function LiveSessionPage() {
  const { coachId } = useParams<{ coachId: string }>();
  const router = useRouter();

  const [coach, setCoach] = useState<Coach | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [micActive, setMicActive] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [transcriptLines, setTranscriptLines] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const currentTextRef = useRef("");

  const wsRef = useRef<WsClient | null>(null);
  const playbackRef = useRef<AudioPlaybackHandle | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load coach info
  useEffect(() => {
    getCoach(coachId).then(setCoach).catch(console.error);
  }, [coachId]);

  // Session timer
  useEffect(() => {
    if (status === "connected") {
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (status === "disconnected") setElapsed(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const handleAudioChunk = useCallback((pcm: ArrayBuffer) => {
    wsRef.current?.sendAudio(pcm);
    // Barge-in is handled server-side by Gemini's native VAD —
    // no client-side clearQueue here (mic sends chunks constantly,
    // including silence, which would kill playback every ~100ms).
  }, []);

  const handleAudioResponse = useCallback((pcm: ArrayBuffer) => {
    playbackRef.current?.playChunk(pcm);
  }, []);

  const handleScreenFrame = useCallback((jpeg: Blob) => {
    wsRef.current?.sendImage(jpeg);
  }, []);

  const handleScreenStopped = useCallback(() => setScreenSharing(false), []);

  const handlePlaybackHandle = useCallback((handle: AudioPlaybackHandle) => {
    playbackRef.current = handle;
  }, []);

  const startSession = useCallback(() => {
    if (wsRef.current) return;
    const ws = new WsClient({
      coachId,
      savedHandle: undefined,
      onMessage: (msg) => {
        if (msg.type === "interrupted") {
          // Barge-in: user spoke while model was speaking — stop stale audio and drop partial transcript
          playbackRef.current?.clearQueue();
          currentTextRef.current = "";
          setCurrentText("");
        } else if (msg.type === "text_response") {
          if (msg.finished) {
            const completed = currentTextRef.current + msg.text;
            currentTextRef.current = "";
            setCurrentText("");
            setTranscriptLines((prev) => [...prev.slice(-4), completed]);
          } else {
            currentTextRef.current += msg.text;
            setCurrentText(currentTextRef.current);
          }
        } else if (msg.type === "error") {
          console.error("Session error:", msg.message);
          setStatus("error");
          setErrorMessage(msg.message);
        }
      },
      onAudio: handleAudioResponse,
      onStatusChange: (s) => {
        setStatus(s);
        if (s === "disconnected") {
          setScreenSharing(false);
          setMicActive(false);
        }
      },
    });
    wsRef.current = ws;
    ws.connect();
    setMicActive(true);
  }, [coachId, handleAudioResponse]);

  const stopSession = useCallback(() => {
    wsRef.current?.disconnect();
    wsRef.current = null;
    setStatus("disconnected");
    setScreenSharing(false);
    setMicActive(false);
    playbackRef.current?.clearQueue();
    currentTextRef.current = "";
    setCurrentText("");
    setTranscriptLines([]);
    setErrorMessage(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopSession(), [stopSession]);

  const coachName = coach?.display_name ?? coachId;
  const softwareName = coach?.software_name ?? "desktop app";

  return (
    <div className="min-h-screen bg-(--background) flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-16 py-5 border-b border-(--border) bg-(--surface)">
        <button
          type="button"
          onClick={() => router.push("/")}
          aria-label="Back to dashboard"
          className="text-(--muted) hover:text-(--foreground) text-sm transition-colors"
        >
          ← Dashboard
        </button>
        <SessionStatus coachName={coachName} status={status} elapsed={elapsed} />
        <SessionControls
          status={status}
          micActive={micActive}
          screenSharing={screenSharing}
          onStart={startSession}
          onStop={stopSession}
          onToggleMic={() => setMicActive((v) => !v)}
        />
      </header>

      {/* Main area */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
        {/* Pre-session launch pad */}
        {status === "disconnected" && (
          <div className="text-center max-w-sm w-full space-y-8">
            {/* Coach avatar with glow */}
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 rounded-2xl bg-(--accent-glow) blur-xl" />
              <div className="relative w-24 h-24 rounded-2xl bg-(--surface-elevated) border border-(--border) flex items-center justify-center">
                <CoachIcon coachId={coachId} size={52} />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold mb-3">{coachName}</h1>
              <p className="text-(--muted) text-sm leading-relaxed max-w-xs mx-auto">
                {coach?.persona ?? "Your AI coaching session"}
              </p>
            </div>

            {/* Steps */}
            <div className="text-left space-y-4 bg-(--surface-elevated) rounded-xl p-6 border border-(--border)">
              {STEPS(softwareName).map((step, i) => (
                <div key={step} className="flex items-start gap-4 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-(--accent-glow) border border-(--accent)/20 text-(--accent) text-xs flex items-center justify-center font-semibold mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-(--foreground)/80 leading-relaxed">{step}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={startSession}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-(--accent) hover:bg-(--accent-hover) text-white rounded-xl font-semibold transition-all shadow-[0_0_32px_rgba(124,106,247,0.25)] hover:shadow-[0_0_40px_rgba(124,106,247,0.35)]"
            >
              <PlayIcon />
              Start Session
            </button>
          </div>
        )}

        {/* Connected, no screen: full-viewport Share Screen CTA */}
        {status === "connected" && !screenSharing && (
          <div className="flex flex-col items-center gap-7 text-center max-w-sm w-full">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-(--accent-glow) blur-2xl scale-150" />
              <div className="relative w-20 h-20 rounded-2xl bg-(--surface-elevated) border border-(--accent)/30 flex items-center justify-center">
                <MonitorIcon size={32} className="text-(--accent)" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Share your screen</h2>
              <p className="text-(--muted) text-sm leading-relaxed max-w-xs mx-auto">
                Let your coach see <strong className="text-(--foreground)">{softwareName}</strong>{" "}
                for real-time visual guidance
              </p>
            </div>
            <button
              type="button"
              onClick={() => setScreenSharing(true)}
              className="flex items-center gap-2.5 px-8 py-3.5 bg-(--accent) hover:bg-(--accent-hover) text-white rounded-xl font-semibold text-base transition-all shadow-[0_0_40px_rgba(124,106,247,0.3)] hover:shadow-[0_0_50px_rgba(124,106,247,0.4)] cursor-pointer"
            >
              <MonitorIcon />
              Share Screen
            </button>
            <p className="text-xs text-(--muted)">
              Audio coaching is active — your coach can hear you
            </p>
            <Tips />
          </div>
        )}

        {/* Connected + screen sharing: status + transcript + tips */}
        {status === "connected" && screenSharing && (
          <div className="w-full max-w-md space-y-3">
            <div className="p-3.5 bg-(--success)/8 border border-(--success)/20 rounded-xl text-sm text-(--success) text-center font-medium">
              Screen shared — coach can see your {softwareName}
            </div>
            {transcriptLines.length > 0 || currentText ? (
              <div className="w-full p-4 bg-(--surface) border border-(--border) rounded-xl space-y-1 max-h-72 overflow-y-auto">
                <p className="font-medium text-(--foreground)/60 uppercase tracking-wide text-[10px] mb-2">
                  Coach
                </p>
                {transcriptLines.map((line) => (
                  <p key={line} className="text-xs text-(--muted) leading-relaxed">
                    {line}
                  </p>
                ))}
                {currentText && (
                  <p className="text-xs text-(--foreground)/80 leading-relaxed">
                    {currentText}
                    <span className="animate-pulse">▌</span>
                  </p>
                )}
              </div>
            ) : (
              <Tips />
            )}
          </div>
        )}

        {/* Reconnecting: warning + tips */}
        {status === "reconnecting" && (
          <div className="w-full max-w-md space-y-3">
            <div className="p-3.5 bg-(--warning)/8 border border-(--warning)/20 rounded-xl text-sm text-(--warning) text-center">
              Reconnecting… your session context is preserved
            </div>
            <Tips items={DEFAULT_TIPS.slice(0, 2)} />
          </div>
        )}

        {/* Error: connection failed */}
        {status === "error" && (
          <div className="w-full max-w-md space-y-3">
            <div className="p-3.5 bg-(--error)/8 border border-(--error)/20 rounded-xl text-sm text-(--error) text-center">
              Connection error — could not reach the coaching server
              {errorMessage && (
                <p className="mt-1.5 text-xs text-(--error)/70 font-normal">{errorMessage}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                stopSession();
                startSession();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-(--accent) hover:bg-(--accent-hover) text-white rounded-xl font-semibold transition-colors cursor-pointer"
            >
              <PlayIcon />
              Retry Session
            </button>
          </div>
        )}
      </main>

      {/* Invisible functional components */}
      <AudioPlayback onHandle={handlePlaybackHandle} />
      <AudioCapture active={micActive && status === "connected"} onChunk={handleAudioChunk} />
      <ScreenCapture
        active={screenSharing}
        onFrame={handleScreenFrame}
        onStopped={handleScreenStopped}
      />
    </div>
  );
}
