"""REST API routes for coaches."""

import logging

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException

from app.api.auth import TokenPayload, get_current_user
from app.api.db.coach_repo import (
    create_coach,
    delete_coach,
    get_coach,
    list_coaches,
    make_coach_slug,
    update_coach,
)
from app.api.db.knowledge_repo import delete_knowledge_for_coach
from app.api.db.models import Coach, CoachCreate, CoachUpdate
from app.api.knowledge.builder import (
    KNOWN_PRESET_IDS,
    build_knowledge_for_coach,
    resolve_software_name,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/coaches", tags=["coaches"])


@router.get("", response_model=list[Coach])
async def list_coaches_endpoint(
    current_user: TokenPayload = Depends(get_current_user),
) -> list[Coach]:
    return await list_coaches(user_id=current_user.sub)


@router.get("/{coach_id}", response_model=Coach)
async def get_coach_endpoint(
    coach_id: str,
    current_user: TokenPayload = Depends(get_current_user),
) -> Coach:
    coach = await get_coach(coach_id)
    if not coach:
        raise HTTPException(status_code=404, detail=f"Coach '{coach_id}' not found")
    if coach.owner_id is not None and coach.owner_id != current_user.sub:
        raise HTTPException(status_code=403, detail="Not authorized")
    return coach


@router.post("", response_model=Coach, status_code=201)
async def create_coach_endpoint(
    data: CoachCreate,
    background_tasks: BackgroundTasks,
    current_user: TokenPayload = Depends(get_current_user),
) -> Coach:
    try:
        slug = make_coach_slug(data.software_name)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    if slug not in KNOWN_PRESET_IDS:
        try:
            data.software_name = await resolve_software_name(data.software_name)
            slug = make_coach_slug(data.software_name)  # re-derive from canonical name
        except ValueError as e:
            raise HTTPException(status_code=422, detail=str(e))
    coach = await create_coach(data, owner_id=current_user.sub)
    if not coach:
        raise HTTPException(
            status_code=409, detail=f"Coach for '{data.software_name}' already exists"
        )
    background_tasks.add_task(build_knowledge_for_coach, coach.coach_id, coach.software_name)
    return coach


@router.post("/{coach_id}/rebuild-knowledge", status_code=202)
async def rebuild_knowledge_endpoint(
    coach_id: str,
    background_tasks: BackgroundTasks,
    current_user: TokenPayload = Depends(get_current_user),
) -> dict[str, str]:
    coach = await get_coach(coach_id)
    if not coach:
        raise HTTPException(status_code=404, detail=f"Coach '{coach_id}' not found")
    if coach.owner_id is not None and coach.owner_id != current_user.sub:
        raise HTTPException(status_code=403, detail="Not authorized")
    if coach.knowledge_status == "building":
        return {"status": "building"}  # already in progress, no-op
    await update_coach(coach_id, {"knowledge_status": "building", "knowledge_error": ""})
    background_tasks.add_task(build_knowledge_for_coach, coach_id, coach.software_name)
    return {"status": "building"}


@router.put("/{coach_id}", response_model=Coach)
async def update_coach_endpoint(
    coach_id: str,
    updates: CoachUpdate,
    current_user: TokenPayload = Depends(get_current_user),
) -> Coach:
    existing = await get_coach(coach_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Coach '{coach_id}' not found")
    if existing.owner_id is None:
        raise HTTPException(status_code=403, detail="Preset coaches cannot be updated")
    if existing.owner_id != current_user.sub:
        raise HTTPException(status_code=403, detail="Not authorized")
    patch = {k: v for k, v in updates.model_dump().items() if v is not None}
    coach = await update_coach(coach_id, patch)
    if not coach:
        raise HTTPException(status_code=404, detail=f"Coach '{coach_id}' not found")
    return coach


@router.delete("/{coach_id}", status_code=200)
async def delete_coach_endpoint(
    coach_id: str,
    current_user: TokenPayload = Depends(get_current_user),
) -> dict:
    """Delete a custom coach and all its knowledge chunks. Preset coaches cannot be deleted."""
    if coach_id in KNOWN_PRESET_IDS:
        raise HTTPException(status_code=403, detail="Preset coaches cannot be deleted")
    coach = await get_coach(coach_id)
    if not coach:
        raise HTTPException(status_code=404, detail="Coach not found")
    if coach.owner_id is not None and coach.owner_id != current_user.sub:
        raise HTTPException(status_code=403, detail="Not authorized")
    await delete_knowledge_for_coach(coach_id)
    try:
        await delete_coach(coach_id)
    except Exception as e:
        logger.error(f"delete_coach failed after knowledge deletion (coach={coach_id}): {e}")
        raise HTTPException(
            status_code=500,
            detail="Knowledge deleted but coach profile could not be removed. Retry the delete.",
        )
    return {"ok": True}
