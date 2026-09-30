import { positionPopover } from "../../lib/popover";
import { closeA11y } from "../../lib/prefs";
import { reversible } from "../../lib/reversible";

export interface FormsMenu {
  isOpen(): boolean;
  open(): void;
  close(options?: { refocus?: boolean; instant?: boolean }): void;
  place(): void;
}

export function formsMenu(trigger: HTMLElement, menu: HTMLElement): FormsMenu {
  const motion = reversible(menu, { opacity: 0, transform: "translateY(-8px) scale(0.94)" }, 260);
  let open = false;

  const place = () => {
    menu.style.width = `${trigger.getBoundingClientRect().width}px`;
    positionPopover(trigger, menu);
    menu.style.transformOrigin =
      menu.getBoundingClientRect().top >= trigger.getBoundingClientRect().bottom ? "50% 0" : "50% 100%";
  };

  return {
    isOpen: () => open,
    place,
    open() {
      document.dispatchEvent(new CustomEvent("menus:close", { detail: "forms" }));
      closeA11y();
      open = true;
      menu.hidden = false;
      menu.style.pointerEvents = "";
      trigger.setAttribute("aria-expanded", "true");
      place();
      motion.open();
    },
    close({ refocus = false, instant = false } = {}) {
      if (!open) {
        return;
      }

      open = false;
      menu.style.pointerEvents = "none";
      trigger.setAttribute("aria-expanded", "false");

      if (instant) {
        motion.cancel();
      } else {
        motion.close(() => open);
      }

      if (refocus) {
        trigger.focus({ preventScroll: true });
      }
    },
  };
}
