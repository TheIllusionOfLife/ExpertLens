import { expect, test } from "@playwright/test";

test("/session/blender renders disconnected state", async ({ page }) => {
  await page.goto("/session/blender");
  await expect(page.getByText(/disconnected/i)).toBeVisible();
});

test("coach name visible in session status pill", async ({ page }) => {
  await page.goto("/session/blender");
  await expect(page.getByText(/blender/i)).toBeVisible();
});

test("status pill shows 'Disconnected' label", async ({ page }) => {
  await page.goto("/session/blender");
  await expect(page.getByText(/disconnected/i)).toBeVisible();
});

test("'Start Session' button is present", async ({ page }) => {
  await page.goto("/session/blender");
  await expect(page.getByRole("button", { name: /start session/i })).toBeVisible();
});

test("'← Dashboard' back link href is /", async ({ page }) => {
  await page.goto("/session/blender");
  const backLink = page.getByRole("link", { name: /dashboard/i });
  await expect(backLink).toHaveAttribute("href", "/");
});
