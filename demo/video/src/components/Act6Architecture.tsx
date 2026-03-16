import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ActLabel } from "./ActLabel";

/**
 * Act 6 — Architecture diagram.
 * Uses the screenshot of the HTML slide architecture (with SVG arrows).
 * This is cleaner than trying to replicate the complex layout in React.
 */
export const Act6Architecture: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0f1a", opacity }}>
      <Sequence from={0} durationInFrames={900} layout="none">
        <ActLabel text="Architecture" />
      </Sequence>
      <Img
        src={staticFile("assets/architecture.png")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </AbsoluteFill>
  );
};
