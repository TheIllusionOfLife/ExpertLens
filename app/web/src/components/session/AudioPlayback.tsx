"use client";
// AudioPlayback: receives PCM 24kHz chunks from server, plays via AudioContext.
// On barge-in (user speaking), clears the queue.

import { useCallback, useEffect, useRef } from "react";

const OUTPUT_SAMPLE_RATE = 24000;

export interface AudioPlaybackHandle {
  playChunk: (pcm: ArrayBuffer) => void;
  clearQueue: () => void;
}

interface Props {
  onHandle: (handle: AudioPlaybackHandle) => void;
}

export function AudioPlayback({ onHandle }: Props) {
  const ctxRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const activeNodesRef = useRef<AudioBufferSourceNode[]>([]);

  const clearQueue = useCallback(() => {
    for (const node of activeNodesRef.current) {
      try {
        node.stop();
      } catch {
        // already stopped
      }
    }
    activeNodesRef.current = [];
    if (ctxRef.current) {
      nextPlayTimeRef.current = ctxRef.current.currentTime;
    }
  }, []);

  const playChunk = useCallback((pcm: ArrayBuffer) => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext({ sampleRate: OUTPUT_SAMPLE_RATE });
    }
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    // PCM is 16-bit signed little-endian at 24kHz
    const int16 = new Int16Array(pcm);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / (int16[i] < 0 ? 0x8000 : 0x7fff);
    }

    const audioBuffer = ctx.createBuffer(1, float32.length, OUTPUT_SAMPLE_RATE);
    audioBuffer.copyToChannel(float32, 0);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    // Cap buffered audio at 3s to prevent latency drift and memory growth
    const MAX_BUFFER_SECONDS = 3;
    const now = ctx.currentTime;
    if (nextPlayTimeRef.current - now > MAX_BUFFER_SECONDS) {
      // Too much queued — drop this chunk to catch up
      return;
    }

    // Schedule with small jitter buffer (20ms) to smooth network variance
    const startAt = Math.max(now + 0.02, nextPlayTimeRef.current);
    source.start(startAt);
    nextPlayTimeRef.current = startAt + audioBuffer.duration;

    activeNodesRef.current.push(source);
    source.onended = () => {
      activeNodesRef.current = activeNodesRef.current.filter((n) => n !== source);
    };
  }, []);

  useEffect(() => {
    onHandle({ playChunk, clearQueue });
  }, [onHandle, playChunk, clearQueue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearQueue();
      ctxRef.current?.close();
      ctxRef.current = null;
    };
  }, [clearQueue]);

  return null; // Audio-only, no visual output
}
