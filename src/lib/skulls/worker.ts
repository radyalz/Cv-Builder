import { attach, setImages, setPace, setPaused, setSize, setStill } from "./frame";

type Message =
  | { type: "attach"; canvas: OffscreenCanvas }
  | { type: "size"; size: Parameters<typeof setSize>[0] }
  | { type: "images"; images: Parameters<typeof setImages>[0] }
  | { type: "pause"; reason: string; paused: boolean }
  | { type: "still"; still: boolean; fixedAt: number | null }
  | { type: "pace"; level: number; minGap: number; done: boolean };

self.onmessage = ({ data }: MessageEvent<Message>) => {
  if (data.type === "attach")
    attach(
      data.canvas,
      (struggling) => self.postMessage({ type: "pace", struggling }),
      () => self.postMessage({ type: "painted" })
    );
  else if (data.type === "size") setSize(data.size);
  else if (data.type === "images") setImages(data.images);
  else if (data.type === "pause") setPaused(data.reason, data.paused);
  else if (data.type === "still") setStill(data.still, data.fixedAt);
  else setPace(data.level, data.minGap, data.done);
};
