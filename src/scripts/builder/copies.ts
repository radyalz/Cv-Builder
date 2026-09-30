import { t } from "../../lib/prefs";
import { refreshDetails } from "./bar-menus";
import { previewCache } from "./copy-cache";
import { el } from "./dom";
import { previewUrlFor } from "./listing";
import { setPreviewLoading } from "./preview/loading";
import { selectedKey } from "./selection";
import { app } from "./state";

export interface Generated {
  blob: Blob;
  name: string;
}

export const generatedCopies = new Map<string, Generated>();

export function generatedKey(): string {
  const { mode, color, theme, variant, language } = app.selection;

  return `${mode === "custom" ? color : theme}|${variant}|${language}`;
}

export const generatedCopy = (): Generated | null | undefined =>
  app.selection.mode === "custom" ? generatedCopies.get(generatedKey()) : null;

export async function saveCopy(source: Blob | string, name: string): Promise<Blob> {
  let blob = source as Blob;

  if (typeof source === "string") {
    const response = await fetch(source);

    if (!response.ok) throw new Error("Download failed.");

    blob = await response.blob();
  }

  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = href;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 20000);

  return blob;
}

export async function saveShownCopy(): Promise<void> {
  const published = app.variants.get(selectedKey());
  const generated = generatedCopy();

  try {
    if (published) {
      const kept = previewCache.get(previewUrlFor(published));

      await saveCopy((kept && (await kept.catch(() => null))) || published.downloadUrl, published.name);
    } else if (generated) {
      await saveCopy(generated.blob, generated.name);
    }
  } catch (error) {
    console.error("Download failed:", error);
  }
}

export function showGenerated(generated: Generated): void {
  const key = `generated:${generatedKey()}`;

  el.previewState.hidden = true;
  el.previewFoot.classList.remove("is-quiet");
  el.previewDoc.hidden = false;
  el.previewMeta.textContent = t("justGenerated");
  el.expandedMeta.textContent = el.previewMeta.textContent;
  refreshDetails();
  el.previewExpand.hidden = false;
  el.peekHint.hidden = false;

  if (el.previewDoc.dataset.url !== key) {
    el.previewDoc.dataset.url = key;
    setPreviewLoading(true);
    void app.pdfView.open(generated.blob).then((shown) => shown && el.previewDoc.dataset.url === key && setPreviewLoading(false));
  }
}
