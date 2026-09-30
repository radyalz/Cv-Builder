import { EN_FONTS, FA_FONTS, TEXT_SIZES, UI_KEY } from "../data";
import { systemTheme, uiPrefs, type UiPrefs } from "./state";

function readStored(): Partial<UiPrefs> {
  try {
    const stored = JSON.parse(localStorage.getItem(UI_KEY) || "null");

    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

export function loadUiPrefs(): void {
  const stored = readStored();

  uiPrefs.theme = systemTheme();

  if (stored.lang === "en" || stored.lang === "fa") uiPrefs.lang = stored.lang;
  if (stored.theme === "dark" || stored.theme === "light") uiPrefs.theme = stored.theme;
  if (TEXT_SIZES.includes(stored.fs as number)) uiPrefs.fs = stored.fs as number;
  if (stored.enFont && Object.hasOwn(EN_FONTS, stored.enFont)) uiPrefs.enFont = stored.enFont;
  if (stored.faFont && Object.hasOwn(FA_FONTS, stored.faFont)) uiPrefs.faFont = stored.faFont;
}

export function savePrefs(): void {
  try {
    localStorage.setItem(UI_KEY, JSON.stringify(uiPrefs));
  } catch {
    return;
  }
}

export function forgetPrefs(): void {
  try {
    localStorage.removeItem(UI_KEY);
  } catch {
    return;
  }
}
