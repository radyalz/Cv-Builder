# Text size (2026-10-02)

## Steps

Small 85%, Default 100%, Large 110%, Larger 120% (`TEXT_SIZES` in
`src/lib/data/config.ts`). A stored size from the old steps (0.9, 1.15, 1.3)
is ignored and the page starts at Default, both in `loadUiPrefs` and in the
inline first-paint script (`PrefsBoot.astro`). The four "A" buttons are
drawn at 11 / 14.5 / 18 / 21.5px so the difference is visible; tooltips no
longer state a percentage, since no single number is true.

## Roles

`--fs` is the chosen step. Every font size uses one of three roles:

- `--fs-read`: the full step. Reading text: the lead, How it works, the
  tour, tooltips, install steps, notes and statuses.
- `--fs-ui`: half the step (`1 + (step − 1) / 2`). Controls and titles:
  buttons, choices, pills, menus, the name.
- fixed: no factor. The eyebrow, the labels sitting on field borders, the
  caret.

Both are capped per layout by `--fs-cap` (tokens.css): desktop 1.25,
tablet 1.2, upright phone 1.15, sideways phone 1.1. So the boxes, which are
mostly fixed pixel heights, never get text they cannot hold.

## Fonts

Every page font gets a `size-adjust` in its `@font-face` so all fonts look
the same size at every step. Measured in Chrome at 100px and set to the
geometric mean of the height and width ratios against the reference (Inter
for English: x-height and the width of a sentence; Yekan Bakh, which keeps
its 120%, for Persian: the height of ا and the width of a sentence):
Manrope 101%, Jakarta 101%, Plex 105%, Grotesk 104%, Vazir 111%,
Doran 98%, Niloofar 116%. The old unused `--fa-small` factor is gone.

## Checked

`sizecheck.mjs` (kept out of the repo) loads every layout (1300×860,
1024×768, 768×1024, 390×844, 360×740, 844×390, 740×360, 667×375) × both
languages × every font × every step, opens CV options, How it works and the
accessibility menu in each, and flags text that is clipped, spills out of its
button, leaves the screen or makes the page scroll sideways. One case was
found and fixed (Digital cut off in the sideways CV options at the two
largest steps: the menu is 380px wide there); everything else was clean.

Later the same day:

- The name never wraps: it is `nowrap`, and the title row wraps instead, so
  at the largest steps on desktop How it works drops under the name. On
  phones the name scales with the screen width (`clamp(22px, 7.6vw, 32px)`).
- Short phones (under 600px tall, e.g. iPhone 4) hide the intro line and
  tighten the spacing, so the card fits without scrolling and the preview
  keeps its room.
- The size check also flags a wrapping name, an overflowing card and a page
  that scrolls; it was clean for 320×480, 360×740, 375×667, 390×844,
  414×736, 740×360, 768×1024 and 1300×860 at every step, language and font.
