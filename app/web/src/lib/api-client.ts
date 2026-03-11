// REST API client — placeholder for PR3 Firestore integration
import type { Coach, UserPreferences } from "@/types/coach";
import { DEMO_COACHES } from "@/types/coach";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
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
  try {
    return await apiFetch<Coach>(`/coaches/${coachId}`);
  } catch {
    const coach = DEMO_COACHES.find((c) => c.coach_id === coachId);
    if (!coach) throw new Error(`Coach not found: ${coachId}`);
    return coach;
  }
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
