import { ORIGINS, partElements } from "./parts";

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export type Boxes = Map<Element, Box | null>;

export function boxOf(element: Element): DOMRect | null {
  const visible =
    "checkVisibility" in element
      ? element.checkVisibility({ visibilityProperty: true })
      : (element as HTMLElement).offsetParent !== null && getComputedStyle(element).visibility !== "hidden";

  if (!visible) {
    return null;
  }

  const rect = element.getBoundingClientRect();

  return rect.width > 2 && rect.height > 2 ? rect : null;
}

export function union(boxes: (Box | null | undefined)[]): Box | null {
  const present = boxes.filter((box): box is Box => Boolean(box));

  if (!present.length) {
    return null;
  }

  const left = Math.min(...present.map((box) => box.left));
  const top = Math.min(...present.map((box) => box.top));
  const right = Math.max(...present.map((box) => box.left + box.width));
  const bottom = Math.max(...present.map((box) => box.top + box.height));

  return { left, top, width: right - left, height: bottom - top };
}

export function measureAll(): Boxes {
  const boxes: Boxes = new Map();

  for (const selector of ORIGINS) {
    const element = document.querySelector(selector);

    if (element) boxes.set(element, boxOf(element));
  }

  for (const { element } of partElements()) {
    boxes.set(element, boxOf(element));
  }

  return boxes;
}
