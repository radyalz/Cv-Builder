import type { Palette } from "../../lib/transition/render";

type Rgb = [number, number, number];

const BLACK: Rgb = [7, 5, 10];
const WHITE: Rgb = [255, 255, 255];

function parse(color: string): Rgb {
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!ctx) return [107, 61, 255];
  ctx.fillStyle = "#6b3dff";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

const mix = (a: Rgb, b: Rgb, amount: number): string =>
  `rgb(${a.map((v, i) => Math.round(v * amount + b[i] * (1 - amount))).join(",")})`;

export function accentPalette(): Palette {
  const accent = parse(getComputedStyle(document.documentElement).getPropertyValue("--accent").trim());

  return {
    lav: [mix(accent, WHITE, 0.22), mix(accent, WHITE, 0.7), mix(accent, BLACK, 0.9), mix(accent, BLACK, 0.75)],
    dark: [0.2, 0.28, 0.36, 0.46, 0.6].map((amount) => mix(accent, BLACK, amount)),
    edge: mix(accent, WHITE, 0.06),
    bg: "#07050a",
  };
}
