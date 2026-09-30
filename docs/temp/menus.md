# Menus and popovers

## Shared motion — `src/lib/reversible.ts`

The popovers (CV options, How it works, the wallpaper menu) open with one Web
Animation played forwards and close by playing the same animation backwards
(1.3× faster by default). A click mid-way simply turns it around from where it
is instead of jumping or getting stuck. `close(isOpen)` hides the element once
the reverse finishes, unless it was reopened meanwhile. With reduced motion
the duration is 0. The accessibility menu (`lib/prefs/menu.ts`) uses the same
idea with its own origin handling.

## CV options — `src/scripts/forms-menu/`

Under 1024px the accent, edition and CV language controls leave the card for
a menu opened from one "CV options" field, which shows what is chosen (it
mirrors the preview's "Purple · Digital · English" label). The controls are
**moved, not copied**, so everything the builder wires to them keeps working;
a comment node marks their place in the card and they go back when the screen
is wide enough again (closing the menu instantly first).

- The menu is as wide as the field, under it (above when there is no room),
  growing out of the field's side of it.
- The colour menu opens from the accent control inside it and sits above it;
  while the colour menu is open, outside clicks and Escape leave this menu
  alone (the Escape listener is on the capture phase so it sees the key before
  the colour menu closes).
- Any other menu opening dispatches `menus:close`, which closes this one;
  opening this one dispatches it with `detail: "forms"`.

Checked against the previous single file on phone and tablet: identical state
at every step (open, choose, colour menu, two Escapes, outside click, widening
to desktop).

## Split button — `src/scripts/action-menu/`

On tablets and phones the three actions (Generate, Download, All published
copies) take one row: a split button whose main part performs the chosen
action and whose arrow opens a menu to choose it.

- **Nothing is done twice.** The three original controls stay in the page
  (hidden on these sizes) because the builder keeps their state. The main
  part relays its click to the original, and a `MutationObserver` mirrors the
  original's label and disabled state as the builder changes them (during a
  build, with no copy to download, "Generate Again"…).
- The choice is remembered for the visit (`sessionStorage`,
  `cv-builder-action`).
- The menu is moved to `<body>`: the card clips its overflow and its glass
  makes it the containing block for fixed children. It opens below the split
  button (above when there is no room), as wide as it, with focus on the
  current action. Up/Down/Home/End move between items; Tab, Escape or an
  outside click closes it.

Checked against the previous single file on a phone: identical state at every
step (open, keys, choose, relay, disabled mirroring, Escape, Tab, outside).
