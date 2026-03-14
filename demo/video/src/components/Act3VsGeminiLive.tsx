import { AbsoluteFill, Sequence } from "remotion";
import { Slide } from "./Slide";
import { NarrationCard } from "./NarrationCard";
import { ActLabel } from "./ActLabel";
import { VOICEOVER_TIMINGS } from "../voiceover-timings";

// act3: phrase 0 = intro (slide-only); phrases 1-4 → 4 NarrationCard messages
const { phraseOffsets } = VOICEOVER_TIMINGS.act3;
const CARD_FROM = phraseOffsets[1]; // 209 — card appears when enumeration starts
const MESSAGE_DELAYS = phraseOffsets.slice(1).map((o) => o - CARD_FROM);

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

      <Sequence from={CARD_FROM} durationInFrames={1200}>
        <NarrationCard
          title="What ExpertLens Adds"
          messageDelayFrames={MESSAGE_DELAYS}
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
