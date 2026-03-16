import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { ActLabel } from "./ActLabel";
import { VOICEOVER_TIMINGS } from "../voiceover-timings";

/**
 * Act 5 — Coach Builder.
 * Slideshow of 5 Playwright screenshots showing the full workflow:
 * dashboard → form → name filled → building → complete.
 */

const { durationFrames } = VOICEOVER_TIMINGS.act5;

const SCREENSHOTS = [
  { src: "assets/coach-builder-01-dashboard.png", caption: "Dashboard — 5 preset coaches ready" },
  { src: "assets/coach-builder-02-form.png", caption: "Click '+ New Coach' — choose software" },
  { src: "assets/coach-builder-03-name-filled.png", caption: "Type 'DaVinci Resolve'" },
  { src: "assets/coach-builder-04-building.png", caption: "Gemini validates + builds knowledge base" },
  { src: "assets/coach-builder-05-complete.png", caption: "Knowledge built — ready for live sessions" },
];

// Each screenshot gets equal screen time
const FRAMES_PER_SLIDE = Math.floor(durationFrames / SCREENSHOTS.length);

const SlideshowImage: React.FC<{ src: string; caption: string }> = ({ src, caption }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          backgroundColor: "#0f0f1a",
        }}
      />
      {/* Caption bar at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px 40px",
          background: "linear-gradient(transparent, rgba(15,15,26,0.95))",
        }}
      >
        <p
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.9)",
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 600,
            margin: 0,
            textAlign: "center",
          }}
        >
          {caption}
        </p>
      </div>
    </AbsoluteFill>
  );
};

export const Act5CoachBuilder: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0f1a" }}>
      {SCREENSHOTS.map((shot, i) => (
        <Sequence
          key={shot.src}
          from={i * FRAMES_PER_SLIDE}
          durationInFrames={FRAMES_PER_SLIDE}
        >
          <SlideshowImage src={shot.src} caption={shot.caption} />
        </Sequence>
      ))}

      <Sequence from={0} durationInFrames={durationFrames} layout="none">
        <ActLabel text="Coach Builder" />
      </Sequence>
    </AbsoluteFill>
  );
};
