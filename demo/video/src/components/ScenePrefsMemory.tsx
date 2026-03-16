import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { ActLabel } from "./ActLabel";

const font = "system-ui, sans-serif";

const Dot: React.FC = () => (
  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#7c6af7", flexShrink: 0, marginTop: 8 }} />
);

export const ScenePrefsMemory: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0f1a", opacity }}>
      <Sequence from={0} durationInFrames={900} layout="none"><ActLabel text="Preferences + Memory" /></Sequence>
      <AbsoluteFill style={{ display: "flex", flexDirection: "row", padding: "90px 60px 120px", gap: 40 }}>
        {/* Column 1: Up-to-Date Knowledge */}
        <div style={{ flex: 1 }}>
          <UpToDateKnowledge frame={frame} />
        </div>
        {/* Column 2: Preferences */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: "#fff", fontFamily: font, marginBottom: 24 }}>Personalized Coaching</h2>
          {[
            { label: "Interaction Style", desc: "Shortcuts-first vs mouse/menu guided" },
            { label: "Coaching Tone", desc: "Concise expert vs calm mentor vs enthusiastic" },
            { label: "Response Depth", desc: "Short / medium / detailed" },
            { label: "Proactivity", desc: "Reactive / balanced / proactive" },
          ].map((item, i) => {
            const localFrame = Math.max(0, frame - 30 - i * 20);
            const itemOpacity = interpolate(localFrame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20, opacity: itemOpacity }}>
                <Dot />
                <div>
                  <div style={{ fontSize: 20, fontWeight: 600, color: "#e8eaf6", fontFamily: font }}>{item.label}</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontFamily: font, marginTop: 4 }}>{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Column 3: Memory */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: "#fff", fontFamily: font, marginBottom: 24 }}>Cross-Session Memory</h2>
          {[
            { label: "Session ends", desc: "Coach transcript accumulated during session" },
            { label: "Gemini summarizes", desc: "Structured JSON summary via gemini-2.0-flash" },
            { label: "Stored in Firestore", desc: "Keyed by user_id + coach_id" },
            { label: "Injected at next start", desc: "Last 3 summaries loaded into system instruction" },
          ].map((item, i) => {
            const localFrame = Math.max(0, frame - 30 - i * 20);
            const itemOpacity = interpolate(localFrame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20, opacity: itemOpacity }}>
                <Dot />
                <div>
                  <div style={{ fontSize: 20, fontWeight: 600, color: "#e8eaf6", fontFamily: font }}>{item.label}</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontFamily: font, marginTop: 4 }}>{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const UpToDateKnowledge: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <div>
      <h2 style={{ fontSize: 36, fontWeight: 700, color: "#fff", fontFamily: font, marginBottom: 24 }}>Up-to-Date Knowledge</h2>
      {[
        { label: "Google Search Grounding", desc: "Knowledge builder uses real-time web search to source the latest information" },
        { label: "Latest UI Changes", desc: "Shortcuts, menus, and workflows updated with every rebuild" },
        { label: "Critical for Coaching", desc: "Desktop UIs evolve constantly. Stale knowledge leads to wrong guidance" },
      ].map((item, i) => {
        const localFrame = Math.max(0, frame - 30 - i * 20);
        const itemOpacity = interpolate(localFrame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20, opacity: itemOpacity }}>
            <Dot />
            <div>
              <div style={{ fontSize: 20, fontWeight: 600, color: "#e8eaf6", fontFamily: font }}>{item.label}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontFamily: font, marginTop: 4 }}>{item.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
