import { electricHue, mixHex } from "../colour";

export interface Palette {
  accent: string;
  boneLight: string;
  boneMid: string;
  boneDark: string;
  rim: string;
  eyeHot: string;
  flashTone: string;
  spark: string;
  sparkHot: string;
  sparkDeep: string;
}

export function palette(accent: string, light: boolean): Palette {
  const spark = electricHue(accent, 0.62);

  return {
    accent,
    boneLight: light ? mixHex(accent, "#000000", 0.12) : mixHex(accent, "#fbf6f0", 0.84),
    boneMid: light ? mixHex(accent, "#000000", 0.42) : mixHex(accent, "#9a908a", 0.58),
    boneDark: light ? mixHex(accent, "#000000", 0.72) : mixHex(accent, "#1a1413", 0.66),
    rim: light ? mixHex(accent, "#000000", 0.6) : mixHex(accent, "#ffffff", 0.4),
    eyeHot: mixHex(accent, "#ffffff", 0.62),
    flashTone: mixHex(accent, "#ffffff", 0.5),
    spark,
    sparkHot: mixHex(spark, "#ffffff", 0.55),
    sparkDeep: mixHex(spark, "#000000", 0.55),
  };
}
