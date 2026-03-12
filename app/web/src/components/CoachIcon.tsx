interface Props {
  coachId: string;
  size?: number;
}

// Blender: orange sphere with three orbital rings — references the official Blender logo geometry
const BlenderIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="15" cy="18" r="7" fill="#E87D0D" />
    <ellipse cx="15" cy="18" rx="13" ry="4.5" stroke="#F4A623" strokeWidth="1.5" fill="none" opacity="0.8" />
    <ellipse cx="15" cy="18" rx="13" ry="4.5" stroke="#F4A623" strokeWidth="1.5" fill="none" opacity="0.55" transform="rotate(60 15 18)" />
    <ellipse cx="15" cy="18" rx="13" ry="4.5" stroke="#F4A623" strokeWidth="1.5" fill="none" opacity="0.55" transform="rotate(-60 15 18)" />
    <circle cx="15" cy="9" r="2.5" fill="white" />
  </svg>
);

// Affinity: aperture with radiating spokes — geometry + photo feel
const AffinityIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="9.5" stroke="#7c6af7" strokeWidth="2" />
    <circle cx="16" cy="16" r="3.5" fill="#7c6af7" />
    <line x1="16" y1="6.5" x2="16" y2="12.5" stroke="#7c6af7" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="16" y1="19.5" x2="16" y2="25.5" stroke="#7c6af7" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="6.5" y1="16" x2="12.5" y2="16" stroke="#7c6af7" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="19.5" y1="16" x2="25.5" y2="16" stroke="#7c6af7" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="9.8" y1="9.8" x2="13.9" y2="13.9" stroke="#7c6af7" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
    <line x1="18.1" y1="18.1" x2="22.2" y2="22.2" stroke="#7c6af7" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
    <line x1="22.2" y1="9.8" x2="18.1" y2="13.9" stroke="#7c6af7" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
    <line x1="13.9" y1="18.1" x2="9.8" y2="22.2" stroke="#7c6af7" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
  </svg>
);

// Unreal Engine: Blueprint node network — three nodes connected by exec wires
const UnrealEngineIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect x="2" y="2" width="28" height="28" rx="2" stroke="#34d399" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.25" />
    <circle cx="7" cy="11" r="3" fill="#34d399" />
    <circle cx="25" cy="11" r="3" fill="#34d399" />
    <circle cx="16" cy="23" r="3" fill="#34d399" />
    <line x1="10" y1="11" x2="22" y2="11" stroke="#34d399" strokeWidth="1.5" />
    <line x1="8.5" y1="13.5" x2="14.2" y2="20.8" stroke="#34d399" strokeWidth="1.5" />
    <line x1="23.5" y1="13.5" x2="17.8" y2="20.8" stroke="#34d399" strokeWidth="1.5" />
    <circle cx="16" cy="11" r="2" fill="#0a0a0f" stroke="#34d399" strokeWidth="1" />
  </svg>
);

const DefaultIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    <circle cx="16" cy="16" r="4" fill="currentColor" opacity="0.5" />
  </svg>
);

const ICONS: Record<string, (props: { size: number }) => React.JSX.Element> = {
  blender: BlenderIcon,
  affinity_photo: AffinityIcon,
  unreal_engine: UnrealEngineIcon,
};

export function CoachIcon({ coachId, size = 32 }: Props) {
  const Icon = ICONS[coachId] ?? DefaultIcon;
  return <Icon size={size} />;
}
