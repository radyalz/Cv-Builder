import { mixRgb, type Palette, type Rgb } from "../../lib/transition/palette";

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

export function accentPalette(): Palette {
  const accent = parse(getComputedStyle(document.documentElement).getPropertyValue("--accent").trim());

  return {
    field: [mixRgb(BLACK, accent, 0.85), mixRgb(BLACK, accent, 0.55)],
    edge: [mixRgb(accent, WHITE, 0.18), mixRgb(accent, WHITE, 0.5), mixRgb(accent, WHITE, 0.86)],
    bg: BLACK,
  };
}
