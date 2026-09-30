import { collapsePreview } from "./collapse";
import { expandPreview } from "./expand";

export type ExpandState = "closed" | "opening" | "open" | "closing";

export const expand = {
  state: "closed" as ExpandState,
  queued: null as "open" | "close" | null,
};

export function runQueued(): void {
  const next = expand.queued;

  expand.queued = null;

  if (next === "open") {
    void expandPreview();
  } else if (next === "close") {
    void collapsePreview();
  }
}
