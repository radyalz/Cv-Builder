import { watchPace } from "./pace";
import { draw } from "./render";
import { state } from "./state";

function loop(now: number): void {
  state.frame = 0;

  if (state.pauses.size || !state.images) {
    return;
  }

  state.frame = requestAnimationFrame(loop);

  if (state.minGap && now - state.lastDraw < state.minGap) {
    return;
  }

  const gap = now - state.lastDraw;

  state.lastDraw = now;
  draw(now);
  watchPace(gap);
}

export function run(): void {
  if (state.still) {
    if (state.images) {
      draw(performance.now());
    }

    return;
  }

  if (!state.frame && !state.pauses.size && state.images) {
    state.frame = requestAnimationFrame(loop);
  }
}

export function setSkullsPaused(reason: string, paused: boolean): void {
  if (paused) {
    state.pauses.add(reason);
    return;
  }

  state.pauses.delete(reason);
  state.lastDraw = performance.now();
  run();
}
