import { current } from "./engine";

export const LEVELS = ["full", "lite", "flat"] as const;

export type Level = (typeof LEVELS)[number];

export const pace = { level: 0, fixed: false };

const blurs = (): boolean =>
  CSS.supports("backdrop-filter", "blur(1px)") || CSS.supports("-webkit-backdrop-filter", "blur(1px)");

export function setLevel(level: number): void {
  pace.level = level;
  current.engine?.pace(level, level >= 1 ? 1000 / 30 - 2 : 0, pace.fixed);
  document.documentElement.dataset.quality = LEVELS[level];

  if (level >= 2 || !blurs()) {
    document.documentElement.dataset.glass = "flat";
  }
}

export function onPace(struggling: boolean): void {
  if (struggling) {
    setLevel(pace.level + 1);
    return;
  }

  pace.fixed = true;
  setLevel(pace.level);
}
