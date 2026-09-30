import { positionPopover } from "../../lib/popover";
import { reversible } from "../../lib/reversible";

export interface WallpaperPopover {
  isOpen(): boolean;
  show(focus: HTMLElement): void;
  hide(options?: { refocus?: boolean }): void;
  place(): void;
}

export function wallpaperPopover(button: HTMLElement, menu: HTMLElement): WallpaperPopover {
  const motion = reversible(menu, { opacity: 0, transform: "translateY(8px) scale(0.94)" }, 220);
  let open = false;

  const place = () => {
    positionPopover(button, menu);

    const box = menu.getBoundingClientRect();
    const from = button.getBoundingClientRect();
    const x = Math.min(box.width, Math.max(0, from.left + from.width / 2 - box.left));

    menu.style.transformOrigin = `${Math.round(x)}px ${box.top >= from.bottom ? 0 : "100%"}`;
  };

  return {
    isOpen: () => open,
    place,
    show(focus) {
      open = true;
      menu.hidden = false;
      menu.style.pointerEvents = "";
      button.setAttribute("aria-expanded", "true");
      place();
      motion.open();
      focus.focus({ preventScroll: true });
    },
    hide({ refocus = false } = {}) {
      if (!open) {
        return;
      }

      open = false;
      menu.style.pointerEvents = "none";
      button.setAttribute("aria-expanded", "false");
      motion.close(() => open);

      if (refocus) {
        button.focus({ preventScroll: true });
      }
    },
  };
}
