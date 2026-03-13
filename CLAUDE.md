# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ExpertLens is a **Gemini Live Agent** for the Gemini Live Agent Challenge hackathon. It's a multimodal AI expert that watches your screen, listens to your voice, and coaches you in real-time for any desktop software (Blender, Affinity Photo, Unreal Engine, etc.).

**Category:** Live Agents (real-time audio/vision interaction, not GUI automation)

**Key distinction:** ExpertLens coaches users who control native desktop apps themselves. It does NOT control apps — that's the UI Navigator category. Browser-based apps are out of scope.

## Architecture

```
User's Machine
  ├─ Native Desktop App (Blender, Affinity Photo, Unreal Engine, etc.)
  └─ Browser (ExpertLens UI)
       ├─ getDisplayMedia() → captures app window
       ├─ getUserMedia() → microphone
       └─ Audio playback ← speaker
             │ WebSocket (frames + audio up, audio down)
             ▼
Cloud Run (FastAPI + ADK)
  ├─ WebSocket Handler (browser ↔ Gemini proxy, barge-in handling)
  ├─ ADK Agent: Live Software Expert
  │    ├─ System Instruction (persona + preferences + curated knowledge)
  │    └─ Tools: get_coach_knowledge(topic), get_user_preferences(user_id)
  └─ Gemini Live API Session (gemini-2.5-flash-live-preview)
       ├─ contextWindowCompression (SlidingWindow) → unlimited session
       ├─ sessionResumption (handle-based reconnect)
       ├─ Native barge-in (VAD)
       └─ NON_BLOCKING tool calling (WHEN_IDLE)
             │
             ▼
GCP Services
  ├─ Firestore (coach profiles, user prefs, sessions, fallback knowledge)
  ├─ Cloud Storage (curated docs, demo assets)
  └─ Secret Manager (API keys)
```

**Two-layer design:**
1. **Coach Builder** — Generates software-specific expert coaches (knowledge + persona + style)
2. **Live Coaching Runtime** — Real-time screen+voice session using Gemini Live API via ADK

## Grounding Strategy

- **Primary: Context Stuffing** — Curated knowledge loaded into System Instruction at session start. 0ms additional latency.
- **Fallback: Firestore Tool** — `get_coach_knowledge(topic)` for deeper queries not in context. ~100-200ms.

## Planned Repository Structure

```
app/web/          — Next.js frontend
app/api/          — FastAPI backend (Python)
agent/runtime/    — ADK agent runtime
agent/tools/      — Agent tools (knowledge retrieval, preferences)
agent/prompts/    — System prompts per coach
infra/terraform/  — Terraform IaC
infra/            — cloudbuild.yaml, deploy.sh
data/seed_sources/    — Documentation sources
data/coach_profiles/  — Coach profile definitions
scripts/          — build_coach.py, ingest_docs.py, eval_sessions.py
demo/             — Architecture diagram, deployment recording, video script
```

## Key Technical Decisions

- **Python FastAPI + ADK** (ADK is a Python SDK — no Node.js)
- **Gemini Live API** model: `gemini-2.5-flash-live-preview` (gemini-2.0-flash-live is deprecated)
- **Python SDK**: `google-genai` (`pip install google-genai`) — NOT the legacy `google-generativeai`
- **Context stuffing** over pgvector/Cloud SQL (fastest grounding, zero latency)
- **Firestore** for fallback knowledge + all metadata (no separate vector DB)
- Grounding is essential — judging criteria includes hallucination avoidance

## Critical Live API Constraints

- **2-min limit with images**: ANY image frame triggers "audio+video" mode (2-min limit). MUST enable `contextWindowCompression` with `SlidingWindow` to extend indefinitely.
- **WebSocket ~10min limit**: Connection drops after ~10min. Use `sessionResumption` with `new_handle` to reconnect (handle valid 2 hours). Server sends `GoAway` before termination.
- **Context window**: 128k tokens (native audio models). System Instruction knowledge fits ~50-70 pages.
- **Screen frames**: Send as `image/jpeg` at ~1fps, resized to 768x768, via `realtime_input.media_chunks`.
- **Audio**: Input PCM 16-bit 16kHz mono, Output 24kHz.
- **Tool calling**: Use `NON_BLOCKING` mode with `scheduling='WHEN_IDLE'` to avoid pausing audio.
- **Response modality**: Only ONE allowed per session — `AUDIO` or `TEXT`, not both.

## Agent Design

**Primary Agent:** Live Software Expert Agent
- System Instruction loaded at session start with: persona, response policy, user preferences, curated knowledge
- **Tool 1:** `get_coach_knowledge(topic)` — Firestore fallback for deep queries
- **Tool 2:** `get_user_preferences(user_id)` — Firestore fallback for mid-session preference changes

**Response template:** (1) What's visible on screen → (2) Problem/action → (3) Next step. Max 3 sentences initially.

## Data Models

- **Coach**: coach_id, software_name, persona, focus_areas, default_preferences, knowledge_index_id
- **User Preferences**: interaction style, tone, depth, proactivity (per-coach overrides supported)
- **Session**: session_id, coach_id, summary, last_topics

## GCP Services

Cloud Run, Firestore, Cloud Storage, Secret Manager, Cloud Build, Artifact Registry, Cloud Logging

## Demo Targets

3 native desktop apps: **Blender**, **Affinity Photo**, **Unreal Engine**

## Current Status

Core implementation complete. All major components shipped:
- **Backend**: FastAPI REST API (`app/api/`) with Firestore persistence, coach management, and knowledge builder
- **Frontend**: Next.js web app (`app/web/`) with real-time session UI, screen/mic capture, and coach management
- **Agent Runtime**: ADK-based Gemini Live agent (`agent/`) with context stuffing and fallback knowledge retrieval
- **Infrastructure**: Terraform IaC (`infra/terraform/`) and Cloud Build pipeline
- **Tests**: Pytest unit/integration tests + Playwright E2E test suite
