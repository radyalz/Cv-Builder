import { SKILLS } from "./words";
import { mulberry32 } from "./rng";

export const CELL = 10;
export const CHARS = SKILLS.join("").replace(/\s/g, "") + "░▒▓/\\|-_=+*#%@<>{}[]()~^:;.,01";

export const small = (): boolean => window.innerWidth < 700 || (navigator.hardwareConcurrency || 8) <= 4;
export const frameGap = (): number => (small() ? 1000 / 24 : 1000 / 30);

export interface Grid {
  cols: number;
  rows: number;
  dpr: number;
  cell: number;
  seed: number;
  noise: Float32Array;
  wave: number[];
}

export function makeGrid(canvas: HTMLCanvasElement, seed: number, size?: number): Grid {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const cell = size ?? (small() ? 12 : CELL);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);
  const rand = mulberry32(seed);
  const rnd = (a: number, b: number): number => a + rand() * (b - a);
  const wave = [rnd(0.04, 0.08), rnd(0, 6.3), rnd(0.9, 1.6), rnd(0.11, 0.19), rnd(0, 6.3), rnd(1.4, 2.4), rnd(0.015, 0.03), rnd(0, 6.3)];
  const noise = new Float32Array(cols * rows);
  for (let i = 0; i < noise.length; i++) noise[i] = rand();
  return { cols, rows, dpr, cell, seed, noise, wave };
}
