import { el } from "../dom";
import type { Box } from "./motion";

export interface PinnedBox extends Box {
  right: number;
}

const pinnedParts = [".card-main", ".preview-head", ".preview-foot"].map((selector) => el.card.querySelector<HTMLElement>(selector)!);

function measure(part: HTMLElement, card: DOMRect): PinnedBox | null {
  const builder = el.card;

  part.style.transition = "none";
  part.style.transform = "none";

  const rect = part.getBoundingClientRect();

  part.style.transform = "";
  void part.offsetWidth;
  part.style.transition = "";

  if (!rect.width) {
    return null;
  }

  return {
    left: rect.left - card.left - builder.clientLeft,
    right: card.right - rect.right - (builder.offsetWidth - builder.clientWidth - builder.clientLeft),
    top: rect.top - card.top - builder.clientTop,
    width: rect.width,
    height: rect.height,
  };
}

export function measureParts(): (PinnedBox | null)[] {
  const card = el.card.getBoundingClientRect();

  return pinnedParts.map((part) => measure(part, card));
}

export function pinParts(boxes: (PinnedBox | null)[], { leaving = false } = {}): void {
  pinnedParts.forEach((part, index) => {
    const box = boxes[index];

    if (!box) {
      return;
    }

    const byRight = leaving && part === pinnedParts[0] && document.documentElement.dir === "rtl";

    part.dataset.pinned = "";
    Object.assign(part.style, {
      left: byRight ? "auto" : `${box.left}px`,
      right: byRight ? `${box.right}px` : "auto",
      top: `${box.top}px`,
      width: `${box.width}px`,
      height: `${box.height}px`,
    });
  });

  el.card.classList.add("is-growing");
}

export function unpinParts(): void {
  el.card.classList.remove("is-growing");

  for (const part of pinnedParts) {
    delete part.dataset.pinned;
    ["left", "right", "top", "width", "height"].forEach((property) => part.style.removeProperty(property));
  }
}
