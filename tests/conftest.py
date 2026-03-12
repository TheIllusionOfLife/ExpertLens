"""Shared pytest fixtures for ExpertLens backend tests."""

from unittest.mock import AsyncMock, MagicMock

import httpx
import pytest

from app.api.main import app


def _make_mock_doc(data: dict, *, exists: bool = True) -> MagicMock:
    doc = MagicMock()
    doc.exists = exists
    doc.to_dict.return_value = data
    return doc


def _make_async_iter(items: list) -> AsyncMock:
    """Return an async iterable that yields the given items."""

    async def _aiter():
        for item in items:
            yield item

    mock = MagicMock()
    mock.__aiter__ = lambda _: _aiter()
    return mock


@pytest.fixture
def mock_firestore(monkeypatch):
    """Monkeypatch Firestore client with a configurable AsyncMock.

    Patches get_client() at each call-site (repos import it directly via
    `from ... import get_client`), so the mock is seen everywhere.
    The lru_cache is cleared on the *original* function (saved before patching).
    """
    from app.api.db import firestore as fs_module

    # Save reference to original before monkeypatching replaces the attribute
    original_get_client = fs_module.get_client
    original_get_client.cache_clear()

    mock_client = MagicMock()

    # Default: empty stream
    mock_client.collection.return_value.stream.return_value = _make_async_iter([])
    # Default: document does not exist
    mock_client.collection.return_value.document.return_value.get = AsyncMock(
        return_value=_make_mock_doc({}, exists=False)
    )
    mock_client.collection.return_value.document.return_value.set = AsyncMock()
    mock_client.collection.return_value.document.return_value.create = AsyncMock()
    mock_client.collection.return_value.document.return_value.update = AsyncMock()

    # Patch at the module level AND at each direct import call-site
    _patch = lambda: mock_client  # noqa: E731
    monkeypatch.setattr(fs_module, "get_client", _patch)
    monkeypatch.setattr("app.api.db.coach_repo.get_client", _patch)
    monkeypatch.setattr("app.api.db.knowledge_repo.get_client", _patch)

    yield mock_client

    original_get_client.cache_clear()


@pytest.fixture
def make_doc():
    """Helper to build mock Firestore documents."""
    return _make_mock_doc


@pytest.fixture
def make_async_iter():
    return _make_async_iter


@pytest.fixture
async def async_client(mock_firestore):
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://test"
    ) as client:
        yield client
