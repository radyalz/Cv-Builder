import { compose, fileName, outputSize, save } from "./files";

const FPS = 30;

export interface Recording {
  cancel(): void;
}

interface Callbacks {
  onProgress(fraction: number, secondsLeft: number): void;
  onEnd(saved: boolean): void;
}

const bitrate = (width: number, height: number): number =>
  Math.round(Math.min(24e6, Math.max(4e6, (width * height * 8e6) / (1920 * 1080))));

export function record(type: string, seconds: number, { onProgress, onEnd }: Callbacks): Recording {
  const size = outputSize();
  const canvas = Object.assign(document.createElement("canvas"), size);
  const context = canvas.getContext("2d")!;
  const stream = canvas.captureStream(FPS);
  const recorder = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: bitrate(size.width, size.height) });
  const chunks: Blob[] = [];
  const startedAt = performance.now();
  let frame = 0;
  let cancelled = false;

  const tick = (now: number) => {
    const elapsed = (now - startedAt) / 1000;

    if (recorder.state === "inactive") {
      return;
    }

    compose(context, size);
    onProgress(Math.min(1, elapsed / seconds), Math.max(0, Math.ceil(seconds - elapsed)));

    if (elapsed >= seconds) {
      recorder.stop();
    } else {
      frame = requestAnimationFrame(tick);
    }
  };

  recorder.addEventListener("dataavailable", (event) => event.data.size && chunks.push(event.data));
  recorder.addEventListener("stop", () => {
    stream.getTracks().forEach((track) => track.stop());
    cancelAnimationFrame(frame);

    const saved = !cancelled && chunks.length > 0;

    if (saved) {
      const extension = type.startsWith("video/mp4") ? "mp4" : "webm";

      save(new Blob(chunks, { type: type.split(";")[0] }), fileName(size, extension, seconds));
    }

    onEnd(saved);
  });

  compose(context, size);
  recorder.start(1000);
  frame = requestAnimationFrame(tick);

  return {
    cancel() {
      cancelled = true;
      recorder.stop();
    },
  };
}
