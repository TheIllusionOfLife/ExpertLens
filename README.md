# ExpertLens

Real-time multimodal AI coaching agent. Share your screen or point your camera, speak naturally, and get expert coaching for any software you control directly — Blender, Affinity Photo, Unreal Engine, mobile apps, and more.

Built on [Gemini Live API](https://ai.google.dev/gemini-api/docs/live) for the **Gemini Live Agent Challenge**.

**Live:** https://expertlens-frontend-pk4kcjevqa-uc.a.run.app

---

## The Idea

AI can automate browser apps with Playwright. AI can run CLI tools directly. But for the rest of software — desktop apps, mobile apps, professional tools — the human is the only operator. There is no API. The keyboard, mouse, or touchscreen is the only way in.

ExpertLens coaches you inside that space. It watches what you're doing and advises you on how to do it better. You stay in control. The AI makes you faster.

---

## How It Works

**Desktop / Android:**
1. Open ExpertLens in your browser alongside your app
2. Click **Share Screen** and select your application window
3. Enable your microphone
4. Ask questions or work naturally — ExpertLens watches and coaches in real time

**iOS / Mobile:**
1. Open ExpertLens in Safari
2. Point your camera at your screen or device
3. Enable your microphone and start coaching

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
# → {"status":"ok","model":"gemini-2.5-flash-native-audio-latest"}
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

### First Deploy

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

### After First Deploy

```bash
# Seed coaches and knowledge into Firestore
GCP_PROJECT_ID=<project_id> uv run python scripts/seed_firestore.py

# Deploy Firestore composite indexes
firebase deploy --only firestore:indexes
```

### Continuous Deployment

After the first deploy, every push to `main` automatically builds and deploys both services via Cloud Build. No manual steps needed — the Cloud Build trigger is provisioned by the same `terraform apply` that handles the initial infrastructure.

See `infra/terraform/cloudbuild.tf` for the trigger and IAM configuration.

---

## Architecture

![Architecture](demo/architecture.png)

**Grounding strategy (two-layer):**
1. **Context stuffing** — Curated shortcuts, workflows, and common errors pre-loaded into system instruction at session start. Zero latency.
2. **Firestore fallback** — `get_coach_knowledge(topic)` tool for deeper queries not covered by context.

**Capture strategy:**
- **Desktop / Android Chrome**: `getDisplayMedia()` — full screen or window capture
- **iOS Safari**: `getUserMedia()` — rear camera capture, point at screen or device

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

You can create a coach for any software using the Coach Builder.

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
  terraform/      — GCP infrastructure as code (including CD trigger)
  cloudbuild.yaml — CI/CD pipeline (auto-deploys on push to main)
  deploy.sh       — One-command initial deployment
scripts/          — seed_firestore.py, test scripts
demo/             — Video script, blog post, submission docs
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Gemini API key from AI Studio |
| `JWT_SECRET_KEY` | Yes | Secret for signing JWTs (min 32 chars, no placeholders) |
| `GCP_PROJECT_ID` | No | GCP project ID (Firestore; auto-detected on Cloud Run) |
| `GEMINI_LIVE_MODEL` | No | Defaults to `gemini-2.5-flash-native-audio-latest` |
| `CORS_ORIGINS` | No | Defaults to `http://localhost:3000` |
| `ENABLE_API_DOCS` | No | Set to `true` to enable `/docs` and `/redoc` endpoints |

---

## Testing

**Live instance:** https://expertlens-frontend-pk4kcjevqa-uc.a.run.app

Test credentials: `testuser` / `testpass123`

Log in, select a coach, start a session, share your screen, and speak naturally. The coach responds in real-time audio.

### Running Tests Locally

```bash
# Backend tests
uv run pytest tests/ -q

# Frontend lint + typecheck
(cd app/web && bun run lint && bun run typecheck)

# E2E tests (requires both services running)
(cd app/web && bun run test:e2e)
```

---

## Hackathon

**Competition:** [Gemini Live Agent Challenge](https://googleai.devpost.com/)
**Category:** Live Agents
**Deadline:** March 16, 2026
