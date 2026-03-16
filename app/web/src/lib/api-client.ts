import type { Coach, UserPreferences } from "@/types/coach";
import { clearAuth, getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers as Record<string, string>),
    },
  });
  if (!res.ok) {
    if (res.status === 401) {
      const text = await res.text();
      let detail: string | undefined;
      try {
        const json = JSON.parse(text);
        detail = json.detail as string | undefined;
      } catch {
        // Not JSON
      }
      clearAuth();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
      throw new Error(detail ?? "Unauthorized");
    }
    const text = await res.text();
    let detail: string | undefined;
    try {
      const json = JSON.parse(text);
      detail = json.detail as string | undefined;
    } catch {
      // Not JSON — fall through to generic error
    }
    throw new Error(detail ?? `API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function getCoaches(): Promise<Coach[]> {
  return apiFetch<Coach[]>("/coaches");
}

export async function getCoach(coachId: string): Promise<Coach> {
  return apiFetch<Coach>(`/coaches/${coachId}`);
}

export async function createCoach(data: Partial<Coach>): Promise<Coach> {
  return apiFetch<Coach>("/coaches", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getPreferences(): Promise<UserPreferences> {
  return apiFetch<UserPreferences>("/preferences");
}

export async function updatePreferences(prefs: Partial<UserPreferences>): Promise<UserPreferences> {
  return apiFetch<UserPreferences>("/preferences", {
    method: "PUT",
    body: JSON.stringify(prefs),
  });
}

export async function deleteCoach(coachId: string): Promise<void> {
  await apiFetch<{ ok: boolean }>(`/coaches/${coachId}`, { method: "DELETE" });
}

export async function rebuildKnowledge(coachId: string): Promise<void> {
  await apiFetch<{ status: string }>(`/coaches/${coachId}/rebuild-knowledge`, { method: "POST" });
}

export async function updateCoach(
  coachId: string,
  updates: Partial<Pick<Coach, "display_name" | "icon" | "persona">>
): Promise<Coach> {
  return apiFetch<Coach>(`/coaches/${coachId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  username: string;
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function register(username: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}
