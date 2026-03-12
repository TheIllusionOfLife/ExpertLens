import { expect, test } from "@playwright/test";

test("page title contains ExpertLens", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/ExpertLens/);
});

test("coach cards are rendered (2 cards visible)", async ({ page }) => {
  await page.goto("/");
  const cards = page.locator("[data-testid='coach-card']");
  await expect(cards).toHaveCount(2);
});

test("'+ New Coach' button links to /coaches/new", async ({ page }) => {
  await page.goto("/");
  const newCoachLink = page.getByRole("link", { name: /new coach/i });
  await expect(newCoachLink).toHaveAttribute("href", "/coaches/new");
});

test("coach card 'Start Session' href matches /session/{id}", async ({ page }) => {
  await page.goto("/");
  const sessionLink = page.locator("[data-testid='coach-card']").first().getByRole("link", {
    name: /start session/i,
  });
  await expect(sessionLink).toHaveAttribute("href", /\/session\//);
});

test("coach card 'Settings' href matches /coaches/{id}", async ({ page }) => {
  await page.goto("/");
  const settingsLink = page
    .locator("[data-testid='coach-card']")
    .first()
    .getByRole("link", { name: /settings/i });
  await expect(settingsLink).toHaveAttribute("href", /\/coaches\//);
});
