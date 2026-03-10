"""Seed Firestore with coach profiles and knowledge chunks.

Usage:
    uv run python scripts/seed_firestore.py

Requires GEMINI_API_KEY and GCP_PROJECT_ID in .env (or environment).
"""

import asyncio
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv  # noqa: E402

load_dotenv()

from google.cloud import firestore  # noqa: E402

COACHES_COLLECTION = "coaches"
KNOWLEDGE_COLLECTION = "knowledge_chunks"

# Maps software_name → list of (topic, file_path) tuples
KNOWLEDGE_MAP: dict[str, list[tuple[str, Path]]] = {
    "blender": [
        ("shortcuts", Path("data/seed_sources/blender/shortcuts.md")),
        ("modeling_basics", Path("data/seed_sources/blender/modeling_basics.md")),
        ("common_errors", Path("data/seed_sources/blender/common_errors.md")),
        ("modifiers", Path("data/seed_sources/blender/modifiers.md")),
        ("rendering", Path("data/seed_sources/blender/rendering.md")),
    ],
    "affinity_photo": [
        ("shortcuts", Path("data/seed_sources/affinity_photo/shortcuts.md")),
        ("retouching", Path("data/seed_sources/affinity_photo/retouching.md")),
        ("layers", Path("data/seed_sources/affinity_photo/layers.md")),
    ],
    "unreal_engine": [
        ("shortcuts", Path("data/seed_sources/unreal_engine/shortcuts.md")),
        ("blueprints", Path("data/seed_sources/unreal_engine/blueprints.md")),
        ("materials", Path("data/seed_sources/unreal_engine/materials.md")),
    ],
}

COACH_PROFILES = [
    Path("data/coach_profiles/blender.json"),
    Path("data/coach_profiles/affinity_photo.json"),
    Path("data/coach_profiles/unreal_engine.json"),
]


async def seed(project_id: str | None = None) -> None:
    client = firestore.AsyncClient(project=project_id) if project_id else firestore.AsyncClient()

    # Seed coach profiles
    print("Seeding coach profiles...")
    for profile_path in COACH_PROFILES:
        data = json.loads(profile_path.read_text())
        coach_id = data["coach_id"]
        await client.collection(COACHES_COLLECTION).document(coach_id).set(data)
        print(f"  ✓ Coach: {coach_id}")

    # Seed knowledge chunks
    print("Seeding knowledge chunks...")
    for software_name, chunks in KNOWLEDGE_MAP.items():
        for topic, file_path in chunks:
            if not file_path.exists():
                print(f"  ⚠ Missing: {file_path}")
                continue
            content = file_path.read_text()
            chunk_id = f"{software_name}_{topic}"
            chunk = {
                "chunk_id": chunk_id,
                "software_name": software_name,
                "topic": topic,
                "content": content,
                "difficulty_level": "beginner",
                "tags": [software_name, topic],
            }
            await client.collection(KNOWLEDGE_COLLECTION).document(chunk_id).set(chunk)
            print(f"  ✓ Knowledge: {chunk_id} ({len(content)} chars)")

    print(
        f"\nSeeding complete! {len(COACH_PROFILES)} coaches, "
        f"{sum(len(v) for v in KNOWLEDGE_MAP.values())} knowledge chunks."
    )
    await client.close()


if __name__ == "__main__":
    project_id = os.getenv("GCP_PROJECT_ID") or None
    asyncio.run(seed(project_id=project_id))
