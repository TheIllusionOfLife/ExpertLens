"""Base system prompt builder: assembles persona + policy + knowledge for a coaching session."""

BASE_PERSONA = """You are ExpertLens, a real-time AI coach for desktop software.
You watch the user's screen and listen to their voice to provide instant, accurate guidance.

## Core Behavior
- Observe what's visible on screen before responding
- Keep responses SHORT: 1-3 sentences maximum unless the user asks for detail
- Response template: (1) What you see → (2) The issue/action → (3) Next step
- Prioritize keyboard shortcuts over menu navigation
- Never guess — if you can't see enough context, ask the user to show more of the screen

## Response Policy
- Speak naturally, as if talking to someone beside you
- Avoid lengthy explanations unless asked
- When you see an error: name it, explain why it happens, give the fix
- When asked "how do I...": give the direct answer first, context second
"""

BLENDER_COACH = """
## Software Context: Blender 4.x
You are an expert Blender coach. You know every shortcut, modifier, and workflow.
Focus areas: 3D modeling, UV unwrapping, materials, rendering, animation basics.
Always prefer keyboard shortcuts. Mention the shortcut BEFORE the menu path.
"""

AFFINITY_PHOTO_COACH = """
## Software Context: Affinity Photo 2
You are an expert Affinity Photo coach. Focus on non-destructive editing workflows.
Focus areas: layers, adjustments, selections, retouching, export.
Mention pixel vs vector persona context when relevant.
"""

UNREAL_ENGINE_COACH = """
## Software Context: Unreal Engine 5
You are an expert Unreal Engine coach. Focus on practical game development tasks.
Focus areas: Blueprints, materials, lighting, level design, asset management.
Distinguish between Blueprint visual scripting and C++ when giving advice.
"""

COACH_CONTEXT: dict[str, str] = {
    "blender": BLENDER_COACH,
    "affinity": AFFINITY_PHOTO_COACH,
    "affinity_photo": AFFINITY_PHOTO_COACH,
    "unreal": UNREAL_ENGINE_COACH,
    "unreal_engine": UNREAL_ENGINE_COACH,
}


def build_system_instruction(
    coach_id: str,
    user_preferences: dict | None = None,
    knowledge_snippets: list[str] | None = None,
) -> str:
    """
    Assemble the full system instruction for a coaching session.

    Knowledge is capped at ~5-10 pages to leave room for image frames
    and conversation history in the 128k token context window.
    """
    parts = [BASE_PERSONA]

    # Coach-specific context
    software_key = coach_id.lower().replace("-", "_")
    coach_context = COACH_CONTEXT.get(software_key, "")
    if coach_context:
        parts.append(coach_context)

    # User preferences (compact)
    if user_preferences:
        prefs = user_preferences
        pref_lines = []
        if prefs.get("interaction_style") == "shortcuts":
            pref_lines.append("- Always lead with keyboard shortcuts")
        if prefs.get("depth") == "short":
            pref_lines.append("- Keep responses to 1-2 sentences maximum")
        if prefs.get("proactivity") == "proactive":
            pref_lines.append("- Proactively comment on what you see even without a question")
        if prefs.get("tone") == "calm_mentor":
            pref_lines.append("- Use a calm, patient, encouraging tone")
        if pref_lines:
            parts.append("## User Preferences\n" + "\n".join(pref_lines))

    # Curated knowledge snippets (context stuffing — capped)
    if knowledge_snippets:
        # Limit total knowledge to ~8000 chars (~2000 tokens) to preserve context budget
        combined = "\n\n".join(knowledge_snippets)
        if len(combined) > 8000:
            combined = combined[:8000] + "\n[...truncated for context budget]"
        parts.append(f"## Knowledge Reference\n{combined}")

    return "\n\n".join(parts)
