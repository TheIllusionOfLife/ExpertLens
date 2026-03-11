# Affinity Photo Layer System

## Layer Types
- **Pixel Layer**: Raster image data; editing is destructive
- **Adjustment Layer**: Non-destructive color/tone corrections
- **Live Filter Layer**: Non-destructive filter effects
- **Mask Layer**: Controls visibility of layer below
- **Group**: Container for organizing layers
- **Shape Layer**: Vector shapes (scalable)
- **Text Layer**: Editable text

## Adjustment Layers (Most Used)
- Curves: S-curve for contrast; pull red/green/blue channels individually
- Levels: Set black/white points; adjust midpoint
- Hue/Saturation: Shift colors; target specific color ranges
- Brightness/Contrast: Quick overall adjustment
- Color Balance: Shift shadows/midtones/highlights toward a color

## Clipping Masks
- Alt+click between two layers in panel to clip upper to lower
- Upper layer only shows where lower layer has pixels
- Use for: applying adjustments to single layer only

## Layer Masks
- Click Mask button in Layers panel or Layer → Mask Layer
- Paint black to hide, white to reveal
- Fill with black (Cmd+Delete) to hide all, then paint white to reveal

## Blend Modes
Organized by function:
- Normal: no blending
- **Darken group**: Darken, Multiply, Color Burn
- **Lighten group**: Lighten, Screen, Color Dodge, Add
- **Contrast group**: Overlay, Soft Light, Hard Light
- **Inversion**: Difference, Exclusion
- **Component**: Hue, Saturation, Color, Luminosity

## Organization Tips
- Name all layers — double-click to rename
- Color-code with right-click → Layer Color
- Collapse groups when not in use
- Group related layers (Cmd+G) before adjustments
- Lock layers you're not editing (lock icon in Layers panel)
