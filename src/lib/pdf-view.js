/* -------- A small PDF viewer --------
   Built on PDF.js rather than the browser's own viewer, which cannot be
   styled, shows its own toolbar, re-lays itself out on every resize and
   does not show inside a page at all on Android. Here each page is a
   canvas in a scrolling box, the document's web links are real <a>
   elements laid over it, and there are three ways to size it: fit the
   width, fit a whole page, or a zoom level. PDF.js itself (and its worker)
   is only downloaded the first time a document is opened. */

let library = null;
let sharedWorker = null;

function loadLibrary() {
  library ??= Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]).then(([lib, worker]) => {
    lib.GlobalWorkerOptions.workerSrc = worker.default;

    // One worker for every document. Without this PDF.js starts a new one
    // (and loads its 1 MB script again) for each copy it opens.
    sharedWorker = new lib.PDFWorker({ name: "cv-preview" });

    return lib;
  });

  return library;
}

// PDF.js documents are freed through the task that loaded them.
function release(doc) {
  doc?.loadingTask?.destroy();
}

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 4;

export class PdfView {
  // `padding` surrounds the pages when fitting a page or zoomed; fitting the
  // width runs them edge to edge.
  constructor(host, { gap = 8, padding = 16 } = {}) {
    this.host = host;
    this.gap = gap;
    this.padding = padding;
    this.doc = null;
    this.pages = [];
    this.fit = "width"; // "width" | "page" | "zoom"
    this.zoom = 1;
    this.scale = 1;
    this.token = 0;
    this.held = false;
    this.lastWidth = 0;
    this.lastHeight = 0;

    // Re-render when the box changes size, unless an animation holds it.
    let timer = null;

    this.observer = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const { clientWidth, clientHeight } = this.host;

        if (this.held || !this.doc || (clientWidth === this.lastWidth && clientHeight === this.lastHeight)) {
          return;
        }

        this.render();
      }, 90);
    });

    this.observer.observe(host);
  }

  // Loads a document and shows it page by page: resolves true as soon as
  // the first page is on screen, and the rest are prepared and added after
  // it, so a copy appears without waiting for all of it. Switching copies
  // quickly starts a new open() while an older one is still loading; each
  // only shows its pages while it is still the newest, so an older copy can
  // never land on top of (or mix its pages into) the one asked for last.
  // `source` is the PDF itself (a Blob, read straight into PDF.js) or, as a
  // fallback, its URL.
  async open(source) {
    const token = ++this.token;
    const current = () => token === this.token;
    const lib = await loadLibrary();
    const input =
      source instanceof Blob ? { data: new Uint8Array(await source.arrayBuffer()) } : { url: source };
    const doc = await lib.getDocument({ ...input, worker: sharedWorker, isEvalSupported: false }).promise;
    let first;

    try {
      first = await this.preparePage(doc, 1);
    } catch (error) {
      release(doc);
      throw error;
    }

    if (!current()) {
      release(doc);
      return false;
    }

    for (const entry of this.pages) {
      entry.task?.cancel();
    }

    release(this.doc);
    this.doc = doc;
    this.pages = [first];
    this.host.replaceChildren(first.shell);
    this.host.scrollTop = 0;
    await this.render();

    this.addRemainingPages(doc, current);

    return current();
  }

  async preparePage(doc, number) {
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
      annotations: await page.getAnnotations(),
      task: null,
    };
  }

  // Pages after the first, one at a time, each drawn as soon as it is ready.
  async addRemainingPages(doc, current) {
    for (let number = 2; number <= doc.numPages; number++) {
      let entry;

      try {
        entry = await this.preparePage(doc, number);
      } catch {
        return; // the document was released for a newer one
      }

      if (!current()) {
        return;
      }

      this.pages.push(entry);
      this.host.append(entry.shell);

      if (this.host.clientWidth) {
        await this.drawPage(entry, this.scale);
        this.announce();
      }
    }
  }

  // The scale the current fit mode asks for, from the first page's size.
  targetScale() {
    const first = this.pages[0];

    if (!first) {
      return 1;
    }

    const pad = this.pad();
    const width = this.host.clientWidth - pad * 2;
    const height = this.host.clientHeight - pad * 2;
    const byWidth = width / first.size.width;

    if (this.fit === "width") {
      return byWidth;
    }

    if (this.fit === "page") {
      return Math.min(byWidth, height / first.size.height);
    }

    return this.zoom;
  }

  async render() {
    // Nothing to fit into yet (a phone, before the preview is opened).
    if (!this.pages.length || !this.host.clientWidth) {
      return;
    }

    this.host.dataset.fit = this.fit;
    this.lastWidth = this.host.clientWidth;
    this.lastHeight = this.host.clientHeight;
    this.scale = this.targetScale();
    this.host.style.setProperty("--pdf-gap", `${this.gap}px`);
    this.host.style.setProperty("--pdf-pad", `${this.pad()}px`);

    await Promise.all(this.pages.map((entry) => this.drawPage(entry, this.scale)));
    this.announce();
  }

  // Draws one page at the given scale, off-screen, and swaps it in, so the
  // old drawing stays visible (just softer) until the sharper one is ready.
  async drawPage(entry, scale) {
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
      return; // cancelled by a newer render
    }

    entry.canvas.replaceWith(canvas);
    entry.canvas = canvas;
    this.placeLinks(entry, viewport);
  }

  announce() {
    this.host.dispatchEvent(
      new CustomEvent("pdf:rendered", { detail: { scale: this.scale, links: this.linkCount() } })
    );
  }

  pad() {
    return this.fit === "width" ? 0 : this.padding;
  }

  placeLinks(entry, viewport) {
    const [a, b, c, d, e, f] = viewport.transform;
    const point = (x, y) => [a * x + c * y + e, b * x + d * y + f];

    entry.links.replaceChildren(
      ...entry.annotations
        .filter((item) => item.subtype === "Link" && item.url)
        .map((item) => {
          const [x1, y1] = point(item.rect[0], item.rect[1]);
          const [x2, y2] = point(item.rect[2], item.rect[3]);
          const link = document.createElement("a");

          link.href = item.url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.className = "pdf-link";
          link.title = item.url;
          link.style.left = `${Math.min(x1, x2)}px`;
          link.style.top = `${Math.min(y1, y2)}px`;
          link.style.width = `${Math.abs(x2 - x1)}px`;
          link.style.height = `${Math.abs(y2 - y1)}px`;

          return link;
        })
    );
  }

  // How many web links the document has, across all pages.
  linkCount() {
    return this.pages.reduce(
      (total, entry) => total + entry.annotations.filter((item) => item.subtype === "Link" && item.url).length,
      0
    );
  }

  // Briefly lights up every link, so readers see what can be clicked.
  flashLinks() {
    this.host.classList.remove("is-hinting");
    void this.host.offsetWidth;
    this.host.classList.add("is-hinting");
    window.clearTimeout(this.hintTimer);
    this.hintTimer = window.setTimeout(() => this.host.classList.remove("is-hinting"), 2200);
  }

  setFit(mode) {
    this.fit = mode;
    this.render();
  }

  zoomBy(factor) {
    this.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, this.scale * factor));
    this.fit = "zoom";
    this.render();
  }

  // Held during the card's grow animation: the box is being scaled as a
  // picture, and re-rendering mid-way would only waste frames.
  hold(held) {
    this.held = held;

    if (!held) {
      this.render();
    }
  }

  clear() {
    this.token++;
    release(this.doc);
    this.doc = null;
    this.pages = [];
    this.host.replaceChildren();
  }
}
