import { initTour, startTour } from "../tour";
import { callForAttention } from "./call";
import { introPopover, type IntroPopover } from "./popover";

let started = false;

function wire(button: HTMLElement, pop: HTMLElement, popover: IntroPopover): void {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    popover.isOpen() ? popover.hide() : popover.show();
  });

  document.addEventListener("click", (event) => {
    if (popover.isOpen() && !pop.contains(event.target as Node)) popover.hide();
  });

  pop.addEventListener("click", (event) => {
    const start = (event.target as Element).closest<HTMLElement>("#tourStart, .tour-topic");

    if (start) {
      popover.hide({ instant: true });
      startTour(Number(start.dataset.step || 0));
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && popover.isOpen()) popover.hide({ refocus: true });
  });

  document.addEventListener("menus:close", (event) => {
    if ((event as CustomEvent).detail !== "intro") popover.hide();
  });

  window.matchMedia("(max-width: 1023px)").addEventListener("change", () => popover.hide({ instant: true }));
  window.addEventListener("resize", () => popover.isOpen() && popover.place());
}

export function initIntroInfo(): void {
  const button = document.getElementById("introInfo");
  const pop = document.getElementById("introPop");

  if (started || !button || !pop) {
    return;
  }

  started = true;
  callForAttention(button);
  initTour();
  wire(button, pop, introPopover(button, pop));
}
