type Point = [x: number, y: number];

const STEP = 26;
const SWAY = 16;
const REFRESH_MS = 55;

function jagged(x: number, top: number, bottom: number, sway: number): Point[] {
  const points: Point[] = [];
  let drift = 0;

  for (let y = top; y <= bottom + STEP; y += STEP * (0.6 + Math.random() * 0.8)) {
    drift = drift * 0.45 + (Math.random() - 0.5) * sway * 2;
    points.push([x + drift, y]);
  }

  return points;
}

function branch([x, y]: Point, ahead: number): Point[] {
  const points: Point[] = [[x, y]];
  const length = 3 + Math.floor(Math.random() * 5);
  let [px, py] = [x, y];

  for (let i = 0; i < length; i++) {
    px += ahead * (8 + Math.random() * 18);
    py += (Math.random() - 0.35) * 30;
    points.push([px, py]);
  }

  return points;
}

export interface Arc {
  main: Point[];
  branches: Point[][];
  sparks: Point[];
  madeAt: number;
}

export function makeArc(x: number, height: number, ahead: number, now: number): Arc {
  const main = jagged(x, -20, height + 20, SWAY);
  const branches = main.filter(() => Math.random() < 0.16).map((point) => branch(point, ahead));
  const sparks = Array.from({ length: 10 }, (): Point => [x + ahead * Math.random() * 40, Math.random() * height]);

  return { main, branches, sparks, madeAt: now };
}

export const stale = (arc: Arc | undefined, now: number): boolean => !arc || now - arc.madeAt > REFRESH_MS * (0.6 + Math.random());

function stroke(ctx: CanvasRenderingContext2D, points: Point[], width: number, alpha: number): void {
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.beginPath();
  points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
}

export function drawArc(ctx: CanvasRenderingContext2D, arc: Arc, dx: number, accent: string): void {
  const shift = (points: Point[]) => points.map(([x, y]): Point => [x + dx, y]);

  ctx.save();
  ctx.lineCap = ctx.lineJoin = "round";
  ctx.shadowColor = accent;
  ctx.shadowBlur = 22;
  ctx.strokeStyle = accent;
  stroke(ctx, shift(arc.main), 7, 0.35);
  arc.branches.forEach((points) => stroke(ctx, shift(points), 3, 0.3));
  ctx.shadowBlur = 10;
  ctx.strokeStyle = "#fff";
  stroke(ctx, shift(arc.main), 2.2, 0.95);
  arc.branches.forEach((points) => stroke(ctx, shift(points), 1.1, 0.75));
  ctx.fillStyle = "#fff";
  arc.sparks.forEach(([x, y]) => {
    ctx.globalAlpha = Math.random();
    ctx.fillRect(x + dx, y, 1.6, 1.6);
  });
  ctx.restore();
}
