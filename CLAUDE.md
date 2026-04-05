# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server at http://localhost:5173
npm run build     # Build production bundle to dist/
npm run preview   # Serve production build locally
npm run lint      # Run ESLint

node scripts/generate-stubs.mjs   # Generate missing markdown stubs from video metadata
node scripts/generate-tiles.mjs   # Generate Leaflet map tile layers
```

No test framework is configured.

## Architecture

**Altor Codex** is a React 19 + Vite SPA — an interactive lore compendium for the Ereb Altor fantasy world (the Swedish tabletop RPG *Drakar och Demoner*). Deployed to Netlify with SPA redirect handling.

### Navigation Model

The app uses URL hash + query parameter routing (no React Router). `App.jsx` parses and syncs all state:

- `#<page>` — switches top-level page (home, map, codex, catalog, chronicles, history, about)
- `?entry=<id>` — opens a codex entry directly
- `?pin=<id>` — opens a map location
- `?country=<id>` — filters the Compendium by country

### Data Layer (src/data/)

All content is static data — no backend or API calls:

- **`codex/index.js`** — metadata for ~400 codex entries across 8 categories (Characters, Conflicts, Creatures, Geography, History, Lore, Magic, Peoples). Each entry references a markdown file path for detail content, which is lazy-loaded.
- **`locations.js`** — ~100+ map pin definitions (id, x/y pixel coords, type, name). Types: capital, city, country, continent, region, water, mountain, forest, site, ruin, dungeon, shrine.
- **`src/data/locations/<id>.js`** — extended per-location detail, lazy-loaded on demand.
- **`videoData.js`** — 200+ YouTube video metadata, organized by section.
- **`crossLinks.js`** — cross-references between locations, codex entries, and videos.
- **`timeline.js`** — historical eras and events.

Codex content lives in `src/data/codex/<Category>/<entry>.md`. Images are served from `public/codex/` with `Thumbnails/` subdirectories.

### Key Components

- **`App.jsx`** — central state hub, keyboard shortcuts (Ctrl+K), deep link parsing, page orchestration.
- **`InteractiveMap.jsx`** — Leaflet map using `CRS.Simple` for a custom pixel-coordinate world map. Pins are dynamically filtered by type. Location details loaded via dynamic import.
- **`Compendium.jsx`** — large multi-tab aggregator view (Countries, Videos, Characters, etc.) with cross-linked content, image gallery/lightbox, and markdown rendering.
- **`CodexSection.jsx`** / **`CodexPanel.jsx`** — codex entry viewer with image carousel, related entries, and markdown content.
- **`GlobalSearch.jsx`** — Ctrl+K modal searching across all locations, entries, and videos.

### Styling

All styles are in `src/App.css` (~75KB) — custom hand-written CSS with no framework (no Tailwind, no CSS modules). Uses CSS custom properties, Grid, and Flexbox. Medieval/fantasy aesthetic with ornamental details and serif fonts. `src/index.css` is just a reset.

### Adding Content

- **New codex entry**: Add metadata to `src/data/codex/index.js` and create the markdown file in the appropriate category folder.
- **New map pin**: Add to `src/data/locations.js`; optionally create `src/data/locations/<id>.js` for detail.
- **New videos**: Add to `src/data/videoData.js`.

### Country/Region Style

See memory reference for the country file style guide (formatting rules for `.md` files).
