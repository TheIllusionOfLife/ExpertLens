import { CalculateMetadataFunction, Composition, staticFile } from "remotion";
import { ExpertLensDemo, type DemoProps } from "./ExpertLensDemo";
import { getAudioDuration } from "./get-audio-duration";
import { SCENE_IDS } from "./voiceover-config";

const FPS = 30;

// Fallback durations (frames) used before voiceover files are generated.
// Matches the original frame budget in ExpertLensDemo.tsx.
const DEFAULT_SCENE_DURATIONS: number[] = [900, 1200, 1200, 1200, 900, 900, 600, 300];

const calculateMetadata: CalculateMetadataFunction<DemoProps> = async () => {
  const durationSeconds = await Promise.all(
    SCENE_IDS.map((id) => getAudioDuration(staticFile(`voiceover/${id}.m4a`))),
  );

  const sceneDurations = durationSeconds.map((secs) => Math.ceil(secs * FPS));
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
