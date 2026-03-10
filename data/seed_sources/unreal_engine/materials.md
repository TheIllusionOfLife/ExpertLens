# Unreal Engine 5 Materials Guide

## Material Basics
Materials define how a surface looks. Material Editor = node graph.

### Output Pins (PBR workflow)
- **Base Color**: Albedo/diffuse color (RGB)
- **Metallic**: 0=non-metal, 1=metal (use only 0 or 1, rarely in-between)
- **Roughness**: 0=mirror, 1=fully rough
- **Normal**: Surface detail from normal map (must use Normal Map node)
- **Emissive Color**: Self-illumination (multiplied for HDR glow)
- **Opacity**: Transparency (enable in Material settings: Blend Mode = Translucent)

### Common Node Types
- **Constant**: Single float value | **Constant3Vector**: Color (RGB)
- **Texture Sample**: Reads a texture; connect UV or use default
- **Lerp (LinearInterpolate)**: Blend between A and B using Alpha (0-1)
- **Multiply/Add/Clamp**: Math operations
- **TextureCoordinate**: UV coordinates (tiling: change U/V Tiling)
- **Normal Map**: Use for normal maps — NEVER plug normal map directly into Normal pin

### Quick Material Setup (PBR)
1. Texture Sample (Albedo) → Base Color
2. Texture Sample (Normal) → Normal Map node → Normal
3. Constant (Metallic 0 or 1) → Metallic
4. Texture Sample or Constant → Roughness

## Material Instances
- Right-click Material → Create Material Instance
- Expose parameters: right-click node → "Convert to Parameter"
- Instance overrides parent without recompiling shader
- Use for: variations of same material (different colors, wetness levels)

## Common Materials

### Glass
- Blend Mode: Translucent | Lighting Mode: Surface Translucency Volume
- Roughness: 0.0 | Metallic: 0.0 | Opacity: 0.1-0.3
- Add Fresnel node: edges more opaque

### Emissive (Glowing)
- Emissive Color = Texture or Color × Intensity (10-100 for visible glow)
- Enable Bloom in Post Process Volume for visible glow in scene

### Landscape Material
- Use Landscape Layer Blend node
- Each layer: grass, rock, dirt with own textures
- Layer Info Objects needed per layer

## Material Tips
- Avoid too many Texture Samples (performance)
- Use Material Functions for reusable node groups
- Check shader complexity (View → Shader Complexity) — green=good, red=expensive
- Nanite meshes: avoid masked/translucent materials (use opaque)
