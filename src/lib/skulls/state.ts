import type { PartName } from "./art";

export const TILE_W = 150;
export const TILE_H = 300;
export const SCALE = TILE_W / 100;
export const CYCLE_MS = 6500;
export const FLOW_MS = 70000;
export const BITE_PX = 6;
export const PAD = 30;
export const PIVOT = { x: 50 * SCALE, y: 80 * SCALE };

export type Surface = HTMLCanvasElement | OffscreenCanvas;
export type Context = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
export type PartImages = Record<PartName, CanvasImageSource>;

export const state = {
  field: null as HTMLElement | null,
  canvas: null as Surface | null,
  context: null as Context | null,
  pose: null as Surface | null,
  images: null as PartImages | null,
  painted: "",
  frame: 0,
  started: 0,
  pauses: new Set<string>(),
  still: false,
  fixedAt: null as number | null,
  last: null as [accent: string, theme: string] | null,
  width: 0,
  height: 0,
  ratio: 1,
  zoom: 1,
  minGap: 0,
  lastDraw: 0,
};

export function poseSurface(): Surface {
  state.pose ??= typeof OffscreenCanvas === "undefined" ? document.createElement("canvas") : new OffscreenCanvas(1, 1);

  return state.pose;
}

export const poseContext = (): Context => poseSurface().getContext("2d") as Context;
