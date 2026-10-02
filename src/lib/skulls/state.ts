import type { PartName } from "./art";

export const TILE_W = 150;
export const TILE_H = 300;
export const SCALE = TILE_W / 100;
export const CYCLE_MS = 6500;
export const FLOW_MS = 70000;
export const BITE_PX = 6;
export const PAD = 30;
export const PIVOT = { x: 50 * SCALE, y: 80 * SCALE };

export type PartImages = Record<PartName, HTMLCanvasElement>;

export const state = {
  field: null as HTMLElement | null,
  canvas: null as HTMLCanvasElement | null,
  context: null as CanvasRenderingContext2D | null,
  pose: document.createElement("canvas"),
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

export const poseContext = (): CanvasRenderingContext2D => state.pose.getContext("2d")!;
