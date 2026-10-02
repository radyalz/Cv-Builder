# Components — `src/components/`, `src/layouts/`, `src/pages/`

The markup, split into small pieces by what each shows. The rendered page is
the same as before the split (the built HTML compared node for node).

## Shared

- `Icon.astro` — one 24×24 icon by name; the drawings are in `src/lib/icons.ts`.
- `Segmented.astro` — a row of mutually exclusive options (role=radiogroup),
  used for the edition, CV language and accessibility settings.
- `ColourMenu.astro` — the accent swatches and the custom colour row. It lives
  outside the card (which clips its overflow) and is placed against its
  trigger by the builder.
- `SkullField.astro` — the skull background's canvas, kept across page
  changes by the layout (`transition:persist`).
- `Tooltip.astro` — the one floating tooltip, driven by `src/lib/tooltip` for
  every element with `data-tip`.

## Layout (`layouts/`)

- `Base.astro` — the shell every page shares: the halftone and skulls under
  everything, the accessibility controls, the tooltip; pages fill the default
  slot and the `overlays` slot.
- `head/PrefsBoot.astro` — applies the stored preferences before the first
  paint, so a light or Persian page never flashes dark or English first. With
  no backdrop blur at all, it switches to the flat frosted card from the
  start.
- `head/AppHead.astro` — the manifest, icons and app meta tags. It also keeps
  Chrome's "installable" announcement (`beforeinstallprompt`), which can come
  before the page's own scripts have run, until `scripts/install` picks it
  up, so the install offer never misses it.

## The page (`page/`)

- `BuilderCard.astro` — the card: eyebrow, `TitleRow`, lead, `FormsEntry`,
  `CvControls`, the actions, and the preview.
- `TitleRow.astro` — the name and the "How it works" button, which opens the
  intro and the tour (`scripts/intro-info`).
- `FormsEntry.astro` — tablets and phones: one field for all three choices,
  opening the controls in a menu (`scripts/forms-menu`).
- `CvControls.astro` — accent, edition, CV language, and Reset (back to
  purple, digital, English), level with the controls it resets.
- `FormsMenu.astro` — tablets and phones: the controls are moved in here. It
  comes before the colour menu, which opens on top of it. Reset is the icon in
  its header, like the accessibility menu's.
- `IntroPop.astro` — the intro and the tour's start; the topic buttons are
  filled by `scripts/tour` with the parts of the layout on screen.
- `Tour.astro` — the highlight ring and the tour card.

## Actions (`actions/`)

- `ActionButtons.astro` — Generate, Download and All published copies.
  Desktop puts the link on its own line (`actions-break`); tablets keep all
  three in one row. The link is also named by `aria-label`: on tablets and
  phones it is kept hidden for the split button, and a hidden link has no
  text to be named by.
- `ActionSplit.astro` — tablets and phones: one split button in place of the
  three. Its main part performs the chosen action and its caret opens a menu
  to choose it (`scripts/action-menu`, which moves the menu to `<body>`: the
  card clips fixed children). It only relays clicks to the three originals,
  which stay in the page because the builder keeps their state.

## Preview (`preview/`)

- `PreviewPane.astro` — heading, frame, foot (meta, links hint, Expand) and
  the expanded bar.
- `PreviewFrame.astro` — the PDF, the skeleton, the "not published" state,
  the error with Retry (the copy or the listing could not be fetched), the
  build status on the preview itself, and the phones' "tap to expand" peek
  hint.
- `PreviewSkeleton.astro` — a CV-shaped placeholder that shimmers until the
  PDF has loaded: the header, a paragraph section, a label/value section and a
  section of dated entries, like the real first page.
- `BuildStatus.astro` — the three states (building, ready, failed); their
  text is filled in by the builder.
- `LinksHint.astro` — the PDF's links work in the preview; this says so and
  lights them. Used in the foot and in the expanded bar.
- `ExpandedBar.astro` — shown once the card fills the window. The title pill
  keeps only the coloured title under 400px, and its caret opens the rest
  (publish date, links) below. The tools pill sits at the bottom.
- `PdfTools.astro`, `FitSelect.astro`, `ZoomSelect.astro` — fit width/page and
  zoom; icons only on phones, where under 350px the two fit buttons become one
  picker and zoom out/in sit behind one monocle.

## Accessibility (`a11y/`)

- `A11yMenu.astro` — the buttons, the wallpaper menu, the install offer and
  the menu itself.
- `A11yButtons.astro` — the accessibility button; the admire eye (hides the
  card to show just the background; above the accessibility button on phones,
  beside it elsewhere); the wallpaper button, shown while admiring.
- `WallpaperMenu.astro` — save the background alone as an image or a 15–30s
  video (`scripts/wallpaper`); the recording row shows while recording.
- `InstallOffer.astro` — rises in the bottom-left corner a few seconds after
  the page opens where the site can be installed, for 30 seconds
  (`scripts/install`).
- `PageChoices.astro` — page language, appearance, text size.
- `FontChoices.astro` — only the fonts for the page's current language are
  offered; the Persian labels are the font names written in Persian.
- `InstallChoices.astro` — Install, only where the site can be installed and
  is not already (iPhones and iPads have no install prompt, so there it shows
  the steps instead); Uninstall once installed: a page cannot remove an
  installed app itself, so it shows how on this device and can delete the
  offline copy.

The text column (`.card-main`) scrolls, so it is a clipping box; it keeps
16px of room on each side (negative inline margin, matching padding) so How
it works and its call-out ripple are never cut at the column's edge in any
layout. The expand pinning accounts for those margins.
