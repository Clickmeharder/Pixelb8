# PixelB8 Pool Table Set

`pixelb8.pool-set` is the first portable interactive asset set for the PixelB8 Spatial Runtime.

The intended end state is that a world author can place the pool set without knowing anything about the Arcade implementation:

```js
const pool = runtime
  .registry
  .getAsset('pixelb8.pool-set')
  .create({
    id: 'rooftop-pool',
    position: [4, 0, -2],
    rotation: [0, 90, 0]
  });

pool.mount(worldContext);
```

## What belongs to the asset

The set owns the pool table, sixteen balls, cues, cue rack, bridge rest, triangle rack, cue/table collision, ball physics, aiming, Reach, cue elevation, jump shots, trajectory prediction, rules, manual/automatic racking, ball-in-hand, and pocketed-ball state.

A world should only provide placement, player/runtime services, networking/session services, and optional theme overrides.

## Current migration stage

This release establishes the **asset contract and manifest** while the working geometry and gameplay remain inside `arcade/xr/app.js` through a legacy adapter. This avoids destabilizing the pool table while we extract it.

The next migration stage is to move these pieces behind the asset boundary in order:

1. geometry/material construction
2. pool state + serialization
3. cue/ball physics
4. input bindings
5. HUD adapter
6. multiplayer session synchronization

When those are complete, the Arcade world will only spawn the asset. No Pool-specific code should remain in the world implementation.

## Asset design rules

Portable PixelB8 assets should:

- have a stable asset ID and semantic version
- accept position/rotation/instance configuration
- never assume a specific world or page
- declare required runtime capabilities
- keep gameplay state serializable
- expose mount/interact/update/serialize/destroy lifecycle methods
- communicate through runtime events/services instead of directly reaching into unrelated world code
- support multiple independent instances when practical
- separate optional UI from core simulation


## v0.33 separation

The pool table no longer owns cue inventory. `pixelb8.pool-cue` is a unique held/inventory item, while `pixelb8.pool-cue-rack` is a separate four-slot container asset that ships with two cue instances. The table declares cue compatibility instead of manufacturing cues.
