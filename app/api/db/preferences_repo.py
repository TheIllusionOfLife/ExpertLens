"""User preferences CRUD against Firestore."""

from app.api.db.firestore import PREFERENCES_COLLECTION, get_client
from app.api.db.models import PreferencesUpdate, UserPreferences


async def get_preferences(user_id: str) -> UserPreferences:
    doc = await get_client().collection(PREFERENCES_COLLECTION).document(user_id).get()
    if not doc.exists:
        return UserPreferences()
    return UserPreferences(**doc.to_dict())


async def update_preferences(user_id: str, updates: PreferencesUpdate) -> UserPreferences:
    ref = get_client().collection(PREFERENCES_COLLECTION).document(user_id)
    patch = {k: v for k, v in updates.model_dump().items() if v is not None}
    if patch:
        await ref.set(patch, merge=True)
    doc = await ref.get()
    if not doc.exists:
        return UserPreferences()
    return UserPreferences(**doc.to_dict())
