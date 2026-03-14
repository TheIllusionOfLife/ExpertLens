import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ActLabel } from "./ActLabel";

export const Act6Architecture: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1a2e", opacity }}>
      <Sequence from={0} durationInFrames={600} layout="none">
        <ActLabel text="Act 6 — Architecture" />
      </Sequence>

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "64px 80px",
          gap: 32,
        }}
      >
        <h2
          style={{
            fontSize: 42,
            fontWeight: 700,
            color: "#ffffff",
            margin: 0,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Architecture
        </h2>
        <Img
          src={staticFile("assets/architecture.png")}
          style={{
            maxWidth: "100%",
            maxHeight: 580,
            objectFit: "contain",
            borderRadius: 12,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
