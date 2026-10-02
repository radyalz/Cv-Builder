import * as local from "./frame";
import type { PartImages } from "./state";

export interface Engine {
  size(size: local.Size): void;
  images(images: PartImages): void;
  pause(reason: string, paused: boolean): void;
  still(still: boolean, fixedAt: number | null): void;
  pace(level: number, minGap: number, done: boolean): void;
}

export const current = { engine: null as Engine | null };

type Report = (struggling: boolean) => void;

const showField = () => document.querySelector(".skull-field")?.classList.add("is-painted");

function inWorker(canvas: HTMLCanvasElement, report: Report): Engine | null {
  if (!("transferControlToOffscreen" in canvas) || typeof Worker === "undefined") return null;

  try {
    const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
    const offscreen = canvas.transferControlToOffscreen();
    const send = (message: object, transfer: Transferable[] = []) => worker.postMessage(message, transfer);
    let order = 0;

    worker.onmessage = ({ data }) => (data.type === "pace" ? report(data.struggling) : showField());
    send({ type: "attach", canvas: offscreen }, [offscreen]);

    return {
      size: (size) => send({ type: "size", size }),
      images: async (images) => {
        const mine = ++order;
        const pairs = await Promise.all(Object.entries(images).map(async ([name, image]) => [name, await createImageBitmap(image as ImageBitmapSource)] as const));

        if (mine === order) send({ type: "images", images: Object.fromEntries(pairs) }, pairs.map(([, bitmap]) => bitmap));
      },
      pause: (reason, paused) => send({ type: "pause", reason, paused }),
      still: (still, fixedAt) => send({ type: "still", still, fixedAt }),
      pace: (level, minGap, done) => send({ type: "pace", level, minGap, done }),
    };
  } catch {
    return null;
  }
}

export function startEngine(canvas: HTMLCanvasElement, report: Report): Engine {
  const remote = inWorker(canvas, report);

  if (remote) return remote;

  local.attach(canvas, report, showField);

  return {
    size: local.setSize,
    images: local.setImages,
    pause: local.setPaused,
    still: local.setStill,
    pace: local.setPace,
  };
}
