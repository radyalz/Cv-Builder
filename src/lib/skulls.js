/* -------------------------------------------------------------------------
   Skull artwork
   Every piece of the skull is a still SVG image, rebuilt here whenever the
   accent changes because an image cannot read CSS variables. Nothing moves
   inside these images: the renderer below moves and fades them.

   Each tile is 100 x 130. The top 30 units are sky for the lightning; the
   skull sits below in the same 0..100 frame it was traced in.
   ---------------------------------------------------------------------- */


import { electricHue, mixHex } from "./colour";

function svgImage(defs, body) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 200">' +
    `<defs>${defs}</defs>${body}</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function skullParts(accent, light) {
  const { cranium, jaw } = skullPaths();

  // Socket centres in tile units. Kept local: this runs during start-up,
  // before any module-level constant further down would be initialised.
  const EYES = [
    [38, 67],
    [63, 67],
  ];
  const { bolt, veins1, veins2, veins3 } = boltPaths();

  // Bone is pale and only tinted by the accent; the eyes are a bright tint
  // of the accent and the lightning a sibling hue, so each part stands apart
  // without leaving the chosen colour.
  // On the light appearance pale bone would vanish into the page, so the
  // skull is drawn in deeper shades of the accent instead.
  const boneLight = light ? mixHex(accent, "#000000", 0.12) : mixHex(accent, "#fbf6f0", 0.84);
  const boneMid = light ? mixHex(accent, "#000000", 0.42) : mixHex(accent, "#9a908a", 0.58);
  const boneDark = light ? mixHex(accent, "#000000", 0.72) : mixHex(accent, "#1a1413", 0.66);
  const rim = light ? mixHex(accent, "#000000", 0.6) : mixHex(accent, "#ffffff", 0.4);
  const eyeHot = mixHex(accent, "#ffffff", 0.62);
  const flashTone = mixHex(accent, "#ffffff", 0.5);
  const spark = electricHue(accent, 0.62);
  const sparkHot = mixHex(spark, "#ffffff", 0.55);
  const sparkDeep = mixHex(spark, "#000000", 0.55);

  const boneDefs =
    '<linearGradient id="b" gradientUnits="userSpaceOnUse" x1="0" y1="6" x2="0" y2="96">' +
    `<stop offset="0" stop-color="${boneLight}"/>` +
    `<stop offset=".5" stop-color="${boneMid}"/>` +
    `<stop offset="1" stop-color="${boneDark}"/>` +
    "</linearGradient>" +
    '<filter id="h" x="-20%" y="-20%" width="140%" height="140%">' +
    '<feGaussianBlur stdDeviation="1.4"/></filter>';

  const bone = (d) =>
    '<g transform="translate(0 30)">' +
    `<path d="${d}" fill="none" stroke="${accent}" stroke-width="2.6" ` +
    'stroke-opacity=".4" stroke-linejoin="round" filter="url(#h)"/>' +
    `<path d="${d}" fill="url(#b)" stroke="${rim}" stroke-width=".35" stroke-opacity=".8"/>` +
    "</g>";

  // A four-point glint, like the stars in the concept's eye sockets.
  const star = (cx, cy, reach, girth) =>
    `<path fill="#ffffff" d="M${cx - reach} ${cy}L${cx} ${cy - girth}L${cx + reach} ${cy}L${cx} ${cy + girth}Z` +
    `M${cx} ${cy - reach}L${cx + girth} ${cy}L${cx} ${cy + reach}L${cx - girth} ${cy}Z"/>`;

  const glow = (id, core, mid) =>
    `<radialGradient id="${id}">` +
    '<stop offset="0" stop-color="#ffffff"/>' +
    `<stop offset="${core}" stop-color="#ffffff" stop-opacity=".95"/>` +
    `<stop offset="${mid}" stop-color="${eyeHot}" stop-opacity=".85"/>` +
    `<stop offset="1" stop-color="${accent}" stop-opacity="0"/>` +
    "</radialGradient>";

  const eyes = EYES.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="url(#e)"/>` + star(x, y, 7, 0.45)).join("");
  const flare = EYES.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="20" fill="url(#f)"/>` + star(x, y, 15, 0.7)).join("");

  const strike =
    '<linearGradient id="v" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="9">' +
    '<stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/></linearGradient>' +
    '<mask id="m"><rect width="100" height="130" fill="url(#v)"/></mask>' +
    '<filter id="g" x="-60%" y="-10%" width="220%" height="120%">' +
    '<feGaussianBlur stdDeviation=".9"/></filter>' +
    // a wide halo so the bolt lights the air around it while it strikes
    '<filter id="w" x="-160%" y="-20%" width="420%" height="140%">' +
    '<feGaussianBlur stdDeviation="2.6"/></filter>' +
    '<radialGradient id="i">' +
    '<stop offset="0" stop-color="#ffffff"/>' +
    `<stop offset=".3" stop-color="${sparkHot}" stop-opacity=".9"/>` +
    `<stop offset="1" stop-color="${spark}" stop-opacity="0"/>` +
    "</radialGradient>";

  // A coloured halo under a white-hot core, so the current reads against
  // pale bone as well as dark.
  const current = (d) =>
    svgImage(
      '<filter id="g" x="-40%" y="-40%" width="180%" height="180%">' +
        '<feGaussianBlur stdDeviation="1.1"/></filter>' +
        '<filter id="n" x="-30%" y="-30%" width="160%" height="160%">' +
        '<feGaussianBlur stdDeviation=".45"/></filter>' +
        '<filter id="w" x="-60%" y="-60%" width="220%" height="220%">' +
        '<feGaussianBlur stdDeviation="2"/></filter>',
      `<path d="${d}" fill="${spark}" filter="url(#w)" opacity=".7"/>` +
        `<path d="${d}" fill="${sparkDeep}" filter="url(#g)" opacity=".85"/>` +
        `<path d="${d}" fill="${spark}" filter="url(#g)"/>` +
        `<path d="${d}" fill="${sparkHot}" filter="url(#n)"/>` +
        `<path d="${d}" fill="#ffffff"/>`
    );

  return {
    veins1: current(veins1),
    veins2: current(veins2),
    veins3: current(veins3),
    cranium: svgImage(boneDefs, bone(cranium)),
    jaw: svgImage(boneDefs, bone(jaw)),
    flash: svgImage(
      '<filter id="h"><feGaussianBlur stdDeviation=".8"/></filter>',
      `<g transform="translate(0 30)"><path d="${cranium}" fill="${flashTone}" filter="url(#h)"/></g>`
    ),
    eyes: svgImage(glow("e", 0.18, 0.42), eyes),
    flare: svgImage(glow("f", 0.1, 0.3), flare),
    bolt: svgImage(
      strike,
      '<g mask="url(#m)">' +
        `<path d="${bolt}" fill="${spark}" filter="url(#w)"/>` +
        `<path d="${bolt}" fill="${sparkHot}" filter="url(#w)" opacity=".6"/>` +
        `<path d="${bolt}" fill="${spark}" filter="url(#g)"/>` +
        `<path d="${bolt}" fill="${sparkHot}" filter="url(#g)" opacity=".7"/>` +
        `<path d="${bolt}" fill="#ffffff"/>` +
        "</g>" +
        '<circle cx="50" cy="33.5" r="4.2" fill="url(#i)"/>'
    ),
  };
}

/* -------------------------------------------------------------------------
   Renderer
   The skulls are drawn on one canvas. Every skull on screen is in the same
   pose at any moment, so each frame composes that pose once, on a small
   offscreen canvas, from the still layer images above, then stamps it
   across the field in two brick-offset sets of rows. That is a handful of
   image draws per frame rather than a browser compositing a stack of
   full-screen layers, and it lets each skull grow and wiggle about its own
   centre when the lightning hits, which moving whole layers could not.

   The timings below are the old CSS keyframes, ported one for one:
   [percent of the cycle, value], with the CSS easing for each track.
   ---------------------------------------------------------------------- */

const TILE_W = 150; // one tile: 100 x 200 artwork units at 1.5 px each
const TILE_H = 300; // two rows; the second set of rows fills the gap
const SCALE = TILE_W / 100;
const CYCLE_MS = 6500; // strike, laugh and settle
const FLOW_MS = 70000; // one loop of the 45 degree drift
const BITE_PX = 6; // how far the jaw drops
const PAD = 30; // room around the pose for it to grow into
const PIVOT = { x: 50 * SCALE, y: 80 * SCALE }; // the middle of the skull

// Draw order, matching the old layer stack. "shake" parts jolt with the
// head, "bite" parts also drop with the jaw; the bolt stays where it lands.
const LAYERS = [
  ["cranium", "shake"],
  ["flash", "shake"],
  ["veins1", "shake"],
  ["veins2", "shake"],
  ["jaw", "bite"],
  ["veins3", "bite"],
  ["eyes", "shake"],
  ["flare", "shake"],
  ["bolt", "still"],
];

const TRACKS = {
  flash: { ease: "linear", keys: [[0, 0], [70, 0], [71.5, 0.55], [79, 0], [100, 0]] },
  veins1: { ease: "linear", keys: [[0, 0], [70.3, 0], [70.8, 1], [71.6, 0.35], [72.4, 1], [74, 0.8], [79, 0], [100, 0]] },
  veins2: { ease: "linear", keys: [[0, 0], [71.2, 0], [71.8, 1], [72.6, 0.4], [73.4, 1], [75.5, 0.75], [81, 0], [100, 0]] },
  veins3: { ease: "linear", keys: [[0, 0], [72.2, 0], [72.8, 1], [73.6, 0.4], [74.4, 1], [77, 0.7], [83, 0], [100, 0]] },
  eyes: {
    ease: "ease-in-out",
    keys: [
      [0, 0.3], [18, 0.3], [20, 0.55], [22.5, 0.38], [25, 0.55], [27.5, 0.38], [30, 0.55],
      [32.5, 0.38], [35, 0.55], [37.5, 0.38], [40, 0.55], [42.5, 0.38], [48, 0.34], [70, 0.32],
      [72.5, 1], [86, 1], [97, 0.3], [100, 0.3],
    ],
  },
  flare: { ease: "ease-out", keys: [[0, 0], [70, 0], [73, 1], [85, 0.65], [96, 0], [100, 0]] },
  bolt: { ease: "linear", keys: [[0, 0], [69, 0], [70, 1], [71, 0.15], [72, 1], [75, 0.85], [81, 0], [100, 0]] },
  // the head bobs with each laugh, then jolts when the bolt lands
  shakeX: {
    ease: "linear",
    keys: [[0, 0], [70.4, 0], [71, -2], [71.6, 2], [72.2, -1.6], [72.8, 1.4], [73.4, -1], [74, 0.7], [74.6, -0.3], [75.2, 0], [100, 0]],
  },
  shakeY: {
    ease: "linear",
    keys: [
      [0, 0], [18, 0], [20, -1.2], [22.5, 0], [25, -1.2], [27.5, 0], [30, -1], [32.5, 0], [35, -0.8],
      [37.5, 0], [40, -0.6], [42.5, 0], [45, -0.4], [48, 0], [70.4, 0], [71, 1], [71.6, -1], [72.2, -1],
      [72.8, 1], [73.4, 0.5], [74, -0.5], [74.6, 0], [75.2, 0], [100, 0],
    ],
  },
  // a run of laughing bites that tails off, then the bolt wrenches it open
  bite: {
    ease: "ease-in-out",
    keys: [
      [0, 0], [18, 0], [20, 0.7], [22.5, 0.12], [25, 0.72], [27.5, 0.12], [30, 0.62], [32.5, 0.1],
      [35, 0.52], [37.5, 0.08], [40, 0.4], [42.5, 0.06], [45, 0.26], [48, 0], [70, 0], [73.5, 1],
      [86, 1], [95, 0], [100, 0],
    ],
  },
};

// The strike's grow and wiggle: the skull swells about 6% and rocks a few
// degrees, three times, fading out, starting as the bolt lands.
const WIGGLE_FROM = 70.5;
const WIGGLE_TO = 80;

function wiggle(percent) {
  if (percent < WIGGLE_FROM || percent > WIGGLE_TO) {
    return { scale: 1, turn: 0 };
  }

  const p = (percent - WIGGLE_FROM) / (WIGGLE_TO - WIGGLE_FROM);
  const swell = Math.sin(Math.PI * Math.min(1, p * 1.6)) * (1 - p * 0.35);
  const rock = Math.sin(p * Math.PI * 6) * (1 - p);

  return { scale: 1 + 0.06 * Math.max(0, swell), turn: (3.2 * rock * Math.PI) / 180 };
}

function bezier(x1, y1, x2, y2) {
  const at = (t, a, b) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;

  return (x) => {
    let low = 0;
    let high = 1;

    for (let step = 0; step < 20; step++) {
      const mid = (low + high) / 2;

      if (at(mid, x1, x2) < x) {
        low = mid;
      } else {
        high = mid;
      }
    }

    return at((low + high) / 2, y1, y2);
  };
}

const EASE = {
  linear: (x) => x,
  "ease-in-out": bezier(0.42, 0, 0.58, 1),
  "ease-out": bezier(0, 0, 0.58, 1),
};

function sample({ ease, keys }, percent) {
  for (let index = 1; index < keys.length; index++) {
    const [to, value] = keys[index];

    if (percent <= to) {
      const [from, start] = keys[index - 1];
      const local = to === from ? 1 : (percent - from) / (to - from);

      return start + (value - start) * EASE[ease](local);
    }
  }

  return keys[keys.length - 1][1];
}

const state = {
  field: null,
  canvas: null,
  context: null,
  pose: null,
  poseContext: null,
  images: null,
  painted: "",
  frame: 0,
  started: 0,
  // reasons the animation is stopped: "hidden", "covered"…
  pauses: new Set(),
  still: false,
  fixedAt: null, // a fixed point in the cycle, for testing (?pose=72)
  last: null, // the accent and appearance last painted
  width: 0,
  height: 0,
  ratio: 1,
  // frame pacing: 0 = every display frame, otherwise the minimum gap in ms
  minGap: 0,
  lastDraw: 0,
};

function rasterise(url, ratio) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");

      canvas.width = Math.round(TILE_W * ratio);
      canvas.height = Math.round(TILE_H * ratio);
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas);
    };

    image.onerror = reject;
    image.src = url;
  });
}

function resize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;

  state.width = width;
  state.height = height;
  state.canvas.width = Math.round(width * ratio);
  state.canvas.height = Math.round(height * ratio);
  state.canvas.style.width = `${width}px`;
  state.canvas.style.height = `${height}px`;

  // The images are rasterised for the screen's density, so a change of
  // density (moving the window between monitors) repaints them.
  if (ratio !== state.ratio) {
    state.ratio = ratio;
    state.painted = "";
  }
}

function composePose(percent) {
  const { poseContext: ctx, images, ratio } = state;
  const { scale, turn } = wiggle(percent);
  const shakeX = sample(TRACKS.shakeX, percent);
  const shakeY = sample(TRACKS.shakeY, percent);
  const bite = sample(TRACKS.bite, percent) * BITE_PX;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, state.pose.width, state.pose.height);

  for (const [name, group] of LAYERS) {
    const alpha = TRACKS[name] ? sample(TRACKS[name], percent) : 1;

    if (alpha <= 0.005) {
      continue;
    }

    ctx.setTransform(ratio, 0, 0, ratio, PAD * ratio, PAD * ratio);

    if (group !== "still") {
      ctx.translate(PIVOT.x + shakeX, PIVOT.y + shakeY);
      ctx.rotate(turn);
      ctx.scale(scale, scale);
      ctx.translate(-PIVOT.x, -PIVOT.y + (group === "bite" ? bite : 0));
    }

    ctx.globalAlpha = alpha;
    ctx.drawImage(images[name], 0, 0, TILE_W, TILE_H);
  }

  ctx.globalAlpha = 1;
}

// Stamps the pose over the screen for one set of rows. `x` and `y` are the
// set's current offset; tiles repeat every TILE_W x TILE_H.
function stampSet(x, y) {
  const { context: ctx, pose, ratio } = state;
  const startX = (((x % TILE_W) + TILE_W) % TILE_W) - TILE_W - PAD;
  const startY = (((y % TILE_H) + TILE_H) % TILE_H) - TILE_H - PAD;
  const width = pose.width / ratio;
  const height = pose.height / ratio;

  for (let top = startY; top < state.height + PAD; top += TILE_H) {
    for (let left = startX; left < state.width + PAD; left += TILE_W) {
      ctx.drawImage(pose, left, top, width, height);
    }
  }
}

function draw(now) {
  const elapsed = state.still ? 0 : now - state.started;
  const percent = state.fixedAt ?? ((elapsed % CYCLE_MS) / CYCLE_MS) * 100;
  const flow = state.still ? 0 : (elapsed % FLOW_MS) / FLOW_MS;
  const { context: ctx, ratio } = state;

  composePose(percent);

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, state.width, state.height);

  // Set A slides right and set B left while the field as a whole drifts
  // down-right at 45 degrees: per loop A moves (5w, 2r) and B (-w, 2r).
  stampSet(TILE_W * 5 * flow, TILE_H * flow);
  stampSet(TILE_W / 2 - TILE_W * flow, TILE_H / 2 + TILE_H * flow);
}

function loop(now) {
  state.frame = 0;

  if (state.pauses.size || !state.images) {
    return;
  }

  state.frame = requestAnimationFrame(loop);

  if (state.minGap && now - state.lastDraw < state.minGap) {
    return;
  }

  const gap = now - state.lastDraw;

  state.lastDraw = now;
  draw(now);
  watchPace(gap);
}

function run() {
  // With reduced motion the field is drawn once, at rest, and left still.
  if (state.still) {
    if (state.images) {
      draw(performance.now());
    }

    return;
  }

  if (!state.frame && !state.pauses.size && state.images) {
    state.frame = requestAnimationFrame(loop);
  }
}

/* -------- Keeping it light --------
   The animation stops whenever nobody can see it: a hidden tab, or the
   preview grown over the page. On a device that cannot keep up it steps
   down instead of stuttering: first to 30 frames a second, then, if even
   that struggles, the glass card drops its live blur for the flat frosted
   fallback (data-glass="flat" on <html>), which is where most of the cost
   is. `?quality=full|lite|flat` in the address forces a level for testing. */

const pace = { samples: [], level: 0, fixed: false };
const LEVELS = ["full", "lite", "flat"];

const blurs = () =>
  CSS.supports("backdrop-filter", "blur(1px)") || CSS.supports("-webkit-backdrop-filter", "blur(1px)");

function setLevel(level) {
  pace.level = level;
  state.minGap = level >= 1 ? 1000 / 30 - 2 : 0;
  document.documentElement.dataset.quality = LEVELS[level];

  if (level >= 2 || !blurs()) {
    document.documentElement.dataset.glass = "flat";
  }
}

function watchPace(gap) {
  if (pace.fixed || pace.level >= 2 || document.hidden || gap > 1000) {
    return;
  }

  pace.samples.push(gap);

  // Judge on a second and a half of frames, after the first few settle.
  if (pace.samples.length < 100) {
    return;
  }

  const sorted = pace.samples.slice(10).sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const slow = sorted.filter((value) => value > 34).length / sorted.length;

  pace.samples = [];

  const struggling = pace.level === 0 ? median > 22 || slow > 0.2 : median > 45 || slow > 0.3;

  if (struggling) {
    setLevel(pace.level + 1);
  } else {
    pace.fixed = true; // this device copes; stop measuring
  }
}

// Stops or restarts the animation for one reason; it only runs again once
// every reason has been lifted.
export function setSkullsPaused(reason, paused) {
  if (paused) {
    state.pauses.add(reason);
    return;
  }

  state.pauses.delete(reason);
  state.lastDraw = performance.now();
  run();
}

// Paints the field in the given accent: the layer images are rebuilt (they
// are still images, so they cannot follow a CSS variable) and the next
// frame uses them. The old ones stay on screen until the new ones are ready.
// Recently used accents keep their drawn layers, so switching back is
// instant; clicking through colours quickly only draws the last one.
const artCache = new Map();
const ART_CACHE_SIZE = 8;
const PAINT_SETTLE_MS = 90;
let paintTimer = null;

function useImages(key, images) {
  state.images = images;

  if (state.still || state.pauses.size) {
    draw(performance.now());
  }

  state.field.classList.add("is-painted");
  run();
}

export function paintSkulls(accent, theme) {
  initSkulls();
  state.last = [accent, theme];

  const key = `${accent}|${theme}|${state.ratio}`;

  if (!state.canvas || key === state.painted) {
    return;
  }

  state.painted = key;
  window.clearTimeout(paintTimer);

  const kept = artCache.get(key);

  if (kept) {
    // Most recent last, so the oldest is the one dropped.
    artCache.delete(key);
    artCache.set(key, kept);
    useImages(key, kept);
    return;
  }

  // The first paint happens at once; later ones wait for the clicking to
  // settle, and are dropped if another colour comes in meanwhile.
  const delay = state.images ? PAINT_SETTLE_MS : 0;

  paintTimer = window.setTimeout(async () => {
    const parts = skullParts(accent, theme === "light");
    const names = Object.keys(parts);
    const drawn = await Promise.all(names.map((name) => rasterise(parts[name], state.ratio)));
    const images = Object.fromEntries(names.map((name, index) => [name, drawn[index]]));

    artCache.set(key, images);

    if (artCache.size > ART_CACHE_SIZE) {
      artCache.delete(artCache.keys().next().value);
    }

    if (state.painted === key) {
      useImages(key, images);
    }
  }, delay);
}

export function initSkulls() {
  const field = document.querySelector(".skull-field");

  if (!field || state.field === field) {
    return;
  }

  state.field = field;
  state.canvas = field.querySelector("canvas");
  state.context = state.canvas.getContext("2d");
  state.pose = document.createElement("canvas");
  state.poseContext = state.pose.getContext("2d");
  state.started = performance.now();

  const sizePose = () => {
    state.pose.width = Math.round((TILE_W + PAD * 2) * state.ratio);
    state.pose.height = Math.round((TILE_H + PAD * 2) * state.ratio);
  };

  resize();
  sizePose();

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

  state.still = motion.matches;
  motion.addEventListener("change", () => {
    state.still = motion.matches || state.fixedAt !== null;
    run();
  });

  const params = new URLSearchParams(location.search);
  const forced = params.get("quality");

  if (params.has("pose")) {
    state.fixedAt = Math.min(100, Math.max(0, Number(params.get("pose")) || 0));
    state.still = true;
  }

  if (LEVELS.includes(forced)) {
    setLevel(LEVELS.indexOf(forced));
    pace.fixed = true;
  }

  window.addEventListener("resize", () => {
    const before = state.ratio;

    resize();
    sizePose();

    if (state.ratio !== before && state.last) {
      paintSkulls(...state.last);
    } else if (state.images) {
      draw(performance.now());
    }
  });

  // A page change replaces the <html> attributes; put the level back.
  document.addEventListener("astro:after-swap", () => setLevel(pace.level));

  document.addEventListener("visibilitychange", () => {
    setSkullsPaused("hidden", document.hidden);
  });
}

// Generated from the concept art trace. A function declaration, so it is
// hoisted and the long path data can stay at the bottom of the file.
function skullPaths() {
  return {
    cranium:
      "m50.2 1.2c-.4.5-.2.9.3.5 .3-.3.5-.3.7 0 .3.5-.2 1-1 .9-.5 0-.7.1-.7.6 0 .4-.2 1.1-.5 1.7-.4.5-.7 1.4-.8 1.9-.2 1-1.5 1.7-4.1 2.3-.9.3-2.6.9-3.8 1.4-1.4.7-2.4.9-2.8.8-.6-.2-.7-.1-.6.3 .2.3-.3 1-1.5 2.1-1.8 1.6-2.6 1.9-2 .8 .5-.8.5-.9-.3-1.6-.9-.9-.6-2.2.5-2.7 1.1-.5 1.2-2.2.2-2.8-.5-.3-.7-.7-.7-1.5 0-1.1-.1-1.2-.7-.8-.8.4-.8 1 .2 1.9 1.1 1.1 1.1 2.3 0 2.9-.9.4-1.2 2.4-.4 3.6 .3.5.3.8-.1 1.4-.3.6-.3.8 0 .9 .5.2-.2 1.4-.9 1.4-.6 0-.6-.1-.1-1.1 .3-.7.3-.7-.3 0-.7.8-1.4 1-1.4.4 0-.2-.2-.1-.5.2-.5.8-.1 1.3.8.9 .3-.1.4 0 .3.2-.1.2-.3.9-.4 1.7-.2 1.7-1.1 3.2-1.8 2.9-.3-.1-.4-.5-.2-.9 .1-.6.1-.7-.3-.3-.5.5-.6 2.2-.2 2.5 .4.2.1 1-.4 1-.2 0-.3-.3-.1-.6 .1-.3 0-.5-.4-.5-.2 0-.6.4-.7.9-.2 1-.5 1-1.7.1-.5-.4-1.1-.6-1.4-.5-.9.3-2.8-.7-2.6-1.3 .1-.3-.1-.9-.4-1.5-.4-.5-.8-1.2-1.1-1.7-.3-.8-.3-.8-.4.7 0 1 .2 1.6.5 1.8 .2.1.5.7.6 1.3 .3 1 .4 1.3 1.1 1.3 .4 0 .9.1 1 .3 .1.2.5.3.9.3 .7 0 1.6 1.2 1.6 2.3 0 .4.3.8.6.9 .5.2.5.6.4 2.2-.1 1.2-.1 2.1.1 2.2 1.1.7 1.7 4.4.9 5.2-.3.3-.2.5.2 1 .4.5.5 1 .4 1.7-.2.8-.1 1.3.5 2 .4.5.7 1 .7 1.2 0 .7.9 1.2 1.8 1 1-.2 1-1.3 0-2.5-.3-.2-.5-1-.5-1.6 0-.6-.1-1-.3-1-.2 0-.4.4-.4 1 0 .5-.1 1-.3 1-.2 0-.3-.5-.3-1.1 0-.6-.1-1.7-.3-2.5-.2-1.2-.1-1.3.4-.8 .5.4.6.4.9 0 .3-.5.2-.6-.8-2.2-.5-.7-.6-1-.3-1.1 .2-.1.4-.3.4-.5 0-.2-.2-.3-.5-.1-.6.2-.8-1-.2-1.3 .2-.1.4-.6.4-1.1 0-.4.1-1.1.3-1.5 .2-.4.5-1 .7-1.3 .1-.4.4-1.6.5-2.6 .2-1.6.4-1.9.9-1.7 .7.2.8.1 1.1-1.6 .1-.9.1-1.2-.1-1.1-.2.1-.4.1-.4-.1 0-.2.1-.4.3-.4 .1 0 .7-.6 1.3-1.4 1.4-1.8 2.4-2.4 3-1.9 .3.2.4.1.6-.5 .2-.7.5-1 1.3-1.1 .6-.1.9-.4.8-.6-.1-.3 0-.6.2-.9 .2-.2.3-.4.1-.6-.1-.1-.5.1-.9.6-1.7 1.9-4.1 3.4-3.1 1.9 .2-.4.4-.9.2-1-.1-.2-.1-.2.2-.1 .2.1.9-.2 1.5-.7 2.3-2 4.5-3.2 2.9-1.5-.3.3-.3.4 0 .4 .4 0 1-.9 1-1.5 0-.2.2-.4.4-.5 .2 0 .2.1.1.4-.2.7.4.8.9.1 .3-.3.7-.5.9-.5 .3 0 .7-.3 1-.5 .3-.3.7-.5.9-.5 .3 0 .3.1 0 .2-.2.1-.4.3-.3.4 .2.2.5.3.7.1 .3-.1.5 0 .5.2 0 .2-.2.4-.4.4-1.1.1-1.8.4-2.4 1.1-.4.4-.5.6-.3.5 .7-.4.8.3.2.9-.9.7-1.1 3.1-.3 2.8 .3-.1.5 0 .5.1 0 .2-.2.4-.4.5-.3.1-.3.3 0 .8 .6 1 .5 1.1-.2 1.1-.4 0-.7-.3-.8-.7-.1-.4-.1-.7.1-.7 .2 0 .3-.1.3-.3 0-.2-.2-.3-.5-.3-.5 0-.6-.4-.5-1.3 0-.2-.1-.4-.3-.4-.2 0-.4.2-.4.5 0 .2-.1.5-.3.5-.1 0-.4.2-.5.5-.1.3 0 .4.6.2 .7-.2.6 1.9-.2 2.4-.3.2-.3.3 0 .3 .2 0 .4.2.4.4 0 .6.9 1 1.2.6 .1-.2.1-.5 0-.7-.3-.5.8-.8 1.3-.4 .3.3.3.4 0 .4-.3 0-.4.4-.4.8 0 .4-.4 1-.8 1.3l-.7.5 .9.6c.9.6 1.3 1.9.6 1.9-.2 0-.4.2-.4.4 0 .3-.1.6-.3.7-.2.2-.3 0-.1-.3 .1-.4.1-.5-.2-.3-.3.1-.6 0-.8-.2-.2-.4-.3-.4-.3 0 0 .9-1.3 1.8-1.6 1.2-.3-.5-.3-.5-.5 0-.2.4-.1.7.2.9 .3.2.2.3-.2.3-.5 0-.7.3-.6 1.1 0 .1-.3.2-.7.2-.3 0-.6.2-.6.4 0 .6-1.4 1.1-1.8.6-.1-.2-.3-.4-.4-.3-2.4 3.1-1.8 4.4.9 2 .5-.4 3.2-1.4 6.4-2.2 .3-.1.6-.4.6-.6 0-.3-.3-.7-.6-.9-.5-.3-.5-.3.2-.3 .4 0 .8-.2.8-.4 0-.2-.2-.3-.4-.3-.2 0-.2-.3.1-.6 .6-1.1.9-.6.7 1.2-.1 1.9.1 2.8.8 2.5 .3-.1.4.1.4.6 0 1 .2.8.5-.4 .2-.8.1-.9-.5-.9-.5 0-.6-.3-.6-.9 0-1 .4-1.3 1.6-1 .7.2.8.3.4.5-.3.2-.4.3-.1.3 .2 0 .4.2.4.5 0 .4 2.1 1.4 2.3 1.1 .3-.3-.7-1.2-1.3-1.2-.4 0-.6-.3-.6-.7 0-1 .4-.8 3 .9 1.3.8 2.6 1.5 2.8 1.5 .3 0 .7.1.8.4 .2.2 0 .3-.5.2-1-.3-1.4.5-1.5 2.7 0 1-.9 1.3-.9.2 0-.5-.1-.8-.4-.8-.1 0-.3.7-.3 1.6 0 1.9-1.1 5.5-1.5 4.8-.1-.2.1-1 .5-1.7 1-2 .8-2.4-.3-.6-1.6 2.4-5.4 4.2-5.4 2.5 0-.5.1-.9.3-.9 .1 0 .4-.4.5-.8 .1-.5.5-.9.8-1 .9-.3.9-.6 0-1.2-.3-.2-.6-.6-.6-.9 0-.2-.3-.5-.7-.5-.7 0-1.1-.4-1.6-1.8-.4-1-.4-1-.4-.2 0 .8-1.4 2.6-1.4 1.8 0-.1-.2.1-.4.5-.4.8-.8 1.1-2.1 1.6-.6.3-.6.3.2.4 1.9.3 4.1 3.7 2.2 3.6-.5-.1-.8 0-.7.2 .1.2.4.3.8.3 .3 0 .6.3.6.6 0 .3-.1.4-.4.2-.1-.2-.8-.3-1.4-.2-1.1.2-1.4.1-1.9-.6-.3-.4-.6-.6-.6-.4 0 2.2-1.6-1.4-1.8-4.1-.1-1.3-.2-1.7-.7-1.7-.6-.1-.6-.1-.2 1 .2.5.2 1.2 0 1.6-.3.7-.3.6-.3-.4 0-1.9-.4-.9-.6 1.4 0 1.2 0 1.9.1 1.5 .3-.8.8-.7.8.3 0 .4.2.9.5 1.2 .3.2.5.6.5.8 0 .3.4.4 1 .3 1.4-.2 2.4.1 1.7.6-.4.2-.2.3.5.3 .6 0 1.2-.2 1.5-.4 .4-.4.5-.3.8 1.3 .1.3.2.1.1-.5 0-.9.1-1.2.6-1.3 .8-.1 1 .5.4.8-.3.2-.4.6-.3.9 .3.7 1.1-.1 1.1-1.1 0-.6 1.4-1.1 3.5-1 .7 0 .9-.2.9-.6-.1-.5 1.6-1.4 1.9-1 .2.1-.5 3-.8 3.2-.4.4-1.1 2.2-.7 1.9 .3-.2.3-.1.2.4-.1.4 0 1.1.3 1.4 .7 1 1.3 2.7.8 2.2-.5-.5-1.7-.6-1.7-.2 0 .5-1.2 1.8-1.4 1.5-.2-.1-.1-.3.2-.5 .6-.5.9-2 .6-2.6-.3-.4-.4-.4-.6.2-.3 1.1-.7 1.7-1.1 1.6-.2-.1-.4.5-.4 1.3 0 .8-.1 1.8-.2 2.2-.3 1.4 1 .8 1.5-.6l.4-1.1-.2 1c-.1.8 0 1.2.5 1.3 .6.3 1.4-.4 1.4-1.2 0-.4.2-.6.4-.6 .2 0 .3.3.1.8-.1.6-.1.8.3.6 .6-.2.6.1-.1 2.2-.2.7-.3 1.3-.2 1.4 .1.1.2 0 .2-.2 0-.3.3-.4.6-.4 .4 0 .4.1-.3.8-1.1 1.2-1.4 1-1.2-.5 .2-1.7-.3-2.4-.9-1.5-.3.3-.4.7-.3.8 .1.1.3.6.3 1.2 .1.7 0 .9-.2.5-.1-.2-.4-.3-.4-.1-.2.1-.2.1-.1-.2 .3-1-.6-2.3-1.1-1.6-.4.6-.5.7-.8.2-.3-.4-.3-.4-.3 0 0 .4-.1.5-.4 0-.6-1-1.1.1-.8 2.1 .2 1.7.1 2-.4 2.2-.4.1-.9.5-1.2.9-.7.9-1.4.6-2-.8-.7-1.5-2.3-.9-1.8.7 .2.7.8.9.8.3 0-.7.5.1.9 1 .2.8.2.8-.3.4-.5-.3-.5-.2-.2 1 .4 1.4 2 2 2.4.9 .1-.3.2-.3.2 0 0 .2.2.4.4.4 .2 0 .3-.3.2-.6-.2-.4-.1-.7.1-.7 .3 0 .5.3.6.7 .1.3.3.6.5.6 .4 0 .3-.8-.2-1.5-.6-.8-.7-2.4-.1-2.8 .3-.1.6-.6.6-1 .2-1.1 1-1.4 1-.3 0 .4.2 1 .5 1.2 .3.3.5 1.2.5 2.5l.1 2.1 .2-1.9c.2-1 .2-1.9.1-2 0-.2.1-.9.3-1.6 .5-1.5.9-1 1.3 1.7 .2 1.2.3 1.4.3.7 .1-2.2 1.3-4.9 2.1-4.7 .3.1.9-.1 1.3-.6 .5-.5 1-.8 1.1-.7 .4.3.4.8-.1.8-.2-.1-.4 0-.5.2-.1.4 2.3 1.7 2.6 1.2 .1-.1.7-.2 1.3-.2 .5 0 1.1 0 1.1-.2 0-.1.4-.2 1-.2 1.6 0 1.8-.5 1.3-2.6l-.6-1.8 .9.3c.6.1.9.4.8.8 0 .4-.1 1.4-.1 2.3 0 1.1-.1 1.5-.4 1.4-.2-.2-.3.1-.1 1.1 .1.7.2 1.5.2 1.7 0 .9.6.1.8-1.2 .4-2.1 1.2-.5 1.3 2.4 0 2.4 0 2.4.3.7 .3-2.7 2-5.5 2-3.3 0 .4.3.9.7 1.1 .4.3.6.8.6 1.6 0 .7.3 1.6.6 1.9 .4.4.4.6.2.5-.2-.2-.4-.1-.4.1 0 .5 1.4.4 2-.1 .3-.3.4-.3.2 0-.1.3-.1.4.2.4 .7 0 2.1-4.6 1.6-5.2-.5-.6-1.2-.3-1.6.9-.8 2.3-3.6 0-3.3-2.8 .2-2-.2-3.2-.8-2.3-.2.3-.3.3-.3 0 0-.6-.7-.4-.8.2 0 .5-.1.4-.3-.2-.3-.9-1-.6-1 .4 0 .6-.1.5-.5-.4-.6-1.6-.6-1.8.1-1.7 .3.1.7 0 .8 0 .6-.2 1.3-.2 1.3.1 0 .2.3.2.7.1 .4-.1.7 0 .7.2 0 .2.3.1.6-.2 .5-.5.6-1 .5-1.5-.2-.8-1.1-.7-1.2.2 0 .4-.1.3-.3-.2-.5-1.2.4-3.5 1.8-4.8 .8-.8 1-1 .5-1-.3 0-.7-.2-.8-.5-.2-.4-.3-.5-.7-.1-.2.2-.3.5-.2.7 .1.1-.1.4-.5.5-.7.1-.9.5-.8 1.1 0 .2-.2.3-.5.3-.4 0-.5.2-.3.6 .1.4-.1.3-.5-.2-.7-.9-1-3.8-.3-3.8 .2 0 .3-.3.3-.7 0-.5.2-1 .4-1.2 .3-.3.3-.4-.1-.4-.8 0-1.7.5-1.7.8 0 .2-.2.6-.4.9-.2.4-.3.4-.1-.1 .1-.3 0-.6-.2-.7-.3-.1-.3-.3 0-.5 .4-.3.4-.5 0-.9-.4-.3-.6-.7-.6-.9 0-.4.6-.4.8 0 .1.2.9.4 1.6.5 .8.2 1.8.6 2.3 1.1 1.2 1.1 1.6 1 1.4-.3 0-.2.1-.3.2-.3 .2 0 .4.5.4 1.1 0 1.4.4 1.6.6.4 .3-1.3.5-1.4 2.4-.4 1.8.8 1.8 1.2.2 1.5-1.1.2-1.2.3-.7.6 .4.3.6.7.6 1 0 .3.5.7 1.2.9 .6.3 1.2.6 1.2.8 0 .1.3.2.7.1 .5-.2.6-.2.4 0-.3.3-.2.6.4 1.2 .5.5 1.2 1.6 1.5 2.4 .4.8.7 1.4.7 1.3 0-.2.1-.5.1-.9 .1-.4.4-1.3.6-2.1 .5-1.7.3-2.1-.9-1.3-1.2.8-2.4.2-1.4-.8 .2-.2.4-.5.4-.7 .1-.2.1-.4.1-.5 0-.2.4 0 .9.3 .8.5 1.2-1.3.3-1.9-.3-.3.7-1.3 1.3-1.3 .4 0 .3.8-.1 1.2-.2.3-.1.6.3 1 .6.5.7.5.7-.4 0-1.3-.6-3-1.1-3.3-.3-.1-.5-.5-.5-1 0-.5-.2-.8-.4-.7-.2.1-.2.4-.1.7 .1.2-.1.5-.4.6-.7.3-1.4-.1-.8-.4 .3-.3.3-.5 0-1.4-.3-.6-.5-1.5-.5-2-.2-1.9-.6-4.4-.8-4.4-.8 0-1.1.8-1.2 2.7-.1 2.1-1.2 4.7-1.5 3.7-.1-.2-.5-.1-1.1.4-1.1.7-2.4.6-2.3-.2 .1-.2-.2-.3-.5-.3-.3.1-.6-.1-.6-.3 0-.7.7-1.2 1.3-1 .3.1.4 0 .3-.2-.4-.6.6-2 1.5-2.2 .8-.1.8-.1-.1-.5-.6-.2-1.1-.8-1.3-1.2-.3-.5-.8-.9-1.2-1-.6-.2-.9-.6-1.1-1.7l-.3-1.4-.1 1.2c0 1.2-2.5 4-3.5 4-.8 0-.7.6.2.8 .5.1 1 .6 1.2 1.1 .2.4.5.8.7.8 .2 0 .4.4.5.9 .1.8.1.9-1 .7-2.5-.4-5.2-3-5.2-5 0-.6-.1-.7-.3-.4-.2.4-.3.4-.5 0-.1-.2 0-.7.2-.9 .4-.8.3-1.4-.3-1.4-.2 0-.4.2-.3.3 .3.5-.1 1.5-.6 1.2-.1-.1-.2-.6-.1-1.2 .2-.6.1-.9-.1-.9-.2 0-.4.1-.4.4 0 1.3-.3-.4-.6-2.7-.2-2.2-.1-2.8.2-2.8 .3 0 .4.4.3 1.3-.2 1.3.2 1.8.6 1.1 .3-.5 2.2-1.4 3-1.4 .3 0 .8-.2 1.1-.5 .5-.5.5-.5.7 0 .1.3.4.5.7.5 .3 0 .5.3.5.8 0 1.3.6 1.8 1.2 1.1 .6-.7.6-.7 2.5-.1 1 .3 2.3.6 3 .7 .5 0 1 .1 1 .2 0 .2.5.5 1.1.7 .6.3 1.3.9 1.7 1.5 .5.8.6.9.8.4 .3-.8-.1-2.1-1.1-3.3-1.7-2-1.2-7.1.6-6.6 .5.2.7.1.7-1 0-1.8.2-1.3.6 1.1 .2 1.7.2 2.3-.2 2.8-.3.4-.4.9-.3 1 .1.2 0 .4-.3.4-.6 0-1 1-.5 1.4 .4.2.4.3 0 .5-.3.3-.3.4.1.8 .5.3.6.3.6-.3 0-.4.1-.7.3-.7 .2 0 .2.2.1.5-.2.6-.2.6.3.2 .4-.3.5-.6.2-1.3-.3-1.1-.4-1 .2-1.2 .3-.2.4 0 .3.6-.1.5 0 .9.5 1.2 .9.5 1 1.3.2 1.3-.2 0-.5.2-.5.5 0 .3-.1.5-.3.5-.2 0-.3.3-.3.5 0 .3.1.5.3.5 .2 0 .3.3.2.6-.1.5 0 .4.5-.2 .3-.4.7-1.1.7-1.5l0-.7 .5.7c.5.8.2 2.3-.7 3-.3.2-.6 1.2-.7 2.2-.1 1.4-.1 1.7.3 1.4 .2-.2.6-.3.7-.2 .1.2.3-.1.4-.5 .1-.4.3-.6.5-.5 .5.3.3 1.3-.4 2.1-.9 1-.8 1.2.7 1.3 1.1 0 1.3-.1 1.5-.7 .3-1.2.2-1.9-.2-1.8-.8.1-.3-3.2.4-3.8 .4-.2.7-.8.7-1.2 0-.5.3-1.1.7-1.5 .5-.4 1.1-1 1.4-1.3 .5-.4.8-.5 1.6-.2 1.3.5 1.4-.2.2-.9-.7-.3-1.1-.3-1.9 0-2 .7-2.3.1-.8-1.5 .9-.9.7-1.1-.5-.3-.7.5-.7.5-.7 0 0-.3-.1-.5-.3-.5-.1.1-.6-.3-1.1-.8l-1-.9 .9 0c.5 0 .8-.2.8-.6 0-.3-.2-.4-.6-.3-.3.1-.7.3-.9.3-.2 0-1.1-1.5-2.1-3.3-1.7-3.3-2.1-4.5-1.5-4.1 .2.1.2-.1.1-.5-.1-.5 0-.7.6-.7 .8 0 1.8-1.3 1.6-2.2-.4-1.9.8-2.7 4.8-3.3l2.6-.4 .1-1.2c0-.6.2-1.3.4-1.4 .4-.5.4-3-.1-2.7-.2.1-.3.6-.2 1 .5 2.6-2 4.7-4.2 3.6-.9-.5-1.1-.5-1.9.1-.5.4-1.2.7-1.6.8-.5.2-.6.5-.6 1 .1.4-.1 1.1-.4 1.4-.2.4-.3 1-.2 1.4 .1.6 0 .7-1.2.5-1.1-.1-1.5-.1-1.5.3 0 .8-.4.6-2.4-1.4-1.1-1-3-2.3-4.3-2.9-1.2-.6-2.3-1.2-2.3-1.4-.1-.2-.7-.3-1.3-.3-.6 0-1.2-.1-1.3-.3-.1-.2-.6-.3-1.1-.3-.4 0-1-.2-1.4-.3-.3-.2-.8-.4-1.1-.5-.4-.1-.5-.4-.4-.9 .1-.4 0-.7-.2-.7-.5 0-.7-1.1-.3-1.8 .2-.3.7-.6 1.1-.6 .5 0 1.3-.3 1.8-.6 .5-.5 1.1-.6 1.8-.5 1.1.2 1.1.2.5-.3-.8-.7-1.3-.7-2.7-.2-1.4.5-3 .1-3.2-.7-.1-.7-2.3-1-2.9-.5zm18.1 15.1c-.3.3-.2 1 .3 2.4 .6 1.7.7 2.1.3 2.8-.5.9-1.3 1.1-1.3.3 0-.3.1-.5.2-.5 .2 0 .3-.4.4-.9 0-.4-.1-.8-.3-.8-.2 0-.3-.4-.3-1 0-.5-.1-1.3-.2-1.8-.2-.8-.1-.9.5-.9 .6 0 .7.1.4.4zm-24.6 6.2c.1.5.2 1.3.2 1.7 0 .5.2.8.4.8 .2 0 .2-.4.1-.9-.2-.8-.1-.8.5-.6 .5.1.7 0 .7-.4 0-.4.1-.5.3-.3 .5.5-.1 2.3-.6 2-.2-.1-.4.2-.5.5-.1.4-.3.7-.5.7-1.8.2-1.7.3-1.7-1.2 0-1.4.6-3.7.9-3.4 0 .1.2.6.2 1.1zm10.5 16.9c.7 1.5 1.2 2.9 1.2 3.1 0 .2.1.4.3.4 .1 0 .2.3.3.7 0 .5.1 1.2.3 1.7 .5 2.1-.9 3.7-2.7 3.1-.8-.2-1.4-1.7-.9-2.3 .2-.2.3-.2.3.1 0 .6.6.5.9-.1 .1-.3 0-.5-.1-.4-.8.5-1.7-.8-1.9-2.6-.3-2.3-.8-2.4-1.1-.3-.3 2.2-.4 2.5-1.1 2.7-.8.2-.9.6-.2.9 .5.2.7 1.4.2 1.7-.2.1-.4.1-.5-.1-.4-.6-.9-.4-.7.1 .3.8-.5.6-1.4-.3-.9-.9-1-1.2-.4-3 .2-.8.4-1.6.3-1.8-.1-.5 1.2-3 1.6-3.3 .2-.1.4-.4.4-.7 0-1.3 1-2.2 2.5-2.2l1.4 0 1.3 2.6zm17.8 4.2c0 .2-.2.4-.4.5-.1.1-.3.4-.3.6 0 .2.3.1.6-.4 .8-1.2 1.4 0 .6 1.2-.1.3-.5.4-.7.3-.3-.1-.6 0-.7.1-.1.2-.4.4-.7.4-.5 0-.5-.1 0-.6 1-1.1.6-2.4-.4-1.4-.2.2-.5.3-.8.1-.2-.1-.1-.4.6-.6 1-.5 2.2-.5 2.2-.2zm-35.3-21.6c-.1.5-.1 1.2 0 1.8 0 .6-.1 1.3-.5 1.6-.5.6-.5.6 0 .4 .4-.1.6-.4.6-.6 0-.2.1-.2.2-.1 .2.1.5-.2.9-.6 .3-.5.8-.8.9-.8 .2.1.3 0 .4-.2 .1-.6 0-.9-.3-.7-.2.1-.7-.2-1.2-.7l-.8-.8-.2.7zm-3.9 1.6c0 .1.2.6.6 1.1 .9 1.1 1.2 2.7.8 4.1-.4 1.5-.3 1.6.8.3 .4-.5.7-1.1.6-1.5-.1-.3 0-.6.2-.6 .2 0 .2-.2 0-.6-.1-.3-.4-.8-.5-1.2-.1-.3-.3-.5-.5-.4-.1.1-.4-.2-.5-.7-.2-.8-1.5-1.2-1.5-.5zm-.4 24c-1.1.9-.4 1.7.9 1.1 1-.5 2.9-.2 4 .4 .4.3 1.3.8 2 1.2l1.3.8-.6-.9c-.3-.5-.7-.9-.9-.9-.2 0-.3-.2-.1-.5 .2-.6-.5-.8-3.1-.8-1.2 0-2.1-.2-2.1-.4 0-.2.2-.2.3-.1 .2.1.4 0 .4-.2 0-.6-1.3-.4-2.1.3zm36.2 4.3c0 .3-.2.4-.3.3-.7-.4-1.4 2.9-.9 3.9 .4.7.4 1 .1 1.1-.2.1-.1.2.3.2 .4 0 .8.2.8.4 0 .2.2.3.5.2 .4-.2.5-.1.3.3-.9 2.4-.9 5.7.1 4.8 .3-.2.3-.5 0-.9-.3-.5-.3-1.1 0-2.2 .3-.9.4-1.8.4-2.2 0-.3.6-1.2 1.2-1.9 1.2-1.4 1.4-1.8.9-1.8-.2 0-.4.1-.4.3 0 .2-.2.3-.4.3-.3 0-.8.3-1.3.7-1.4 1.2-1.7-.1-.8-3.3 .2-.4.1-.8-.1-.8-.2 0-.4.3-.4.6zm-35.3.5c.1.5.4 1 .5 1.2 .4.4 0 3.8-.4 4-.2.1-.4-.1-.5-.4-.2-.5-1.5-2-1.5-1.7 0 1 1.7 2.9 2.1 2.5 .3-.3.8-.6 1.1-.6 .3 0 .4-.2.3-.4-.1-.3.1-.7.4-.9 .6-.6.7-1.9 0-2.2-.3-.1-.5-.3-.5-.5 0-.3-1.2-1.7-1.5-1.7-.1 0-.1.3 0 .7zm17.7 8.4c0 .4-.2 1.1-.5 1.5-.4.7-.4.8 0 1.4 .3.4.5.9.5 1.2 0 .7.7.9.7.2 0-.2.2-.8.5-1.3 .4-.8.4-1 0-1.5-.3-.4-.5-.9-.5-1.2 0-.9-.7-1.1-.7-.3z",
    jaw:
      "m36.8 67.6c0 1.2.2 2.4.3 2.7 .1.2.1.6.1.7 0 .2.2.7.4 1.2 .3.5.7 1.4.9 1.9 .2.5.5.8.7.7 .3-.2.1-1.1-.5-1.8-.9-1.1-1.5-7-.8-7.2 .2-.1.1-.2-.4-.2-.8-.1-.8 0-.7 2zm2-1.7c-.1.3-.1.9.1 1.3 .3.9.9 4.1 1.2 6.2 .2 1.4.3 1.5 1.2.8 .7-.5.8-1.6.2-1.5-.3.1-.5-.2-.5-.6 0-.3-.2-1-.4-1.4-.2-.4-.3-.9-.2-1.2 .1-.2-.1-1.2-.3-2.1-.4-1.6-1-2.3-1.3-1.5zm24.1.4c-.2.4-.5 1.4-.7 2.1-.7 2.5-1.9 4.9-2.3 4.9-.2 0-.9.5-1.5 1.2-.6.6-1.2 1-1.5.9-.3-.1-.5.1-.5.4 0 .5-.5.6-1.3.1-.3-.2-.3 0-.2 1 .3 2.1-.8 4.2-1.4 2.6-.2-.3-.4-.7-.6-.8-.4-.3.1-1.7.5-1.5 .2.1.3.7.3 1.3 0 1.3.5.8.9-.8 .1-.7.1-1-.1-.9-.2.1-.5 0-.8-.3-.3-.4-.5-.4-.9-.1-.5.5-1.9-.9-1.5-1.5 .1-.2.4-.1.6.2 .5.7 1.1.5 1.1-.4 0-.4.2-.4.7.3l.6.8 .5-1.1 .5-1.2 .2.9c.3 1.1.9.9.9-.3 0-.9.3-1 1-.4 .3.3.4.3.4-.4 0-.6 0-.7.5-.3 .4.3.5.2.5-.5 0-.8.1-.9.5-.5 .4.3.5.3.5-.3 0-.4.1-.8.3-.8 .2 0 .3-.2.2-.5-.2-.2-.1-.5.2-.5 .2 0 .2-.1.1-.3-.1-.2-.5-.3-.8-.2-.6.1-.6 0-.5-.8 .1-.5.1-.7 0-.5-.1.3-.4.3-.7.2-.3-.1-.5 0-.5.2 0 .2-.4.6-.8.8-.5.2-.9.6-.9.9 0 .8-1.7 1.6-2.1 1-.2-.4-.2-.4-.4.8 0 .3-.3.5-.7.5-.8 0-1.1-.9-.3-.9 .4 0 .3-.1-.3-.4-.7-.2-.9-.5-.9-1.2l0-.9-.7.8c-.4.5-.7 1.1-.7 1.3 0 .3-.1.4-.3.2-.3-.1-.3 0-.2.5 .2.5.1.7-.3.7-.3 0-.6-.4-.7-1.1-.3-1.4-.8-1.4-.7 0 .1.5 0 .7 0 .3-.1-.4-.4-.6-1-.4-.7.1-.8 0-.9-1.4 0-.9-.1-1.3-.2-1-.2.8-.6.7-1.4-.3-.4-.5-.7-.7-.7-.5 0 .2-.2.4-.4.4-.3 0-.8.2-1.1.5-.6.5-.6.5.3.3 .8-.1.9-.1.5.2-.4.3-.4.3.2.3 .6.1.7.1.1.4-.3.2-.6.7-.6 1.1 0 .5.1.6.4.3 .7-.7.9-.5.7.5-.2.8-.1.9.4.5 .5-.4.5-.4.5.4 0 1 .3 1.1.9.3 .4-.6.4-.6.7.1 .5 1.6.6 1.7.7 1.1 .2-.9.7-.7 1.1.2 .4 1.1 1 1.1 1 .1 0-1 .9-.1 1.2 1.3 .3 1 .2 1-.4.4-.6-.6-.7-.6-1.2 0-.6.6-.6.6-.8-.1-.2-.9-1-.8-1.2.2-.2.6.5 1.2 1.1.8 .1-.1.3.2.5.5 .3.9.8.9.8 0 0-.8.5-.9.8-.1 .6 1.4.2 2.7-.8 3.4-.7.3-1.3.8-1.4 1-.4.6-.9.6-1.5-.1-.3-.4-.3-.7-.1-1 .5-.6-.3-1-.9-.5-.3.3-.4.6-.1.9 .1.2.2.5.1.6-.1.1 0 .2.3.2 .3 0 .6.3.6.7 0 .4.2.7.6.7 .9 0 0 .6-1.1.7l-1 .1 1.1.8c.7.4 1.3 1 1.5 1.3 .2.6.2.6.2 0 .1-1.1 1.7-.7 1.7.5 0 1 .6 1.3.9.5 .1-.3.4-.4.5-.3 .2.1.2.3-.1.4-.3.2-.3.4 0 .8 .1.2.3 2 .3 4l0 3.6-1 .6c-.7.4-1.1.5-1.2.2-.2-.6-1.1-.4-1.8.3-.3.4-.7.6-.9.5-.2-.1-.4 0-.6.2-.2.3 1.4.5 3.4.4 .5-.1.9.1.9.3 0 .2.8.3 2.1.2 1.2 0 2.1-.2 2.1-.3-.1-.1.1-.3.6-.3 .7 0 .7 0 .1-.6-.4-.4-.6-.5-.8-.2-.2.2-.5.3-.9.1-.6-.2-.6-.3-.1-.3 .4 0 .4-.2-.3-.8-1.1-1.2-1.1-6.7 0-7.9 .3-.4.5-.8.4-1-.3-.5.5-1.8 1.1-1.8 .5 0 .8.4 1 1.1 .3 1.1.3 1.1.4.2 0-1.3 2.7-3.2 3.4-2.5 .2.3.3.6.2.8-.1.1-.2 0-.2-.2 0-.3-.1-.3-.4-.2-.4.3-.4 1.2.1 1.1 .2-.1.5.3.7.7 .2.8.2.8.2-.2 .1-.6.2-1.2.4-1.3 .2-.1.3-.8.3-1.5 0-1.7.6-3.2 1.2-3 .2.1.4.5.4.9 0 1.4.4 1 .6-.7 .2-1.8 1.6-4.9 2.2-4.7 .6.1 1.1-1.8.7-2.7-.3-.8-.3-.8-.3.3 0 .8-.2 1.1-.6 1.1-.3 0-.4-.2-.3-.6 .1-.3.3-1.1.4-1.6 .1-.6.4-1.2.6-1.3 .5-.4.9-6 .5-6-.3 0-.5.9-.8 3.1-.3 2.8-2.2 6.6-2.2 4.4 0-.2.2-.4.3-.4 .2 0 .4-.8.4-1.9 0-1.8.5-3.7 1.1-4.8 .2-.2.1-.4-.4-.4-.5 0-.9.3-1 .8zm-20.3 8c0 .1.2.8.4 1.4l.5 1.2 .4-.9 .3-.8 0 .7c.1.5.5 1.3 1.1 1.9l1.1 1.1-.2-1c-.1-.5 0-.9.1-.9 .3 0 0-.7-.6-1.7-.1 0-.3.1-.4.3-.2.4-.3.3-.5-.2-.1-.4-.5-.8-.8-.9-.3-.1-.8-.3-1-.4-.2-.1-.4 0-.4.2zm-4.1 2.2c0 .3.2.5.6.5 .2 0 .4.2.3.4-.2.2 0 .6.3 1 .4.4.9 1.7 1.2 3 .5 1.8.6 2 .6 1 .1-.6.2-1.4.5-1.6 .2-.3.2-.4 0-.4-.2 0-.5-.4-.6-.8-.1-.5-.4-.9-.7-.9-.3 0-.4-.2-.3-.4 .1-.2.1-.4-.1-.6-.1-.1-.4-.5-.6-.8-.5-.9-1.2-1.1-1.2-.4z",
  };
}

// Hand-placed strike: a tapered main channel with two forks and a twig,
// ending on the crown, plus the current it sends through the skull in three
// waves (dome, face, jaw). Generated as filled outlines so every line thins
// to a point.
function boltPaths() {
  return {
    bolt: "M45.7 0.7L50.6 5.5L46.2 10.2L52.8 15.6L47.4 20.4L51.6 25.6L49.2 29.4L49.8 33.5L50.2 33.5L49.8 29.6L52.4 25.4L48.6 20.6L54.2 15.4L47.8 9.8L52.4 5.5L47.3 -0.7ZM46.7 9.6L41.6 13.3L43.7 16.4L38.4 20.9L36.4 24.5L36.6 24.5L38.6 21.1L44.3 16.6L42.4 13.7L47.3 10.4ZM53.3 15.9L58.2 18.1L56.3 21.6L62 24.6L62 24.4L56.7 21.4L58.8 17.9L53.7 15.1ZM47.8 20.3L44.4 22.9L45.5 26L45.5 26L44.6 23.1L48.2 20.7Z",
    veins1: "M49.6 33.8L48.7 35.5L47.1 36.5L45.4 37.6L43.8 38.8L42.4 40.2L40.7 41.5L39 42.6L36.9 42.8L35.3 44.3L33.7 45.7L32.7 47.7L31 48.9L31 49.1L32.9 47.8L33.9 45.8L35.5 44.5L37.1 43.2L39.2 43L41 41.9L42.7 40.7L44.2 39.2L45.8 38.1L47.4 37.1L49.3 36L50.4 34.2ZM49.8 34.4L51.6 35.2L53.4 36.2L54.9 37.6L56.9 38.3L59 38.4L60.8 39.4L62.6 40.5L63.9 42.1L65.9 43.4L68 44.4L69 46.6L71 48.1L71 47.9L69.2 46.4L68.2 44.2L66 43.2L64.1 41.9L62.9 40.2L61.1 39L59.2 37.9L57.1 37.7L55.3 37L53.8 35.6L52 34.5L50.2 33.6ZM49.6 34L49.8 35.8L49 37.3L48.4 39.2L48.7 41.1L49.8 42.5L50.5 44L51.5 45.4L51.8 47L51.2 48.5L49.9 49.6L50.1 51.3L49.9 53L50.1 53L50.3 51.3L50.1 49.7L51.5 48.7L52.2 47L51.9 45.2L50.9 43.8L50.3 42.2L49.3 40.9L49.1 39.2L49.7 37.6L50.6 35.9L50.4 34ZM56.6 38.1L56.8 39.7L57.3 41.4L58.2 42.9L59.3 44.1L59.4 45.3L59.3 46.6L58.6 47.8L57.9 49L58.1 49L58.8 47.9L59.6 46.8L59.8 45.4L59.7 43.9L58.7 42.6L57.9 41.1L57.6 39.6L57.4 37.9Z",
    veins2: "M30.6 49L30.4 50.9L30.6 52.7L29.8 54.3L28.7 56L30 57.4L30.7 58.7L30.7 60.4L30.9 62.1L31.8 62.9L32.7 63.7L33.3 64.8L33.4 66L33.6 66L33.5 64.7L32.9 63.6L32 62.7L31.1 61.9L31 60.3L31.1 58.6L30.3 57.1L29.3 56L30.3 54.6L31.2 52.8L31.1 50.9L31.4 49ZM70.6 48L70.8 49.9L71.1 51.8L71.9 53.5L72.7 55L71.5 56.3L70.9 58.3L70.1 60L69.8 62L69.7 63.2L69.2 64.2L67.9 64.7L67.4 66L67.6 66L68 64.8L69.3 64.4L70 63.3L70.2 62L70.5 60.1L71.3 58.4L71.9 56.6L73.3 55L72.4 53.2L71.7 51.6L71.4 49.8L71.4 48ZM49.6 52.9L49.3 54.6L49.5 56.1L48.4 57.3L47.7 59L48.5 60.7L49.4 62L49.7 63.7L50.7 65.1L50.5 66.4L49.7 67.8L49.5 69.5L49.8 71L50.3 72.8L51.1 74.4L50.9 76.2L50.8 78L50.4 79.7L49.9 81.5L49 83.1L48.9 85L49.2 86.9L50.4 88.4L50.2 90.2L49.9 92L50.1 92L50.4 90.2L50.6 88.3L49.3 86.9L49.1 85L49.2 83.2L50.1 81.6L50.7 79.8L51.2 78L51.2 76.2L51.4 74.4L50.7 72.7L50.2 71L50 69.5L50.2 68L50.9 66.6L51.3 64.9L50.2 63.5L49.9 61.8L49 60.4L48.3 59L48.9 57.6L50.1 56.4L50 54.6L50.4 53.1ZM31 62.4L31.9 62.3L32.5 63.2L33.5 63.7L34.5 63.6L34.5 63.4L33.5 63.4L32.8 62.9L32.3 61.9L31 61.6ZM70.1 61.7L68.9 61.4L68 62.3L67 62.5L66.5 63.5L66.5 63.5L67.2 62.8L68.2 62.6L69 61.9L69.9 62.3Z",
    veins3: "M49.7 96.9L49.2 98.5L48.6 100.1L48.1 101.7L46.7 103L48.5 104.3L49.5 106L51.1 107.2L51.8 109L50.4 110.4L49.5 112.3L49.1 114.3L47.9 116L49.1 116.9L49.9 118.1L50 119.6L49.9 121L50.1 121L50.2 119.6L50.1 118.1L49.3 116.8L48.1 116L49.4 114.4L49.8 112.4L50.7 110.6L52.2 109L51.5 107L49.9 105.7L48.9 103.9L47.3 103L48.5 102L49.2 100.3L49.8 98.7L50.3 97.1ZM42.7 99.8L41.7 101.4L40.5 103.1L40.1 105L39.8 107L40.4 108.7L41.8 109.8L41.5 111.4L41.9 113L42.1 113L41.6 111.4L42 109.7L40.7 108.5L40.2 107L40.5 105.1L41 103.3L42.2 101.8L43.3 100.2ZM56.7 100.1L57.2 101.9L57.5 103.9L58.8 105.4L59.8 107L59.1 108.5L59.3 110.1L58.2 111.3L57.9 113L58.1 113L58.3 111.4L59.6 110.2L59.4 108.5L60.2 107L59.2 105.2L58 103.7L57.8 101.8L57.3 99.9Z",
  };
}
