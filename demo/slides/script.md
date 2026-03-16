# ExpertLens Demo Script

Read this aloud while presenting `demo/slides/index.html`.
Press F for fullscreen, arrow keys to navigate.

---

## Slide 1 — The Problem (0:00–0:30)

> Professional software has a steep learning curve. Blender, Affinity Photo, Unreal Engine, DaVinci Resolve — even mobile apps like Procreate or complex games.
>
> AI can automate browsers with Playwright. AI can call CLI tools directly. But these GUI-heavy applications? AI cannot control them for you. You have to operate them yourself — with the keyboard, the mouse, the touchscreen.
>
> That's where ExpertLens comes in. It watches your screen, listens to your voice, and coaches you in real time — so you learn faster while staying in control.

---

## Slide 2 — Live Demo (0:30–2:00)

**Do NOT narrate over this slide.** Just play the clip. Your voice and the coach's voice are the only audio.

Before pressing play, say:

> "Let me show you. I'm in Blender with a faceted mesh. I'll ask the coach what I'm doing wrong."

Then **play the clip** and let it run. The audience hears:
- You asking about the faceted mesh
- The coach responding with Shade Smooth / Smooth by Angle
- You applying the fix (visible mesh improvement)
- You asking a follow-up about subdivision levels
- **The barge-in moment** — you interrupt mid-sentence, coach stops immediately

After the clip ends (or when you advance), briefly say:

> "Native barge-in. No push-to-talk. The coach sees my screen and responds like a colleague sitting next to me."

---

## Slide 3 — Coach Builder (2:00–2:30)

> "ExpertLens isn't limited to preset coaches. Type any software name — here, DaVinci Resolve. Gemini validates it's real software using Google Search grounding. Then it builds a six-section knowledge base — shortcuts, workflows, common errors, deep concepts, version-specific changes, and a quick reference card. Two to four minutes, and the coach is ready for live sessions."

---

## Slide 4 — Preferences + Memory (2:30–3:00)

> "Every user is different. ExpertLens lets you customize four dimensions — interaction style, coaching tone, response depth, and proactivity. A shortcuts-first power user gets a completely different experience from someone learning their first 3D tool. These preferences are injected into the system instruction at session start.
>
> And the coach remembers. After each session, the transcript is summarized and stored in Firestore. Next time you connect, the coach loads your last three sessions and picks up where you left off."

---

## Slide 5 — Mobile (3:00–3:20)

> "This works on every device. Desktop and Android get full screen sharing. On iOS, where screen sharing isn't available in the browser, the rear camera activates instead — point it at your screen, and the same coaching pipeline works. Same agent, same knowledge, same voice."

---

## Slide 6 — Architecture (3:20–3:50)

> "Under the hood: Cloud Run hosts both services. The browser streams screen frames and audio over WebSocket to the backend, which proxies directly to Gemini Live API. SlidingWindow compression lets sessions run indefinitely — no two-minute cutoff. Session resumption handles WebSocket timeouts without losing context. Knowledge is context-stuffed into the system instruction at zero latency. Everything is provisioned with Terraform and auto-deployed via Cloud Build on every push to main."

---

## Slide 7 — Closing (3:50–4:00)

> "ExpertLens. Expert coaching for the software only you can operate."

---

## Tips

- **Slide 2 is the star.** Give it 90 seconds. Don't rush.
- **Don't narrate over the demo clip.** Let the real conversation breathe.
- **The barge-in is your differentiator.** Make sure the audience notices it happened.
- **Keep slides 3–6 tight** — 20-30 seconds each. The details are in the devpost writeup.
- **Total target: ~3:30–3:50** to leave buffer under the 4-minute limit.
