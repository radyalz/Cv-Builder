import { placeArrowTip, placeCursorTip, runSpring } from "./motion";
import { renderTip, type TipContent } from "./render";
import { isVisible, tip, type TipMode } from "./state";

let contentFor = (element: HTMLElement): TipContent => ({
  title: element.dataset.tipTitle || element.getAttribute("aria-label") || "",
  body: element.dataset.tipBody || "",
});

export function setTipContent(fn: (element: HTMLElement) => TipContent): void {
  contentFor = fn;
}

function swapContents(box: HTMLElement): void {
  box.classList.remove("is-swapping");
  void box.offsetWidth;
  box.classList.add("is-swapping");
}

export function showTip(element: HTMLElement, mode: TipMode): void {
  const { tooltip, box } = tip.els!;
  const wasVisible = isVisible();

  window.clearTimeout(tip.hideTimer);
  renderTip(box, contentFor(element));
  tip.mode = mode;
  tooltip.dataset.mode = mode;
  element.setAttribute("aria-describedby", "tooltip");

  if (wasVisible) {
    swapContents(box);
  }

  if (mode === "cursor") {
    if (!wasVisible) {
      tip.pos = { ...tip.mouse };
      tip.vel = { x: 0, y: 0 };
    }

    placeCursorTip();
    runSpring();
  } else {
    placeArrowTip(element);
  }

  tooltip.classList.add("is-visible");
}

export function hideTip(): void {
  if (!tip.els) {
    return;
  }

  window.clearTimeout(tip.showTimer);
  window.clearTimeout(tip.hideTimer);
  tip.target?.removeAttribute("aria-describedby");
  tip.target = null;
  tip.els.tooltip.classList.remove("is-visible");
}
