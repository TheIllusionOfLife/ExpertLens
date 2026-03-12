/**
 * Lightweight Node.js HTTP mock server for E2E tests.
 * Runs on port 8099 to serve as NEXT_PUBLIC_API_URL.
 */

import * as http from "node:http";

const BLENDER_COACH = {
  coach_id: "blender",
  software_name: "blender",
  display_name: "Blender Expert",
  persona: "Concise expert who always leads with keyboard shortcuts",
  focus_areas: ["Modeling", "UV Unwrapping", "Materials"],
  icon: "🎨",
  knowledge_status: "ready",
  knowledge_error: "",
  knowledge_updated_at: "2026-01-01T00:00:00",
  knowledge_index_id: "",
  default_preferences: {
    interaction_style: "shortcuts",
    tone: "concise_expert",
    depth: "medium",
    proactivity: "reactive",
    response_language: "english",
  },
};

// davinci_resolve starts "building" and transitions to "ready" after 2 polls
let davinciPollCount = 0;

const DAVINCI_COACH = () => ({
  coach_id: "davinci_resolve",
  software_name: "davinci_resolve",
  display_name: "DaVinci Resolve Expert",
  persona: "Expert coach for DaVinci Resolve",
  focus_areas: ["Color Grading", "Editing"],
  icon: "🎯",
  knowledge_status: davinciPollCount >= 2 ? "ready" : "building",
  knowledge_error: "",
  knowledge_updated_at: "2026-01-01T00:00:00",
  knowledge_index_id: "",
  default_preferences: {
    interaction_style: "shortcuts",
    tone: "concise_expert",
    depth: "medium",
    proactivity: "reactive",
    response_language: "english",
  },
});

function json(res: http.ServerResponse, status: number, data: unknown): void {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body);
}

export function resetDavinciPollCount(): void {
  davinciPollCount = 0;
}

export function createMockServer(): http.Server {
  davinciPollCount = 0;

  return http.createServer((req, res) => {
    const url = req.url ?? "/";
    const method = req.method ?? "GET";

    // CORS preflight
    if (method === "OPTIONS") {
      res.writeHead(204, { "Access-Control-Allow-Origin": "*" });
      res.end();
      return;
    }

    // Test-only reset endpoint: resets per-test mutable state
    if (method === "POST" && url === "/__reset") {
      davinciPollCount = 0;
      json(res, 200, { reset: true });
      return;
    }

    // GET /coaches
    if (method === "GET" && url === "/coaches") {
      json(res, 200, [BLENDER_COACH, DAVINCI_COACH()]);
      return;
    }

    // GET /coaches/blender
    if (method === "GET" && url === "/coaches/blender") {
      json(res, 200, BLENDER_COACH);
      return;
    }

    // GET /coaches/davinci_resolve — simulates polling: building → ready
    if (method === "GET" && url === "/coaches/davinci_resolve") {
      davinciPollCount++;
      json(res, 200, DAVINCI_COACH());
      return;
    }

    // POST /coaches
    if (method === "POST" && url === "/coaches") {
      json(res, 201, DAVINCI_COACH());
      return;
    }

    // POST /coaches/*/rebuild-knowledge
    if (method === "POST" && /^\/coaches\/[^/]+\/rebuild-knowledge$/.test(url)) {
      json(res, 202, { status: "building" });
      return;
    }

    // Fallback 404
    json(res, 404, { detail: "Not found" });
  });
}

export const MOCK_SERVER_PORT = 8099;
