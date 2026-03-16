"""Tests for /auth/register and /auth/login endpoints."""

from unittest.mock import AsyncMock

import pytest
from google.api_core.exceptions import AlreadyExists


async def test_register_creates_user(async_client, monkeypatch):
    from app.api.auth import UserRecord

    mock_record = UserRecord(
        user_id="new-uuid",
        username="newuser",
        hashed_password="hashed",
    )
    monkeypatch.setattr(
        "app.api.routers.auth.create_user",
        AsyncMock(return_value=mock_record),
    )
    response = await async_client.post(
        "/auth/register", json={"username": "newuser", "password": "pass1234"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["user_id"] == "new-uuid"
    assert data["username"] == "newuser"
    assert "access_token" in data


async def test_register_duplicate_username(async_client, monkeypatch):
    from fastapi import HTTPException

    monkeypatch.setattr(
        "app.api.routers.auth.create_user",
        AsyncMock(side_effect=HTTPException(status_code=409, detail="Username already taken")),
    )
    response = await async_client.post(
        "/auth/register", json={"username": "existing", "password": "pass1234"}
    )
    assert response.status_code == 409


async def test_register_atomic_uniqueness(mock_firestore, monkeypatch):
    """Concurrent registration: AlreadyExists on username reservation returns 409."""
    from app.api.auth import create_user

    # Simulate AlreadyExists on the username reservation document
    mock_firestore.collection.return_value.document.return_value.create = AsyncMock(
        side_effect=AlreadyExists("Document already exists")
    )

    from fastapi import HTTPException

    with pytest.raises(HTTPException) as exc_info:
        await create_user("takenuser", "password123")
    assert exc_info.value.status_code == 409


async def test_login_valid_credentials(async_client, monkeypatch):
    from app.api.auth import UserRecord

    mock_record = UserRecord(
        user_id="uid-123",
        username="testuser",
        hashed_password="hashed",
    )
    monkeypatch.setattr(
        "app.api.routers.auth.get_user_by_username",
        AsyncMock(return_value=mock_record),
    )
    monkeypatch.setattr(
        "app.api.routers.auth.verify_password",
        lambda plain, hashed: True,
    )
    response = await async_client.post(
        "/auth/login", json={"username": "testuser", "password": "testpass123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == "uid-123"
    assert "access_token" in data


async def test_login_wrong_password(async_client, monkeypatch):
    from app.api.auth import UserRecord

    mock_record = UserRecord(
        user_id="uid-123",
        username="testuser",
        hashed_password="hashed",
    )
    monkeypatch.setattr(
        "app.api.routers.auth.get_user_by_username",
        AsyncMock(return_value=mock_record),
    )
    monkeypatch.setattr(
        "app.api.routers.auth.verify_password",
        lambda plain, hashed: False,
    )
    response = await async_client.post(
        "/auth/login", json={"username": "testuser", "password": "wrongpass"}
    )
    assert response.status_code == 401
