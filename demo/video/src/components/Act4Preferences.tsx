import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Video } from "@remotion/media";
import { ActLabel } from "./ActLabel";

/**
 * Act 4 — Preferences Demo.
 * Uses clip2-preferences.mov — changing tone/depth then asking a question.
 * Adjust startFrom to skip navigation and land on the settings change.
 */
export const Act4Preferences: React.FC = () => {
  return (
    <AbsoluteFill>
      <Video
        src={staticFile("footage/clip2-preferences.mov")}
        startFrom={0}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        volume={1}
      />

      <Sequence from={0} durationInFrames={90} layout="none">
        <ActLabel text="User Preferences" />
      </Sequence>
    </AbsoluteFill>
  );
};
