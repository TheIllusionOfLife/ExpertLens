"""REST API routes for sessions."""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.api.db.models import Session
from app.api.db.session_repo import create_session, end_session, get_sessions

router = APIRouter(prefix="/sessions", tags=["sessions"])


class EndSessionRequest(BaseModel):
    summary: str = ""
    last_topics: list[str] = []


@router.post("", response_model=Session, status_code=201)
async def start_session(coach_id: str) -> Session:
    return await create_session(coach_id)


@router.put("/{session_id}/end", response_model=Session)
async def finish_session(session_id: str, body: EndSessionRequest) -> Session:
    session = await end_session(session_id, body.summary, body.last_topics)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
    return session


@router.get("/{coach_id}", response_model=list[Session])
async def list_sessions(
    coach_id: str, limit: int = Query(default=10, ge=1, le=100)
) -> list[Session]:
    return await get_sessions(coach_id, limit=limit)
