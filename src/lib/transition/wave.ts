import type { Grid } from "./grid";

const ANG = (35 * Math.PI) / 180;
export const CA = Math.cos(ANG);
export const SA = Math.sin(ANG);

export const ease = (p: number): number => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2);

export interface Wave {
  band: number;
  amp: number;
  reach: number;
}

export function wave(g: Grid, p: number): Wave {
  const span = g.cols * CA + g.rows * SA;
  const band = span * 0.1;
  const amp = span * 0.06;
  const sp = ease(Math.max(0, Math.min(1, p)));
  return { band, amp, reach: sp * (span + band * 3 + amp * 5) - band * 1.5 - amp * 2.5 };
}

export function edgeAt(g: Grid, s: number, time: number, amp: number): number {
  const w = g.wave;
  return (
    Math.sin(s * w[0] + time * w[2] + w[1]) * amp +
    Math.cos(s * w[3] - time * w[5] + w[4]) * amp * 0.5 +
    Math.sin(s * w[6] + w[7]) * amp * 0.8
  );
}
