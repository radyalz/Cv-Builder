# Tooltips — `src/lib/tooltip/`

Markup and styles live in `Tooltip.astro`. Any element with `data-tip` gets
one. What it says comes from the content function a page registers with
`setTipContent()`; without one, `data-tip-title` / `data-tip-body` (or the
`aria-label`) are used. Content is
`{ title, body, facts: [[label, value, { mono, dot }]], hint: { label, key } }`.

## Behaviour

- **Mouse**: like the ERD schema tooltip, it trails the cursor on a spring
  (stiffness 750, damping 45) and stretches slightly in the direction of
  travel, tilting with the speed. Hover opens it after 320ms; once one is
  open, moving onto the next control switches it straight away (the contents
  cross-fade, the bubble stays). Leaving waits 90ms, so crossing the gap
  between two segments does not close and reopen it.
- **Keyboard**: focus (`:focus-visible` only) shows it at once, pinned above
  the control with an arrow (below it when there is no room above).
- **Touch**: no hover, so pressing and holding a control for 480ms shows its
  tooltip pinned above it; moving more than 10px cancels. The click that ends
  a hold only showed the tooltip, so it is swallowed, and the browser's own
  long-press menu is suppressed on tip controls.
- Any press, scroll or window blur hides it.
- **First touch visit**: `showTouchHint(text)` shows a one-off note on touch
  screens (`hover: none`) that holding a control explains it, from 1.2s to
  6.2s after load. It is remembered in `cv-builder-touch-hint`; without
  storage it is not shown at all, because it would otherwise show on every
  visit.

## Files

`state.ts` (shared live state), `render.ts` (content), `motion.ts` (spring and
placement), `show.ts` (show/hide, content function), `pointer.ts` (mouse,
focus), `touch.ts` (long-press), `hint.ts` (first-visit note), `index.ts`.

Checked against the previous single file: identical tooltip markup for hover,
focus and long-press, and the same spring path (same peak, settled after the
same 15 frames). A one-off "Status: Not built yet" difference was network
timing in the page's copy list, not the tooltip.
