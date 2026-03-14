import { AbsoluteFill, Series } from "remotion";
import { Act1DesktopGap } from "./components/Act1DesktopGap";
import { Act2aSession1 } from "./components/Act2aSession1";
import { Act2bMemory } from "./components/Act2bMemory";
import { Act3VsGeminiLive } from "./components/Act3VsGeminiLive";
import { Act4Preferences } from "./components/Act4Preferences";
import { Act5CoachBuilder } from "./components/Act5CoachBuilder";
import { Act6Architecture } from "./components/Act6Architecture";
import { Closing } from "./components/Closing";

// Frame budget (30fps):
// Act 1  — Desktop GUI Gap   :   0–899   (30s)
// Act 2a — Session 1         : 900–2099  (40s)
// Act 2b — Memory Demo       : 2100–3299 (40s)
// Act 3  — vs Gemini Live    : 3300–4499 (40s)
// Act 4  — Preferences       : 4500–5399 (30s)
// Act 5  — Coach Builder     : 5400–6299 (30s)
// Act 6  — Architecture      : 6300–6899 (20s)
// Closing                    : 6900–7199 (10s)

export const ExpertLensDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0f1a" }}>
      <Series>
        <Series.Sequence durationInFrames={900}>
          <Act1DesktopGap />
        </Series.Sequence>
        <Series.Sequence durationInFrames={1200}>
          <Act2aSession1 />
        </Series.Sequence>
        <Series.Sequence durationInFrames={1200}>
          <Act2bMemory />
        </Series.Sequence>
        <Series.Sequence durationInFrames={1200}>
          <Act3VsGeminiLive />
        </Series.Sequence>
        <Series.Sequence durationInFrames={900}>
          <Act4Preferences />
        </Series.Sequence>
        <Series.Sequence durationInFrames={900}>
          <Act5CoachBuilder />
        </Series.Sequence>
        <Series.Sequence durationInFrames={600}>
          <Act6Architecture />
        </Series.Sequence>
        <Series.Sequence durationInFrames={300}>
          <Closing />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
