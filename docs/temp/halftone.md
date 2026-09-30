# Halftone background — `src/lib/halftone/`

Under the skull artwork: the page's colour gradient and, over it, dots in the
accent colour printed like a halftone — large and close where the gradient's
colour is strongest, shrinking to nothing towards the middle.

- The strong corner is the bottom one on the side reading starts from
  (bottom-left in English, bottom-right in Persian); a weaker patch sits in the
  opposite top corner.
- Dark mode: dots glow on near black (`#050506`). Light mode: a soft tint.
- Faint on purpose (alpha 0.24 dark / 0.14 light, dots at most 70% of half the
  10px spacing) so the skulls on top keep their contrast. Measured against the
  page without this layer: skull contrast went 97 → 108 (dark) and 109 → 103
  (light).

## Files

- `gradient.ts` — `paintGradient` paints the same gradient as the body's
  background in `tokens.css` (two elliptical glows over a base colour). It is
  painted on the canvas as well as in CSS so the canvas alone is the whole
  background and can be saved as a wallpaper (`scripts/wallpaper.js`); the CSS
  copy shows only until the canvas fades in. `rgbOf` reads any CSS colour via a
  scratch canvas; `mix` is `color-mix(in srgb)`.
- `dots.ts` — the dot field: rows offset by half a dot (0.866 row height) as
  in print, radius from a smoothstep fall-off from each corner.
- `index.ts` — sizes the canvas (device pixel ratio capped at 2), paints once,
  and repaints only when the accent (root `style`), appearance (`data-theme`)
  or direction (`dir`) changes, or the window is resized (debounced 120ms).
  Repaints are coalesced to one per frame, so dragging a custom colour is
  smooth.

The split was checked against the previous single file by hashing the canvas
in dark/light × English/Persian: identical pixels.
