import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Video } from "@remotion/media";
import { ActLabel } from "./ActLabel";

export const SceneDemo: React.FC = () => (
  <AbsoluteFill>
    <Video
      src={staticFile("footage/ExpertLens demo.mp4")}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
      volume={1}
    />
    <Sequence from={0} durationInFrames={90} layout="none">
      <ActLabel text="Live Coaching Session" />
    </Sequence>
  </AbsoluteFill>
);
