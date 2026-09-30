import { runSpring } from "./motion";
import { hideTip, showTip } from "./show";
import { closestTip, isVisible, tip } from "./state";

const OPEN_DELAY_MS = 320;
const GRACE_MS = 90;

function onPointerMove(event: PointerEvent): void {
  if (event.pointerType === "touch") {
    return;
  }

  tip.mouse = { x: event.clientX, y: event.clientY };

  if (tip.mode === "cursor" && isVisible()) {
    runSpring();
  }
}

function onPointerOver(event: PointerEvent): void {
  const target = closestTip(event.target);

  if (event.pointerType === "touch" || target === tip.target) {
    return;
  }

  window.clearTimeout(tip.showTimer);

  if (!target) {
    window.clearTimeout(tip.hideTimer);
    tip.hideTimer = window.setTimeout(hideTip, GRACE_MS);
    return;
  }

  tip.target?.removeAttribute("aria-describedby");
  tip.target = target;

  if (isVisible()) {
    showTip(target, "cursor");
  } else {
    tip.showTimer = window.setTimeout(() => showTip(target, "cursor"), OPEN_DELAY_MS);
  }
}

function onFocusIn(event: FocusEvent): void {
  const target = closestTip(event.target);

  if (target?.matches(":focus-visible")) {
    hideTip();
    tip.target = target;
    showTip(target, "arrow");
  }
}

export function watchPointer(): void {
  document.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("pointerover", onPointerOver);
  document.addEventListener("focusin", onFocusIn);
  document.addEventListener("focusout", () => tip.mode === "arrow" && hideTip());
  document.addEventListener("pointerdown", hideTip, true);
  window.addEventListener("scroll", hideTip, true);
  window.addEventListener("blur", hideTip);
}
