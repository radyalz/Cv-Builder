# Loading screen

`components/Splash.astro`, `styles/splash.css`, `scripts/splash/`.

## Look (2026-10-10, fifth version: original splash + ASCII exit)

- The loading screen itself is the original one again (skull + ring canvas, name, step text,
  `steps.ts` ready detection, 900ms minimum, 15s stall). Only the exit changed.
- Exit (`scripts/splash/leave.ts`): `.splash-ascii` fades in (180ms) fully covered, then
  `:root.is-ready` is set, the card arrives, and the 1.5s 35-degree wavy "in" sweep from
  `lib/transition/render.ts` reveals the app. Colours come from the live `--accent`
  (`accent.ts`: dark accent shades for covered glyphs, light tint + near-white edge, `#07050a` bg).
- `render.ts` takes an optional palette; its default `PURPLE` is the links hub palette, so the
  profolio-links copy behaves the same.
- Handoff: with `?tx=<seed>.<t>` an inline script marks `#splash.is-handoff` (dark canvas
  before JS), `ascii.ts` strips the param and draws the purple field with that seed and flow
  time; after the splash's first frame it sweeps away in 1.5s, revealing the loading splash.
  The exit waits for that sweep to finish.
- Reduced motion: no ASCII at all (param still stripped); the splash just vanishes at ready.
