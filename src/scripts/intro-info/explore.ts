import { positionBeside } from "../../lib/popover";

export interface Explore {
  toggle(): void;
  close(): void;
  place(): void;
  contains(node: Node): boolean;
}

const still = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function explore(button: HTMLElement, box: HTMLElement, anchor: HTMLElement): Explore {
  const home = box.parentElement!;
  let open = false;

  const place = () => open && positionBeside(anchor, box);

  const close = () => {
    if (!open) return;

    open = false;
    box.classList.remove("is-flying");
    home.append(box);
    button.setAttribute("aria-expanded", "false");
  };

  return {
    toggle() {
      if (open) return close();

      open = true;
      document.body.append(box);
      box.classList.add("is-flying");
      button.setAttribute("aria-expanded", "true");
      place();

      if (!still()) {
        box.animate([{ opacity: 0, transform: "scale(0.94)" }, { opacity: 1, transform: "none" }], {
          duration: 220,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        });
      }

      box.querySelector<HTMLElement>(".tour-topic")?.focus({ preventScroll: true });
    },
    close,
    place,
    contains: (node) => box.contains(node),
  };
}
