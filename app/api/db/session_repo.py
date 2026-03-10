"""Session CRUD against Firestore."""

import uuid
from datetime import UTC, datetime

from app.api.db.firestore import SESSIONS_COLLECTION, get_client
from app.api.db.models import Session


async def create_session(coach_id: str) -> Session:
    session_id = str(uuid.uuid4())
    session = Session(
        session_id=session_id,
        coach_id=coach_id,
        started_at=datetime.now(UTC).isoformat(),
    )
    await (
        get_client().collection(SESSIONS_COLLECTION).document(session_id).set(session.model_dump())
    )
    return session


async def end_session(session_id: str, summary: str, last_topics: list[str]) -> Session | None:
    ref = get_client().collection(SESSIONS_COLLECTION).document(session_id)
    updates = {
        "ended_at": datetime.now(UTC).isoformat(),
        "summary": summary,
        "last_topics": last_topics,
    }
    await ref.update(updates)
    doc = await ref.get()
    if not doc.exists:
        return None
    return Session(**doc.to_dict())


async def get_sessions(coach_id: str, limit: int = 10) -> list[Session]:
    query = (
        get_client()
        .collection(SESSIONS_COLLECTION)
        .where("coach_id", "==", coach_id)
        .order_by("started_at", direction="DESCENDING")
        .limit(limit)
    )
    sessions: list[Session] = []
    async for doc in query.stream():
        sessions.append(Session(**doc.to_dict()))
    return sessions
