"""Knowledge builder: generates coach knowledge via Gemini + Google Search grounding."""

import asyncio
import logging
import re
from datetime import UTC, datetime

from google import genai
from google.genai import types

from app.api.db.coach_repo import get_coach, update_coach
from app.api.db.knowledge_repo import save_chunk
from app.api.db.models import KnowledgeChunk

logger = logging.getLogger(__name__)

# Coach IDs that are pre-validated presets — skip software validation for these.
KNOWN_PRESET_IDS = frozenset({"blender", "affinity_photo", "unreal_engine", "fusion", "zbrush"})

_GEMINI_MODEL = "gemini-3-flash-preview"
_BUILD_TIMEOUT_SECONDS = 300  # was 240 — more content takes slightly longer
_VALIDATE_TIMEOUT_SECONDS = 20

PROMPT_TEMPLATE = """
You are building a reference knowledge base for a real-time AI voice coach named ExpertLens.
The coach watches the user's screen and answers questions about {software_name}
while the user works.

Use Google Search to verify all content against the LATEST stable release of {software_name}.
Flag version-specific behavior where it differs across major releases.

Generate ALL SIX sections below, exactly as specified. Each section must be self-contained
and dense — no preamble, no commentary, no repetition across sections.
Output ONLY the six sections separated by their exact ## headers.

## SHORTCUTS
A comprehensive keyboard shortcut reference organized by context/mode.
Requirements:
- Minimum 30 shortcuts total, organized into labeled subsections (### headers)
  by mode or workflow area
- Format each subsection as: | Action | Windows/Linux | macOS |
- Include modifier combinations (Shift+, Ctrl+, Alt+)
- Flag shortcuts that changed in the latest major version with "(NEW in vX.Y)"

## WORKFLOWS
Step-by-step guides for the 6 most common beginner-to-intermediate tasks.
Requirements:
- Each workflow has a ### title (e.g., "### UV Unwrap a Mesh")
- Numbered steps; max 10 steps per workflow; every step with a shortcut shows: Key (Menu fallback)
- End each workflow with: > Common mistake: ...

## COMMON_ERRORS
The 15 most frequent mistakes and errors beginners encounter.
Format as a markdown table: | Error/Symptom | Cause | Fix |
Sort by frequency (most common first). Fix must be actionable — no "check documentation".

## DEEP_CONCEPTS
In-depth explanations of 5 foundational concepts users frequently misunderstand.
Each concept: ### title, 150-300 words, a practical example, and the single most
common misconception.

## VERSION_CHANGES
Breaking changes and significant new features in the latest 2 major versions.
Format as a table: | Feature | Old Behavior | New Behavior | Impact |
Impact must be HIGH, MEDIUM, or LOW. Sort HIGH first. Minimum 8 entries.

## QUICK_REFERENCE
A dense cheatsheet of 20+ things a coach should know at a glance.
Plain bullet list, one line per item. No tables, no subheaders.
Cover: top shortcuts, most common beginner mistake, key jargon, version gotchas.
"""


REQUIRED_SECTIONS = {
    "shortcuts",
    "workflows",
    "common_errors",
    "deep_concepts",
    "version_changes",
    "quick_reference",
}


def _parse_sections(text: str) -> dict[str, str]:
    """Split generated text on ## section headers using regex line-anchored matching.

    Uses re.split to prevent mis-splits when section content contains header-like strings.
    Raises ValueError if any required section is missing or empty.
    """
    header_map = {
        "## SHORTCUTS": "shortcuts",
        "## WORKFLOWS": "workflows",
        "## COMMON_ERRORS": "common_errors",
        "## DEEP_CONCEPTS": "deep_concepts",
        "## VERSION_CHANGES": "version_changes",
        "## QUICK_REFERENCE": "quick_reference",
    }

    # re.split with a capturing group returns alternating:
    # [before, header1, content1, header2, content2, ...]
    parts = re.split(r"^(## [A-Z_]+)$", text, flags=re.MULTILINE)

    sections: dict[str, str] = {}
    for i in range(1, len(parts) - 1, 2):
        header = parts[i].strip()
        content = parts[i + 1].strip() if i + 1 < len(parts) else ""
        if header in header_map and content:
            sections[header_map[header]] = content

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
        async with asyncio.timeout(_BUILD_TIMEOUT_SECONDS):
            response = await client.aio.models.generate_content(
                model=_GEMINI_MODEL,
                contents=PROMPT_TEMPLATE.format(software_name=software_name),
                config=types.GenerateContentConfig(
                    tools=[types.Tool(google_search=types.GoogleSearch())],
                    # temperature removed — Gemini 3: setting temperature < 1.0 degrades complex
                    # reasoning. Default 1.0 is required.
                    thinking_config=types.ThinkingConfig(
                        thinking_level=types.ThinkingLevel.MINIMAL,
                    ),
                ),
            )
        if not response.text:
            raise ValueError("Gemini returned an empty response")
        sections = _parse_sections(response.text)
        # Guard against race with a concurrent delete: abort if coach no longer exists.
        if not await get_coach(coach_id):
            logger.info(f"Coach {coach_id} deleted during build — aborting chunk write")
            return
        for topic, content in sections.items():
            chunk = KnowledgeChunk(
                chunk_id=f"{coach_id}_{topic}",
                software_name=coach_id,
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
                "knowledge_error": f"{type(e).__name__}: {str(e)[:200]}",
                "knowledge_updated_at": datetime.now(UTC).isoformat(),
            },
        )


async def resolve_software_name(raw_name: str) -> str:
    """Return the canonical software name for raw_name, or raise ValueError.

    Normalises informal names, abbreviations, and minor misspellings to their
    canonical form (e.g. 'power point' → 'Microsoft PowerPoint', 'photoshop' →
    'Adobe Photoshop'). Raises ValueError with a user-facing message when the
    input cannot be resolved to a known software application.
    Fails open on timeout — returns raw_name unchanged to avoid blocking creation.
    """
    client = genai.Client()
    try:
        async with asyncio.timeout(_VALIDATE_TIMEOUT_SECONDS):
            response = await client.aio.models.generate_content(
                model=_GEMINI_MODEL,
                contents=(
                    f"What is the canonical software name for '{raw_name}'? "
                    f"If it refers to a real software application (desktop, mobile, or game), "
                    f"reply with only the canonical name (e.g. 'Microsoft PowerPoint', "
                    f"'Adobe Photoshop', 'Roblox Studio'). "
                    f"If it does not refer to any real software, reply with only: UNKNOWN"
                ),
                config=types.GenerateContentConfig(
                    tools=[types.Tool(google_search=types.GoogleSearch())],
                    thinking_config=types.ThinkingConfig(
                        thinking_level=types.ThinkingLevel.MINIMAL,
                    ),
                ),
            )
    except TimeoutError:
        logger.warning(f"Software name resolution timed out for '{raw_name}' — using as-is")
        return raw_name  # Fail open: use the raw name unchanged

    canonical = (response.text or "").strip()
    if not canonical or canonical.upper() == "UNKNOWN":
        raise ValueError(
            f"'{raw_name}' doesn't appear to refer to a real software application. "
            f"Please check the spelling (e.g., 'PowerPoint', 'Roblox Studio', 'DaVinci Resolve')."
        )
    logger.info(f"Resolved '{raw_name}' → '{canonical}'")
    return canonical
