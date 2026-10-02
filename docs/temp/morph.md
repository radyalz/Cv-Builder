# Morphing between layouts — `src/scripts/morph/`

Crossing from desktop to tablet to phone (or back) rearranges the card: the
controls fold into the CV options field, the three actions into the split
button, the preview moves under the controls, and the expanded view's pills
change their tools. Instead of jumping, every part glides from where it was to
where it now belongs:

- parts in both layouts move and resize (a translate + scale from the old box,
  origin top-left, 520ms, staggered 18ms per part up to 140ms);
- parts that take another's place grow out of it (`from` in `parts.ts`, the
  union of everything the selector names), fading in;
- the expanded view's pills stretch or shrink to their new width (the tools
  pill keeps its tools centred so they stay put while it does), and the title
  pill's new contents fade in.

With the preview expanded only its bar moves (`bar: true` parts); otherwise
only the card's parts. Nothing morphs with reduced motion or while the
preview is growing or shrinking.

## Knowing where things were (`memory.ts`)

When a breakpoint is crossed the layout from just before it must be known, so
boxes are remembered: every frame for 30 frames after each resize event, when
the card changes size, and on scroll. The resize event arrives with the new
size already applied, so boxes are measured on animation frames, never in the
resize handler. A crossing copies the boxes at once, then morphs on the next
frame — after every other script has rearranged the page for it (the CV
options menu moves the controls) but before that frame is painted. Boxes are
measured again once the morph animations finish, because the boxes taken
during them are where the parts start from, not where they end up.

Checked against the previous single file: identical animations (parts,
keyframes, delays, durations) for every crossing, card and expanded view.

## Rotated phones (2026-10-01)

On a phone turned sideways (`max-width: 1023px`, landscape, `max-height:
600px`: the two-column landscape layout) the preview's foot (publish date,
clickable links, Expand) is moved into the text column, under the action
button (`morph/foot.ts`, `placeFoot()` on that media query), and moved back
under the preview frame otherwise. The query is one of the morph's
breakpoints and `.preview-foot` one of its parts, so the move slides. The
expand animation pins only parts not inside another pinned part
(`pinnedParts()` in `builder/expand/pin.ts`), so the foot then travels with
the text column.

Sideways phones otherwise follow phone mode (`PEEK` in `src/lib/layout.ts`,
shared by the CSS media queries and `isPhone()`): How it works is the round
icon button, the preview is a peek that opens when tapped (with the "tap to
expand" pill, no Expand button), and the moved foot is one outlined row like
the CV options field: the publish date (cut short with an ellipsis if
needed) and the clickable-links pill at its end.

Later the same day: on sideways phones How it works is the labelled pill
again, under the name (the title row stacks), and the preview's heading
(label and the copy's colour, edition and language) moves under the date
and links row too, led by an accent arrow (`.preview-pointer`, nudging
toward the preview; mirrored in Persian). `placeFoot()` moves both and puts
the heading back as the preview's first child otherwise. The column is
compacted (no shrinking children, shorter pill and button) to fit 360px-tall
screens, and the accessibility button and the install card keep their corners in
every orientation and language (bottom-right, bottom-left). In Persian the
preview heading row starts 52px in from the right so the button never
covers it.

In Persian the heading row is spread across the column: the copy's colour,
edition and language at its start (right), "پیش‌نمایش" and the arrow at its
far end (left), next to the preview.

Sideways phones, panels (2026-10-02): How it works opens as one wide
two-column panel (intro text on one side; Take the tour and the topics on
the other), capped to the screen height and scrolling inside if needed;
the CV options menu puts the accent on its own row with edition and
language side by side below. Both sit above the accessibility button
(z-index 47). The preview heading row is the same in both languages: the
copy's colour, edition and language at its start, the label and arrow at
its end, next to the preview.

Sideways phones, panels, second pass (2026-10-02):

- How it works and CV options open beside their button (`positionBeside()`
  in `src/lib/popover.ts`: to the right in English, to the left in Persian,
  top-aligned and kept on screen). How it works is one column: the
  explanation, Take the tour, then "Explore one part", which opens the
  topics as their own small list beside the panel
  (`scripts/intro-info/explore.ts`: the list is moved to `<body>` while
  open and back when the panel closes, so the topics render in place
  elsewhere).
- The accessibility menu is a two-column grid: page language | appearance,
  text size | font, admire | install (uninstall's panel spans both). The
  font is a dropdown field like the accent picker (`.font-trigger`, label
  and face synced in `applyPrefs`, toggled in `prefs/events.ts`); its list
  opens upward inside the menu so choices still count as menu clicks.
  Tour steps for the menu's groups are found by their control
  (`:has([data-a11y=…])`), not by position.

Tablets too (2026-10-02): the preview's heading and foot move under the
main button on every compact non-phone layout as well as sideways phones
(`ROWS_UNDER_ACTIONS` in `src/lib/layout.ts`). The rules for the moved rows
are written against `.card-main > …`, so they apply wherever the rows have
been moved and nowhere else. The arrow points down at the preview on
tablets and sideways toward it on sideways phones. Under the preview (where
the foot stays on desktop) the links pill sits at the far end of the row.

## Desktop from 900px (2026-10-02)

The layouts are defined once in `src/lib/layout.ts` and repeated verbatim in
the CSS media queries:

- desktop: `(min-width: 900px) and (min-height: 601px), (min-width: 1024px)`
  (iPad Air and iPad mini sideways, Chrome's "Desktop site" on a
  phone, which reports about 980px).
- compact: `(max-width: 899px), (max-width: 1023px) and (max-height: 600px)`
  (iPad Air and iPad mini upright, older 768px iPads, phones, sideways
  phones). It was 800px for a moment; 900px gives the iPad Air upright the
  roomier tablet layout.
- tablet: the compact range from 600px wide.
- the narrow-desktop tweaks run from 900px to 1279px.

Between 900 and 1023px wide the desktop action buttons stack in one column,
and all action labels are `nowrap` with an ellipsis, so they never break
onto two lines. The title row no longer has 26px of end padding, so How it
works lines up with the buttons' edge. Checked with the size check at
820×1180, 1180×820, 744×1133, 1133×744, 980×1900, 1300×860 and 768×1024 at
every step, language and font: clean.

Very short sideways screens (2026-10-02): a phone like the Galaxy S25 Ultra
sideways is about 915px wide but only 300–350px tall once Chrome's address
bar and Android's navigation bar show, so the lower rows were pushed out of
the scrolling text column. Below 380px tall How it
works sits beside the name again, and the gaps shrink; everything down to
the preview heading fits without scrolling at 300px. Size check at 915×340,
915×300 and 844×330: clean.
