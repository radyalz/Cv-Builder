import type { PDFDocumentProxy } from "pdfjs-dist";
import { clampZoom, targetScale, type Fit } from "./fit";
import { release } from "./library";
import { isWebLink } from "./links";
import { openInto } from "./open";
import { drawPage, type PageEntry } from "./page";

export type { Fit } from "./fit";

export class PdfView {
  doc: PDFDocumentProxy | null = null;
  pages: PageEntry[] = [];
  fit: Fit = "width";
  zoom = 1;
  scale = 1;
  token = 0;
  held = false;
  private lastWidth = 0;
  private lastHeight = 0;
  private hintTimer = 0;
  private resizeTimer = 0;

  constructor(readonly host: HTMLElement, private readonly options = { gap: 8, padding: 16 }) {
    new ResizeObserver(() => {
      window.clearTimeout(this.resizeTimer);
      this.resizeTimer = window.setTimeout(() => this.renderIfResized(), 90);
    }).observe(host);
  }

  private renderIfResized(): void {
    const { clientWidth, clientHeight } = this.host;
    const same = clientWidth === this.lastWidth && clientHeight === this.lastHeight;

    if (!this.held && this.doc && !same) {
      void this.render();
    }
  }

  open(source: Blob | string): Promise<boolean> {
    return openInto(this, source);
  }

  pad(): number {
    return this.fit === "width" ? 0 : this.options.padding;
  }

  async render(): Promise<void> {
    if (!this.pages.length || !this.host.clientWidth) {
      return;
    }

    this.host.dataset.fit = this.fit;
    this.lastWidth = this.host.clientWidth;
    this.lastHeight = this.host.clientHeight;
    this.scale = targetScale(this.host, this.pages[0], this.fit, this.zoom, this.pad());
    this.host.style.setProperty("--pdf-gap", `${this.options.gap}px`);
    this.host.style.setProperty("--pdf-pad", `${this.pad()}px`);

    await Promise.all(this.pages.map((entry) => drawPage(entry, this.scale)));
    this.announce();
  }

  announce(): void {
    const detail = { scale: this.scale, links: this.linkCount() };

    this.host.dispatchEvent(new CustomEvent("pdf:rendered", { detail }));
  }

  linkCount(): number {
    return this.pages.reduce((total, entry) => total + entry.annotations.filter(isWebLink).length, 0);
  }

  flashLinks(): void {
    this.host.classList.remove("is-hinting");
    void this.host.offsetWidth;
    this.host.classList.add("is-hinting");
    window.clearTimeout(this.hintTimer);
    this.hintTimer = window.setTimeout(() => this.host.classList.remove("is-hinting"), 2200);
  }

  setFit(mode: Fit): void {
    this.fit = mode;
    void this.render();
  }

  zoomBy(factor: number): void {
    this.zoom = clampZoom(this.scale * factor);
    this.fit = "zoom";
    void this.render();
  }

  hold(held: boolean): void {
    this.held = held;

    if (!held) {
      void this.render();
    }
  }

  clear(): void {
    this.token++;
    release(this.doc);
    this.doc = null;
    this.pages = [];
    this.host.replaceChildren();
  }
}
