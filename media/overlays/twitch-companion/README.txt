PixelB8 Companion Hosted Twitch Overlay
=======================================

Upload this entire folder to:
  /media/overlays/twitch-companion/

Expected public page:
  https://pixelb8.lol/media/overlays/twitch-companion/

Hosted overlay URL format:
  https://pixelb8.lol/media/overlays/twitch-companion/?id=YOUR_RANDOM_OVERLAY_ID

Preview/debug format:
  https://pixelb8.lol/media/overlays/twitch-companion/?id=YOUR_RANDOM_OVERLAY_ID&preview=1

Transport
---------
This hosted renderer subscribes over secure MQTT/WSS to:
  pixelb8/overlay/v1/YOUR_RANDOM_OVERLAY_ID

Broker:
  wss://broker.emqx.io:8084/mqtt

The current PixelB8 Companion app still needs a Hosted HTTPS transport option that
publishes its sanitized overlay-config state to that topic. Until Companion is
updated, the page will remain transparent because no state is being published.

Security model (first pass)
---------------------------
- The overlay ID is a long random bearer-style session ID.
- Never place Twitch OAuth tokens in the URL or published state.
- Regenerating the overlay ID invalidates the previous hosted overlay URL.
- This first pass uses a public MQTT broker. A future PixelB8 relay/backend can add
  authenticated publishing, server-side access control, rate limiting and signed state.

Why HTTPS matters
-----------------
Twitch clip embeds require an HTTPS parent page. When this page is hosted on
pixelb8.lol, the renderer can use parent=pixelb8.lol and attempt actual clip playback.
The local HTTP overlay remains useful as a no-cloud fallback but cannot reliably
play arbitrary Twitch clip embeds.


Clip playback note (0.19.20): Twitch requires the visible clip player to be at least 400x300. PixelB8 Companion now expands clip-enabled Shoutouts to 820x360 by default.

0.19.21: CSP permits the renderer's dynamic inline styles. Real Twitch clip playback is intended for the top-level HTTPS/OBS page; Companion's embedded preview intentionally uses its local preview to avoid Twitch ancestor-chain blocking in Electron.

0.19.22: CSP now explicitly allows blob: Web Workers used by mqtt.js. For reliable normal-browser clip autoplay, keep Mute clip enabled; unmuted autoplay may be blocked by browser policy.

0.19.23: Fixes Twitch shoutout clips being destroyed/recreated every 350ms while runtime shoutout state is active. Runtime expiry still refreshes, but the active clip iframe remains mounted so playback can start and continue.

0.19.24: Keeps an active Twitch shoutout clip iframe mounted across unrelated live-state updates (for example Jukebox progress/chat state) instead of recreating the Twitch player. The live hosted page also no longer scales the 1920x1080 stage with CSS; scaling is preview-only so Twitch's visible-size check sees the real clip dimensions.


0.19.26 clip autoplay fix:
- Hosted Twitch Clip iframe is a fixed, unobscured 640x360 playback surface.
- The player is never CSS-scaled, faded, filtered, or overlaid by PixelB8 UI.
- Clip-enabled shoutout geometry must be at least 640x360; larger is recommended for side info.

0.19.26: Twitch clip iframe is now the sole element in its 640x360 playback cell to satisfy Twitch style-visibility rules.

0.19.27 Jukebox audio routing:
- Companion can route Jukebox audio to Browser Source only, Companion only, or Both.
- Hosted Browser Source creates a persistent YouTube playback engine and follows Jukebox play/pause/track/volume state.
- Hosted CSP now permits YouTube embed frames.


0.19.28:
- Prefer controllable Twitch VOD playback for shoutout clips when Get Clips provides video_id + vod_offset.
- Explicitly apply mute/volume/autoplay via the Twitch Player API.
- Fall back to the standard Clip iframe when the source VOD is unavailable.

0.19.29: Twitch shoutout VOD playback now initializes internally muted for reliable autoplay, then applies the user's actual Mute clip setting after Twitch reports PLAYING. This avoids Chromium/Twitch locking an autoplay attempt into a muted state when the player is initialized unmuted.
