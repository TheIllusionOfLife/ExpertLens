import { PreferencesForm } from "@/components/PreferencesForm";
import { getCoach } from "@/lib/api-client";
import Link from "next/link";

interface Props {
  params: Promise<{ coachId: string }>;
}

export default async function CoachSettingsPage({ params }: Props) {
  const { coachId } = await params;
  const coach = await getCoach(coachId);

  return (
    <div className="min-h-screen bg-(--background)">
      <header className="flex items-center px-8 py-5 border-b border-(--border) gap-3">
        <Link
          href={`/coaches/${coachId}`}
          className="text-(--muted) hover:text-(--foreground) text-sm transition-colors"
        >
          ← {coach.display_name}
        </Link>
        <span className="text-(--border)">/</span>
        <span className="text-sm font-medium">Settings</span>
      </header>
      <main className="px-8 py-10 max-w-xl mx-auto">
        <h1 className="text-xl font-bold mb-1">Coaching Preferences</h1>
        <p className="text-(--muted) text-sm mb-8">
          These settings apply to all sessions with {coach.display_name}.
        </p>
        <PreferencesForm coachId={coachId} initial={coach.default_preferences} />
      </main>
    </div>
  );
}
