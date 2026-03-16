"""Generate a session summary via Gemini text API."""

import json
import logging

from google import genai
from google.genai import types

from app.api.config import settings

logger = logging.getLogger(__name__)

_client = genai.Client(api_key=settings.gemini_api_key)

PROMPT = """\
Summarize this {software} coaching session in 2-3 sentences covering what was worked on
and what the user was trying to accomplish.
Then extract 3-5 topic keywords.

Session transcript (User = student, Coach = AI expert):
{transcript}"""


async def summarize_session(coach_id: str, lines: list[str]) -> tuple[str, list[str]]:
    """Summarize coach transcript and return (summary, topics)."""
    software = coach_id.replace("_", " ").title()
    transcript = "\n".join(f"- {line}" for line in lines[-20:])
    response = await _client.aio.models.generate_content(
        model="gemini-3-flash-preview",
        contents=PROMPT.format(software=software, transcript=transcript),
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema={
                "type": "object",
                "properties": {
                    "summary": {"type": "string"},
                    "topics": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["summary", "topics"],
            },
            thinking_config=types.ThinkingConfig(
                thinking_level=types.ThinkingLevel.MINIMAL,
            ),
        ),
    )
    data = json.loads(response.text or "{}")
    summary = data.get("summary", "")
    topics = data.get("topics", [])
    if not isinstance(summary, str):
        summary = ""
    if not isinstance(topics, list):
        topics = []
    topics = [t for t in topics if isinstance(t, str)]
    return summary, topics
