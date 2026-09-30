import { clamp, tip } from "./state";

const GAP_X = 12;
const GAP_Y = 16;
const SPRING = { stiffness: 750, damping: 45 };

function stretch(): string {
  const vx = clamp(tip.vel.x, -1000, 1000) / 1000;
  const vy = clamp(tip.vel.y, -1000, 1000) / 1000;
  const scaleX = vx < 0 ? 1 + vx * 0.1 : 1 + vx * 0.15;
  const scaleY = vy < 0 ? 1 - vy * 0.15 : 1 - vy * 0.1;

  return `scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)}) skew(${(vx * 3).toFixed(2)}deg, ${(vy * 3).toFixed(2)}deg)`;
}

export function placeCursorTip(): void {
  const { tooltip, pop, bubble } = tip.els!;
  const flipX = tip.mouse.x + GAP_X + bubble.offsetWidth > window.innerWidth - 8;
  const flipY = tip.mouse.y + GAP_Y + bubble.offsetHeight > window.innerHeight - 8;
  const offsetX = flipX ? `calc(-100% - ${GAP_X}px)` : `${GAP_X}px`;
  const offsetY = flipY ? `calc(-100% - ${GAP_X}px)` : `${GAP_Y}px`;

  tooltip.style.transform = `translate3d(${tip.pos.x}px, ${tip.pos.y}px, 0) translate(${offsetX}, ${offsetY})`;
  pop.style.transformOrigin = `${flipX ? "right" : "left"} ${flipY ? "bottom" : "top"}`;
  bubble.style.transform = stretch();
}

function settle(): boolean {
  const settled =
    Math.abs(tip.mouse.x - tip.pos.x) < 0.2 &&
    Math.abs(tip.mouse.y - tip.pos.y) < 0.2 &&
    Math.abs(tip.vel.x) < 2 &&
    Math.abs(tip.vel.y) < 2;

  if (settled) {
    tip.pos = { ...tip.mouse };
    tip.vel = { x: 0, y: 0 };
  }

  return settled;
}

function step(time: number): void {
  const dt = Math.min(1 / 30, (time - (tip.lastTime || time)) / 1000 || 1 / 60);

  tip.lastTime = time;

  for (const axis of ["x", "y"] as const) {
    const force = SPRING.stiffness * (tip.mouse[axis] - tip.pos[axis]) - SPRING.damping * tip.vel[axis];

    tip.vel[axis] += force * dt;
    tip.pos[axis] += tip.vel[axis] * dt;
  }

  const settled = settle();

  placeCursorTip();
  tip.frame = settled || tip.mode !== "cursor" ? 0 : requestAnimationFrame(step);
}

export function runSpring(): void {
  if (!tip.frame) {
    tip.lastTime = 0;
    tip.frame = requestAnimationFrame(step);
  }
}

export function placeArrowTip(element: Element): void {
  const { tooltip, pop, bubble } = tip.els!;
  const rect = element.getBoundingClientRect();
  const width = bubble.offsetWidth;
  const height = bubble.offsetHeight;
  const above = rect.top - height - 12 >= 8;
  const centre = rect.left + rect.width / 2;
  const left = clamp(centre - width / 2, 8, window.innerWidth - width - 8);

  tooltip.dataset.side = above ? "top" : "bottom";
  tooltip.style.transform = `translate3d(${left}px, ${above ? rect.top - height - 12 : rect.bottom + 12}px, 0)`;
  pop.style.transformOrigin = `${centre - left}px ${above ? "100%" : "0"}`;
  bubble.style.transform = "";
  tooltip.querySelector<HTMLElement>(".tip-arrow")!.style.left = `${clamp(centre - left - 5, 8, width - 18)}px`;
}
