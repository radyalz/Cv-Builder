import { current } from "./engine";
import { state } from "./state";

export function setSkullsPaused(reason: string, paused: boolean): void {
  if (paused) state.pauses.add(reason);
  else state.pauses.delete(reason);

  current.engine?.pause(reason, paused);
}
