# Unreal Engine 5 Blueprints Guide

## Blueprint Basics
Blueprints are visual scripting. Each node = a function call. Data flows via wires.

### Node Types
- **Events**: Entry points (Event BeginPlay, Event Tick, custom events)
- **Functions**: Execute operations, can return values
- **Variables**: Store data (bool, int, float, vector, object reference)
- **Macros**: Reusable node groups (only within same Blueprint)
- **Flow Control**: Branch, Sequence, ForLoop, WhileLoop, Switch

### Common Patterns

**BeginPlay setup:**
```
Event BeginPlay → [Your initialization logic]
```

**Tick-based update:**
```
Event Tick → [Delta Seconds input available] → [Per-frame logic]
```
Note: Avoid Tick for anything that can use events/timers — it runs every frame.

**Timer:**
```
Event BeginPlay → Set Timer by Function Name → [set Interval, Looping]
```

**Branch (if statement):**
```
[Condition] → Branch → [True] / [False]
```

## Input & Player Control (Enhanced Input System — UE5 default)
UE5 uses the **Enhanced Input System** by default. The old Action/Axis Mappings are LEGACY.

### Enhanced Input workflow:
1. **Create an InputAction asset**: Content Browser → Add → Input → Input Action
   - Set Value Type (Digital = button, Axis1D = axis like throttle, Axis2D = mouse/stick)
2. **Create an InputMappingContext asset**: Content Browser → Add → Input → Input Mapping Context
   - Open it → Add mapping → select your InputAction → assign keys
3. **Add the mapping context in Blueprint**:
   - Event BeginPlay → Get Player Controller → Get Enhanced Input Local Player Subsystem
   → Add Mapping Context (select your IMC asset, Priority 0)
4. **Bind action in Blueprint**:
   - Right-click graph → search "Enhanced Action Events" → select your InputAction
   - Use Triggered / Started / Completed pins

### Key difference from legacy:
- Old: "InputAction Jump" event lived in Project Settings
- New: InputAction and InputMappingContext are **Content Browser assets** you create per project

## Components & Actors
- Components are attached to Actors
- Static Mesh Component: visual geometry
- Collision Component: physics interaction
- Character Movement Component: built-in movement for characters

## Communication Between Blueprints
- **Cast To**: Get reference to specific Blueprint type
- **Event Dispatcher**: One Blueprint broadcasts; others subscribe
- **Interface**: Define function contracts across Blueprint types
- **Game Instance**: Persist data across level loads

## Common Blueprint Tasks

### Move Object
```
Event Tick → Add Actor World Offset → [Delta Location vector]
```

### Spawn Actor
```
Spawn Actor from Class → [Class, Transform] → [Returns actor reference]
```

### Get/Set Variable
- Variables panel (left side) → drag to graph
- Drag onto graph: "Get" reads value, "Set" changes value
- Promote to Variable: right-click a wire → "Promote to Variable"
