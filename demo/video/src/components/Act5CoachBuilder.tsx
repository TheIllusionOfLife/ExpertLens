import { AbsoluteFill, Sequence } from "remotion";
import { Slide } from "./Slide";
import { NarrationCard } from "./NarrationCard";
import { ActLabel } from "./ActLabel";
import { VOICEOVER_TIMINGS } from "../voiceover-timings";

// act5: phrase 0 = intro (slide-only); phrases 1-2 → 2 NarrationCard messages
const { phraseOffsets } = VOICEOVER_TIMINGS.act5;
const CARD_FROM = phraseOffsets[1]; // 169 — card appears when specific details start
const MESSAGE_DELAYS = phraseOffsets.slice(1).map((o) => o - CARD_FROM);

export const Act5CoachBuilder: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={900}>
        <Slide
          imageSrc="assets/02-create-coach.png"
          headline="Coach Builder"
          body="Create a coach for any desktop software. The software name is validated via Gemini + Google Search before building."
        />
      </Sequence>

      <Sequence from={0} durationInFrames={900} layout="none">
        <ActLabel text="Act 5 — Coach Builder" />
      </Sequence>

      <Sequence from={CARD_FROM} durationInFrames={900}>
        <NarrationCard
          title="Custom Coach — DaVinci Resolve"
          messageDelayFrames={MESSAGE_DELAYS}
          messages={[
            {
              speaker: "Narrator",
              text: "Type 'DaVinci Resolve'. Gemini validates it is a real desktop application via Google Search grounding.",
            },
            {
              speaker: "Narrator",
              text: "Knowledge builds automatically. When complete, the coach is ready for live sessions.",
            },
          ]}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
