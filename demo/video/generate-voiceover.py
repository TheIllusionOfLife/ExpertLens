#!/usr/bin/env python3
"""
Generate voiceover audio for the ExpertLens demo video.

Workflow per scene:
  1. say -o phrase.aiff      -> AIFF via macOS built-in TTS
  2. afconvert               -> WAV (PCM 16-bit) for Python wave module
  3. wave module             -> concatenate phrases with 5-frame silence gaps
  4. afconvert               -> M4A (AAC) for Remotion consumption
  5. afinfo                  -> verify duration

After generating all scenes, writes src/voiceover-timings.ts with the
exact per-phrase frame offsets so Remotion components can sync visuals
to audio without manual frame-counting.

Usage:
  python3 generate-voiceover.py [--voice NAME] [--force]

Output:
  demo/video/public/voiceover/{scene_id}.m4a  (6 files, demo scene has no VO)
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

# New 7-scene narrative matching voiceover-config.ts.
# "demo" scene has no VO (uses raw clip audio).
SCENES = [
    {
        "id": "problem",
        "phrases": [
            "Professional software is hard. "
            "Blender, Affinity, Unreal Engine, DaVinci Resolve. "
            "AI can access browser apps via MCP and Playwright. "
            "AI can call CLI tools directly. "
            "But desktop GUI apps and mobile apps? AI can't control it for you. "
            "You have to operate them yourself. "
            "ExpertLens is built for this gap. "
            "It watches your screen, listens to your voice, and coaches you in real time.",
        ],
    },
    {
        "id": "demo",
        "phrases": [],  # No VO: raw clip audio plays
    },
    {
        "id": "coach-builder",
        "phrases": [
            "ExpertLens ships with five preset coaches "
            "for Blender, Affinity Photo, Unreal Engine, Fusion, and ZBrush. "
            "Each one is pre-loaded with curated knowledge.",
            "But you're not limited to presets. "
            "Type any software name. Here, DaVinci Resolve.",
            "Gemini validates it's real software using Google Search grounding. "
            "Then it builds a six-section knowledge base: "
            "shortcuts, workflows, common errors, deep concepts, "
            "version-specific changes, and a quick reference card.",
            "Two to four minutes, and the coach is ready for live sessions.",
        ],
    },
    {
        "id": "prefs-memory",
        "phrases": [
            "Software changes constantly. ExpertLens uses Google Search grounding "
            "to build knowledge from the latest documentation, shortcuts, and UI changes. "
            "Stale knowledge means wrong guidance, so every coach rebuild pulls fresh data.",
            "Every user is different. ExpertLens lets you customize four dimensions: "
            "interaction style, coaching tone, response depth, and proactivity.",
            "And the coach remembers. After each session, the transcript is summarized "
            "and stored in Firestore.",
            "Next time you connect, the coach loads your last three sessions "
            "and picks up where you left off.",
        ],
    },
    {
        "id": "mobile",
        "phrases": [
            "This works on every device. "
            "Desktop and Android get full screen sharing via getDisplayMedia.",
            "On iOS, where screen sharing isn't available in the browser, "
            "the rear camera activates instead. "
            "Point it at your screen, and the same coaching pipeline works. "
            "Same agent, same knowledge, same voice.",
        ],
    },
    {
        "id": "architecture",
        "phrases": [
            "Cloud Run hosts both services. "
            "The browser streams screen frames and audio over WebSocket "
            "to the backend, which proxies directly to Gemini Live API.",
            "SlidingWindow compression lets sessions run indefinitely. "
            "Session resumption handles WebSocket timeouts without losing context. "
            "Knowledge is context-stuffed into the system instruction at zero latency. "
            "Everything is provisioned with Terraform and auto-deployed via Cloud Build.",
        ],
    },
    {
        "id": "closing",
        "phrases": [
            "ExpertLens. Expert coaching for the software only you can operate.",
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
            elif (params.nchannels, params.sampwidth, params.framerate) != (
                all_params.nchannels,
                all_params.sampwidth,
                all_params.framerate,
            ):
                raise ValueError(
                    f"{wav_path.name}: WAV params mismatch"
                )
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
    result = subprocess.run(["afinfo", str(m4a_path)], capture_output=True, text=True, check=True)
    for line in result.stdout.splitlines():
        match = re.search(r"[Ee]stimated [Dd]uration:\s*([\d.]+)", line)
        if match:
            return float(match.group(1))
    raise ValueError(f"afinfo: could not parse duration from:\n{result.stdout}")


def process_scene(scene: dict, tmp_dir: Path, voice: str) -> tuple[float, list[int]]:
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
        "// Auto-generated by generate-voiceover.py. Do not edit manually.",
        "// Re-run `python3 generate-voiceover.py --force` to update.",
        "",
        'import type { SceneId } from "./voiceover-config";',
        "",
        "export type SceneTiming = {",
        "  durationFrames: number;",
        "  /** Frame offset within the scene at which each phrase starts. */",
        "  phraseOffsets: number[];",
        "};",
        "",
        "export const VOICEOVER_TIMINGS: Record<SceneId, SceneTiming> = "
        + json.dumps(timings, indent=2)
        + ";",
        "",
    ]
    TIMINGS_TS.write_text("\n".join(lines))


def load_existing_timings() -> dict[str, dict]:
    if not TIMINGS_TS.exists():
        return {}
    try:
        text = TIMINGS_TS.read_text()
        match = re.search(r"=\s*(\{.*?\});", text, re.DOTALL)
        if match:
            return json.loads(match.group(1))
    except Exception:
        pass
    return {}


def validate_scene_ids() -> None:
    """Assert Python SCENES matches the canonical SCENE_IDS in voiceover-config.ts."""
    python_ids = tuple(scene["id"] for scene in SCENES)
    canonical_ids = ("problem", "demo", "coach-builder", "prefs-memory", "mobile", "architecture", "closing")
    if python_ids != canonical_ids:
        raise SystemExit(
            f"Scene ID mismatch!\n  Python SCENES:        {python_ids}\n"
            f"  voiceover-config.ts:  {canonical_ids}\n"
            "Update SCENES or voiceover-config.ts to match."
        )


def main() -> None:
    validate_scene_ids()

    parser = argparse.ArgumentParser(description="Generate ExpertLens demo voiceover")
    parser.add_argument("--voice", default="Samantha", help="macOS TTS voice (default: Samantha)")
    parser.add_argument("--force", action="store_true", help="Re-generate files that already exist")
    args = parser.parse_args()

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    timings: dict[str, dict] = load_existing_timings()
    total_seconds = 0.0

    with TemporaryDirectory(prefix="expertlens-vo-") as tmp:
        tmp_dir = Path(tmp)
        for scene in SCENES:
            scene_id = scene["id"]
            phrases = scene["phrases"]
            m4a_path = OUTPUT_DIR / f"{scene_id}.m4a"

            # Skip scenes with no VO (e.g. demo uses raw clip audio)
            if not phrases:
                timings[scene_id] = {"durationFrames": 2700, "phraseOffsets": []}
                print(f"  {scene_id}: no VO (raw clip audio)")
                continue

            if m4a_path.exists() and not args.force:
                duration = get_duration(m4a_path)
                phrase_offsets = timings.get(scene_id, {}).get("phraseOffsets", [0])
                print(f"  {scene_id}: {duration:.2f}s (cached, use --force to regenerate)")
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


if __name__ == "__main__":
    main()
