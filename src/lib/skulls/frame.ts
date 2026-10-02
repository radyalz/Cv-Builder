import { pacing, watchGap } from "./pacing";
import { draw } from "./render";
import { PAD, TILE_H, TILE_W, poseSurface, state, type PartImages, type Surface } from "./state";

export interface Size {
  width: number;
  height: number;
  ratio: number;
  zoom: number;
}

type Report = (struggling: boolean) => void;

const nextFrame = (callback: FrameRequestCallback): number =>
  globalThis.requestAnimationFrame ? globalThis.requestAnimationFrame(callback) : setTimeout(() => callback(performance.now()), 16);

let report: Report = () => {};

function loop(now: number): void {
  state.frame = 0;

  if (state.pauses.size || !state.images) return;

  state.frame = nextFrame(loop);

  if (state.minGap && now - state.lastDraw < state.minGap) return;

  const gap = now - state.lastDraw;

  state.lastDraw = now;
  draw(now);
  watchGap(gap, report);
}

function run(): void {
  if (state.still) {
    if (state.images) draw(performance.now());
    return;
  }

  if (!state.frame && !state.pauses.size && state.images) state.frame = nextFrame(loop);
}

export function attach(canvas: Surface, onPace: Report): void {
  state.canvas = canvas;
  state.context = canvas.getContext("2d") as typeof state.context;
  state.started = performance.now();
  report = onPace;
}

export function setSize({ width, height, ratio, zoom }: Size): void {
  Object.assign(state, { width, height, ratio, zoom });
  state.canvas!.width = Math.round(width * ratio);
  state.canvas!.height = Math.round(height * ratio);
  poseSurface().width = Math.round((TILE_W + PAD * 2) * ratio);
  poseSurface().height = Math.round((TILE_H + PAD * 2) * ratio);

  if (state.images) draw(performance.now());
}

export function setImages(images: PartImages): void {
  state.images = images;

  if (state.still || state.pauses.size) draw(performance.now());
  run();
}

export function setPaused(reason: string, paused: boolean): void {
  if (paused) {
    state.pauses.add(reason);
    return;
  }

  state.pauses.delete(reason);
  state.lastDraw = performance.now();
  run();
}

export function setStill(still: boolean, fixedAt: number | null): void {
  Object.assign(state, { still, fixedAt });
  run();
}

export function setPace(level: number, minGap: number, done: boolean): void {
  Object.assign(pacing, { level, done });
  state.minGap = minGap;
}
