interface Props {
  coachId: string;
  iconKey?: string;
  size?: number;
}

// ─── Preset / brand icons ────────────────────────────────────────────────────

// Blender: orange sphere with three orbital rings — references the official Blender logo geometry
const BlenderIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="15" cy="18" r="7" fill="#E87D0D" />
    <ellipse
      cx="15"
      cy="18"
      rx="13"
      ry="4.5"
      stroke="#F4A623"
      strokeWidth="1.5"
      fill="none"
      opacity="0.8"
    />
    <ellipse
      cx="15"
      cy="18"
      rx="13"
      ry="4.5"
      stroke="#F4A623"
      strokeWidth="1.5"
      fill="none"
      opacity="0.55"
      transform="rotate(60 15 18)"
    />
    <ellipse
      cx="15"
      cy="18"
      rx="13"
      ry="4.5"
      stroke="#F4A623"
      strokeWidth="1.5"
      fill="none"
      opacity="0.55"
      transform="rotate(-60 15 18)"
    />
    <circle cx="15" cy="9" r="2.5" fill="white" />
  </svg>
);

// Affinity: aperture with radiating spokes — geometry + photo feel
const AffinityIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="9.5" stroke="#7c6af7" strokeWidth="2" />
    <circle cx="16" cy="16" r="3.5" fill="#7c6af7" />
    <line
      x1="16"
      y1="6.5"
      x2="16"
      y2="12.5"
      stroke="#7c6af7"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="16"
      y1="19.5"
      x2="16"
      y2="25.5"
      stroke="#7c6af7"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="6.5"
      y1="16"
      x2="12.5"
      y2="16"
      stroke="#7c6af7"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="19.5"
      y1="16"
      x2="25.5"
      y2="16"
      stroke="#7c6af7"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="9.8"
      y1="9.8"
      x2="13.9"
      y2="13.9"
      stroke="#7c6af7"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.55"
    />
    <line
      x1="18.1"
      y1="18.1"
      x2="22.2"
      y2="22.2"
      stroke="#7c6af7"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.55"
    />
    <line
      x1="22.2"
      y1="9.8"
      x2="18.1"
      y2="13.9"
      stroke="#7c6af7"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.55"
    />
    <line
      x1="13.9"
      y1="18.1"
      x2="9.8"
      y2="22.2"
      stroke="#7c6af7"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.55"
    />
  </svg>
);

// Unreal Engine: Blueprint node network — three nodes connected by exec wires
const UnrealEngineIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect
      x="2"
      y="2"
      width="28"
      height="28"
      rx="2"
      stroke="#34d399"
      strokeWidth="0.5"
      strokeDasharray="2 3"
      opacity="0.25"
    />
    <circle cx="7" cy="11" r="3" fill="#34d399" />
    <circle cx="25" cy="11" r="3" fill="#34d399" />
    <circle cx="16" cy="23" r="3" fill="#34d399" />
    <line x1="10" y1="11" x2="14" y2="11" stroke="#34d399" strokeWidth="1.5" />
    <line x1="18" y1="11" x2="22" y2="11" stroke="#34d399" strokeWidth="1.5" />
    <line x1="8.5" y1="13.5" x2="14.2" y2="20.8" stroke="#34d399" strokeWidth="1.5" />
    <line x1="23.5" y1="13.5" x2="17.8" y2="20.8" stroke="#34d399" strokeWidth="1.5" />
    <circle cx="16" cy="11" r="2" fill="none" stroke="#34d399" strokeWidth="1" />
  </svg>
);

// DaVinci Resolve: circular badge with play triangle — references the resolve logo shape
const DavinciResolveIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="11" stroke="#e05c4b" strokeWidth="2" />
    <path d="M13 11l8 5-8 5V11z" fill="#e05c4b" />
  </svg>
);

// Figma: five-component grid — references the official Figma logo geometry
const FigmaIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect x="9" y="5" width="7" height="7" rx="2" fill="#a259ff" />
    <rect x="9" y="12.5" width="7" height="7" rx="2" fill="#1abcfe" />
    <rect x="9" y="20" width="7" height="7" rx="2" fill="#0acf83" />
    <rect x="16" y="5" width="7" height="7" rx="2" fill="#ff7262" />
    <circle cx="19.5" cy="16" r="3.5" fill="#f24e1e" />
  </svg>
);

// Fusion: two overlapping circles connected by a node — compositing graph feel
const FusionIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="10" cy="16" r="5" stroke="#e8a020" strokeWidth="1.5" fill="none" />
    <circle cx="22" cy="16" r="5" stroke="#e8a020" strokeWidth="1.5" fill="none" />
    <line
      x1="15"
      y1="16"
      x2="17"
      y2="16"
      stroke="#e8a020"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="10" cy="16" r="2" fill="#e8a020" opacity="0.6" />
    <circle cx="22" cy="16" r="2" fill="#e8a020" opacity="0.6" />
  </svg>
);

// ZBrush: sculpt brush stroke arc — references the fluid, organic sculpting feel
const ZBrushIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path
      d="M8 24 C8 24 10 20 16 16 C22 12 24 8 24 8"
      stroke="#f07028"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="16" cy="16" r="3.5" fill="none" stroke="#f07028" strokeWidth="1.5" opacity="0.6" />
  </svg>
);

// ─── Generic / user-selectable icons ─────────────────────────────────────────
// All use var(--accent) so they adapt to the theme.

const TargetIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="11" stroke="var(--accent)" strokeWidth="1.5" />
    <circle cx="16" cy="16" r="6" stroke="var(--accent)" strokeWidth="1.5" />
    <circle cx="16" cy="16" r="2.5" fill="var(--accent)" />
    <line
      x1="16"
      y1="2"
      x2="16"
      y2="7"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="16"
      y1="25"
      x2="16"
      y2="30"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="2"
      y1="16"
      x2="7"
      y2="16"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="25"
      y1="16"
      x2="30"
      y2="16"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const PaletteIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path
      d="M16 4C8.3 4 4 10 4 16c0 5.5 4.5 10 10 10 2.5 0 4-1.5 4-3.5 0-1.8-1-3-1-4.5 0-2.2 1.8-4 4-4 2.7 0 4 1.8 7 1.8C28.4 15.8 28 8 16 4z"
      stroke="var(--accent)"
      strokeWidth="1.5"
      fill="none"
    />
    <circle cx="10" cy="12" r="2" fill="var(--accent)" />
    <circle cx="16.5" cy="8.5" r="2" fill="var(--accent)" opacity="0.75" />
    <circle cx="22" cy="13" r="2" fill="var(--accent)" opacity="0.5" />
    <circle cx="9" cy="19" r="2" fill="var(--accent)" opacity="0.6" />
  </svg>
);

const CpuIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect x="9" y="9" width="14" height="14" rx="1.5" stroke="var(--accent)" strokeWidth="1.5" />
    <rect x="12" y="12" width="8" height="8" rx="1" fill="var(--accent)" fillOpacity="0.2" />
    <line
      x1="12"
      y1="9"
      x2="12"
      y2="4"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="16"
      y1="9"
      x2="16"
      y2="4"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="20"
      y1="9"
      x2="20"
      y2="4"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="12"
      y1="23"
      x2="12"
      y2="28"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="16"
      y1="23"
      x2="16"
      y2="28"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="20"
      y1="23"
      x2="20"
      y2="28"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="9"
      y1="12"
      x2="4"
      y2="12"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="9"
      y1="16"
      x2="4"
      y2="16"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="9"
      y1="20"
      x2="4"
      y2="20"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="23"
      y1="12"
      x2="28"
      y2="12"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="23"
      y1="16"
      x2="28"
      y2="16"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="23"
      y1="20"
      x2="28"
      y2="20"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const LayersIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path
      d="M4 20 L16 26 L28 20 L16 14 Z"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinejoin="round"
      fill="var(--accent)"
      fillOpacity="0.12"
    />
    <path
      d="M4 16 L16 22 L28 16"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
      opacity="0.6"
    />
    <path
      d="M4 12 L16 18 L28 12"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
      opacity="0.35"
    />
  </svg>
);

const CodeIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path
      d="M10 9 L4 16 L10 23"
      stroke="var(--accent)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 9 L28 16 L22 23"
      stroke="var(--accent)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="19"
      y1="7"
      x2="14"
      y2="25"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.7"
    />
  </svg>
);

const CameraIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect x="2" y="10" width="28" height="18" rx="2.5" stroke="var(--accent)" strokeWidth="1.5" />
    <circle cx="16" cy="19" r="5.5" stroke="var(--accent)" strokeWidth="1.5" />
    <circle cx="16" cy="19" r="2.5" fill="var(--accent)" fillOpacity="0.4" />
    <path
      d="M10 10 L12 6 L20 6 L22 10"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="25" cy="14" r="1.5" fill="var(--accent)" opacity="0.55" />
  </svg>
);

const MusicIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <line
      x1="12"
      y1="24"
      x2="12"
      y2="11"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="22"
      y1="21"
      x2="22"
      y2="8"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="12"
      y1="11"
      x2="22"
      y2="8"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <ellipse
      cx="10"
      cy="24"
      rx="3.5"
      ry="2.5"
      transform="rotate(-15 10 24)"
      stroke="var(--accent)"
      strokeWidth="1.5"
    />
    <ellipse
      cx="20"
      cy="21"
      rx="3.5"
      ry="2.5"
      transform="rotate(-15 20 21)"
      stroke="var(--accent)"
      strokeWidth="1.5"
    />
  </svg>
);

const FilmIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect x="3" y="6" width="26" height="20" rx="2" stroke="var(--accent)" strokeWidth="1.5" />
    <line x1="3" y1="11" x2="29" y2="11" stroke="var(--accent)" strokeWidth="1" opacity="0.5" />
    <line x1="3" y1="21" x2="29" y2="21" stroke="var(--accent)" strokeWidth="1" opacity="0.5" />
    <rect x="6" y="7.5" width="3" height="3" rx="0.5" fill="var(--accent)" opacity="0.55" />
    <rect x="13.5" y="7.5" width="3" height="3" rx="0.5" fill="var(--accent)" opacity="0.55" />
    <rect x="21" y="7.5" width="3" height="3" rx="0.5" fill="var(--accent)" opacity="0.55" />
    <rect x="6" y="21.5" width="3" height="3" rx="0.5" fill="var(--accent)" opacity="0.55" />
    <rect x="13.5" y="21.5" width="3" height="3" rx="0.5" fill="var(--accent)" opacity="0.55" />
    <rect x="21" y="21.5" width="3" height="3" rx="0.5" fill="var(--accent)" opacity="0.55" />
    <path d="M13 14 L20 16 L13 18 Z" fill="var(--accent)" opacity="0.7" />
  </svg>
);

const BrushIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path
      d="M24 4 L28 8 L11 25 C9 27 6 27 5 26 C4 25 4 22 6 20 Z"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinejoin="round"
      fill="var(--accent)"
      fillOpacity="0.1"
    />
    <line
      x1="19"
      y1="7"
      x2="23"
      y2="11"
      stroke="var(--accent)"
      strokeWidth="1"
      opacity="0.4"
      strokeLinecap="round"
    />
    <circle cx="6.5" cy="25.5" r="2" fill="var(--accent)" opacity="0.6" />
  </svg>
);

const CubeIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path
      d="M16 4 L26 10 L26 22 L16 28 L6 22 L6 10 Z"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <line
      x1="16"
      y1="4"
      x2="16"
      y2="16"
      stroke="var(--accent)"
      strokeWidth="1"
      opacity="0.45"
      strokeLinecap="round"
    />
    <line
      x1="6"
      y1="10"
      x2="16"
      y2="16"
      stroke="var(--accent)"
      strokeWidth="1"
      opacity="0.45"
      strokeLinecap="round"
    />
    <line
      x1="26"
      y1="10"
      x2="16"
      y2="16"
      stroke="var(--accent)"
      strokeWidth="1"
      opacity="0.45"
      strokeLinecap="round"
    />
  </svg>
);

const TerminalIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect x="3" y="5" width="26" height="22" rx="3" stroke="var(--accent)" strokeWidth="1.5" />
    <path
      d="M9 13 L14 17 L9 21"
      stroke="var(--accent)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="16"
      y1="21"
      x2="23"
      y2="21"
      stroke="var(--accent)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const GlobeIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="12" stroke="var(--accent)" strokeWidth="1.5" />
    <ellipse cx="16" cy="16" rx="5.5" ry="12" stroke="var(--accent)" strokeWidth="1.5" />
    <line
      x1="4"
      y1="16"
      x2="28"
      y2="16"
      stroke="var(--accent)"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <path
      d="M6 10 Q16 12.5 26 10"
      stroke="var(--accent)"
      strokeWidth="1"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M6 22 Q16 19.5 26 22"
      stroke="var(--accent)"
      strokeWidth="1"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const PenIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path
      d="M16 28 L5 17 L12 4 L20 4 L27 17 Z"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinejoin="round"
      fill="var(--accent)"
      fillOpacity="0.08"
    />
    <line
      x1="9.5"
      y1="17"
      x2="22.5"
      y2="17"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M16 28 L11 17 M16 28 L21 17"
      stroke="var(--accent)"
      strokeWidth="1"
      opacity="0.45"
      strokeLinecap="round"
    />
    <circle cx="16" cy="27" r="1.5" fill="var(--accent)" />
  </svg>
);

const WaveIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <line
      x1="2"
      y1="16"
      x2="5"
      y2="16"
      stroke="var(--accent)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="7"
      y1="11"
      x2="7"
      y2="21"
      stroke="var(--accent)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="11"
      y1="7"
      x2="11"
      y2="25"
      stroke="var(--accent)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="16"
      y1="4"
      x2="16"
      y2="28"
      stroke="var(--accent)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="21"
      y1="7"
      x2="21"
      y2="25"
      stroke="var(--accent)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="25"
      y1="11"
      x2="25"
      y2="21"
      stroke="var(--accent)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="27"
      y1="14"
      x2="27"
      y2="18"
      stroke="var(--accent)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="30"
      y1="16"
      x2="30"
      y2="16"
      stroke="var(--accent)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const ChartIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <line
      x1="4"
      y1="28"
      x2="28"
      y2="28"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <rect
      x="5"
      y="18"
      width="6"
      height="10"
      rx="1"
      stroke="var(--accent)"
      strokeWidth="1.5"
      fill="var(--accent)"
      fillOpacity="0.15"
    />
    <rect
      x="13"
      y="12"
      width="6"
      height="16"
      rx="1"
      stroke="var(--accent)"
      strokeWidth="1.5"
      fill="var(--accent)"
      fillOpacity="0.25"
    />
    <rect
      x="21"
      y="7"
      width="6"
      height="21"
      rx="1"
      stroke="var(--accent)"
      strokeWidth="1.5"
      fill="var(--accent)"
      fillOpacity="0.35"
    />
  </svg>
);

const BookIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path
      d="M3 7 C3 7 7 5 16 7 L16 25 C7 23 3 25 3 25 Z"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinejoin="round"
      fill="var(--accent)"
      fillOpacity="0.08"
    />
    <path
      d="M29 7 C29 7 25 5 16 7 L16 25 C25 23 29 25 29 25 Z"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinejoin="round"
      fill="var(--accent)"
      fillOpacity="0.08"
    />
    <line
      x1="7"
      y1="12"
      x2="13"
      y2="12.5"
      stroke="var(--accent)"
      strokeWidth="1"
      opacity="0.5"
      strokeLinecap="round"
    />
    <line
      x1="7"
      y1="16"
      x2="13"
      y2="16.5"
      stroke="var(--accent)"
      strokeWidth="1"
      opacity="0.5"
      strokeLinecap="round"
    />
    <line
      x1="7"
      y1="20"
      x2="13"
      y2="20.5"
      stroke="var(--accent)"
      strokeWidth="1"
      opacity="0.5"
      strokeLinecap="round"
    />
    <line
      x1="19"
      y1="12.5"
      x2="25"
      y2="12"
      stroke="var(--accent)"
      strokeWidth="1"
      opacity="0.5"
      strokeLinecap="round"
    />
    <line
      x1="19"
      y1="16.5"
      x2="25"
      y2="16"
      stroke="var(--accent)"
      strokeWidth="1"
      opacity="0.5"
      strokeLinecap="round"
    />
    <line
      x1="19"
      y1="20.5"
      x2="25"
      y2="20"
      stroke="var(--accent)"
      strokeWidth="1"
      opacity="0.5"
      strokeLinecap="round"
    />
  </svg>
);

const AtomIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="2.5" fill="var(--accent)" />
    <ellipse cx="16" cy="16" rx="12" ry="5" stroke="var(--accent)" strokeWidth="1.5" fill="none" />
    <ellipse
      cx="16"
      cy="16"
      rx="12"
      ry="5"
      stroke="var(--accent)"
      strokeWidth="1.5"
      fill="none"
      transform="rotate(60 16 16)"
    />
    <ellipse
      cx="16"
      cy="16"
      rx="12"
      ry="5"
      stroke="var(--accent)"
      strokeWidth="1.5"
      fill="none"
      transform="rotate(-60 16 16)"
    />
  </svg>
);

const CompassIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="12" stroke="var(--accent)" strokeWidth="1.5" />
    <polygon points="16,6 19,16 16,14 13,16" fill="var(--accent)" />
    <polygon points="16,26 13,16 16,18 19,16" fill="var(--accent)" fillOpacity="0.4" />
    <circle cx="16" cy="16" r="2" fill="var(--accent)" fillOpacity="0.6" />
  </svg>
);

const GridIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect
      x="3"
      y="3"
      width="11"
      height="11"
      rx="2"
      stroke="var(--accent)"
      strokeWidth="1.5"
      fill="var(--accent)"
      fillOpacity="0.15"
    />
    <rect
      x="18"
      y="3"
      width="11"
      height="11"
      rx="2"
      stroke="var(--accent)"
      strokeWidth="1.5"
      fill="var(--accent)"
      fillOpacity="0.1"
    />
    <rect
      x="3"
      y="18"
      width="11"
      height="11"
      rx="2"
      stroke="var(--accent)"
      strokeWidth="1.5"
      fill="var(--accent)"
      fillOpacity="0.1"
    />
    <rect
      x="18"
      y="18"
      width="11"
      height="11"
      rx="2"
      stroke="var(--accent)"
      strokeWidth="1.5"
      fill="var(--accent)"
      fillOpacity="0.15"
    />
  </svg>
);

const LightningIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path
      d="M19 3 L8 18 L15 18 L13 29 L24 14 L17 14 Z"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinejoin="round"
      fill="var(--accent)"
      fillOpacity="0.15"
    />
  </svg>
);

const NetworkIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="3" fill="var(--accent)" />
    <circle cx="5" cy="8" r="2.5" stroke="var(--accent)" strokeWidth="1.5" fill="none" />
    <circle cx="27" cy="8" r="2.5" stroke="var(--accent)" strokeWidth="1.5" fill="none" />
    <circle cx="5" cy="24" r="2.5" stroke="var(--accent)" strokeWidth="1.5" fill="none" />
    <circle cx="27" cy="24" r="2.5" stroke="var(--accent)" strokeWidth="1.5" fill="none" />
    <line
      x1="13.3"
      y1="14.3"
      x2="7.3"
      y2="9.7"
      stroke="var(--accent)"
      strokeWidth="1.2"
      opacity="0.6"
    />
    <line
      x1="18.7"
      y1="14.3"
      x2="24.7"
      y2="9.7"
      stroke="var(--accent)"
      strokeWidth="1.2"
      opacity="0.6"
    />
    <line
      x1="13.3"
      y1="17.7"
      x2="7.3"
      y2="22.3"
      stroke="var(--accent)"
      strokeWidth="1.2"
      opacity="0.6"
    />
    <line
      x1="18.7"
      y1="17.7"
      x2="24.7"
      y2="22.3"
      stroke="var(--accent)"
      strokeWidth="1.2"
      opacity="0.6"
    />
  </svg>
);

const DefaultIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    <circle cx="16" cy="16" r="4" fill="currentColor" opacity="0.5" />
  </svg>
);

// ─── Maps ─────────────────────────────────────────────────────────────────────

const PRESET_ICONS: Record<string, (props: { size: number }) => React.JSX.Element> = {
  blender: BlenderIcon,
  affinity_photo: AffinityIcon,
  unreal_engine: UnrealEngineIcon,
  davinci_resolve: DavinciResolveIcon,
  figma: FigmaIcon,
  fusion: FusionIcon,
  zbrush: ZBrushIcon,
};

export const GENERIC_ICONS: Record<string, (props: { size: number }) => React.JSX.Element> = {
  target: TargetIcon,
  palette: PaletteIcon,
  cpu: CpuIcon,
  layers: LayersIcon,
  code: CodeIcon,
  camera: CameraIcon,
  music: MusicIcon,
  film: FilmIcon,
  brush: BrushIcon,
  cube: CubeIcon,
  terminal: TerminalIcon,
  globe: GlobeIcon,
  pen: PenIcon,
  wave: WaveIcon,
  chart: ChartIcon,
  book: BookIcon,
  atom: AtomIcon,
  compass: CompassIcon,
  grid: GridIcon,
  lightning: LightningIcon,
  network: NetworkIcon,
};

export const GENERIC_ICON_KEYS = Object.keys(GENERIC_ICONS);

export function CoachIcon({ coachId, iconKey, size = 32 }: Props) {
  // User-saved icon takes priority; fall back to branded preset, then default.
  const GenericIcon = iconKey ? GENERIC_ICONS[iconKey] : undefined;
  if (GenericIcon) return <GenericIcon size={size} />;

  const PresetIcon = PRESET_ICONS[coachId];
  if (PresetIcon) return <PresetIcon size={size} />;

  return <DefaultIcon size={size} />;
}
