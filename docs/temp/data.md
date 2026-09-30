# Data — `src/lib/data/`

Everything the page knows that is not behaviour. Used by the `.astro`
components at build time and by the scripts in the browser. `index.ts`
re-exports it all, so callers import from `lib/data`.

- `config.ts` — the API address, storage keys, defaults, the editions and CV
  languages, and the four text sizes.
- `themes.ts` — mirrors the theme table in the private repo's
  `cv/helpers/colors.tex`. `hex` is the theme's main accent; `swatch` only
  overrides how the dot is drawn on this page (Black & White is a split dot).
  `FA_COLOURS` are the Persian names.
- `fonts.ts` — the page fonts offered in the accessibility menu, with
  `[English, Persian]` notes and style names.
- `strings/` — page text in both languages. The accessibility menu switches
  between them; English fills any key Persian is missing (`t()` in
  `lib/prefs`). `StringKey` is every English key.
- `tips/` — tooltip text: a title and a line on what the control does, for
  each `data-tip` key. `tipContent()` in the builder adds the live details
  (file, colour, date…).
- `facts.ts` — labels for the detail rows under a tooltip.

Checked against the previous single file: all 17 exports deep-equal.
