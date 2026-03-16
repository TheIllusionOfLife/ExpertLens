import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Video } from "@remotion/media";
import { ActLabel } from "./ActLabel";

/**
 * Act 2b — Cross-Session Memory.
 * Uses the later portion of clip1-blender-session.mov where a new session
 * is started and the coach references the previous session.
 * startFrom is set to roughly the 2:30 mark of the clip.
 * Adjust after reviewing footage.
 */
export const Act2bMemory: React.FC = () => {
  // clip1 is ~188s = ~5640 frames at 30fps.
  // The memory portion starts roughly at the 2:30 mark (~4500 frames).
  return (
    <AbsoluteFill>
      <Video
        src={staticFile("footage/clip1-blender-session.mov")}
        startFrom={4500}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        volume={1}
      />

      <Sequence from={0} durationInFrames={90} layout="none">
        <ActLabel text="Cross-Session Memory" />
      </Sequence>
    </AbsoluteFill>
  );
};
