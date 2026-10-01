export interface Countdown {
  start(): void;
  stop(): void;
}

export function countdown(element: HTMLElement, bar: HTMLElement, total: number, done: () => void): Countdown {
  let left = total;
  let held = false;
  let running = false;
  let last = 0;
  let frame = 0;

  const tick = (now: number) => {
    if (!running) return;
    if (!held) left -= now - last;

    last = now;
    bar.style.transform = `scaleX(${Math.max(0, left / total)})`;

    if (left <= 0) done();
    else frame = requestAnimationFrame(tick);
  };

  for (const [type, value] of [["pointerenter", true], ["pointerleave", false], ["focusin", true], ["focusout", false]] as const) {
    element.addEventListener(type, () => (held = value));
  }

  return {
    start() {
      running = true;
      left = total;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      cancelAnimationFrame(frame);
    },
  };
}
