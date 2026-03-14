import { AbsoluteFill, Sequence } from "remotion";
import { Slide } from "./Slide";
import { NarrationCard } from "./NarrationCard";
import { ActLabel } from "./ActLabel";
import { VOICEOVER_TIMINGS } from "../voiceover-timings";

// act2b: 2 phrases → 2 messages; card appears at phrase 0 (frame 0)
const { phraseOffsets } = VOICEOVER_TIMINGS.act2b;
const CARD_FROM = phraseOffsets[0]; // 0
const MESSAGE_DELAYS = phraseOffsets.map((o) => o - CARD_FROM);

export const Act2bMemory: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={1200}>
        <Slide
          imageSrc="assets/03-session-idle.png"
          headline="Cross-Session Memory"
          body="After every session, ExpertLens summarizes what you worked on. The next session picks up where you left off."
          dimImage
        />
      </Sequence>

      <Sequence from={0} durationInFrames={1200} layout="none">
        <ActLabel text="Act 2b — Cross-Session Memory" />
      </Sequence>

      <Sequence from={CARD_FROM} durationInFrames={1200}>
        <NarrationCard
          title="Session 2 — Blender Expert (Next Day)"
          messageDelayFrames={MESSAGE_DELAYS}
          messages={[
            {
              speaker: "Coach",
              text: "Welcome back. Last session we covered subdivision surface modifiers and normal smoothing — your faceted mesh issue. Picking up from there, or something new?",
            },
            {
              speaker: "Narrator",
              text: "The coach remembers. Session transcripts are summarized by Gemini and stored in Firestore. Each new session loads the last 3 summaries into its system instruction.",
            },
          ]}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
