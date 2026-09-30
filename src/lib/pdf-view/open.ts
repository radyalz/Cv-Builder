import type { PDFDocumentProxy } from "pdfjs-dist";
import { openDocument, release } from "./library";
import { drawPage, preparePage, type PageEntry } from "./page";
import type { PdfView } from "./index";

async function addRemainingPages(view: PdfView, doc: PDFDocumentProxy, current: () => boolean): Promise<void> {
  for (let number = 2; number <= doc.numPages; number++) {
    let entry: PageEntry;

    try {
      entry = await preparePage(doc, number);
    } catch {
      return;
    }

    if (!current()) {
      return;
    }

    view.pages.push(entry);
    view.host.append(entry.shell);

    if (view.host.clientWidth) {
      await drawPage(entry, view.scale);
      view.announce();
    }
  }
}

export async function openInto(view: PdfView, source: Blob | string): Promise<boolean> {
  const token = ++view.token;
  const current = () => token === view.token;
  const doc = await openDocument(source);
  let first: PageEntry;

  try {
    first = await preparePage(doc, 1);
  } catch (error) {
    release(doc);
    throw error;
  }

  if (!current()) {
    release(doc);
    return false;
  }

  for (const entry of view.pages) {
    entry.task?.cancel();
  }

  release(view.doc);
  view.doc = doc;
  view.pages = [first];
  view.host.replaceChildren(first.shell);
  view.host.scrollTop = 0;
  await view.render();

  void addRemainingPages(view, doc, current);

  return current();
}
