import { progress, report } from "../../lib/progress";
import { drawRing } from "./ring";
import { skullDrawer } from "./skull";
import { backgroundDrawn, fontsLoaded, previewSettled } from "./steps";
import { stepText } from "./text";
import { field, takeHandoff, type Field } from "./ascii";
import { leave } from "./leave";

const MIN_MS = 900;
const STALL_MS = 15000;
const FRAME_MS = 40;
const COVER_MS = 1500;

let started = false;

const still = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function palette() {
  const style = getComputedStyle(document.documentElement);

  return { accent: style.getPropertyValue("--accent").trim(), muted: style.getPropertyValue("--muted").trim() };
}

export function initSplash(): void {
  const splash = document.getElementById("splash");

  if (started || !splash) return;

  started = true;

  const canvas = splash.querySelector<HTMLCanvasElement>(".splash-canvas")!;
  const step = splash.querySelector<HTMLElement>(".splash-step")!;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const skull = skullDrawer(ratio);
  const handoff = takeHandoff();
  const ascii = splash.querySelector<HTMLCanvasElement>(".splash-ascii")!;
  const cover: Field | null = handoff && !still() ? field(ascii, handoff.seed, handoff.time) : null;
  let uncovered: Promise<void> | undefined;
  const uncover = () => (uncovered ??= cover ? cover.reveal(COVER_MS) : Promise.resolve());
  const shownAt = performance.now();
  let shown = 0;
  let movedAt = shownAt;
  let done = false;
  let measured = 0;
  let lastLabel = "";
  let drawnAt = 0;

  if (cover) ascii.classList.add("is-shown");
  splash.classList.remove("is-handoff");
  window.addEventListener("resize", () => (measured = 0));

  const frame = (now: number) => {
    if (!splash.isConnected) return;

    if (now - drawnAt < FRAME_MS || document.hidden) {
      requestAnimationFrame(frame);
      return;
    }

    if (!drawnAt) requestAnimationFrame(() => void uncover());
    drawnAt = now;
    const target = progress();
    const ctx = canvas.getContext("2d")!;
    const size = (measured ||= canvas.clientWidth);

    if (target > shown + 0.001) movedAt = now;
    shown = Math.max(shown, shown + (target - shown) * 0.16);

    if (canvas.width !== Math.round(size * ratio)) canvas.width = canvas.height = Math.round(size * ratio);

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, size, size);
    skull.draw(ctx, size / 2, size / 2, size * 0.6, now - shownAt);
    drawRing(ctx, size / 2, size / 2, size * 0.44, done ? 1 : shown, now, palette());
    const label = stepText(done ? 1 : shown);

    if (label !== lastLabel) {
      lastLabel = label;
      step.textContent = label;
    }

    if (!done && now - movedAt > STALL_MS) void finish();
    if (splash.isConnected) requestAnimationFrame(frame);
  };

  const finish = async () => {
    if (done) return;

    (["fonts", "background", "viewer", "copy", "render"] as const).forEach((name) => report(name, 1));
    await new Promise((resolve) => window.setTimeout(resolve, Math.max(350, MIN_MS - (performance.now() - shownAt))));
    done = true;
    skull.stop();
    await uncover();
    ascii.classList.remove("is-shown");
    await leave(splash);
  };

  void fontsLoaded().then(() => report("fonts", 1));
  void backgroundDrawn().then(() => report("background", 1));
  void Promise.all([fontsLoaded(), backgroundDrawn(), previewSettled()]).then(finish);
  window.setTimeout(() => requestAnimationFrame(frame), 0);
}
