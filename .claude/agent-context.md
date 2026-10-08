# Agent context — Cv-Builder

Updated 2026-10-08 at 22f09ba. Facts only.

## Stack
- Astro 7 static site (ClientRouter), strict TypeScript, plain CSS (no Tailwind)
- pdfjs-dist 6 for the CV preview; skull background drawn in a Web Worker (OffscreenCanvas)
- Deployed to GitHub Pages at https://radyalz.github.io/Cv-Builder/ (base `/Cv-Builder`)

## Map
- src/pages/index.astro — the only page; src/layouts/Base.astro (+ head/) — shell
- src/components/{a11y,actions,preview,page}/ — markup; Splash*.astro — loading screen
- src/scripts/{builder,splash,install,tour,morph,…}/ — page logic
- src/lib/{skulls,halftone,pdf-view,prefs,tooltip,data}/ — shared; lib/layout.ts — breakpoints
- src/styles/*.css (main.css imports all); public/sw.js — service worker
- docs/temp/*.md — all explanations (indexed by docs/temp/README.md)

## Rules
- NO code comments anywhere; notes go in docs/temp/. Components ~50–70 lines.
- Never add Claude co-author / "Generated with" trailers. Agents do not commit.
- Never print secrets (CV_UPLOAD_TOKEN, ~/.config/cv-builder/upload-token).

## Commands
- typecheck: `npx astro check` (expect 0 errors)
- build: `npm run build` (writes dist/; do NOT use --outDir outside the repo)
- dev server is the user's (port 8787); do not start/stop it

## Running app
- Production build preview: `npx astro preview --port 8765 --host 127.0.0.1` → http://127.0.0.1:8765/Cv-Builder/
- Ready signal: `document.documentElement.classList.contains('is-ready')` (loading screen gone)
- Prefs key: `cv-builder-a11y` (JSON: lang en|fa, theme dark|light, fs, enFont, faFont)

## Gotchas
- CV data comes from https://cv-api.radyalz.ir (can be slow, 5–10s); the loading screen waits for the preview.
- Chrome network throttling doesn't apply to service-worker fetches: bypass the SW when measuring.
- npm registry can be slow (20s+ per request); give installs a long timeout.
