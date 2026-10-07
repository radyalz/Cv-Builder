import { drawArc, makeArc, stale, type Arc } from "./arc";

const ENTER_MS = 520;
const LAST_MS = 760;
const STAGGER_MS = 110;
const ROOM = 60;
const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

function sparks(splash: HTMLElement, panels: HTMLElement[], ahead: number): () => void {
  const canvas = splash.querySelector<HTMLCanvasElement>(".splash-sparks")!;
  const ctx = canvas.getContext("2d")!;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  const arcs = new Map<HTMLElement, Arc>();
  let running = true;

  canvas.width = Math.round(innerWidth * ratio);
  canvas.height = Math.round(innerHeight * ratio);

  const frame = (now: number) => {
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    for (const panel of panels) {
      const box = panel.getBoundingClientRect();
      const edge = ahead > 0 ? box.right : box.left;

      if (panel.hidden || edge < -ROOM || edge > innerWidth - 2 || (ahead < 0 && edge < 2)) continue;
      if (stale(arcs.get(panel), now)) arcs.set(panel, makeArc(0, innerHeight, ahead, now));

      drawArc(ctx, arcs.get(panel)!, edge, accent);
    }

    if (running) requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);

  return () => {
    running = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
}

export async function wipe(splash: HTMLElement, onCovered: () => void): Promise<void> {
  const panels = [...splash.querySelectorAll<HTMLElement>(".splash-wipe > span")];
  const last = panels.pop()!;
  const sign = document.documentElement.dir === "rtl" ? 1 : -1;
  const at = (fraction: number): Keyframe => ({ transform: `translateX(calc(${fraction * 100}% + ${fraction * ROOM}px))` });
  const lastDelay = panels.length * STAGGER_MS;

  splash.classList.add("is-wiping");

  const stop = sparks(splash, [...panels, last], -sign);

  panels.forEach((panel, index) =>
    panel.animate([at(sign), at(0)], { duration: ENTER_MS, delay: index * STAGGER_MS, easing: EASE, fill: "both" })
  );

  const sweep = last.animate([{ ...at(sign), easing: EASE }, { ...at(0), offset: 0.5, easing: EASE }, at(-sign)], {
    duration: LAST_MS,
    delay: lastDelay,
    fill: "both",
  });

  window.setTimeout(onCovered, ENTER_MS + 16);
  window.setTimeout(() => panels.forEach((panel) => (panel.hidden = true)), lastDelay + LAST_MS / 2 + 16);
  await sweep.finished;
  stop();
}
