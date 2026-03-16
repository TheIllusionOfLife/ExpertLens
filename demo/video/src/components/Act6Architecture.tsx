import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { ActLabel } from "./ActLabel";

/**
 * Act 6 — Architecture diagram rendered as a React component.
 * No external PNG — everything is crisp at 1920x1080.
 */

const font = "system-ui, -apple-system, sans-serif";

// Colors
const purple = "#7c6af7";
const blue = "#4285f4";
const orange = "#e37400";
const green = "#34a853";
const bg = "#0f0f1a";
const cardBg = "rgba(20,24,50,0.95)";
const textPrimary = "#e8eaf6";
const textMuted = "rgba(255,255,255,0.5)";

type BoxProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  subtitle?: string;
  color: string;
  glow?: boolean;
  children?: React.ReactNode;
};

const Box: React.FC<BoxProps> = ({ x, y, w, h, title, subtitle, color, glow, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      backgroundColor: glow ? `${color}15` : cardBg,
      border: `2px solid ${glow ? color : `${color}55`}`,
      borderRadius: 16,
      padding: "14px 18px",
      boxShadow: glow ? `0 0 30px ${color}25` : "none",
    }}
  >
    <div style={{ fontSize: 16, fontWeight: 700, color, fontFamily: font }}>{title}</div>
    {subtitle && (
      <div style={{ fontSize: 12, color: textMuted, fontFamily: font, marginTop: 4, lineHeight: 1.4 }}>
        {subtitle}
      </div>
    )}
    {children}
  </div>
);

type GroupProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  color: string;
};

const Group: React.FC<GroupProps> = ({ x, y, w, h, label, color }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      border: `2px dashed ${color}55`,
      borderRadius: 20,
      backgroundColor: `${color}08`,
    }}
  >
    <div
      style={{
        position: "absolute",
        top: -14,
        left: 20,
        fontSize: 13,
        fontWeight: 700,
        color,
        fontFamily: font,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        backgroundColor: bg,
        padding: "2px 10px",
      }}
    >
      {label}
    </div>
  </div>
);

type ArrowProps = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  label?: string;
  thick?: boolean;
  dashed?: boolean;
};

const Arrow: React.FC<ArrowProps> = ({ x1, y1, x2, y2, color, label, thick, dashed }) => {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  return (
    <>
      <svg
        style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, pointerEvents: "none" }}
      >
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth={thick ? 3 : 2}
          strokeDasharray={dashed ? "8,5" : "none"}
        />
        {/* Arrowhead */}
        <polygon
          points={`0,-5 12,0 0,5`}
          fill={color}
          transform={`translate(${x2},${y2}) rotate(${(angle * 180) / Math.PI})`}
        />
      </svg>
      {label && (
        <div
          style={{
            position: "absolute",
            left: midX - 80,
            top: midY - 12,
            width: 160,
            textAlign: "center",
            fontSize: 11,
            fontWeight: 600,
            color,
            fontFamily: font,
            backgroundColor: bg,
            padding: "2px 6px",
            borderRadius: 4,
          }}
        >
          {label}
        </div>
      )}
    </>
  );
};

export const Act6Architecture: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: bg, opacity }}>
      <Sequence from={0} durationInFrames={600} layout="none">
        <ActLabel text="Architecture" />
      </Sequence>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: 36, fontWeight: 700, color: "#fff", fontFamily: font, margin: 0 }}>
          System Architecture
        </h2>
        <p style={{ fontSize: 14, color: textMuted, fontFamily: font, marginTop: 6 }}>
          Cloud Run · Gemini Live API · Firestore · ADK
        </p>
      </div>

      {/* Groups */}
      <Group x={40} y={120} w={360} h={470} label="User Device" color={blue} />
      <Group x={440} y={120} w={660} h={580} label="Google Cloud" color={blue} />
      <Group x={1140} y={120} w={740} h={470} label="Gemini API" color={purple} />

      {/* USER SIDE */}
      <Box x={60} y={160} w={320} h={60} title="Native Desktop App" subtitle="Blender / Affinity Photo / Unreal Engine" color={textMuted} />
      <Box x={60} y={245} w={320} h={150} title="Browser (Chrome / Safari)" color={blue}>
        <div style={{ fontSize: 12, color: textMuted, fontFamily: font, marginTop: 8, lineHeight: 1.6 }}>
          <span style={{ color: purple }}>getDisplayMedia</span> — screen capture<br />
          <span style={{ color: purple }}>getUserMedia</span> — camera / mic<br />
          <span style={{ color: purple }}>AudioContext</span> — speaker playback
        </div>
      </Box>
      <Box x={60} y={420} w={320} h={55} title="iPhone (Safari)" subtitle="Rear camera fallback for iOS" color={textMuted} />

      {/* CLOUD RUN BACKEND */}
      <Box x={470} y={160} w={300} h={55} title="Cloud Run — Frontend" subtitle="Next.js 15 · expertlens-frontend" color={blue} />
      <Box x={470} y={240} w={300} h={200} title="Cloud Run — Backend" subtitle="FastAPI + ADK · expertlens-backend" color={blue} glow>
        <div style={{ fontSize: 12, color: textMuted, fontFamily: font, marginTop: 8, lineHeight: 1.7 }}>
          WebSocket Handler<br />
          System Instruction Builder<br />
          Gemini Live Session Manager<br />
          <span style={{ color: purple, fontSize: 11 }}>SlidingWindow · sessionResumption · VAD</span>
        </div>
      </Box>

      {/* ADK Tools */}
      <Box x={800} y={240} w={270} h={80} title="ADK Tools" color={purple} glow>
        <div style={{ fontSize: 12, color: textMuted, fontFamily: font, marginTop: 4 }}>
          get_coach_knowledge() · get_user_preferences()
        </div>
      </Box>

      {/* Knowledge Builder */}
      <Box x={800} y={340} w={270} h={100} title="Knowledge Builder" color={purple}>
        <div style={{ fontSize: 12, color: textMuted, fontFamily: font, marginTop: 4, lineHeight: 1.5 }}>
          gemini-3-flash-preview<br />
          <span style={{ color: green }}>+ Google Search grounding</span>
        </div>
      </Box>

      {/* GCP Services */}
      <Box x={470} y={470} w={200} h={70} title="Firestore" subtitle="coaches · prefs · sessions · knowledge" color={orange} />
      <Box x={690} y={470} w={170} h={70} title="Secret Manager" subtitle="GEMINI_API_KEY · JWT_SECRET_KEY" color={orange} />
      <Box x={880} y={470} w={190} h={70} title="Cloud Build" subtitle="CI/CD on main push" color={blue} />
      <Box x={470} y={560} w={200} h={55} title="Cloud Storage" subtitle="demo assets" color={orange} />
      <Box x={690} y={560} w={170} h={55} title="Cloud Logging" subtitle="structured logs" color={blue} />
      <Box x={880} y={560} w={190} h={55} title="Artifact Registry" subtitle="Docker images" color={blue} />

      {/* GEMINI API */}
      <Box x={1170} y={160} w={680} h={200} title="Gemini Live API" color={purple} glow>
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#b8a9ff", fontFamily: font }}>
            gemini-2.5-flash-native-audio-latest
          </div>
          <div style={{ fontSize: 13, color: textMuted, fontFamily: font, marginTop: 10, lineHeight: 1.6 }}>
            Audio + Vision · 128k context · Native barge-in (VAD)<br />
            contextWindowCompression (SlidingWindow) · sessionResumption
          </div>
        </div>
      </Box>

      <Box x={1170} y={390} w={330} h={80} title="Google Search" subtitle="Real-time grounding for knowledge generation" color={green} />
      <Box x={1520} y={390} w={330} h={80} title="gemini-3-flash-preview" subtitle="Knowledge generation · ThinkingLevel.MINIMAL" color={purple} />

      {/* IaC badge */}
      <Box x={1170} y={500} w={300} h={50} title="Terraform IaC" subtitle="Automated infrastructure provisioning" color="#623ce4" />

      {/* ARROWS */}
      {/* Browser → Backend (WebSocket) */}
      <Arrow x1={380} y1={320} x2={470} y2={340} color={purple} label="WebSocket" thick />
      {/* Backend → Gemini Live */}
      <Arrow x1={770} y1={310} x2={1170} y2={260} color={purple} label="Bidirectional Streaming" thick />
      {/* Backend → Firestore */}
      <Arrow x1={570} y1={440} x2={570} y2={470} color={orange} label="R/W" />
      {/* Tools → Firestore */}
      <Arrow x1={880} y1={320} x2={750} y2={480} color={orange} dashed label="fallback" />
      {/* Knowledge Builder → Google Search */}
      <Arrow x1={1070} y1={390} x2={1170} y2={420} color={green} />
      {/* Knowledge Builder → Gemini Flash */}
      <Arrow x1={1070} y1={400} x2={1520} y2={430} color={purple} dashed />
      {/* Cloud Build → Artifact Registry */}
      <Arrow x1={975} y1={540} x2={975} y2={560} color={blue} dashed />

      {/* Live URL */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          right: 60,
          fontSize: 14,
          color: blue,
          fontFamily: font,
          fontStyle: "italic",
        }}
      >
        Live: https://expertlens-frontend-pk4kcjevqa-uc.a.run.app
      </div>
    </AbsoluteFill>
  );
};
