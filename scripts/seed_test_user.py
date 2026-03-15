#!/usr/bin/env python3
"""Seed a test user (testuser/testpass123) into Firestore users collection.

Safety gate: only runs when GOOGLE_CLOUD_PROJECT contains 'dev' or 'local'.
"""

import asyncio
import os
import sys

# Safety gate
project = os.environ.get("GOOGLE_CLOUD_PROJECT", "")
if not any(env in project for env in ("dev", "local")):
    print(
        f"ERROR: GOOGLE_CLOUD_PROJECT={project!r} does not contain 'dev' or 'local'. "
        "Refusing to seed test user on non-dev environment."
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
