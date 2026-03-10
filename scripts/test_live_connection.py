"""CLI test: connect to Gemini Live API, send a test JPEG, print audio response bytes."""
import asyncio
import io
import os
import sys

# Ensure project root is on path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv  # type: ignore[import-untyped]

load_dotenv()

from google import genai  # noqa: E402
from google.genai import types  # noqa: E402

MODEL = os.getenv("GEMINI_LIVE_MODEL", "gemini-2.5-flash-live-preview")
API_KEY = os.getenv("GEMINI_API_KEY", "")

if not API_KEY:
    print("ERROR: GEMINI_API_KEY not set. Copy .env.example to .env and add your key.")
    sys.exit(1)


def make_test_jpeg() -> bytes:
    """Create a minimal valid JPEG (solid gray 64x64)."""
    try:
        from PIL import Image  # type: ignore[import-untyped]
        img = Image.new("RGB", (64, 64), color=(128, 128, 128))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        return buf.getvalue()
    except ImportError:
        # Minimal 1x1 white JPEG without Pillow
        return (
            b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
            b"\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c"
            b"\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c"
            b"\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342\x1edL\t\x02\x01\x03\x11\x00"
            b"?\x00\xf8\xa8\x00\x00\x00\x00\x00\x00\xff\xd9"
        )


async def test_connection() -> None:
    client = genai.Client(api_key=API_KEY)
    jpeg = make_test_jpeg()

    print(f"Testing connection to Gemini Live API (model={MODEL})...")
    print(f"Test JPEG size: {len(jpeg)} bytes")

    config = types.LiveConnectConfig(
        system_instruction="You are a test assistant. Briefly describe what you see.",
        response_modalities=[types.Modality.AUDIO],
        context_window_compression=types.ContextWindowCompressionConfig(
            sliding_window=types.SlidingWindow(),
        ),
    )

    audio_chunks_received = 0
    total_audio_bytes = 0

    async with client.aio.live.connect(model=MODEL, config=config) as session:
        print("Connected! Sending test JPEG frame...")

        await session.send(
            input=types.LiveClientRealtimeInput(
                media_chunks=[types.Blob(data=jpeg, mime_type="image/jpeg")]
            )
        )

        print("Waiting for response (timeout 15s)...")
        async for response in session.receive():
            if hasattr(response, "data") and response.data:
                audio_chunks_received += 1
                total_audio_bytes += len(response.data)
                print(f"  Audio chunk #{audio_chunks_received}: {len(response.data)} bytes")

            if hasattr(response, "server_content") and response.server_content:
                sc = response.server_content
                if hasattr(sc, "turn_complete") and sc.turn_complete:
                    print("Turn complete.")
                    break

            if audio_chunks_received >= 5:
                print("(Got 5 chunks, stopping early for test)")
                break

    print(f"\nResult: {audio_chunks_received} audio chunks, {total_audio_bytes} total bytes")
    if audio_chunks_received > 0:
        print("SUCCESS: Gemini Live API connection works!")
    else:
        print("WARNING: No audio response received.")


if __name__ == "__main__":
    asyncio.run(test_connection())
