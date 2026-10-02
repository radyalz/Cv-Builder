# Skull background — `src/lib/skulls/`

## Artwork (`art.ts`, `palette.ts`, `svg.ts`, `paths.ts`)

Every piece of the skull is a still SVG image, rebuilt whenever the accent
changes because an image cannot read CSS variables. Nothing moves inside these
images; the renderer moves and fades them. Each tile is 100 × 130 artwork
units: the top 30 are sky for the lightning, the skull sits below in the same
0..100 frame it was traced in (hence `translate(0 30)`).

- Bone is pale and only tinted by the accent; the eyes are a bright tint of the
  accent and the lightning a sibling hue (`electricHue`), so each part stands
  apart without leaving the chosen colour. On the light appearance pale bone
  would vanish into the page, so the skull is drawn in deeper shades of the
  accent instead.
- The eye glints are four-point stars, like the stars in the concept art's
  sockets. The bolt has a wide halo so it lights the air around it while it
  strikes. The current through the skull is a coloured halo under a white-hot
  core, so it reads against pale bone as well as dark.
- `paths.ts` is generated: the cranium and jaw from the concept art trace; the
  bolt is hand-placed (a tapered channel with two forks and a twig, ending on
  the crown) plus the current it sends through the skull in three waves (dome,
  face, jaw), all as filled outlines so every line thins to a point.
- `skullParts` is exported so the app icons (`public/icons/`) can be drawn from
  the same artwork.

## Renderer (`render.ts`, `timeline.ts`, `easing.ts`, `loop.ts`, `size.ts`)

The skulls are drawn on one canvas. Every skull on screen is in the same pose
at any moment, so each frame composes that pose once on a small offscreen
canvas from the still layer images, then stamps it across the field in two
brick-offset sets of rows. That is a handful of image draws per frame instead
of the browser compositing a stack of full-screen layers, and it lets each
skull grow and wiggle about its own centre when the lightning hits.

- One tile is 150 × 300px (artwork at 1.5px per unit, two rows; the second set
  of rows fills the gap). `PAD` is room around the pose for it to grow into.
- `timeline.ts` holds the old CSS keyframes ported one for one:
  `[percent of the 6.5s cycle, value]` with each track's CSS easing. Layer
  groups: `shake` parts jolt with the head, `bite` parts also drop with the
  jaw (6px), the bolt stays where it lands. The head bobs with each laugh,
  then jolts when the bolt lands; the jaw runs a set of laughing bites that
  tails off, then the bolt wrenches it open.
- The strike's grow and wiggle: the skull swells about 6% and rocks ±3.2°,
  three times, fading out, from 70.5% to 80% of the cycle.
- Drift: set A slides right and set B left while the field as a whole drifts
  down-right at exactly 45°: per 70s loop A moves (5w, 2 rows) and B
  (−w, 2 rows); their average is (300px, 300px).
- `size.ts`: images are rasterised for the screen's density (capped at 2), so
  moving the window to a monitor with a different density repaints them.
- With reduced motion the field is drawn once, at rest.

## Keeping it light (`pace.ts`, `loop.ts`)

The animation stops whenever nobody can see it: a hidden tab, or the preview
grown over the page (`setSkullsPaused(reason, paused)` — it only runs again
once every reason is lifted). On a device that cannot keep up it steps down
instead of stuttering: first to 30 frames a second, then the glass card drops
its live blur for the flat frosted fallback (`data-glass="flat"` on `<html>`),
where most of the cost is. It judges on ~1.5s of frames after the first few
settle, and stops measuring once a device copes. Page changes replace the
`<html>` attributes, so the level is put back after each swap.

## Repainting (`paint.ts`)

`paintSkulls(accent, theme)` rebuilds the layer images; the next frame uses
them and the old ones stay on screen until the new ones are ready. The last 8
accents keep their drawn layers, so switching back is instant; clicking
through colours quickly only draws the last one (later paints wait 90ms to
settle; the first paint is immediate).

## Testing switches

- `?pose=72` — freeze the animation at that point of the cycle.
- `?quality=full|lite|flat` — force a quality level.

Checked against the previous single file: the generated SVG for every part is
byte-identical for 300 random accents in both themes, and the canvas is
pixel-identical at poses 0, 25, 71, 72.5, 76 and 90 in dark and light.

## Density on phones and tablets (2026-10-02)

The skull field is drawn zoomed out on small screens so more skulls fit:
0.6 on phones (shorter side under 600px), 0.76 on touch tablets up to
1366px, 1 elsewhere (`zoomFor()` in `size.ts`; `draw()` scales the canvas
transform and covers `width / zoom` × `height / zoom`). The tiles are still
rasterised at full size, so they stay sharp.
