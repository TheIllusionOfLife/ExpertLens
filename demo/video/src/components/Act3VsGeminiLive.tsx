import { AbsoluteFill, Sequence } from "remotion";
import { Slide } from "./Slide";
import { NarrationCard } from "./NarrationCard";
import { ActLabel } from "./ActLabel";

export const Act3VsGeminiLive: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={1200}>
        <Slide
          imageSrc="assets/01-dashboard.png"
          headline="vs. Gemini AI Studio Live"
          body="AI Studio has a built-in Live mode. ExpertLens adds four things on top."
          dimImage
        />
      </Sequence>

      <Sequence from={0} durationInFrames={1200} layout="none">
        <ActLabel text="Act 3 — ExpertLens vs Gemini AI Studio Live" />
      </Sequence>

      <Sequence from={300} durationInFrames={900}>
        <NarrationCard
          title="What ExpertLens Adds"
          messages={[
            {
              speaker: "Narrator",
              text: "1. Current knowledge — Auto Smooth removed in Blender 4.1, replaced by Smooth by Angle modifier.",
            },
            {
              speaker: "Narrator",
              text: "2. User preferences — shortcut-first or mouse-guided, concise expert or calm mentor.",
            },
            {
              speaker: "Narrator",
              text: "3. Cross-session memory — the coach knows what you worked on last time.",
            },
            {
              speaker: "Narrator",
              text: "4. Software-specific persona — the Blender coach and the Affinity Photo coach feel genuinely different.",
            },
          ]}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
