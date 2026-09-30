import { paintDots } from "./dots";
import { paintGradient, rgbOf, type Point } from "./gradient";

let started = false;

function draw(canvas: HTMLCanvasElement): void {
  const root = document.documentElement;
  const size = { width: window.innerWidth, height: window.innerHeight };
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const context = canvas.getContext("2d")!;
  const accent = rgbOf(getComputedStyle(root).getPropertyValue("--accent").trim() || "#9f74bf");
  const dark = root.dataset.theme !== "light";
  const rtl = root.dir === "rtl";
  const corners: [Point, Point] = [
    { x: rtl ? size.width : 0, y: size.height },
    { x: rtl ? 0 : size.width, y: 0 },
  ];

  canvas.width = Math.round(size.width * ratio);
  canvas.height = Math.round(size.height * ratio);
  canvas.style.width = `${size.width}px`;
  canvas.style.height = `${size.height}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  paintGradient(context, size, accent, dark, corners);
  paintDots(context, size, accent, dark, corners);
}

export function initHalftone(): void {
  const canvas = document.querySelector<HTMLCanvasElement>(".tone-field canvas");

  if (started || !canvas) {
    return;
  }

  started = true;

  let frame = 0;
  let timer = 0;
  const redraw = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => draw(canvas));
  };

  draw(canvas);
  canvas.parentElement?.classList.add("is-painted");

  new MutationObserver(redraw).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["style", "data-theme", "dir"],
  });

  window.addEventListener("resize", () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(redraw, 120);
  });
}
