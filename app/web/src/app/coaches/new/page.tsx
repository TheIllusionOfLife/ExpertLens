import { CreateCoachForm } from "@/components/CreateCoachForm";
import Link from "next/link";

export default function NewCoachPage() {
  return (
    <div className="min-h-screen bg-[--background]">
      <header className="flex items-center px-8 py-5 border-b border-[--border]">
        <Link
          href="/"
          className="text-[--muted] hover:text-[--foreground] text-sm transition-colors mr-4"
        >
          ← Back
        </Link>
        <h1 className="text-lg font-semibold">Create New Coach</h1>
      </header>
      <main className="px-8 py-10 max-w-xl mx-auto">
        <p className="text-[--muted] text-sm mb-8">
          Choose the desktop software you want to be coached in. ExpertLens will build a specialized
          expert with curated knowledge for that app.
        </p>
        <CreateCoachForm />
      </main>
    </div>
  );
}
