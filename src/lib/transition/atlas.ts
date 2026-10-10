import { CHARS } from "./grid";

const UNIQ = [...new Set(CHARS)];
export const SLOT = Uint16Array.from(CHARS, (c) => UNIQ.indexOf(c));

export interface Atlas {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  size: number;
  colors: string[];
  bg: string;
  ready: Uint8Array;
}

const cache = new Map<string, Atlas>();

function make(colors: string[], bg: string, size: number, font: string): Atlas {
  const canvas = document.createElement("canvas");
  canvas.width = UNIQ.length * size;
  canvas.height = colors.length * size;
  const ctx = canvas.getContext("2d")!;
  ctx.font = font;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  return { canvas, ctx, size, colors, bg, ready: new Uint8Array(UNIQ.length * colors.length) };
}

export function atlas(colors: string[], bg: string, size: number, font: string): Atlas {
  const key = `${size}|${bg}|${colors.join()}`;
  let a = cache.get(key);
  if (a) return a;
  if (cache.size > 7) cache.delete(cache.keys().next().value!);
  a = make(colors, bg, size, font);
  cache.set(key, a);
  return a;
}

export function tile(a: Atlas, color: number, slot: number): void {
  const i = color * UNIQ.length + slot;
  if (a.ready[i]) return;
  a.ready[i] = 1;
  const { ctx, size } = a;
  const x = slot * size;
  const y = color * size;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, size, size);
  ctx.clip();
  ctx.fillStyle = a.bg;
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = a.colors[color];
  ctx.fillText(UNIQ[slot], x + size / 2, y + size / 2);
  ctx.restore();
}

export function prime(a: Atlas, from: number, to: number): void {
  for (let color = from; color < to; color++) for (let slot = 0; slot < UNIQ.length; slot++) tile(a, color, slot);
}
