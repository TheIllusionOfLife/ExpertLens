"""Coach CRUD operations against Firestore."""

from app.api.db.firestore import COACHES_COLLECTION, get_client
from app.api.db.models import Coach, CoachCreate


async def get_coach(coach_id: str) -> Coach | None:
    doc = await get_client().collection(COACHES_COLLECTION).document(coach_id).get()
    if not doc.exists:
        return None
    return Coach(**doc.to_dict())


async def list_coaches() -> list[Coach]:
    docs = get_client().collection(COACHES_COLLECTION).stream()
    coaches: list[Coach] = []
    async for doc in docs:
        coaches.append(Coach(**doc.to_dict()))
    return coaches


async def create_coach(data: CoachCreate) -> Coach | None:
    """Create a coach. Returns None if a coach with the same ID already exists."""
    coach_id = data.software_name.lower().replace(" ", "_")
    ref = get_client().collection(COACHES_COLLECTION).document(coach_id)
    existing = await ref.get()
    if existing.exists:
        return None
    coach = Coach(
        coach_id=coach_id,
        software_name=data.software_name,
        display_name=data.display_name or f"{data.software_name} Expert",
        persona=data.persona or f"Expert coach for {data.software_name}",
        focus_areas=data.focus_areas,
        icon=data.icon,
    )
    await ref.set(coach.model_dump())
    return coach


async def update_coach(coach_id: str, updates: dict) -> Coach | None:
    if not updates:
        return await get_coach(coach_id)
    ref = get_client().collection(COACHES_COLLECTION).document(coach_id)
    doc = await ref.get()
    if not doc.exists:
        return None
    await ref.update(updates)
    doc = await ref.get()
    return Coach(**doc.to_dict())
