import { interpolate, useCurrentFrame } from "remotion";

type ActLabelProps = {
  text: string;
};

export const ActLabel: React.FC<ActLabelProps> = ({ text }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 32,
        left: 80,
        opacity,
        fontSize: 13,
        color: "#7c6af7",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {text}
    </div>
  );
};
