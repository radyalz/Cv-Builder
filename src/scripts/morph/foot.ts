import { ROWS_UNDER_ACTIONS } from "../../lib/layout";

export function placeFoot(): void {
  const head = document.querySelector<HTMLElement>(".preview-head");
  const foot = document.querySelector<HTMLElement>(".preview-foot");
  const main = document.querySelector(".card-main");
  const preview = document.querySelector(".card-preview");
  const frame = preview?.querySelector(".preview-frame");

  if (!head || !foot || !main || !preview || !frame) {
    return;
  }

  if (window.matchMedia(ROWS_UNDER_ACTIONS).matches) {
    if (foot.parentElement !== main) main.append(foot, head);
    return;
  }

  if (head.parentElement !== preview) preview.prepend(head);
  if (foot.previousElementSibling !== frame) frame.after(foot);
}
