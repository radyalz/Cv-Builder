# Loading screen

`components/Splash.astro`, `styles/splash.css`, `scripts/splash/`.

## Look (2026-10-03, third version)

- The halftone background shows through (the splash itself is transparent;
  everything else in `<body>` is `visibility: hidden` until `:root.is-ready`).
- In the middle, one skull from the background art, centred on the ring by
  its measured bounds (the art is not centred in its tile; measured once per
  colour at a neutral pose) and sized to 60% of the ring's box, animating on a faster
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
  sweep in (`wipe.ts`): the first two only enter (0.52s, 110ms apart) and
  are hidden once the light band covers them; the light band enters and
  leaves in one 0.76s pass, so its exit alone reveals the page (about 0.4s);
  about 1s in all. The bands and the electricity only exist during the sweep
  (`.is-wiping`).
- Each band's leading edge is a neon signal (`SplashNeon.astro`): six
  waveforms generated at build time, each with its own number of periods
  (8–37) and every tooth randomised in spacing and height, smoothed into
  rounded curves (Catmull-Rom to Bézier, with a random tension so some are
  rounder than others). Each is drawn as five stacked SVG strokes (wide
  aura, haze, glow, tube, and a soft half-transparent core) so the glow
  swallows the line; no blur filters. A soft wash of light is thrown back
  onto the band (`.neon-light`). The waveforms are shown in turn on irregular
  CSS timers (each visible 28% of its own cycle, durations 0.43–0.67s, so
  they overlap or briefly blink out at random), and the whole edge buzzes
  with a stepped opacity flicker. Bands rest 90px past their width so the
  glow never peeks in. The page is made ready behind the first full band,
  then the card fades in after the reveal (`.is-waiting` → `.is-arriving`).
  The last band also carries a second, separately randomised waveform on
  its trailing edge (`<SplashNeon trail />`, mirrored, glow spilling onto the
  page), shown only while it exits (`.is-exiting`, added by `wipe.ts` at the
  exit start), so the edge that reveals the page glows too.
  Reduced motion: no sweep, one still waveform.

Earlier attempts (drawn arcs, fractal multi-strand bolts, Tesla-style
streamers on canvases) were dropped: they read as a jagged line rather than
electricity, and drawing soft glow every frame cost too much.

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
