import { progress, report } from "../../lib/progress";
import { startCover, type Cover } from "./cover";
import { backgroundDrawn, fontsLoaded, previewSettled } from "./steps";
import { stepText } from "./text";

const MIN_MS = 900;
const STALL_MS = 15000;
const ARRIVE_MS = 720;
const TICK_MS = 120;

let started = false;

const still = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

async function leave(splash: HTMLElement, cover: Cover): Promise<void> {
  const card = document.querySelector(".builder-card");

  splash.classList.add("is-revealing");
  document.documentElement.classList.add("is-ready");
  card?.classList.add("is-arriving");
  window.setTimeout(() => card?.classList.remove("is-arriving"), ARRIVE_MS + 80);
  await cover.reveal();
  splash.remove();
  document.dispatchEvent(new CustomEvent("app:ready"));
}

export function initSplash(): void {
  const splash = document.getElementById("splash");

  if (started || !splash) return;

  started = true;

  const cover = startCover(splash.querySelector<HTMLCanvasElement>(".splash-canvas")!, still());
  const step = splash.querySelector<HTMLElement>(".splash-step")!;
  const shownAt = performance.now();
  let shown = 0;
  let movedAt = shownAt;
  let done = false;

  const tick = () => {
    const target = progress();

    if (target > shown + 0.001) movedAt = performance.now();
    shown = Math.max(shown, shown + (target - shown) * 0.35);
    const label = stepText(done ? 1 : shown);

    if (step.textContent !== label) step.textContent = label;
    if (!done && performance.now() - movedAt > STALL_MS) void finish();
  };

  const timer = window.setInterval(tick, TICK_MS);

  const finish = async () => {
    if (done) return;

    (["fonts", "background", "viewer", "copy", "render"] as const).forEach((name) => report(name, 1));
    await new Promise((resolve) => window.setTimeout(resolve, Math.max(350, MIN_MS - (performance.now() - shownAt))));
    done = true;
    window.clearInterval(timer);
    tick();
    await leave(splash, cover);
  };

  void fontsLoaded().then(() => report("fonts", 1));
  void backgroundDrawn().then(() => report("background", 1));
  void Promise.all([fontsLoaded(), backgroundDrawn(), previewSettled()]).then(finish);
}
