# Colour maths — `src/lib/colour/`

Shared by the page and the skull artwork. `index.ts` re-exports everything, so
callers import from `lib/colour`.

- `hex.ts` — parsing (`normaliseHex` accepts `abc`, `#abc`, `aabbcc`; anything
  else is `null`), `toRgb`/`fromRgb`, and mixing. `mixWithWhite` returns
  upper-case hex and `mixHex` lower-case, as before the split; nothing compares
  them, but the output was kept identical.
- `contrast.ts`
  - `textOn(hex)` picks dark or white text by actual contrast ratio, not a
    lightness threshold: mid-tone accents such as orange fool a threshold.
  - `uiAccent(hex, theme)` keeps the accent readable on the page: on the
    near-black dark theme very dark accents (mono, graphite, dark custom
    colours) are lifted towards white; on the light theme pale accents are
    darkened. Up to 12 steps of 18%. The PDF always uses the colour exactly as
    chosen — this is for the page only.
- `electric.ts` — `electricHue(hex, lightness)` is the lightning's sibling hue:
  cool accents lean towards cyan and warm ones towards yellow (±25° of hue),
  the colours that read as electric, with a little more saturation. Greys
  (saturation under 0.08) stay grey.

The split was checked against the old single file on 5,000 random colours for
every function: identical results.
