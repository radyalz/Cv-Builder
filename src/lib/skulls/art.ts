import { palette, type Palette } from "./palette";
import { BOLT, SKULL } from "./paths";
import { bone, boneDefs, current, glow, star, svgImage } from "./svg";

export type PartName = "veins1" | "veins2" | "veins3" | "cranium" | "jaw" | "flash" | "eyes" | "flare" | "bolt";

const EYES: [number, number][] = [
  [38, 67],
  [63, 67],
];

const strikeDefs = (p: Palette): string =>
  '<linearGradient id="v" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="9">' +
  '<stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/></linearGradient>' +
  '<mask id="m"><rect width="100" height="130" fill="url(#v)"/></mask>' +
  '<filter id="g" x="-60%" y="-10%" width="220%" height="120%">' +
  '<feGaussianBlur stdDeviation=".9"/></filter>' +
  '<filter id="w" x="-160%" y="-20%" width="420%" height="140%">' +
  '<feGaussianBlur stdDeviation="2.6"/></filter>' +
  '<radialGradient id="i">' +
  '<stop offset="0" stop-color="#ffffff"/>' +
  `<stop offset=".3" stop-color="${p.sparkHot}" stop-opacity=".9"/>` +
  `<stop offset="1" stop-color="${p.spark}" stop-opacity="0"/>` +
  "</radialGradient>";

const strikeBody = (p: Palette): string =>
  '<g mask="url(#m)">' +
  `<path d="${BOLT.bolt}" fill="${p.spark}" filter="url(#w)"/>` +
  `<path d="${BOLT.bolt}" fill="${p.sparkHot}" filter="url(#w)" opacity=".6"/>` +
  `<path d="${BOLT.bolt}" fill="${p.spark}" filter="url(#g)"/>` +
  `<path d="${BOLT.bolt}" fill="${p.sparkHot}" filter="url(#g)" opacity=".7"/>` +
  `<path d="${BOLT.bolt}" fill="#ffffff"/>` +
  "</g>" +
  '<circle cx="50" cy="33.5" r="4.2" fill="url(#i)"/>';

const eyeLayer = (fill: string, radius: number, reach: number, girth: number): string =>
  EYES.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${radius}" fill="url(#${fill})"/>` + star(x, y, reach, girth)).join("");

export function skullParts(accent: string, light: boolean): Record<PartName, string> {
  const p = palette(accent, light);

  return {
    veins1: current(p, BOLT.veins1),
    veins2: current(p, BOLT.veins2),
    veins3: current(p, BOLT.veins3),
    cranium: svgImage(boneDefs(p), bone(p, SKULL.cranium)),
    jaw: svgImage(boneDefs(p), bone(p, SKULL.jaw)),
    flash: svgImage(
      '<filter id="h"><feGaussianBlur stdDeviation=".8"/></filter>',
      `<g transform="translate(0 30)"><path d="${SKULL.cranium}" fill="${p.flashTone}" filter="url(#h)"/></g>`
    ),
    eyes: svgImage(glow(p, "e", 0.18, 0.42), eyeLayer("e", 9, 7, 0.45)),
    flare: svgImage(glow(p, "f", 0.1, 0.3), eyeLayer("f", 20, 15, 0.7)),
    bolt: svgImage(strikeDefs(p), strikeBody(p)),
  };
}
