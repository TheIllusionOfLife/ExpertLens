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
      <header className="border-b border-(--border)">
        <div className="flex items-center justify-between px-8 py-5 max-w-5xl mx-auto">
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
            className="px-4 py-2 bg-(--accent) hover:bg-(--accent-hover) text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            + New Coach
          </Link>
        </div>
      </header>

      <main className="px-8 py-12 max-w-5xl mx-auto">
        {/* Hero */}
        <div className="mb-14">
          <p className="font-mono text-sm text-(--accent) tracking-[0.18em] uppercase mb-4 opacity-90">
            AI Expert Coaching
          </p>
          <h1 className="text-5xl font-black tracking-tight leading-none mb-5">Your Coaches.</h1>
          <p className="text-(--muted) text-sm max-w-sm leading-relaxed">
            Select a coach to start a live session. Share your screen, speak naturally, and get
            real-time expert guidance.
          </p>
        </div>

        {coaches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 max-w-sm mx-auto text-center">
            <div className="w-20 h-20 rounded-2xl bg-(--surface-elevated) border border-(--border) flex items-center justify-center text-4xl mb-6">
              🎯
            </div>
            <h2 className="text-xl font-semibold mb-2">No coaches yet</h2>
            <p className="text-(--muted) text-sm mb-8 leading-relaxed">
              Create your first AI coach for Blender, Affinity Photo, Unreal Engine, or any other
              desktop software.
            </p>
            <Link
              href="/coaches/new"
              className="px-5 py-2.5 bg-(--accent) hover:bg-(--accent-hover) text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              Create your first coach
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
      className="bg-(--surface) border border-(--border) rounded-xl overflow-hidden card-glow card-enter flex flex-col cursor-pointer"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Icon header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="w-12 h-12 rounded-xl bg-(--surface-elevated) border border-(--border) flex items-center justify-center text-2xl">
          {coach.icon}
        </div>
        <Link
          href={`/coaches/${coach.coach_id}`}
          className="text-xs text-(--muted) hover:text-(--foreground) px-2.5 py-1.5 rounded-md hover:bg-(--surface-elevated) transition-colors cursor-pointer"
        >
          Settings
        </Link>
      </div>

      {/* Content */}
      <div className="px-5 pb-5 flex flex-col flex-1">
        <h2 className="font-bold text-[15px] mb-2 text-(--foreground)">{coach.display_name}</h2>
        <p className="text-(--muted) text-xs mb-4 leading-relaxed line-clamp-2">{coach.persona}</p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {coach.focus_areas.slice(0, 3).map((area) => (
            <span
              key={area}
              className="text-xs px-2.5 py-0.5 bg-(--surface-elevated) border border-(--border) rounded-full text-(--muted)"
            >
              {area}
            </span>
          ))}
          {coach.focus_areas.length > 3 && (
            <span className="text-xs px-2 py-0.5 text-(--muted)">
              +{coach.focus_areas.length - 3}
            </span>
          )}
        </div>

        <Link
          href={`/session/${coach.coach_id}`}
          className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 bg-(--accent) hover:bg-(--accent-hover) text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
        >
          <PlayIcon />
          Start Session
        </Link>
      </div>
    </div>
  );
}
