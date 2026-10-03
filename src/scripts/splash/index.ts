import type { StringKey } from "../../lib/data";
import { t } from "../../lib/prefs";
import { backgroundDrawn, fontsLoaded, previewSettled } from "./steps";

const MIN_MS = 700;
const MAX_MS = 12000;
const LEAVE_MS = 620;
const READY_HOLD_MS = 380;

let started = false;

export function initSplash(): void {
  const splash = document.getElementById("splash");

  if (started || !splash) return;

  started = true;

  const step = splash.querySelector<HTMLElement>(".splash-step")!;
  const shownAt = performance.now();
  let done = 0;

  const advance = (next: StringKey) => {
    done += 1;
    splash.style.setProperty("--splash-done", String(6 + done * 31));
    step.classList.add("is-swapping");
    window.setTimeout(() => {
      step.textContent = t(next);
      step.classList.remove("is-swapping");
    }, 200);
  };

  const steps = (async () => {
    await fontsLoaded();
    advance("splashArt");
    await backgroundDrawn();
    advance("splashCv");
    await previewSettled();
    advance("splashReady");
    await new Promise((resolve) => window.setTimeout(resolve, READY_HOLD_MS));
  })();

  const cap = new Promise((resolve) => window.setTimeout(resolve, MAX_MS));

  void Promise.race([steps, cap]).then(async () => {
    const left = MIN_MS - (performance.now() - shownAt);

    if (left > 0) await new Promise((resolve) => window.setTimeout(resolve, left));

    const card = document.querySelector(".builder-card");

    card?.classList.add("is-arriving");
    window.setTimeout(() => card?.classList.remove("is-arriving"), LEAVE_MS + 120);
    document.documentElement.classList.add("is-ready");
    document.dispatchEvent(new CustomEvent("app:ready"));
    splash.classList.add("is-leaving");
    window.setTimeout(() => splash.remove(), LEAVE_MS + 80);
  });
}
