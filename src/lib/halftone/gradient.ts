export type Rgb = [number, number, number];

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export function rgbOf(colour: string): Rgb {
  const context = document.createElement("canvas").getContext("2d")!;

  context.fillStyle = "#000";
  context.fillStyle = colour;

  const value = String(context.fillStyle);

  if (value.startsWith("#")) {
    return [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16)) as Rgb;
  }

  return value.match(/[\d.]+/g)!.slice(0, 3).map(Number) as Rgb;
}

export function mix(accent: Rgb, base: Rgb, percent: number): Rgb {
  return accent.map((value, i) => Math.round((value * percent + base[i] * (100 - percent)) / 100)) as Rgb;
}

export const css = ([r, g, b]: Rgb, alpha = 1): string => `rgba(${r}, ${g}, ${b}, ${alpha})`;

function glow(context: CanvasRenderingContext2D, size: Size, at: Point, radii: Point, colour: Rgb, stop: number): void {
  const gradient = context.createRadialGradient(0, 0, 0, 0, 0, 1);

  gradient.addColorStop(0, css(colour));
  gradient.addColorStop(stop, css(colour, 0));
  context.save();
  context.translate(at.x, at.y);
  context.scale(radii.x, radii.y);
  context.fillStyle = gradient;
  context.fillRect(-at.x / radii.x, -at.y / radii.y, size.width / radii.x, size.height / radii.y);
  context.restore();
}

export function paintGradient(context: CanvasRenderingContext2D, size: Size, accent: Rgb, dark: boolean, corners: [Point, Point]): void {
  const { width, height } = size;
  const base: Rgb = dark ? [5, 5, 6] : [255, 255, 255];
  const [strong, weak] = corners;

  context.fillStyle = css(dark ? base : mix(accent, base, 3));
  context.fillRect(0, 0, width, height);
  glow(context, size, strong, { x: width * 1.2, y: height * 0.85 }, mix(accent, base, dark ? 17 : 13), 0.6);
  glow(context, size, weak, { x: width * 0.7, y: height * 0.55 }, mix(accent, base, dark ? 9 : 8), 0.7);
}
