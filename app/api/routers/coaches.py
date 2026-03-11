"""REST API routes for coaches."""

from fastapi import APIRouter, HTTPException

from app.api.db.coach_repo import create_coach, get_coach, list_coaches, update_coach
from app.api.db.models import Coach, CoachCreate, CoachUpdate

router = APIRouter(prefix="/coaches", tags=["coaches"])


@router.get("", response_model=list[Coach])
async def list_coaches_endpoint() -> list[Coach]:
    return await list_coaches()


@router.get("/{coach_id}", response_model=Coach)
async def get_coach_endpoint(coach_id: str) -> Coach:
    coach = await get_coach(coach_id)
    if not coach:
        raise HTTPException(status_code=404, detail=f"Coach '{coach_id}' not found")
    return coach


@router.post("", response_model=Coach, status_code=201)
async def create_coach_endpoint(data: CoachCreate) -> Coach:
    coach = await create_coach(data)
    if not coach:
        raise HTTPException(
            status_code=409, detail=f"Coach for '{data.software_name}' already exists"
        )
    return coach


@router.put("/{coach_id}", response_model=Coach)
async def update_coach_endpoint(coach_id: str, updates: CoachUpdate) -> Coach:
    patch = {k: v for k, v in updates.model_dump().items() if v is not None}
    coach = await update_coach(coach_id, patch)
    if not coach:
        raise HTTPException(status_code=404, detail=f"Coach '{coach_id}' not found")
    return coach
