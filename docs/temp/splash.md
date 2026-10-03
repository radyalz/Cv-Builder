# Loading screen

`components/Splash.astro`, `styles/splash.css`, `scripts/splash/`.

## Look (2026-10-03, third version)

- The halftone background shows through (the splash itself is transparent;
  everything else in `<body>` is `visibility: hidden` until `:root.is-ready`).
- In the middle, one skull from the background art, animating on a faster
  3.2s cycle so its bite and eye flash show during a short load
  (`skull.ts`, drawn with the same `drawPose` as the background, from the
  same art via `onArt`).
- Around it, a ring of 72 monospace ASCII glyphs that fills clockwise from
  the top with progress: filled glyphs `@`/`#` in the accent, a flickering
  leading edge stepping down the ramp ` .:-=+*#%@`, and `·` for the rest; a
  faint inner ring drifts slowly (`ring.ts`).
- Under it, the name (uppercase in English) and a monospace status line, e.g.
  "Loading the PDF viewer · 38%" (Persian uses the Persian percent sign and a
  right-to-left mark so it reads correctly).
- When everything is loaded, three accent bands (deep, the accent, light)
  sweep across one after another (`wipe.ts`, each passes in and out, 120ms
  apart); the page is made ready behind the first full band, the last band
  sweeping off reveals it, and then the card fades in (`.is-waiting` →
  `.is-arriving`). Reduced motion: no sweep.

## What it waits for

The bar (now the ring) is driven by bytes (`src/lib/progress.ts`): fonts and
background (small shares), the PDF viewer's worker and the shown CV copy
(streamed, weighted by size), then the render. It ends when fonts, background
and the preview have settled, never earlier than 0.9s, and only gives up if
nothing has moved for 15s. Failsafes: the splash hides after 60s and the page
becomes visible after 60s if no script runs.

The PDF viewer starts downloading at page start. In dev the worker is passed
by URL (Vite's client import breaks blob workers); the built site streams it.
Only the chosen font loads before the page is ready; the other fonts of that
language warm up afterwards (`scripts/fonts/warm.ts`).

Note for testing: Chrome's network throttling does not slow requests made by
the service worker; test slow loads with the service worker bypassed.

## Preview patience

The preview waits by connection (25s by default, 45s on 3G, 75–90s on 2G);
after 8s a "Slow connection, still loading the preview…" note shows. Try Again
never expands the preview.
