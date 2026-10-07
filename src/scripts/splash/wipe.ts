import { drawArc, makeArc, stale, type Arc } from "./arc";

const ENTER_MS = 520;
const LAST_MS = 760;
const STAGGER_MS = 110;
const ROOM = 60;
const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

const ARC_HALF = 60;

function sparks(panels: HTMLElement[], ahead: number, moving: (panel: HTMLElement) => boolean): () => void {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  const arcs = new Map<HTMLElement, Arc>();
  const canvases = panels.map((panel) => panel.querySelector<HTMLCanvasElement>(".splash-arc")!);
  let running = true;

  canvases.forEach((canvas) => {
    canvas.width = Math.round(ARC_HALF * 2 * ratio);
    canvas.height = Math.round(innerHeight * ratio);
  });

  const frame = (now: number) => {
    panels.forEach((panel, index) => {
      const ctx = canvases[index].getContext("2d")!;

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, ARC_HALF * 2, innerHeight);

      if (!moving(panel)) return;
      if (stale(arcs.get(panel), now)) arcs.set(panel, makeArc(0, innerHeight, ahead, now));

      drawArc(ctx, arcs.get(panel)!, ARC_HALF, ahead, accent);
    });

    if (running) requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);

  return () => {
    running = false;
  };
}

export async function wipe(splash: HTMLElement, onCovered: () => void): Promise<void> {
  const panels = [...splash.querySelectorAll<HTMLElement>(".splash-wipe > span")];
  const last = panels.pop()!;
  const sign = document.documentElement.dir === "rtl" ? 1 : -1;
  const at = (fraction: number): Keyframe => ({ transform: `translateX(calc(${fraction * 100}% + ${fraction * ROOM}px))` });
  const lastDelay = panels.length * STAGGER_MS;

  splash.classList.add("is-wiping");

  const animations = new Map<HTMLElement, Animation>();
  const moving = (panel: HTMLElement) => {
    const animation = animations.get(panel);
    const progress = animation?.effect?.getComputedTiming().progress;

    return !panel.hidden && typeof progress === "number" && progress > 0 && progress < 1 && animation!.playState === "running";
  };
  const stop = sparks([...panels, last], -sign, moving);

  panels.forEach((panel, index) =>
    animations.set(panel, panel.animate([at(sign), at(0)], { duration: ENTER_MS, delay: index * STAGGER_MS, easing: EASE, fill: "both" }))
  );

  const sweep = last.animate([{ ...at(sign), easing: EASE }, { ...at(0), offset: 0.5, easing: EASE }, at(-sign)], {
    duration: LAST_MS,
    delay: lastDelay,
    fill: "both",
  });

  animations.set(last, sweep);
  window.setTimeout(onCovered, ENTER_MS + 16);
  window.setTimeout(() => panels.forEach((panel) => (panel.hidden = true)), lastDelay + LAST_MS / 2 + 16);
  await sweep.finished;
  stop();
}
