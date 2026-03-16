import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Video } from "@remotion/media";
import { ActLabel } from "./ActLabel";

/**
 * Act 2a — Live Blender Session.
 * Uses raw footage from clip1-blender-session.mov.
 * startFrom trims into the clip to skip the setup and land on the coaching exchange.
 * Adjust startFrom (in frames at 30fps) after reviewing the raw footage.
 */
export const Act2aSession1: React.FC = () => {
  return (
    <AbsoluteFill>
      <Video
        src={staticFile("footage/clip1-blender-session.mov")}
        startFrom={0}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        volume={1}
      />

      <Sequence from={0} durationInFrames={90} layout="none">
        <ActLabel text="Live Blender Session" />
      </Sequence>
    </AbsoluteFill>
  );
};
