// Colour maths shared by the page and the skull artwork.

export function normaliseHex(value) {
  const raw = String(value || "")
    .trim()
    .replace(/^#/, "")
    .toUpperCase();

  const expanded =
    raw.length === 3
      ? raw
          .split("")
          .map((character) => character + character)
          .join("")
      : raw;

  return /^[0-9A-F]{6}$/.test(expanded) ? `#${expanded}` : null;
}

export function toRgb(hex) {
  const value = parseInt(hex.slice(1), 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

export function relativeLuminance(hex) {
  const { r, g, b } = toRgb(hex);

  const channel = (raw) => {
    const c = raw / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function mixWithWhite(hex, amount) {
  const { r, g, b } = toRgb(hex);
  const blend = (channel) => Math.round(channel + (255 - channel) * amount);

  return (
    "#" +
    [blend(r), blend(g), blend(b)]
      .map((channel) => channel.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

// The page sits on a near-black background, so very dark accents (mono,
// graphite, dark custom colours) are lifted until they stay visible here.

export function contrastRatio(a, b) {
  const first = relativeLuminance(a);
  const second = relativeLuminance(b);

  return (
    (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
  );
}

// Mid-tone accents such as orange beat a fixed lightness threshold, so the
// label simply takes whichever of the two extremes actually reads better.
export function textOn(hex) {
  const dark = "#0b0d10";
  const light = "#ffffff";

  return contrastRatio(hex, dark) >= contrastRatio(hex, light) ? dark : light;
}

/* -------------------------------------------------------------------------
   Selection state
   ---------------------------------------------------------------------- */

export function mixHex(a, b, amount) {
  const x = toRgb(a);
  const y = toRgb(b);
  const blend = (p, q) => Math.round(p + (q - p) * amount);

  return (
    "#" +
    [blend(x.r, y.r), blend(x.g, y.g), blend(x.b, y.b)]
      .map((channel) => channel.toString(16).padStart(2, "0"))
      .join("")
  );
}

// A sibling hue for the lightning. Cool accents lean towards cyan and warm
// ones towards yellow, the colours that read as electric, so blue gets an
// electric blue rather than just more of the same blue. Greys stay grey.
export function electricHue(hex, lightness) {
  const { r, g, b } = toRgb(hex);
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const light = (max + min) / 2;
  let hue = 0;
  let sat = 0;

  if (max !== min) {
    const d = max - min;
    sat = light > 0.5 ? d / (2 - max - min) : d / (max + min);

    if (max === R) {
      hue = (G - B) / d + (G < B ? 6 : 0);
    } else if (max === G) {
      hue = (B - R) / d + 2;
    } else {
      hue = (R - G) / d + 4;
    }

    hue *= 60;
  }

  const H = (hue + (hue < 180 ? 25 : -25) + 360) % 360;
  const S = sat < 0.08 ? sat : Math.min(1, sat * 1.15 + 0.1);
  const c = (1 - Math.abs(2 * lightness - 1)) * S;
  const x = c * (1 - Math.abs(((H / 60) % 2) - 1));
  const m = lightness - c / 2;
  const [r1, g1, b1] =
    H < 60 ? [c, x, 0] : H < 120 ? [x, c, 0] : H < 180 ? [0, c, x] :
    H < 240 ? [0, x, c] : H < 300 ? [x, 0, c] : [c, 0, x];

  return (
    "#" +
    [r1, g1, b1]
      .map((v) => Math.round((v + m) * 255).toString(16).padStart(2, "0"))
      .join("")
  );
}

// The page sits on a near-black background, so very dark accents (mono,
// graphite, dark custom colours) are lifted until they stay visible here.
// On the light appearance the problem flips: pale accents are darkened.
// The PDF still uses the colour exactly as chosen.
export function uiAccent(hex, theme) {
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
