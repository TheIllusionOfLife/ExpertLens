import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type CalloutProps = {
  text: string;
  x: number;
  y: number;
  color?: string;
};

export const Callout: React.FC<CalloutProps> = ({
  text,
  x,
  y,
  color = "#7c6af7",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `scale(${scale})`,
        opacity,
        backgroundColor: color,
        color: "#ffffff",
        borderRadius: 8,
        padding: "10px 18px",
        fontSize: 18,
        fontWeight: 600,
        fontFamily: "system-ui, -apple-system, sans-serif",
        boxShadow: `0 0 24px ${color}66`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};
