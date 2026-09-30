import { STORAGE_KEY } from "../../lib/data";
import { relativeLuminance, textOn, uiAccent } from "../../lib/colour";
import { t, uiPrefs } from "../../lib/prefs";
import { paintSkulls } from "../../lib/skulls";
import { menuIsOpen, positionMenu, setHint } from "./colour-menu";
import { el } from "./dom";
import { schedulePreview } from "./preview/refresh";
import { colourLabel, isDefaultSelection, selectedHex } from "./selection";
import { app, DEFAULT_SELECTION } from "./state";

function applyAccent(): void {
  const accent = uiAccent(selectedHex(), uiPrefs.theme);
  const root = document.documentElement.style;

  root.setProperty("--accent", accent);
  root.setProperty("--accent-text", textOn(accent));
  root.setProperty("--accent-soft", `${accent}33`);
  paintSkulls(accent, uiPrefs.theme);
}

const check = (element: Element, on: boolean) => element.setAttribute("aria-checked", on ? "true" : "false");

function syncChoices(): void {
  const { mode, theme, variant, language } = app.selection;

  for (const swatch of el.themeGrid.children as HTMLCollectionOf<HTMLElement>) {
    const active = mode === "theme" && swatch.dataset.slug === theme;

    check(swatch, active);
    swatch.tabIndex = active ? 0 : -1;
  }

  for (const segment of el.variantToggle.children as HTMLCollectionOf<HTMLElement>) check(segment, segment.dataset.variant === variant);
  for (const segment of el.languageToggle.children as HTMLCollectionOf<HTMLElement>) check(segment, segment.dataset.language === language);
}

export function syncInterface(): void {
  applyAccent();
  el.colourTriggerLabel.textContent = colourLabel();
  el.resetButtons.forEach((reset) => (reset.disabled = isDefaultSelection() || el.generate.disabled));
  el.previewSkeleton.dir = app.selection.language === "fa" ? "rtl" : "ltr";
  syncChoices();

  if (app.selection.mode === "custom") {
    setHint(relativeLuminance(app.selection.color) > 0.7 ? t("hintLight") : t("hintCustom"));
  } else {
    setHint("");
  }

  if (menuIsOpen()) positionMenu();

  schedulePreview();
}

export function setControlsEnabled(enabled: boolean): void {
  const controls = [
    ...el.themeGrid.children,
    ...el.variantToggle.children,
    ...el.languageToggle.children,
    el.colourTrigger,
    el.customColor,
    el.customHex,
    el.customApply,
  ] as HTMLButtonElement[];

  controls.forEach((control) => (control.disabled = !enabled));
  el.resetButtons.forEach((reset) => (reset.disabled = !enabled || isDefaultSelection()));
}

function forgetStored(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
}

export function resetSelection(): void {
  app.selection = { ...DEFAULT_SELECTION };
  el.customHex.value = DEFAULT_SELECTION.color;
  el.customColor.value = DEFAULT_SELECTION.color.toLowerCase();
  el.customHex.removeAttribute("aria-invalid");
  forgetStored();
  syncInterface();
}
