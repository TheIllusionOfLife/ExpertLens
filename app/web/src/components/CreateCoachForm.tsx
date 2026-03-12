"use client";

import { createCoach } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SOFTWARE_OPTIONS = [
  {
    value: "blender",
    label: "Blender",
    icon: (
      <svg width="16" height="16" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="15" cy="18" r="7" fill="#E87D0D" />
        <ellipse cx="15" cy="18" rx="13" ry="4.5" stroke="#F4A623" strokeWidth="1.5" fill="none" opacity="0.8" />
        <ellipse cx="15" cy="18" rx="13" ry="4.5" stroke="#F4A623" strokeWidth="1.5" fill="none" opacity="0.5" transform="rotate(60 15 18)" />
        <circle cx="15" cy="9" r="2.5" fill="white" />
      </svg>
    ),
  },
  {
    value: "affinity_photo",
    label: "Affinity",
    icon: (
      <svg width="16" height="16" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="9.5" stroke="#7c6af7" strokeWidth="2" />
        <circle cx="16" cy="16" r="3.5" fill="#7c6af7" />
        <line x1="16" y1="6.5" x2="16" y2="12.5" stroke="#7c6af7" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="16" y1="19.5" x2="16" y2="25.5" stroke="#7c6af7" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="6.5" y1="16" x2="12.5" y2="16" stroke="#7c6af7" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="19.5" y1="16" x2="25.5" y2="16" stroke="#7c6af7" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: "unreal_engine",
    label: "Unreal Engine",
    icon: (
      <svg width="16" height="16" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="7" cy="11" r="3" fill="#34d399" />
        <circle cx="25" cy="11" r="3" fill="#34d399" />
        <circle cx="16" cy="23" r="3" fill="#34d399" />
        <line x1="10" y1="11" x2="22" y2="11" stroke="#34d399" strokeWidth="1.5" />
        <line x1="8.5" y1="13.5" x2="14.2" y2="20.8" stroke="#34d399" strokeWidth="1.5" />
        <line x1="23.5" y1="13.5" x2="17.8" y2="20.8" stroke="#34d399" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    value: "davinci_resolve",
    label: "DaVinci Resolve",
    icon: (
      <svg width="16" height="16" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="11" stroke="#e05c4b" strokeWidth="2" />
        <path d="M13 11l8 5-8 5V11z" fill="#e05c4b" />
      </svg>
    ),
  },
  {
    value: "figma",
    label: "Figma",
    icon: (
      <svg width="16" height="16" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="9" y="5" width="7" height="7" rx="2" fill="#a259ff" />
        <rect x="9" y="12.5" width="7" height="7" rx="2" fill="#1abcfe" />
        <rect x="9" y="20" width="7" height="7" rx="2" fill="#0acf83" />
        <rect x="16" y="5" width="7" height="7" rx="2" fill="#ff7262" />
        <circle cx="19.5" cy="16" r="3.5" fill="#f24e1e" />
      </svg>
    ),
  },
  {
    value: "custom",
    label: "Other",
    icon: (
      <svg width="16" height="16" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <circle cx="16" cy="16" r="3" />
        <circle cx="16" cy="16" r="10" strokeDasharray="3 3" opacity="0.5" />
        <line x1="16" y1="6" x2="16" y2="9" />
        <line x1="16" y1="23" x2="16" y2="26" />
        <line x1="6" y1="16" x2="9" y2="16" />
        <line x1="23" y1="16" x2="26" y2="16" />
      </svg>
    ),
  },
];

export function CreateCoachForm() {
  const router = useRouter();
  const [software, setSoftware] = useState("");
  const [customSoftware, setCustomSoftware] = useState("");
  const [persona, setPersona] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const name = software === "custom" ? customSoftware.trim() : software;
    if (!name) {
      setError("Please select or enter a software name.");
      return;
    }
    setLoading(true);
    try {
      const coach = await createCoach({
        software_name: name,
        coach_id: name.toLowerCase().replace(/\s+/g, "_"),
        persona: persona || undefined,
      });
      router.push(`/coaches/${coach.coach_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create coach");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="block text-sm font-medium mb-3">Software</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SOFTWARE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSoftware(opt.value)}
              className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${
                software === opt.value
                  ? "border-(--accent) bg-(--accent)/10 text-(--accent)"
                  : "border-(--border) bg-(--surface-elevated) text-(--foreground) hover:border-(--accent)/40"
              }`}
            >
              <span>{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
        {software === "custom" && (
          <input
            type="text"
            value={customSoftware}
            onChange={(e) => setCustomSoftware(e.target.value)}
            placeholder="Enter software name…"
            className="mt-3 w-full px-4 py-2.5 bg-(--surface-elevated) border border-(--border) rounded-lg text-sm focus:outline-none focus:border-(--accent)"
          />
        )}
      </div>

      <div>
        <label htmlFor="coach-persona" className="block text-sm font-medium mb-2">
          Coach style <span className="text-(--muted) font-normal">(optional)</span>
        </label>
        <textarea
          id="coach-persona"
          value={persona}
          onChange={(e) => setPersona(e.target.value)}
          placeholder="e.g. Concise and direct, always lead with shortcuts, avoid long explanations"
          rows={3}
          className="w-full px-4 py-2.5 bg-(--surface-elevated) border border-(--border) rounded-lg text-sm focus:outline-none focus:border-(--accent) resize-none"
        />
      </div>

      {error && <p className="text-(--error) text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-(--accent) hover:bg-(--accent-hover) disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
      >
        {loading ? "Creating…" : "Create Coach"}
      </button>
    </form>
  );
}
