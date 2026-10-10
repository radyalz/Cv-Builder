import { makeGrid, type Grid } from "../../lib/transition/grid";
import { draw } from "../../lib/transition/render";
import { lerpPalette, type Palette } from "../../lib/transition/palette";
import { decodeHandoff, TX_PARAM, type Handoff } from "../../lib/transition/handoff";

export type OnFrame = (p: number, time: number, grid: Grid) => void;

export interface Field {
  morph(to: Palette, ms: number): Promise<void>;
  reveal(ms: number, onFrame?: OnFrame): Promise<void>;
}

export function takeHandoff(): Handoff | null {
  const url = new URL(location.href);
  if (!url.searchParams.has(TX_PARAM)) return null;
  const handoff = decodeHandoff(url.searchParams.get(TX_PARAM));
  url.searchParams.delete(TX_PARAM);
  history.replaceState(history.state, "", url);
  return handoff;
}

export function field(canvas: HTMLCanvasElement, seed: number, time: number, palette: Palette, fill = true): Field {
  const ctx = canvas.getContext("2d")!;
  const origin = performance.now() - time * 1000;
  const resize = () => (grid = makeGrid(canvas, seed));
  let grid: Grid = makeGrid(canvas, seed);
  let from = palette, to = palette, morphAt = 0, morphMs = 1, morphed = () => undefined as void;
  let sweepAt = 0, span = 1, onFrame: OnFrame | undefined, finish = () => undefined as void;

  const paint = (now: number): number => {
    const k = morphAt ? Math.min(1, (now - morphAt) / morphMs) : 0;
    const p = sweepAt ? Math.min(1, (now - sweepAt) / span) : 0;
    const t = (now - origin) / 1000;
    draw(ctx, grid, { mode: "in", p, time: t, pal: lerpPalette(from, to, k), fill });
    onFrame?.(p, t, grid);
    if (k === 1 && morphAt) (morphAt = 0, (from = to), morphed());
    return p;
  };

  const frame = (now: number) => {
    if (paint(now) < 1) return void requestAnimationFrame(frame);
    window.removeEventListener("resize", resize);
    finish();
  };

  window.addEventListener("resize", resize);
  paint(performance.now());
  requestAnimationFrame(frame);

  return {
    morph: (target, ms) =>
      new Promise<void>((resolve) => ((morphed = resolve), (to = target), (morphMs = ms), (morphAt = performance.now()))),
    reveal: (ms, hook) =>
      new Promise<void>((resolve) => ((finish = resolve), (onFrame = hook), (span = ms), (sweepAt = performance.now()))),
  };
}
