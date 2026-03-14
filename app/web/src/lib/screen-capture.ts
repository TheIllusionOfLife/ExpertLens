// Screen capture: getDisplayMedia → canvas 768×768 → JPEG frames at ~1fps

const FRAME_WIDTH = 768;
const FRAME_HEIGHT = 768;
const FRAME_INTERVAL_MS = 1000;
const JPEG_QUALITY = 0.7;

export interface ScreenCaptureHandle {
  stop: () => void;
  stream: MediaStream;
}

/**
 * Start capturing screen frames.
 * Calls onFrame with each JPEG Blob at ~1fps.
 * Returns a handle to stop capture and the underlying MediaStream.
 */
export async function startScreenCapture(
  onFrame: (jpeg: Blob) => void
): Promise<ScreenCaptureHandle> {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      frameRate: { ideal: 5, max: 10 },
      // @ts-ignore — Chrome-specific hint to offer full screen rather than current tab
      preferCurrentTab: false,
    },
    audio: false,
  });

  const video = document.createElement("video");
  video.srcObject = stream;
  video.muted = true;
  await video.play();

  const canvas = document.createElement("canvas");
  canvas.width = FRAME_WIDTH;
  canvas.height = FRAME_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas 2D context");

  let stopped = false;

  const captureLoop = () => {
    if (stopped) return;
    if (video.readyState >= 2 /* HAVE_CURRENT_DATA */) {
      // Letterbox/crop to fill 768×768 while preserving aspect ratio
      const vw = video.videoWidth || FRAME_WIDTH;
      const vh = video.videoHeight || FRAME_HEIGHT;
      const scale = Math.max(FRAME_WIDTH / vw, FRAME_HEIGHT / vh);
      const sw = vw * scale;
      const sh = vh * scale;
      const ox = (FRAME_WIDTH - sw) / 2;
      const oy = (FRAME_HEIGHT - sh) / 2;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);
      ctx.drawImage(video, ox, oy, sw, sh);

      canvas.toBlob(
        (blob) => {
          if (blob && !stopped) onFrame(blob);
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    }
    setTimeout(captureLoop, FRAME_INTERVAL_MS);
  };

  captureLoop();

  const stop = () => {
    stopped = true;
    for (const track of stream.getTracks()) track.stop();
    video.srcObject = null;
  };

  // Auto-stop when user ends screen share via browser UI
  stream.getVideoTracks()[0]?.addEventListener("ended", stop);

  return { stop, stream };
}

/**
 * Start capturing from the device camera (environment-facing).
 * Same JPEG frame pipeline as startScreenCapture.
 * Returns a ScreenCaptureHandle to stop capture.
 */
export async function startCameraCapture(
  onFrame: (jpeg: Blob) => void
): Promise<ScreenCaptureHandle> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
    audio: false,
  });

  const video = document.createElement("video");
  video.srcObject = stream;
  video.muted = true;
  await video.play();

  const canvas = document.createElement("canvas");
  canvas.width = FRAME_WIDTH;
  canvas.height = FRAME_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas 2D context");

  let stopped = false;

  const captureLoop = () => {
    if (stopped) return;
    if (video.readyState >= 2) {
      const vw = video.videoWidth || FRAME_WIDTH;
      const vh = video.videoHeight || FRAME_HEIGHT;
      const scale = Math.max(FRAME_WIDTH / vw, FRAME_HEIGHT / vh);
      const sw = vw * scale;
      const sh = vh * scale;
      const ox = (FRAME_WIDTH - sw) / 2;
      const oy = (FRAME_HEIGHT - sh) / 2;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);
      ctx.drawImage(video, ox, oy, sw, sh);
      canvas.toBlob(
        (blob) => {
          if (blob && !stopped) onFrame(blob);
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    }
    setTimeout(captureLoop, FRAME_INTERVAL_MS);
  };

  captureLoop();

  const stop = () => {
    stopped = true;
    for (const track of stream.getTracks()) track.stop();
    video.srcObject = null;
  };

  stream.getVideoTracks()[0]?.addEventListener("ended", stop);

  return { stop, stream };
}

/**
 * Returns true if getDisplayMedia (screen sharing) is available in this browser.
 * Used to detect mobile vs desktop and choose capture path.
 */
export function supportsDisplayMedia(): boolean {
  return (
    typeof navigator !== "undefined" &&
    "mediaDevices" in navigator &&
    "getDisplayMedia" in navigator.mediaDevices
  );
}
