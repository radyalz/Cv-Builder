import { DEFAULT_THEME, FACTS, TIPS, type FactKey, type Tip } from "../../../lib/data";
import { t, uiPrefs } from "../../../lib/prefs";
import type { Fact } from "../../../lib/tooltip";
import { formatPublished } from "../listing";
import { colourLabel, selectedHex, selectedSlug, variantKey } from "../selection";
import { app, type Published } from "../state";

export interface TipParts {
  title?: string;
  body?: string;
  facts?: Fact[];
  hint?: { label: string; key: string } | null;
}

export type TipHandler = (element: HTMLElement) => TipParts;

export const fact = (name: FactKey): string => FACTS[uiPrefs.lang][name] ?? FACTS.en[name];

export const base = (name: string): Tip => TIPS[uiPrefs.lang]?.[name] || TIPS.en[name] || [name, ""];

export const localNumber = (n: number): string => (uiPrefs.lang === "fa" ? n.toLocaleString("fa-IR") : String(n));

export const colourRow = (): Fact => [fact("colour"), colourLabel(), { dot: selectedHex() }];
export const editionRow = (): Fact => [fact("edition"), t(app.selection.variant)];
export const languageRow = (): Fact => [fact("language"), t(`lang_${app.selection.language}`)];

export const statusOf = (item: Published | undefined): Fact => [
  fact("status"),
  item ? t("published", { date: formatPublished(item.updatedAt) }) : fact("notYet"),
];

export const escHint = () => ({ label: fact("shortcut"), key: "Esc" });

export const assetNameFor = (theme: string, variant: string, language: string): string =>
  "RadmanAlizadeh-Cv" +
  (theme === DEFAULT_THEME ? "" : `-${theme}`) +
  (variant === "print" ? "-print" : "") +
  (language === "fa" ? "-fa" : "") +
  ".pdf";

export function formatSize(bytes?: number): string {
  if (!bytes) {
    return "";
  }

  const kb = Math.round(bytes / 1024);

  return uiPrefs.lang === "fa" ? `${kb.toLocaleString("fa-IR")} کیلوبایت` : `${kb} KB`;
}

export const publishedFor = (variant: string, language: string): Published | undefined =>
  app.variants.get(variantKey(selectedSlug(), variant, language));
