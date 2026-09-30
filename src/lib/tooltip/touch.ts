import { showTip } from "./show";
import { closestTip, tip } from "./state";

const HOLD_MS = 480;
const MOVE_TOLERANCE = 10;

let holdTimer = 0;
let holdStart: { x: number; y: number } | null = null;
let heldTarget: HTMLElement | null = null;

function onPointerDown(event: PointerEvent): void {
  if (event.pointerType !== "touch") {
    return;
  }

  const target = closestTip(event.target);

  window.clearTimeout(holdTimer);
  heldTarget = null;

  if (!target) {
    return;
  }

  holdStart = { x: event.clientX, y: event.clientY };
  holdTimer = window.setTimeout(() => {
    heldTarget = target;
    tip.target = target;
    showTip(target, "arrow");
  }, HOLD_MS);
}

function onPointerMove(event: PointerEvent): void {
  if (holdStart && Math.hypot(event.clientX - holdStart.x, event.clientY - holdStart.y) > MOVE_TOLERANCE) {
    window.clearTimeout(holdTimer);
  }
}

function endHold(): void {
  window.clearTimeout(holdTimer);
  holdStart = null;
}

function swallowHeldClick(event: MouseEvent): void {
  if (heldTarget && heldTarget.contains(event.target as Node)) {
    event.preventDefault();
    event.stopPropagation();
    heldTarget = null;
  }
}

export function watchTouch(): void {
  document.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerup", endHold);
  document.addEventListener("pointercancel", endHold);
  document.addEventListener("click", swallowHeldClick, true);
  document.addEventListener("contextmenu", (event) => {
    if (closestTip(event.target) && heldTarget) {
      event.preventDefault();
    }
  });
}
