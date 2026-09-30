import type { PageViewport } from "pdfjs-dist";

export interface Annotation {
  subtype: string;
  url?: string;
  rect: number[];
}

export const isWebLink = (item: Annotation): item is Annotation & { url: string } =>
  item.subtype === "Link" && Boolean(item.url);

export function describeLink(url: string): string {
  if (url.startsWith("mailto:")) {
    return `Email ${url.slice(7)}`;
  }

  if (url.startsWith("tel:")) {
    return `Call ${url.slice(4)}`;
  }

  try {
    const { hostname, pathname } = new URL(url);

    return `Open ${hostname.replace(/^www\./, "")}${pathname === "/" ? "" : pathname}`;
  } catch {
    return `Open ${url}`;
  }
}

function linkElement(item: Annotation & { url: string }, viewport: PageViewport): HTMLAnchorElement {
  const [a, b, c, d, e, f] = viewport.transform;
  const point = (x: number, y: number) => [a * x + c * y + e, b * x + d * y + f];
  const [x1, y1] = point(item.rect[0], item.rect[1]);
  const [x2, y2] = point(item.rect[2], item.rect[3]);
  const link = document.createElement("a");

  link.href = item.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.className = "pdf-link";
  link.title = item.url;
  link.setAttribute("aria-label", describeLink(item.url));
  Object.assign(link.style, {
    left: `${Math.min(x1, x2)}px`,
    top: `${Math.min(y1, y2)}px`,
    width: `${Math.abs(x2 - x1)}px`,
    height: `${Math.abs(y2 - y1)}px`,
  });

  return link;
}

export function placeLinks(layer: HTMLElement, annotations: Annotation[], viewport: PageViewport): void {
  layer.replaceChildren(...annotations.filter(isWebLink).map((item) => linkElement(item, viewport)));
}
