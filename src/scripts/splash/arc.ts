type Point = [x: number, y: number];

const DEPTH = 7;
const ROUGHNESS = 0.42;
const REFRESH_MS = 40;
const STRANDS = 3;

function fractal(from: Point, to: Point, spread: number, depth: number): Point[] {
  if (depth === 0) return [from, to];

  const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const middle: Point = [(from[0] + to[0]) / 2 + (Math.random() - 0.5) * length * spread, (from[1] + to[1]) / 2];

  return [...fractal(from, middle, spread, depth - 1).slice(0, -1), ...fractal(middle, to, spread, depth - 1)];
}

function fork([x, y]: Point, ahead: number): Point[] {
  const reach = 24 + Math.random() * 46;

  return fractal([x, y], [x + ahead * reach, y + (Math.random() - 0.3) * reach * 1.4], 0.5, 4);
}

export interface Arc {
  strands: Point[][];
  forks: Point[][];
  surge: number;
  madeAt: number;
}

export function makeArc(x: number, height: number, ahead: number, now: number): Arc {
  const strands = Array.from({ length: STRANDS }, (_, i) =>
    fractal([x + (Math.random() - 0.5) * 8, -30], [x + (Math.random() - 0.5) * 8, height + 30], ROUGHNESS * (i ? 0.7 : 1) * 0.11, DEPTH)
  );
  const forks = strands[0].filter(() => Math.random() < 0.035).map((point) => fork(point, ahead));

  return { strands, forks, surge: Math.random() < 0.18 ? 1 : 0.55 + Math.random() * 0.35, madeAt: now };
}

export const stale = (arc: Arc | undefined, now: number): boolean => !arc || now - arc.madeAt > REFRESH_MS * (0.5 + Math.random());

function towardWhite(color: string, amount: number): string {
  const hex = /^#?([\da-f]{6})$/i.exec(color.trim())?.[1];

  if (!hex) return "#fff";

  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const lift = (value: number) => Math.round(value + (255 - value) * amount);

  return `rgb(${lift(r)}, ${lift(g)}, ${lift(b)})`;
}

function path(ctx: CanvasRenderingContext2D, points: Point[], dx: number): void {
  ctx.beginPath();
  points.forEach(([x, y], i) => (i ? ctx.lineTo(x + dx, y) : ctx.moveTo(x + dx, y)));
}

function edgeLight(ctx: CanvasRenderingContext2D, dx: number, ahead: number, height: number, strength: number): void {
  const width = 38;
  const light = ctx.createLinearGradient(dx, 0, dx - ahead * width, 0);

  light.addColorStop(0, `rgba(255, 255, 255, ${0.3 * strength})`);
  light.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = light;
  ctx.fillRect(Math.min(dx, dx - ahead * width), 0, width, height);
}

export function drawArc(ctx: CanvasRenderingContext2D, arc: Arc, dx: number, ahead: number, accent: string): void {
  const strength = arc.surge * (0.8 + Math.random() * 0.2);
  const glow = towardWhite(accent, 0.55);

  ctx.save();
  edgeLight(ctx, dx, ahead, ctx.canvas.height, strength);
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = ctx.lineJoin = "round";

  arc.strands.forEach((strand, i) => {
    ctx.shadowColor = glow;
    ctx.shadowBlur = 12 * strength;
    ctx.strokeStyle = glow;
    ctx.globalAlpha = (i ? 0.35 : 0.6) * strength;
    ctx.lineWidth = i ? 2 : 3.2;
    path(ctx, strand, dx);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#fff";
    ctx.globalAlpha = (i ? 0.55 : 1) * strength;
    ctx.lineWidth = i ? 0.7 : 1.3;
    path(ctx, strand, dx);
    ctx.stroke();
  });

  ctx.shadowBlur = 8 * strength;
  arc.forks.forEach((points) => {
    ctx.globalAlpha = 0.75 * strength;
    ctx.lineWidth = 0.9;
    path(ctx, points, dx);
    ctx.stroke();
  });

  ctx.restore();
}
