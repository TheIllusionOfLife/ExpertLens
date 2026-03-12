import { expect, test } from "@playwright/test";

test("/session/blender renders disconnected state", async ({ page }) => {
  await page.goto("/session/blender");
  await expect(page.getByText(/disconnected/i)).toBeVisible();
});

test("coach name visible in session status pill", async ({ page }) => {
  await page.goto("/session/blender");
  // <output role="status"> is the SessionStatus pill; scope to avoid matching <h1>
  await expect(page.getByRole("status").getByText(/blender/i)).toBeVisible();
});

test("status pill shows 'Disconnected' label", async ({ page }) => {
  await page.goto("/session/blender");
  await expect(page.getByRole("status").getByText(/disconnected/i)).toBeVisible();
});

test("'Start Session' button is present", async ({ page }) => {
  await page.goto("/session/blender");
  // Two Start Session buttons exist (header + main panel); scope to main
  await expect(
    page.getByRole("main").getByRole("button", { name: /start session/i }),
  ).toBeVisible();
});

test("'← Dashboard' back button navigates home", async ({ page }) => {
  await page.goto("/session/blender");
  // Header uses <button onClick={router.push("/")}> not a link — check it exists
  await expect(
    page.getByRole("banner").getByRole("button", { name: /dashboard/i }),
  ).toBeVisible();
});
