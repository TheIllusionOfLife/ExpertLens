"""Audio format helpers for PCM 16-bit 16kHz input and 24kHz output."""

import struct

# Input from browser: PCM 16-bit signed, 16kHz, mono
INPUT_SAMPLE_RATE = 16000
INPUT_CHANNELS = 1
INPUT_BITS = 16
INPUT_MIME = "audio/pcm;rate=16000"

# Output from Gemini: PCM 16-bit signed, 24kHz, mono
OUTPUT_SAMPLE_RATE = 24000
OUTPUT_CHANNELS = 1
OUTPUT_BITS = 16

# Max audio chunk size (100ms of 16kHz 16-bit mono = 3200 bytes)
MAX_CHUNK_BYTES = int(INPUT_SAMPLE_RATE * INPUT_CHANNELS * (INPUT_BITS // 8) * 0.1)


def is_valid_pcm_chunk(data: bytes) -> bool:
    """Check that data length is valid for PCM 16-bit (even number of bytes)."""
    return len(data) > 0 and len(data) % 2 == 0


def split_audio_chunks(data: bytes, chunk_size: int = MAX_CHUNK_BYTES) -> list[bytes]:
    """Split a large audio buffer into smaller chunks for streaming."""
    if chunk_size <= 0 or chunk_size % 2 != 0:
        raise ValueError(f"chunk_size must be a positive even number, got {chunk_size}")
    chunks = []
    offset = 0
    while offset < len(data):
        end = min(offset + chunk_size, len(data))
        # Ensure chunk boundary is on a sample boundary (2 bytes per sample)
        if (end - offset) % 2 != 0:
            end -= 1
        if end > offset:
            chunks.append(data[offset:end])
        offset = end
    return chunks


def pcm_bytes_to_samples(data: bytes) -> list[int]:
    """Convert raw PCM bytes to list of int16 samples."""
    if len(data) % 2 != 0:
        raise ValueError(f"PCM data length must be even, got {len(data)} bytes")
    num_samples = len(data) // 2
    return list(struct.unpack(f"<{num_samples}h", data))
