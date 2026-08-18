# PixelB8 Shared Root Foundation

Deploy this folder's contents at the site root:

- `/sharedassets/css/pixelb8-shell.css`
- `/sharedassets/js/pixelb8-shell.js`
- `/arcade/`
- `/eu/`

Public URLs:

- `https://pixelb8.lol/arcade/`
- `https://pixelb8.lol/eu/`

Both apps reference the shared shell with relative paths:

- `../sharedassets/css/pixelb8-shell.css`
- `../sharedassets/js/pixelb8-shell.js`

## Shared assets contain

- graphite PixelB8 palette
- base typography/reset
- shared left sidebar/rail foundation
- shared slim scrollbar styling
- reusable vertical dock resizer utility

## App-local assets remain local

`/arcade` keeps:
- arcade-specific cards/layout
- right social/account rail styling
- MQTT chat/game room behavior
- all legacy game files under `/arcade/assets/games`

`/eu` keeps:
- tracker dashboards
- loadouts/hunt/team tracking
- OBS Mode / streamermode.css
- tracker-specific JavaScript

This prevents a change to one product from accidentally changing product-specific panels in the other, while still giving both pages the same PixelB8 shell.

## V2 shared shell additions

The root `/index.html` is now the PixelB8 portal/home page.

The shared shell also provides:
- collapsible right account/social rail
- guest/local PixelB8 profile placeholder
- Account Settings / Logout
- global MQTT chat on `pixelb8/site/v1/chat/global`
- shared right-rail resizer width across apps

`/arcade`, `/eu`, and `/` all use the same shared profile/chat rail.

## V2.3 Landing / Home split

- `/index.html` is the animated retro PixelB8 entrance.
- `/home.html` is the main PixelB8 ecosystem portal.
- Auto Enter is remembered in localStorage and still plays the intro before redirecting.
- Internal Arcade/EU Home links go directly to `../home.html`.
- More from PixelB8 links now connect Arcade <-> EU <-> Home using explicit local-relative HTML paths.


## OBS live chat.log bridge

OBS Browser Source cannot keep a persistent File handle to Entropia's chat.log.
The included `Start PixelB8 OBS Bridge.bat` starts a local HTTP server and live
tail endpoint.

1. Run `Start PixelB8 OBS Bridge.bat`.
2. Leave the PowerShell window open.
3. In OBS use Browser Source URL:
   `http://127.0.0.1:8765/eu/index.html?streamer=1`
4. The EU tracker polls `/api/tail` every 1000 ms and processes only bytes
   appended after connection.

The bridge opens chat.log with `FileShare.ReadWrite` so Entropia can continue
writing while the bridge reads it.


## V2.6 OBS native live polling

OBS no longer requires the local bridge. The EU tracker now first attempts the
same architecture used by the older working tracker:

1. `showOpenFilePicker()` returns a `FileSystemFileHandle`.
2. The handle is persisted in IndexedDB when possible.
3. `requestPermission({mode:"read"})` is used on user interaction.
4. Every 1000 ms the tracker calls `fileHandle.getFile()`.
5. Only bytes after the previous file-size offset are read and parsed.

`input[type=file]` remains only as a diagnostic snapshot fallback when
`showOpenFilePicker()` truly is unavailable.
