"""System instruction builder: assembles persona + coach profile + preferences + knowledge."""

import logging

from agent.prompts.templates.affinity import AFFINITY_PROMPT
from agent.prompts.templates.blender import BLENDER_PROMPT
from agent.prompts.templates.system import SYSTEM_PROMPT
from agent.prompts.templates.unreal import UNREAL_PROMPT

logger = logging.getLogger(__name__)

COACH_TEMPLATES: dict[str, str] = {
    "blender": BLENDER_PROMPT,
    "affinity": AFFINITY_PROMPT,
    "affinity_photo": AFFINITY_PROMPT,
    "unreal": UNREAL_PROMPT,
    "unreal_engine": UNREAL_PROMPT,
}

# Preference → instruction mapping
PREF_INSTRUCTIONS: dict[str, dict[str, str]] = {
    "interaction_style": {
        "shortcuts": "ALWAYS state the keyboard shortcut before any menu path.",
        "mouse": "Guide primarily via menus and on-screen buttons; shortcuts are secondary.",
        "both": "Provide both keyboard shortcuts and menu paths.",
    },
    "tone": {
        "concise_expert": "Be direct and precise. Avoid filler words or lengthy explanations.",
        "calm_mentor": "Speak in a calm, patient, encouraging tone. Build confidence.",
        "enthusiastic": "Be energetic and positive. Celebrate progress.",
    },
    "depth": {
        "short": "Keep ALL responses to 1-2 sentences maximum.",
        "medium": "Aim for 2-4 sentences. Expand only when asked.",
        "detailed": "Provide thorough explanations including context and alternatives.",
    },
    "proactivity": {
        "reactive": "Only respond when the user asks a question. Do not comment unprompted.",
        "balanced": "Respond to questions, and occasionally mention obvious issues you see.",
        "proactive": "Actively comment on what you see on screen, even without a question.",
    },
}

# Context budget: system instruction knowledge capped to preserve token budget
# for image frames + conversation. 128k total; ~8k (~2k tokens) for knowledge.
MAX_KNOWLEDGE_CHARS = 8000


def build_system_instruction(
    coach_id: str,
    user_preferences: dict | None = None,
    knowledge_snippets: list[str] | None = None,
) -> str:
    """
    Assemble the full system instruction for a coaching session.

    Args:
        coach_id: Used to look up the software-specific prompt template.
        user_preferences: Dict of preference keys → values (from Firestore or defaults).
        knowledge_snippets: List of markdown strings from seed_sources (context stuffing).
    """
    parts = [SYSTEM_PROMPT]

    # Coach-specific context
    software_key = coach_id.strip().lower().replace("-", "_").replace(" ", "_")
    coach_template = COACH_TEMPLATES.get(software_key, "")
    if coach_template:
        parts.append(coach_template)

    # User preferences → behavioral instructions
    if user_preferences:
        pref_lines = []
        for pref_key, pref_map in PREF_INSTRUCTIONS.items():
            value = user_preferences.get(pref_key)
            if value and value in pref_map:
                pref_lines.append(f"- {pref_map[value]}")
        if pref_lines:
            parts.append("## Session-Specific Instructions\n" + "\n".join(pref_lines))

    # Curated knowledge snippets (capped for context budget)
    if knowledge_snippets:
        combined = "\n\n".join(knowledge_snippets)
        if len(combined) > MAX_KNOWLEDGE_CHARS:
            combined = combined[:MAX_KNOWLEDGE_CHARS] + "\n[...additional knowledge via tool]"
        parts.append(f"## Knowledge Reference\n{combined}")

    return "\n\n".join(parts)


async def build_system_instruction_from_firestore(coach_id: str, user_id: str = "default") -> str:
    """
    Build system instruction by loading coach data + knowledge from Firestore.
    Falls back gracefully if Firestore is unavailable.
    """
    # Load in parallel
    import asyncio

    from app.api.db.knowledge_repo import get_all_knowledge_for_software
    from app.api.db.preferences_repo import get_preferences

    prefs_task = asyncio.create_task(get_preferences(user_id))

    user_prefs = None
    knowledge_snippets: list[str] = []

    try:
        prefs = await prefs_task
        user_prefs = prefs.model_dump() if prefs else None
    except Exception as e:
        logger.warning(f"Failed to load preferences for {user_id}: {e}")

    try:
        # Use coach_id (the Firestore document slug) — it is the canonical key used
        # by the builder when saving chunks, so it always matches regardless of how
        # the raw software_name was cased or punctuated.
        chunks = await get_all_knowledge_for_software(coach_id)
        knowledge_snippets = [c.content for c in chunks]
    except Exception as e:
        logger.warning(f"Failed to load knowledge for {coach_id}: {e}")

    return build_system_instruction(
        coach_id=coach_id,
        user_preferences=user_prefs,
        knowledge_snippets=knowledge_snippets,
    )
