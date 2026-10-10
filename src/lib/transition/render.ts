import { CELL, CHARS, type Grid } from "./grid";
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

function shades(pal: Palette, alpha: number): string[][] {
  const out: string[][] = [];
  for (let m = 0; m < 4; m++) {
    const base = mixRgb(pal.field[0], pal.field[1], m / 3);
    const row: string[] = [];
    for (let b = 0; b < 5; b++) row.push(tone(base, pal.bg, alpha * (0.42 + b * 0.145)));
    out.push(row);
  }
  return out;
}

export function draw(ctx: CanvasRenderingContext2D, g: Grid, sc: Scene): void {
  const { cols, rows, dpr, noise } = g;
  const { mode, time, pal } = sc;
  const alpha = sc.alpha ?? 1;
  const fill = sc.fill ?? true;
  const { band, amp, reach } = wave(g, sc.p);
  const field = shades(pal, alpha);
  const edge = pal.edge.map((c) => tone(c, pal.bg, alpha));
  const bg = tone(pal.bg, pal.bg, 1);
  const L = CHARS.length;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cols * CELL, rows * CELL);
  ctx.font = `${CELL}px "JetBrains Mono", ui-monospace, monospace`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const n = noise[r * cols + c];
      const f = c * CA + r * SA + edgeAt(g, -c * SA + r * CA, time, amp) + (n - 0.5) * band * 0.35;
      const a = mode === "out" ? reach - f : f - reach;
      if (a < 0 || (!fill && a > band)) continue;
      const fl = n3(c * 0.07 + time * 0.35, r * 0.07 - time * 0.25, time * 0.5);
      const ch = CHARS[((fl * L * 3 + n * 7 + time * 6 * (0.5 + n)) | 0) % L];
      const x = c * CELL, y = r * CELL;
      ctx.fillStyle = bg;
      ctx.fillRect(x, y, CELL, CELL);
      if (a > band) {
        const gm = n3(c * 0.03 - time * 0.12, r * 0.03 + time * 0.08, time * 0.2 + 9);
        ctx.fillStyle = field[Math.max(0, Math.min(3, Math.floor((gm - 0.4) * 11)))][Math.min(4, (fl * 5) | 0)];
      } else {
        const t = a / band;
        ctx.fillStyle = t < 0.12 ? edge[2] : t < 0.4 ? edge[0] : edge[1];
      }
      ctx.fillText(ch, x + CELL / 2, y + CELL / 2);
    }
  }
}
