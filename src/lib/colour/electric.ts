import { fromRgb, toRgb } from "./hex";

function toHsl(hex: string): { hue: number; sat: number } {
  const { r, g, b } = toRgb(hex);
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);

  if (max === min) {
    return { hue: 0, sat: 0 };
  }

  const d = max - min;
  const light = (max + min) / 2;
  const sat = light > 0.5 ? d / (2 - max - min) : d / (max + min);
  const sector = max === R ? (G - B) / d + (G < B ? 6 : 0) : max === G ? (B - R) / d + 2 : (R - G) / d + 4;

  return { hue: sector * 60, sat };
}

function hueSlice(H: number, c: number, x: number): [number, number, number] {
  if (H < 60) return [c, x, 0];
  if (H < 120) return [x, c, 0];
  if (H < 180) return [0, c, x];
  if (H < 240) return [0, x, c];
  if (H < 300) return [x, 0, c];
  return [c, 0, x];
}

export function electricHue(hex: string, lightness: number): string {
  const { hue, sat } = toHsl(hex);
  const H = (hue + (hue < 180 ? 25 : -25) + 360) % 360;
  const S = sat < 0.08 ? sat : Math.min(1, sat * 1.15 + 0.1);
  const c = (1 - Math.abs(2 * lightness - 1)) * S;
  const x = c * (1 - Math.abs(((H / 60) % 2) - 1));
  const m = lightness - c / 2;
  const [r, g, b] = hueSlice(H, c, x).map((v) => (v + m) * 255);

  return fromRgb(r, g, b);
}
