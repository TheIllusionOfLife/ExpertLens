import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type Message = {
  speaker: "Coach" | "User" | "Narrator";
  text: string;
};

type NarrationCardProps = {
  messages: Message[];
  title?: string;
  /** Per-message start frame relative to this component's frame 0.
   *  Defaults to index * 20 if omitted (original stagger). */
  messageDelayFrames?: number[];
};

const SPEAKER_COLORS: Record<Message["speaker"], string> = {
  Coach: "#7c6af7",
  User: "#00bcd4",
  Narrator: "#a0a8c0",
};

export const NarrationCard: React.FC<NarrationCardProps> = ({ messages, title, messageDelayFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
        opacity: containerOpacity,
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(13,16,35,0.96)",
          border: "1px solid rgba(124,106,247,0.3)",
          borderRadius: 20,
          padding: "48px 56px",
          maxWidth: 900,
          width: "100%",
          transform: `scale(${scale})`,
          boxShadow: "0 0 80px rgba(124,106,247,0.15)",
        }}
      >
        {title && (
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#7c6af7",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 32,
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {title}
          </p>
        )}
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            message={msg}
            delayFrames={messageDelayFrames?.[i] ?? i * 20}
            totalFrames={frame}
            fps={fps}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const MessageBubble: React.FC<{
  message: Message;
  delayFrames: number;
  totalFrames: number;
  fps: number;
}> = ({ message, delayFrames, totalFrames, fps }) => {
  const localFrame = Math.max(0, totalFrames - delayFrames);

  const opacity = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(localFrame, [0, 20], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const color = SPEAKER_COLORS[message.speaker];

  return (
    <div
      style={{
        marginBottom: 28,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {message.speaker}
      </span>
      <p
        style={{
          fontSize: 24,
          color: "#e8eaf6",
          marginTop: 6,
          lineHeight: 1.6,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {message.text}
      </p>
    </div>
  );
};
