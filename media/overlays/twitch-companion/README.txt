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
