"""REST API routes for sessions."""

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field, field_validator

from app.api.auth import TokenPayload, get_current_user
from app.api.db.coach_repo import get_coach
from app.api.db.models import Session
from app.api.db.session_repo import create_session, end_session, get_session, get_sessions

router = APIRouter(prefix="/sessions", tags=["sessions"])

_MAX_SUMMARY_CHARS = 5000
_MAX_TOPICS = 10
_MAX_TOPIC_CHARS = 200


class EndSessionRequest(BaseModel):
    summary: str = ""
    last_topics: list[str] = Field(default_factory=list)

    @field_validator("summary", mode="before")
    @classmethod
    def truncate_summary(cls, v: str) -> str:
        return v[:_MAX_SUMMARY_CHARS] if isinstance(v, str) else v

    @field_validator("last_topics", mode="before")
    @classmethod
    def truncate_topics(cls, v: list) -> list:
        if not isinstance(v, list):
            return v
        return [t[:_MAX_TOPIC_CHARS] if isinstance(t, str) else t for t in v[:_MAX_TOPICS]]


@router.post("", response_model=Session, status_code=201)
async def start_session(
    coach_id: str,
    current_user: TokenPayload = Depends(get_current_user),
) -> Session:
    coach = await get_coach(coach_id)
    if not coach:
        raise HTTPException(status_code=404, detail=f"Coach '{coach_id}' not found")
    if coach.owner_id is not None and coach.owner_id != current_user.sub:
        raise HTTPException(status_code=403, detail="Not authorized")
    return await create_session(coach_id, current_user.sub)


@router.put("/{session_id}/end", response_model=Session)
async def finish_session(
    session_id: str,
    body: EndSessionRequest,
    current_user: TokenPayload = Depends(get_current_user),
) -> Session:
    existing = await get_session(session_id, user_id=current_user.sub)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
    session = await end_session(session_id, body.summary, body.last_topics)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
    return session


@router.get("/{coach_id}", response_model=list[Session])
async def list_sessions(
    coach_id: str,
    limit: int = Query(default=10, ge=1, le=100),
    current_user: TokenPayload = Depends(get_current_user),
) -> list[Session]:
    return await get_sessions(coach_id, user_id=current_user.sub, limit=limit)
