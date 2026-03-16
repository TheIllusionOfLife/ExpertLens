import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ActLabel } from "./ActLabel";

const font = "system-ui, sans-serif";

const PLATFORMS = [
  { name: "PC", api: "getDisplayMedia()", desc: "Full screen sharing. Coach sees your entire workspace.", color: "#4285f4" },
  { name: "Android", api: "getDisplayMedia()", desc: "Full screen sharing. Same as desktop, works natively.", color: "#34a853" },
  { name: "iOS", api: "getUserMedia() fallback", desc: "Rear camera captures your screen. Point and coach.", color: "#e37400" },
];

export const SceneMobile: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const imgOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0f1a", opacity }}>
      <Sequence from={0} durationInFrames={600} layout="none"><ActLabel text="Works on PC and Mobile" /></Sequence>
      <AbsoluteFill style={{ display: "flex", flexDirection: "row", padding: "80px 80px 100px", gap: 48 }}>
        {/* Left: cards + subtitle */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 600 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {PLATFORMS.map((p, i) => {
              const localFrame = Math.max(0, frame - 30 - i * 15);
              const cardOpacity = interpolate(localFrame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={p.name} style={{ background: "rgba(20,24,50,0.9)", border: `2px solid ${p.color}44`, borderRadius: 16, padding: "20px 24px", opacity: cardOpacity }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: p.color, fontFamily: font }}>{p.name}</div>
                    <div style={{ fontSize: 14, color: "#7c6af7", fontFamily: "monospace" }}>{p.api}</div>
                  </div>
                  <div style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", fontFamily: font, lineHeight: 1.4 }}>{p.desc}</div>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", fontFamily: font, marginTop: 28 }}>Same agent, same knowledge, same voice interaction.</p>
        </div>
        {/* Right: screenshot */}
        <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 0, opacity: imgOpacity }}>
          <Img
            src={staticFile("assets/mobile-session.png")}
            style={{
              maxWidth: "100%",
              maxHeight: "85%",
              objectFit: "contain",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 0 60px rgba(124,106,247,0.15)",
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
