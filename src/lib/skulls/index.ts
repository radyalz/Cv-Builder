import { paintSkulls } from "./paint";
import { LEVELS, pace, setLevel, type Level } from "./pace";
import { run, setSkullsPaused } from "./loop";
import { draw } from "./render";
import { resize } from "./size";
import { state } from "./state";

export { paintSkulls } from "./paint";
export { setSkullsPaused } from "./loop";
export { skullParts } from "./art";

function readTestParams(): void {
  const params = new URLSearchParams(location.search);
  const forced = params.get("quality") as Level | null;

  if (params.has("pose")) {
    state.fixedAt = Math.min(100, Math.max(0, Number(params.get("pose")) || 0));
    state.still = true;
  }

  if (forced && LEVELS.includes(forced)) {
    setLevel(LEVELS.indexOf(forced));
    pace.fixed = true;
  }
}

function onResize(): void {
  const before = state.ratio;

  resize();

  if (state.ratio !== before && state.last) {
    paintSkulls(...state.last);
  } else if (state.images) {
    draw(performance.now());
  }
}

export function initSkulls(): void {
  const field = document.querySelector<HTMLElement>(".skull-field");

  if (!field || state.field === field) {
    return;
  }

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

  state.field = field;
  state.canvas = field.querySelector("canvas");
  state.context = state.canvas!.getContext("2d");
  state.started = performance.now();
  state.still = motion.matches;
  resize();

  motion.addEventListener("change", () => {
    state.still = motion.matches || state.fixedAt !== null;
    run();
  });
  readTestParams();

  window.addEventListener("resize", onResize);
  document.addEventListener("astro:after-swap", () => setLevel(pace.level));
  document.addEventListener("visibilitychange", () => setSkullsPaused("hidden", document.hidden));
}
