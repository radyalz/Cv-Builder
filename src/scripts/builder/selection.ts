import { DEFAULT_LANGUAGE, DEFAULT_THEME, DEFAULT_VARIANT, LANGUAGES, STORAGE_KEY, THEME_BY_SLUG, VARIANTS } from "../../lib/data";
import { normaliseHex } from "../../lib/colour";
import { t, themeName } from "../../lib/prefs";
import { app, type Selection } from "./state";

export const isDefaultSelection = (): boolean => {
  const { mode, theme, variant, language } = app.selection;

  return mode === "theme" && theme === DEFAULT_THEME && variant === DEFAULT_VARIANT && language === DEFAULT_LANGUAGE;
};

export const selectedSlug = (): string => (app.selection.mode === "custom" ? "custom" : app.selection.theme);

export function selectedHex(): string {
  return app.selection.mode === "custom" ? app.selection.color : THEME_BY_SLUG.get(app.selection.theme)?.hex ?? "#7030A0";
}

export function colourLabel(): string {
  if (app.selection.mode === "custom") {
    return app.selection.color;
  }

  const theme = THEME_BY_SLUG.get(app.selection.theme);

  return themeName(theme ? theme.slug : DEFAULT_THEME);
}

export const selectionLabel = (): string =>
  `${colourLabel()} · ${t(app.selection.variant)} · ${t(`lang_${app.selection.language}`)}`;

export const variantKey = (theme: string, variant: string, language: string): string => `${theme}|${variant}|${language}`;

export const selectedKey = (): string => variantKey(selectedSlug(), app.selection.variant, app.selection.language);

function applyStored(stored: Partial<Selection>): void {
  const selection = app.selection;

  if (stored.variant && VARIANTS.has(stored.variant)) selection.variant = stored.variant;
  if (stored.language && LANGUAGES.has(stored.language)) selection.language = stored.language;

  if (stored.mode === "custom") {
    const hex = normaliseHex(stored.color);

    if (hex) Object.assign(selection, { mode: "custom", color: hex });
  } else if (stored.theme && THEME_BY_SLUG.has(stored.theme)) {
    Object.assign(selection, { mode: "theme", theme: stored.theme, color: normaliseHex(stored.color) || "#7030A0" });
  }
}

export function loadSelection(): void {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

    if (stored && typeof stored === "object") applyStored(stored);
  } catch {
    return;
  }
}

export function saveSelection(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(app.selection));
  } catch {
    return;
  }
}

export function choose(patch: Partial<Selection>): void {
  app.selection = { ...app.selection, ...patch };
  saveSelection();
}
