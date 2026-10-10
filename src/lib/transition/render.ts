import { CELL, CHARS, type Grid } from "./grid";
import { n3 } from "./noise";

export interface Palette {
  lav: string[];
  dark: string[];
  edge: string;
  bg: string;
}

export const PURPLE: Palette = {
  lav: ["#E6DBFF", "#9D6CFF", "#8458F5", "#6B3DFF"],
  dark: ["#1c1138", "#2a1a55", "#35206b", "#44298a", "#5a37b0"],
  edge: "#E9C46A",
  bg: "#07050a",
};
const ANG = (35 * Math.PI) / 180;
const CA = Math.cos(ANG), SA = Math.sin(ANG);

export type Mode = "out" | "in";

const ease = (p: number): number => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2);

export function draw(ctx: CanvasRenderingContext2D, g: Grid, mode: Mode, p: number, time: number, pal: Palette = PURPLE): void {
  const { lav: LAV, dark: DARK, edge: GOLD, bg: BG } = pal;
  const { cols, rows, dpr, noise, wave: w } = g;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cols * CELL, rows * CELL);
  const span = cols * CA + rows * SA;
  const band = span * 0.1;
  const amp = span * 0.06;
  const fade = mode === "out" ? Math.min(1, p / 0.28) : Math.min(1, (1 - p) / 0.25);
  const sp = mode === "out" ? ease(Math.max(0, (p - 0.28) / 0.72)) : ease(Math.min(1, p / 0.75));
  const reach = sp * (span + band * 3 + amp * 5) - band * 1.5 - amp * 2.5;
  ctx.font = `${CELL}px "JetBrains Mono", ui-monospace, monospace`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  const L = CHARS.length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const n = noise[r * cols + c];
      const fl = n3(c * 0.07 + time * 0.35, r * 0.07 - time * 0.25, time * 0.5);
      const ch = CHARS[((fl * L * 3 + n * 7 + time * 6 * (0.5 + n)) | 0) % L];
      const s = -c * SA + r * CA;
      const edge = Math.sin(s * w[0] + time * w[2] + w[1]) * amp + Math.cos(s * w[3] - time * w[5] + w[4]) * amp * 0.5 + Math.sin(s * w[6] + w[7]) * amp * 0.8;
      const f = c * CA + r * SA + edge + (n - 0.5) * band * 0.35;
      const a = mode === "out" ? reach - f : f - reach;
      const x = c * CELL, y = r * CELL;
      if (a < 0) {
        const al = fade * (0.12 + fl * 0.5);
        if (al < 0.05) continue;
        ctx.globalAlpha = al;
        ctx.fillStyle = LAV[1 + ((fl * 3) | 0) % 3];
        ctx.fillText(ch, x + CELL / 2, y + CELL / 2);
        ctx.globalAlpha = 1;
        continue;
      }
      ctx.fillStyle = BG;
      ctx.fillRect(x, y, CELL, CELL);
      if (a > band) ctx.fillStyle = DARK[Math.min(4, (fl * 5) | 0)];
      else {
        const t = a / band;
        ctx.fillStyle = t < 0.12 ? GOLD : t < 0.3 ? LAV[0] : LAV[1 + Math.min(2, ((t - 0.3) * 4) | 0)];
      }
      ctx.fillText(ch, x + CELL / 2, y + CELL / 2);
    }
  }
}
