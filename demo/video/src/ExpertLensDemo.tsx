import { AbsoluteFill, Sequence, Series, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Act1DesktopGap } from "./components/Act1DesktopGap";
import { Act2aSession1 } from "./components/Act2aSession1";
import { Act2bMemory } from "./components/Act2bMemory";
import { Act3VsGeminiLive } from "./components/Act3VsGeminiLive";
import { Act4Preferences } from "./components/Act4Preferences";
import { Act5CoachBuilder } from "./components/Act5CoachBuilder";
import { Act6Architecture } from "./components/Act6Architecture";
import { Closing } from "./components/Closing";
import { SCENE_IDS } from "./voiceover-config";

// Frame budget (30fps) — overridden at render time by calculateMetadata:
// Act 1  — Desktop GUI Gap   :   0–899   (30s)
// Act 2a — Session 1         : 900–2099  (40s)
// Act 2b — Memory Demo       : 2100–3299 (40s)
// Act 3  — vs Gemini Live    : 3300–4499 (40s)
// Act 4  — Preferences       : 4500–5399 (30s)
// Act 5  — Coach Builder     : 5400–6299 (30s)
// Act 6  — Architecture      : 6300–6899 (20s)
// Closing                    : 6900–7199 (10s)

export type DemoProps = {
  sceneDurations: number[];
};

export const ExpertLensDemo: React.FC<DemoProps> = ({ sceneDurations }) => {
  if (sceneDurations.length !== SCENE_IDS.length) {
    throw new Error(`Expected ${SCENE_IDS.length} scene durations, got ${sceneDurations.length}`);
  }
  const [d1, d2, d3, d4, d5, d6, d7, d8] = sceneDurations;

  // Absolute start frame for each scene (cumulative sum of previous durations).
  const offsets = sceneDurations.reduce<number[]>((acc, _, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + sceneDurations[i - 1]);
    return acc;
  }, []);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0f1a" }}>
      {/* Visual sequences */}
      <Series>
        <Series.Sequence durationInFrames={d1}>
          <Act1DesktopGap />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d2}>
          <Act2aSession1 />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d3}>
          <Act2bMemory />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d4}>
          <Act3VsGeminiLive />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d5}>
          <Act4Preferences />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d6}>
          <Act5CoachBuilder />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d7}>
          <Act6Architecture />
        </Series.Sequence>
        <Series.Sequence durationInFrames={d8}>
          <Closing />
        </Series.Sequence>
      </Series>

      {/* Voiceover audio — only for scenes without real footage audio.
          Acts 2a, 2b, 3, 4 use raw clips with live conversation — no VO. */}
      {SCENE_IDS.map((id, i) => {
        const hasFootageAudio = ["act2a", "act2b", "act3", "act4"].includes(id);
        if (hasFootageAudio) return null;
        return (
          <Sequence key={id} from={offsets[i]} durationInFrames={sceneDurations[i]}>
            <Audio src={staticFile(`voiceover/${id}.m4a`)} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
