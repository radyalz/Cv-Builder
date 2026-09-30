const MAX_SIDE = 3840;
const TYPES = ["video/mp4;codecs=avc1.640028", "video/mp4", "video/webm;codecs=vp9", "video/webm"];

export interface Size {
  width: number;
  height: number;
}

export function outputSize(): Size {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth * ratio;
  const height = window.innerHeight * ratio;
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  const even = (value: number) => Math.max(2, Math.round((value * scale) / 2) * 2);

  return { width: even(width), height: even(height) };
}

export function compose(context: CanvasRenderingContext2D, { width, height }: Size): void {
  const layers = [".tone-field canvas", ".skull-field canvas"].map((s) => document.querySelector<HTMLCanvasElement>(s));

  context.fillStyle = getComputedStyle(document.body).backgroundColor || "#050506";
  context.fillRect(0, 0, width, height);

  for (const canvas of layers) {
    if (canvas?.width) {
      context.drawImage(canvas, 0, 0, width, height);
    }
  }
}

export function save(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = name;
  link.addEventListener("click", (event) => event.stopPropagation());
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export function fileName({ width, height }: Size, extension: string, seconds?: number): string {
  return `radman-skulls-${width}x${height}${seconds ? `-${seconds}s` : ""}.${extension}`;
}

export function videoType(): string | null {
  if (!window.MediaRecorder || !("captureStream" in HTMLCanvasElement.prototype)) {
    return null;
  }

  return TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? null;
}

export function saveImage(): void {
  const size = outputSize();
  const canvas = document.createElement("canvas");

  canvas.width = size.width;
  canvas.height = size.height;
  compose(canvas.getContext("2d")!, size);
  canvas.toBlob((blob) => blob && save(blob, fileName(size, "png")), "image/png");
}
