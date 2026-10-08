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

const MIN_TARGET = 24;

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
  const width = Math.max(Math.abs(x2 - x1), MIN_TARGET);
  const height = Math.max(Math.abs(y2 - y1), MIN_TARGET);
  Object.assign(link.style, {
    left: `${(x1 + x2) / 2 - width / 2}px`,
    top: `${(y1 + y2) / 2 - height / 2}px`,
    width: `${width}px`,
    height: `${height}px`,
  });

  return link;
}

export function placeLinks(layer: HTMLElement, annotations: Annotation[], viewport: PageViewport): void {
  layer.replaceChildren(...annotations.filter(isWebLink).map((item) => linkElement(item, viewport)));
}
