import type { PageEntry } from "./page";

export type Fit = "width" | "page" | "zoom";

export const MIN_ZOOM = 0.3;
export const MAX_ZOOM = 4;

export function targetScale(host: HTMLElement, first: PageEntry | undefined, fit: Fit, zoom: number, pad: number): number {
  if (!first) {
    return 1;
  }

  host.style.setProperty("--pdf-pad", `${pad}px`);

  const style = getComputedStyle(host);
  const width = host.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const height = host.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
  const byWidth = width / first.size.width;

  if (fit === "width") {
    return byWidth;
  }

  if (fit === "page") {
    return Math.min(byWidth, height / first.size.height);
  }

  return zoom;
}

export const clampZoom = (value: number): number => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
