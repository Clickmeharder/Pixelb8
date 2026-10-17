# PixelDimension

PixelDimension is the shared spatial foundation for PixelB8.

This first version intentionally leaves the existing `/arcade/` implementation
untouched. PixelDimension is added beside it and links to it as a destination.

## Included worlds

- `/pixeldimension/index.html` — PixelDimension Home
- `/pixeldimension/worlds/classroom/index.html`
- `/pixeldimension/worlds/example-room/index.html`
- `/pixeldimension/worlds/void-test/index.html`
- `/arcade/xr/index.html` — existing Arcade, unchanged

## Shared core

All PixelDimension rooms use one shared player controller:

- rig-level WASD movement
- R run/walk toggle
- Space jump
- stamina
- inventory shell
- interaction prompt
- common collision pass

This avoids the duplicate-locomotion issue that caused the old void test to
rubber-band while the Arcade itself remained smooth.

## Direction

Rooms and buildings compose assets. Assets may be simple geometry, furniture,
seats, doors, inventory items, or complex interactive systems such as Pool.
The core should stay small and provide shared systems without restricting what
an asset is allowed to implement.
