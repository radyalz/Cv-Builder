import { CELL, type Grid } from "./grid";
import { CA, SA, edgeAt, wave } from "./wave";

export type Side = "behind" | "ahead";

const STEPS = 72;

export function frontClip(g: Grid, p: number, time: number, side: Side, dx = 0, dy = 0): string {
  const { band, amp, reach } = wave(g, p);
  const lo = -g.cols * SA - 6;
  const hi = g.rows * CA + 6;
  const far = side === "behind" ? -1e4 : 1e4;
  const shift = side === "ahead" ? -band * 0.22 : 0;
  const pt = (u: number, s: number): string =>
    `${((u * CA - s * SA) * CELL - dx).toFixed(1)}px ${((u * SA + s * CA) * CELL - dy).toFixed(1)}px`;
  const pts: string[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const s = lo + ((hi - lo) * i) / STEPS;
    pts.push(pt(reach - edgeAt(g, s, time, amp) + shift, s));
  }
  pts.push(pt(far, hi), pt(far, lo));
  return `polygon(${pts.join(",")})`;
}
