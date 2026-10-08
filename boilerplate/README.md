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

## Optional internal workspace panels

The boilerplate Workspace view includes optional collapsible left and right panels **inside** the main workspace. These are intended for complex creator/editor pages (for example: Rig & Body tools on the left and Properties/Inspector controls on the right).

- They are boilerplate examples only; Home, Arcade, and EU do not use them.
- Each inner panel can collapse independently while the tool is open.
- Page Settings demonstrates completely showing/hiding either inner panel.
- Visibility and collapsed state are remembered in `localStorage`.

The outer PixelB8 rails remain separate: the global left rail is site/app navigation and the global right rail is Account + Chat.

## Shared right rail behavior

The shared PixelB8 right rail now uses two vertical sections:

- **Account** stays compact with avatar/name/status visible and expands to reveal account actions.
- **Global Chat** is bottom-docked, collapsible, and when open expands to use the remaining right-rail height.
