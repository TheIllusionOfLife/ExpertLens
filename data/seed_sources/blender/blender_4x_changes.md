# Blender 4.x Breaking Changes (vs 3.x)

## Animation Keying (4.0) — HIGH IMPACT

| Action | Blender 3.x | Blender 4.0+ |
|--------|-------------|--------------|
| Insert keyframe | `I` → opens type picker menu | `I` → inserts immediately |
| Open keyframe type menu | (was `I`) | **`K`** |

If a user presses `I` and expects a menu, they are on 4.0+. Tell them to press `K` for the picker.

## EEVEE Next (4.2) — HIGH IMPACT

- EEVEE was completely rewritten. The new engine is "EEVEE Next".
- **Bloom is GONE from Render Properties.** The checkbox no longer exists.
  - Bloom → now done via the **Glare node** in the Compositor
  - Enable: Render Properties → Post Processing → Compositing, then add Glare node
- Screen Space Reflections replaced by actual ray-traced reflections (lower cost, better quality)
- Screen Space Ambient Occlusion still available but SSGI provides better results

## Auto Smooth (4.1) — MEDIUM IMPACT

- The "Auto Smooth" checkbox in Mesh Data Properties is **removed**
- Old workflow: Shade Smooth → enable Auto Smooth → set angle
- New workflow: Shade Smooth (Auto) via right-click, OR add **"Smooth by Angle" modifier**
  - Modifier: Properties → Modifier tab → Add Modifier → Smooth by Angle
  - Angle parameter controls the threshold (same as the old checkbox)
  - Modifier approach is non-destructive and shows in the modifier stack

## Grease Pencil 3.0 (4.3) — MEDIUM IMPACT

- Grease Pencil objects were completely rewritten
- Now integrated with Geometry Nodes — procedural 2D/2.5D effects possible
- Stroke format changed; old .blend files with Grease Pencil may need conversion

## Sculpt Mode Shortcut Changes (4.0)

Key tools were reassigned for consistency. Old muscle memory from 3.x will activate the wrong tool:

| Key | Blender 3.x | Blender 4.0+ |
|-----|-------------|--------------|
| `S` | Scale (grab handle) | **Smooth** brush |
| `V` | (Draw shortcut context) | **Draw** brush |

If a user in Sculpt Mode says "S isn't doing what I expect" — they likely learned on 3.x.

## Modifier Search (4.0+)

- Modifiers are now categorized in a searchable popup (Shift+A style)
- Previously: flat scrolling list
- Workflow same; just type to search modifier name

## Bone Layers → Bone Collections (4.0)

- Old: 32 anonymous dot-layers for bones
- New: **Named Bone Collections** (like object collections)
- Old .blend rigs auto-converted; custom scripts using layer indices break
