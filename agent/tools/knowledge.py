"""Coach knowledge retrieval tool — stub implementation for PR1."""
# PR3 replaces this with real Firestore queries.

BLENDER_KNOWLEDGE: dict[str, str] = {
    "shortcuts": """
Blender Essential Shortcuts:
- G: Grab/Move | R: Rotate | S: Scale
- G+X/Y/Z: Constrain to axis | Tab: Toggle Edit/Object mode
- Ctrl+Z: Undo | Shift+D: Duplicate | X: Delete
- Numpad 0: Camera view | Numpad 5: Toggle ortho/perspective
- Ctrl+Alt+0: Align camera to view
- Loop cut: Ctrl+R | Knife: K | Extrude: E
- F3: Search menu | N: Properties panel | T: Tools panel
""",
    "modeling_basics": """
Blender Modeling Workflow:
1. Add mesh: Shift+A → Mesh → choose primitive
2. Enter Edit Mode: Tab
3. Select vertices/edges/faces: 1/2/3 keys
4. Extrude: E (extrude along normal), Alt+E for options
5. Loop cut: Ctrl+R, scroll to add more cuts
6. Merge vertices: M → By Distance (to remove duplicates)
7. Apply transforms before rigging: Ctrl+A → All Transforms
""",
    "common_errors": """
Common Blender Errors & Fixes:
- Black faces: Normal direction reversed → Select all, Mesh → Normals → Recalculate Outside
- Object not moving to cursor: Check pivot point (period key menu)
- Render is all black: Check camera is in scene, light exists
- Modifier not applying: Apply scale first (Ctrl+A), check mesh has no loose parts
- Can't select in Edit Mode: Check X-Ray mode (Alt+Z) for hidden geometry
""",
}

DEFAULT_KNOWLEDGE = "I'm your expert coach. Ask me anything about the software you're using!"


def get_coach_knowledge_stub(topic: str) -> dict[str, str]:
    """Stub: return hardcoded Blender knowledge by topic."""
    topic_lower = topic.strip().lower()
    if not topic_lower:
        return {"content": DEFAULT_KNOWLEDGE, "topic": topic, "source": "stub"}
    for key, content in BLENDER_KNOWLEDGE.items():
        if key in topic_lower or topic_lower in key:
            return {"content": content, "topic": topic, "source": "stub"}
    return {"content": DEFAULT_KNOWLEDGE, "topic": topic, "source": "stub"}
