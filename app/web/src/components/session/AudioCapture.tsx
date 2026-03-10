"use client";
// AudioCapture: getUserMedia → AudioWorklet → PCM 16-bit 16kHz → onChunk callback

import { createWorkletBlobUrl } from "@/lib/audio-worklet";
import { useCallback, useEffect, useRef } from "react";

const TARGET_SAMPLE_RATE = 16000;

interface Props {
  active: boolean;
  onChunk: (pcm: ArrayBuffer) => void;
  onBargeIn?: () => void;
}

export function AudioCapture({ active, onChunk, onBargeIn }: Props) {
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const prevActiveRef = useRef(false);

  const start = useCallback(async () => {
    if (ctxRef.current) return; // already running

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
    streamRef.current = stream;

    // Always create AudioContext at target rate; AudioWorklet resamples internally
    const ctx = new AudioContext({ sampleRate: TARGET_SAMPLE_RATE });
    ctxRef.current = ctx;

    const blobUrl = createWorkletBlobUrl();
    blobUrlRef.current = blobUrl;
    await ctx.audioWorklet.addModule(blobUrl);

    const source = ctx.createMediaStreamSource(stream);
    const worklet = new AudioWorkletNode(ctx, "pcm-extractor");
    workletRef.current = worklet;

    worklet.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
      onChunk(e.data);
      if (onBargeIn) onBargeIn();
    };

    source.connect(worklet);
    worklet.connect(ctx.destination); // needed to keep worklet alive
  }, [onChunk, onBargeIn]);

  const stop = useCallback(() => {
    workletRef.current?.disconnect();
    workletRef.current = null;
    ctxRef.current?.close();
    ctxRef.current = null;
    for (const track of streamRef.current?.getTracks() ?? []) track.stop();
    streamRef.current = null;
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (active && !prevActiveRef.current) {
      start().catch(console.error);
    } else if (!active && prevActiveRef.current) {
      stop();
    }
    prevActiveRef.current = active;
  }, [active, start, stop]);

  useEffect(() => () => stop(), [stop]);

  return null;
}
