import { t } from "../../../lib/prefs";
import { previewCache } from "../copy-cache";
import { el } from "../dom";
import { loadVariants } from "../listing";
import { planPrefetch } from "../prefetch";
import { refreshPreview } from "./refresh";

const SLOW_NOTE_MS = 8000;
const PATIENCE_MS: Record<string, number> = { "slow-2g": 90000, "2g": 75000, "3g": 45000 };

let loadTimer = 0;
let slowTimer = 0;

function patience(): number {
  const type = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType ?? "";

  return PATIENCE_MS[type] ?? 25000;
}

function showSlowNote(): void {
  if (el.previewSkeleton.hidden || !el.previewError.hidden) return;

  el.previewState.textContent = t("previewSlow");
  el.previewState.dataset.slow = "";
  el.previewState.hidden = false;
}

export function clearSlowNote(): void {
  window.clearTimeout(slowTimer);

  if (el.previewState.hasAttribute("data-slow")) {
    delete el.previewState.dataset.slow;
    el.previewState.hidden = true;
  }
}

export type PreviewFailure = "copy" | "listing";

export function setPreviewLoading(loading: boolean, { patient = false } = {}): void {
  window.clearTimeout(loadTimer);
  clearSlowNote();
  el.previewSkeleton.hidden = !loading;
  el.previewDoc.classList.toggle("is-loading", loading);

  if (loading && !patient) {
    el.previewError.hidden = true;
    slowTimer = window.setTimeout(showSlowNote, SLOW_NOTE_MS);
    loadTimer = window.setTimeout(() => showPreviewError("copy"), patience());
  }
}

export function showPreviewError(kind: PreviewFailure): void {
  window.clearTimeout(loadTimer);
  clearSlowNote();
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
