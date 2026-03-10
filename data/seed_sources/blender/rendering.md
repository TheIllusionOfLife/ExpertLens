# Blender Rendering Guide

## Cycles vs EEVEE

### Cycles (ray-traced, photorealistic)
- Better for: glass, caustics, global illumination, product renders
- Slower; use GPU if available (Render → Device → GPU Compute)
- Samples: 128 for preview, 512-2048 for final; enable Denoising

### EEVEE (rasterized, real-time)
- Better for: stylized, fast iteration, animations
- Enable Screen Space Reflections + Ambient Occlusion for quality boost
- Bloom, Depth of Field available in Post Processing

## Render Settings

### Samples
- Render → Sampling → Render: start at 128, increase if noisy
- Enable "Denoise" (NLM or OptiX if NVIDIA GPU)

### Output Resolution
- Output Properties → Resolution: 1920×1080 for standard
- Percentage: 50% for preview renders, 100% for final

### File Format
- PNG: lossless, supports alpha | JPEG: compressed, no alpha
- OpenEXR: for compositing workflows (float precision)

## HDRI Lighting
1. World Properties → Surface → Background → Environment Texture
2. Open Image (load .hdr file) — polyhaven.com for free HDRIs
3. Strength: 1.0 default; adjust for exposure
4. Rotation: Add Mapping node between Texture Coordinate and HDRI

## Camera Settings
- Focal Length: 50mm default (realistic), 24mm (wide), 85mm (portrait)
- Depth of Field: Camera Properties → enable, set Focus Object
- Ctrl+Alt+0: Align camera to your current view

## Compositing
- Enable Compositor: Render → Post Processing → Compositing
- Use Denoising node for noise reduction in Cycles
- Glare node for bloom/glow effects
- Color Balance for final grade
