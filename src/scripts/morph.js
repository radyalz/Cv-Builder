/* -------- Morphing between layouts --------
   Crossing from desktop to tablet to phone (or back) rearranges the card:
   the controls fold into the CV options field, the three actions into the
   split button, the preview moves under the controls, and the expanded
   view's pills change their tools. Instead of jumping, every part glides
   from where it was to where it now belongs: parts that are in both
   layouts move and resize, parts that take another's place grow out of
   it, and the pills stretch or shrink to their new width while their new
   contents fade in.

   Where things were is remembered every frame while the window is being
   resized (and whenever something changes size or the page scrolls), so
   when a breakpoint is crossed the layout from just before it is known. */

const BREAKPOINTS = ["(max-width: 599px)", "(max-width: 1023px)", "(max-width: 399px)", "(max-width: 349px)"];
const MORPH_MS = 520;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

// `from`: where a part grows out of when it was not on screen before (all
// of the parts it names together). `bar`: a part of the expanded view's
// bar, the only parts that move while the preview is expanded.
const PARTS = [
  { selector: ".card-top" },
  { selector: "#page-title" },
  { selector: ".lead" },
  { selector: "#cvControls > .control", from: ".forms-entry" },
  { selector: ".forms-entry", from: "#cvControls" },
  { selector: ".actions > :not(.actions-break)", from: ".action-split" },
  { selector: ".action-split", from: ".actions" },
  { selector: ".card-preview" },
  { selector: ".expanded-info", pill: true, fade: true, bar: true },
  { selector: ".expanded-actions", pill: true, bar: true },
  // Inside the tools pill each tool moves on its own; on phones the two
  // zoom buttons (and under 350px the two fit buttons) fold into one
  // picker button, and split out of it again on the way back.
  { selector: ".expanded-actions > .links-hint, .expanded-actions > .bar-button, .pdf-tools-rule", bar: true },
  { selector: ".pdf-tools > [data-pdf^='fit']", from: ".fit-select", bar: true },
  { selector: ".fit-select", from: ".pdf-tools > [data-pdf^='fit']", bar: true },
  { selector: ".pdf-tools > [data-pdf^='zoom'], #pdfZoom", from: ".zoom-select", bar: true },
  { selector: ".zoom-select", from: ".pdf-tools > [data-pdf^='zoom'], #pdfZoom", bar: true },
];

// Measured too, only to be grown out of.
const ORIGINS = ["#cvControls", ".actions"];

// The box around all of the given boxes that were on screen.
function union(boxes) {
  const present = boxes.filter(Boolean);

  if (!present.length) {
    return null;
  }

  const left = Math.min(...present.map((box) => box.left));
  const top = Math.min(...present.map((box) => box.top));
  const right = Math.max(...present.map((box) => box.left + box.width));
  const bottom = Math.max(...present.map((box) => box.top + box.height));

  return { left, top, width: right - left, height: bottom - top };
}

let started = false;

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// The part's box, or null when it is not on screen: not displayed, hidden,
// or only kept in the page for scripts (a pixel wide).
function boxOf(element) {
  const visible = element.checkVisibility
    ? element.checkVisibility({ visibilityProperty: true })
    : element.offsetParent !== null && getComputedStyle(element).visibility !== "hidden";

  if (!visible) {
    return null;
  }

  const rect = element.getBoundingClientRect();

  return rect.width > 2 && rect.height > 2 ? rect : null;
}

export function initMorph() {
  const card = document.querySelector(".builder-card");

  if (started || !card) {
    return;
  }

  started = true;

  let boxes = new Map();

  function elements() {
    return PARTS.flatMap((part) =>
      [...document.querySelectorAll(part.selector)].map((element) => ({ element, part }))
    );
  }

  function remember() {
    const next = new Map();

    for (const selector of ORIGINS) {
      const element = document.querySelector(selector);

      if (element) {
        next.set(element, boxOf(element));
      }
    }

    for (const { element } of elements()) {
      next.set(element, boxOf(element));
    }

    boxes = next;
  }

  // While the window is resized, the boxes are taken every frame; the
  // loop stops a moment after the last resize.
  let frames = 0;
  let looping = false;

  function loop() {
    remember();

    if (--frames > 0) {
      requestAnimationFrame(loop);
    } else {
      looping = false;
    }
  }

  function keepRemembering() {
    frames = 30;

    if (!looping) {
      looping = true;
      requestAnimationFrame(loop);
    }
  }

  window.addEventListener("resize", keepRemembering);
  window.addEventListener("scroll", keepRemembering, { passive: true, capture: true });
  new ResizeObserver(() => remember()).observe(card);

  function morphPart(element, part, before, after, delay) {
    // The pills keep their height and centre, so they only stretch; their
    // new contents fade in as they do.
    if (part.pill) {
      if (Math.abs(before.width - after.width) < 1) {
        return;
      }

      element.animate(
        [
          { width: `${before.width}px`, overflow: "hidden" },
          { width: `${after.width}px`, overflow: "hidden" },
        ],
        { duration: MORPH_MS, easing: EASE }
      );

      for (const child of part.fade ? element.children : []) {
        child.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: MORPH_MS * 0.6,
          delay: MORPH_MS * 0.25,
          easing: "ease-out",
          fill: "backwards",
        });
      }

      return;
    }

    const dx = before.left - after.left;
    const dy = before.top - after.top;
    const sx = before.width / after.width;
    const sy = before.height / after.height;

    if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) {
      return;
    }

    element.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, transformOrigin: "0 0" },
        { transform: "none", transformOrigin: "0 0" },
      ],
      { duration: MORPH_MS, delay, easing: EASE, fill: "backwards" }
    );
  }

  function growPart(element, origin, after, delay) {
    const dx = origin.left - after.left;
    const dy = origin.top - after.top;

    element.animate(
      [
        {
          opacity: 0,
          transform: `translate(${dx}px, ${dy}px) scale(${origin.width / after.width}, ${origin.height / after.height})`,
          transformOrigin: "0 0",
        },
        { opacity: 1, transform: "none", transformOrigin: "0 0" },
      ],
      { duration: MORPH_MS, delay, easing: EASE, fill: "backwards" }
    );
  }

  function morph(previous) {
    // Not in the middle of the preview growing or shrinking.
    if (reducedMotion() || card.classList.contains("is-growing")) {
      return;
    }

    // Every new box is measured before anything starts moving: a part's
    // animation would otherwise skew the boxes of the parts inside it. With
    // the preview expanded only its bar changes; the rest is out of sight.
    const expanded = card.classList.contains("is-expanded");
    const parts = elements()
      .filter(({ part }) => Boolean(part.bar) === expanded)
      .map(({ element, part }) => ({ element, part, before: previous.get(element), after: boxOf(element) }));
    let order = 0;

    for (const { element, part, before, after } of parts) {
      if (!after) {
        continue;
      }

      // A small stagger, so the parts settle one after another.
      const delay = Math.min(order++ * 18, 140);

      if (before) {
        morphPart(element, part, before, after, delay);
      } else if (part.from) {
        const origin = union([...document.querySelectorAll(part.from)].map((from) => previous.get(from)));

        if (origin) {
          growPart(element, origin, after, delay);
        }
      }
    }
  }

  // A crossing is handled on the next frame, after every other script has
  // rearranged the page for it (forms-menu.js moves the controls), but
  // still before that frame is painted. The boxes from before the crossing
  // are copied now, ahead of the loop replacing them.
  let pending = null;

  for (const query of BREAKPOINTS) {
    window.matchMedia(query).addEventListener("change", () => {
      if (pending) {
        return;
      }

      pending = boxes;
      requestAnimationFrame(() => {
        morph(pending);
        pending = null;
        remember();

        // Measured again once everything has landed: the boxes taken just
        // now are where the parts start from, not where they end up.
        const moving = document.getAnimations().filter((animation) => card.contains(animation.effect?.target));

        Promise.allSettled(moving.map((animation) => animation.finished)).then(remember);
      });
    });
  }

  remember();
}
