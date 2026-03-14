# Devpost Submission — ExpertLens

Copy-paste fields for the Devpost submission form.

---

## Project Name

ExpertLens

---

## Tagline

Real-time AI coaching for any software only you can operate — desktop, mobile, or anything in between.

---

## Demo Video

[PLACEHOLDER — add YouTube/Vimeo URL after upload]

---

## Try It Out

https://expertlens-frontend-pk4kcjevqa-uc.a.run.app/

---

## GitHub Repo

https://github.com/TheIllusionOfLife/ExpertLens

---

## GDG Profile

https://gdg.community.dev/u/m8ayg6

---

## Blog Post URL

[PLACEHOLDER — add after publishing on Medium/dev.to]

---

## Built With

Gemini Live API (gemini-2.5-flash-native-audio-latest), Gemini 3 Flash Preview (knowledge builder), Google ADK, FastAPI, Next.js 15, Cloud Run, Firestore, Cloud Storage, Secret Manager, Cloud Build, Terraform, Playwright

---

## Inspiration

Browser apps can be automated with Playwright. CLI tools can be called directly by LLMs. But most software that people use every day — Blender, Affinity Photo, Unreal Engine, complex mobile apps, professional tools — has no programmatic interface. The mouse, keyboard, or touchscreen is the only way in, and only the human can use it. AI cannot operate these applications on your behalf.

ExpertLens was built for this space. It watches your screen or camera, listens to your voice, and advises you so you can control the application better. You stay in the driver's seat. The AI accelerates your mastery.

---

## What It Does

ExpertLens is a real-time AI coaching agent for any software where the human is the operator:

- **Multimodal capture**: On desktop and Android, the browser captures your screen via `getDisplayMedia()`. On iOS Safari, it uses the rear camera via `getUserMedia()` — point it at your screen or device. Both paths feed JPEG frames at ~1fps to the Gemini Live agent.
- **Live voice coaching**: Speak naturally while you work. The agent sees what you're doing, hears your question, and responds in audio — in real time, with native barge-in (VAD).
- **Curated knowledge**: Each coach has software-specific knowledge loaded into the system instruction at session start — Blender 4.x breaking changes, Affinity Photo layer shortcuts, Unreal Engine Blueprint patterns. Zero additional latency.
- **User preferences**: Interaction style (shortcuts-first vs. mouse-guided), tone (concise expert vs. calm mentor), response depth, and proactivity — all injected into every session.
- **Cross-session memory**: Session transcripts are summarized and stored in Firestore keyed by user and coach. The next session loads this history; the coach picks up where you left off.
- **Coach Builder**: Create a custom coach for any software. The name is validated via Gemini 3 Flash + Google Search grounding before building a six-section knowledge base (shortcuts, workflows, common errors, deep concepts, version changes, quick reference).

---

## How We Built It

**Backend:** FastAPI on Cloud Run, Python ADK for the Gemini Live agent runtime. WebSocket handler proxies browser ↔ Gemini Live session with barge-in handling and session resumption.

**Frontend:** Next.js 15. Uses `getDisplayMedia()` for screen capture (desktop/Android) and `getUserMedia()` for camera capture (iOS). JPEG frames at ~1fps sent as tagged binary WebSocket frames. Full coach management UI (create, edit, delete, rebuild knowledge).

**Grounding:** Context stuffing as primary strategy (zero latency). Firestore `get_coach_knowledge` tool as fallback (~150ms). No vector database.

**Knowledge builder:** `gemini-3-flash-preview` with `ThinkingConfig(thinking_level=MINIMAL)` and Google Search grounding. Generates six structured sections per coach. Knowledge errors surface in the UI with exception detail for debugging.

**Session persistence:** `contextWindowCompression` with `SlidingWindow` for unlimited session duration (bypasses 2-minute image session limit). `sessionResumption` with handle-based reconnect for ~10-minute WebSocket rotation.

**Memory pipeline:** Coach transcript accumulated in handler, summarized via `gemini-2.0-flash` with structured JSON output at session end, stored in Firestore under `user_id` + `coach_id`, injected as "Previous Session Notes" at next session start.

**Infrastructure:** Terraform IaC for Cloud Run, Firestore, Cloud Storage, Secret Manager, Artifact Registry. Cloud Build trigger on `main` push with dedicated least-privilege SA — every merge auto-deploys both services and persists CORS configuration.

---

## Challenges

**The 2-minute image session limit.** Any image frame triggers audio+video mode, which has a 2-minute hard limit. Solution: `contextWindowCompression` with `SlidingWindow`. Without this, every screen-sharing session silently terminates.

**The ~10-minute WebSocket timeout.** Gemini Live WebSocket connections drop after ~10 minutes. Solution: `sessionResumption` with the handle stored server-side on every `new_handle` event. The client reconnects seamlessly on `GoAway`.

**Zero-latency grounding.** RAG adds 200–500ms per query — perceptible in live voice conversation. Solution: context stuffing. All curated knowledge loaded into system instruction before the session starts.

**Non-blocking tool calls.** ADK tool calls pause audio by default. Solution: `NON_BLOCKING` mode with `scheduling='WHEN_IDLE'` — tools execute between turns without interrupting the voice stream.

**Mobile capture.** iOS Safari does not support `getDisplayMedia`. Solution: detect `getDisplayMedia` availability at runtime and fall back to `getUserMedia` with `facingMode: "environment"` (rear camera). The same agent pipeline handles both paths.

---

## Accomplishments

- Sessions running 30+ minutes via SlidingWindow contextWindowCompression — no 2-minute cutoffs
- Cross-session memory with less than 1 second of added session-start latency (1s Firestore timeout, graceful fallback)
- Seamless reconnection on WebSocket rotation — users see "Reconnecting…" for ~2 seconds and continue
- Mobile support: screen share on desktop/Android, camera capture on iOS — same agent, same pipeline
- Six-section knowledge builder with Google Search grounding and visible error diagnostics
- Fully automated CD: push to main → Cloud Build trigger → both services deployed, CORS set

---

## What We Learned

**Gemini Live API is production-ready for this use case.** The native barge-in (VAD), session resumption, and SlidingWindow compression all work reliably. The constraints (2-min image limit, 10-min WebSocket limit) are well-documented once you know to look for them.

**Context stuffing beats RAG for latency-sensitive grounding.** A 128k context window fits 50–70 pages of curated content. For a domain-specific coaching agent, this is more than enough — and the latency difference (0ms vs. 150ms+) matters in a live voice conversation.

**Session resumption must be designed in from day one.** It cannot be retrofitted. The handle needs to be stored on every `new_handle` event and plumbed through the reconnect path — this touches the WebSocket handler, the session store, and the client protocol simultaneously.

**The mobile gap is real.** iOS cannot share the screen from a browser. But pointing a rear camera at a physical device or external screen is a genuinely useful interaction — and it's the same coaching pipeline with no changes on the agent side.

---

## What's Next

**On-screen annotation.** The coach could overlay visual highlights on the user's screen share — "click this button" with a coordinate-based overlay. Requires a second WebSocket channel and a browser overlay component.

**Coach sharing.** A public coach directory where users can publish and discover custom coaches for niche software — a DaVinci Resolve expert built by one user that benefits everyone.
