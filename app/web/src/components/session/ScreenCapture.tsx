"use client";
// ScreenCapture: getDisplayMedia or camera → JPEG frames → onFrame callback

import {
  type ScreenCaptureHandle,
  startCameraCapture,
  startScreenCapture,
} from "@/lib/screen-capture";
import { useCallback, useEffect, useRef } from "react";

interface Props {
  active: boolean;
  onFrame: (jpeg: Blob) => void;
  onStopped?: () => void;
  mode?: "display" | "camera";
}

export function ScreenCapture({ active, onFrame, onStopped, mode = "display" }: Props) {
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
      const capturePromise =
        mode === "camera" ? startCameraCapture(onFrame) : startScreenCapture(onFrame);

      capturePromise
        .then((h) => {
          if (cancelled) {
            h.stop();
            return;
          }
          handleRef.current = h;
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
        handleRef.current?.stop();
        handleRef.current = null;
      };
    }

    if (!active && prevActiveRef.current) {
      stop();
      prevActiveRef.current = false;
    }
  }, [active, onFrame, stop, onStopped, mode]);

  useEffect(() => () => stop(), [stop]);

  return null;
}
