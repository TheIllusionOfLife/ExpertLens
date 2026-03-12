import { MOCK_SERVER_PORT, createMockServer } from "./mock-server";

/**
 * Playwright global setup: starts mock API server.
 * Returns an async teardown function — Playwright calls it automatically
 * after all tests complete (no separate globalTeardown file needed).
 */
export default async function globalSetup() {
  const server = createMockServer();
  await new Promise<void>((resolve) => server.listen(MOCK_SERVER_PORT, resolve));
  console.log(`[mock-server] listening on port ${MOCK_SERVER_PORT}`);

  return async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    );
    console.log("[mock-server] stopped");
  };
}
