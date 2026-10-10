import { frontClip } from "../../lib/transition/front";
import { frameGap, makeGrid } from "../../lib/transition/grid";
import { draw } from "../../lib/transition/render";
import { newSeed } from "../../lib/transition/rng";
import { accentPalette } from "./accent";

const SWEEP_MS = 2000;
const LAG = 0.32;

const still = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v: number): number => Math.max(0, Math.min(1, v));

function sweep(splash: HTMLElement): Promise<void> {
  const canvas = splash.querySelector<HTMLCanvasElement>(".splash-ascii")!;
  const ctx = canvas.getContext("2d")!;
  const grid = makeGrid(canvas, newSeed(), 16);
  const pal = accentPalette();
  const gap = frameGap() - 2;
  canvas.classList.add("is-shown");
  document.documentElement.classList.add("is-ready");
  return new Promise((done) => {
    let start = 0, last = 0;
    const frame = (now: number): void => {
      start ||= now;
      if (now - last < gap) return void requestAnimationFrame(frame);
      last = now;
      const k = (now - start) / SWEEP_MS, time = (now - start) / 1000;
      draw(ctx, grid, { mode: "out", p: clamp(k / (1 - LAG)), time, pal });
      splash.style.clipPath = frontClip(grid, clamp((k - LAG) / (1 - LAG)), time, "ahead");
      if (k < 1) requestAnimationFrame(frame);
      else done();
    };
    requestAnimationFrame(frame);
  });
}

export async function leave(splash: HTMLElement): Promise<void> {
  if (still()) document.documentElement.classList.add("is-ready");
  else await sweep(splash);

  splash.remove();
  document.dispatchEvent(new CustomEvent("app:ready"));
}
