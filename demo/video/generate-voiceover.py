#!/usr/bin/env python3
"""
Generate voiceover audio for the ExpertLens demo video.

Workflow per scene:
  1. say -o phrase.aiff      → AIFF via macOS built-in TTS
  2. afconvert               → WAV (PCM 16-bit) for Python wave module
  3. wave module             → concatenate phrases with 5-frame silence gaps
  4. afconvert               → M4A (AAC) for Remotion consumption
  5. afinfo                  → verify duration

After generating all scenes, writes src/voiceover-timings.ts with the
exact per-phrase frame offsets so Remotion components can sync visuals
to audio without manual frame-counting.

Usage:
  python3 generate-voiceover.py [--voice NAME] [--force]

Output:
  demo/video/public/voiceover/{scene_id}.m4a  (8 files)
  demo/video/src/voiceover-timings.ts
"""

import argparse
import json
import re
import subprocess
import wave
from pathlib import Path
from tempfile import TemporaryDirectory

SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR / "public" / "voiceover"
TIMINGS_TS = SCRIPT_DIR / "src" / "voiceover-timings.ts"

FPS = 30
SILENCE_FRAMES = 5

SCENES = [
    {
        "id": "act1",
        "phrases": [
            "You could use Playwright to automate a browser app. "
            "You could give an LLM a terminal and it will use your CLI tools directly. "
            "But open Blender, Affinity Photo, or Unreal Engine — "
            "and there is no API. No automation. The mouse is the only way in. "
            "ExpertLens coaches you inside that gap.",
        ],
    },
    {
        "id": "act2a",
        "phrases": [
            "My mesh still looks faceted even after I added a Subdivision Surface modifier. "
            "What am I doing wrong?",
            "That's a normals issue. Select the object, right-click, choose Shade Smooth. "
            "With Blender 4.x, you can also add a Smooth by Angle modifier — "
            "it replaced Auto Smooth which was removed in version 4.1.",
            "Perfect. What level should I use for the subdivision?",
            "Level 2 is the sweet spot for most work — Control 2 applies it instantly. "
            "Level 3 for final render if topology is clean.",
        ],
    },
    {
        "id": "act2b",
        "phrases": [
            "Welcome back. Last session we covered subdivision surface modifiers "
            "and normal smoothing — your faceted mesh issue. "
            "Picking up from there, or something new?",
            "That's not a script. After every session, ExpertLens summarizes what you "
            "worked on and stores it in Firestore. The next session loads that summary "
            "into the agent's system instruction. The coach actually remembers.",
        ],
    },
    {
        "id": "act3",
        "phrases": [
            "Google AI Studio has a built-in Live mode. "
            "You can share your screen and talk to Gemini. "
            "ExpertLens adds four things.",
            "One: software-specific knowledge that is current — like the fact that "
            "Auto Smooth was removed from Blender 4.1 and replaced with the "
            "Smooth by Angle modifier.",
            "Two: user preferences that change how the coach talks to you — "
            "shortcut-first versus mouse-guided, concise expert versus calm mentor.",
            "Three: memory of what you worked on last time.",
            "Four: a coaching persona built specifically for your software.",
        ],
    },
    {
        "id": "act4",
        "phrases": [
            "Preferences customize how the coach talks to you.",
            "How do I mirror an object?",
            "Control M, choose axis.",
            "Same knowledge. Half the words.",
        ],
    },
    {
        "id": "act5",
        "phrases": [
            "ExpertLens isn't limited to these three apps. "
            "You can create a coach for any desktop software.",
            "The software name is validated — ExpertLens uses Gemini with Google Search "
            "grounding to confirm it's a real desktop application before building the coach.",
            "Knowledge builds automatically. When complete, the coach is ready for live sessions.",
        ],
    },
    {
        "id": "act6",
        "phrases": [
            "ExpertLens runs on Google Cloud Run. The browser streams screen frames and audio "
            "over WebSocket to a FastAPI backend, which relays to Gemini Live API in real time.",
            "SlidingWindow compression keeps sessions running indefinitely. "
            "Session resumption with stored handles survives the 10-minute WebSocket rotation.",
        ],
    },
    {
        "id": "closing",
        "phrases": [
            "ExpertLens. Expert coaching for the apps AI cannot automate.",
        ],
    },
]


def say_to_aiff(text: str, aiff_path: Path, voice: str) -> None:
    subprocess.run(["say", "-v", voice, "-o", str(aiff_path), text], check=True)


def aiff_to_wav(aiff_path: Path, wav_path: Path) -> None:
    subprocess.run(
        ["afconvert", str(aiff_path), "-d", "LEI16", "-f", "WAVE", str(wav_path)],
        check=True,
    )


def wav_duration_frames(wav_path: Path) -> int:
    """Return duration of a WAV file in frames (at FPS)."""
    with wave.open(str(wav_path), "rb") as wf:
        return round(wf.getnframes() / wf.getframerate() * FPS)


def compute_phrase_offsets(wav_paths: list[Path]) -> list[int]:
    """Cumulative frame offset at which each phrase starts (includes silence gaps)."""
    offsets: list[int] = [0]
    for wav_path in wav_paths[:-1]:
        offsets.append(offsets[-1] + wav_duration_frames(wav_path) + SILENCE_FRAMES)
    return offsets


def concat_wavs(wav_paths: list[Path], output_path: Path) -> None:
    """Concatenate WAVs, inserting SILENCE_FRAMES of silence between phrases."""
    all_params = None
    chunks: list[bytes] = []

    for i, wav_path in enumerate(wav_paths):
        with wave.open(str(wav_path), "rb") as wf:
            params = wf.getparams()
            if all_params is None:
                all_params = params
            if i > 0:
                silence_samples = int(SILENCE_FRAMES / FPS * params.framerate)
                chunks.append(b"\x00" * silence_samples * params.nchannels * params.sampwidth)
            chunks.append(wf.readframes(wf.getnframes()))

    assert all_params is not None
    with wave.open(str(output_path), "wb") as wf:
        wf.setparams(all_params)
        for chunk in chunks:
            wf.writeframes(chunk)


def wav_to_m4a(wav_path: Path, m4a_path: Path) -> None:
    subprocess.run(
        ["afconvert", str(wav_path), "-d", "aac", "-f", "m4af", str(m4a_path)],
        check=True,
    )


def get_duration(m4a_path: Path) -> float:
    result = subprocess.run(
        ["afinfo", str(m4a_path)], capture_output=True, text=True, check=True
    )
    for line in result.stdout.splitlines():
        match = re.search(r"[Ee]stimated [Dd]uration:\s*([\d.]+)", line)
        if match:
            return float(match.group(1))
    raise ValueError(f"afinfo: could not parse duration from:\n{result.stdout}")


def process_scene(
    scene: dict, tmp_dir: Path, voice: str
) -> tuple[float, list[int]]:
    """Generate M4A for a scene. Returns (duration_seconds, phrase_offsets_in_frames)."""
    scene_id: str = scene["id"]
    phrases: list[str] = scene["phrases"]
    m4a_path = OUTPUT_DIR / f"{scene_id}.m4a"

    if len(phrases) == 1:
        aiff_path = tmp_dir / f"{scene_id}.aiff"
        wav_path = tmp_dir / f"{scene_id}.wav"
        say_to_aiff(phrases[0], aiff_path, voice)
        aiff_to_wav(aiff_path, wav_path)
        wav_to_m4a(wav_path, m4a_path)
        phrase_offsets = [0]
    else:
        wav_paths: list[Path] = []
        for i, phrase in enumerate(phrases):
            aiff_path = tmp_dir / f"{scene_id}_{i}.aiff"
            wav_path = tmp_dir / f"{scene_id}_{i}.wav"
            say_to_aiff(phrase, aiff_path, voice)
            aiff_to_wav(aiff_path, wav_path)
            wav_paths.append(wav_path)

        phrase_offsets = compute_phrase_offsets(wav_paths)

        combined_wav = tmp_dir / f"{scene_id}_combined.wav"
        concat_wavs(wav_paths, combined_wav)
        wav_to_m4a(combined_wav, m4a_path)

    return get_duration(m4a_path), phrase_offsets


def write_timings_ts(timings: dict[str, dict]) -> None:
    """Write src/voiceover-timings.ts so Remotion components can import exact offsets."""
    lines = [
        "// Auto-generated by generate-voiceover.py — do not edit manually.",
        "// Re-run `python3 generate-voiceover.py --force` to update.",
        "",
        "export type SceneTiming = {",
        "  durationFrames: number;",
        "  /** Frame offset within the scene at which each phrase starts. */",
        "  phraseOffsets: number[];",
        "};",
        "",
        "export const VOICEOVER_TIMINGS: Record<string, SceneTiming> = " + json.dumps(timings, indent=2) + ";",
        "",
    ]
    TIMINGS_TS.write_text("\n".join(lines))


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate ExpertLens demo voiceover")
    parser.add_argument(
        "--voice", default="Samantha", help="macOS TTS voice (default: Samantha)"
    )
    parser.add_argument(
        "--force", action="store_true", help="Re-generate files that already exist"
    )
    args = parser.parse_args()

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    timings: dict[str, dict] = {}
    total_seconds = 0.0

    with TemporaryDirectory(prefix="expertlens-vo-") as tmp:
        tmp_dir = Path(tmp)
        for scene in SCENES:
            scene_id = scene["id"]
            m4a_path = OUTPUT_DIR / f"{scene_id}.m4a"
            if m4a_path.exists() and not args.force:
                # Cached: re-measure duration but phrase offsets need --force to recompute.
                # Use phraseOffsets=[0] as a safe fallback.
                duration = get_duration(m4a_path)
                phrase_offsets = timings.get(scene_id, {}).get("phraseOffsets", [0])
                print(f"  {scene_id}: {duration:.2f}s (cached — use --force to recompute phrase offsets)")
            else:
                print(f"  {scene_id}: generating...", end=" ", flush=True)
                duration, phrase_offsets = process_scene(scene, tmp_dir, args.voice)
                print(f"{duration:.2f}s  ({int(duration * FPS)} frames)  offsets={phrase_offsets}")
            timings[scene_id] = {
                "durationFrames": int(duration * FPS),
                "phraseOffsets": phrase_offsets,
            }
            total_seconds += duration

    write_timings_ts(timings)
    print(f"\nTotal: {total_seconds:.1f}s  ({int(total_seconds * FPS)} frames)")
    print(f"Timings written to {TIMINGS_TS.relative_to(SCRIPT_DIR)}")
    print("\nNext steps:")
    print("  cd demo/video && bun install")
    print("  bun x remotion preview src/index.ts   # preview with audio")
    print("  bun x remotion render src/index.ts ExpertLensDemo out/expertlens-demo.mp4 --codec=h264")


if __name__ == "__main__":
    main()
