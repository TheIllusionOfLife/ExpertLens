# ExpertLens

Real-time multimodal AI coaching agent. Share your screen, speak naturally, and get expert coaching for any desktop software — Blender, Affinity Photo, Unreal Engine, and more.

Built on [Gemini Live API](https://ai.google.dev/gemini-api/docs/live) for the **Gemini Live Agent Challenge**.

---

## How It Works

1. Open ExpertLens in your browser alongside your desktop app
2. Click **Share Screen** and select your application window
3. Enable your microphone
4. Ask questions or work naturally — ExpertLens watches and coaches in real time

The agent sees your screen (~1 fps), hears your voice, and responds with audio. It knows your software's shortcuts, workflows, and common pitfalls.

---

## Local Development

### Prerequisites

- Python 3.12+ with [uv](https://docs.astral.sh/uv/)
- [Bun](https://bun.sh) 1.0+
- A [Gemini API key](https://aistudio.google.com/apikey)

### Backend

```bash
# 1. Install dependencies
uv sync

# 2. Copy and fill in your API key
cp .env.example .env
# Edit .env: set GEMINI_API_KEY=<your-key>

# 3. Start the API server
uv run uvicorn app.api.main:app --reload --port 8000

# 4. Verify
curl http://localhost:8000/health
# → {"status":"ok","model":"gemini-2.5-flash-live-preview"}
```

### Frontend

```bash
cd app/web

# 1. Install dependencies
bun install

# 2. Start the dev server
bun run dev

# 3. Open http://localhost:3000
```

### Seed Demo Coaches (optional, requires GCP Firestore)

```bash
# Set GCP_PROJECT_ID in .env, then:
uv run python scripts/seed_firestore.py
```

Without Firestore, the app falls back to default preferences and hardcoded knowledge — the core live coaching session still works.

---

## Cloud Deployment (GCP)

### Prerequisites

- GCP project with billing enabled
- `gcloud` CLI authenticated: `gcloud auth login`
- `terraform` CLI 1.6+
- Docker

### One-Command Deploy

```bash
# 1. Load your Gemini API key into Secret Manager
gcloud secrets create gemini-api-key --project=<project_id>
gcloud secrets versions add gemini-api-key \
  --project=<project_id> \
  --data-file=- <<< "$GEMINI_API_KEY"

# 2. Deploy everything
./infra/deploy.sh <project_id>

# This will:
# - Build and push backend + frontend Docker images
# - Provision Cloud Run, Firestore, Storage, Secret Manager via Terraform
# - Wire inter-service URLs and confirm health
```

### After Deploy

```bash
# Seed coaches and knowledge into Firestore
GCP_PROJECT_ID=<project_id> uv run python scripts/seed_firestore.py

# Deploy Firestore composite indexes
firebase deploy --only firestore:indexes
# Or: gcloud firestore indexes create --project=<project_id>
```

---

## Architecture

```
User's Browser
  ├─ getDisplayMedia() → JPEG frames @ ~1fps
  ├─ getUserMedia()    → PCM 16kHz mono audio
  └─ AudioContext      ← PCM 24kHz playback
        │ WebSocket (binary: tagged frames up + audio down)
        │ JSON text (control: start/end/reconnect/handle)
        ▼
Cloud Run — FastAPI Backend
  ├─ WebSocket Handler  (browser ↔ Gemini proxy)
  ├─ System Instruction (persona + preferences + curated knowledge)
  └─ Gemini Live API Session
       ├─ contextWindowCompression (SlidingWindow) — unlimited session duration
       ├─ sessionResumption (handle-based) — survives ~10min WebSocket rotation
       ├─ Native barge-in (VAD) — interrupt Gemini mid-response
       └─ NON_BLOCKING tool calls (WHEN_IDLE) — no audio pause
            │
            ▼
GCP Services
  ├─ Firestore  — coach profiles, user preferences, session history, knowledge
  ├─ Storage    — demo assets
  └─ Secret Manager — GEMINI_API_KEY
```

**Grounding strategy (two-layer):**
1. **Context stuffing** — Curated shortcuts, workflows, and common errors pre-loaded into system instruction at session start. Zero latency.
2. **Firestore fallback** — `get_coach_knowledge(topic)` tool for deeper queries not covered by context.

---

## WebSocket Protocol

The browser connects to `wss://{host}/ws/session/{coach_id}` (production) or `ws://localhost:8000/ws/session/{coach_id}` (local dev).

### Binary Frames (media)

Binary frames use a 1-byte tag prefix followed by the payload:

| Tag | Value | Content |
|-----|-------|---------|
| `MEDIA_TAG_IMAGE` | `0x01` | JPEG frame (max 2 MB), sent at ~1 fps |
| `MEDIA_TAG_AUDIO` | `0x02` | PCM 16-bit 16 kHz mono chunk (max 64 KB) |

Audio output from the agent is also delivered as binary frames with `MEDIA_TAG_AUDIO`.

### Text Frames (control messages)

JSON control messages flow both directions:

| Type | Direction | Description |
|------|-----------|-------------|
| `start_session` | client -> server | Begin session; optionally include `session_handle` for reconnect |
| `end_session` | client -> server | Gracefully end session |
| `session_started` | server -> client | Session confirmed; includes `session_id` |
| `session_handle` | server -> client | Latest resumption handle (save for reconnect) |
| `reconnecting` | server -> client | GoAway received; reconnect in progress |
| `reconnected` | server -> client | Reconnection successful |
| `interrupted` | server -> client | Agent turn interrupted by user barge-in |
| `error` | server -> client | Session error with `message` field |

---

## Demo Coaches

| Coach | Software | Persona |
|-------|----------|---------|
| Blender Expert | Blender 3D | Concise expert, shortcuts-first |
| Affinity Photo Expert | Affinity Photo | Calm mentor, build confidence |
| Unreal Engine Expert | Unreal Engine 5 | Technical guide, blueprint focus |

---

## Project Structure

```
app/api/          — FastAPI backend
  ws/             — WebSocket handler + Gemini Live session
  db/             — Firestore CRUD layer
  routers/        — REST API (coaches, preferences, sessions)
app/web/          — Next.js 15 frontend
agent/
  prompts/        — System instruction builder + coach templates
  tools/          — Firestore-backed agent tools
data/
  coach_profiles/ — Coach definitions (JSON)
  seed_sources/   — Curated knowledge (Markdown)
infra/
  terraform/      — GCP infrastructure as code
  deploy.sh       — One-command deployment
scripts/          — seed_firestore.py, test scripts
demo/             — Video script, deployment notes
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Gemini API key from AI Studio |
| `GCP_PROJECT_ID` | No | GCP project ID (Firestore; auto-detected on Cloud Run) |
| `GEMINI_LIVE_MODEL` | No | Defaults to `gemini-2.5-flash-live-preview` |
| `CORS_ORIGINS` | No | Defaults to `http://localhost:3000` |

---

## Hackathon

**Competition:** [Gemini Live Agent Challenge](https://googleai.devpost.com/)
**Category:** Live Agents
**Deadline:** March 16, 2026
