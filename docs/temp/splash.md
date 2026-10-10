# Loading screen

`components/Splash.astro`, `styles/splash.css`, `scripts/splash/`.

## Look (2026-10-10, fourth version: ASCII transition)

- The page starts covered by `#splash` (CSS `#07050a`, before any JS). `scripts/splash/cover.ts`
  draws the same fluid ASCII glyph field as links.radyalz.ir, using `lib/transition/*`
  (grid/render/rng/handoff are byte-identical copies of profolio-links; `noise.ts` and
  `words.ts` are local copies). The glyphs fade in over 0.7s (`.is-fading`).
- The name and the step text sit centred on top, updated every 120ms from `lib/progress`.
- Ready = fonts loaded + background drawn + preview settled (`steps.ts`), held to at least
  900ms, or forced after 15s without progress. Then `:root.is-ready` is set, the card arrives,
  the text fades and the 1.9s 35-degree wavy in-sweep reveals the page; `#splash` is removed
  and `app:ready` fires.
- Handoff: `?tx=<seed>.<t>` (written by profolio-links when its out-sweep ends on a Cv-Builder
  link) seeds mulberry32 for the wave params and per-cell noise and continues flow time from t,
  skipping the fade-in. The param is removed with `history.replaceState`. Without it the seed
  is random.
- Reduced motion: no canvas drawing; the dark cover and text show until ready, then vanish.
- Hold frames are drawn at 20fps, sweep frames at 60fps.
