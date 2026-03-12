"""Knowledge builder: generates coach knowledge via Gemini + Google Search grounding."""

import asyncio
import logging
from datetime import UTC, datetime

from google import genai
from google.genai import types

from app.api.db.coach_repo import update_coach
from app.api.db.knowledge_repo import save_chunk
from app.api.db.models import KnowledgeChunk

logger = logging.getLogger(__name__)

PROMPT_TEMPLATE = """
You are building a knowledge base for an AI coach that helps users learn {software_name}.
Generate all three sections below. Use Google Search to ensure the content is current
(latest stable version).

## SHORTCUTS
A markdown table of the 20 most important keyboard shortcuts organized by category.
Format: | Action | Windows/Linux | macOS |

## WORKFLOW
Step-by-step guides for the 5 most common beginner workflows. Use numbered lists.

## COMMON_ERRORS
The 10 most frequent mistakes/errors beginners encounter with their solutions. Use a table:
| Error | Cause | Fix |

Output ONLY the three sections separated by the exact headers:
## SHORTCUTS, ## WORKFLOW, ## COMMON_ERRORS
"""


REQUIRED_SECTIONS = {"shortcuts", "workflow", "common_errors"}


def _parse_sections(text: str) -> dict[str, str]:
    """Split generated text on ## section headers into a topic → content map.

    Raises ValueError if any required section is missing or empty.
    """
    header_map = {
        "## SHORTCUTS": "shortcuts",
        "## WORKFLOW": "workflow",
        "## COMMON_ERRORS": "common_errors",
    }
    # Find each header's position and slice the content between them
    positions: list[tuple[int, str]] = []
    for header, topic in header_map.items():
        idx = text.find(header)
        if idx != -1:
            positions.append((idx, topic))
    positions.sort()

    sections: dict[str, str] = {}
    for i, (start, topic) in enumerate(positions):
        # Content starts after the header line; guard against missing newline
        newline_pos = text.find("\n", start)
        content_start = (newline_pos + 1) if newline_pos != -1 else len(text)
        content_end = positions[i + 1][0] if i + 1 < len(positions) else len(text)
        sections[topic] = text[content_start:content_end].strip()

    missing = REQUIRED_SECTIONS - sections.keys()
    if missing:
        raise ValueError(f"Gemini response missing required sections: {missing}")
    empty = {k for k, v in sections.items() if not v}
    if empty:
        raise ValueError(f"Gemini response has empty sections: {empty}")

    return sections


async def build_knowledge_for_coach(coach_id: str, software_name: str) -> None:
    """Generate knowledge chunks for a coach via a single Gemini call with Search grounding."""
    client = genai.Client()
    try:
        async with asyncio.timeout(120):
            response = await client.aio.models.generate_content(
                model="gemini-2.0-flash",
                contents=PROMPT_TEMPLATE.format(software_name=software_name),
                config=types.GenerateContentConfig(
                    tools=[types.Tool(google_search=types.GoogleSearch())],
                    temperature=0.2,
                ),
            )
        if not response.text:
            raise ValueError("Gemini returned an empty response")
        sections = _parse_sections(response.text)
        for topic, content in sections.items():
            chunk = KnowledgeChunk(
                chunk_id=f"{coach_id}_{topic}",
                software_name=coach_id,  # slug (matches seed_firestore.py + retrieval convention)
                topic=topic,
                content=content,
                difficulty_level="beginner",
                tags=[coach_id, topic],
            )
            await save_chunk(chunk)
        await update_coach(
            coach_id,
            {
                "knowledge_status": "ready",
                "knowledge_error": "",  # clear any previous error
                "knowledge_updated_at": datetime.now(UTC).isoformat(),
            },
        )
        logger.info(f"Knowledge built for coach={coach_id} ({len(sections)} sections)")
    except Exception as e:
        logger.error(f"Knowledge build failed for coach={coach_id}: {e}")
        await update_coach(
            coach_id,
            {
                "knowledge_status": "error",
                "knowledge_error": str(e),
                "knowledge_updated_at": datetime.now(UTC).isoformat(),
            },
        )
