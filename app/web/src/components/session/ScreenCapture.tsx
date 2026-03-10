"use client";
// ScreenCapture: getDisplayMedia → JPEG frames → onFrame callback

import { type ScreenCaptureHandle, startScreenCapture } from "@/lib/screen-capture";
import { useCallback, useEffect, useRef } from "react";

interface Props {
  active: boolean;
  onFrame: (jpeg: Blob) => void;
  onStopped?: () => void;
}

export function ScreenCapture({ active, onFrame, onStopped }: Props) {
  const handleRef = useRef<ScreenCaptureHandle | null>(null);
  const prevActiveRef = useRef(false);

  const stop = useCallback(() => {
    handleRef.current?.stop();
    handleRef.current = null;
    onStopped?.();
  }, [onStopped]);

  useEffect(() => {
    if (active && !prevActiveRef.current) {
      startScreenCapture(onFrame)
        .then((h) => {
          handleRef.current = h;
          // If user stops sharing via browser UI, notify parent
          h.stream.getVideoTracks()[0]?.addEventListener("ended", stop);
        })
        .catch((err) => {
          console.error("Screen capture failed:", err);
          onStopped?.();
        });
    } else if (!active && prevActiveRef.current) {
      stop();
    }
    prevActiveRef.current = active;
  }, [active, onFrame, stop, onStopped]);

  useEffect(() => () => stop(), [stop]);

  return null;
}
