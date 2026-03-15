#!/usr/bin/env python3
"""Seed a test user (testuser/testpass123) into Firestore users collection.

Safety gate: only runs when GOOGLE_CLOUD_PROJECT contains 'dev' or 'local'.
"""

import asyncio
import os
import sys

# Safety gate: require explicit opt-in flag to prevent accidental execution on production.
# GOOGLE_CLOUD_PROJECT substring check is intentionally NOT used — it could match
# project IDs like "prod-devops" which contain "dev".
if os.environ.get("SEED_TEST_USER") != "1":
    print(
        "ERROR: Set SEED_TEST_USER=1 to confirm you intend to seed a test user. "
        "Refusing to run without explicit opt-in."
    )
    sys.exit(1)

project = os.environ.get("GOOGLE_CLOUD_PROJECT", "")
if not project or not any(env in project for env in ("-dev", "-local", "local-")):
    print(
        f"ERROR: GOOGLE_CLOUD_PROJECT={project!r} does not look like a dev/local project. "
        "Refusing to seed test user."
    )
    sys.exit(1)

from app.api.auth import create_user, get_user_by_username  # noqa: E402


async def main() -> None:
    existing = await get_user_by_username("testuser")
    if existing:
        print("testuser already exists — skipping")
        return
    user = await create_user("testuser", "testpass123")
    print(f"Created testuser with user_id={user.user_id}")


if __name__ == "__main__":
    asyncio.run(main())
