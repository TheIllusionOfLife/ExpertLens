# ExpertLens Demo Video Script

**Target length:** 4 minutes
**Format:** Screen recording with narration

---

## Act 1 — The Desktop GUI Gap (0:00–0:30)

**[Show desktop with Blender open alongside a browser tab with Playwright docs and a terminal with git commands]**

> "You could use Playwright to automate a browser app. You could give an LLM a terminal and it will use your CLI tools directly. But open Blender, Affinity Photo, or Unreal Engine — and there is no API. No automation. The mouse is the only way in. ExpertLens coaches you inside that gap."

**[Cut to ExpertLens dashboard in browser alongside Blender]**

---

## Act 2a — Live Session, Session 1 (0:30–1:10)

**[Click 'Start Session' on the Blender Expert coach card]**
**[Click 'Share Screen', select the Blender window]**
**[Enable microphone]**

*Status shows: "Live" with green dot*

> **User (voice):** "My mesh still looks faceted even after I added a Subdivision Surface modifier. What am I doing wrong?"

*Coach responds:*

> **Coach (audio):** "That's a normals issue. Select the object, right-click, choose Shade Smooth. With Blender 4.x, you can also add a Smooth by Angle modifier — it replaced Auto Smooth which was removed in version 4.1."

**[User applies Shade Smooth — mesh looks smooth]**

> **User:** "Perfect. What level should I use for the subdivision?"

> **Coach:** "Level 2 is the sweet spot for most work — Ctrl+2 applies it instantly. Level 3 for final render if topology is clean."

---

## Act 2b — Cross-Session Memory (1:10–1:45)

**[End session. Start a new session with the same Blender Expert coach the next day.]**

*Coach auto-speaks at session start:*

> **Coach (audio):** "Welcome back. Last session we covered subdivision surface modifiers and normal smoothing — your faceted mesh issue. Picking up from there, or something new?"

**[Narration over the transcript panel showing the welcome message:]**

> "That's not a script. After every session, ExpertLens summarizes what you worked on and stores it in Firestore. The next session loads that summary into the agent's system instruction. The coach actually remembers."

---

## Act 3 — vs Gemini AI Studio Live (1:45–2:20)

**[Side-by-side: Gemini AI Studio Live mode on the left, ExpertLens on the right]**

> "Google AI Studio has a built-in Live mode. You can share your screen and talk to Gemini. ExpertLens adds four things."

**[Highlight each point as spoken:]**

> "One: software-specific knowledge that is current — like the fact that Auto Smooth was removed from Blender 4.1 and replaced with the Smooth by Angle modifier."

> "Two: user preferences that change how the coach talks to you — shortcut-first versus mouse-guided, concise expert versus calm mentor."

> "Three: memory of what you worked on last time."

> "Four: a coaching persona built specifically for your software."

---

## Act 4 — Preferences (2:20–2:50)

**[Navigate to coach settings panel]**

> "Preferences customize how the coach talks to you."

**[Change tone from 'calm_mentor' to 'concise_expert', depth to 'short']**

**[Return to session, ask same question]**

> **User:** "How do I mirror an object?"

> **Coach:** "Ctrl+M, choose axis."

> "Same knowledge. Half the words."

---

## Act 5 — Coach Builder (2:50–3:30)

**[Click '+ New Coach']**

> "ExpertLens isn't limited to these three apps. You can create a coach for any desktop software."

**[Type 'DaVinci Resolve' as software name]**

> "The software name is validated — ExpertLens uses Gemini with Google Search grounding to confirm it's a real desktop application before building the coach."

**[Show validation passing, knowledge building progress indicator]**

> "Knowledge builds automatically. When complete, the coach is ready for live sessions."

---

## Act 6 — Architecture (3:30–3:50)

**[Show architecture diagram]**

> "ExpertLens runs on Google Cloud Run. The browser streams screen frames and audio over WebSocket to a FastAPI backend, which relays to Gemini Live API in real time."

> "SlidingWindow compression keeps sessions running indefinitely. Session resumption with stored handles survives the 10-minute WebSocket rotation."

---

## Close (3:50–4:00)

**[Return to ExpertLens dashboard]**

> "ExpertLens. Expert coaching for the apps AI cannot automate."

**[Show live URL: https://expertlens-frontend-1085534867079.us-central1.run.app]**

---

## Recording Notes

- Record at 1920×1080 minimum
- Blender window should be clearly visible alongside the browser
- Keep microphone quality high — audio quality demonstrates the voice interaction
- Show the status indicator turning green when the session connects
- Demo the barge-in clearly — it's a key differentiator
- For Act 2b: can use a prepared second session where the coach opens with the memory recall
- Keep energy up; the demo is the product
