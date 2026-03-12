# Unreal Engine 5 Modern Features (5.3–5.5)

## MegaLights (5.5) — HIGH IMPACT

- Enables **thousands of shadow-casting dynamic lights** simultaneously
- Old advice: "Keep dynamic lights to a minimum for performance" → no longer universally true
- MegaLights uses a novel GPU algorithm; works best with many point/spot lights
- Enable: Project Settings → Rendering → Lights → MegaLights
- Still has tradeoffs: some fringe cases (e.g., very tight interiors) may prefer traditional lights

## Nanite Expanded Support

| Version | Nanite Supports |
|---------|----------------|
| 5.0–5.2 | Static Meshes only |
| 5.3+    | **Landscapes** — enable in Landscape details panel |
| 5.4+    | **Tessellation & Displacement** — real geometric detail from height maps |
| 5.5+    | **Skeletal Meshes** — film-quality characters without LOD pressure |

- Translucent materials on Nanite meshes: still unsupported (use Opaque or Masked)

## PCG (Procedural Content Generation) — 5.2+

- PCG Graph: node-based procedural placement and generation
- 5.4+: PCG **Biome System** — hierarchical ecosystem generation
  - Define biomes with rules; PCG fills terrain with appropriate foliage, rocks, props
  - Replaces manual Foliage Tool for large-scale world building
- Access: Place Actors → PCG Volume, then assign a PCG Graph asset

## Motion Design Mode (5.4)

- Dedicated **Motion Design** mode (formerly "Avalanche" in early access)
- Cinema 4D-style cloners, effectors, and layer-based compositing inside Unreal
- **Material Designer**: Photoshop-like layer-based material creation (no node graph needed)
- Useful for: broadcast graphics, real-time motion graphics, virtual production

## In-Engine Skeletal Editing (5.3+)

- **Skeletal Editor**: Rig and paint bone weights directly in Unreal
  - Open: double-click a Skeletal Mesh → Skeleton tab → Edit
- Reduces need to round-trip to Blender/Maya just for minor rigging fixes

## Modeling Mode

- Significantly more capable since 5.0; by 5.4 supports full asset creation workflows
- Enable: top toolbar Mode Switcher → Modeling
- Tools: PolyEdit, TriModel, UVs, Bake, Attributes
- Useful for: quick prototype meshes, fixing imported geometry

## World Partition & Large Worlds

- **World Partition**: levels are now infinite-size; streaming cells auto-generated
- **One File Per Actor (OFPA)**: each Actor is its own asset → no more level merge conflicts in teams
- Old approach of manually splitting large levels into sub-levels still works but is legacy
