import { CoachIcon } from "@/components/CoachIcon";
import { getCoaches } from "@/lib/api-client";
import type { Coach } from "@/types/coach";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PlayIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M5 3l14 9-14 9V3z" />
  </svg>
);

export default async function DashboardPage() {
  let coaches: Coach[] = [];
  try {
    coaches = await getCoaches();
  } catch {
    // fallback handled in api-client
  }

  return (
    <div className="min-h-screen bg-(--background)">
      {/* Nav — inner constrained to match content width */}
      <header className="border-b border-(--border) bg-(--surface)">
        <div className="flex items-center justify-between px-4 sm:px-8 md:px-16 py-5 max-w-[64rem] mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight">
              Expert<span className="text-(--accent)">Lens</span>
            </span>
            <span className="text-xs px-2 py-0.5 bg-(--accent-glow) text-(--accent) rounded-full font-medium border border-(--accent)/20">
              Beta
            </span>
          </div>
          <Link
            href="/coaches/new"
            aria-label="Create new coach"
            className="px-4 py-2 bg-(--accent) hover:bg-(--accent-hover) text-white rounded-lg text-sm font-semibold transition-all shadow-[0_0_20px_rgba(124,106,247,0.35)]"
          >
            + New Coach
          </Link>
        </div>
      </header>

      <main className="px-4 sm:px-8 md:px-16 py-16 max-w-[64rem] mx-auto">
        {/* Hero */}
        <div className="mb-16">
          <p className="font-mono text-sm text-(--accent) tracking-[0.18em] uppercase mb-5 opacity-90">
            AI Expert Coaching
          </p>
          <h1 className="text-5xl font-black tracking-tight leading-none mb-6">Your Coaches.</h1>
          <p className="text-(--muted) text-sm max-w-sm leading-relaxed">
            Select a coach to start a live session. Share your screen, speak naturally, and get
            real-time expert guidance.
          </p>
        </div>

        {coaches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 max-w-sm mx-auto text-center">
            <div className="w-20 h-20 rounded-2xl bg-(--surface-elevated) border border-(--border) flex items-center justify-center mb-6">
              <svg width="36" height="36" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <circle cx="16" cy="16" r="13" stroke="var(--border)" strokeWidth="1.5" />
                <circle
                  cx="16"
                  cy="16"
                  r="8"
                  stroke="var(--muted)"
                  strokeWidth="1.5"
                  opacity="0.5"
                />
                <circle cx="16" cy="16" r="3" fill="var(--accent)" />
                <line
                  x1="16"
                  y1="3"
                  x2="16"
                  y2="7"
                  stroke="var(--muted)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.4"
                />
                <line
                  x1="16"
                  y1="25"
                  x2="16"
                  y2="29"
                  stroke="var(--muted)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.4"
                />
                <line
                  x1="3"
                  y1="16"
                  x2="7"
                  y2="16"
                  stroke="var(--muted)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.4"
                />
                <line
                  x1="25"
                  y1="16"
                  x2="29"
                  y2="16"
                  stroke="var(--muted)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.4"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">No coaches yet</h2>
            <p className="text-(--muted) text-sm mb-8 leading-relaxed">
              Create your first AI coach for Blender, Affinity Photo, Unreal Engine, or any other
              desktop software.
            </p>
            <Link
              href="/coaches/new"
              className="px-5 py-2.5 bg-(--accent) hover:bg-(--accent-hover) text-white rounded-lg text-sm font-medium transition-colors"
            >
              Create your first coach
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coaches.map((coach, index) => (
              <CoachCard key={coach.coach_id} coach={coach} index={index} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function CoachCard({ coach, index }: { coach: Coach; index: number }) {
  return (
    <div
      data-testid="coach-card"
      className="bg-(--surface) border border-(--border) rounded-xl overflow-hidden card-glow card-enter flex flex-col"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Icon header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-5">
        <div className="w-12 h-12 rounded-xl bg-(--surface-elevated) border border-(--border) flex items-center justify-center">
          <CoachIcon coachId={coach.coach_id} size={28} />
        </div>
        <Link
          href={`/coaches/${coach.coach_id}`}
          className="text-xs text-(--muted) hover:text-(--foreground) px-2.5 py-1.5 rounded-md hover:bg-(--surface-elevated) transition-colors"
        >
          Settings
        </Link>
      </div>

      {/* Content */}
      <div className="px-6 pb-6 flex flex-col flex-1">
        <h2 className="font-bold text-[15px] mb-3 text-(--foreground)">{coach.display_name}</h2>
        <p className="text-(--muted) text-xs mb-5 leading-relaxed line-clamp-2">{coach.persona}</p>

        <Link
          href={`/session/${coach.coach_id}`}
          className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 bg-(--accent) hover:bg-(--accent-hover) text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <PlayIcon />
          Start Session
        </Link>
      </div>
    </div>
  );
}
