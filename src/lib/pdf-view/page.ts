import type { PDFDocumentProxy, PDFPageProxy, PageViewport, RenderTask } from "pdfjs-dist";
import { placeLinks, type Annotation } from "./links";

export interface PageEntry {
  page: PDFPageProxy;
  shell: HTMLDivElement;
  canvas: HTMLCanvasElement;
  links: HTMLDivElement;
  size: PageViewport;
  annotations: Annotation[];
  task: RenderTask | null;
}

export async function preparePage(doc: PDFDocumentProxy, number: number): Promise<PageEntry> {
  const page = await doc.getPage(number);
  const shell = document.createElement("div");
  const canvas = document.createElement("canvas");
  const links = document.createElement("div");

  shell.className = "pdf-page";
  links.className = "pdf-links";
  shell.append(canvas, links);

  return {
    page,
    shell,
    canvas,
    links,
    size: page.getViewport({ scale: 1 }),
    annotations: (await page.getAnnotations()) as Annotation[],
    task: null,
  };
}

export async function drawPage(entry: PageEntry, scale: number): Promise<void> {
  const ratio = Math.min(window.devicePixelRatio || 1, 3);
  const viewport = entry.page.getViewport({ scale });
  const canvas = document.createElement("canvas");

  entry.shell.style.width = `${Math.floor(viewport.width)}px`;
  entry.shell.style.height = `${Math.floor(viewport.height)}px`;
  canvas.width = Math.floor(viewport.width * ratio);
  canvas.height = Math.floor(viewport.height * ratio);

  entry.task?.cancel();
  entry.task = entry.page.render({
    canvas,
    viewport,
    transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0],
  });

  try {
    await entry.task.promise;
  } catch {
    return;
  }

  entry.canvas.replaceWith(canvas);
  entry.canvas = canvas;
  placeLinks(entry.links, entry.annotations, viewport);
}
