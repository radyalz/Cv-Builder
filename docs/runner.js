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
