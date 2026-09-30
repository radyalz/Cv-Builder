import { state } from "./state";

export const LEVELS = ["full", "lite", "flat"] as const;

export type Level = (typeof LEVELS)[number];

export const pace = { samples: [] as number[], level: 0, fixed: false };

const blurs = (): boolean =>
  CSS.supports("backdrop-filter", "blur(1px)") || CSS.supports("-webkit-backdrop-filter", "blur(1px)");

export function setLevel(level: number): void {
  pace.level = level;
  state.minGap = level >= 1 ? 1000 / 30 - 2 : 0;
  document.documentElement.dataset.quality = LEVELS[level];

  if (level >= 2 || !blurs()) {
    document.documentElement.dataset.glass = "flat";
  }
}

function judge(): boolean {
  const sorted = pace.samples.slice(10).sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const slow = sorted.filter((value) => value > 34).length / sorted.length;

  return pace.level === 0 ? median > 22 || slow > 0.2 : median > 45 || slow > 0.3;
}

export function watchPace(gap: number): void {
  if (pace.fixed || pace.level >= 2 || document.hidden || gap > 1000) {
    return;
  }

  pace.samples.push(gap);

  if (pace.samples.length < 100) {
    return;
  }

  const struggling = judge();

  pace.samples = [];

  if (struggling) {
    setLevel(pace.level + 1);
  } else {
    pace.fixed = true;
  }
}
