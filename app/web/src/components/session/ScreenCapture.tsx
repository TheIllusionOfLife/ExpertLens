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
  // Use a ref so stop() is stable and doesn't re-create when onStopped identity changes
  const onStoppedRef = useRef(onStopped);
  useEffect(() => {
    onStoppedRef.current = onStopped;
  }, [onStopped]);

  const stop = useCallback(() => {
    handleRef.current?.stop();
    handleRef.current = null;
    onStoppedRef.current?.();
  }, []);

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
            prevActiveRef.current = false;
            onStoppedRef.current?.();
          }
        });

      prevActiveRef.current = true;
      return () => {
        cancelled = true;
      };
    }

    if (!active && prevActiveRef.current) {
      stop();
      prevActiveRef.current = false;
    }
  }, [active, onFrame, stop]);

  useEffect(() => () => stop(), [stop]);

  return null;
}
