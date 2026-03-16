import { CalculateMetadataFunction, Composition } from "remotion";
import { ExpertLensDemo, type DemoProps } from "./ExpertLensDemo";
import { VOICEOVER_TIMINGS } from "./voiceover-timings";
import { SCENE_IDS } from "./voiceover-config";

const FPS = 30;

// Fallback durations (frames) for 7 scenes:
// problem(30s) demo(90s) coach-builder(30s) prefs-memory(30s) mobile(20s) architecture(30s) closing(10s)
const DEFAULT_SCENE_DURATIONS: number[] = [900, 2700, 900, 900, 600, 900, 300];

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
