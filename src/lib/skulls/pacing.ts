const SAMPLES = 100;
const WARMUP = 10;

export const pacing = { samples: [] as number[], level: 0, done: false };

function struggling(): boolean {
  const sorted = pacing.samples.slice(WARMUP).sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const slow = sorted.filter((value) => value > 34).length / sorted.length;

  return pacing.level === 0 ? median > 22 || slow > 0.2 : median > 45 || slow > 0.3;
}

export function watchGap(gap: number, report: (struggling: boolean) => void): void {
  if (pacing.done || pacing.level >= 2 || gap > 1000) {
    return;
  }

  pacing.samples.push(gap);

  if (pacing.samples.length < SAMPLES) {
    return;
  }

  const verdict = struggling();

  pacing.samples = [];
  report(verdict);
}
