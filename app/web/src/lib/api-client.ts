// REST API client — placeholder for PR3 Firestore integration
import type { Coach, UserPreferences } from "@/types/coach";
import { DEMO_COACHES } from "@/types/coach";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers as Record<string, string>),
    },
  });
  if (!res.ok) {
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
  try {
    return await apiFetch<Coach[]>("/coaches");
  } catch {
    // Fallback to demo coaches until PR3 wires up the REST API
    return DEMO_COACHES;
  }
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

export async function updatePreferences(
  coachId: string,
  prefs: Partial<UserPreferences>
): Promise<UserPreferences> {
  return apiFetch<UserPreferences>(`/preferences/${coachId}`, {
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
