import { expect, test } from "@playwright/test";

// Reset mock server state before each test so davinciPollCount starts at 0
test.beforeEach(async ({ request }) => {
  await request.post("http://localhost:8099/__reset");
});

test("/coaches/new renders software option grid (8 presets)", async ({ page }) => {
  await page.goto("/coaches/new");
  // Each preset is a button in the software grid
  const presetButtons = page.locator("form button[type='button']");
  await expect(presetButtons).toHaveCount(8); // blender, affinity, unreal, davinci, figma, fusion, zbrush, other
});

test("clicking a preset highlights it with active styling", async ({ page }) => {
  await page.goto("/coaches/new");
  const blenderBtn = page.getByRole("button", { name: /blender/i });
  await blenderBtn.click();
  // Active button gets border-(--accent) class
  await expect(blenderBtn).toHaveClass(/border-\(--accent\)/);
});

test("submitting form redirects to coach detail page", async ({ page }) => {
  await page.goto("/coaches/new");
  // Select DaVinci Resolve (mock POST returns davinci_resolve coach)
  await page.getByRole("button", { name: /davinci/i }).click();
  await page.getByRole("button", { name: /create coach/i }).click();
  await expect(page).toHaveURL(/\/coaches\/davinci_resolve/);
});

test("detail page shows 'Building knowledge base' banner after creation", async ({ page }) => {
  // Navigate directly to davinci_resolve detail — mock starts at 'building'
  await page.goto("/coaches/davinci_resolve");
  await expect(page.getByText(/building knowledge base/i)).toBeVisible();
});

test("banner disappears after polling resolves status to ready", async ({ page }) => {
  await page.goto("/coaches/davinci_resolve");
  // Banner should disappear once mock transitions to 'ready' (after 2 polls at 3s each)
  await expect(page.getByText(/building knowledge base/i)).not.toBeVisible({
    timeout: 15_000,
  });
});

test("Start Session button is disabled while status=building", async ({ page }) => {
  // beforeEach reset ensures davinciPollCount=0, so first response is 'building'
  await page.goto("/coaches/davinci_resolve");
  const startBtn = page.getByRole("link", { name: /start session/i });
  // Button has opacity-50 and pointer-events-none while building
  await expect(startBtn).toHaveAttribute("aria-disabled", "true");
});

test("Start Session is enabled once status=ready", async ({ page }) => {
  await page.goto("/coaches/blender"); // blender is always 'ready'
  const startBtn = page.getByRole("link", { name: /start session/i });
  await expect(startBtn).not.toHaveAttribute("aria-disabled", "true");
  await expect(startBtn).toHaveAttribute("href", "/session/blender");
});
