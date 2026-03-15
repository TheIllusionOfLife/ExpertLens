"""Auth routes: register and login."""

from fastapi import APIRouter, HTTPException

from app.api.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    create_access_token,
    create_user,
    get_user_by_username,
    hash_password,
    verify_password,
)

# Precomputed once to equalize response time regardless of whether username exists.
# This prevents username enumeration via timing side-channel on the login endpoint.
_DUMMY_HASH: str = hash_password("__dummy__")

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest) -> TokenResponse:
    user = await create_user(body.username, body.password)
    token = create_access_token(user.user_id)
    return TokenResponse(
        access_token=token,
        user_id=user.user_id,
        username=user.username,
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest) -> TokenResponse:
    user = await get_user_by_username(body.username)
    # Always call verify_password (even on unknown username) to equalize response time
    # and prevent username enumeration via timing side-channel.
    candidate_hash = user.hashed_password if user else _DUMMY_HASH
    password_ok = verify_password(body.password, candidate_hash)
    if not user or not password_ok:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(user.user_id)
    return TokenResponse(
        access_token=token,
        user_id=user.user_id,
        username=user.username,
    )
