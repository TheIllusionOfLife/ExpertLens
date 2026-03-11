"use client";

import { createCoach } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SOFTWARE_OPTIONS = [
  { value: "blender", label: "Blender", icon: "🎨" },
  { value: "affinity_photo", label: "Affinity Photo", icon: "📸" },
  { value: "unreal_engine", label: "Unreal Engine", icon: "🎮" },
  { value: "davinci_resolve", label: "DaVinci Resolve", icon: "🎬" },
  { value: "figma", label: "Figma", icon: "✏️" },
  { value: "custom", label: "Other (custom)", icon: "🔧" },
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
