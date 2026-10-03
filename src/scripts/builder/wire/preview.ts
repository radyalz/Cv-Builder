import { PdfView } from "../../../lib/pdf-view";
import { refreshDetails, setBarMenu, wireBarMenus } from "../bar-menus";
import { el } from "../dom";
import { collapsePreview } from "../expand/collapse";
import { expandPreview } from "../expand/expand";
import { expand } from "../expand/queue";
import { showLinksHint } from "../links-hint";
import { app } from "../state";

const PRINTED_SCALE = 96 / 72;

function onPdfTool(event: Event): void {
  const target = event.target as Element;
  const action = target.closest<HTMLElement>("[data-pdf]")?.dataset.pdf;

  if (action === "fit-width") app.pdfView.setFit("width");
  if (action === "fit-page") app.pdfView.setFit("page");
  if (action === "zoom-in") app.pdfView.zoomBy(1.2);
  if (action === "zoom-out") app.pdfView.zoomBy(1 / 1.2);

  if (action && el.fitPicker.contains(target)) {
    setBarMenu(null);
    el.fitSelect.focus();
  }
}

function onRendered({ detail }: CustomEvent<{ scale: number; links: number }>): void {
  app.linkCount = detail.links;
  showLinksHint();

  if (el.previewDoc.dataset.url !== app.flashedUrl && el.previewDoc.clientWidth) {
    app.flashedUrl = el.previewDoc.dataset.url ?? "";
    app.pdfView.flashLinks();
  }

  el.pdfZoom.textContent = `${Math.round((detail.scale / PRINTED_SCALE) * 100)}%`;

  for (const button of el.card.querySelectorAll<HTMLElement>("[data-pdf^=fit]")) {
    const current = String(button.dataset.pdf === `fit-${app.pdfView.fit}`);

    button.setAttribute(button.getAttribute("role") === "menuitemradio" ? "aria-checked" : "aria-pressed", current);
  }

  el.fitSelect.dataset.fit = app.pdfView.fit;
  refreshDetails();
}

export function wirePreview(): void {
  app.pdfView = new PdfView(el.previewDoc);
  el.card.querySelector(".pdf-tools")!.addEventListener("click", onPdfTool);
  wireBarMenus();
  el.previewDoc.addEventListener("pdf:rendered", onRendered as EventListener);
  el.previewExpand.addEventListener("click", () => void expandPreview());
  el.previewBox.addEventListener("click", (event) => {
    const inside = (event.target as Element).closest(".preview-error, .build-status, .preview-state");

    if (!inside && expand.state === "closed" && !el.previewDoc.classList.contains("is-loading")) void expandPreview();
  });
  el.previewCollapse.addEventListener("click", () => void collapsePreview());

  document.addEventListener("click", (event) => {
    if (expand.state === "open" && !el.card.contains(event.target as Node)) void collapsePreview();
  });
}
