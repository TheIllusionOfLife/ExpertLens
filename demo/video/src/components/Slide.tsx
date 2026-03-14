import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

type SlideProps = {
  imageSrc: string;
  headline: string;
  body?: string;
  dimImage?: boolean;
};

export const Slide: React.FC<SlideProps> = ({
  imageSrc,
  headline,
  body,
  dimImage = false,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const textY = interpolate(frame, [0, 20], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Background screenshot */}
      <Img
        src={staticFile(imageSrc)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: dimImage ? 0.35 : 1,
        }}
      />

      {/* Dark gradient overlay for text legibility */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(15,15,26,0.95) 0%, rgba(15,15,26,0.6) 40%, rgba(15,15,26,0.1) 100%)",
        }}
      />

      {/* Text block */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "64px 80px",
          transform: `translateY(${textY}px)`,
        }}
      >
        <h1
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "#ffffff",
            margin: 0,
            lineHeight: 1.2,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {headline}
        </h1>
        {body && (
          <p
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.75)",
              marginTop: 16,
              lineHeight: 1.5,
              maxWidth: 900,
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {body}
          </p>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
