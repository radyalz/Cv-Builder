import { mixHex, mixWithWhite, toRgb } from "./hex";

const DARK_TEXT = "#0b0d10";
const LIGHT_TEXT = "#ffffff";

function channel(raw: number): number {
  const c = raw / 255;

  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const { r, g, b } = toRgb(hex);

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: string, b: string): number {
  const first = relativeLuminance(a);
  const second = relativeLuminance(b);

  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

export function textOn(hex: string): string {
  return contrastRatio(hex, DARK_TEXT) >= contrastRatio(hex, LIGHT_TEXT) ? DARK_TEXT : LIGHT_TEXT;
}

export function uiAccent(hex: string, theme: string): string {
  let accent = hex;

  if (theme === "light") {
    for (let step = 0; step < 12 && relativeLuminance(accent) > 0.3; step++) {
      accent = mixHex(accent, "#000000", 0.18);
    }

    return accent;
  }

  for (let step = 0; step < 12 && relativeLuminance(accent) < 0.22; step++) {
    accent = mixWithWhite(accent, 0.18);
  }

  return accent;
}
