import { API_URL, DEFAULT_LANGUAGE, DEFAULT_VARIANT } from "../../lib/data";
import { uiPrefs } from "../../lib/prefs";
import { pruneDeviceCache } from "./copy-cache";
import { el } from "./dom";
import { showPreviewError } from "./preview/loading";
import { variantKey } from "./selection";
import { app, type Published } from "./state";

const LISTING_KEY = "cv-builder-listing";

export function formatPublished(value: string | number): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(uiPrefs.lang === "fa" ? "fa-IR" : undefined, { day: "numeric", month: "short", year: "numeric" });
}

const keyed = (items: Published[] | undefined): [string, Published][] =>
  (items || []).map((item) => [variantKey(item.theme, item.variant || DEFAULT_VARIANT, item.language || DEFAULT_LANGUAGE), item]);

export function restoreListing(): boolean {
  try {
    const kept = JSON.parse(localStorage.getItem(LISTING_KEY) || "null");

    if (kept && Array.isArray(kept.variants)) {
      app.variants = new Map(keyed(kept.variants));
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

function keepListing(list: Published[]): void {
  try {
    localStorage.setItem(LISTING_KEY, JSON.stringify({ variants: list }));
  } catch {
    return;
  }
}

export async function loadCurrentVariant(): Promise<void> {
  const { mode, theme, variant, language } = app.selection;

  if (mode === "custom") {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/variants?${new URLSearchParams({ theme, variant, language })}`);

    if (response.ok) {
      for (const [key, item] of keyed((await response.json()).variants)) app.variants.set(key, item);
    }
  } catch {
    return;
  }
}

export async function loadVariants(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/variants`);

    if (!response.ok) throw new Error("Variants unavailable.");

    const data = await response.json();

    app.variants = new Map(keyed(data.variants));
    keepListing(data.variants || []);
    void pruneDeviceCache();
    app.variantsLoaded = true;
    el.previewPane.classList.remove("is-unavailable");

    return true;
  } catch {
    if (!app.variants.size) showPreviewError("listing");

    return false;
  }
}

export const previewUrlFor = (published: Published): string =>
  `${API_URL}/preview?theme=${encodeURIComponent(published.theme)}` +
  `&variant=${encodeURIComponent(published.variant)}` +
  `&language=${encodeURIComponent(published.language)}` +
  `&v=${Date.parse(published.updatedAt)}`;
