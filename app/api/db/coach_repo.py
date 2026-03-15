"""Coach CRUD operations against Firestore."""

import re

from google.api_core.exceptions import AlreadyExists

from app.api.db.firestore import COACHES_COLLECTION, get_client
from app.api.db.models import Coach, CoachCreate


def make_coach_slug(software_name: str) -> str:
    """
    Convert a software name to a safe Firestore document ID.
    Raises ValueError if the input yields an empty slug.
    """
    slug = software_name.strip().lower()
    slug = re.sub(r"\s+", "_", slug)  # whitespace → underscore
    slug = re.sub(r"[^a-z0-9_]", "", slug)  # strip unsafe chars (/, .., ., control chars)
    slug = re.sub(r"_+", "_", slug)  # collapse repeated underscores
    slug = slug.strip("_")
    if not slug:
        raise ValueError(f"Software name {software_name!r} yields an empty slug")
    return slug


async def get_coach(coach_id: str) -> Coach | None:
    doc = await get_client().collection(COACHES_COLLECTION).document(coach_id).get()
    if not doc.exists:
        return None
    return Coach.model_validate(doc.to_dict())


async def list_coaches(user_id: str = "") -> list[Coach]:
    """Return preset coaches (owner_id=None) plus the calling user's coaches."""
    from google.cloud.firestore_v1.base_query import FieldFilter

    client = get_client()
    seen: dict[str, Coach] = {}

    # Presets: owner_id is None
    async for doc in (
        client.collection(COACHES_COLLECTION)
        .where(filter=FieldFilter("owner_id", "==", None))
        .stream()
    ):
        coach = Coach.model_validate(doc.to_dict())
        seen[doc.id] = coach

    # User's private coaches
    if user_id:
        async for doc in (
            client.collection(COACHES_COLLECTION)
            .where(filter=FieldFilter("owner_id", "==", user_id))
            .stream()
        ):
            coach = Coach.model_validate(doc.to_dict())
            seen[doc.id] = coach

    return list(seen.values())


async def create_coach(data: CoachCreate, owner_id: str | None = None) -> Coach | None:
    """Create a coach. Returns None if a coach with the same slug already exists."""
    coach_id = make_coach_slug(data.software_name)
    ref = get_client().collection(COACHES_COLLECTION).document(coach_id)
    coach = Coach(
        coach_id=coach_id,
        software_name=data.software_name,
        display_name=data.display_name or f"{data.software_name} Expert",
        persona=data.persona or f"Expert coach for {data.software_name}",
        focus_areas=data.focus_areas,
        icon=data.icon,
        knowledge_status="building",
        owner_id=owner_id,
    )
    try:
        await ref.create(coach.model_dump())
    except AlreadyExists:
        return None
    return coach


async def delete_coach(coach_id: str) -> None:
    """Delete a coach document from Firestore."""
    await get_client().collection(COACHES_COLLECTION).document(coach_id).delete()


async def update_coach(coach_id: str, updates: dict) -> Coach | None:
    # NOTE: local merge is only safe for flat primitive updates (strings, numbers).
    # Do NOT use this path for Firestore server transforms (ArrayUnion, SERVER_TIMESTAMP,
    # DELETE_FIELD, or dotted field paths like "a.b").
    if not updates:
        return await get_coach(coach_id)
    ref = get_client().collection(COACHES_COLLECTION).document(coach_id)
    doc = await ref.get()
    if not doc.exists:
        return None
    await ref.update(updates)
    return Coach.model_validate({**(doc.to_dict() or {}), **updates})
