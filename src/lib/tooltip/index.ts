import { watchPointer } from "./pointer";
import { tip } from "./state";
import { watchTouch } from "./touch";

export { hideTip, setTipContent } from "./show";
export { showTouchHint } from "./hint";
export type { Fact, TipContent } from "./render";

let started = false;

export function initTooltip(): void {
  const tooltip = document.getElementById("tooltip");

  if (started || !tooltip) {
    return;
  }

  started = true;
  tip.els = {
    tooltip,
    pop: tooltip.querySelector<HTMLElement>(".tip-pop")!,
    bubble: tooltip.querySelector<HTMLElement>(".tip-bubble")!,
    box: tooltip.querySelector<HTMLElement>(".tip-content")!,
  };

  watchPointer();
  watchTouch();
}
