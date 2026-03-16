import { AbsoluteFill, Sequence, Series, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { SceneProblem } from "./components/SceneProblem";
import { SceneDemo } from "./components/SceneDemo";
import { SceneCoachBuilder } from "./components/SceneCoachBuilder";
import { ScenePrefsMemory } from "./components/ScenePrefsMemory";
import { SceneMobile } from "./components/SceneMobile";
import { Act6Architecture } from "./components/Act6Architecture";
import { Closing } from "./components/Closing";
import { SCENE_IDS } from "./voiceover-config";

// Scenes without VO (raw clip audio plays instead)
const NO_VO_SCENES = new Set(["demo"]);

export type DemoProps = {
  sceneDurations: number[];
};

export const ExpertLensDemo: React.FC<DemoProps> = ({ sceneDurations }) => {
  if (sceneDurations.length !== SCENE_IDS.length) {
    throw new Error(`Expected ${SCENE_IDS.length} scene durations, got ${sceneDurations.length}`);
  }
  const [d1, d2, d3, d4, d5, d6, d7] = sceneDurations;

  const offsets = sceneDurations.reduce<number[]>((acc, _, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + sceneDurations[i - 1]);
    return acc;
  }, []);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0f1a" }}>
      <Series>
        <Series.Sequence durationInFrames={d1}><SceneProblem /></Series.Sequence>
        <Series.Sequence durationInFrames={d2}><SceneDemo /></Series.Sequence>
        <Series.Sequence durationInFrames={d3}><SceneCoachBuilder /></Series.Sequence>
        <Series.Sequence durationInFrames={d4}><ScenePrefsMemory /></Series.Sequence>
        <Series.Sequence durationInFrames={d5}><SceneMobile /></Series.Sequence>
        <Series.Sequence durationInFrames={d6}><Act6Architecture /></Series.Sequence>
        <Series.Sequence durationInFrames={d7}><Closing /></Series.Sequence>
      </Series>

      {/* Voiceover audio: one track per scene, skip scenes with raw clip audio */}
      {SCENE_IDS.map((id, i) => {
        if (NO_VO_SCENES.has(id)) return null;
        return (
          <Sequence key={id} from={offsets[i]} durationInFrames={sceneDurations[i]}>
            <Audio src={staticFile(`voiceover/${id}.m4a`)} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
