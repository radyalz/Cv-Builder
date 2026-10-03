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
see below for what ends it. `app:ready` (and `:root.is-ready`) mark the moment; the
install offer, the How it works call-out and the first-visit touch hint wait
for it (`whenReady` in `ready.ts`).

Measured: about 1s on a normal connection, about 6s on throttled slow 4G,
where the page now appears with the preview already rendered.

## Progress by bytes (2026-10-03, replaces the ring)

The ring is now a straight bar under the name, filled by what has actually
loaded (`src/lib/progress.ts`): each task has a weight and a fraction done,
and the bar is the weighted sum, eased toward its target and never moving
backwards.

- fonts and background: done or not (small weights);
- the PDF viewer's worker (about 1.2MB raw, 360KB over the wire): streamed
  with `readWithProgress` (`src/lib/stream.ts`) and handed to pdf.js as a
  blob URL, so it is downloaded once; its weight is its size in KB;
- the shown CV copy: streamed the same way in `fetchCopy` (only the copy on
  screen, not prefetches), weighted by its size;
- the render: done when the preview settles.

Sizes: `Content-Length` when sent (×3.3 when the response is compressed,
since the stream yields the uncompressed bytes); otherwise the known worker
size or the copy's size from the listing. The line under the bar names what
is loading and, while bytes arrive, "· 294 of 1235 KB".

There is no time limit any more: the screen only gives up if the bar has not
moved for 15s (nothing arriving at all); the CSS failsafe is 60s for the case
where no script runs.

The viewer now starts downloading as soon as the page starts
(`initBuilder` calls `loadLibrary`) instead of after the listing and the copy
request: on throttled slow 4G the page was ready at 3.5s instead of 6.4s.

Note for testing: Chrome's network throttling does not slow requests the
service worker makes, so test slow loads with the service worker bypassed.

## Preview patience

The preview no longer gives up after a fixed 10s. It waits by connection
(25s by default, 45s on 3G, 75–90s on 2G); after 8s a calm "Slow connection,
still loading the preview…" note sits on the skeleton (`previewState` with
`data-slow`). A copy that arrives late still replaces the error.

Try Again stops its click from reaching the preview, and a click on the
preview only expands it when it is not loading and not on the error, the
build status or a note.
