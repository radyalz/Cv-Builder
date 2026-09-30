import { positionPopover } from "../../lib/popover";
import { reversible } from "../../lib/reversible";

export interface ActionMenu {
  isOpen(): boolean;
  open(focusItem: HTMLElement): void;
  close(options?: { refocus?: boolean }): void;
  place(): void;
}

export function actionMenu(split: HTMLElement, toggle: HTMLElement, menu: HTMLElement): ActionMenu {
  const motion = reversible(menu, { opacity: 0, transform: "translateY(-6px) scale(0.96)" }, 220);
  let open = false;

  const place = () => {
    menu.style.width = `${split.getBoundingClientRect().width}px`;
    positionPopover(split, menu);
    menu.style.transformOrigin =
      menu.getBoundingClientRect().top >= split.getBoundingClientRect().bottom ? "50% 0" : "50% 100%";
  };

  return {
    isOpen: () => open,
    place,
    open(focusItem) {
      open = true;
      menu.hidden = false;
      menu.style.pointerEvents = "";
      toggle.setAttribute("aria-expanded", "true");
      place();
      motion.open();
      focusItem.focus({ preventScroll: true });
    },
    close({ refocus = false } = {}) {
      if (!open) {
        return;
      }

      open = false;
      menu.style.pointerEvents = "none";
      toggle.setAttribute("aria-expanded", "false");
      motion.close(() => open);

      if (refocus) {
        toggle.focus({ preventScroll: true });
      }
    },
  };
}
