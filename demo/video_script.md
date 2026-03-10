# ExpertLens Demo Video Script

**Target length:** 4 minutes
**Format:** Screen recording with narration

---

## Act 1 — The Problem (0:00–0:30)

**[Show desktop with Blender open, user staring at a complex node graph]**

> "You're learning new software. The documentation is hundreds of pages. YouTube tutorials are 40 minutes long. And you're stuck right now."

**[Cut to ExpertLens dashboard in browser alongside Blender]**

> "ExpertLens is an AI coach that watches your screen and answers questions in real time — using voice, just like asking a colleague sitting next to you."

---

## Act 2 — Live Session with Blender (0:30–2:00)

**[Click 'Start Session' on the Blender Expert coach card]**
**[Click 'Share Screen', select the Blender window]**
**[Enable microphone]**

*Status shows: "Live" with green dot*

**[Demonstrate barge-in: coach starts speaking, user interrupts]**

> **User (voice):** "Wait — how do I add a subdivision surface modifier?"

*Coach stops immediately, listens, then responds:*

> **Coach (audio):** "Press Ctrl+1 through Ctrl+5 to add Subdivision Surface with that level — Ctrl+2 gives you level 2. Or go to Properties panel, click the wrench icon, Add Modifier, Subdivision Surface."

**[User follows the instruction on screen]**

> **User:** "Got it. And why does my mesh look faceted even with subdivision?"

> **Coach:** "Your normals are likely flat-shaded. Select the object, right-click, and choose Shade Smooth. That'll interpolate normals across the subdivision."

**[User applies Shade Smooth — mesh looks smooth]**

> **User:** "Perfect."

---

## Act 3 — Preferences (2:00–2:45)

**[Navigate to coach settings]**

> "Preferences customize how the coach talks to you. An experienced user can switch to shortcut-first, concise expert mode."

**[Change tone to 'concise_expert', depth to 'short']**

**[Return to session, ask same question]**

> **User:** "How do I mirror an object?"

> **Coach:** "Ctrl+M, choose axis. Or Object menu → Mirror."

> "Same knowledge. Different style."

---

## Act 4 — Coach Builder (2:45–3:30)

**[Click '+ New Coach']**

> "ExpertLens isn't limited to these three apps. You can create a coach for any desktop software."

**[Type 'DaVinci Resolve' as software name]**

> "Give it a name, a persona, and focus areas — the system assembles a specialized coaching agent."

**[Show the Create Coach form with fields filling in]**

> "The coach is immediately available for live sessions."

---

## Act 5 — Architecture (3:30–3:50)

**[Show architecture diagram: browser → Cloud Run → Gemini Live API → GCP]**

> "ExpertLens runs on Google Cloud Run. The browser streams screen frames and audio over WebSocket to a FastAPI backend, which relays to Gemini Live API in real time."

> "Session resumption keeps the connection alive indefinitely — if the 10-minute WebSocket limit hits, the handle is saved and the session picks up seamlessly."

---

## Close (3:50–4:00)

**[Return to live session with Blender]**

> "ExpertLens. Expert coaching for any software, in real time."

**[Show URL / GitHub link]**

---

## Recording Notes

- Record at 1920×1080 minimum
- Blender window should be clearly visible alongside the browser
- Keep microphone quality high — audio quality demonstrates the voice interaction
- Show the status indicator turning green when the session connects
- Demo the barge-in clearly — it's a key differentiator
- Keep energy up; the demo is the product
