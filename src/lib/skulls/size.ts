import { PAD, TILE_H, TILE_W, state } from "./state";

export function resize(): void {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const { innerWidth: width, innerHeight: height } = window;
  const canvas = state.canvas!;

  state.width = width;
  state.height = height;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  if (ratio !== state.ratio) {
    state.ratio = ratio;
    state.painted = "";
  }

  state.pose.width = Math.round((TILE_W + PAD * 2) * state.ratio);
  state.pose.height = Math.round((TILE_H + PAD * 2) * state.ratio);
}
