import { current } from "./engine";
import { state } from "./state";

const PHONE_ZOOM = 0.6;
const TABLET_ZOOM = 0.76;

function zoomFor(width: number, height: number): number {
  if (Math.min(width, height) < 600) return PHONE_ZOOM;
  if (Math.max(width, height) <= 1366 && window.matchMedia("(pointer: coarse)").matches) return TABLET_ZOOM;

  return 1;
}

export function resize(canvas: HTMLCanvasElement): void {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const { innerWidth: width, innerHeight: height } = window;

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  if (ratio !== state.ratio) {
    state.ratio = ratio;
    state.painted = "";
  }

  current.engine?.size({ width, height, ratio, zoom: zoomFor(width, height) });
}
