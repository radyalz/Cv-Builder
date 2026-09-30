import { css, type Point, type Rgb, type Size } from "./gradient";

const SPACING = 10;
const ROW_HEIGHT = SPACING * 0.866;
const ALPHA = { dark: 0.24, light: 0.14 };
const MAX_RADIUS = (SPACING / 2) * 0.7;

function strength(distance: number, reach: number): number {
  const t = Math.min(1, Math.max(0, 1 - distance / reach));

  return t * t * (3 - 2 * t);
}

function radiusAt(x: number, y: number, [strong, weak]: [Point, Point], diagonal: number): number {
  const t = Math.max(
    strength(Math.hypot(x - strong.x, y - strong.y), diagonal * 0.58),
    0.6 * strength(Math.hypot(x - weak.x, y - weak.y), diagonal * 0.36)
  );

  return MAX_RADIUS * t;
}

export function paintDots(context: CanvasRenderingContext2D, size: Size, accent: Rgb, dark: boolean, corners: [Point, Point]): void {
  const diagonal = Math.hypot(size.width, size.height);

  context.fillStyle = css(accent);
  context.globalAlpha = ALPHA[dark ? "dark" : "light"];
  context.beginPath();

  for (let row = 0, y = 0; y <= size.height + SPACING; row++, y = row * ROW_HEIGHT) {
    for (let x = row % 2 ? SPACING / 2 : 0; x <= size.width + SPACING; x += SPACING) {
      const radius = radiusAt(x, y, corners, diagonal);

      if (radius > 0.3) {
        context.moveTo(x + radius, y);
        context.arc(x, y, radius, 0, Math.PI * 2);
      }
    }
  }

  context.fill();
  context.globalAlpha = 1;
}
