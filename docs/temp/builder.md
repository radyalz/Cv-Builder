# The CV builder — `src/scripts/builder/`

The page's own logic: the selection, the colour menu, the published preview
and how it expands, the build flow, and what each tooltip says. Shared pieces
(preferences, tooltips, skulls, the PDF viewer) live in `src/lib`.

## Shared state

- `dom.ts` — every element the builder touches, looked up once.
- `state.ts` — `app`: the selection, the published copies (`variants`, keyed
  `theme|variant|language`), whether the full listing has arrived, the PDF
  viewer and the current link count. `variantsLoaded` is false until the full
  listing arrives; until then the preview keeps its skeleton instead of wrongly
  reporting a colour as not generated.

## Choosing (`selection.ts`, `colour-menu.ts`, `interface.ts`)

- The selection is remembered on the device (`cv-builder-selection`); a
  blocked or corrupt store just means the defaults (purple, digital, English).
  Custom colours are never published and never stored server-side.
- The colour swatches are rendered by `ColourMenu.astro`; the builder only
  names them in the page language and marks the chosen one (arrow keys move
  between them).
- `syncInterface()` applies the accent (made readable for the appearance by
  `uiAccent`), repaints the skulls, marks the chosen options, shows the custom
  colour hint (a warning for very light colours: headings are darkened
  automatically but a mid-tone reads better), and schedules the preview. The
  loading skeleton is laid out in the CV's direction (a Persian CV right to
  left), not the page's.

## The preview (`listing.ts`, `copy-cache.ts`, `prefetch.ts`, `preview/`)

- **Listing**: the last full listing is kept on the device
  (`cv-builder-listing`), so a returning visitor's preview starts at once from
  the kept copies; the fresh listing then replaces it. When there is no kept
  listing, just the copy about to be shown is asked for first
  (`/variants?theme&variant&language`), so its preview starts before the whole
  listing is in. If the service cannot be reached and nothing is known, the
  preview says so with a Retry.
- **Copies**: preview URLs carry the copy's publish time (`&v=`), so a URL
  names one exact copy and a cached copy can never be stale. Copies are kept
  for the session in memory and on the device in Cache Storage
  (`cv-previews-v1`); copies rebuilt since are pruned once the fresh listing
  is in.
- **Prefetch**: planned per accent, not per selection. When an accent is
  chosen (or the page opens), all four versions of it are fetched (digital and
  print, English and Persian), and the neighbouring accents in the picker in
  the current edition and language — 3 at a time, low priority, when the page
  is idle (within a second). Switching edition or language then needs nothing
  new. Hovering a swatch or an edition/language button fetches that copy at
  once. Skipped with save-data or on 2G.
- **Showing**: every change goes through the skeleton for at least 250ms so
  the change registers; clicking through swatches only loads the last (60ms
  debounce). Taking more than 10s shows the error with Retry (not during a
  build, which is "patient"). "copy" failures forget the copy and fetch again;
  "listing" failures ask the service again.
- Nothing published for a choice: the skeleton stays with a note on it, and
  the footer fades out keeping its room so nothing jumps.

## Links hint (`links-hint.ts`)

Readers do not expect a CV preview to have working links, so the preview says
how many it has and lights them up: once when a copy first shows, again when
it is expanded, and whenever the hint is clicked.

## Expanding (`expand/`)

The card grows from where it sits to just inside the window (its own
rectangle is animated, so the glass and the PDF grow with it) while the rest
of the card slides away and the bar fades in; collapsing runs the same steps
backwards, slower (920ms vs 820ms, the text returning over 540ms from 55% of
the way through).

- The PDF is drawn once at the larger of its two sizes before anything moves
  and scaled with the card as a picture (`holdPaper`), so it is never blown up
  blurry and there is nothing to swap in when it lands. Its pages keep their
  place against the box's side and top, scrollbar included. Without a PDF on
  screen the page colour grows and the PDF fades in at the end.
- Frames animate `left/top/width/height` with `right/bottom: auto`: otherwise
  the box is over-constrained and in RTL the browser would drop `left`.
- The animations hold their last frame until the classes are switched over,
  then `settle()` cancels them, so no in-between layout is painted.
- **Pinning** (`pin.ts`): the steps overlap. The text column fades and slides
  away while the card is already growing and slides back while it is still
  shrinking, so it is held (absolutely placed inside the card) at its spot in
  the small card during the grow. Parts are measured without the fade's slide
  so one caught mid-fade is still pinned at its true place. Leaving in Persian,
  the text column is held by the card's right edge so the growing card carries
  it away from the preview.
- Pauses between steps wait on the animation clock, not timers, so they stay
  in step even when a hidden tab throttles timers.
- The view opens past the room kept for the title pill, at the same place on
  the paper it showed before; collapsing returns the small preview to the same
  place too.
- A click mid-animation ("close" while growing, "expand" while shrinking) is
  queued and run once it settles (`queue.ts`).
- The grown card covers the skulls, so they pause while it is open.
- Phones: the inline preview is a peek that opens when tapped.

## Building (`build/`, `copies.ts`)

- `/build` returns at once when a current copy is already published (no
  build needed). Otherwise the status is asked after 9s (a build takes about
  fifteen seconds) and then every 1.5s, so the download starts within moments
  of the copy being stored.
- Downloads are fetched (or taken from memory) and saved through a temporary
  link rather than by navigating: a navigation can cancel the page's own
  requests (previews among them), and holding the copy lets the preview show
  it straight away.
- A custom colour is never published, so the copy just made is kept in this
  page's memory only, to preview and save again during the visit.
- One of three panels (building, ready, failed) shows at a time in a glass
  strip on the preview; the arriving one grows up from the bottom edge, the
  leaving one shrinks away. "Ready" hides itself after 5s.

## Tooltips (`tips/`)

Every tooltip says what the control does and, where it matters, exactly what
it will act on right now (file, colour, edition, language, publish date, size…),
built fresh each time. `tips/index.ts` dispatches on `data-tip` to handlers in
`actions.ts`, `choices.ts` and `page.ts`.

## Wiring (`wire/`, `index.ts`)

`initBuilder()` loads the selection, applies it, starts loading copies (the
copy on screen first, then everything else, then the likely next copies) and
wires the controls, the preview and the Escape key (closing, in order: an open
bar dropdown, the expanded preview, the colour menu).

Checked against the previous single file: identical results for every kind of
choice (swatches, arrow keys, edition, language, valid/invalid/light custom
colours, reset), for the build flow (up to date, queued → running →
completed, failure; the service mocked), for every tooltip, and for prefetch
(the same copies in the same order).

## The preview is a peek everywhere (2026-10-02)

In every layout and orientation the small preview is now the phones' peek:
it does not scroll and its links are inert, a fade and a "Tap to expand"
pill ("Click to expand" with a mouse: `(hover: hover) and (pointer: fine)`)
sit at its foot, and tapping or clicking it opens the large view. The
Expand button is kept only for the keyboard: visually hidden, still in the
tab order, and when it has keyboard focus the preview frame gets the focus
ring. Closing the large view returns focus to it (or to the frame where the
foot is hidden, on upright phones). The tour's Expand step is gone and its
preview step says to tap or click.
