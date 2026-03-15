"""REST API routes for user preferences."""

from fastapi import APIRouter, Depends

from app.api.auth import TokenPayload, get_current_user
from app.api.db.models import PreferencesUpdate, UserPreferences
from app.api.db.preferences_repo import get_preferences, update_preferences

router = APIRouter(prefix="/preferences", tags=["preferences"])


@router.get("", response_model=UserPreferences)
async def get_prefs(current_user: TokenPayload = Depends(get_current_user)) -> UserPreferences:
    return await get_preferences(current_user.sub)


@router.put("", response_model=UserPreferences)
async def update_prefs(
    updates: PreferencesUpdate,
    current_user: TokenPayload = Depends(get_current_user),
) -> UserPreferences:
    return await update_preferences(current_user.sub, updates)
