import { PAD, TILE_H, TILE_W, state } from "./state";

const PHONE_ZOOM = 0.6;
const TABLET_ZOOM = 0.76;

function zoomFor(width: number, height: number): number {
  if (Math.min(width, height) < 600) return PHONE_ZOOM;
  if (Math.max(width, height) <= 1366 && window.matchMedia("(pointer: coarse)").matches) return TABLET_ZOOM;

  return 1;
}

export function resize(): void {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const { innerWidth: width, innerHeight: height } = window;
  const canvas = state.canvas!;

  state.width = width;
  state.zoom = zoomFor(width, height);
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
