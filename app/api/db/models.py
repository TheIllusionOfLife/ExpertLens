"""Pydantic models for Firestore data: Coach, UserPreferences, Session, KnowledgeChunk."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class UserPreferences(BaseModel):
    interaction_style: str = "shortcuts"  # shortcuts | mouse | both
    tone: str = "concise_expert"  # concise_expert | calm_mentor | enthusiastic
    depth: str = "medium"  # short | medium | detailed
    proactivity: str = "reactive"  # reactive | balanced | proactive
    response_language: str = "english"


class Coach(BaseModel):
    coach_id: str
    software_name: str
    display_name: str
    persona: str
    focus_areas: list[str] = Field(default_factory=list)
    icon: str = "🎯"
    default_preferences: UserPreferences = Field(default_factory=UserPreferences)
    knowledge_index_id: str = ""
    knowledge_status: Literal["none", "building", "ready", "error"] = "none"
    knowledge_error: str = ""
    knowledge_updated_at: str = ""
    owner_id: str | None = None  # None = preset/public; UUID = private to that user


class Session(BaseModel):
    session_id: str
    coach_id: str
    user_id: str = ""
    started_at: str
    ended_at: str | None = None
    summary: str | None = None
    last_topics: list[str] = Field(default_factory=list)


class KnowledgeChunk(BaseModel):
    """A curated knowledge snippet for a specific coach.

    coach_id stores the coach slug (e.g. "blender"), which equals Coach.coach_id.
    The Firestore field is keyed as "software_name" (alias) for backward compatibility
    with seeded documents and existing query filters.
    """

    model_config = ConfigDict(populate_by_name=True)

    chunk_id: str
    coach_id: str = Field(..., alias="software_name")  # Firestore key: "software_name"
    topic: str
    content: str
    difficulty_level: str = "beginner"  # beginner | intermediate | advanced
    tags: list[str] = Field(default_factory=list)


class CoachCreate(BaseModel):
    software_name: str = Field(..., min_length=1, max_length=100)
    display_name: str | None = Field(default=None, max_length=200)
    persona: str | None = Field(default=None, max_length=2000)
    focus_areas: list[str] = Field(default_factory=list, max_length=20)
    icon: str = Field(default="🎯", max_length=10)


class CoachUpdate(BaseModel):
    """Only the fields callers are permitted to change on an existing coach."""

    display_name: str | None = Field(default=None, max_length=200)
    persona: str | None = Field(default=None, max_length=2000)
    focus_areas: list[str] | None = Field(default=None, max_length=20)
    icon: str | None = Field(default=None, max_length=10)


class PreferencesUpdate(BaseModel):
    interaction_style: str | None = Field(default=None, max_length=50)
    tone: str | None = Field(default=None, max_length=50)
    depth: str | None = Field(default=None, max_length=50)
    proactivity: str | None = Field(default=None, max_length=50)
    response_language: str | None = Field(default=None, max_length=50)
