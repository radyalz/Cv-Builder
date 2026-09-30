import type { Palette } from "./palette";

export function svgImage(defs: string, body: string): string {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 200">' + `<defs>${defs}</defs>${body}</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const boneDefs = (p: Palette): string =>
  '<linearGradient id="b" gradientUnits="userSpaceOnUse" x1="0" y1="6" x2="0" y2="96">' +
  `<stop offset="0" stop-color="${p.boneLight}"/>` +
  `<stop offset=".5" stop-color="${p.boneMid}"/>` +
  `<stop offset="1" stop-color="${p.boneDark}"/>` +
  "</linearGradient>" +
  '<filter id="h" x="-20%" y="-20%" width="140%" height="140%">' +
  '<feGaussianBlur stdDeviation="1.4"/></filter>';

export const bone = (p: Palette, d: string): string =>
  '<g transform="translate(0 30)">' +
  `<path d="${d}" fill="none" stroke="${p.accent}" stroke-width="2.6" ` +
  'stroke-opacity=".4" stroke-linejoin="round" filter="url(#h)"/>' +
  `<path d="${d}" fill="url(#b)" stroke="${p.rim}" stroke-width=".35" stroke-opacity=".8"/>` +
  "</g>";

export const star = (cx: number, cy: number, reach: number, girth: number): string =>
  `<path fill="#ffffff" d="M${cx - reach} ${cy}L${cx} ${cy - girth}L${cx + reach} ${cy}L${cx} ${cy + girth}Z` +
  `M${cx} ${cy - reach}L${cx + girth} ${cy}L${cx} ${cy + reach}L${cx - girth} ${cy}Z"/>`;

export const glow = (p: Palette, id: string, core: number, mid: number): string =>
  `<radialGradient id="${id}">` +
  '<stop offset="0" stop-color="#ffffff"/>' +
  `<stop offset="${core}" stop-color="#ffffff" stop-opacity=".95"/>` +
  `<stop offset="${mid}" stop-color="${p.eyeHot}" stop-opacity=".85"/>` +
  `<stop offset="1" stop-color="${p.accent}" stop-opacity="0"/>` +
  "</radialGradient>";

export const current = (p: Palette, d: string): string =>
  svgImage(
    '<filter id="g" x="-40%" y="-40%" width="180%" height="180%">' +
      '<feGaussianBlur stdDeviation="1.1"/></filter>' +
      '<filter id="n" x="-30%" y="-30%" width="160%" height="160%">' +
      '<feGaussianBlur stdDeviation=".45"/></filter>' +
      '<filter id="w" x="-60%" y="-60%" width="220%" height="220%">' +
      '<feGaussianBlur stdDeviation="2"/></filter>',
    `<path d="${d}" fill="${p.spark}" filter="url(#w)" opacity=".7"/>` +
      `<path d="${d}" fill="${p.sparkDeep}" filter="url(#g)" opacity=".85"/>` +
      `<path d="${d}" fill="${p.spark}" filter="url(#g)"/>` +
      `<path d="${d}" fill="${p.sparkHot}" filter="url(#n)"/>` +
      `<path d="${d}" fill="#ffffff"/>`
  );
