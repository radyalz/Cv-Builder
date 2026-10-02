import { sample, wiggle } from "./easing";
import { BITE_PX, CYCLE_MS, FLOW_MS, PAD, PIVOT, TILE_H, TILE_W, poseContext, state } from "./state";
import { LAYERS, TRACKS } from "./timeline";

export function rasterise(url: string, ratio: number): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");

      canvas.width = Math.round(TILE_W * ratio);
      canvas.height = Math.round(TILE_H * ratio);
      canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas);
    };

    image.onerror = reject;
    image.src = url;
  });
}

function composePose(percent: number): void {
  const ctx = poseContext();
  const { images, ratio } = state;
  const { scale, turn } = wiggle(percent);
  const shakeX = sample(TRACKS.shakeX!, percent);
  const shakeY = sample(TRACKS.shakeY!, percent);
  const bite = sample(TRACKS.bite!, percent) * BITE_PX;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, state.pose.width, state.pose.height);

  for (const [name, group] of LAYERS) {
    const track = TRACKS[name];
    const alpha = track ? sample(track, percent) : 1;

    if (alpha <= 0.005) {
      continue;
    }

    ctx.setTransform(ratio, 0, 0, ratio, PAD * ratio, PAD * ratio);

    if (group !== "still") {
      ctx.translate(PIVOT.x + shakeX, PIVOT.y + shakeY);
      ctx.rotate(turn);
      ctx.scale(scale, scale);
      ctx.translate(-PIVOT.x, -PIVOT.y + (group === "bite" ? bite : 0));
    }

    ctx.globalAlpha = alpha;
    ctx.drawImage(images![name], 0, 0, TILE_W, TILE_H);
  }

  ctx.globalAlpha = 1;
}

function stampSet(x: number, y: number): void {
  const { context: ctx, pose, ratio } = state;
  const startX = (((x % TILE_W) + TILE_W) % TILE_W) - TILE_W - PAD;
  const startY = (((y % TILE_H) + TILE_H) % TILE_H) - TILE_H - PAD;

  for (let top = startY; top < state.height / state.zoom + PAD; top += TILE_H) {
    for (let left = startX; left < state.width / state.zoom + PAD; left += TILE_W) {
      ctx!.drawImage(pose, left, top, pose.width / ratio, pose.height / ratio);
    }
  }
}

export function draw(now: number): void {
  const elapsed = state.still ? 0 : now - state.started;
  const percent = state.fixedAt ?? ((elapsed % CYCLE_MS) / CYCLE_MS) * 100;
  const flow = state.still ? 0 : (elapsed % FLOW_MS) / FLOW_MS;

  composePose(percent);
  const scale = state.ratio * state.zoom;

  state.context!.setTransform(scale, 0, 0, scale, 0, 0);
  state.context!.clearRect(0, 0, state.width / state.zoom, state.height / state.zoom);
  stampSet(TILE_W * 5 * flow, TILE_H * flow);
  stampSet(TILE_W / 2 - TILE_W * flow, TILE_H / 2 + TILE_H * flow);
}
