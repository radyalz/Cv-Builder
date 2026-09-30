import type { Box } from "./boxes";
import type { Part } from "./parts";

const MORPH_MS = 520;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

function stretchPill(element: HTMLElement, part: Part, before: Box, after: Box): void {
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
}

export function morphPart(element: HTMLElement, part: Part, before: Box, after: Box, delay: number): void {
  if (part.pill) {
    stretchPill(element, part, before, after);
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

export function growPart(element: HTMLElement, origin: Box, after: Box, delay: number): void {
  const dx = origin.left - after.left;
  const dy = origin.top - after.top;
  const scale = `scale(${origin.width / after.width}, ${origin.height / after.height})`;

  element.animate(
    [
      { opacity: 0, transform: `translate(${dx}px, ${dy}px) ${scale}`, transformOrigin: "0 0" },
      { opacity: 1, transform: "none", transformOrigin: "0 0" },
    ],
    { duration: MORPH_MS, delay, easing: EASE, fill: "backwards" }
  );
}
