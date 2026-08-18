# PixelB8 App Boilerplate

Reusable starting point for new PixelB8 pages.

Left rail order:
1. Status
2. Mode
3. This Page
4. Library (Favorites + Recents examples)
5. More from PixelB8 — bottom-docked and vertically expandable in both expanded and compact rail states

The right rail uses the shared PixelB8 account + MQTT global chat foundation.

## Usually edit
- `index.html`: app name, Status/Mode controls, navigation, center workspace markup.
- `styles.css`: styles unique to the new app.
- `app.js`: app-specific behavior.

Keep the shared shell CSS before `styles.css`, and load MQTT + the shared shell JS before `app.js`. The file includes commented standalone URLs for testing outside the live PixelB8 folder structure.
