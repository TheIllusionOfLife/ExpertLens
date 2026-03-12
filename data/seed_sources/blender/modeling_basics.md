# Blender Modeling Basics

## Core Workflow
1. Add mesh: Shift+A → Mesh → choose primitive
2. Enter Edit Mode: Tab
3. Model using extrude (E), loop cut (Ctrl+R), bevel (Ctrl+B)
4. Apply transforms before export: Ctrl+A → All Transforms
5. Check normals: Overlay → Face Orientation (blue=outside, red=inside)

## Common Operations

### Extrude
- E: Extrude along face normals
- Alt+E: Extrude menu (along normals, individual faces, etc.)
- Ctrl+click: Extrude to cursor

### Loop Cut & Slide
- Ctrl+R: Loop cut | Scroll: add more cuts | Right-click: center cut
- G+G: Edge slide after loop cut

### Subdivide
- Right-click in Edit Mode → Subdivide
- Ctrl+1/2/3: Add Subdivision Surface modifier (non-destructive)

### Merging Vertices
- M (Edit Mode): Merge at First/Last/Center/Cursor
- Mesh → Merge by Distance: Remove doubles (set threshold)

### Smooth Shading (CHANGED in Blender 4.1)
- **Old (3.x/4.0)**: Right-click → Shade Smooth, then enable "Auto Smooth" checkbox in Mesh Properties
- **New (4.1+)**: Right-click → Shade Smooth (auto), OR add **"Smooth by Angle" modifier** (non-destructive)
  - The "Auto Smooth" checkbox in Mesh Data Properties no longer exists
  - Modifier approach: Properties → Modifier → Add → Smooth by Angle (set angle threshold)

### Boolean Operations
- Modifier → Boolean: Union/Difference/Intersect
- Apply modifier to make permanent

## Topology Tips
- Keep quad faces (4-sided) for smooth deformation
- Triangles at poles are acceptable; avoid n-gons in deforming areas
- Edge loops for organic shapes; follow muscle/mechanical structure
- Mirror modifier with Clipping: model one half, mirror automatically

## Origin & Transforms
- Right-click → Set Origin: Origin to Geometry/Cursor/Center of Mass
- Ctrl+A → All Transforms: MUST apply before exporting or rigging
- Object can look correct but have bad transforms — always check before sharing

## Modifiers Order Matters
Correct order (top to bottom):
1. Mirror
2. Subdivision Surface
3. Solidify (for thin surfaces)
4. Bevel (after subdivision for control)
