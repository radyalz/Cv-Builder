import { positionPopover } from "../popover";

const MENU_OPEN_MS = 260;
const MENU_CLOSE_RATE = 1.3;

let menuOpen = false;
let menuMotion: Animation | null = null;

const menuElement = () => document.getElementById("a11yMenu");
const triggerElement = () => document.getElementById("a11yTrigger");

export const isA11yOpen = (): boolean => menuOpen;

function menuAnimation(menu: HTMLElement): Animation {
  if (!menuMotion || (menuMotion.effect as KeyframeEffect).target !== menu) {
    menuMotion = menu.animate(
      [
        { opacity: 0, transform: "translateY(14px) scale(0.92)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: MENU_OPEN_MS, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" }
    );
    menuMotion.pause();
  }

  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  menuMotion.effect?.updateTiming({ duration: still ? 0 : MENU_OPEN_MS });

  return menuMotion;
}

function originTowards(menu: HTMLElement, trigger: HTMLElement): void {
  const box = menu.getBoundingClientRect();
  const button = trigger.getBoundingClientRect();
  const x = Math.min(box.width, Math.max(0, button.left + button.width / 2 - box.left));
  const y = Math.min(box.height, Math.max(0, button.top + button.height / 2 - box.top));

  menu.style.transformOrigin = `${Math.round(x)}px ${Math.round(y)}px`;
}

export function openA11y(): void {
  const menu = menuElement();
  const trigger = triggerElement();

  if (!menu || !trigger) {
    return;
  }

  document.dispatchEvent(new CustomEvent("menus:close"));
  menuOpen = true;
  menu.hidden = false;
  menu.style.pointerEvents = "";
  trigger.setAttribute("aria-expanded", "true");
  positionPopover(trigger, menu);

  const motion = menuAnimation(menu);

  if (motion.playState !== "running") {
    motion.currentTime = 0;
    originTowards(menu, trigger);
  }

  motion.updatePlaybackRate(1);
  motion.play();
}

export function closeA11y(): void {
  const menu = menuElement();

  if (!menu || !menuOpen) {
    return;
  }

  menuOpen = false;
  menu.style.pointerEvents = "none";
  menu.querySelectorAll("[data-font-lang].is-picking").forEach((group) => group.classList.remove("is-picking"));
  menu.querySelectorAll(".font-trigger").forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
  triggerElement()?.setAttribute("aria-expanded", "false");

  const motion = menuAnimation(menu);

  motion.updatePlaybackRate(-MENU_CLOSE_RATE);
  motion.play();
  void motion.finished.then(() => {
    if (!menuOpen) {
      menu.hidden = true;
    }
  });
}
