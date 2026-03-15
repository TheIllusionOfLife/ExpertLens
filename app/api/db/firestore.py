"""Firestore client singleton and collection references."""

from functools import lru_cache

from google.cloud import firestore

from app.api.config import settings


@lru_cache(maxsize=1)
def get_client() -> firestore.AsyncClient:
    """Return a cached Firestore async client."""
    if settings.gcp_project_id:
        return firestore.AsyncClient(project=settings.gcp_project_id)
    return firestore.AsyncClient()


# Collection name constants
COACHES_COLLECTION = "coaches"
PREFERENCES_COLLECTION = "user_preferences"
SESSIONS_COLLECTION = "sessions"
KNOWLEDGE_COLLECTION = "knowledge_chunks"
USERS_COLLECTION = "users"
