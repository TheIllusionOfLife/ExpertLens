"use client";

import { CoachIcon, GENERIC_ICONS, GENERIC_ICON_KEYS } from "@/components/CoachIcon";
import { PreferencesForm } from "@/components/PreferencesForm";
import { deleteCoach, getCoach, rebuildKnowledge, updateCoach } from "@/lib/api-client";
import { PRESET_COACH_IDS } from "@/lib/constants";
import type { Coach } from "@/types/coach";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

interface Props {
  params: Promise<{ coachId: string }>;
}

function KnowledgeSection({
  status,
  updatedAt,
  coachId,
  onRebuild,
}: {
  status: string | undefined;
  updatedAt?: string;
  coachId: string;
  onRebuild: () => void;
}) {
  const [rebuilding, setRebuilding] = useState(false);

  const handleRebuild = async () => {
    setRebuilding(true);
    try {
      await rebuildKnowledge(coachId);
      onRebuild();
    } catch (err) {
      console.error("Rebuild failed:", err);
    } finally {
      setRebuilding(false);
    }
  };

  const isBuilding = status === "building" || rebuilding;

  const formattedDate = updatedAt
    ? new Date(updatedAt).toLocaleDateString(undefined, { dateStyle: "medium" })
    : "Never";

  return (
    <div className="space-y-3">
      {status === "building" && (
        <div className="px-4 py-3 rounded-lg border border-(--accent)/40 bg-(--accent)/5 text-sm text-(--accent) animate-pulse">
          Building knowledge base… (~60 seconds)
        </div>
      )}
      {status === "error" && (
        <div className="px-4 py-3 rounded-lg border border-red-500/40 bg-red-500/5 text-sm text-red-400">
          Knowledge generation failed — session uses base model training
        </div>
      )}
      <div className="flex items-center justify-between">
        <p className="text-xs text-(--muted)">
          Knowledge last updated: <span className="text-(--foreground)/70">{formattedDate}</span>
        </p>
        <button
          type="button"
          onClick={handleRebuild}
          disabled={isBuilding}
          className="text-xs px-3 py-1.5 rounded-md bg-(--surface-elevated) border border-(--border) text-(--foreground)/70 hover:text-(--foreground) hover:border-(--accent)/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isBuilding ? "Building…" : "Rebuild Knowledge"}
        </button>
      </div>
    </div>
  );
}

// Default icon key for coaches that don't have one yet
const DEFAULT_ICON_KEY = GENERIC_ICON_KEYS[0];

function CoachProfileForm({
  coach,
  onSaved,
}: {
  coach: Coach;
  onSaved: (updated: Coach) => void;
}) {
  const [displayName, setDisplayName] = useState(coach.display_name);
  const [icon, setIcon] = useState(
    GENERIC_ICON_KEYS.includes(coach.icon) ? coach.icon : DEFAULT_ICON_KEY
  );
  const [persona, setPersona] = useState(coach.persona);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const updated = await updateCoach(coach.coach_id, {
        display_name: displayName,
        icon,
        persona,
      });
      onSaved(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="coach-display-name"
          className="block text-xs font-medium text-(--muted) mb-1.5"
        >
          Display Name
        </label>
        <input
          id="coach-display-name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-(--surface-elevated) border border-(--border) rounded-lg text-(--foreground) focus:outline-none focus:border-(--accent)/60 transition-colors"
        />
      </div>
      <div>
        <p className="block text-xs font-medium text-(--muted) mb-1.5">Icon</p>
        <div className="flex flex-wrap gap-2">
          {GENERIC_ICON_KEYS.map((key) => {
            const IconSvg = GENERIC_ICONS[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => setIcon(key)}
                title={key}
                className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-colors ${
                  icon === key
                    ? "border-(--accent) bg-(--accent)/10"
                    : "border-(--border) bg-(--surface-elevated) hover:border-(--accent)/40"
                }`}
              >
                <IconSvg size={20} />
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label htmlFor="coach-persona" className="block text-xs font-medium text-(--muted) mb-1.5">
          Persona
        </label>
        <textarea
          id="coach-persona"
          value={persona}
          onChange={(e) => setPersona(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm bg-(--surface-elevated) border border-(--border) rounded-lg text-(--foreground) focus:outline-none focus:border-(--accent)/60 transition-colors resize-none"
        />
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 text-sm font-medium rounded-lg bg-(--accent) hover:bg-(--accent-hover) text-white transition-colors disabled:opacity-50"
      >
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save Profile"}
      </button>
    </div>
  );
}

function DeleteCoachButton({ coachId, coachName }: { coachId: string; coachName: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCoach(coachId);
      router.push("/");
    } catch (err) {
      console.error("Delete failed:", err);
      setDeleting(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-(--muted)">Delete {coachName}? This cannot be undone.</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Confirm Delete"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 text-sm rounded-lg text-(--muted) hover:text-(--foreground) transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="px-4 py-2 text-sm font-medium rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors"
    >
      Delete Coach
    </button>
  );
}

export default function CoachDetailPage({ params }: Props) {
  const { coachId } = use(params);
  const [coach, setCoach] = useState<Coach | null>(null);
  const [knowledgeStatus, setKnowledgeStatus] = useState<string | undefined>();
  const [error, setError] = useState("");

  // Initial load
  useEffect(() => {
    getCoach(coachId)
      .then((c) => {
        setCoach(c);
        setKnowledgeStatus(c.knowledge_status);
      })
      .catch(() => setError("Failed to load coach"));
  }, [coachId]);

  // Poll while building — updates both banner and button disabled state
  useEffect(() => {
    if (knowledgeStatus !== "building") return;
    const id = setInterval(async () => {
      try {
        const c = await getCoach(coachId);
        setKnowledgeStatus(c.knowledge_status);
        setCoach(c);
        if (c.knowledge_status !== "building") clearInterval(id);
      } catch {
        // ignore transient poll errors
      }
    }, 3000);
    return () => clearInterval(id);
  }, [coachId, knowledgeStatus]);

  if (error) {
    return (
      <div className="min-h-screen bg-(--background) flex items-center justify-center text-(--muted)">
        {error}
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="min-h-screen bg-(--background) flex items-center justify-center text-(--muted)">
        Loading…
      </div>
    );
  }

  const sessionDisabled = knowledgeStatus === "building";

  return (
    <div className="min-h-screen bg-(--background)">
      <header className="flex items-center justify-between px-4 sm:px-8 py-5 border-b border-(--border)">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-(--muted) hover:text-(--foreground) text-sm transition-colors"
          >
            ← Dashboard
          </Link>
          <span className="text-(--border)">/</span>
          <span className="text-sm font-medium">{coach.display_name}</span>
        </div>
        {sessionDisabled ? (
          <button
            type="button"
            disabled
            className="px-4 py-2 rounded-lg text-sm font-medium bg-(--surface-elevated) text-(--muted) cursor-not-allowed opacity-50"
          >
            ▶ Start Session
          </button>
        ) : (
          <Link
            href={`/session/${coachId}`}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-(--accent) hover:bg-(--accent-hover) text-white"
          >
            ▶ Start Session
          </Link>
        )}
      </header>

      <main className="px-4 sm:px-8 py-10 max-w-2xl mx-auto space-y-10">
        <KnowledgeSection
          status={knowledgeStatus}
          updatedAt={coach.knowledge_updated_at}
          coachId={coachId}
          onRebuild={() => setKnowledgeStatus("building")}
        />

        {/* Coach info */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-(--surface-elevated) border border-(--border) flex items-center justify-center flex-shrink-0">
            <CoachIcon coachId={coachId} iconKey={coach?.icon} size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">{coach.display_name}</h1>
            <p className="text-(--muted) text-sm leading-relaxed">{coach.persona}</p>
          </div>
        </div>

        {/* Coach Profile */}
        <section>
          <h2 className="text-lg font-semibold mb-1">Coach Profile</h2>
          <p className="text-(--muted) text-sm mb-5">
            Customize the name, icon, and persona for this coach.
          </p>
          <CoachProfileForm coach={coach} onSaved={(updated) => setCoach(updated)} />
        </section>

        {/* Preferences */}
        <section>
          <h2 className="text-lg font-semibold mb-1">Coaching Preferences</h2>
          <p className="text-(--muted) text-sm mb-5">
            Customize how this coach interacts with you during live sessions.
          </p>
          <PreferencesForm coachId={coachId} initial={coach.default_preferences} />
        </section>

        {/* Danger Zone — only for custom coaches */}
        {!PRESET_COACH_IDS.has(coachId) && (
          <section className="border-t border-(--border) pt-8">
            <h2 className="text-lg font-semibold mb-1 text-red-400">Danger Zone</h2>
            <p className="text-(--muted) text-sm mb-5">
              Permanently delete this coach and all its knowledge. This cannot be undone.
            </p>
            <DeleteCoachButton coachId={coachId} coachName={coach.display_name} />
          </section>
        )}
      </main>
    </div>
  );
}
