export interface Coach {
  coach_id: string;
  software_name: string;
  display_name: string;
  persona: string;
  focus_areas: string[];
  icon: string;
  default_preferences: UserPreferences;
  knowledge_status?: "none" | "building" | "ready" | "error";
  knowledge_error?: string;
}

export interface UserPreferences {
  interaction_style: "shortcuts" | "mouse" | "both";
  tone: "concise_expert" | "calm_mentor" | "enthusiastic";
  depth: "short" | "medium" | "detailed";
  proactivity: "reactive" | "balanced" | "proactive";
  response_language: string;
}

export interface Session {
  session_id: string;
  coach_id: string;
  started_at: string;
  summary?: string;
  last_topics?: string[];
}

// Hardcoded demo coaches (fallback for dashboard when API is unavailable)
export const DEMO_COACHES: Coach[] = [
  {
    coach_id: "blender",
    software_name: "Blender",
    display_name: "Blender Expert",
    persona: "Concise expert who always leads with keyboard shortcuts",
    focus_areas: ["Modeling", "UV Unwrapping", "Materials", "Rendering", "Animation"],
    icon: "🎨",
    knowledge_status: "ready",
    default_preferences: {
      interaction_style: "shortcuts",
      tone: "concise_expert",
      depth: "medium",
      proactivity: "reactive",
      response_language: "english",
    },
  },
  {
    coach_id: "affinity_photo",
    software_name: "Affinity Photo",
    display_name: "Affinity Photo Mentor",
    persona: "Friendly mentor focused on non-destructive workflows",
    focus_areas: ["Layers", "Adjustments", "Retouching", "Selections", "Export"],
    icon: "📸",
    knowledge_status: "ready",
    default_preferences: {
      interaction_style: "both",
      tone: "calm_mentor",
      depth: "medium",
      proactivity: "balanced",
      response_language: "english",
    },
  },
  {
    coach_id: "unreal_engine",
    software_name: "Unreal Engine",
    display_name: "Unreal Engine Guide",
    persona: "Technical guide for Blueprints, materials, and level design",
    focus_areas: ["Blueprints", "Materials", "Lighting", "Level Design", "Asset Management"],
    icon: "🎮",
    knowledge_status: "ready",
    default_preferences: {
      interaction_style: "both",
      tone: "concise_expert",
      depth: "detailed",
      proactivity: "reactive",
      response_language: "english",
    },
  },
];
