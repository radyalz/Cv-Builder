# How it works and the tour

## How it works — `src/scripts/intro-info/`

The info button at the end of the name's row opens the explanation for the
controls on screen in a small popover (same rise and fade as the other menus,
via `lib/reversible.ts`). Its buttons start the tour: all of it, or straight
at one part of the layout on screen. For the first 30 seconds the button calls
for attention (ripples and a gentle swell, in `responsive.css`) until the
visitor hovers, focuses or clicks it (`call.ts`). Opening it moves focus into
the popover. It closes when the layout crosses 1024px, because its parts
change with the layout.

## The tour — `src/scripts/tour/`

The page dims, a ring of light settles on one part at a time and a card beside
it says what the part is and what to do with it.

- **Steps** (`steps/`): desktop and the smaller layouts have different parts
  (the controls themselves, or the CV options field and the split button), so
  each has its own list. Step fields:
  - `target` — everything it matches on screen, ringed together;
  - `title`, `text` — string keys (`text` may be a function of the layout);
  - `menu` — to have open while it shows: `forms`, `actions`, `a11y`, or
    `expanded` (the preview grown to full screen);
  - `admire` — show the background alone (with a lighter dim so it can be
    seen);
  - `when` — a media query for the screens it is on, so the count only counts
    what will be shown (tools folded into pickers on phones);
  - `optional` — passed over when not on screen (the link count before a copy
    has links);
  - `round` — circular ring; `topic` + `icon` — offered in the popover.
- **Staging** (`stage.ts`): opens the menu a step needs (closing any other the
  tour opened) and waits for it to settle: 320ms for a menu, 1200ms for the
  preview to grow or shrink. Opening a menu can move focus into it, so focus
  goes back to the card. Ending the tour puts everything back.
- **Placement** (`geometry.ts`): the ring is a rounded box around the part (a
  circle for round buttons) whose enormous shadow is the dimming, so the part
  itself stays lit. The card goes under the ring when there is room, else
  above, else beside it (a tall part like the preview), else at the bottom of
  the window; always inside the window's edges.
- The ring is placed again 300ms after each step, because a part can still be
  moving when the step shows: after the expanded preview closes, the
  accessibility button scales back up for 220ms from about 0.9s, around the
  same moment the tour's 1.2s wait ends. Before the split, the ring was
  sometimes drawn around the half-grown button.
- **Keys** (`keys.ts`): Back/Next or the arrow keys (following the reading
  direction, so Left is forward in Persian); Escape, the close button or a tap
  on the dim page ends it. Focus stays on the card's buttons while open.
  Clicks on the tour stop there, because the menus it has open would
  otherwise take a click on the card as a click outside them and close.

Checked against the previous single file at desktop, tablet and phone in both
languages: identical steps, text, menus and positions, except the ring on the
accessibility step after the expanded preview, which is now always the
settled size.
