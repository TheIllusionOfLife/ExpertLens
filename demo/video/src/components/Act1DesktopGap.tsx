import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { ActLabel } from "./ActLabel";

/**
 * Act 1 — The Problem.
 * Full-screen problem framing with large text and comparison cards.
 * No background screenshot — the problem statement IS the visual.
 */
export const Act1DesktopGap: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [0, 25], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0f1a" }}>
      {/* Act label */}
      <Sequence from={0} durationInFrames={900} layout="none">
        <ActLabel text="The Problem" />
      </Sequence>

      {/* Hero text — large, centered, immediate */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 120,
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#ffffff",
            fontFamily: "system-ui, -apple-system, sans-serif",
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: 1400,
            margin: 0,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          Some software{" "}
          <span style={{ color: "#7c6af7" }}>only you</span>{" "}
          can operate.
        </h1>
        <p
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.5)",
            fontFamily: "system-ui, -apple-system, sans-serif",
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.6,
            marginTop: 24,
            opacity: subtitleOpacity,
          }}
        >
          AI can automate browsers and CLIs. But desktop GUI apps have no API.
          The keyboard is the only way in — and only the human can use it.
        </p>
      </AbsoluteFill>

      {/* Comparison cards */}
      <Sequence from={60} durationInFrames={900} layout="none">
        <ComparisonCards frame={frame - 60} />
      </Sequence>

      {/* Punchline */}
      <Sequence from={180} durationInFrames={900} layout="none">
        <Punchline frame={frame - 180} />
      </Sequence>
    </AbsoluteFill>
  );
};

const APPS = [
  {
    category: "Browser Apps",
    examples: "Figma, Canva, Google Docs",
    aiAction: "Automate with Playwright",
    color: "#34a853",
    icon: "🌐",
  },
  {
    category: "CLI Tools",
    examples: "git, ffmpeg, AWS CLI",
    aiAction: "Call directly via tool use",
    color: "#4285f4",
    icon: "⌨️",
  },
  {
    category: "Desktop GUI Apps",
    examples: "Blender, Affinity Photo, Unreal Engine",
    aiAction: "No API. Coaching is the only option.",
    color: "#7c6af7",
    icon: "🖥️",
    highlight: true,
  },
];

const ComparisonCards: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 140,
        left: 100,
        right: 100,
        display: "flex",
        gap: 32,
      }}
    >
      {APPS.map((app, i) => {
        const delay = i * 15;
        const localFrame = Math.max(0, frame - delay);
        const opacity = interpolate(localFrame, [0, 20], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const translateY = interpolate(localFrame, [0, 25], [30, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const scale = app.highlight ? 1.03 : 1;

        return (
          <div
            key={app.category}
            style={{
              flex: 1,
              backgroundColor: app.highlight
                ? "rgba(124,106,247,0.12)"
                : "rgba(20,24,50,0.9)",
              border: `2px solid ${app.highlight ? app.color : `${app.color}33`}`,
              borderRadius: 20,
              padding: "36px 40px",
              opacity,
              transform: `translateY(${translateY}px) scale(${scale})`,
              boxShadow: app.highlight
                ? `0 0 40px rgba(124,106,247,0.2)`
                : "none",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>{app.icon}</div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: app.color,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontFamily: "system-ui, -apple-system, sans-serif",
                marginBottom: 8,
              }}
            >
              {app.category}
            </div>
            <div
              style={{
                fontSize: 22,
                color: "#e8eaf6",
                fontWeight: 600,
                fontFamily: "system-ui, -apple-system, sans-serif",
                marginBottom: 12,
              }}
            >
              {app.examples}
            </div>
            <div
              style={{
                fontSize: 16,
                color: app.highlight ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.45)",
                fontFamily: "system-ui, -apple-system, sans-serif",
                lineHeight: 1.4,
                fontWeight: app.highlight ? 600 : 400,
              }}
            >
              {app.aiAction}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Punchline: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 60,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity,
      }}
    >
      <p
        style={{
          fontSize: 22,
          color: "#7c6af7",
          fontWeight: 600,
          fontFamily: "system-ui, -apple-system, sans-serif",
          letterSpacing: "0.05em",
        }}
      >
        ExpertLens is built for this gap.
      </p>
    </div>
  );
};
