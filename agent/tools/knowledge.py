"""Coach knowledge retrieval tool — Firestore implementation with stub fallback."""

import logging

from app.api.db.knowledge_repo import get_knowledge

logger = logging.getLogger(__name__)

async def get_coach_knowledge(software_name: str, topic: str) -> dict:
    """Query Firestore for knowledge chunks matching software + topic."""
    try:
        chunks = await get_knowledge(software_name=software_name, topic=topic)
        if not chunks:
            return {
                "content": (
                    f"No specific reference found for '{topic}' in {software_name}."
                    " Answering from training knowledge."
                ),
                "topic": topic,
                "found": False,
            }
        combined = "\n\n---\n\n".join(c.content for c in chunks)
        return {"content": combined, "topic": topic, "found": True, "chunks": len(chunks)}
    except Exception as e:
        logger.warning(f"Firestore knowledge query failed, using stub: {e}")
        return get_coach_knowledge_stub(topic, software_name)


def get_coach_knowledge_stub(topic: str, software_name: str = "") -> dict:
    """Fallback: return a software-agnostic response when Firestore is unavailable."""
    return {
        "content": (
            f"Additional reference data for '{topic}' in "
            f"{software_name or 'this software'} is temporarily "
            f"unavailable. I'll answer from my training knowledge and what I can see on screen."
        ),
        "topic": topic,
        "source": "stub",
        "found": False,
    }
