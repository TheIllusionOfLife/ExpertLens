"""JWT authentication: token creation/validation, password hashing, user management."""

import uuid
from datetime import UTC, datetime, timedelta

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from google.cloud.firestore_v1.base_query import FieldFilter
from pwdlib import PasswordHash
from pydantic import BaseModel, Field

from app.api.config import settings
from app.api.db.firestore import USERS_COLLECTION, get_client

_ph = PasswordHash.recommended()
_bearer = HTTPBearer()


class TokenPayload(BaseModel):
    sub: str  # user_id UUID


class UserRecord(BaseModel):
    user_id: str
    username: str
    hashed_password: str


class RegisterRequest(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)


class LoginRequest(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)


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
    docs = (
        get_client()
        .collection(USERS_COLLECTION)
        .where(filter=FieldFilter("username", "==", username))
        .stream()
    )
    async for doc in docs:
        data = doc.to_dict()
        if data:
            return UserRecord(**data)
    return None


async def create_user(username: str, password: str) -> UserRecord:
    existing = await get_user_by_username(username)
    if existing:
        raise HTTPException(status_code=409, detail="Username already taken")
    user_id = str(uuid.uuid4())
    record = UserRecord(
        user_id=user_id,
        username=username,
        hashed_password=hash_password(password),
    )
    await get_client().collection(USERS_COLLECTION).document(user_id).set(record.model_dump())
    return record


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> TokenPayload:
    return decode_token(credentials.credentials)
