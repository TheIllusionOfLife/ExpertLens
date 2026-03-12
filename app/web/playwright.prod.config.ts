/**
 * Playwright config for testing against a production Next.js build.
 *
 * IMPORTANT: NEXT_PUBLIC_* vars are baked at build time, not runtime.
 * Use `bun test:e2e:prod` which runs `build:e2e` (builds with the mock
 * API URL baked in) before starting the test server.
 *
 * Usage:
 *   bun test:e2e:prod
 */
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    // bun start serves the production build — requires `bun run build` first
    command: "NEXT_PUBLIC_API_URL=http://localhost:8099 bun start",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
