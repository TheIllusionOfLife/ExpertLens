import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { ActLabel } from "./ActLabel";

const APPS = [
  { category: "Browser Apps", examples: "Figma, Canva, Google Docs", aiAction: "Automate with Playwright", color: "#34a853", icon: "🌐" },
  { category: "CLI Tools", examples: "git, ffmpeg, AWS CLI", aiAction: "Call directly via tool use", color: "#4285f4", icon: "⌨️" },
  { category: "Desktop GUI Apps", examples: "Blender, Affinity Photo, Unreal Engine", aiAction: "No API. Coaching is the only option.", color: "#7c6af7", icon: "🖥️", highlight: true },
];

export const SceneProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, 25], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subtitleOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0f1a" }}>
      <Sequence from={0} durationInFrames={900} layout="none"><ActLabel text="The Problem" /></Sequence>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", paddingTop: 120 }}>
        <h1 style={{ fontSize: 64, fontWeight: 800, color: "#ffffff", fontFamily: "system-ui, sans-serif", textAlign: "center", lineHeight: 1.15, maxWidth: 1400, margin: 0, opacity: titleOpacity, transform: `translateY(${titleY}px)` }}>
          Professional software is hard.{"\n"}AI <span style={{ color: "#7c6af7" }}>can't control it</span> for you.
        </h1>
        <p style={{ fontSize: 26, color: "rgba(255,255,255,0.5)", fontFamily: "system-ui, sans-serif", textAlign: "center", maxWidth: 800, lineHeight: 1.6, marginTop: 24, opacity: subtitleOpacity }}>
          GUI-heavy desktop and mobile apps have steep learning curves and no automation API. Coaching is the only way to accelerate.
        </p>
      </AbsoluteFill>
      <Sequence from={60} durationInFrames={900} layout="none">
        <ComparisonCards frame={frame - 60} />
      </Sequence>
      <Sequence from={180} durationInFrames={900} layout="none">
        <Punchline frame={frame - 180} />
      </Sequence>
    </AbsoluteFill>
  );
};

const ComparisonCards: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ position: "absolute", bottom: 140, left: 100, right: 100, display: "flex", gap: 32 }}>
    {APPS.map((app, i) => {
      const localFrame = Math.max(0, frame - i * 15);
      const opacity = interpolate(localFrame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const translateY = interpolate(localFrame, [0, 25], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return (
        <div key={app.category} style={{ flex: 1, backgroundColor: app.highlight ? "rgba(124,106,247,0.12)" : "rgba(20,24,50,0.9)", border: `2px solid ${app.highlight ? app.color : `${app.color}33`}`, borderRadius: 20, padding: "36px 40px", opacity, transform: `translateY(${translateY}px) scale(${app.highlight ? 1.03 : 1})`, boxShadow: app.highlight ? "0 0 40px rgba(124,106,247,0.2)" : "none" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>{app.icon}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: app.color, letterSpacing: "0.1em", textTransform: "uppercase" as const, fontFamily: "system-ui, sans-serif", marginBottom: 8 }}>{app.category}</div>
          <div style={{ fontSize: 22, color: "#e8eaf6", fontWeight: 600, fontFamily: "system-ui, sans-serif", marginBottom: 12 }}>{app.examples}</div>
          <div style={{ fontSize: 16, color: app.highlight ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.45)", fontFamily: "system-ui, sans-serif", lineHeight: 1.4, fontWeight: app.highlight ? 600 : 400 }}>{app.aiAction}</div>
        </div>
      );
    })}
  </div>
);

const Punchline: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", bottom: 60, left: 0, right: 0, textAlign: "center", opacity }}>
      <p style={{ fontSize: 22, color: "#7c6af7", fontWeight: 600, fontFamily: "system-ui, sans-serif", letterSpacing: "0.05em" }}>ExpertLens is built for this gap.</p>
    </div>
  );
};
