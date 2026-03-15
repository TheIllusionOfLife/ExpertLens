// Auth utilities — localStorage-backed token/user storage.
// All functions are SSR-safe (no localStorage access at module load time).

export interface AuthUser {
  user_id: string;
  username: string;
}

export function getToken(): string | null {
  try {
    return localStorage.getItem("expertlens_token");
  } catch {
    return null;
  }
}

export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem("expertlens_user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setAuth(token: string, user: AuthUser): void {
  try {
    localStorage.setItem("expertlens_token", token);
    localStorage.setItem("expertlens_user", JSON.stringify(user));
  } catch {
    // localStorage unavailable (SSR, private mode)
  }
}

export function clearAuth(): void {
  try {
    localStorage.removeItem("expertlens_token");
    localStorage.removeItem("expertlens_user");
  } catch {
    // ignore
  }
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}
