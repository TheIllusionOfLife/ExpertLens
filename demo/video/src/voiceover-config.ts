// Scene IDs in composition order — must match the Series.Sequence order in
// ExpertLensDemo.tsx and the filenames written by generate-voiceover.py.
//
// New 7-scene narrative:
//   problem → demo → coach-builder → prefs-memory → mobile → architecture → closing
export const SCENE_IDS = [
  "problem",
  "demo",
  "coach-builder",
  "prefs-memory",
  "mobile",
  "architecture",
  "closing",
] as const;

export type SceneId = (typeof SCENE_IDS)[number];
