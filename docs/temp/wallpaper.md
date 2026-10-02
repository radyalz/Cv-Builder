# Saving the background — `src/scripts/wallpaper/`

While the background is being admired, a download button beside the eye saves
it alone (no card, no buttons) at the window's size in device pixels (ratio
capped at 2, longest side at 3840, both sides even as video needs): as a PNG
of this moment, or as a 15–30 second video to use as a wallpaper.

- The background is two canvases, the gradient and halftone
  (`lib/halftone`) and the skulls (`lib/skulls`); each frame they are drawn
  one over the other onto a third canvas (`files.ts` → `compose`), which is
  what gets saved or recorded.
- Video is MP4 (H.264) where the browser can record it (Chrome, Edge, Safari)
  and WebM elsewhere (Firefox); about 8 Mbit/s for a 1080p frame, scaled with
  the frame size, between 4 and 24 Mbit/s. 30 fps.
- The temporary download link stops its own click from spreading: the page
  would otherwise take it as a click outside the menu and close it.
- Leaving admire mode closes the menu and cancels a recording (nothing is
  saved). A frame arriving after Cancel no longer calls `stop()` on a recorder
  that has already stopped.
- The browser pauses the skull animation in a hidden tab, so a recording made
  with the tab in the background freezes for that stretch. A 15–30s clip does
  not match the 70s drift loop, so it will jump when repeated.

Files: `files.ts` (size, compose, save, names, supported type), `recorder.ts`,
`ui.ts` (the menu's parts), `popover.ts`, `index.ts`.

Checked against the previous single file: identical menu state through
open, image, recording, done and cancel-by-leaving, and the same output
(1280×720 PNG; H.264 1280×720 15.0s MP4).

Sideways phones (2026-10-02): the menu is two columns (title, note and the
image button on one side; video length, Record and the recording progress on
the other) so it fits screens down to 300px tall at every text size; the
divider above the video section is dropped there.
