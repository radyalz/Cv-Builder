import { PAD, TILE_H, TILE_W, drawPose, onArt, type PartImages } from "../../lib/skulls";

const CYCLE_MS = 3200;
const START_AT = 12;
const NEUTRAL_POSE = 10;

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SkullDrawer {
  draw(ctx: CanvasRenderingContext2D, cx: number, cy: number, height: number, now: number): void;
  stop(): void;
}

function measure(canvas: HTMLCanvasElement): Bounds {
  const { width, height } = canvas;
  const data = canvas.getContext("2d")!.getImageData(0, 0, width, height).data;
  let left = width, right = 0, top = height, bottom = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 24) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  }

  return right > left ? { x: left, y: top, width: right - left, height: bottom - top } : { x: 0, y: 0, width, height };
}

export function skullDrawer(ratio: number): SkullDrawer {
  const pose = document.createElement("canvas");
  const poseContext = pose.getContext("2d", { willReadFrequently: true })!;
  let images: PartImages | null = null;
  let bounds: Bounds | null = null;

  pose.width = Math.round((TILE_W + PAD * 2) * ratio);
  pose.height = Math.round((TILE_H + PAD * 2) * ratio);

  const stop = onArt((art) => {
    images = art;
    drawPose(poseContext, art, NEUTRAL_POSE, ratio);
    bounds = measure(pose);
  });

  return {
    draw(ctx, cx, cy, height, now) {
      if (!images || !bounds) return;

      const percent = (START_AT + (now / CYCLE_MS) * 100) % 100;
      const scale = height / bounds.height;
      const left = cx - (bounds.x + bounds.width / 2) * scale;
      const top = cy - (bounds.y + bounds.height / 2) * scale;

      drawPose(poseContext, images, percent, ratio);
      ctx.drawImage(pose, left, top, pose.width * scale, pose.height * scale);
    },
    stop,
  };
}
