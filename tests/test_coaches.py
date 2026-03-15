"""Tests for /coaches REST endpoints."""

from unittest.mock import AsyncMock

from app.api.db.models import Coach, UserPreferences

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

DEFAULT_PREFS = UserPreferences()

BLENDER_COACH = Coach(
    coach_id="blender",
    software_name="blender",
    display_name="Blender Expert",
    persona="Expert coach for blender",
    knowledge_status="ready",
    default_preferences=DEFAULT_PREFS,
)

BUILDING_COACH = Coach(
    coach_id="davinci_resolve",
    software_name="DaVinci Resolve",  # differs from slug to catch arg-swap regressions
    display_name="DaVinci Resolve Expert",
    persona="Expert coach for DaVinci Resolve",
    knowledge_status="building",
    default_preferences=DEFAULT_PREFS,
)


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------


async def test_list_coaches_requires_auth(async_client):
    response = await async_client.get("/coaches")
    assert response.status_code == 401


# ---------------------------------------------------------------------------
# GET /coaches
# ---------------------------------------------------------------------------


async def test_list_coaches_empty(authed_client, monkeypatch):
    monkeypatch.setattr("app.api.routers.coaches.list_coaches", AsyncMock(return_value=[]))
    response = await authed_client.get("/coaches")
    assert response.status_code == 200
    assert response.json() == []


async def test_list_coaches_returns_coaches(authed_client, monkeypatch):
    monkeypatch.setattr(
        "app.api.routers.coaches.list_coaches",
        AsyncMock(return_value=[BLENDER_COACH]),
    )
    response = await authed_client.get("/coaches")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["coach_id"] == "blender"


# ---------------------------------------------------------------------------
# GET /coaches/{coach_id}
# ---------------------------------------------------------------------------


async def test_get_coach_not_found(authed_client, monkeypatch):
    monkeypatch.setattr("app.api.routers.coaches.get_coach", AsyncMock(return_value=None))
    response = await authed_client.get("/coaches/nonexistent")
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# POST /coaches
# ---------------------------------------------------------------------------


async def test_create_coach(authed_client, monkeypatch):
    monkeypatch.setattr(
        "app.api.routers.coaches.create_coach",
        AsyncMock(return_value=BUILDING_COACH),
    )
    monkeypatch.setattr("app.api.routers.coaches.build_knowledge_for_coach", AsyncMock())
    monkeypatch.setattr(
        "app.api.routers.coaches.resolve_software_name",
        AsyncMock(return_value="DaVinci Resolve"),
    )
    response = await authed_client.post(
        "/coaches",
        json={"software_name": "DaVinci Resolve"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["coach_id"] == "davinci_resolve"
    assert data["knowledge_status"] == "building"


async def test_create_coach_duplicate(authed_client, monkeypatch):
    monkeypatch.setattr("app.api.routers.coaches.create_coach", AsyncMock(return_value=None))
    monkeypatch.setattr("app.api.routers.coaches.build_knowledge_for_coach", AsyncMock())
    response = await authed_client.post(
        "/coaches",
        json={"software_name": "blender"},
    )
    assert response.status_code == 409


async def test_create_coach_triggers_builder(authed_client, monkeypatch):
    """Background task must dispatch build_knowledge_for_coach with correct args."""
    builder_mock = AsyncMock()
    monkeypatch.setattr(
        "app.api.routers.coaches.create_coach",
        AsyncMock(return_value=BUILDING_COACH),
    )
    monkeypatch.setattr("app.api.routers.coaches.build_knowledge_for_coach", builder_mock)
    monkeypatch.setattr(
        "app.api.routers.coaches.resolve_software_name",
        AsyncMock(return_value="DaVinci Resolve"),
    )

    response = await authed_client.post(
        "/coaches",
        json={"software_name": "DaVinci Resolve"},
    )
    assert response.status_code == 201
    builder_mock.assert_called_once_with("davinci_resolve", "DaVinci Resolve")


# ---------------------------------------------------------------------------
# POST /coaches/{coach_id}/rebuild-knowledge
# ---------------------------------------------------------------------------


async def test_rebuild_knowledge_endpoint(authed_client, monkeypatch):
    monkeypatch.setattr(
        "app.api.routers.coaches.get_coach",
        AsyncMock(return_value=BLENDER_COACH),
    )
    monkeypatch.setattr(
        "app.api.routers.coaches.update_coach", AsyncMock(return_value=BLENDER_COACH)
    )
    monkeypatch.setattr("app.api.routers.coaches.build_knowledge_for_coach", AsyncMock())
    response = await authed_client.post("/coaches/blender/rebuild-knowledge")
    assert response.status_code == 202
    assert response.json()["status"] == "building"


async def test_rebuild_knowledge_not_found(authed_client, monkeypatch):
    monkeypatch.setattr("app.api.routers.coaches.get_coach", AsyncMock(return_value=None))
    response = await authed_client.post("/coaches/nonexistent/rebuild-knowledge")
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# PUT /coaches/{coach_id}
# ---------------------------------------------------------------------------


async def test_update_coach_not_found(authed_client, monkeypatch):
    monkeypatch.setattr("app.api.routers.coaches.update_coach", AsyncMock(return_value=None))
    monkeypatch.setattr("app.api.routers.coaches.get_coach", AsyncMock(return_value=None))
    response = await authed_client.put(
        "/coaches/nonexistent",
        json={"display_name": "New Name"},
    )
    assert response.status_code == 404


async def test_rebuild_knowledge_idempotent_while_building(authed_client, monkeypatch):
    """Rebuild endpoint returns 202 immediately when already building (no duplicate task)."""
    builder_mock = AsyncMock()
    monkeypatch.setattr(
        "app.api.routers.coaches.get_coach",
        AsyncMock(return_value=BUILDING_COACH),
    )
    monkeypatch.setattr("app.api.routers.coaches.build_knowledge_for_coach", builder_mock)

    response = await authed_client.post("/coaches/davinci_resolve/rebuild-knowledge")
    assert response.status_code == 202
    assert response.json()["status"] == "building"
    builder_mock.assert_not_called()
