import * as http from "node:http";

export default async function globalTeardown() {
  const server = (globalThis as Record<string, unknown>).__MOCK_SERVER__ as
    | http.Server
    | undefined;
  if (server) {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    );
    console.log("[mock-server] stopped");
  }
}
