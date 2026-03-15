"""Auth routes: register and login."""

from fastapi import APIRouter, HTTPException

from app.api.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    create_access_token,
    create_user,
    get_user_by_username,
    verify_password,
)

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
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(user.user_id)
    return TokenResponse(
        access_token=token,
        user_id=user.user_id,
        username=user.username,
    )
