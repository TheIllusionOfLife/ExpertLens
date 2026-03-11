import { PreferencesForm } from "@/components/PreferencesForm";
import { getCoach } from "@/lib/api-client";
import Link from "next/link";

interface Props {
  params: Promise<{ coachId: string }>;
}

export default async function CoachDetailPage({ params }: Props) {
  const { coachId } = await params;
  const coach = await getCoach(coachId);

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
          href={`/session/${coachId}`}
          className="px-4 py-2 bg-(--accent) hover:bg-(--accent-hover) text-white rounded-lg text-sm font-medium transition-colors"
        >
          ▶ Start Session
        </Link>
      </header>

      <main className="px-8 py-10 max-w-2xl mx-auto space-y-10">
        {/* Coach info */}
        <div className="flex items-start gap-4">
          <span className="text-4xl">{coach.icon}</span>
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
