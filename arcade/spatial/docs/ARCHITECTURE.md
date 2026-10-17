# PixelB8 Spatial Runtime

This folder is the migration boundary between the original XR Arcade prototype and a reusable spatial-web platform.

## World model

A logical world (for example `pixelb8-arcade`) can have many independent **instances**. The Arcade manifest currently declares a soft capacity of 24. A future room directory may place visitor 25 into another instance while friends/parties preferentially join the same instance.

## Interest management

Remote presence and world state should not be broadcast at full rate to every visitor.

- Near: ~15 Hz network transforms / detailed state.
- Mid: ~5 Hz.
- Far: ~2 Hz.
- Culled: no continuous transforms.

Local rendering still runs at the browser's frame rate. These values are networking targets, not rendering limits.

## Game sessions

Physical games are sessions inside a world instance. Pool, Connect Four, cards, cabinets, etc. should synchronize only the players/spectators who need their state. A game's public contract is moving toward:

- mount(context)
- interact(player, target)
- update(dt)
- serialize()
- applyNetworkState(state)
- leave(player)
- destroy()

`spatial/games/pool/adapter.js` is deliberately an adapter around the existing prototype. New games should target the module contract instead of adding their entire implementation to `xr/app.js`.

## Networking

`InstanceClient` is an intentionally backend-neutral WebSocket interface. Site-wide MQTT chat remains separate. High-frequency spatial presence should not use the global chat bus.

A future authoritative service can map approximately one room/instance to one server-side object (for example a Durable Object), but client code should depend on the room protocol, not a specific provider.

## Portability

World definitions live in `spatial/worlds/`. The runtime must not assume the current page is the Arcade. Future PixelB8 rooms (EU Tracker command center, OSRS/VTAM rooms, other sites) should reuse the same player/input/interaction/session foundations.
