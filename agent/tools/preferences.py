"""User preferences retrieval tool — stub implementation for PR1."""
# PR3 replaces this with real Firestore queries.

DEFAULT_PREFERENCES = {
    "interaction_style": "shortcuts",
    "tone": "concise_expert",
    "depth": "medium",
    "proactivity": "reactive",
    "response_language": "english",
}


def get_user_preferences_stub(user_id: str) -> dict[str, str]:
    """Stub: return default preferences for any user."""
    return {**DEFAULT_PREFERENCES, "user_id": user_id, "source": "stub"}
