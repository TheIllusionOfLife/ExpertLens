"""Knowledge chunk queries against Firestore (fallback for deep grounding)."""

from app.api.db.firestore import KNOWLEDGE_COLLECTION, get_client
from app.api.db.models import KnowledgeChunk


async def save_chunk(chunk: KnowledgeChunk) -> None:
    """Upsert a knowledge chunk into Firestore."""
    await (
        get_client()
        .collection(KNOWLEDGE_COLLECTION)
        .document(chunk.chunk_id)
        .set(chunk.model_dump(by_alias=True))
    )


async def get_knowledge(software_name: str, topic: str, limit: int = 3) -> list[KnowledgeChunk]:
    """Query knowledge chunks by software_name + topic substring match."""
    # Firestore doesn't support full-text search; use prefix match on topic field.
    # Composite index required: software_name ASC + topic ASC (firestore.indexes.json)
    query = (
        get_client()
        .collection(KNOWLEDGE_COLLECTION)
        .where("software_name", "==", software_name)
        .where("topic", ">=", topic.lower())
        .where("topic", "<=", topic.lower() + "\uf8ff")
        .limit(limit)
    )
    chunks: list[KnowledgeChunk] = []
    async for doc in query.stream():
        chunks.append(KnowledgeChunk.model_validate(doc.to_dict()))
    return chunks


async def get_all_knowledge_for_software(software_name: str) -> list[KnowledgeChunk]:
    """Return all knowledge chunks for a software (used at session start for context stuffing)."""
    # Order by difficulty_level then topic for stable, deterministic context stuffing results.
    # .limit(100) is a hard safety cap to prevent runaway Firestore reads.
    query = (
        get_client()
        .collection(KNOWLEDGE_COLLECTION)
        .where("software_name", "==", software_name)
        .order_by("difficulty_level")
        .order_by("topic")
        .limit(100)
    )
    chunks: list[KnowledgeChunk] = []
    async for doc in query.stream():
        chunks.append(KnowledgeChunk.model_validate(doc.to_dict()))
    return chunks


async def delete_knowledge_for_coach(coach_id: str) -> None:
    """Delete all knowledge chunks for a coach using batched writes."""
    query = get_client().collection(KNOWLEDGE_COLLECTION).where("software_name", "==", coach_id)
    batch_size = 500
    docs = []
    async for doc in query.stream():
        docs.append(doc.reference)

    for i in range(0, len(docs), batch_size):
        batch = get_client().batch()
        for ref in docs[i : i + batch_size]:
            batch.delete(ref)
        await batch.commit()
