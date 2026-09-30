import type { PDFDocumentProxy } from "pdfjs-dist";
import type { DocumentInitParameters, PDFWorkerParameters } from "pdfjs-dist/types/src/display/api";

type Library = typeof import("pdfjs-dist");
type Worker = InstanceType<Library["PDFWorker"]>;
type WorkerOptions = ConstructorParameters<Library["PDFWorker"]>[0];

const WORKER_OPTIONS: PDFWorkerParameters = { name: "cv-preview" };

let library: Promise<Library> | null = null;
let sharedWorker: Worker | undefined;

export function loadLibrary(): Promise<Library> {
  library ??= Promise.all([import("pdfjs-dist"), import("pdfjs-dist/build/pdf.worker.min.mjs?url")]).then(
    ([lib, worker]) => {
      lib.GlobalWorkerOptions.workerSrc = worker.default;
      sharedWorker = new lib.PDFWorker(WORKER_OPTIONS as unknown as WorkerOptions);

      return lib;
    }
  );

  return library;
}

export async function openDocument(source: Blob | string): Promise<PDFDocumentProxy> {
  const lib = await loadLibrary();
  const params: DocumentInitParameters =
    source instanceof Blob ? { data: new Uint8Array(await source.arrayBuffer()) } : { url: source };

  return lib.getDocument({ ...params, worker: sharedWorker }).promise;
}

export function release(doc: PDFDocumentProxy | null): void {
  doc?.loadingTask?.destroy();
}
