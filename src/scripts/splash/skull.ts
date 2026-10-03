import { PAD, TILE_H, TILE_W, drawPose, onArt, type PartImages } from "../../lib/skulls";

const CYCLE_MS = 3200;
const START_AT = 12;

export interface SkullDrawer {
  draw(ctx: CanvasRenderingContext2D, cx: number, cy: number, height: number, now: number): void;
  stop(): void;
}

export function skullDrawer(ratio: number): SkullDrawer {
  const pose = document.createElement("canvas");
  const poseContext = pose.getContext("2d")!;
  let images: PartImages | null = null;

  pose.width = Math.round((TILE_W + PAD * 2) * ratio);
  pose.height = Math.round((TILE_H + PAD * 2) * ratio);

  const stop = onArt((art) => (images = art));

  return {
    draw(ctx, cx, cy, height, now) {
      if (!images) return;

      const percent = (START_AT + (now / CYCLE_MS) * 100) % 100;
      const scale = height / (TILE_H + PAD * 2);

      drawPose(poseContext, images, percent, ratio);
      ctx.drawImage(pose, cx - ((TILE_W + PAD * 2) * scale) / 2, cy - height / 2, (TILE_W + PAD * 2) * scale, height);
    },
    stop,
  };
}
