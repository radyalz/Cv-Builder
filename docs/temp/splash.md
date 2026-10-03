# Loading screen (2026-10-03)

`components/Splash.astro`, `styles/splash.css`, `scripts/splash/`.

Shown from the first paint (it is in the HTML, styled by the main stylesheet,
with the name and first step in both languages picked by `:root[lang]`, so a
Persian visitor never sees English first). While it is up the page underneath
does the real work, and the accent ring fills as each step finishes
(`steps.ts`):

1. fonts loaded (`document.fonts.ready`);
2. background drawn (`.skull-field.is-painted`, set after the first frame);
3. the CV preview settled: rendered, or shown as not generated, or failed.

Then it shows "Ready" for a moment and fades out while the card rises in
(`.is-arriving`, once). It stays at least 0.7s so it never flashes, and at
most 12s, after which the page appears anyway and the preview keeps loading
behind its slow-connection note. A CSS failsafe hides it after 15s if the
scripts never run. `app:ready` (and `:root.is-ready`) mark the moment; the
install offer, the How it works call-out and the first-visit touch hint wait
for it (`whenReady` in `ready.ts`).

Measured: about 1s on a normal connection, about 6s on throttled slow 4G,
where the page now appears with the preview already rendered.

## Preview patience

The preview no longer gives up after a fixed 10s. It waits by connection
(25s by default, 45s on 3G, 75–90s on 2G); after 8s a calm "Slow connection,
still loading the preview…" note sits on the skeleton (`previewState` with
`data-slow`). A copy that arrives late still replaces the error.

Try Again stops its click from reaching the preview, and a click on the
preview only expands it when it is not loading and not on the error, the
build status or a note.
