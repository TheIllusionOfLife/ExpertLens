"""User preferences retrieval tool — Firestore implementation with stub fallback."""

import logging

from app.api.db.models import UserPreferences
from app.api.db.preferences_repo import get_preferences

logger = logging.getLogger(__name__)


async def get_user_preferences(user_id: str) -> dict:
    """Query Firestore for user preferences."""
    try:
        prefs = await get_preferences(user_id)
        return prefs.model_dump()
    except Exception as e:
        logger.warning(f"Firestore preferences query failed, using defaults: {e}")
        return get_user_preferences_stub(user_id)


def get_user_preferences_stub(user_id: str) -> dict:
    """Fallback: return default preferences for any user."""
    return {**UserPreferences().model_dump(), "user_id": user_id, "source": "stub"}
