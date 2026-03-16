import { CalculateMetadataFunction, Composition } from "remotion";
import { ExpertLensDemo, type DemoProps } from "./ExpertLensDemo";
import { VOICEOVER_TIMINGS } from "./voiceover-timings";
import { SCENE_IDS } from "./voiceover-config";

const FPS = 30;

// Fallback durations (frames) for 7 scenes:
// problem(24s) demo(88s) coach-builder(32s) prefs-memory(34s) mobile(18s) architecture(25s) closing(4s)
const DEFAULT_SCENE_DURATIONS: number[] = [721, 2628, 974, 1026, 535, 753, 123];

const calculateMetadata: CalculateMetadataFunction<DemoProps> = async () => {
  const sceneDurations = SCENE_IDS.map((id, i) => VOICEOVER_TIMINGS[id]?.durationFrames ?? DEFAULT_SCENE_DURATIONS[i]);
  const total = sceneDurations.reduce((sum, d) => sum + d, 0);
  return {
    durationInFrames: total,
    props: { sceneDurations },
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ExpertLensDemo"
      component={ExpertLensDemo}
      durationInFrames={DEFAULT_SCENE_DURATIONS.reduce((sum, d) => sum + d, 0)}
      fps={FPS}
      width={1920}
      height={1080}
      calculateMetadata={calculateMetadata}
      defaultProps={{ sceneDurations: DEFAULT_SCENE_DURATIONS }}
    />
  );
};
