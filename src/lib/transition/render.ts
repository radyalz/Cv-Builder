import { CHARS, type Grid } from "./grid";
import { SLOT, atlas, prime, tile } from "./atlas";
import { n3 } from "./noise";
import { mixRgb, tone, type Palette } from "./palette";
import { CA, SA, edgeAt, wave } from "./wave";

export type Mode = "out" | "in";

export interface Scene {
  mode: Mode;
  p: number;
  time: number;
  pal: Palette;
  alpha?: number;
  fill?: boolean;
}

function colors(pal: Palette, alpha: number): string[] {
  const out: string[] = [];
  for (let m = 0; m < 4; m++) {
    const base = mixRgb(pal.field[0], pal.field[1], m / 3);
    for (let b = 0; b < 5; b++) out.push(tone(base, pal.bg, alpha * (0.42 + b * 0.145)));
  }
  return out.concat(pal.edge.map((c) => tone(c, pal.bg, alpha)));
}

export function draw(ctx: CanvasRenderingContext2D, g: Grid, sc: Scene): void {
  const { cols, rows, dpr, cell, noise } = g;
  const { mode, time, pal } = sc;
  const alpha = Math.round((sc.alpha ?? 1) * 8) / 8;
  const fill = sc.fill ?? true;
  const { band, amp, reach } = wave(g, sc.p);
  const k = cell * dpr;
  const T = Math.ceil(k);
  const at = atlas(colors(pal, alpha), tone(pal.bg, pal.bg, 1), T, `${k}px "JetBrains Mono", ui-monospace, monospace`);
  const L = CHARS.length;
  prime(at, fill ? 0 : 20, at.colors.length);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const s0 = -cols * SA - 2, E = new Float32Array(Math.ceil(cols * SA + rows * CA) + 6);
  for (let i = 0; i < E.length; i++) E[i] = edgeAt(g, s0 + i, time, amp);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const n = noise[r * cols + c];
      const f = c * CA + r * SA + E[(-c * SA + r * CA - s0) | 0] + (n - 0.5) * band * 0.35;
      const a = mode === "out" ? reach - f : f - reach;
      if (a < 0 || (!fill && a > band)) continue;
      const fl = n3(c * 0.07 + time * 0.35, r * 0.07 - time * 0.25, time * 0.5);
      const s = SLOT[((fl * L * 3 + n * 7 + time * 6 * (0.5 + n)) | 0) % L];
      let ci = 20;
      if (a > band) {
        const gm = n3(c * 0.03 - time * 0.12, r * 0.03 + time * 0.08, time * 0.2 + 9);
        ci = Math.max(0, Math.min(3, Math.floor((gm - 0.4) * 11))) * 5 + Math.min(4, (fl * 5) | 0);
      } else {
        const t = a / band;
        ci = t < 0.12 ? 22 : t < 0.4 ? 20 : 21;
      }
      tile(at, ci, s);
      ctx.drawImage(at.canvas, s * T, ci * T, T, T, Math.round(c * k), Math.round(r * k), T, T);
    }
  }
}
