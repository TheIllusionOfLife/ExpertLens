# Blender Common Errors & Fixes

## Visual Issues

### Black/Dark Faces
**Cause**: Normals are flipped (face pointing inward)
**Fix**: Edit Mode → Select All (A) → Mesh → Normals → Recalculate Outside
**Shortcut**: Shift+N in Edit Mode

### Z-Fighting (flickering between two surfaces)
**Cause**: Two faces occupy the same space
**Fix**: Delete or move one of the overlapping faces. Increase Clip Start in camera settings.

### Object Appears Black in Render
**Cause**: No material, no light, or normals flipped
**Check**: Add light (Shift+A → Light), add material, check normals

### Render is Pink
**Cause**: Missing texture file (moved or deleted)
**Fix**: Open Image Editor → Image → Replace, or re-link in Shader Editor

## Geometry Issues

### Can't Select All Vertices
**Cause**: Hidden geometry or linked but separate meshes
**Fix**: Alt+H to unhide all, or check X-Ray mode (Alt+Z)

### Object Has Wrong Shape After Mirror
**Cause**: Scale not applied before Mirror modifier
**Fix**: Ctrl+A → Scale, then re-apply Mirror modifier

### Subdivision Creates Unexpected Pinching
**Cause**: N-gons or triangle near subdivision
**Fix**: Convert to quads or add supporting edge loops near problem area

### Gap in Mirror Modifier
**Cause**: Origin not at center, or Clipping not enabled
**Fix**: Enable "Clipping" in Mirror modifier + merge center vertices (M → Merge by Distance)

## Performance Issues

### Viewport Slow / Lagging
**Fix**:
- Reduce Subdivision Surface level in viewport (not render)
- Disable heavy modifiers in viewport with eye icon
- Use Simplify in Scene Properties

### Render Takes Forever
**Fix**:
- Reduce samples (Render Properties → Samples): 128 often enough for preview
- Use Denoising (Render Properties → Denoising)
- EEVEE is faster than Cycles for non-photoreal work

## Rigging / Animation Issues

### Bone Deforms Wrong Area
**Cause**: Weight painting is incorrect
**Fix**: Weight Paint mode → paint correct influence

### Object Jumps When Entering Pose Mode
**Cause**: Rest pose was not set or transforms not applied
**Fix**: Apply All Transforms (Ctrl+A) before rigging, then recalculate rest pose
