# Devpost Submission — ExpertLens

Copy-paste fields for the Devpost submission form.

---

## Project Name

ExpertLens

---

## Tagline

The AI coach for desktop software you cannot automate — Blender, Affinity Photo, Unreal Engine, and more.

---

## Demo Video

[PLACEHOLDER — add YouTube/Vimeo URL after upload]

---

## Try It Out

https://expertlens-frontend-1085534867079.us-central1.run.app/

---

## GitHub Repo

[PLACEHOLDER — add after making repo public]

---

## GDG Profile

https://gdg.community.dev/u/m8ayg6

---

## Blog Post URL

[PLACEHOLDER — add after publishing on Medium/dev.to]

---

## Built With

Gemini Live API (gemini-2.5-flash-native-audio-latest), Google ADK, FastAPI, Next.js 15, Cloud Run, Firestore, Cloud Storage, Secret Manager, Terraform, Remotion, Playwright

---

## Inspiration

Browser-based apps can be automated with Playwright. CLI tools can be called directly by LLMs via tool use. But desktop GUI applications — Blender, Affinity Photo, Unreal Engine — have no programmatic interface. The mouse is the only way in, and only the human can use it. AI cannot automate anything in these apps. Coaching is the only viable form of AI assistance.

ExpertLens was built for this gap. It watches your screen, listens to your voice, and coaches you in real time — for the software that AI cannot control.

---

## What It Does

ExpertLens is a real-time AI coaching agent for desktop software:

- **Screen + voice input**: The browser captures your desktop app window (~1 fps) and microphone audio, streaming both to Gemini Live API over WebSocket
- **Curated knowledge**: Each coach has software-specific knowledge loaded into the system instruction at session start — Blender 4.x breaking changes, Affinity Photo layer blend shortcuts, Unreal Engine Blueprint patterns
- **User preferences**: Interaction style (shortcuts-first vs. mouse-guided), tone (concise expert vs. calm mentor), response depth, and proactivity — all injected into every session
- **Cross-session memory**: Session transcripts are summarized and stored in Firestore; the next session loads this history and the coach picks up where you left off
- **Coach Builder**: Create a custom coach for any desktop software; the software name is validated via Gemini + Google Search grounding before building

---

## How We Built It

**Backend:** FastAPI on Cloud Run, Python ADK for the Gemini Live agent runtime. WebSocket handler proxies browser ↔ Gemini Live session with barge-in handling.

**Frontend:** Next.js 15. Uses `getDisplayMedia()` for screen capture and `getUserMedia()` for microphone. JPEG frames at ~1fps sent as tagged binary WebSocket frames.

**Grounding:** Context stuffing as primary strategy (zero latency). Firestore `get_coach_knowledge` tool as fallback (~150ms). No vector database.

**Session persistence:** `contextWindowCompression` with `SlidingWindow` for unlimited session duration (bypasses 2-minute image session limit). `sessionResumption` with handle-based reconnect for ~10-minute WebSocket rotation.

**Memory pipeline:** Coach transcript accumulated in handler, summarized via `gemini-2.0-flash` with structured JSON output at session end, stored in Firestore, injected as "Previous Session Notes" at next session start with 1s timeout for graceful degradation.

**Infrastructure:** Terraform IaC for Cloud Run, Firestore, Cloud Storage, Secret Manager, Artifact Registry.

---

## Challenges

**The 2-minute image session limit.** Any image frame triggers audio+video mode, which has a 2-minute hard limit. Solution: `contextWindowCompression` with `SlidingWindow`. Without this, every screen-sharing session silently terminates.

**The ~10-minute WebSocket timeout.** Gemini Live WebSocket connections drop after ~10 minutes. Solution: `sessionResumption` with the handle stored server-side on every `new_handle` event. The client reconnects seamlessly on `GoAway`.

**Zero-latency grounding.** RAG adds 200–500ms per query — perceptible in live voice conversation. Solution: context stuffing. All curated knowledge loaded into system instruction before the session starts.

**Non-blocking tool calls.** ADK tool calls pause audio by default. Solution: `NON_BLOCKING` mode with `scheduling='WHEN_IDLE'` — tools execute between turns without interrupting the voice stream.

---

## Accomplishments

- Sessions running 30+ minutes via SlidingWindow contextWindowCompression — no 2-minute cutoffs
- Cross-session memory with less than 1 second of added session-start latency (1s Firestore timeout, graceful fallback)
- Seamless reconnection on WebSocket rotation — users see "Reconnecting…" for ~2 seconds and continue
- Software name validation via Gemini + Google Search grounding prevents invalid coach creation
- Fully deployed on GCP with Terraform IaC — reproducible one-command deploy

---

## What We Learned

**Gemini Live API is production-ready for this use case.** The native barge-in (VAD), session resumption, and SlidingWindow compression all work reliably. The constraints (2-min image limit, 10-min WebSocket limit) are well-documented once you know to look for them.

**Context stuffing beats RAG for latency-sensitive grounding.** A 128k context window fits 50–70 pages of curated content. For a domain-specific coaching agent, this is more than enough — and the latency difference (0ms vs. 150ms+) matters in a live voice conversation.

**Session resumption must be designed in from day one.** It cannot be retrofitted. The handle needs to be stored on every `new_handle` event and plumbed through the reconnect path — this touches the WebSocket handler, the session store, and the client protocol simultaneously.

---

## What's Next

**On-screen annotation.** The coach could overlay visual highlights on the user's screen share — "click this button" with a coordinate-based overlay. Requires a second WebSocket channel and a browser overlay component.

**Coach sharing.** A public coach directory where users can publish and discover custom coaches for niche desktop software.
