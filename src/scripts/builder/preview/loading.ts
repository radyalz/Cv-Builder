import { t } from "../../../lib/prefs";
import { previewCache } from "../copy-cache";
import { el } from "../dom";
import { loadVariants } from "../listing";
import { planPrefetch } from "../prefetch";
import { refreshPreview } from "./refresh";

const TOO_LONG_MS = 10000;

let loadTimer = 0;

export type PreviewFailure = "copy" | "listing";

export function setPreviewLoading(loading: boolean, { patient = false } = {}): void {
  window.clearTimeout(loadTimer);
  el.previewSkeleton.hidden = !loading;
  el.previewDoc.classList.toggle("is-loading", loading);

  if (loading && !patient) {
    el.previewError.hidden = true;
    loadTimer = window.setTimeout(() => showPreviewError("copy"), TOO_LONG_MS);
  }
}

export function showPreviewError(kind: PreviewFailure): void {
  window.clearTimeout(loadTimer);
  el.previewSkeleton.hidden = true;
  el.previewDoc.classList.remove("is-loading");
  el.previewState.hidden = true;
  el.previewExpand.hidden = true;
  el.peekHint.hidden = true;
  el.previewError.dataset.kind = kind;
  el.previewError.querySelector(".preview-error-text")!.textContent = t(kind === "listing" ? "listingFailed" : "previewFailed");
  el.previewError.hidden = false;
}

export async function retryPreview(): Promise<void> {
  el.previewError.hidden = true;
  setPreviewLoading(true);

  if (el.previewError.dataset.kind === "listing") {
    if (await loadVariants()) {
      refreshPreview();
      planPrefetch();
    } else {
      showPreviewError("listing");
    }

    return;
  }

  previewCache.delete(el.previewDoc.dataset.url!);
  delete el.previewDoc.dataset.url;
  refreshPreview();
}
