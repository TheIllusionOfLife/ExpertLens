# ExpertLens Demo Video Script

**Target length:** 4 minutes
**Format:** Live screen recording + voiceover narration

> **How to use this script**
> Voiceover lines (`> "..."`) are scripted — record them separately or narrate live.
> User prompts are *suggested* starting points — adapt based on what actually works during playtest.
> Coach responses are **never scripted** — the live AI answers. Your job is to set up conditions
> where interesting, accurate responses are likely. Recording notes in each act tell you what to aim for.

---

## Pre-Recording Setup

1. Open [https://expertlens-frontend-pk4kcjevqa-uc.a.run.app](https://expertlens-frontend-pk4kcjevqa-uc.a.run.app) in Chrome
2. Open Blender on the same desktop — have a mesh with a Subdivision Surface modifier already added but still looking faceted (normals not smoothed)
3. Have Affinity Photo open on a second device or screen (for the mobile act)
4. Start a Blender session beforehand and ask at least one question. End it. This seeds cross-session memory for Act 2b.
5. Use OBS or macOS screen recording. Record at 1920×1080 minimum. Use a good microphone.

---

## Act 1 — The Human-Control Gap (0:00–0:30)

**[Show: desktop with Blender open alongside a browser tab showing Playwright docs and a terminal with git commands. Arrange them so all three are visible simultaneously.]**

> "You could use Playwright to automate a browser app. You could give an LLM a terminal and it will use your CLI tools directly. But open Blender, Affinity Photo, or Unreal Engine — and there is no API. No automation. The keyboard is the only way in, and only you can use it."

**[Cut to: phone or second device with a mobile game or creative app open — demonstrate that you're controlling it with touch.]**

> "Same story on mobile. A complex game, a creative app, a professional tool — the touchscreen is the interface. AI cannot operate it for you."

**[Cut to: ExpertLens dashboard open in browser, Blender visible behind it.]**

> "ExpertLens coaches you inside that space. It watches what you're doing and advises you — so you can control the application better."

---

## Act 2a — Live Session (0:30–1:10)

**[Click 'Start Session' on the Blender Expert coach card.]**
**[Click 'Share Screen', select the Blender window. The status dot should turn green.]**
**[Enable microphone.]**

*Capture the "Live" status indicator turning green before speaking.*

**[Make sure the faceted mesh is visible in Blender's viewport.]**

**You say (suggested):** *"My mesh still looks faceted even after I added a Subdivision Surface modifier. What am I doing wrong?"*

*Wait for the coach to respond. A good response will mention normals (Shade Smooth) and possibly the Smooth by Angle modifier introduced in Blender 4.1. Don't cut away — let the full response play out on screen.*

**[Follow whatever the coach says. If it says to apply Shade Smooth, do it — let the mesh visibly change.]**

**You say (suggested follow-up):** *"What subdivision level should I use?"*

*Wait for the response. The coach should suggest a level and ideally mention the Ctrl+number shortcut.*

> **Recording aim:** The viewer should see the problem on screen, hear a specific actionable answer, and see you act on it. The before/after of the mesh is the payoff.

---

## Act 2b — Cross-Session Memory (1:10–1:45)

*Prerequisite: You must have completed at least one real Blender session before recording this act. The session summary is written to Firestore at session end — give it 10–15 seconds after ending the session before starting the next one.*

**[End the session from Act 2a by clicking Stop. Wait ~15 seconds for the memory pipeline to write.]**
**[Start a fresh session on the same Blender Expert coach.]**

*Listen for the coach's opening message. If cross-session memory is working, it will reference what you worked on previously.*

**[Capture the transcript panel as the coach speaks its opening — this makes the memory visible on screen, not just audible.]**

> "That's not a script. After every session, ExpertLens summarizes what you worked on and stores it in Firestore. The next session loads that summary into the agent's system instruction. The coach actually remembers."

> **Recording aim:** The viewer should hear the coach reference a specific topic from a previous session — "last session we covered X" or similar. If the opening message doesn't reference memory, ask the coach directly: *"Do you remember what we worked on last time?"* That usually surfaces it.

---

## Act 3 — Mobile Demo (1:45–2:15)

**[Set up: iPhone running Safari open to ExpertLens. A second screen or device has Affinity Photo open with a landscape photo that has a distinct sky.]**

> "ExpertLens works on mobile too. iOS can't share the screen — but the camera works just as well. Point it at your screen or device and the agent sees exactly what you see."

**[Tap Start Session on the Affinity Photo coach. The camera activates — point the rear camera at the screen showing Affinity Photo.]**

**You say (suggested):** *"How do I mask just the sky in this photo?"*

*Wait for the response. A good response will give step-by-step instructions using Affinity Photo's menus or tools — Select Subject, Pixel Mask, etc.*

> "Same live coaching. Different device, different capture method, same result."

> **Recording aim:** The phone camera pointing at a real screen is the visual key here — it makes the capture method immediately obvious. Frame the shot so both the phone and the screen it's pointing at are in frame at the start. Then cut to the phone screen for the coaching interaction.

---

## Act 4 — Preferences (2:15–2:45)

**[Navigate to the Blender Expert coach detail page → settings/preferences.]**

> "Preferences customize how the coach talks to you."

**[Change tone from 'calm_mentor' to 'concise_expert'. Change depth to 'short'. Save.]**

**[Return to a live session.]**

**You say (suggested):** *"How do I mirror an object?"*

*Wait for the response. With concise_expert + short depth, the response should be noticeably shorter and more direct than a default session — ideally just the shortcut and axis choice.*

> "Same knowledge. Half the words."

> **Recording aim:** The contrast is the demo. If you have footage from Act 2a with a longer response, cutting between them makes the difference tangible. Ask the same question in both preference states if you want a direct before/after.

---

## Act 5 — Coach Builder (2:45–3:25)

**[Click '+ New Coach' on the dashboard.]**

> "ExpertLens isn't limited to these three apps. You can create a coach for any software."

**[Type a software name — 'DaVinci Resolve' or 'Roblox Studio' are good choices. These have been tested and validate cleanly.]**

> "The software name is validated — ExpertLens uses Gemini 3 Flash Preview with Google Search grounding to confirm it's a real application before building the coach."

**[Submit. Show the validation passing, then the knowledge build progress indicator running.]**

*The build takes 2–4 minutes. Either time-lapse this section or cut to a pre-built coach at "ready" status while narrating that it's complete.*

> "Knowledge builds automatically using Gemini 3 Flash Preview with real-time search grounding. When complete, the coach is ready for live sessions."

> **Recording aim:** You don't need to show the full 3-minute build in real time. Showing the progress indicator start, then cutting to the completed coach, is fine. If you want to show the full build, speed it up 4x in post.

---

## Act 6 — Architecture (3:25–3:50)

**[Show the architecture diagram: `demo/architecture.png`]**

> "ExpertLens runs on Google Cloud Run. The browser streams screen frames and audio over WebSocket to a FastAPI backend, which relays to Gemini Live API in real time."

> "On desktop and Android, that's a screen capture. On iOS, it's the rear camera. Same pipeline either way."

> "SlidingWindow compression keeps sessions running indefinitely. Session resumption with stored handles survives the 10-minute WebSocket rotation."

---

## Close (3:50–4:00)

**[Return to ExpertLens dashboard.]**

> "ExpertLens. Expert coaching for the software only you can operate."

**[Show the live URL: https://expertlens-frontend-pk4kcjevqa-uc.a.run.app]**

---

## Recording Guide

### Equipment
- **Screen recording:** OBS Studio (free) or macOS built-in screen recording (Cmd+Shift+5). OBS preferred — you can mix desktop + mic sources with level control.
- **Microphone:** Use a dedicated mic or a headset. Built-in laptop mic picks up keyboard noise.
- **Mobile act:** Use a tripod or phone stand to hold the iPhone steady while pointing at the second screen. Shaky camera makes the demo hard to watch.

### Session Setup
- **Blender mesh:** Use a simple default cube with a Subdivision Surface modifier at level 2. The normals will be faceted by default — this is the exact problem to demonstrate.
- **Affinity Photo photo:** Use any landscape photo with a clear sky/foreground divide. The Select Subject tool works best on high-contrast images.
- **Memory act:** End the Act 2a session naturally (click Stop), wait 15 seconds, then immediately start Act 2b in the same recording session. Do not close the browser tab between acts.

### What to Watch For
- **Status indicator:** The green "Live" dot should be visible before you start speaking. If it's still connecting, pause.
- **Barge-in:** If the coach starts talking and you want to interrupt, just speak over it — VAD cuts the agent immediately. This is a key differentiator; consider demonstrating it once.
- **Response quality:** If a response is vague or unhelpful, ask a follow-up or rephrase. The goal is one clean exchange per act — cut anything that doesn't land.
- **Mobile camera focus:** iOS autofocus sometimes hunts on screen content. Tap to focus on the application UI before starting the session.

### Editing Notes
- Keep each act tight — if a response runs long, cut after the key point lands.
- For Act 2b, the memory recall is the moment — don't rush past it with narration. Let it breathe.
- For Act 5, the coach builder can be sped up or cut; the validation UI is more interesting than the build progress bar.
- Add captions for the coach's audio responses — viewers may be watching without sound.
