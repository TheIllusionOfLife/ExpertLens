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

  const start = useCallback(
    async (cancelled: { value: boolean }) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
      if (cancelled.value) {
        for (const t of stream.getTracks()) t.stop();
        return;
      }
      streamRef.current = stream;

      // Pass actual sample rate to worklet via processorOptions so it flushes correctly
      const ctx = new AudioContext({ sampleRate: TARGET_SAMPLE_RATE });
      ctxRef.current = ctx;

      const blobUrl = createWorkletBlobUrl();
      blobUrlRef.current = blobUrl;
      await ctx.audioWorklet.addModule(blobUrl);

      if (cancelled.value) {
        stop();
        return;
      }

      // Resume is required — browsers with autoplay gating start the context suspended
      await ctx.resume();

      const source = ctx.createMediaStreamSource(stream);
      const worklet = new AudioWorkletNode(ctx, "pcm-extractor", {
        processorOptions: { sampleRate: ctx.sampleRate },
      });
      workletRef.current = worklet;

      worklet.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
        onChunk(e.data);
        onBargeIn?.();
      };

      source.connect(worklet);
      worklet.connect(ctx.destination); // keeps worklet alive
    },
    [onChunk, onBargeIn, stop]
  );

  useEffect(() => {
    if (active && !prevActiveRef.current) {
      const cancelled = { value: false };
      start(cancelled).catch(console.error);
      prevActiveRef.current = true;
      return () => {
        cancelled.value = true;
        stop();
        prevActiveRef.current = false;
      };
    }

    if (!active && prevActiveRef.current) {
      stop();
      prevActiveRef.current = false;
    }
  }, [active, start, stop]);

  useEffect(() => () => stop(), [stop]);

  return null;
}
