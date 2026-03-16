import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ActLabel } from "./ActLabel";
import { VOICEOVER_TIMINGS } from "../voiceover-timings";

const { durationFrames } = VOICEOVER_TIMINGS["architecture"];

export const Act6Architecture: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0f1a", opacity }}>
      <Img
        src={staticFile("assets/architecture.png")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
      <Sequence from={0} durationInFrames={durationFrames} layout="none">
        <ActLabel text="Architecture" />
      </Sequence>
    </AbsoluteFill>
  );
};
