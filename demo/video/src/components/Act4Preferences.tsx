import { AbsoluteFill, Sequence } from "remotion";
import { Slide } from "./Slide";
import { NarrationCard } from "./NarrationCard";
import { ActLabel } from "./ActLabel";
import { VOICEOVER_TIMINGS } from "../voiceover-timings";

// act4: 4 phrases → 4 messages; card appears at phrase 0 (frame 0)
// (act is only 255 frames — previous from=300 caused the card to never render)
const { phraseOffsets } = VOICEOVER_TIMINGS.act4;
const CARD_FROM = phraseOffsets[0]; // 0
const MESSAGE_DELAYS = phraseOffsets.map((o) => o - CARD_FROM);

export const Act4Preferences: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={900}>
        <Slide
          imageSrc="assets/04-settings.png"
          headline="User Preferences"
          body="Interaction style, tone, response depth, proactivity — injected into every session's system instruction."
        />
      </Sequence>

      <Sequence from={0} durationInFrames={900} layout="none">
        <ActLabel text="Act 4 — Preferences" />
      </Sequence>

      <Sequence from={CARD_FROM} durationInFrames={900}>
        <NarrationCard
          title="Same Question, Different Style"
          messageDelayFrames={MESSAGE_DELAYS}
          messages={[
            {
              speaker: "User",
              text: "How do I mirror an object?",
            },
            {
              speaker: "Coach",
              text: "[Calm Mentor] Select the object, go to the Object menu at the top, choose Mirror, then pick your axis — X, Y, or Z.",
            },
            {
              speaker: "Coach",
              text: "[Concise Expert] Ctrl+M, choose axis.",
            },
            {
              speaker: "Narrator",
              text: "Same knowledge. Half the words.",
            },
          ]}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
