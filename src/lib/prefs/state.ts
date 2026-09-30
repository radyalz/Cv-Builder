import { FA_COLOURS, STRINGS, THEME_BY_SLUG } from "../data";

export type Lang = "en" | "fa";
export type Theme = "dark" | "light";

export interface UiPrefs {
  lang: Lang;
  theme: Theme;
  fs: number;
  enFont: string;
  faFont: string;
}

type Strings = Record<string, string>;

export const systemTheme = (): Theme => (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

export const DEFAULT_PREFS: Omit<UiPrefs, "theme"> = { lang: "en", fs: 1, enFont: "inter", faFont: "yekan" };

export const uiPrefs: UiPrefs = { lang: "en", theme: "dark", fs: 1, enFont: "inter", faFont: "yekan" };

export function t(key: string, vars: Record<string, string | number> = {}): string {
  const strings = STRINGS as Record<Lang, Strings>;
  let text = (strings[uiPrefs.lang] || strings.en)[key] ?? strings.en[key] ?? key;

  for (const [name, value] of Object.entries(vars)) {
    text = text.replace(`{${name}}`, String(value));
  }

  return text;
}

export function themeName(slug: string): string {
  const persian = (FA_COLOURS as Record<string, string>)[slug];

  if (uiPrefs.lang === "fa" && persian) {
    return persian;
  }

  return THEME_BY_SLUG.get(slug)?.label ?? "Purple";
}
