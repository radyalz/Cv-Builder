import { newSeed } from "../../lib/transition/rng";
import { accentPalette } from "./accent";
import { field } from "./ascii";

const FADE_MS = 180;
const SWEEP_MS = 1500;
const ARRIVE_MS = 720;

const still = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

async function sweep(splash: HTMLElement, ready: () => void): Promise<void> {
  const canvas = splash.querySelector<HTMLCanvasElement>(".splash-ascii")!;
  const sweeper = field(canvas, newSeed(), 0, accentPalette());

  canvas.classList.add("is-shown");
  await new Promise((resolve) => window.setTimeout(resolve, FADE_MS));
  ready();
  await sweeper.reveal(SWEEP_MS);
}

export async function leave(splash: HTMLElement): Promise<void> {
  const card = document.querySelector(".builder-card");
  const ready = () => {
    splash.classList.add("is-covered");
    card?.classList.add("is-arriving");
    document.documentElement.classList.add("is-ready");
    window.setTimeout(() => card?.classList.remove("is-arriving"), ARRIVE_MS + 80);
  };

  if (still()) ready();
  else await sweep(splash, ready);

  splash.remove();
  document.dispatchEvent(new CustomEvent("app:ready"));
}
