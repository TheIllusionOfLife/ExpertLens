"""Generate a session summary via Gemini text API."""

import json
import logging

from google import genai
from google.genai import types

from app.api.config import settings

logger = logging.getLogger(__name__)

_client = genai.Client(api_key=settings.gemini_api_key)

PROMPT = """\
Summarize this {software} coaching session in 2-3 sentences covering what was worked on.
Then extract 3-5 topic keywords.

Coach turns:
{transcript}"""


async def summarize_session(coach_id: str, lines: list[str]) -> tuple[str, list[str]]:
    """Summarize coach transcript and return (summary, topics)."""
    software = coach_id.replace("_", " ").title()
    transcript = "\n".join(f"- {line}" for line in lines[-20:])
    response = await _client.aio.models.generate_content(
        model="gemini-2.0-flash",
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
        ),
    )
    data = json.loads(response.text or "{}")
    return data.get("summary", ""), data.get("topics", [])
