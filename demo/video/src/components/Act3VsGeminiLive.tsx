import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Video } from "@remotion/media";
import { ActLabel } from "./ActLabel";

/**
 * Act 3 — Mobile Demo (repurposed from "vs Gemini Live").
 * Uses clip3-mobile.MP4 — iPhone pointing camera at Affinity Photo.
 * Adjust startFrom to skip any setup fumbling.
 */
export const Act3VsGeminiLive: React.FC = () => {
  return (
    <AbsoluteFill>
      <Video
        src={staticFile("footage/clip3-mobile.MP4")}
        startFrom={0}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        volume={1}
      />

      <Sequence from={0} durationInFrames={90} layout="none">
        <ActLabel text="Mobile — Camera Coaching" />
      </Sequence>
    </AbsoluteFill>
  );
};
