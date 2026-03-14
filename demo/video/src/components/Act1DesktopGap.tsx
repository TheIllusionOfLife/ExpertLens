import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Slide } from "./Slide";
import { NarrationCard } from "./NarrationCard";
import { ActLabel } from "./ActLabel";

export const Act1DesktopGap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* Background: dashboard screenshot */}
      <Sequence from={0} durationInFrames={900} premountFor={30}>
        <Slide
          imageSrc="assets/01-dashboard.png"
          headline="The Desktop GUI Gap"
          body="Browser apps can be automated. CLI tools can be called directly. But for Blender, Affinity Photo, or Unreal Engine — the mouse is the only way in."
          dimImage
        />
      </Sequence>

      {/* Act label */}
      <Sequence from={0} durationInFrames={900} layout="none" premountFor={30}>
        <ActLabel text="Act 1 — The Desktop GUI Gap" />
      </Sequence>

      {/* Three-column comparison cards */}
      <Sequence from={15 * fps} durationInFrames={15 * fps} layout="none" premountFor={30}>
        <ComparisonRow frame={frame - 15 * fps} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};

const APPS = [
  {
    category: "Browser Apps",
    examples: "Figma, Canva, Google Docs",
    aiCan: "Automate with Playwright",
    color: "#2ea44f",
  },
  {
    category: "CLI Tools",
    examples: "git, ffmpeg, AWS CLI",
    aiCan: "Call directly via tool use",
    color: "#00bcd4",
  },
  {
    category: "Desktop GUI Apps",
    examples: "Blender, Affinity Photo, Unreal Engine",
    aiCan: "Coaching is the only option",
    color: "#7c6af7",
    highlight: true,
  },
];

const ComparisonRow: React.FC<{ frame: number; fps: number }> = ({ frame }) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 160,
        left: 80,
        right: 80,
        display: "flex",
        gap: 24,
      }}
    >
      {APPS.map((app, i) => {
        const delay = i * 10;
        const localFrame = Math.max(0, frame - delay);
        const opacity = interpolate(localFrame, [0, 15], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const translateY = interpolate(localFrame, [0, 20], [20, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={app.category}
            style={{
              flex: 1,
              backgroundColor: app.highlight
                ? "rgba(124,106,247,0.15)"
                : "rgba(13,16,35,0.8)",
              border: `1px solid ${app.color}44`,
              borderRadius: 16,
              padding: "28px 32px",
              opacity,
              transform: `translateY(${translateY}px)`,
              outline: app.highlight ? `2px solid ${app.color}` : "none",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: app.color,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              {app.category}
            </div>
            <div
              style={{
                fontSize: 18,
                color: "#e8eaf6",
                marginTop: 10,
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              {app.examples}
            </div>
            <div
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.55)",
                marginTop: 12,
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              AI can: {app.aiCan}
            </div>
          </div>
        );
      })}
    </div>
  );
};
