export const LANDSCAPE = "(max-width: 1023px) and (orientation: landscape) and (max-height: 600px)";

export function placeFoot(): void {
  const foot = document.querySelector<HTMLElement>(".preview-foot");
  const main = document.querySelector(".card-main");
  const frame = document.querySelector(".card-preview .preview-frame");

  if (!foot || !main || !frame) {
    return;
  }

  if (window.matchMedia(LANDSCAPE).matches) {
    if (foot.parentElement !== main) main.append(foot);
  } else if (foot.previousElementSibling !== frame) {
    frame.after(foot);
  }
}
