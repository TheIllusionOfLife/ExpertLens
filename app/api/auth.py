"""JWT authentication: token creation/validation, password hashing, user management."""

import logging
import uuid
from datetime import UTC, datetime, timedelta

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from google.api_core.exceptions import AlreadyExists
from google.cloud.firestore_v1.base_query import FieldFilter
from pwdlib import PasswordHash
from pydantic import BaseModel, Field, field_validator

from app.api.config import settings
from app.api.db.firestore import USERNAMES_COLLECTION, USERS_COLLECTION, get_client

logger = logging.getLogger(__name__)

_ph = PasswordHash.recommended()
_bearer = HTTPBearer(auto_error=False)


class TokenPayload(BaseModel):
    sub: str  # user_id UUID


class UserRecord(BaseModel):
    user_id: str
    username: str
    hashed_password: str


class _AuthRequest(BaseModel):
    """Shared validation for auth requests."""

    username: str = Field(min_length=1, max_length=50)
    password: str = Field(min_length=1, max_length=200)

    @field_validator("username", mode="before")
    @classmethod
    def normalize_username(cls, v: str) -> str:
        v = v.strip().lower()
        if not v:
            raise ValueError("username must not be blank")
        return v

    @field_validator("password", mode="before")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("password must not be blank")
        return v  # do not strip/lowercase passwords


class RegisterRequest(_AuthRequest):
    @field_validator("password", mode="before")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v.strip()) < 8:
            raise ValueError("password must be at least 8 characters")
        return v


class LoginRequest(_AuthRequest):
    pass


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    username: str


def hash_password(plain: str) -> str:
    return _ph.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return _ph.verify(plain, hashed)


def create_access_token(user_id: str) -> str:
    exp = datetime.now(UTC) + timedelta(days=settings.jwt_expire_days)
    return jwt.encode(
        {"sub": user_id, "exp": exp},
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def decode_token(token: str) -> TokenPayload:
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        return TokenPayload(sub=payload["sub"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


async def get_user_by_username(username: str) -> UserRecord | None:
    """Look up a user via the usernames reservation collection, then fetch the full record.

    Falls back to querying the users collection directly for pre-migration users
    and backfills the usernames reservation doc on first successful fallback lookup.
    """
    client = get_client()

    # Fast path: look up via usernames reservation collection
    reservation = await client.collection(USERNAMES_COLLECTION).document(username).get()
    if reservation.exists:
        data = reservation.to_dict()
        if data and "user_id" in data:
            user_doc = await client.collection(USERS_COLLECTION).document(data["user_id"]).get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                if user_data:
                    return UserRecord(**user_data)

    # Fallback: query users collection directly (pre-migration users)
    docs = (
        client.collection(USERS_COLLECTION)
        .where(filter=FieldFilter("username", "==", username))
        .stream()
    )
    async for doc in docs:
        user_data = doc.to_dict()
        if user_data:
            record = UserRecord(**user_data)
            # Backfill the usernames reservation for future fast-path lookups
            try:
                await (
                    client.collection(USERNAMES_COLLECTION)
                    .document(username)
                    .set({"user_id": record.user_id})
                )
            except Exception as e:
                logger.warning("Failed to backfill username reservation for %s: %s", username, e)
            return record

    return None


async def create_user(username: str, password: str) -> UserRecord:
    """Create a user with atomic username uniqueness via a reservation document.

    Both the username reservation and user document are written atomically.
    If the username is already taken, Firestore raises AlreadyExists on the
    reservation create(), guaranteeing no two users share a username even
    under concurrent registration. If the user doc write fails, the reservation
    is cleaned up to prevent orphaned usernames.
    """
    client = get_client()
    user_id = str(uuid.uuid4())

    # Atomically reserve the username. Fails with AlreadyExists if taken.
    username_ref = client.collection(USERNAMES_COLLECTION).document(username)
    try:
        await username_ref.create({"user_id": user_id})
    except AlreadyExists:
        raise HTTPException(status_code=409, detail="Username already taken")

    record = UserRecord(
        user_id=user_id,
        username=username,
        hashed_password=hash_password(password),
    )
    try:
        await client.collection(USERS_COLLECTION).document(user_id).set(record.model_dump())
    except Exception:
        # Roll back the username reservation to prevent orphaned usernames
        await username_ref.delete()
        raise
    return record


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> TokenPayload:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return decode_token(credentials.credentials)
