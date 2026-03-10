"""Minimal ADK agent container for the Live Software Expert."""
# ADK serves as the logical container for agent identity and tool declarations.
# The actual Gemini Live session is managed by app/api/ws/gemini_session.py
# using the google-genai SDK directly, since ADK doesn't natively handle
# bidirectional audio streaming.

AGENT_NAME = "ExpertLens Live Software Coach"
AGENT_VERSION = "0.1.0"

SUPPORTED_SOFTWARE = ["Blender", "Affinity Photo", "Unreal Engine"]
