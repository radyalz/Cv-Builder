import { makeGrid, type Grid } from "../../lib/transition/grid";
import { draw, type Palette } from "../../lib/transition/render";
import { decodeHandoff, TX_PARAM, type Handoff } from "../../lib/transition/handoff";

const HOLD_MS = 50;

export interface Field {
  reveal(ms: number): Promise<void>;
}

export function takeHandoff(): Handoff | null {
  const url = new URL(location.href);
  if (!url.searchParams.has(TX_PARAM)) return null;
  const handoff = decodeHandoff(url.searchParams.get(TX_PARAM));
  url.searchParams.delete(TX_PARAM);
  history.replaceState(history.state, "", url);
  return handoff;
}

export function field(canvas: HTMLCanvasElement, seed: number, time: number, palette?: Palette): Field {
  const ctx = canvas.getContext("2d")!;
  const origin = performance.now() - time * 1000;
  const resize = () => (grid = makeGrid(canvas, seed));
  const paint = (p: number, now: number) => draw(ctx, grid, "in", p, (now - origin) / 1000, palette);
  let grid: Grid = makeGrid(canvas, seed);
  let sweepAt = 0;
  let span = 1;
  let drawnAt = 0;
  let finish = () => undefined as void;

  const frame = (now: number) => {
    const p = sweepAt ? Math.min(1, (now - sweepAt) / span) : 0;
    if (now - drawnAt >= (sweepAt ? 16 : HOLD_MS) || p === 1) {
      drawnAt = now;
      paint(p, now);
    }
    if (p < 1) return void requestAnimationFrame(frame);
    window.removeEventListener("resize", resize);
    finish();
  };

  window.addEventListener("resize", resize);
  paint(0, performance.now());
  requestAnimationFrame(frame);

  return {
    reveal: (ms) =>
      new Promise<void>((resolve) => {
        finish = resolve;
        span = ms;
        sweepAt = performance.now();
      }),
  };
}
