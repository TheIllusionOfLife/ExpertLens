import { Composition } from "remotion";
import { ExpertLensDemo } from "./ExpertLensDemo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ExpertLensDemo"
      component={ExpertLensDemo}
      durationInFrames={7200}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
