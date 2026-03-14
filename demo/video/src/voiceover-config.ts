// Scene IDs in composition order — must match the Series.Sequence order in
// ExpertLensDemo.tsx and the filenames written by generate-voiceover.py.
export const SCENE_IDS = [
  "act1",
  "act2a",
  "act2b",
  "act3",
  "act4",
  "act5",
  "act6",
  "closing",
] as const;

export type SceneId = (typeof SCENE_IDS)[number];
