# ExpertLens Demo Video Script

**Target length:** 4 minutes
**Format:** Screen recording with narration

---

## Act 1 — The Human-Control Gap (0:00–0:30)

**[Show desktop with Blender open alongside a browser tab with Playwright docs and a terminal with git commands]**

> "You could use Playwright to automate a browser app. You could give an LLM a terminal and it will use your CLI tools directly. But open Blender, Affinity Photo, or Unreal Engine — and there is no API. No automation. The keyboard is the only way in, and only you can use it."

**[Cut to phone camera pointing at a mobile game in progress]**

> "Same story on mobile. A complex game, a creative app, a professional tool — the touchscreen is the interface. AI cannot operate it for you."

**[Cut to ExpertLens dashboard in browser alongside Blender]**

> "ExpertLens coaches you inside that space. It watches what you're doing and advises you — so you can control the application better."

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

## Act 3 — Mobile Demo (1:45–2:15)

**[Switch to iPhone running Safari on ExpertLens. Camera is pointing at an iPad with Affinity Photo open.]**

> "ExpertLens works on mobile too. iOS can't share the screen — but the camera works just as well. Point it at your screen or device and the agent sees exactly what you see."

**[Tap Start Session on the Affinity Photo coach. Camera activates.]**

> **User (voice):** "How do I mask just the sky in this photo?"

> **Coach (audio):** "Go to Select menu, choose Select Subject — Affinity will detect the foreground. Then invert the selection with Ctrl+Shift+I and apply a Pixel Mask from the Layers panel."

> "Same live coaching. Different device, different capture method, same result."

---

## Act 4 — Preferences (2:15–2:45)

**[Navigate to coach settings panel]**

> "Preferences customize how the coach talks to you."

**[Change tone from 'calm_mentor' to 'concise_expert', depth to 'short']**

**[Return to session, ask same question]**

> **User:** "How do I mirror an object?"

> **Coach:** "Ctrl+M, choose axis."

> "Same knowledge. Half the words."

---

## Act 5 — Coach Builder (2:45–3:25)

**[Click '+ New Coach']**

> "ExpertLens isn't limited to these three apps. You can create a coach for any software."

**[Type 'DaVinci Resolve' as software name]**

> "The software name is validated — ExpertLens uses Gemini with Google Search grounding to confirm it's a real application before building the coach."

**[Show validation passing, knowledge building progress indicator]**

> "Knowledge builds automatically using Gemini 3 with real-time search grounding. When complete, the coach is ready for live sessions."

---

## Act 6 — Architecture (3:25–3:50)

**[Show architecture diagram]**

> "ExpertLens runs on Google Cloud Run. The browser streams screen frames and audio over WebSocket to a FastAPI backend, which relays to Gemini Live API in real time."

> "On desktop and Android, that's a screen capture. On iOS, it's the rear camera. Same pipeline either way."

> "SlidingWindow compression keeps sessions running indefinitely. Session resumption with stored handles survives the 10-minute WebSocket rotation."

---

## Close (3:50–4:00)

**[Return to ExpertLens dashboard]**

> "ExpertLens. Expert coaching for the software only you can operate."

**[Show live URL: https://expertlens-frontend-pk4kcjevqa-uc.a.run.app]**

---

## Recording Notes

- Record desktop at 1920×1080 minimum; record mobile at native resolution
- Blender window should be clearly visible alongside the browser
- For the mobile act: film with a second device or simulate with browser DevTools mobile viewport
- Keep microphone quality high — audio quality demonstrates the voice interaction
- Show the status indicator turning green when the session connects
- Demo the barge-in clearly — it's a key differentiator
- For Act 2b: prepare a second session where the coach opens with the memory recall
- For Act 3: an iPad or external display works well as the "screen the phone points at"
- Keep energy up; the demo is the product
