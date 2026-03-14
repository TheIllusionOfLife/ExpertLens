import { CalculateMetadataFunction, Composition } from "remotion";
import { ExpertLensDemo, type DemoProps } from "./ExpertLensDemo";
import { VOICEOVER_TIMINGS } from "./voiceover-timings";
import { SCENE_IDS } from "./voiceover-config";

const FPS = 30;

// Fallback durations (frames) used before voiceover files are generated.
// Matches the original frame budget in ExpertLensDemo.tsx.
const DEFAULT_SCENE_DURATIONS: number[] = [900, 1200, 1200, 1200, 900, 900, 600, 300];

const calculateMetadata: CalculateMetadataFunction<DemoProps> = async () => {
  const sceneDurations = SCENE_IDS.map((id) => VOICEOVER_TIMINGS[id].durationFrames);
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
