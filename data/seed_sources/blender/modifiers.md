# Blender Key Modifiers

## Most-Used Modifiers

### Subdivision Surface
- Smooths geometry by subdividing faces
- Viewport Levels: keep at 1-2; Render Levels: 2-3
- **Tip**: Add edge loops (Ctrl+R) near edges to control sharpness
- Crease edges: Select edge, Shift+E → drag to 1.0 for hard edge

### Mirror
- Mirrors geometry across an axis (X/Y/Z)
- Enable "Clipping" to merge center vertices automatically
- **Must apply Scale (Ctrl+A) before adding if object is transformed**
- Work on one half, the other updates in real-time

### Boolean
- Union: Combine two meshes | Difference: Subtract | Intersect: Keep overlap
- Apply the modifier to make the result permanent
- **Tip**: Use "Fast" solver for speed; "Exact" for complex shapes

### Solidify
- Adds thickness to thin surfaces (great for shells, panels)
- "Even Thickness" option prevents pinching on curved surfaces

### Bevel
- Rounds edges; Amount = bevel width; Segments = smoothness
- Profile = 1.0 for round bevel
- **Workflow**: Add Subdivision first, then Bevel for control loops

### Array
- Creates repeating copies along an axis
- Combine with Curve modifier for railroad-track patterns

### Curve / Shrinkwrap
- Curve: Deforms mesh along a Bezier/NURBS curve
- Shrinkwrap: Snaps mesh onto another surface (great for decals)

## Modifier Stack Order
1. Mirror (always first for symmetry)
2. Array (if using)
3. Subdivision Surface
4. Solidify (if needed)
5. Bevel (for hard-surface control)
6. Armature (always last for deformation)
