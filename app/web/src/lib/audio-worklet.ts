// AudioWorklet processor source — inlined as a string and loaded via Blob URL.
// Converts Float32 samples to Int16 PCM and posts them to the main thread.

export const AUDIO_WORKLET_PROCESSOR = `
class PCMExtractorProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buffer = [];
    // Flush every ~100ms: 16000 Hz × 0.1s = 1600 samples per chunk
    this._flushSize = 1600;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const samples = input[0]; // Float32Array, mono
    for (let i = 0; i < samples.length; i++) {
      this._buffer.push(samples[i]);
    }

    while (this._buffer.length >= this._flushSize) {
      const chunk = this._buffer.splice(0, this._flushSize);
      // Convert Float32 → Int16
      const int16 = new Int16Array(chunk.length);
      for (let i = 0; i < chunk.length; i++) {
        const clamped = Math.max(-1, Math.min(1, chunk[i]));
        int16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
      }
      this.port.postMessage(int16.buffer, [int16.buffer]);
    }
    return true;
  }
}

registerProcessor("pcm-extractor", PCMExtractorProcessor);
`;

/**
 * Create a Blob URL for the AudioWorklet processor script.
 * Must be called in a browser context.
 */
export function createWorkletBlobUrl(): string {
  const blob = new Blob([AUDIO_WORKLET_PROCESSOR], { type: "application/javascript" });
  return URL.createObjectURL(blob);
}
