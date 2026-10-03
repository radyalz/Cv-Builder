import { COMPACT, LANDSCAPE_PHONE } from "../../lib/layout";
import { initTour, startTour } from "../tour";
import { whenReady } from "../splash/ready";
import { callForAttention } from "./call";
import { explore, type Explore } from "./explore";
import { introPopover, type IntroPopover } from "./popover";

let started = false;

function wire(button: HTMLElement, pop: HTMLElement, popover: IntroPopover, list: Explore): void {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    popover.isOpen() ? popover.hide() : popover.show();
  });

  document.addEventListener("click", (event) => {
    if (popover.isOpen() && !pop.contains(event.target as Node) && !list.contains(event.target as Node)) popover.hide();
  });

  const onStart = (event: Event) => {
    if ((event.target as Element).closest("#tourExplore")) {
      list.toggle();
      return;
    }

    const start = (event.target as Element).closest<HTMLElement>("#tourStart, .tour-topic");

    if (start) {
      event.stopPropagation();
      popover.hide({ instant: true });
      startTour(Number(start.dataset.step || 0));
    }
  };

  pop.addEventListener("click", onStart);
  document.getElementById("tourTopicsBox")!.addEventListener("click", onStart);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && popover.isOpen()) popover.hide({ refocus: true });
  });

  document.addEventListener("menus:close", (event) => {
    if ((event as CustomEvent).detail !== "intro") popover.hide();
  });

  for (const query of [COMPACT, LANDSCAPE_PHONE]) {
    window.matchMedia(query).addEventListener("change", () => popover.hide({ instant: true }));
  }
  window.addEventListener("resize", () => popover.isOpen() && popover.place());
}

export function initIntroInfo(): void {
  const button = document.getElementById("introInfo");
  const pop = document.getElementById("introPop");

  if (started || !button || !pop) {
    return;
  }

  started = true;
  whenReady(() => callForAttention(button));
  initTour();
  const list = explore(document.getElementById("tourExplore")!, document.getElementById("tourTopicsBox")!, pop);

  wire(button, pop, introPopover(button, pop, list.close), list);
}
