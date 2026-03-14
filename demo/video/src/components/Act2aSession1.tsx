import { AbsoluteFill, Sequence } from "remotion";
import { Slide } from "./Slide";
import { NarrationCard } from "./NarrationCard";
import { ActLabel } from "./ActLabel";

export const Act2aSession1: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={1200}>
        <Slide
          imageSrc="assets/03-session-idle.png"
          headline="Live Coaching Session"
          body="Screen + voice, real-time. Coach watches your work and responds as a colleague would."
          dimImage
        />
      </Sequence>

      <Sequence from={0} durationInFrames={1200} layout="none">
        <ActLabel text="Act 2a — Session 1" />
      </Sequence>

      <Sequence from={300} durationInFrames={900}>
        <NarrationCard
          title="Live Session — Blender Expert"
          messages={[
            {
              speaker: "User",
              text: "My mesh looks faceted even after I added a Subdivision Surface. What am I doing wrong?",
            },
            {
              speaker: "Coach",
              text: "That's a normals issue. Right-click the object, choose Shade Smooth. In Blender 4.x, also try the Smooth by Angle modifier — Auto Smooth was removed in 4.1.",
            },
            {
              speaker: "User",
              text: "What subdivision level should I use?",
            },
            {
              speaker: "Coach",
              text: "Ctrl+2 for level 2 — sweet spot for most work. Ctrl+3 for final render if topology is clean.",
            },
          ]}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
