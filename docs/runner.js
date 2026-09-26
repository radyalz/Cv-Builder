const API_URL = "https://cv-api.radyalz.ir";
const STORAGE_KEY = "cv-builder-selection";
const DEFAULT_THEME = "purple";
const DEFAULT_VARIANT = "digital";

// Mirrors the theme table in the private cv/helpers/colors.tex. `hex` is the
// theme's main accent; `swatch` only overrides how the dot is drawn here.
const THEMES = [
  { slug: "purple", label: "Purple", hex: "#7030A0" },
  { slug: "violet", label: "Violet", hex: "#6D28D9" },
  { slug: "indigo", label: "Indigo", hex: "#4338CA" },
  { slug: "blue", label: "Blue", hex: "#1D4ED8" },
  { slug: "sky", label: "Sky", hex: "#0284C7" },
  { slug: "teal", label: "Teal", hex: "#0F766E" },
  { slug: "emerald", label: "Emerald", hex: "#047857" },
  { slug: "green", label: "Green", hex: "#15803D" },
  { slug: "olive", label: "Olive", hex: "#4D7C0F" },
  { slug: "amber", label: "Amber", hex: "#B45309" },
  { slug: "orange", label: "Orange", hex: "#C2410C" },
  { slug: "red", label: "Red", hex: "#B91C1C" },
  { slug: "rose", label: "Rose", hex: "#BE123C" },
  { slug: "burgundy", label: "Burgundy", hex: "#8C1C3D" },
  { slug: "brown", label: "Brown", hex: "#7C4A21" },
  { slug: "slate", label: "Slate", hex: "#334155" },
  { slug: "graphite", label: "Graphite", hex: "#463C64" },
  {
    slug: "mono",
    label: "Black & White",
    hex: "#1A1A1A",
    swatch: "linear-gradient(135deg, #1a1a1a 0 50%, #e9e9e9 50% 100%)",
  },
];

const THEME_BY_SLUG = new Map(THEMES.map((theme) => [theme.slug, theme]));
const VARIANTS = new Set([DEFAULT_VARIANT, "print"]);

const VARIANT_LABEL = {
  digital: "Digital",
  print: "Print",
};

const button = document.getElementById("generateButton");
const buildPanel = document.getElementById("buildPanel");
const successPanel = document.getElementById("successPanel");
const errorPanel = document.getElementById("errorPanel");

const statusTitle = document.getElementById("statusTitle");
const statusText = document.getElementById("statusText");
const errorText = document.getElementById("errorText");
const elapsedTime = document.getElementById("elapsedTime");

const colourTrigger = document.getElementById("colourTrigger");
const colourTriggerLabel = document.getElementById("colourTriggerLabel");
const colourMenu = document.getElementById("colourMenu");
const themeGrid = document.getElementById("themeGrid");
const themeHint = document.getElementById("themeHint");
const customColor = document.getElementById("customColor");
const customHex = document.getElementById("customHex");
const customApply = document.getElementById("customApply");
const variantToggle = document.getElementById("variantToggle");

const previewPane = document.querySelector(".card-preview");
const previewFrame = document.getElementById("previewFrame");
const previewState = document.getElementById("previewState");
const previewLabel = document.getElementById("previewLabel");
const previewMeta = document.getElementById("previewMeta");
const previewExpand = document.getElementById("previewExpand");

const lightbox = document.getElementById("lightbox");
const lightboxFrame = document.getElementById("lightboxFrame");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxClose = document.getElementById("lightboxClose");

let variants = new Map();
let previewStamp = "";
let previewTimer = null;

let elapsedTimer = null;
let buildStartedAt = null;

// Declared up here because the first syncInterface() call paints the skulls
// during start-up, before the artwork section further down is evaluated.
let skullAccent = "";

let selection = {
  mode: "theme",
  theme: DEFAULT_THEME,
  color: "#7030A0",
  variant: DEFAULT_VARIANT,
};

/* -------------------------------------------------------------------------
   Colour helpers
   ---------------------------------------------------------------------- */

function normaliseHex(value) {
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

function toRgb(hex) {
  const value = parseInt(hex.slice(1), 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function relativeLuminance(hex) {
  const { r, g, b } = toRgb(hex);

  const channel = (raw) => {
    const c = raw / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function mixWithWhite(hex, amount) {
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
// The PDF still uses the colour exactly as chosen.
function uiAccent(hex) {
  let accent = hex;

  for (let step = 0; step < 12 && relativeLuminance(accent) < 0.22; step++) {
    accent = mixWithWhite(accent, 0.18);
  }

  return accent;
}

function contrastRatio(a, b) {
  const first = relativeLuminance(a);
  const second = relativeLuminance(b);

  return (
    (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
  );
}

// Mid-tone accents such as orange beat a fixed lightness threshold, so the
// label simply takes whichever of the two extremes actually reads better.
function textOn(hex) {
  const dark = "#0b0d10";
  const light = "#ffffff";

  return contrastRatio(hex, dark) >= contrastRatio(hex, light) ? dark : light;
}

/* -------------------------------------------------------------------------
   Selection state
   ---------------------------------------------------------------------- */

function selectedSlug() {
  return selection.mode === "custom" ? "custom" : selection.theme;
}

function selectedHex() {
  if (selection.mode === "custom") {
    return selection.color;
  }

  const theme = THEME_BY_SLUG.get(selection.theme);

  return theme ? theme.hex : "#7030A0";
}

function colourLabel() {
  if (selection.mode === "custom") {
    return selection.color;
  }

  const theme = THEME_BY_SLUG.get(selection.theme);

  return theme ? theme.label : "Purple";
}

function selectionLabel() {
  return `${colourLabel()} · ${VARIANT_LABEL[selection.variant]}`;
}

function variantKey(theme, variant) {
  return `${theme}|${variant}`;
}

function selectedKey() {
  return variantKey(selectedSlug(), selection.variant);
}

function loadSelection() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

    if (!stored || typeof stored !== "object") {
      return;
    }

    if (VARIANTS.has(stored.variant)) {
      selection.variant = stored.variant;
    }

    if (stored.mode === "custom") {
      const hex = normaliseHex(stored.color);

      if (hex) {
        selection.mode = "custom";
        selection.color = hex;
      }

      return;
    }

    if (THEME_BY_SLUG.has(stored.theme)) {
      selection.mode = "theme";
      selection.theme = stored.theme;
      selection.color = normaliseHex(stored.color) || "#7030A0";
    }
  } catch {
    // A blocked or corrupt store just means the defaults are used.
  }
}

function saveSelection() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
  } catch {
    // Persisting the choice is a convenience, never a requirement.
  }
}

/* -------------------------------------------------------------------------
   Colour menu
   ---------------------------------------------------------------------- */

function menuIsOpen() {
  return !colourMenu.hidden;
}

// The card clips its own overflow so the page never scrolls, so the menu
// lives at the top level and is placed against its trigger instead.
function positionMenu() {
  const rect = colourTrigger.getBoundingClientRect();
  const width = colourMenu.offsetWidth;
  const height = colourMenu.offsetHeight;
  const margin = 8;

  let left = rect.left;
  let top = rect.bottom + margin;

  left = Math.min(left, window.innerWidth - width - margin);
  left = Math.max(margin, left);

  if (top + height > window.innerHeight - margin) {
    top = Math.max(margin, rect.top - height - margin);
  }

  colourMenu.style.left = `${Math.round(left)}px`;
  colourMenu.style.top = `${Math.round(top)}px`;
}

function openMenu() {
  colourMenu.hidden = false;
  colourTrigger.setAttribute("aria-expanded", "true");
  positionMenu();
}

function closeMenu() {
  colourMenu.hidden = true;
  colourTrigger.setAttribute("aria-expanded", "false");
}

function toggleMenu() {
  if (menuIsOpen()) {
    closeMenu();
  } else {
    openMenu();
  }
}

function renderSwatches() {
  for (const theme of THEMES) {
    const swatch = document.createElement("button");

    swatch.type = "button";
    swatch.className = "swatch";
    swatch.dataset.slug = theme.slug;
    swatch.style.setProperty("--swatch", theme.swatch || theme.hex);
    swatch.setAttribute("role", "radio");
    swatch.setAttribute("aria-checked", "false");
    swatch.setAttribute("aria-label", theme.label);
    swatch.title = theme.label;

    swatch.addEventListener("click", () => {
      selection = { ...selection, mode: "theme", theme: theme.slug };
      saveSelection();
      syncInterface();
    });

    themeGrid.append(swatch);
  }
}

function setHint(message) {
  if (!message) {
    themeHint.hidden = true;
    themeHint.textContent = "";
    return;
  }

  themeHint.hidden = false;
  themeHint.textContent = message;
}

function applyCustomColour(value) {
  const hex = normaliseHex(value);

  if (!hex) {
    customHex.setAttribute("aria-invalid", "true");
    setHint("Enter a colour as six hex digits, for example #FF8800.");
    return false;
  }

  customHex.removeAttribute("aria-invalid");
  customHex.value = hex;
  customColor.value = hex.toLowerCase();

  selection = { ...selection, mode: "custom", color: hex };
  saveSelection();
  syncInterface();

  return true;
}

/* -------------------------------------------------------------------------
   Published preview
   ---------------------------------------------------------------------- */

function formatPublished(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// The preview is a progressive enhancement: if the build service cannot be
// reached the pane stays hidden and the rest of the page is unaffected.
async function loadVariants() {
  try {
    const response = await fetch(`${API_URL}/variants`);

    if (!response.ok) {
      throw new Error("Variants unavailable.");
    }

    const data = await response.json();

    variants = new Map(
      (data.variants || []).map((item) => [
        variantKey(item.theme, item.variant || DEFAULT_VARIANT),
        item,
      ])
    );

    previewPane.classList.add("is-active");

    return true;
  } catch {
    previewPane.classList.remove("is-active");

    return false;
  }
}

function previewUrl() {
  const stamp = previewStamp ? `&v=${encodeURIComponent(previewStamp)}` : "";

  return (
    `${API_URL}/preview?theme=${encodeURIComponent(selectedSlug())}` +
    `&variant=${encodeURIComponent(selection.variant)}${stamp}`
  );
}

function refreshPreview() {
  previewLabel.textContent = selectionLabel();

  const published = variants.get(selectedKey());

  if (!published) {
    previewFrame.hidden = true;
    previewFrame.removeAttribute("src");

    previewState.hidden = false;
    previewState.textContent =
      "This combination has not been generated yet. Use Generate Latest CV to build it, and the result appears here.";

    previewMeta.textContent = "";
    previewExpand.hidden = true;

    if (!lightbox.hidden) {
      closeLightbox();
    }

    return;
  }

  const url = previewUrl();

  previewFrame.src = url;
  previewFrame.hidden = false;
  previewState.hidden = true;

  const date = formatPublished(published.updatedAt);

  previewMeta.textContent = date ? `Published ${date}` : "";
  previewExpand.hidden = false;

  if (!lightbox.hidden) {
    lightboxFrame.src = url;
    lightboxTitle.textContent = selectionLabel();
  }
}

// Clicking through swatches should not fire a request per click.
function schedulePreview() {
  window.clearTimeout(previewTimer);
  previewTimer = window.setTimeout(refreshPreview, 180);
}

function openLightbox() {
  if (!variants.has(selectedKey())) {
    return;
  }

  lightboxFrame.src = previewUrl();
  lightboxTitle.textContent = selectionLabel();
  lightbox.hidden = false;
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxFrame.removeAttribute("src");
}

/* -------------------------------------------------------------------------
   Interface sync
   ---------------------------------------------------------------------- */

function syncInterface() {
  const accent = uiAccent(selectedHex());

  document.documentElement.style.setProperty("--accent", accent);
  document.documentElement.style.setProperty("--accent-text", textOn(accent));
  document.documentElement.style.setProperty("--accent-soft", `${accent}33`);

  paintSkulls(accent);

  colourTriggerLabel.textContent = colourLabel();

  for (const swatch of themeGrid.children) {
    const active =
      selection.mode === "theme" && swatch.dataset.slug === selection.theme;

    swatch.setAttribute("aria-checked", active ? "true" : "false");
    swatch.tabIndex = active ? 0 : -1;
  }

  for (const segment of variantToggle.children) {
    segment.setAttribute(
      "aria-checked",
      segment.dataset.variant === selection.variant ? "true" : "false"
    );
  }

  if (selection.mode === "custom") {
    setHint(
      relativeLuminance(selection.color) > 0.7
        ? "Very light colours can be hard to read on a printed CV. The headings are darkened automatically, but a mid-tone colour usually reads better."
        : "The lighter and muted shades of the CV are derived from this colour automatically."
    );
  } else {
    setHint("");
  }

  if (menuIsOpen()) {
    positionMenu();
  }

  schedulePreview();
}

function setControlsEnabled(enabled) {
  for (const swatch of themeGrid.children) {
    swatch.disabled = !enabled;
  }

  for (const segment of variantToggle.children) {
    segment.disabled = !enabled;
  }

  colourTrigger.disabled = !enabled;
  customColor.disabled = !enabled;
  customHex.disabled = !enabled;
  customApply.disabled = !enabled;
}

/* -------------------------------------------------------------------------
   Build panel
   ---------------------------------------------------------------------- */

function setBuildStatus(title, message) {
  statusTitle.textContent = title;
  statusText.textContent = message;
}

function formatElapsed(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function startElapsedTimer() {
  buildStartedAt = Date.now();
  elapsedTime.textContent = "Elapsed: 0:00";

  elapsedTimer = window.setInterval(() => {
    elapsedTime.textContent =
      `Elapsed: ${formatElapsed(Date.now() - buildStartedAt)}`;
  }, 1000);
}

function stopElapsedTimer() {
  if (elapsedTimer !== null) {
    window.clearInterval(elapsedTimer);
    elapsedTimer = null;
  }
}

function showBuilding() {
  errorPanel.hidden = true;
  successPanel.hidden = true;
  buildPanel.hidden = false;

  button.disabled = true;
  button.querySelector(".button-label").textContent = "Building CV…";
  setControlsEnabled(false);
  closeMenu();

  setBuildStatus(
    "Requesting a fresh build…",
    `Connecting to the CV build service. ${selectionLabel()}.`
  );

  startElapsedTimer();
}

function showSuccess() {
  stopElapsedTimer();

  buildPanel.hidden = true;
  errorPanel.hidden = true;
  successPanel.hidden = false;

  button.disabled = false;
  button.querySelector(".button-label").textContent = "Generate Again";
  setControlsEnabled(true);
}

function showError(message) {
  stopElapsedTimer();

  buildPanel.hidden = true;
  successPanel.hidden = true;
  errorPanel.hidden = false;

  errorText.textContent = message;

  button.disabled = false;
  button.querySelector(".button-label").textContent = "Try Again";
  setControlsEnabled(true);
}

/* -------------------------------------------------------------------------
   Build flow
   ---------------------------------------------------------------------- */

async function startBuild() {
  const payload = { variant: selection.variant };

  if (selection.mode === "custom") {
    payload.color = selection.color;
  } else {
    payload.theme = selection.theme;
  }

  const response = await fetch(`${API_URL}/build`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Unable to start CV generation.");
  }

  if (!result.buildId) {
    throw new Error("The build service did not return a build ID.");
  }

  return {
    buildId: result.buildId,
    theme: result.theme || selectedSlug(),
    variant: result.variant || selection.variant,
  };
}

async function getBuildStatus(buildId, theme, variant) {
  const response = await fetch(
    `${API_URL}/status?id=${encodeURIComponent(buildId)}` +
      `&theme=${encodeURIComponent(theme)}` +
      `&variant=${encodeURIComponent(variant)}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Unable to check CV generation status.");
  }

  return result;
}

async function waitForBuild(buildId, theme, variant) {
  while (true) {
    await new Promise((resolve) => window.setTimeout(resolve, 5000));

    const result = await getBuildStatus(buildId, theme, variant);

    if (result.status === "completed") {
      if (!result.downloadUrl) {
        throw new Error("The build completed without a download URL.");
      }

      setBuildStatus(
        "Build complete",
        "The newest CV has been published. Starting your download…"
      );

      await new Promise((resolve) => window.setTimeout(resolve, 650));

      showSuccess();

      // Point the preview at what was just published, using the build id to
      // defeat any caching of the previous copy under the same name.
      previewStamp = String(buildId);
      await loadVariants();
      refreshPreview();

      window.location.assign(result.downloadUrl);
      return;
    }

    if (result.status === "failed") {
      throw new Error("The CV build failed.");
    }

    if (result.status === "running") {
      setBuildStatus(
        "Rendering the latest CV…",
        "Compiling the document and recalculating current experience durations."
      );
      continue;
    }

    setBuildStatus(
      "Build queued…",
      "The request was accepted and is waiting for a runner."
    );
  }
}

/* -------------------------------------------------------------------------
   Wiring
   ---------------------------------------------------------------------- */

renderSwatches();
loadSelection();

customColor.value = selectedHex().toLowerCase();
customHex.value = selectedHex();

syncInterface();
loadVariants().then(refreshPreview);

colourTrigger.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleMenu();
});

colourMenu.addEventListener("click", (event) => {
  event.stopPropagation();
});

document.addEventListener("click", () => {
  if (menuIsOpen()) {
    closeMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  if (!lightbox.hidden) {
    closeLightbox();
    return;
  }

  if (menuIsOpen()) {
    closeMenu();
    colourTrigger.focus();
  }
});

window.addEventListener("resize", () => {
  if (menuIsOpen()) {
    positionMenu();
  }
});

variantToggle.addEventListener("click", (event) => {
  const segment = event.target.closest(".segment");

  if (!segment || !VARIANTS.has(segment.dataset.variant)) {
    return;
  }

  selection = { ...selection, variant: segment.dataset.variant };
  saveSelection();
  syncInterface();
});

customColor.addEventListener("input", (event) => {
  applyCustomColour(event.target.value);
});

customApply.addEventListener("click", () => {
  applyCustomColour(customHex.value);
});

customHex.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    applyCustomColour(customHex.value);
  }
});

themeGrid.addEventListener("keydown", (event) => {
  const keys = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"];

  if (!keys.includes(event.key)) {
    return;
  }

  event.preventDefault();

  const slugs = THEMES.map((theme) => theme.slug);
  const current = slugs.indexOf(selection.theme);
  const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
  const next = slugs[(current + step + slugs.length) % slugs.length];

  selection = { ...selection, mode: "theme", theme: next };
  saveSelection();
  syncInterface();

  themeGrid.querySelector(`[data-slug="${next}"]`).focus();
});

previewExpand.addEventListener("click", openLightbox);
lightboxClose.addEventListener("click", closeLightbox);

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

button.addEventListener("click", async () => {
  try {
    showBuilding();

    const { buildId, theme, variant } = await startBuild();

    setBuildStatus(
      "Build started",
      `Build #${buildId} is running. You can keep this tab open.`
    );

    await waitForBuild(buildId, theme, variant);
  } catch (error) {
    console.error("CV Builder error:", error);

    showError(
      error instanceof Error
        ? error.message
        : "CV generation failed. Please try again."
    );
  }
});

/* -------------------------------------------------------------------------
   Skull artwork
   Every piece of the skull is a still SVG image, rebuilt here whenever the
   accent changes because an image cannot read CSS variables. Nothing moves
   inside these images: the page animates the layers that hold them, which
   the browser can do cheaply and reliably.

   Each tile is 100 x 130. The top 30 units are sky for the lightning; the
   skull sits below in the same 0..100 frame it was traced in.
   ---------------------------------------------------------------------- */

function mixHex(a, b, amount) {
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

function svgImage(defs, body) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130">' +
    `<defs>${defs}</defs>${body}</svg>`;

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function skullParts(accent) {
  const { cranium, jaw } = skullPaths();

  // Socket centres in tile units. Kept local: this runs during start-up,
  // before any module-level constant further down would be initialised.
  const EYES = [
    [38, 67],
    [63, 67],
  ];
  const { bolt } = boltPaths();

  const boneLight = mixHex(accent, "#fbf6f0", 0.84);
  const boneMid = mixHex(accent, "#9a908a", 0.58);
  const boneDark = mixHex(accent, "#1a1413", 0.66);
  const rim = mixHex(accent, "#ffffff", 0.4);
  const hot = mixHex(accent, "#ffffff", 0.7);

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
    `<stop offset="${mid}" stop-color="${hot}" stop-opacity=".85"/>` +
    `<stop offset="1" stop-color="${accent}" stop-opacity="0"/>` +
    "</radialGradient>";

  const eyes = EYES.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="url(#e)"/>` + star(x, y, 7, 0.45)).join("");
  const flare = EYES.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="20" fill="url(#f)"/>` + star(x, y, 15, 0.7)).join("");

  const strike =
    '<linearGradient id="v" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="9">' +
    '<stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/></linearGradient>' +
    '<mask id="m"><rect width="100" height="130" fill="url(#v)"/></mask>' +
    '<filter id="g" x="-60%" y="-10%" width="220%" height="120%">' +
    '<feGaussianBlur stdDeviation="1.5"/></filter>' +
    '<radialGradient id="i">' +
    '<stop offset="0" stop-color="#ffffff"/>' +
    `<stop offset=".3" stop-color="${hot}" stop-opacity=".9"/>` +
    `<stop offset="1" stop-color="${accent}" stop-opacity="0"/>` +
    "</radialGradient>";

  return {
    cranium: svgImage(boneDefs, bone(cranium)),
    jaw: svgImage(boneDefs, bone(jaw)),
    flash: svgImage(
      '<filter id="h"><feGaussianBlur stdDeviation=".8"/></filter>',
      `<g transform="translate(0 30)"><path d="${cranium}" fill="${hot}" filter="url(#h)"/></g>`
    ),
    eyes: svgImage(glow("e", 0.18, 0.42), eyes),
    flare: svgImage(glow("f", 0.1, 0.3), flare),
    bolt: svgImage(
      strike,
      '<g mask="url(#m)">' +
        `<path d="${bolt}" fill="${accent}" filter="url(#g)"/>` +
        `<path d="${bolt}" fill="${hot}" filter="url(#g)" opacity=".7"/>` +
        `<path d="${bolt}" fill="#ffffff"/>` +
        "</g>" +
        '<circle cx="50" cy="33.5" r="7" fill="url(#i)"/>'
    ),
  };
}

function paintSkulls(accent) {
  if (accent === skullAccent) {
    return;
  }

  skullAccent = accent;

  const parts = skullParts(accent);
  const root = document.documentElement.style;

  for (const [name, image] of Object.entries(parts)) {
    root.setProperty(`--skull-${name}`, image);
  }
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
// ending on the crown. Generated as filled outlines so it thins to a point.
function boltPaths() {
  return {
    bolt: "M44.8 1.5L49.5 5.6L45.3 10.3L52 15.6L46.8 20.3L51.1 25.6L48.9 29.3L49.7 33.5L50.3 33.5L50.1 29.7L52.9 25.4L49.2 20.7L55 15.4L48.7 9.7L53.5 5.4L48.2 -1.5ZM46.4 9.1L41.3 13.2L43.5 16.3L38.3 20.8L36.4 24.5L36.6 24.5L38.7 21.2L44.5 16.7L42.7 13.8L47.6 10.9ZM53.1 16.3L58 18.3L56.2 21.7L62 24.6L62 24.4L56.8 21.3L59 17.7L53.9 14.7ZM47.7 20.1L44.2 22.9L45.4 26L45.6 26L44.8 23.1L48.3 20.9Z",
  };
}
