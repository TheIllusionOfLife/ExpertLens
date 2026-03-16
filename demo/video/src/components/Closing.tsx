import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f0f1a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        opacity,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#ffffff",
            margin: 0,
            fontFamily: "system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.02em",
          }}
        >
          ExpertLens
        </h1>
        <p
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.6)",
            marginTop: 16,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Expert coaching for the apps AI cannot automate.
        </p>
      </div>
    </AbsoluteFill>
  );
};
