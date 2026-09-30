import { el } from "./dom";
import { app } from "./state";

export type BarMenu = "info" | "fit" | "zoom" | null;

function fillDetails(): void {
  const links = document.getElementById("detailsLinks")!;

  document.getElementById("detailsMeta")!.textContent = el.expandedMeta.textContent;
  links.hidden = app.linkCount === 0;
  links.textContent = app.linkCount ? el.card.querySelector(".links-hint-text")!.textContent : "";
}

export function setBarMenu(which: BarMenu): void {
  if (which === "info") {
    fillDetails();
  }

  el.expandedTop.classList.toggle("is-open", which === "info");
  el.infoToggle.setAttribute("aria-expanded", String(which === "info"));
  el.fitPicker.classList.toggle("is-open", which === "fit");
  el.fitSelect.setAttribute("aria-expanded", String(which === "fit"));
  el.zoomPicker.classList.toggle("is-open", which === "zoom");
  el.zoomSelect.setAttribute("aria-expanded", String(which === "zoom"));
}

export const barMenuOpen = (): boolean =>
  [el.expandedTop, el.fitPicker, el.zoomPicker].some((part) => part.classList.contains("is-open"));

export function openBarMenuButton(): HTMLElement {
  if (el.expandedTop.classList.contains("is-open")) return el.infoToggle;

  return el.fitPicker.classList.contains("is-open") ? el.fitSelect : el.zoomSelect;
}

export function refreshDetails(): void {
  if (el.expandedTop.classList.contains("is-open")) {
    fillDetails();
  }
}

const isOpen = (part: HTMLElement): boolean => part.classList.contains("is-open");

export function wireBarMenus(): void {
  el.fitSelect.addEventListener("click", () => setBarMenu(isOpen(el.fitPicker) ? null : "fit"));
  el.zoomSelect.addEventListener("click", () => setBarMenu(isOpen(el.zoomPicker) ? null : "zoom"));
  el.infoToggle.addEventListener("click", () => setBarMenu(isOpen(el.expandedTop) ? null : "info"));

  document.addEventListener("click", (event) => {
    if (barMenuOpen() && !(event.target as Element).closest?.(".expanded-top, .fit-select, .zoom-select")) {
      setBarMenu(null);
    }
  });
}
