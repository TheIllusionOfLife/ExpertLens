"""Seed Firestore with coach profiles and trigger AI knowledge generation.

Usage:
    uv run python scripts/seed_firestore.py

Requires:
    GCP_PROJECT_ID in .env (or environment)
    GEMINI_API_KEY in .env (or environment) — needed for knowledge generation
"""

import asyncio
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv  # noqa: E402

load_dotenv()

# Check required environment variables early
if not os.getenv("GEMINI_API_KEY"):
    print("ERROR: GEMINI_API_KEY is not set. Knowledge generation requires the Gemini API.")
    print("Set GEMINI_API_KEY in your .env file and try again.")
    sys.exit(1)

from google.cloud import firestore  # noqa: E402

from app.api.knowledge.builder import build_knowledge_for_coach  # noqa: E402

COACHES_COLLECTION = "coaches"
KNOWLEDGE_COLLECTION = "knowledge_chunks"

_REPO_ROOT = Path(__file__).parent.parent

COACH_PROFILES = [
    _REPO_ROOT / "data/coach_profiles/blender.json",
    _REPO_ROOT / "data/coach_profiles/affinity_photo.json",
    _REPO_ROOT / "data/coach_profiles/unreal_engine.json",
    _REPO_ROOT / "data/coach_profiles/fusion.json",
    _REPO_ROOT / "data/coach_profiles/zbrush.json",
]


async def delete_knowledge_chunks(client: firestore.AsyncClient, coach_id: str) -> int:
    """Delete all knowledge chunks for a coach. Returns number of deleted docs."""
    query = client.collection(KNOWLEDGE_COLLECTION).where("software_name", "==", coach_id)
    docs = []
    async for doc in query.stream():
        docs.append(doc.reference)

    batch_size = 500
    for i in range(0, len(docs), batch_size):
        batch = client.batch()
        for ref in docs[i : i + batch_size]:
            batch.delete(ref)
        await batch.commit()
    return len(docs)


async def seed(project_id: str | None = None) -> None:
    client = firestore.AsyncClient(project=project_id) if project_id else firestore.AsyncClient()

    # Seed coach profiles
    print("Seeding coach profiles...")
    coach_ids = []
    for profile_path in COACH_PROFILES:
        data = json.loads(profile_path.read_text())
        coach_id = data["coach_id"]
        software_name = data["software_name"]
        # Reset knowledge status so rebuild triggers cleanly
        data["knowledge_status"] = "none"
        data["knowledge_error"] = ""
        data["knowledge_updated_at"] = ""
        await client.collection(COACHES_COLLECTION).document(coach_id).set(data)
        coach_ids.append((coach_id, software_name))
        print(f"  ✓ Coach: {coach_id}")

    # Delete stale knowledge chunks (especially old slugs like *_workflow vs *_workflows)
    print("\nPurging stale knowledge chunks...")
    for coach_id, _ in coach_ids:
        n = await delete_knowledge_chunks(client, coach_id)
        if n:
            print(f"  ✓ Deleted {n} old chunks for {coach_id}")
        else:
            print(f"  - No existing chunks for {coach_id}")

    client.close()

    # Build knowledge for all coaches sequentially (avoid rate limits)
    print("\nBuilding AI knowledge for all coaches...")
    for coach_id, software_name in coach_ids:
        print(f"  Building {coach_id} ({software_name})...")
        await build_knowledge_for_coach(coach_id, software_name)
        print(f"  ✓ Done: {coach_id}")

    print(f"\nSeeding complete! {len(coach_ids)} coaches seeded and knowledge built.")


if __name__ == "__main__":
    project_id = os.getenv("GCP_PROJECT_ID") or None
    asyncio.run(seed(project_id=project_id))
