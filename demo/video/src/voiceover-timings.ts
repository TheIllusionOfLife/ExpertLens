// Scene durations for the new 7-scene narrative.
// VOs from the old pipeline are mapped where they fit.
// Scenes with raw footage (demo) have no VO — duration is set to match the clip.

import type { SceneId } from "./voiceover-config";

export type SceneTiming = {
  durationFrames: number;
  /** Frame offset within the scene at which each phrase starts. */
  phraseOffsets: number[];
};

export const VOICEOVER_TIMINGS: Record<SceneId, SceneTiming> = {
  // ~0:00-0:30 — reuse act1.m4a (503 frames = ~16.8s), pad to 900 frames (30s)
  "problem": {
    durationFrames: 900,
    phraseOffsets: [0],
  },
  // ~0:30-2:00 — raw clip1 footage, no VO. 90 seconds = 2700 frames
  "demo": {
    durationFrames: 2700,
    phraseOffsets: [],
  },
  // ~2:00-2:30 — reuse act5.m4a (573 frames = ~19s), pad to 900 frames (30s)
  "coach-builder": {
    durationFrames: 900,
    phraseOffsets: [0, 169, 434],
  },
  // ~2:30-3:00 — reuse act4.m4a (255 frames = ~8.5s), pad to 900 frames (30s)
  "prefs-memory": {
    durationFrames: 900,
    phraseOffsets: [0, 86, 138, 198],
  },
  // ~3:00-3:20 — no existing VO. 20 seconds = 600 frames
  "mobile": {
    durationFrames: 600,
    phraseOffsets: [],
  },
  // ~3:20-3:50 — reuse act6.m4a (551 frames = ~18.4s), pad to 900 frames (30s)
  "architecture": {
    durationFrames: 900,
    phraseOffsets: [0, 311],
  },
  // ~3:50-4:00 — reuse closing.m4a (114 frames = ~3.8s), pad to 300 frames (10s)
  "closing": {
    durationFrames: 300,
    phraseOffsets: [0],
  },
};
