import { progress, report } from "../../lib/progress";
import { backgroundDrawn, fontsLoaded, previewSettled } from "./steps";
import { stepText } from "./text";

const MIN_MS = 700;
const STALL_MS = 15000;
const LEAVE_MS = 620;
const READY_HOLD_MS = 320;

let started = false;

function reveal(splash: HTMLElement): void {
  const card = document.querySelector(".builder-card");

  card?.classList.add("is-arriving");
  window.setTimeout(() => card?.classList.remove("is-arriving"), LEAVE_MS + 120);
  document.documentElement.classList.add("is-ready");
  document.dispatchEvent(new CustomEvent("app:ready"));
  splash.classList.add("is-leaving");
  window.setTimeout(() => splash.remove(), LEAVE_MS + 80);
}

export function initSplash(): void {
  const splash = document.getElementById("splash");

  if (started || !splash) return;

  started = true;

  const step = splash.querySelector<HTMLElement>(".splash-step")!;
  const shownAt = performance.now();
  let shown = 0.02;
  let movedAt = performance.now();
  let leaving = false;

  const paint = () => {
    const target = Math.max(0.02, progress());

    if (target > shown + 0.001) movedAt = performance.now();

    shown = Math.max(shown, shown + (target - shown) * 0.18);
    splash.style.setProperty("--splash-done", shown.toFixed(4));
    step.textContent = stepText();

    if (!leaving && performance.now() - movedAt > STALL_MS) finish();
    if (splash.isConnected && !leaving) requestAnimationFrame(paint);
  };

  const finish = async () => {
    if (leaving) return;

    (["fonts", "background", "viewer", "copy", "render"] as const).forEach((name) => report(name, 1));
    await new Promise((resolve) => window.setTimeout(resolve, Math.max(READY_HOLD_MS, MIN_MS - (performance.now() - shownAt))));
    leaving = true;
    splash.style.setProperty("--splash-done", "1");
    step.textContent = stepText();
    reveal(splash);
  };

  void fontsLoaded().then(() => report("fonts", 1));
  void backgroundDrawn().then(() => report("background", 1));
  void Promise.all([fontsLoaded(), backgroundDrawn(), previewSettled()]).then(finish);
  requestAnimationFrame(paint);
}
