import type { PDFDocumentProxy } from "pdfjs-dist";
import { report } from "../progress";
import { readWithProgress } from "../stream";
import type { DocumentInitParameters, PDFWorkerParameters } from "pdfjs-dist/types/src/display/api";

type Library = typeof import("pdfjs-dist");
type Worker = InstanceType<Library["PDFWorker"]>;
type WorkerOptions = ConstructorParameters<Library["PDFWorker"]>[0];

const WORKER_OPTIONS: PDFWorkerParameters = { name: "cv-preview" };
const WORKER_BYTES = 1_265_000;

let library: Promise<Library> | null = null;
let sharedWorker: Worker | undefined;

async function workerSource(url: string): Promise<string> {
  if (import.meta.env.DEV) return url;

  try {
    const response = await fetch(url);

    if (!response.ok) return url;

    const blob = await readWithProgress(response, WORKER_BYTES, (loaded, total) =>
      report("viewer", loaded / total, { loaded, total })
    );

    return URL.createObjectURL(new Blob([blob], { type: "text/javascript" }));
  } catch {
    return url;
  }
}

export function loadLibrary(): Promise<Library> {
  library ??= Promise.all([import("pdfjs-dist"), import("pdfjs-dist/build/pdf.worker.min.mjs?url")]).then(
    async ([lib, worker]) => {
      lib.GlobalWorkerOptions.workerSrc = await workerSource(worker.default);
      sharedWorker = new lib.PDFWorker(WORKER_OPTIONS as unknown as WorkerOptions);
      report("viewer", 1);

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
