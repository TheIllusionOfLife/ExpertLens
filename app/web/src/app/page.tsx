import { getCoaches } from "@/lib/api-client";
import type { Coach } from "@/types/coach";
import Link from "next/link";

export default async function DashboardPage() {
  let coaches: Coach[] = [];
  try {
    coaches = await getCoaches();
  } catch {
    // fallback handled in api-client
  }

  return (
    <div className="min-h-screen bg-[--background]">
      {/* Nav */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-[--border]">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-[--foreground]">ExpertLens</span>
          <span className="text-xs px-2 py-0.5 bg-[--accent]/20 text-[--accent] rounded-full font-medium">
            Beta
          </span>
        </div>
        <Link
          href="/coaches/new"
          className="px-4 py-2 bg-[--accent] hover:bg-[--accent-hover] text-white rounded-lg text-sm font-medium transition-colors"
        >
          + New Coach
        </Link>
      </header>

      <main className="px-8 py-10 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Coaches</h1>
          <p className="text-[--muted] text-sm">
            Select a coach to start a live session. Share your screen and speak naturally.
          </p>
        </div>

        {coaches.length === 0 ? (
          <div className="text-center py-20 text-[--muted]">
            <p className="text-4xl mb-4">🎯</p>
            <p className="text-lg font-medium mb-2">No coaches yet</p>
            <p className="text-sm mb-6">
              Create your first AI coach for Blender, Affinity Photo, or Unreal Engine
            </p>
            <Link
              href="/coaches/new"
              className="px-5 py-2.5 bg-[--accent] hover:bg-[--accent-hover] text-white rounded-lg text-sm font-medium transition-colors"
            >
              Create a Coach
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coaches.map((coach) => (
              <CoachCard key={coach.coach_id} coach={coach} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function CoachCard({ coach }: { coach: Coach }) {
  return (
    <div className="bg-[--surface] border border-[--border] rounded-xl p-5 hover:border-[--accent]/40 transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{coach.icon}</span>
        <Link
          href={`/coaches/${coach.coach_id}`}
          className="text-xs text-[--muted] hover:text-[--foreground] transition-colors"
        >
          Settings
        </Link>
      </div>
      <h2 className="font-semibold text-base mb-1">{coach.display_name}</h2>
      <p className="text-[--muted] text-xs mb-4 leading-relaxed line-clamp-2">{coach.persona}</p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {(coach.focus_areas ?? []).slice(0, 3).map((area) => (
          <span
            key={area}
            className="text-xs px-2 py-0.5 bg-[--surface-elevated] border border-[--border] rounded-full text-[--muted]"
          >
            {area}
          </span>
        ))}
        {(coach.focus_areas?.length ?? 0) > 3 && (
          <span className="text-xs px-2 py-0.5 text-[--muted]">
            +{(coach.focus_areas?.length ?? 0) - 3}
          </span>
        )}
      </div>
      <Link
        href={`/session/${coach.coach_id}`}
        className="block w-full text-center py-2 bg-[--accent]/10 hover:bg-[--accent]/20 border border-[--accent]/20 text-[--accent] rounded-lg text-sm font-medium transition-colors group-hover:bg-[--accent]/20"
      >
        ▶ Start Session
      </Link>
    </div>
  );
}
