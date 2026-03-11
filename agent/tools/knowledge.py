"""Coach knowledge retrieval tool — Firestore implementation with stub fallback."""

import logging

from app.api.db.knowledge_repo import get_knowledge

logger = logging.getLogger(__name__)

# Fallback content when Firestore is unavailable
DEFAULT_KNOWLEDGE = "I'm your expert coach. Ask me anything about the software you're using!"


async def get_coach_knowledge(software_name: str, topic: str) -> dict:
    """Query Firestore for knowledge chunks matching software + topic."""
    try:
        chunks = await get_knowledge(software_name=software_name, topic=topic)
        if not chunks:
            return {"content": DEFAULT_KNOWLEDGE, "topic": topic, "found": False}
        combined = "\n\n---\n\n".join(c.content for c in chunks)
        return {"content": combined, "topic": topic, "found": True, "chunks": len(chunks)}
    except Exception as e:
        logger.warning(f"Firestore knowledge query failed, using stub: {e}")
        return get_coach_knowledge_stub(topic)


def get_coach_knowledge_stub(topic: str) -> dict:
    """Fallback: return hardcoded Blender knowledge by topic."""
    BLENDER_KNOWLEDGE: dict[str, str] = {
        "shortcuts": (
            "Blender shortcuts: G=Grab, R=Rotate, S=Scale, Tab=Edit Mode, "
            "Ctrl+R=Loop Cut, E=Extrude, X=Delete, Shift+D=Duplicate, "
            "Numpad 0=Camera, F3=Search"
        ),
        "modeling_basics": (
            "Blender modeling: Add mesh (Shift+A), edit with E/Ctrl+R/K, "
            "apply transforms (Ctrl+A) before export"
        ),
        "common_errors": (
            "Common fixes: black faces→Shift+N recalculate normals, "
            "pink render→missing texture, gap in mirror→enable Clipping"
        ),
    }
    topic_lower = topic.strip().lower()
    if not topic_lower:
        return {"content": DEFAULT_KNOWLEDGE, "topic": topic, "source": "stub"}
    for key, content in BLENDER_KNOWLEDGE.items():
        if key in topic_lower or topic_lower in key:
            return {"content": content, "topic": topic, "source": "stub"}
    return {"content": DEFAULT_KNOWLEDGE, "topic": topic, "source": "stub"}
