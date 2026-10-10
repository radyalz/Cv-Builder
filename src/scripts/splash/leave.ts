import { frontClip } from "../../lib/transition/front";
import { newSeed } from "../../lib/transition/rng";
import { accentPalette } from "./accent";
import { field } from "./ascii";

const SWEEP_MS = 1100;

const still = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

async function sweep(splash: HTMLElement): Promise<void> {
  const canvas = splash.querySelector<HTMLCanvasElement>(".splash-ascii")!;
  const front = field(canvas, newSeed(), 0, accentPalette(), false);

  canvas.classList.add("is-shown");
  document.documentElement.classList.add("is-ready");
  await front.reveal(SWEEP_MS, (p, time, grid) => (splash.style.clipPath = frontClip(grid, p, time, "ahead")));
}

export async function leave(splash: HTMLElement): Promise<void> {
  if (still()) document.documentElement.classList.add("is-ready");
  else await sweep(splash);

  splash.remove();
  document.dispatchEvent(new CustomEvent("app:ready"));
}
