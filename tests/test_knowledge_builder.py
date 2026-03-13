"""Tests for the Gemini knowledge builder."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.api.knowledge.builder import _parse_sections, build_knowledge_for_coach

# ---------------------------------------------------------------------------
# _parse_sections unit tests
# ---------------------------------------------------------------------------


def test_build_knowledge_parse_sections_all_present():
    text = """\
## SHORTCUTS
| Action | Win | Mac |
| --- | --- | --- |
| Save | Ctrl+S | Cmd+S |

## WORKFLOW
1. Open the app
2. Do the thing

## COMMON_ERRORS
| Error | Cause | Fix |
| --- | --- | --- |
| Crash | OOM | Add RAM |
"""
    sections = _parse_sections(text)
    assert set(sections.keys()) == {"shortcuts", "workflow", "common_errors"}
    assert "Ctrl+S" in sections["shortcuts"]
    assert "Open the app" in sections["workflow"]
    assert "Crash" in sections["common_errors"]


def test_build_knowledge_parse_sections_missing_raises():
    text = "## SHORTCUTS\nsome content\n\n## WORKFLOW\nsome workflow\n"
    with pytest.raises(ValueError, match="missing required sections"):
        _parse_sections(text)


def test_build_knowledge_parse_sections_empty_raises():
    text = "## SHORTCUTS\n\n## WORKFLOW\nworkflow content\n\n## COMMON_ERRORS\nerrors content\n"
    with pytest.raises(ValueError, match="empty sections"):
        _parse_sections(text)


# ---------------------------------------------------------------------------
# build_knowledge_for_coach integration tests
# ---------------------------------------------------------------------------

VALID_RESPONSE_TEXT = """\
## SHORTCUTS
| Action | Win | Mac |
| --- | --- | --- |
| Save | Ctrl+S | Cmd+S |

## WORKFLOW
1. Step one
2. Step two

## COMMON_ERRORS
| Error | Cause | Fix |
| --- | --- | --- |
| Crash | OOM | Add RAM |
"""


async def test_build_knowledge_success():
    """Single generate_content call produces 3 save_chunk calls and sets status=ready."""
    mock_response = MagicMock()
    mock_response.text = VALID_RESPONSE_TEXT

    mock_aio = MagicMock()
    mock_aio.models.generate_content = AsyncMock(return_value=mock_response)

    mock_genai_client = MagicMock()
    mock_genai_client.aio = mock_aio

    with (
        patch("app.api.knowledge.builder.genai.Client", return_value=mock_genai_client),
        patch("app.api.knowledge.builder.save_chunk", new_callable=AsyncMock) as mock_save,
        patch("app.api.knowledge.builder.update_coach", new_callable=AsyncMock) as mock_update,
    ):
        await build_knowledge_for_coach("blender", "Blender")

    # Single generate_content call
    mock_aio.models.generate_content.assert_called_once()

    # Three chunks saved
    assert mock_save.call_count == 3
    saved_topics = {call.args[0].topic for call in mock_save.call_args_list}
    assert saved_topics == {"shortcuts", "workflow", "common_errors"}

    # Status set to ready, error cleared
    mock_update.assert_called_once()
    update_args = mock_update.call_args.args[1]
    assert update_args["knowledge_status"] == "ready"
    assert update_args["knowledge_error"] == ""


async def test_build_knowledge_gemini_error():
    """Gemini exception sets knowledge_status=error with the error message."""
    mock_aio = MagicMock()
    mock_aio.models.generate_content = AsyncMock(side_effect=RuntimeError("quota exceeded"))

    mock_genai_client = MagicMock()
    mock_genai_client.aio = mock_aio

    with (
        patch("app.api.knowledge.builder.genai.Client", return_value=mock_genai_client),
        patch("app.api.knowledge.builder.save_chunk", new_callable=AsyncMock) as mock_save,
        patch("app.api.knowledge.builder.update_coach", new_callable=AsyncMock) as mock_update,
    ):
        await build_knowledge_for_coach("blender", "Blender")

    mock_save.assert_not_called()
    update_args = mock_update.call_args.args[1]
    assert update_args["knowledge_status"] == "error"
    assert "quota exceeded" in update_args["knowledge_error"]


async def test_build_knowledge_empty_response():
    """Empty Gemini response sets knowledge_status=error."""
    mock_response = MagicMock()
    mock_response.text = None

    mock_aio = MagicMock()
    mock_aio.models.generate_content = AsyncMock(return_value=mock_response)

    mock_genai_client = MagicMock()
    mock_genai_client.aio = mock_aio

    with (
        patch("app.api.knowledge.builder.genai.Client", return_value=mock_genai_client),
        patch("app.api.knowledge.builder.save_chunk", new_callable=AsyncMock),
        patch("app.api.knowledge.builder.update_coach", new_callable=AsyncMock) as mock_update,
    ):
        await build_knowledge_for_coach("blender", "Blender")

    update_args = mock_update.call_args.args[1]
    assert update_args["knowledge_status"] == "error"


async def test_build_knowledge_timeout():
    """asyncio.timeout expiration sets knowledge_status=error with 'timeout' in message."""
    mock_aio = MagicMock()
    mock_aio.models.generate_content = AsyncMock(
        side_effect=TimeoutError("Knowledge build timed out")
    )

    mock_genai_client = MagicMock()
    mock_genai_client.aio = mock_aio

    with (
        patch("app.api.knowledge.builder.genai.Client", return_value=mock_genai_client),
        patch("app.api.knowledge.builder.save_chunk", new_callable=AsyncMock) as mock_save,
        patch("app.api.knowledge.builder.update_coach", new_callable=AsyncMock) as mock_update,
    ):
        await build_knowledge_for_coach("blender", "Blender")

    mock_save.assert_not_called()
    update_args = mock_update.call_args.args[1]
    assert update_args["knowledge_status"] == "error"
    # Real asyncio TimeoutError has no message (str(e) == ""), so only the class name is reliable
    assert "TimeoutError" in update_args["knowledge_error"]
    assert "knowledge_updated_at" in update_args


async def test_save_chunk_calls_firestore_set(mock_firestore):
    """save_chunk writes the chunk document to Firestore with the correct chunk_id."""
    from app.api.db.knowledge_repo import save_chunk
    from app.api.db.models import KnowledgeChunk

    chunk = KnowledgeChunk(
        chunk_id="blender_shortcuts",
        software_name="blender",
        topic="shortcuts",
        content="| Save | Ctrl+S | Cmd+S |",
        tags=["blender", "shortcuts"],
    )
    await save_chunk(chunk)

    mock_firestore.collection.return_value.document.assert_called_with("blender_shortcuts")
    mock_firestore.collection.return_value.document.return_value.set.assert_called_once_with(
        chunk.model_dump(by_alias=True)
    )
