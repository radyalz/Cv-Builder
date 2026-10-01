import { positionPopover } from "../popover";
import { savePrefs } from "./storage";
import { t, uiPrefs } from "./state";

function applyRoot(): void {
  const root = document.documentElement;

  root.lang = uiPrefs.lang;
  root.dir = uiPrefs.lang === "fa" ? "rtl" : "ltr";
  root.dataset.theme = uiPrefs.theme;
  root.dataset.enFont = uiPrefs.enFont;
  root.dataset.faFont = uiPrefs.faFont;
  root.style.setProperty("--fs", String(uiPrefs.fs));
}

function applyTexts(): void {
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n!)));
  document.querySelectorAll<HTMLElement>("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria!)));
  document.querySelectorAll<HTMLElement>("[data-i18n-title]").forEach((el) => (el.title = t(el.dataset.i18nTitle!)));
}

function isCurrent(option: HTMLElement): boolean {
  const { uiLang, theme, fs, enFont, faFont } = option.dataset;

  if (uiLang !== undefined) return uiLang === uiPrefs.lang;
  if (theme !== undefined) return theme === uiPrefs.theme;
  if (fs !== undefined) return Number(fs) === uiPrefs.fs;
  if (enFont !== undefined) return enFont === uiPrefs.enFont;
  return faFont === uiPrefs.faFont;
}

function followMenu(menu: HTMLElement): void {
  const trigger = document.getElementById("a11yTrigger")!;
  const until = performance.now() + 400;
  const step = () => {
    positionPopover(trigger, menu);

    if (!menu.hidden && performance.now() < until) {
      requestAnimationFrame(step);
    }
  };

  step();
}

function syncMenu(menu: HTMLElement): void {
  menu.querySelectorAll<HTMLElement>("[data-font-lang]").forEach((group) => {
    group.hidden = group.dataset.fontLang !== uiPrefs.lang;
  });

  menu.querySelectorAll<HTMLElement>("[role=radio]").forEach((option) => {
    option.setAttribute("aria-checked", String(isCurrent(option)));
  });

  menu.querySelectorAll<HTMLElement>("[data-font-lang]").forEach((group) => {
    const chosen = group.querySelector<HTMLElement>('.font-option[aria-checked="true"]');
    const label = group.querySelector<HTMLElement>(".font-trigger-label");

    if (chosen && label) {
      label.textContent = chosen.textContent!.trim();
      label.style.fontFamily = getComputedStyle(chosen).fontFamily;
    }
  });

  if (!menu.hidden) {
    followMenu(menu);
  }
}

export function applyPrefs({ save = true } = {}): void {
  const menu = document.getElementById("a11yMenu");

  applyRoot();
  applyTexts();

  if (menu) {
    syncMenu(menu);
  }

  if (save) {
    savePrefs();
  }

  document.dispatchEvent(new CustomEvent("prefs:change"));
}
