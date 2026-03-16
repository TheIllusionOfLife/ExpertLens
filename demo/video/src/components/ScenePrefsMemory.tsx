import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { ActLabel } from "./ActLabel";

const font = "system-ui, sans-serif";

export const ScenePrefsMemory: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0f1a", opacity }}>
      <Sequence from={0} durationInFrames={900} layout="none"><ActLabel text="Preferences + Memory" /></Sequence>
      <AbsoluteFill style={{ display: "flex", padding: "100px 100px", gap: 60 }}>
        {/* Left: Preferences */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 40, fontWeight: 700, color: "#fff", fontFamily: font, marginBottom: 32 }}>Personalized Coaching</h2>
          {[
            { label: "Interaction Style", desc: "Shortcuts-first vs mouse/menu guided", color: "#7c6af7" },
            { label: "Coaching Tone", desc: "Concise expert vs calm mentor vs enthusiastic", color: "#4285f4" },
            { label: "Response Depth", desc: "Short / medium / detailed", color: "#34a853" },
            { label: "Proactivity", desc: "Reactive / balanced / proactive", color: "#e37400" },
          ].map((item, i) => {
            const localFrame = Math.max(0, frame - 30 - i * 20);
            const itemOpacity = interpolate(localFrame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24, opacity: itemOpacity }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, flexShrink: 0, marginTop: 8 }} />
                <div>
                  <div style={{ fontSize: 22, fontWeight: 600, color: "#e8eaf6", fontFamily: font }}>{item.label}</div>
                  <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", fontFamily: font, marginTop: 4 }}>{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Right: Memory */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 40, fontWeight: 700, color: "#fff", fontFamily: font, marginBottom: 32 }}>Cross-Session Memory</h2>
          {[
            { step: "1", text: "Session ends", detail: "Coach transcript accumulated during session" },
            { step: "2", text: "Gemini summarizes", detail: "Structured JSON summary via gemini-2.0-flash" },
            { step: "3", text: "Stored in Firestore", detail: "Keyed by user_id + coach_id" },
            { step: "4", text: "Injected at next start", detail: "Last 3 summaries loaded into system instruction" },
          ].map((item, i) => {
            const localFrame = Math.max(0, frame - 60 - i * 25);
            const itemOpacity = interpolate(localFrame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={item.step} style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24, opacity: itemOpacity }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(124,106,247,0.15)", border: "1px solid rgba(124,106,247,0.3)", color: "#7c6af7", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{item.step}</div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 600, color: "#e8eaf6", fontFamily: font }}>{item.text}</div>
                  <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", fontFamily: font, marginTop: 4 }}>{item.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
