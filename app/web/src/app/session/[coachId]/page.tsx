"use client";

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

export default function LiveSessionPage() {
  const { coachId } = useParams<{ coachId: string }>();
  const router = useRouter();

  const [coach, setCoach] = useState<Coach | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [micActive, setMicActive] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [elapsed, setElapsed] = useState(0);

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
    // Barge-in: only clear playback when there's actual voice energy (avoids clearing on silence)
    const int16 = new Int16Array(pcm);
    let sum = 0;
    for (let i = 0; i < int16.length; i++) sum += Math.abs(int16[i]);
    if (sum / int16.length > 300) {
      playbackRef.current?.clearQueue();
    }
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
    const ws = new WsClient({
      coachId,
      savedHandle: wsRef.current?.currentHandle,
      onMessage: (msg) => {
        if (msg.type === "error") {
          console.error("Session error:", msg.message);
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
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopSession(), [stopSession]);

  const coachName = coach?.display_name ?? coachId;

  return (
    <div className="min-h-screen bg-[--background] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[--border]">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-[--muted] hover:text-[--foreground] text-sm transition-colors"
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
        {status === "disconnected" && (
          <div className="text-center space-y-4 max-w-md">
            <div className="text-5xl">{coach?.icon ?? "🎯"}</div>
            <h1 className="text-2xl font-semibold">{coachName}</h1>
            <p className="text-[--muted] text-sm leading-relaxed">
              {coach?.persona ?? "Your AI coaching session"}
            </p>
            <div className="text-xs text-[--muted] space-y-1">
              <p>
                1. Click <strong>Start Session</strong>
              </p>
              <p>2. Share your {coach?.software_name ?? "desktop app"} window</p>
              <p>3. Ask questions or just work — the coach watches and listens</p>
            </div>
            <button
              type="button"
              onClick={startSession}
              className="mt-4 px-6 py-3 bg-[--accent] hover:bg-[--accent-hover] text-white rounded-lg font-medium transition-colors"
            >
              Start Session
            </button>
          </div>
        )}

        {status !== "disconnected" && (
          <div className="w-full max-w-2xl space-y-4">
            {!screenSharing && status === "connected" && (
              <div className="p-4 bg-[--surface-elevated] border border-[--border] rounded-lg text-center text-sm text-[--muted]">
                Share your {coach?.software_name ?? "app"} window to enable visual coaching.
                <br />
                <span className="text-xs">
                  The coach can still hear you without screen sharing.
                </span>
              </div>
            )}

            {screenSharing && (
              <div className="p-3 bg-[--success]/10 border border-[--success]/20 rounded-lg text-sm text-[--success] text-center">
                📺 Screen shared — coach can see your {coach?.software_name ?? "app"}
              </div>
            )}

            {status === "reconnecting" && (
              <div className="p-3 bg-[--warning]/10 border border-[--warning]/20 rounded-lg text-sm text-[--warning] text-center">
                ⟳ Reconnecting… your session context is preserved
              </div>
            )}

            <div className="p-4 bg-[--surface] border border-[--border] rounded-lg text-xs text-[--muted] space-y-1">
              <p>
                💡 <strong>Tips:</strong>
              </p>
              <p>• Speak naturally — barge-in to interrupt the coach at any time</p>
              <p>• Ask "what should I do next?" if you&apos;re stuck</p>
              <p>• Say "explain that again" for more detail</p>
            </div>
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

      {/* Screen share trigger — separate button in connected state */}
      {status === "connected" && !screenSharing && (
        <div className="fixed bottom-6 right-6">
          <button
            type="button"
            onClick={() => setScreenSharing(true)}
            className="px-4 py-2.5 bg-[--surface-elevated] hover:bg-[--border] border border-[--border] rounded-lg text-sm font-medium transition-colors"
          >
            🖥 Share Screen
          </button>
        </div>
      )}
    </div>
  );
}
