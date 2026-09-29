/* -------- The halftone under the skulls --------
   Between the page's colour gradient (tokens.css) and the skull artwork,
   a field of dots in the accent colour, printed like a halftone: large
   and close where the gradient's colour is strongest, in the bottom
   corner at the start of the reading direction (with a weaker patch in
   the opposite top corner), shrinking to nothing towards the middle. In
   dark mode they glow on near black; in light mode they are a soft tint.

   Drawn once on a canvas, not animated, and drawn again only when the
   accent, the appearance, the reading direction or the window's size
   changes (while a custom colour is being dragged, once a frame at most). */

const SPACING = 10; // between dot centres, in CSS pixels
// Kept faint, and the dots small, so the skulls on top keep their
// contrast: the halftone is texture behind them, not a second picture.
const ALPHA = { dark: 0.24, light: 0.14 };
const MAX_RADIUS = (SPACING / 2) * 0.7;

let started = false;

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
  const accent = getComputedStyle(root).getPropertyValue("--accent").trim() || "#9f74bf";
  const theme = root.dataset.theme === "light" ? "light" : "dark";
  const rtl = root.dir === "rtl";
  const diagonal = Math.hypot(width, height);

  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);
  context.fillStyle = accent;
  context.globalAlpha = ALPHA[theme];

  // The strong corner is the bottom one on the side reading starts from.
  const strong = { x: rtl ? width : 0, y: height };
  const weak = { x: rtl ? 0 : width, y: 0 };
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
