"use client";

import { CoachIcon } from "@/components/CoachIcon";
import { PreferencesForm } from "@/components/PreferencesForm";
import { getCoach } from "@/lib/api-client";
import type { Coach } from "@/types/coach";
import Link from "next/link";
import { use, useEffect, useState } from "react";

interface Props {
  params: Promise<{ coachId: string }>;
}

function KnowledgeStatusBanner({ status }: { status: string | undefined }) {
  if (status === "building") {
    return (
      <div className="px-4 py-3 rounded-lg border border-(--accent)/40 bg-(--accent)/5 text-sm text-(--accent) animate-pulse">
        Building knowledge base… (~30 seconds)
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="px-4 py-3 rounded-lg border border-red-500/40 bg-red-500/5 text-sm text-red-400">
        Knowledge generation failed — session uses base model training
      </div>
    );
  }
  return null;
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
      .catch(() => setError("Coach not found"));
  }, [coachId]);

  // Poll while building — updates both banner and button disabled state
  useEffect(() => {
    if (knowledgeStatus !== "building") return;
    const id = setInterval(async () => {
      try {
        const c = await getCoach(coachId);
        setKnowledgeStatus(c.knowledge_status);
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
      <header className="flex items-center justify-between px-8 py-5 border-b border-(--border)">
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
        <Link
          href={sessionDisabled ? "#" : `/session/${coachId}`}
          aria-disabled={sessionDisabled}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            sessionDisabled
              ? "bg-(--surface-elevated) text-(--muted) cursor-not-allowed pointer-events-none opacity-50"
              : "bg-(--accent) hover:bg-(--accent-hover) text-white"
          }`}
        >
          ▶ Start Session
        </Link>
      </header>

      <main className="px-8 py-10 max-w-2xl mx-auto space-y-10">
        <KnowledgeStatusBanner status={knowledgeStatus} />

        {/* Coach info */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-(--surface-elevated) border border-(--border) flex items-center justify-center flex-shrink-0">
            <CoachIcon coachId={coachId} size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">{coach.display_name}</h1>
            <p className="text-(--muted) text-sm leading-relaxed">{coach.persona}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {coach.focus_areas.map((area) => (
                <span
                  key={area}
                  className="text-xs px-2.5 py-1 bg-(--surface-elevated) border border-(--border) rounded-full text-(--muted)"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Preferences */}
        <section>
          <h2 className="text-lg font-semibold mb-1">Coaching Preferences</h2>
          <p className="text-(--muted) text-sm mb-5">
            Customize how this coach interacts with you during live sessions.
          </p>
          <PreferencesForm coachId={coachId} initial={coach.default_preferences} />
        </section>
      </main>
    </div>
  );
}
