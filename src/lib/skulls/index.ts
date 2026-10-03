import { current, startEngine } from "./engine";
import { paintSkulls } from "./paint";
import { LEVELS, onPace, pace, setLevel, type Level } from "./pace";
import { setSkullsPaused } from "./loop";
import { resize } from "./size";
import { state } from "./state";

export { onArt, paintSkulls } from "./paint";
export { drawPose } from "./render";
export { CYCLE_MS, PAD, TILE_H, TILE_W, type PartImages } from "./state";
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
    pace.fixed = true;
    setLevel(LEVELS.indexOf(forced));
  }
}

export function initSkulls(): void {
  const field = document.querySelector<HTMLElement>(".skull-field");
  const canvas = field?.querySelector("canvas");

  if (!field || !canvas || state.field === field) {
    return;
  }

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const engine = (current.engine = startEngine(canvas, onPace));

  state.field = field;
  state.still = motion.matches;
  readTestParams();
  engine.still(state.still, state.fixedAt);
  resize(canvas);

  motion.addEventListener("change", () => {
    state.still = motion.matches || state.fixedAt !== null;
    engine.still(state.still, state.fixedAt);
  });

  window.addEventListener("resize", () => {
    const before = state.painted;

    resize(canvas);
    if (!state.painted && before && state.last) paintSkulls(...state.last);
  });
  document.addEventListener("astro:after-swap", () => setLevel(pace.level));
  document.addEventListener("visibilitychange", () => setSkullsPaused("hidden", document.hidden));
}
