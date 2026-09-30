import { positionPopover } from "../popover";
import { setAdmiring } from "./admire";
import { applyPrefs } from "./apply";
import { closeA11y, isA11yOpen, openA11y } from "./menu";
import { forgetPrefs } from "./storage";
import { DEFAULT_PREFS, systemTheme, uiPrefs, type Lang, type Theme } from "./state";

export function resetPrefs(): void {
  Object.assign(uiPrefs, DEFAULT_PREFS, { theme: systemTheme() });
  forgetPrefs();
  applyPrefs({ save: false });
}

function choose(option: HTMLElement): void {
  const { uiLang, theme, fs, enFont, faFont } = option.dataset;

  if (enFont) uiPrefs.enFont = enFont;
  else if (faFont) uiPrefs.faFont = faFont;
  else if (uiLang) uiPrefs.lang = uiLang as Lang;
  else if (theme) uiPrefs.theme = theme as Theme;
  else if (fs) uiPrefs.fs = Number(fs);

  applyPrefs();
}

export function onClick(event: MouseEvent): void {
  const target = event.target as Element | null;
  const menu = document.getElementById("a11yMenu");

  if (target?.closest("#admireToggle, #admireFromMenu")) {
    setAdmiring(!document.body.classList.contains("is-admiring"));
  } else if (target?.closest("#a11yTrigger")) {
    isA11yOpen() ? closeA11y() : openA11y();
  } else if (menu && isA11yOpen() && target) {
    if (!menu.contains(target)) closeA11y();
    else if (target.closest("#resetPrefs")) resetPrefs();
    else {
      const option = target.closest<HTMLElement>("[role=radio]");

      if (option) choose(option);
    }
  }
}

export function onKeydown(event: KeyboardEvent): void {
  if (event.key !== "Escape") {
    return;
  }

  if (document.body.classList.contains("is-admiring")) {
    setAdmiring(false);
  } else if (document.getElementById("a11yMenu") && isA11yOpen()) {
    closeA11y();
    document.getElementById("a11yTrigger")?.focus();
  }
}

export function onResize(): void {
  const menu = document.getElementById("a11yMenu");
  const trigger = document.getElementById("a11yTrigger");

  if (menu && trigger && !menu.hidden) {
    positionPopover(trigger, menu);
  }
}
