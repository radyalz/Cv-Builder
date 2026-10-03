import { t } from "../../../lib/prefs";
import { refreshDetails } from "../bar-menus";
import { cachedPreview } from "../copy-cache";
import { generatedCopy, showGenerated } from "../copies";
import { el } from "../dom";
import { collapsePreview } from "../expand/collapse";
import { showLinksHint } from "../links-hint";
import { formatPublished, previewUrlFor } from "../listing";
import { planPrefetch } from "../prefetch";
import { selectedKey, selectionLabel } from "../selection";
import { app, type Published } from "../state";
import { setPreviewLoading, showPreviewError } from "./loading";

const SKELETON_MIN_MS = 250;

let previewTimer = 0;

function showMissing(): void {
  el.previewDoc.hidden = true;
  app.pdfView.clear();
  app.linkCount = 0;
  showLinksHint();
  delete el.previewDoc.dataset.url;
  setPreviewLoading(true, { patient: true });
  el.previewState.hidden = false;
  el.previewState.textContent = t("notGenerated");
  el.previewMeta.textContent = "";
  el.previewFoot.classList.add("is-quiet");
  el.peekHint.hidden = true;
  void collapsePreview();
}

function loadCopy(url: string, size = 0): void {
  const shownFrom = performance.now();
  const current = () => el.previewDoc.dataset.url === url;

  el.previewDoc.dataset.url = url;
  setPreviewLoading(true);

  cachedPreview(url, { size })
    .catch(() => url)
    .then((source) => current() && app.pdfView.open(source))
    .then(async (shown) => {
      const left = SKELETON_MIN_MS - (performance.now() - shownFrom);

      if (left > 0) await new Promise((resolve) => window.setTimeout(resolve, left));

      if (shown && current()) {
        el.previewError.hidden = true;
        el.previewExpand.hidden = false;
        el.peekHint.hidden = false;
        setPreviewLoading(false);
        planPrefetch();
      }
    })
    .catch((error) => {
      console.error("Preview failed:", error);

      if (current()) showPreviewError("copy");
    });
}

function showPublished(published: Published): void {
  const url = previewUrlFor(published);
  const date = formatPublished(published.updatedAt);

  el.previewFoot.classList.remove("is-quiet");

  if (el.previewDoc.dataset.url !== url) loadCopy(url, published.size);

  el.previewDoc.hidden = false;
  el.previewState.hidden = true;
  el.previewMeta.textContent = date ? t("published", { date }) : "";
  el.expandedMeta.textContent = el.previewMeta.textContent;
  refreshDetails();
  el.previewExpand.hidden = false;
}

export function refreshPreview(): void {
  el.previewLabel.textContent = selectionLabel();
  el.expandedLabel.textContent = selectionLabel();

  if (!app.variantsLoaded && !app.variants.has(selectedKey())) {
    return;
  }

  const published = app.variants.get(selectedKey());
  const generated = generatedCopy();

  el.previewMeta.classList.remove("is-loading");
  el.peekHint.hidden = !published;
  [el.downloadLatest, el.expandedDownload].forEach((save) => (save.disabled = !published && !generated));

  if (published) showPublished(published);
  else if (generated) showGenerated(generated);
  else showMissing();
}

export function schedulePreview(): void {
  const { variants, variantsLoaded } = app;
  const published = variantsLoaded || variants.has(selectedKey()) ? variants.get(selectedKey()) : null;

  window.clearTimeout(previewTimer);

  if (published && el.previewDoc.dataset.url !== previewUrlFor(published)) {
    setPreviewLoading(true);
  }

  previewTimer = window.setTimeout(refreshPreview, 60);
}
