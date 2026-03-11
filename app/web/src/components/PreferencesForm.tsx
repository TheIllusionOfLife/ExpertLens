"use client";

import { updatePreferences } from "@/lib/api-client";
import type { UserPreferences } from "@/types/coach";
import { useState } from "react";

interface Props {
  coachId: string;
  initial: UserPreferences;
}

type OptionDef = { value: string; label: string; hint: string };

const PREF_FIELDS: {
  key: keyof UserPreferences;
  label: string;
  options: OptionDef[];
}[] = [
  {
    key: "interaction_style",
    label: "Interaction Style",
    options: [
      { value: "shortcuts", label: "Shortcuts", hint: "Always lead with keyboard shortcuts" },
      { value: "mouse", label: "Mouse / Menu", hint: "Guide via menus and UI buttons" },
      { value: "both", label: "Both", hint: "Mix of shortcuts and menu paths" },
    ],
  },
  {
    key: "tone",
    label: "Coaching Tone",
    options: [
      { value: "concise_expert", label: "Concise Expert", hint: "Direct, no fluff" },
      { value: "calm_mentor", label: "Calm Mentor", hint: "Patient and encouraging" },
      { value: "enthusiastic", label: "Enthusiastic", hint: "Energetic and motivating" },
    ],
  },
  {
    key: "depth",
    label: "Response Depth",
    options: [
      { value: "short", label: "Short", hint: "1–2 sentences max" },
      { value: "medium", label: "Medium", hint: "Clear explanation with context" },
      { value: "detailed", label: "Detailed", hint: "Full breakdown with alternatives" },
    ],
  },
  {
    key: "proactivity",
    label: "Proactivity",
    options: [
      { value: "reactive", label: "Reactive", hint: "Only responds when asked" },
      { value: "balanced", label: "Balanced", hint: "Occasional unprompted tips" },
      { value: "proactive", label: "Proactive", hint: "Actively comments on what's visible" },
    ],
  },
];

export function PreferencesForm({ coachId, initial }: Props) {
  const [prefs, setPrefs] = useState<UserPreferences>(initial);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updatePreferences(coachId, prefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save preferences:", err);
    } finally {
      setSaving(false);
    }
  }

  function set<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    setPrefs((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  return (
    <div className="space-y-6">
      {PREF_FIELDS.map(({ key, label, options }) => (
        <div key={key}>
          <p className="block text-sm font-medium mb-2">{label}</p>
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                title={opt.hint}
                onClick={() => set(key, opt.value as UserPreferences[typeof key])}
                className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                  prefs[key] === opt.value
                    ? "border-(--accent) bg-(--accent)/10 text-(--accent)"
                    : "border-(--border) text-(--muted) hover:border-(--accent)/40 hover:text-(--foreground)"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-(--muted) mt-1">
            {options.find((o) => o.value === prefs[key])?.hint}
          </p>
        </div>
      ))}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="px-5 py-2.5 bg-(--accent) hover:bg-(--accent-hover) disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
      >
        {saved ? "✓ Saved" : saving ? "Saving…" : "Save Preferences"}
      </button>
    </div>
  );
}
