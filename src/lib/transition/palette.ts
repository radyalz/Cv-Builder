export type Rgb = [number, number, number];

export interface Palette {
  field: [Rgb, Rgb];
  edge: [Rgb, Rgb, Rgb];
  bg: Rgb;
}

export function hex(value: string): Rgb {
  const n = parseInt(value.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export const PURPLE_GOLD: Palette = {
  field: [hex("#6B3DFF"), hex("#C8A24B")],
  edge: [hex("#E9C46A"), hex("#B79CFF"), hex("#F7F2FF")],
  bg: hex("#07050A"),
};

export const mixRgb = (a: Rgb, b: Rgb, k: number): Rgb => [
  a[0] + (b[0] - a[0]) * k,
  a[1] + (b[1] - a[1]) * k,
  a[2] + (b[2] - a[2]) * k,
];

export function lerpPalette(a: Palette, b: Palette, k: number): Palette {
  const m = Math.max(0, Math.min(1, k));
  return {
    field: [mixRgb(a.field[0], b.field[0], m), mixRgb(a.field[1], b.field[1], m)],
    edge: [mixRgb(a.edge[0], b.edge[0], m), mixRgb(a.edge[1], b.edge[1], m), mixRgb(a.edge[2], b.edge[2], m)],
    bg: mixRgb(a.bg, b.bg, m),
  };
}

export const tone = (c: Rgb, bg: Rgb, k: number): string =>
  `rgb(${Math.round(bg[0] + (c[0] - bg[0]) * k)},${Math.round(bg[1] + (c[1] - bg[1]) * k)},${Math.round(bg[2] + (c[2] - bg[2]) * k)})`;
