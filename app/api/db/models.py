"""Pydantic models for Firestore data: Coach, UserPreferences, Session, KnowledgeChunk."""

from typing import Literal

from pydantic import BaseModel, Field


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


class Session(BaseModel):
    session_id: str
    coach_id: str
    started_at: str
    ended_at: str | None = None
    summary: str | None = None
    last_topics: list[str] = Field(default_factory=list)


class KnowledgeChunk(BaseModel):
    chunk_id: str
    software_name: str
    topic: str
    content: str
    difficulty_level: str = "beginner"  # beginner | intermediate | advanced
    tags: list[str] = Field(default_factory=list)


class CoachCreate(BaseModel):
    software_name: str = Field(..., min_length=1, max_length=100)
    display_name: str | None = None
    persona: str | None = None
    focus_areas: list[str] = Field(default_factory=list)
    icon: str = "🎯"


class CoachUpdate(BaseModel):
    """Only the fields callers are permitted to change on an existing coach."""

    display_name: str | None = None
    persona: str | None = None
    focus_areas: list[str] | None = None
    icon: str | None = None


class PreferencesUpdate(BaseModel):
    interaction_style: str | None = None
    tone: str | None = None
    depth: str | None = None
    proactivity: str | None = None
    response_language: str | None = None
