# Affinity Photo Retouching Techniques

## Non-Destructive Workflow
Always prefer adjustment layers over direct pixel editing:
1. Add adjustment layer (Layer → New Adjustment Layer)
2. Adjustment clips to layer below (Alt+click between layers)
3. Use masks to control where adjustment applies
4. Original pixels remain untouched

## Key Retouching Tools

### Healing Brush (J)
- Samples texture from source, blends with target color/tone
- Best for: blemishes, skin imperfections, small removals
- Method: Alt+click to set source, paint over problem area

### Clone Stamp (S)
- Exact pixel copy from source to target
- Best for: repeating patterns, structured areas
- Alt+click source, paint to clone

### Inpainting Brush
- Uses AI to fill areas by analyzing surroundings
- Best for: removing objects with complex backgrounds
- Select area first, then paint or use Edit → Inpaint

### Frequency Separation
1. Duplicate layer twice (Cmd+J twice)
2. Top layer: High Pass filter for texture
3. Bottom layer: Gaussian Blur for color/tone
4. Set top layer to Linear Light blend mode
5. Retouch texture and color independently

## Skin Retouching Workflow
1. Blemish removal: Healing brush on new pixel layer
2. Frequency separation for skin smoothing
3. Dodge/Burn for contouring (use 50% gray layer, Overlay mode)
4. Color grading with Curves/Color Balance adjustment layers

## Masks
- White: shows layer | Black: hides layer
- Paint black to hide, white to reveal
- Refine Selection: handles hair/fur edges
- Feather mask: soft transition
- Luminosity mask: affect only lights/darks

## Blend Modes (Key Ones)
- Multiply: darken (like stacking transparencies)
- Screen: lighten (like projecting two slides)
- Overlay: increase contrast (blend of Multiply + Screen)
- Soft Light: subtle Overlay (great for dodging/burning)
- Luminosity: apply color change without affecting tone
