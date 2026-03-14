import { AbsoluteFill, Sequence } from "remotion";
import { Slide } from "./Slide";
import { NarrationCard } from "./NarrationCard";
import { ActLabel } from "./ActLabel";

export const Act5CoachBuilder: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={900} premountFor={30}>
        <Slide
          imageSrc="assets/02-create-coach.png"
          headline="Coach Builder"
          body="Create a coach for any desktop software. The software name is validated via Gemini + Google Search before building."
        />
      </Sequence>

      <Sequence from={0} durationInFrames={900} layout="none" premountFor={30}>
        <ActLabel text="Act 5 — Coach Builder" />
      </Sequence>

      <Sequence from={300} durationInFrames={600} premountFor={30}>
        <NarrationCard
          title="Custom Coach — DaVinci Resolve"
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
