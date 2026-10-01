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
