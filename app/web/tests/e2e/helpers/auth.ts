import type { Page } from "@playwright/test";

export const MOCK_TOKEN = "mock-token";
export const MOCK_USER = { user_id: "test-user-id", username: "testuser" };

export async function seedAuth(page: Page): Promise<void> {
  await page.addInitScript(
    ({ token, user }) => {
      localStorage.setItem("expertlens_token", token);
      localStorage.setItem("expertlens_user", JSON.stringify(user));
    },
    { token: MOCK_TOKEN, user: MOCK_USER },
  );
}
