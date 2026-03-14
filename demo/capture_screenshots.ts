/**
 * Playwright screenshot capture script for ExpertLens demo video.
 * Run with: bun demo/capture_screenshots.ts
 *
 * Captures 4 screenshots of the live deployment and saves them to
 * demo/video/public/assets/ for use in the Remotion video.
 */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const BASE_URL = "https://expertlens-frontend-1085534867079.us-central1.run.app";
const OUTPUT_DIR = join(import.meta.dir, "video/public/assets");

async function capture() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  // Block WebSocket connections to prevent live session attempts
  await page.route("**/ws/**", (route) => route.abort());

  console.log("Capturing 01-dashboard.png...");
  await page.goto(`${BASE_URL}/`);
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: join(OUTPUT_DIR, "01-dashboard.png"),
    fullPage: false,
  });

  console.log("Capturing 02-create-coach.png...");
  await page.goto(`${BASE_URL}/coaches/new`);
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: join(OUTPUT_DIR, "02-create-coach.png"),
    fullPage: false,
  });

  // Find the first coach ID from the dashboard
  await page.goto(`${BASE_URL}/`);
  await page.waitForLoadState("networkidle");
  const coachLink = page.locator('a[href^="/session/"]').first();
  const href = await coachLink.getAttribute("href");
  const coachId = href?.split("/session/")[1] ?? "blender";

  console.log(`Capturing 03-session-idle.png (coach: ${coachId})...`);
  await page.goto(`${BASE_URL}/session/${coachId}`);
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: join(OUTPUT_DIR, "03-session-idle.png"),
    fullPage: false,
  });

  console.log(`Capturing 04-settings.png (coach: ${coachId})...`);
  await page.goto(`${BASE_URL}/coaches/${coachId}/settings`);
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: join(OUTPUT_DIR, "04-settings.png"),
    fullPage: false,
  });

  await browser.close();
  console.log(`\nDone. Screenshots saved to ${OUTPUT_DIR}`);
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
