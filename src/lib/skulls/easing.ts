import type { Ease, Track } from "./timeline";

const WIGGLE_FROM = 70.5;
const WIGGLE_TO = 80;

function bezier(x1: number, y1: number, x2: number, y2: number): (x: number) => number {
  const at = (t: number, a: number, b: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;

  return (x) => {
    let low = 0;
    let high = 1;

    for (let step = 0; step < 20; step++) {
      const mid = (low + high) / 2;

      if (at(mid, x1, x2) < x) {
        low = mid;
      } else {
        high = mid;
      }
    }

    return at((low + high) / 2, y1, y2);
  };
}

const EASE: Record<Ease, (x: number) => number> = {
  linear: (x) => x,
  "ease-in-out": bezier(0.42, 0, 0.58, 1),
  "ease-out": bezier(0, 0, 0.58, 1),
};

export function sample({ ease, keys }: Track, percent: number): number {
  for (let index = 1; index < keys.length; index++) {
    const [to, value] = keys[index];

    if (percent <= to) {
      const [from, start] = keys[index - 1];
      const local = to === from ? 1 : (percent - from) / (to - from);

      return start + (value - start) * EASE[ease](local);
    }
  }

  return keys[keys.length - 1][1];
}

export function wiggle(percent: number): { scale: number; turn: number } {
  if (percent < WIGGLE_FROM || percent > WIGGLE_TO) {
    return { scale: 1, turn: 0 };
  }

  const p = (percent - WIGGLE_FROM) / (WIGGLE_TO - WIGGLE_FROM);
  const swell = Math.sin(Math.PI * Math.min(1, p * 1.6)) * (1 - p * 0.35);
  const rock = Math.sin(p * Math.PI * 6) * (1 - p);

  return { scale: 1 + 0.06 * Math.max(0, swell), turn: (3.2 * rock * Math.PI) / 180 };
}
