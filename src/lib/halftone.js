/* -------- The halftone under the skulls --------
   Under the skull artwork: the page's colour gradient and, over it, a
   field of dots in the accent colour, printed like a halftone: large
   and close where the gradient's colour is strongest, in the bottom
   corner at the start of the reading direction (with a weaker patch in
   the opposite top corner), shrinking to nothing towards the middle. In
   dark mode they glow on near black; in light mode they are a soft tint.

   Drawn once on a canvas, not animated, and drawn again only when the
   accent, the appearance, the reading direction or the window's size
   changes (while a custom colour is being dragged, once a frame at most).
   The gradient is painted here as well as in tokens.css (which shows
   until the canvas fades in), so the canvas alone is the whole background
   and can be saved as a wallpaper (wallpaper.js). */

const SPACING = 10; // between dot centres, in CSS pixels
// Kept faint, and the dots small, so the skulls on top keep their
// contrast: the halftone is texture behind them, not a second picture.
const ALPHA = { dark: 0.24, light: 0.14 };
const MAX_RADIUS = (SPACING / 2) * 0.7;

let started = false;

// [r, g, b] of any CSS colour the canvas understands.
function rgbOf(colour) {
  const context = document.createElement("canvas").getContext("2d");

  context.fillStyle = "#000";
  context.fillStyle = colour;

  const value = context.fillStyle;

  if (value.startsWith("#")) {
    return [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));
  }

  return value.match(/[\d.]+/g).slice(0, 3).map(Number);
}

// `percent` of `accent` in `base`, as color-mix(in srgb) does.
function mix(accent, base, percent) {
  return accent.map((value, i) => Math.round((value * percent + base[i] * (100 - percent)) / 100));
}

const css = ([r, g, b], alpha = 1) => `rgba(${r}, ${g}, ${b}, ${alpha})`;

// A radial-gradient(<rx> <ry> at <x> <y>, colour, transparent <stop>).
function glow(context, x, y, rx, ry, colour, stop, width, height) {
  const gradient = context.createRadialGradient(0, 0, 0, 0, 0, 1);

  gradient.addColorStop(0, css(colour));
  gradient.addColorStop(stop, css(colour, 0));
  context.save();
  context.translate(x, y);
  context.scale(rx, ry);
  context.fillStyle = gradient;
  context.fillRect(-x / rx, -y / ry, width / rx, height / ry);
  context.restore();
}

// The same gradient as the body's background in tokens.css.
function paintGradient(context, width, height, accent, theme, strong, weak) {
  const dark = theme === "dark";
  const base = dark ? [5, 5, 6] : [255, 255, 255];

  context.fillStyle = css(dark ? base : mix(accent, base, 3));
  context.fillRect(0, 0, width, height);
  glow(context, strong.x, strong.y, width * 1.2, height * 0.85, mix(accent, base, dark ? 17 : 13), 0.6, width, height);
  glow(context, weak.x, weak.y, width * 0.7, height * 0.55, mix(accent, base, dark ? 9 : 8), 0.7, width, height);
}

// 0 far from a corner, 1 in it: an eased fall-off over `reach` of the
// window's diagonal.
function strength(distance, reach) {
  const t = Math.min(1, Math.max(0, 1 - distance / reach));

  return t * t * (3 - 2 * t);
}

function draw(canvas) {
  const root = document.documentElement;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const context = canvas.getContext("2d");
  const accent = rgbOf(getComputedStyle(root).getPropertyValue("--accent").trim() || "#9f74bf");
  const theme = root.dataset.theme === "light" ? "light" : "dark";
  const rtl = root.dir === "rtl";
  const diagonal = Math.hypot(width, height);

  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  // The strong corner is the bottom one on the side reading starts from.
  const strong = { x: rtl ? width : 0, y: height };
  const weak = { x: rtl ? 0 : width, y: 0 };

  paintGradient(context, width, height, accent, theme, strong, weak);
  context.fillStyle = css(accent);
  context.globalAlpha = ALPHA[theme];
  const rowHeight = SPACING * 0.866; // rows offset by half a dot, as in print

  context.beginPath();

  for (let row = 0, y = 0; y <= height + SPACING; row++, y = row * rowHeight) {
    for (let x = row % 2 ? SPACING / 2 : 0; x <= width + SPACING; x += SPACING) {
      const t = Math.max(
        strength(Math.hypot(x - strong.x, y - strong.y), diagonal * 0.58),
        0.6 * strength(Math.hypot(x - weak.x, y - weak.y), diagonal * 0.36)
      );
      const radius = MAX_RADIUS * t;

      if (radius > 0.3) {
        context.moveTo(x + radius, y);
        context.arc(x, y, radius, 0, Math.PI * 2);
      }
    }
  }

  context.fill();
  context.globalAlpha = 1;
}

export function initHalftone() {
  const canvas = document.querySelector(".tone-field canvas");

  if (started || !canvas) {
    return;
  }

  started = true;

  let frame = 0;
  const redraw = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => draw(canvas));
  };

  draw(canvas);
  canvas.parentElement.classList.add("is-painted");

  // The accent is set on the root's style; appearance and direction are its
  // attributes.
  new MutationObserver(redraw).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["style", "data-theme", "dir"],
  });

  let timer = 0;

  window.addEventListener("resize", () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(redraw, 120);
  });
}
