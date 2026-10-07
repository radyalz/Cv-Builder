import { drawArc, makeArc, stale, type Arc } from "./arc";

const PASS_MS = 1050;
const STAGGER_MS = 110;
const LAST_EXTRA_MS = 70;
const COVER_AT = 0.45;
const LEAVE_AT = 0.53;
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

      if (edge < -ROOM || edge > innerWidth + ROOM) continue;
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
  const sign = document.documentElement.dir === "rtl" ? 1 : -1;
  const at = (fraction: number, offset: number, easing: string): Keyframe => ({
    transform: `translateX(calc(${fraction * 100}% + ${fraction * ROOM}px))`,
    offset,
    easing,
  });

  splash.classList.add("is-wiping");

  const stop = sparks(splash, panels, -sign);
  const passes = panels.map((panel, index) =>
    panel.animate([at(sign, 0, EASE), at(0, COVER_AT, "linear"), at(0, LEAVE_AT, EASE), at(-sign, 1, "linear")], {
      duration: PASS_MS,
      delay: index * STAGGER_MS + (index === panels.length - 1 ? LAST_EXTRA_MS : 0),
      fill: "both",
    })
  );

  window.setTimeout(onCovered, PASS_MS * COVER_AT + 16);
  await Promise.all(passes.map((pass) => pass.finished));
  stop();
}
