import { DEFAULT_THEME, THEMES } from "../../lib/data";
import { cachedPreview, previewCache } from "./copy-cache";
import { previewUrlFor } from "./listing";
import { selectedSlug, variantKey } from "./selection";
import { app } from "./state";

const PREFETCH_PARALLEL = 3;

let queue: string[] = [];
let active = 0;
let plannedAccent = "";

interface Connection {
  saveData?: boolean;
  effectiveType?: string;
}

function saveData(): boolean {
  const connection = (navigator as Navigator & { connection?: Connection }).connection;

  return Boolean(connection && (connection.saveData || /(^|-)2g$/.test(connection.effectiveType || "")));
}

function likelyNext(): [string, string, string][] {
  const slug = selectedSlug();
  const { variant, language } = app.selection;
  const picks: [string, string, string][] = [];

  if (slug !== "custom") {
    for (const edition of ["digital", "print"]) {
      for (const lang of ["en", "fa"]) picks.push([slug, edition, lang]);
    }
  }

  const index = THEMES.findIndex((theme) => theme.slug === (slug === "custom" ? DEFAULT_THEME : slug));

  for (const step of [1, -1, 2, -2]) {
    picks.push([THEMES[(index + step + THEMES.length) % THEMES.length].slug, variant, language]);
  }

  return picks;
}

function publishedUrl(theme: string, variant: string, language: string): string | null {
  const published = app.variants.get(variantKey(theme, variant, language));

  return published ? previewUrlFor(published) : null;
}

function pump(): void {
  while (active < PREFETCH_PARALLEL && queue.length) {
    const url = queue.shift()!;

    if (previewCache.has(url)) continue;

    active += 1;
    cachedPreview(url, { background: true })
      .catch(() => undefined)
      .finally(() => {
        active -= 1;
        pump();
      });
  }
}

export function planPrefetch(): void {
  const accent = selectedSlug() === "custom" ? `custom:${app.selection.color}` : selectedSlug();

  if (saveData() || !app.variantsLoaded || accent === plannedAccent) {
    return;
  }

  plannedAccent = accent;
  queue = likelyNext()
    .map(([theme, variant, language]) => publishedUrl(theme, variant, language))
    .filter((url, index, list): url is string => Boolean(url) && !previewCache.has(url!) && list.indexOf(url) === index);

  if (window.requestIdleCallback) {
    window.requestIdleCallback(pump, { timeout: 1000 });
  } else {
    window.setTimeout(pump, 150);
  }
}

export function prefetchNow(theme: string, variant: string, language: string): void {
  const url = publishedUrl(theme, variant, language);

  if (url && !previewCache.has(url) && !saveData()) {
    cachedPreview(url, { background: true }).catch(() => undefined);
  }
}
