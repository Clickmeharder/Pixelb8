# PixelB8 Spatial Assets

PixelB8 Spatial assets are portable pieces of a world: furniture, games, props, inventory items, weapons, machines, decorations, tools, or complete interactive sets.

## Categories

Examples:

- `interactive-furniture-set` — pool table set, arcade cabinet
- `furniture` — chair, bench, desk, shelf
- `game` — board game, card table, Connect Four
- `inventory-item` — cue, sword, potion, key
- `weapon` — melee/ranged equipment
- `prop` — lamps, posters, plants, signage
- `room-kit` — coordinated walls/floors/furniture/materials

## Minimum lifecycle

```js
class Asset {
  mount(context) {}
  interact(player, target) {}
  update(dt) {}
  serialize() {}
  destroy() {}
}
```

Not every asset needs every method, but interactive assets should be serializable and world-independent.

## World usage

A world manifest declares asset instances by stable asset ID:

```js
assets: [
  {
    id: 'pool-main',
    asset: 'pixelb8.pool-set',
    position: [8.7, 0, 3.25],
    rotation: [0, 0, 0]
  }
]
```

The world should not contain Pool-specific implementation details.

## Distribution direction

The same contract can later support:

- PixelB8 Asset Store purchases/downloads
- creator-made free assets
- shared clan/community asset packs
- third-party websites using PixelB8 Spatial
- versioned updates
- asset permissions/licensing metadata
- server-authoritative interactive asset sessions


## Capability-first design

`asset` is intentionally broad. An asset does **not** need to implement a fixed behavior set. An ornament can be geometry only; a chair may expose `seat`; a door may expose `door`/`portal`; a sword can be an inventory/held item; a pool table can own a full simulation.

Behavior belongs to the smallest clean owner:

- Pool table: pool physics, rules, ball state, session behavior.
- Pool cue: unique item identity + held-item properties.
- Cue rack: storage slots + transfer of cue instances.
- World: placement/composition.
- Runtime: shared inventory, presence, networking, input routing, asset lifecycle.

This keeps simple assets simple without limiting complex ones.
