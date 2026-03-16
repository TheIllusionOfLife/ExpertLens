import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { ActLabel } from "./ActLabel";

const font = "system-ui, sans-serif";

const PLATFORMS = [
  { name: "Desktop (Chrome)", api: "getDisplayMedia()", desc: "Full screen sharing. Coach sees your entire workspace.", color: "#4285f4" },
  { name: "Android (Chrome)", api: "getDisplayMedia()", desc: "Full screen sharing. Same as desktop, works natively.", color: "#34a853" },
  { name: "iOS (Safari)", api: "getUserMedia() fallback", desc: "Rear camera captures your screen. Point and coach.", color: "#e37400" },
];

export const SceneMobile: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0f1a", opacity }}>
      <Sequence from={0} durationInFrames={600} layout="none"><ActLabel text="Works on Every Device" /></Sequence>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 80 }}>
        <h2 style={{ fontSize: 48, fontWeight: 700, color: "#fff", fontFamily: font, marginBottom: 48, textAlign: "center" }}>Works on Every Device</h2>
        <div style={{ display: "flex", gap: 32, width: "100%", maxWidth: 1400 }}>
          {PLATFORMS.map((p, i) => {
            const localFrame = Math.max(0, frame - 30 - i * 15);
            const cardOpacity = interpolate(localFrame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={p.name} style={{ flex: 1, background: "rgba(20,24,50,0.9)", border: `2px solid ${p.color}44`, borderRadius: 20, padding: "36px 32px", opacity: cardOpacity }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: p.color, fontFamily: font, marginBottom: 12 }}>{p.name}</div>
                <div style={{ fontSize: 16, color: "#7c6af7", fontFamily: "monospace", marginBottom: 16 }}>{p.api}</div>
                <div style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", fontFamily: font, lineHeight: 1.5 }}>{p.desc}</div>
              </div>
            );
          })}
        </div>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.4)", fontFamily: font, marginTop: 40, textAlign: "center" }}>Same agent, same knowledge, same voice interaction. Zero backend changes.</p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
