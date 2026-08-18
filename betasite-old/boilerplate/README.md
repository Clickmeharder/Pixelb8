# PixelB8 New Page Boilerplate

Copy this whole `/boilerplate/` folder whenever you start a new one-folder-deep PixelB8 page.

## Normally edit only these pieces

1. `index.html`
   - Change the `<title>`.
   - Change the name under the PixelB8 brand.
   - Replace the example buttons inside `This Page`.
   - Replace the demo center views.

2. `styles.css`
   - Add only styles unique to the new page.
   - Do not copy account/chat/rail CSS here unless the shared shell genuinely needs a global change.

3. `app.js`
   - Change `SIDEBAR_KEY` to a unique key for the new page.
   - Replace the two demo actions.
   - Add page-specific logic.

## Already built in

- PixelB8 graphite theme
- expandable/collapsible left panel
- remembered left-panel state
- PixelB8 Home / Arcade / EU buttons
- center content area
- collapsible account + global chat panel
- draggable right-panel width
- shared right-panel width saved across apps
- local PixelB8 guest/profile settings
- MQTT global chat
- emoji picker
- responsive narrow-screen rail layout

## Shared dependencies

This template assumes it sits one folder below the site root and loads:

- `../sharedassets/css/pixelb8-shell.css`
- `../sharedassets/js/pixelb8-shell.js`

If a page is nested deeper than one folder, adjust those relative paths.
