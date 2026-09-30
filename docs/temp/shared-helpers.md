# Shared helpers

## `src/lib/popover.ts` — `positionPopover(trigger, menu)`

Menus live outside the card (the card clips its own overflow, and its
backdrop-filter makes it the containing block for fixed children), so they are
`position: fixed` and placed against their trigger:

- aligned to the trigger's start edge, which is its right edge in RTL;
- kept 8px inside the window;
- flipped above the trigger when there is no room below.

## `src/lib/ripple.ts` — `initRipple()`

A material-style ink ripple from the point of the press on every control in
`RIPPLE_TARGETS`. It is one delegated `pointerdown` listener on `document`, so
controls added to the page later get it too. Disabled controls (`disabled` or
`aria-disabled="true"`) get no ripple. The `.ripple` animation lives in
`src/styles/buttons.css`; the span removes itself on `animationend`.
