// AudioWorklet processor source — inlined as a string and loaded via Blob URL.
// Converts Float32 samples to Int16 PCM and posts them to the main thread.

export const AUDIO_WORKLET_PROCESSOR = `
class PCMExtractorProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    // Use runtime sampleRate (AudioWorklet global) for correct flush size.
    // processorOptions.sampleRate is passed as a fallback for environments
    // where the global may differ from the AudioContext's actual rate.
    const rate = options?.processorOptions?.sampleRate ?? sampleRate ?? 16000;
    if (rate !== 16000) {
      console.warn(\`[PCMExtractor] AudioContext rate \${rate}Hz != expected 16000Hz\`);
    }
    // Flush every ~100ms
    this._flushSize = Math.round(rate * 0.1);
    // Pre-allocated ring buffer (1s capacity) to avoid O(n) splice on every flush
    this._ringBuf = new Float32Array(rate);
    this._writeIdx = 0;
    this._readIdx = 0;
  }

  _available() {
    return (this._writeIdx - this._readIdx + this._ringBuf.length) % this._ringBuf.length;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const samples = input[0]; // Float32Array, mono
    const buf = this._ringBuf;
    const len = buf.length;
    for (let i = 0; i < samples.length; i++) {
      buf[this._writeIdx] = samples[i];
      this._writeIdx = (this._writeIdx + 1) % len;
    }

    while (this._available() >= this._flushSize) {
      const int16 = new Int16Array(this._flushSize);
      for (let i = 0; i < this._flushSize; i++) {
        const s = buf[this._readIdx];
        this._readIdx = (this._readIdx + 1) % len;
        const clamped = Math.max(-1, Math.min(1, s));
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
