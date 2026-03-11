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
      let cancelled = false;

      startScreenCapture(onFrame)
        .then((h) => {
          if (cancelled) {
            // Component deactivated before capture resolved — stop immediately
            h.stop();
            return;
          }
          handleRef.current = h;
          // 'ended' listener is already registered inside startScreenCapture (lib layer)
        })
        .catch((err) => {
          if (!cancelled) {
            console.error("Screen capture failed:", err);
            onStopped?.();
          }
        });

      prevActiveRef.current = true;
      return () => {
        cancelled = true;
        prevActiveRef.current = false;
      };
    }

    if (!active && prevActiveRef.current) {
      stop();
      prevActiveRef.current = false;
    }
  }, [active, onFrame, stop, onStopped]);

  useEffect(() => () => stop(), [stop]);

  return null;
}
