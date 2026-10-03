import { initPrefs } from "../../lib/prefs";
import { setTipContent } from "../../lib/tooltip";
import { runBuild } from "./build/flow";
import { localiseSwatches } from "./colour-menu";
import { saveShownCopy } from "./copies";
import { el } from "./dom";
import { syncInterface } from "./interface";
import { showLinksHint } from "./links-hint";
import { loadCurrentVariant, loadVariants, restoreListing } from "./listing";
import { planPrefetch } from "./prefetch";
import { retryPreview } from "./preview/loading";
import { refreshPreview } from "./preview/refresh";
import { loadSelection, selectedHex } from "./selection";
import { app } from "./state";
import { tipContent } from "./tips";
import { wireControls } from "./wire/controls";
import { onEscape } from "./wire/keys";
import { wirePreview } from "./wire/preview";

let started = false;

function loadCopies(): void {
  const restored = restoreListing();

  if (restored) refreshPreview();

  void (restored ? Promise.resolve() : loadCurrentVariant())
    .then(() => {
      if (app.variants.size) refreshPreview();

      return loadVariants();
    })
    .then(() => {
      refreshPreview();

      if (!el.previewDoc.hidden && !el.previewDoc.classList.contains("is-loading")) planPrefetch();
    });
}

function wire(): void {
  document.addEventListener("prefs:change", () => {
    showLinksHint();
    localiseSwatches();
    syncInterface();
  });

  el.linksHints.forEach((hint) => hint.addEventListener("click", () => app.pdfView.flashLinks()));
  el.previewRetry.addEventListener("click", (event) => {
    event.stopPropagation();
    void retryPreview();
  });
  [el.downloadLatest, el.expandedDownload].forEach((save) => save.addEventListener("click", () => void saveShownCopy()));
  wireControls();
  document.addEventListener("keydown", onEscape);
  wirePreview();
  el.generate.addEventListener("click", () => void runBuild());
}

export function initBuilder(): void {
  if (started) {
    return;
  }

  started = true;
  initPrefs();
  setTipContent(tipContent);
  loadSelection();
  el.customColor.value = selectedHex().toLowerCase();
  el.customHex.value = selectedHex();
  localiseSwatches();
  syncInterface();
  loadCopies();
  wire();
}
