export interface Rgb {
  r: number;
  g: number;
  b: number;
}

const toHexPart = (channel: number): string => Math.round(channel).toString(16).padStart(2, "0");

export function normaliseHex(value: unknown): string | null {
  const raw = String(value || "")
    .trim()
    .replace(/^#/, "")
    .toUpperCase();
  const expanded = raw.length === 3 ? [...raw].map((character) => character + character).join("") : raw;

  return /^[0-9A-F]{6}$/.test(expanded) ? `#${expanded}` : null;
}

export function toRgb(hex: string): Rgb {
  const value = parseInt(hex.slice(1), 16);

  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

export function fromRgb(r: number, g: number, b: number): string {
  return `#${[r, g, b].map(toHexPart).join("")}`;
}

export function mixHex(a: string, b: string, amount: number): string {
  const x = toRgb(a);
  const y = toRgb(b);
  const blend = (p: number, q: number) => p + (q - p) * amount;

  return fromRgb(blend(x.r, y.r), blend(x.g, y.g), blend(x.b, y.b));
}

export function mixWithWhite(hex: string, amount: number): string {
  return mixHex(hex, "#ffffff", amount).toUpperCase();
}
