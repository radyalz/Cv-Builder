import { makeGrid, type Grid } from "../../lib/transition/grid";
import { draw } from "../../lib/transition/render";
import { newSeed } from "../../lib/transition/rng";
import { decodeHandoff, TX_PARAM, type Handoff } from "../../lib/transition/handoff";

const HOLD_MS = 50;
const IN_MS = 1900;

export interface Cover {
  reveal(): Promise<void>;
}

function takeHandoff(): Handoff | null {
  const url = new URL(location.href);
  if (!url.searchParams.has(TX_PARAM)) return null;
  const handoff = decodeHandoff(url.searchParams.get(TX_PARAM));
  url.searchParams.delete(TX_PARAM);
  history.replaceState(history.state, "", url);
  return handoff;
}

export function startCover(canvas: HTMLCanvasElement, still: boolean): Cover {
  const handoff = takeHandoff();
  const ctx = canvas.getContext("2d");
  if (still || !ctx) return { reveal: async () => undefined };
  const seed = handoff?.seed ?? newSeed();
  const origin = performance.now() - (handoff?.time ?? 0) * 1000;
  const resize = () => (grid = makeGrid(canvas, seed));
  let grid: Grid = makeGrid(canvas, seed);
  let sweepAt = 0;
  let drawnAt = 0;
  let finish = () => undefined as void;

  const frame = (now: number) => {
    const p = sweepAt ? Math.min(1, (now - sweepAt) / IN_MS) : 0;
    if (now - drawnAt >= (sweepAt ? 16 : HOLD_MS) || p === 1) {
      drawnAt = now;
      draw(ctx, grid, "in", p, (now - origin) / 1000);
    }
    if (p < 1) return void requestAnimationFrame(frame);
    window.removeEventListener("resize", resize);
    finish();
  };

  window.addEventListener("resize", resize);
  draw(ctx, grid, "in", 0, (performance.now() - origin) / 1000);
  canvas.classList.add(handoff ? "is-shown" : "is-fading");
  requestAnimationFrame(frame);

  return {
    reveal: () =>
      new Promise<void>((resolve) => {
        finish = resolve;
        sweepAt = performance.now();
      }),
  };
}
