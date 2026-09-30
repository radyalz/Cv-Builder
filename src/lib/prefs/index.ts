import { applyPrefs } from "./apply";
import { onClick, onKeydown, onResize } from "./events";
import { loadUiPrefs } from "./storage";

export { applyPrefs } from "./apply";
export { setAdmiring } from "./admire";
export { closeA11y, openA11y } from "./menu";
export { resetPrefs } from "./events";
export { t, themeName, uiPrefs, type Lang, type Theme, type UiPrefs } from "./state";

let started = false;

export function initPrefs(): void {
  if (started) {
    return;
  }

  started = true;
  loadUiPrefs();
  applyPrefs({ save: false });

  document.addEventListener("astro:after-swap", () => applyPrefs({ save: false }));
  document.addEventListener("click", onClick);
  document.addEventListener("keydown", onKeydown);
  window.addEventListener("resize", onResize);
}
