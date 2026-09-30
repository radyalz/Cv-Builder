# Page preferences — `src/lib/prefs/`

Page language, appearance, text size and fonts, chosen in the accessibility
menu (`A11yMenu.astro`) and remembered on this device under `UI_KEY`. The
inline script in `Base.astro` applies the stored values before the first paint
(so a light or Persian page never flashes dark or English first); this module
keeps them in sync afterwards and tells the page through a `prefs:change`
event on `document`.

- `state.ts` — the current preferences and `t(key, vars)`, the text lookup
  (current language, then English, then the key itself). Appearance starts
  from the system setting until the visitor picks one. The key order of
  `uiPrefs` is kept (`lang, theme, fs, enFont, faFont`) so the stored JSON is
  unchanged from before the split.
- `storage.ts` — reading, saving and forgetting. A blocked or corrupt store
  just means the defaults are used; saving is a convenience, never required.
- `apply.ts` — writes the preferences onto `<html>` (`lang`, `dir`,
  `data-theme`, font data attributes, `--fs`), fills every `data-i18n`,
  `data-i18n-aria` and `data-i18n-title`, shows only the current language's
  font group and marks the chosen options. Text eases to a new size over about
  a third of a second (`--fs` in `tokens.css`), so an open menu is kept
  against its button every frame for 400ms while it grows or shrinks.
- `menu.ts` — opening and closing the menu: one Web Animation played forwards
  to open and backwards (1.3× faster) to close, so a click mid-way turns it
  around from wherever it is instead of jumping or getting stuck. It grows
  from the point of the menu nearest the button's centre. With reduced motion
  it simply appears and disappears.
- `admire.ts` — `setAdmiring(on)` hides the card so the skulls have the
  screen; both toggles' `aria-pressed` and labels say what they will do next.
- `events.ts` — the delegated click, Escape and resize handling, and
  `resetPrefs()`: back to English, the system's appearance, normal text and
  default fonts, with the stored choice forgotten so the appearance follows
  the system again.
- `index.ts` — `initPrefs()` and the public exports. Page changes (Astro's
  client router) replace the `<html>` attributes, so preferences are put back
  after each swap.

Checked against the previous single file by driving the menu (Persian, light,
larger text, a font, outside click, reset, Escape): identical page state and
stored JSON at every step.
