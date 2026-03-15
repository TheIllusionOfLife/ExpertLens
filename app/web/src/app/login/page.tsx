"use client";

import { login, register } from "@/lib/api-client";
import { clearAuth, isAuthenticated, setAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fn = mode === "login" ? login : register;
      const data = await fn(username, password);
      setAuth(data.access_token, { user_id: data.user_id, username: data.username });
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-(--background) flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold tracking-tight">
            Expert<span className="text-(--accent)">Lens</span>
          </span>
        </div>

        <div className="bg-(--surface) border border-(--border) rounded-xl p-8">
          <h1 className="text-lg font-semibold mb-6">
            {mode === "login" ? "Log in" : "Create account"}
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-sm text-(--muted)">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="px-3 py-2 bg-(--surface-elevated) border border-(--border) rounded-lg text-sm focus:outline-none focus:border-(--accent)"
                required
                autoComplete="username"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm text-(--muted)">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-3 py-2 bg-(--surface-elevated) border border-(--border) rounded-lg text-sm focus:outline-none focus:border-(--accent)"
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 px-4 py-2.5 bg-(--accent) hover:bg-(--accent-hover) text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {loading ? "Please wait..." : mode === "login" ? "Log in" : "Register"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-(--muted)">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
              className="text-(--accent) hover:underline"
            >
              {mode === "login" ? "Register" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
