"""REST API routes for user preferences."""

from fastapi import APIRouter

from app.api.db.models import PreferencesUpdate, UserPreferences
from app.api.db.preferences_repo import get_preferences, update_preferences

router = APIRouter(prefix="/preferences", tags=["preferences"])


@router.get("/{user_id}", response_model=UserPreferences)
async def get_prefs(user_id: str) -> UserPreferences:
    return await get_preferences(user_id)


@router.put("/{user_id}", response_model=UserPreferences)
async def update_prefs(user_id: str, updates: PreferencesUpdate) -> UserPreferences:
    return await update_preferences(user_id, updates)
