import { LANDSCAPE_PHONE } from "../../lib/layout";
import { positionBeside, positionPopover } from "../../lib/popover";
import { closeA11y } from "../../lib/prefs";
import { reversible } from "../../lib/reversible";
import { renderTopics } from "../tour";

export interface IntroPopover {
  isOpen(): boolean;
  show(): void;
  hide(options?: { refocus?: boolean; instant?: boolean }): void;
  place(): void;
}

export function introPopover(button: HTMLElement, pop: HTMLElement, onHide: () => void): IntroPopover {
  const motion = reversible(pop, { opacity: 0, transform: "translateY(-6px) scale(0.94)" }, 240);
  let open = false;

  const place = () => {
    if (window.matchMedia(LANDSCAPE_PHONE).matches) {
      positionBeside(button, pop);
      return;
    }

    positionPopover(button, pop);

    const box = pop.getBoundingClientRect();
    const from = button.getBoundingClientRect();
    const x = Math.min(box.width, Math.max(0, from.left + from.width / 2 - box.left));

    pop.style.transformOrigin = `${Math.round(x)}px ${box.top >= from.bottom ? 0 : "100%"}`;
  };

  return {
    isOpen: () => open,
    place,
    show() {
      document.dispatchEvent(new CustomEvent("menus:close", { detail: "intro" }));
      closeA11y();
      open = true;
      renderTopics(pop.querySelector(".tour-topics")!);
      pop.hidden = false;
      pop.style.pointerEvents = "";
      button.setAttribute("aria-expanded", "true");
      place();
      motion.open();
      document.getElementById("tourStart")?.focus({ preventScroll: true });
    },
    hide({ refocus = false, instant = false } = {}) {
      if (!open) {
        return;
      }

      open = false;
      onHide();
      pop.style.pointerEvents = "none";
      button.setAttribute("aria-expanded", "false");

      if (instant) {
        motion.cancel();
      } else {
        motion.close(() => open);
      }

      if (refocus) {
        button.focus({ preventScroll: true });
      }
    },
  };
}
