import { AbsoluteFill, Sequence } from "remotion";
import { Slide } from "./Slide";
import { NarrationCard } from "./NarrationCard";
import { ActLabel } from "./ActLabel";

export const Act4Preferences: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={900} premountFor={30}>
        <Slide
          imageSrc="assets/04-settings.png"
          headline="User Preferences"
          body="Interaction style, tone, response depth, proactivity — injected into every session's system instruction."
        />
      </Sequence>

      <Sequence from={0} durationInFrames={900} layout="none" premountFor={30}>
        <ActLabel text="Act 4 — Preferences" />
      </Sequence>

      <Sequence from={300} durationInFrames={600} premountFor={30}>
        <NarrationCard
          title="Same Question, Different Style"
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
