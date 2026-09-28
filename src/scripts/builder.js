import {
  API_URL,
  DEFAULT_LANGUAGE,
  DEFAULT_THEME,
  DEFAULT_VARIANT,
  EN_FONTS,
  FACTS,
  FA_FONTS,
  LANGUAGES,
  STORAGE_KEY,
  THEMES,
  THEME_BY_SLUG,
  TIPS,
  VARIANTS,
} from "../lib/data.js";
import { normaliseHex, relativeLuminance, textOn, uiAccent } from "../lib/colour.js";
import { closeA11y, initPrefs, themeName, t, uiPrefs } from "../lib/prefs.js";
import { positionPopover } from "../lib/popover.js";
import { hideTip, setTipContent } from "../lib/tooltip.js";
import { paintSkulls, setSkullsPaused } from "../lib/skulls.js";
import { PdfView } from "../lib/pdf-view.js";

// The CV builder itself: the selection, the colour menu, the published
// preview and how it expands, the build flow, and what each tooltip says.
// Shared pieces (preferences, tooltips, skulls) live in ../lib.

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
const languageToggle = document.getElementById("languageToggle");

const previewPane = document.querySelector(".card-preview");
const previewDoc = document.getElementById("previewDoc");
const pdfZoom = document.getElementById("pdfZoom");

const resetCv = document.getElementById("resetCv");

const DEFAULT_SELECTION = {
  mode: "theme",
  theme: DEFAULT_THEME,
  color: "#7030A0",
  variant: DEFAULT_VARIANT,
  language: DEFAULT_LANGUAGE,
};

function isDefaultSelection() {
  return (
    selection.mode === "theme" &&
    selection.theme === DEFAULT_THEME &&
    selection.variant === DEFAULT_VARIANT &&
    selection.language === DEFAULT_LANGUAGE
  );
}

// Back to purple, digital, English, and forget the stored choice.
function resetSelection() {
  selection = { ...DEFAULT_SELECTION };
  customHex.value = DEFAULT_SELECTION.color;
  customColor.value = DEFAULT_SELECTION.color.toLowerCase();
  customHex.removeAttribute("aria-invalid");

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored, or storage blocked: the defaults apply either way.
  }

  syncInterface();
}

// Created in initBuilder(); draws the published PDF into previewDoc.
let pdfView = null;

/* -------- Clickable links hint --------
   Readers do not expect a CV preview to have working links, so the preview
   says how many it has and lights them up: once when a copy first shows,
   again when it is expanded, and whenever the hint is clicked. */

const linksHints = document.querySelectorAll(".links-hint");
let linkCount = 0;
let flashedUrl = "";

function showLinksHint() {
  const count = uiPrefs.lang === "fa" ? linkCount.toLocaleString("fa-IR") : String(linkCount);
  const text = linkCount === 1 ? t("linksHintOne") : t("linksHint", { n: count });

  for (const hint of linksHints) {
    hint.hidden = linkCount === 0;
    hint.querySelector(".links-hint-text").textContent = text;
  }
}
const previewState = document.getElementById("previewState");
const previewLabel = document.getElementById("previewLabel");
const previewMeta = document.getElementById("previewMeta");
const previewExpand = document.getElementById("previewExpand");

const previewSkeleton = document.getElementById("previewSkeleton");
const previewBox = document.querySelector(".preview-frame");
const previewCollapse = document.getElementById("previewCollapse");
const builderCard = document.querySelector(".builder-card");
const expandedLabel = document.getElementById("expandedLabel");
const expandedMeta = document.getElementById("expandedMeta");
const expandedDownload = document.getElementById("expandedDownload");
const downloadLatest = document.getElementById("downloadLatest");
const mobilePreview = document.getElementById("mobilePreview");


let variants = new Map();
// False until the published listing arrives. Until then the preview keeps
// its skeleton instead of wrongly reporting a colour as not generated.
let variantsLoaded = false;
let previewLoadTimer = null;
let previewTimer = null;

let elapsedTimer = null;
let buildStartedAt = null;

let selection = {
  mode: "theme",
  theme: DEFAULT_THEME,
  color: "#7030A0",
  variant: DEFAULT_VARIANT,
  language: DEFAULT_LANGUAGE,
};


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

  return theme ? themeName(theme.slug) : themeName(DEFAULT_THEME);
}

function selectionLabel() {
  return `${colourLabel()} · ${t(selection.variant)} · ${t(`lang_${selection.language}`)}`;
}

function variantKey(theme, variant, language) {
  return `${theme}|${variant}|${language}`;
}

function selectedKey() {
  return variantKey(selectedSlug(), selection.variant, selection.language);
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

    if (LANGUAGES.has(stored.language)) {
      selection.language = stored.language;
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

function positionMenu() {
  positionPopover(colourTrigger, colourMenu);
}

function openMenu() {
  closeA11y();
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

// The swatches are rendered by ColourMenu.astro; this only names them in
// the page language.
function localiseSwatches() {
  for (const swatch of themeGrid.children) {
    swatch.setAttribute("aria-label", themeName(swatch.dataset.slug));
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
    setHint(t("hexInvalid"));
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

  // fa-IR also switches the calendar to Solar Hijri.
  return date.toLocaleDateString(uiPrefs.lang === "fa" ? "fa-IR" : undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// The preview is a progressive enhancement: if the build service cannot be
// reached the pane stays hidden and the rest of the page is unaffected.
function keyed(items) {
  return (items || []).map((item) => [
    variantKey(item.theme, item.variant || DEFAULT_VARIANT, item.language || DEFAULT_LANGUAGE),
    item,
  ]);
}

// The last full listing, kept on the device so a returning visitor's
// preview can start at once from the kept copies; the fresh listing then
// replaces it, and only copies rebuilt since are fetched again.
const LISTING_KEY = "cv-builder-listing";

function restoreListing() {
  try {
    const kept = JSON.parse(localStorage.getItem(LISTING_KEY) || "null");

    if (kept && Array.isArray(kept.variants)) {
      variants = new Map(keyed(kept.variants));
      return true;
    }
  } catch {
    // Nothing kept, or storage blocked.
  }

  return false;
}

function keepListing(list) {
  try {
    localStorage.setItem(LISTING_KEY, JSON.stringify({ variants: list }));
  } catch {
    // Keeping it is only a speed-up.
  }
}

// Asks about just the copy about to be shown, so its preview can start
// before the whole listing (every colour, edition and language) is in.
async function loadCurrentVariant() {
  if (selection.mode === "custom") {
    return;
  }

  try {
    const query = new URLSearchParams({
      theme: selection.theme,
      variant: selection.variant,
      language: selection.language,
    });
    const response = await fetch(`${API_URL}/variants?${query}`);

    if (response.ok) {
      for (const [key, item] of keyed((await response.json()).variants)) {
        variants.set(key, item);
      }
    }
  } catch {
    // The full listing below covers it.
  }
}

async function loadVariants() {
  try {
    const response = await fetch(`${API_URL}/variants`);

    if (!response.ok) {
      throw new Error("Variants unavailable.");
    }

    const data = await response.json();

    variants = new Map(keyed(data.variants));
    keepListing(data.variants || []);
    pruneDeviceCache();

    variantsLoaded = true;
    previewPane.classList.remove("is-unavailable");

    return true;
  } catch {
    previewPane.classList.add("is-unavailable");

    return false;
  }
}

// Keyed on the publish time, so the URL only changes when a new copy is
// published and a cached copy can never be a stale one.
function previewUrlFor(published) {
  return (
    `${API_URL}/preview?theme=${encodeURIComponent(published.theme)}` +
    `&variant=${encodeURIComponent(published.variant)}` +
    `&language=${encodeURIComponent(published.language)}` +
    `&v=${Date.parse(published.updatedAt)}`
  );
}

const previewCache = new Map();

// Copies already downloaded: switching to one of these swaps the pages
// straight over instead of showing the loading skeleton first.
const previewReady = new Set();

/* -------- Keeping copies on the device --------
   Every preview URL names one exact copy (it carries the copy's publish
   time), so a downloaded copy is kept in the browser's Cache Storage and
   reused on later visits without asking the network again, until that
   copy is rebuilt, which changes its URL. Copies that have been rebuilt
   since are removed once the fresh listing is in. Custom colours never
   reach this cache: they have no preview. */

const DEVICE_CACHE = "cv-previews-v1";

async function deviceCache() {
  try {
    return "caches" in window ? await caches.open(DEVICE_CACHE) : null;
  } catch {
    return null; // private windows and blocked storage
  }
}

async function fetchCopy(url, background) {
  const store = await deviceCache();
  const kept = store && (await store.match(url));

  if (kept) {
    return kept.blob();
  }

  const response = await fetch(url, { priority: background ? "low" : "high" });

  if (!response.ok) {
    throw new Error("Preview request failed.");
  }

  if (store) {
    store.put(url, response.clone()).catch(() => {});
  }

  return response.blob();
}

// Drops kept copies that are no longer current (rebuilt since).
async function pruneDeviceCache() {
  const store = await deviceCache();

  if (!store) {
    return;
  }

  const current = new Set([...variants.values()].map(previewUrlFor));

  for (const request of await store.keys()) {
    if (!current.has(request.url)) {
      store.delete(request).catch(() => {});
    }
  }
}

function cachedPreview(url, { background = false } = {}) {
  if (!previewCache.has(url)) {
    const promise = fetchCopy(url, background)
      .then((blob) => {
        previewReady.add(url);
        return URL.createObjectURL(blob);
      })
      .catch((error) => {
        previewCache.delete(url);
        throw error;
      });
    previewCache.set(url, promise);
  }
  return previewCache.get(url);
}

/* -------- Fetching the likely next copies --------
   Planned per accent, not per selection. When an accent is chosen (or the
   page opens), every version of it is fetched (digital and print, English
   and Persian), and at the same time the neighbouring accents in the
   picker in the current edition and language, a few downloads at once and
   at low priority. Switching edition or language then needs nothing new:
   those copies are already here. Only choosing another accent plans again,
   and nothing already downloaded is fetched twice. Hovering a swatch or an
   edition/language button fetches that copy straight away. Skipped when
   the visitor has asked to save data or is on a very slow connection. */

const PREFETCH_PARALLEL = 3;
let prefetchQueue = [];
let prefetchActive = 0;
let plannedAccent = "";

function saveData() {
  const connection = navigator.connection;

  return Boolean(connection && (connection.saveData || /(^|-)2g$/.test(connection.effectiveType || "")));
}

function likelyNext() {
  const slug = selectedSlug();
  const { variant, language } = selection;
  const picks = [];

  // Every version of this accent (a custom colour has none published).
  if (slug !== "custom") {
    for (const edition of ["digital", "print"]) {
      for (const lang of ["en", "fa"]) {
        picks.push([slug, edition, lang]);
      }
    }
  }

  // The neighbouring accents, one either side, then two.
  const index = THEMES.findIndex((theme) => theme.slug === (slug === "custom" ? DEFAULT_THEME : slug));

  for (const step of [1, -1, 2, -2]) {
    picks.push([THEMES[(index + step + THEMES.length) % THEMES.length].slug, variant, language]);
  }

  return picks;
}

function publishedUrl(theme, variant, language) {
  const published = variants.get(variantKey(theme, variant, language));

  return published ? previewUrlFor(published) : null;
}

function pumpPrefetch() {
  while (prefetchActive < PREFETCH_PARALLEL && prefetchQueue.length) {
    const url = prefetchQueue.shift();

    if (previewCache.has(url)) {
      continue;
    }

    prefetchActive += 1;
    cachedPreview(url, { background: true })
      .catch(() => {})
      .finally(() => {
        prefetchActive -= 1;
        pumpPrefetch();
      });
  }
}

// Plans once per accent; switching edition or language keeps the plan.
function planPrefetch() {
  const accent = selectedSlug() === "custom" ? `custom:${selection.color}` : selectedSlug();

  if (saveData() || !variantsLoaded || accent === plannedAccent) {
    return;
  }

  plannedAccent = accent;
  prefetchQueue = likelyNext()
    .map(([theme, variant, language]) => publishedUrl(theme, variant, language))
    .filter((url, index, list) => url && !previewCache.has(url) && list.indexOf(url) === index);

  // Start when the page is idle, but within a second even if it never is.
  if (window.requestIdleCallback) {
    window.requestIdleCallback(pumpPrefetch, { timeout: 1000 });
  } else {
    window.setTimeout(pumpPrefetch, 150);
  }
}

// Hovering a choice: fetch that copy now, ahead of the planned ones.
function prefetchNow(theme, variant, language) {
  const url = publishedUrl(theme, variant, language);

  if (url && !previewCache.has(url) && !saveData()) {
    cachedPreview(url, { background: true }).catch(() => {});
  }
}

/* -------- Expanding the preview --------
   The card grows from where it sits to just inside the window (its own
   rectangle is animated, so the glass and the PDF grow with it) while the
   rest of the card slides away and the bar with the title and Close fades
   in; collapsing runs the same steps backwards. See "Pinning the card's
   contents" below for how the steps overlap.

   While the card grows, the PDF is not resized every frame, which is what
   made it judder. It keeps its starting size and is scaled in step with the
   card, then takes its real size once at the end. The viewer fits the page
   to the width either way, so that last swap does not show. */

const GROW_MS = 820;
// Closing is unhurried: a slower shrink and a slower return of the text.
const SHRINK_MS = 920;
const RETURN_FADE_MS = 540;
// The card moves first; the text follows after these pauses.
const LEAVE_DELAY_MS = 180;
const RETURN_AT = 0.55; // of the way through the shrink
// Eases in and out, so the card's size changes at the same even pace as
// the fades around it instead of jumping most of the way at once.
const GROW_EASE = "cubic-bezier(0.45, 0, 0.2, 1)";

// closed → opening → open → closing → closed
let expandState = "closed";

// A click that arrives mid-animation ("close" while it is still growing, or
// "expand" while it shrinks) is remembered and run as soon as it settles.
let queued = null;

function runQueued() {
  const next = queued;

  queued = null;

  if (next === "open") {
    expandPreview();
  } else if (next === "close") {
    collapsePreview();
  }
}

// Waits on the animation clock rather than a timer, so the pauses between
// steps stay in step with the animations themselves, even when a hidden
// tab throttles timers far harder than it slows animations.
function wait(ms) {
  return document.body.animate([], { duration: ms }).finished;
}

function isPhone() {
  return window.matchMedia("(max-width: 640px)").matches;
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Where the preview grows out of: the inline frame, or on phones (which
// have none) the button that opens it.
function previewOrigin() {
  return (isPhone() ? mobilePreview : previewBox).getBoundingClientRect();
}

function within(rect, outer = { left: 0, top: 0 }) {
  return {
    left: rect.left - outer.left,
    top: rect.top - outer.top,
    width: rect.width,
    height: rect.height,
  };
}

// right and bottom stay auto in both frames: the box is otherwise
// over-constrained, and on right-to-left pages the browser would drop
// `left` rather than `right`.
function boxFrame(rect) {
  return {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    right: "auto",
    bottom: "auto",
  };
}

// Animates the card, the frame inside it and the PDF together. They hold
// their last frame until the caller has switched the classes over and then
// settle() cancels them, so no frame of the in-between layout is painted.
function growBetween(cardFrom, cardTo, frameFrom, frameTo, duration) {
  const timing = { duration, easing: GROW_EASE, fill: "forwards" };
  const animations = [
    builderCard.animate([boxFrame(cardFrom), boxFrame(cardTo)], timing),
    previewBox.animate([boxFrame(frameFrom), boxFrame(frameTo)], timing),
  ];

  const showing =
    !previewDoc.hidden &&
    !previewDoc.classList.contains("is-loading") &&
    frameFrom.width > 40 &&
    frameTo.width > 40;

  // No re-rendering mid-grow: the pages are scaled as a picture, then drawn
  // sharp once, at the final size, when settle() releases the hold.
  pdfView.hold(true);

  if (showing) {
    // The frame's width at any moment is exactly this scale of the PDF's
    // width, because both run on the same timing.
    const scale = frameTo.width / frameFrom.width;

    Object.assign(previewDoc.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: `${frameFrom.width}px`,
      height: `${Math.max(frameFrom.height, frameTo.height / scale)}px`,
      transformOrigin: "0 0",
    });

    animations.push(
      previewDoc.animate(
        [{ transform: "scale(1)" }, { transform: `scale(${scale})` }],
        timing
      )
    );
  } else {
    // Nothing on screen to scale (phones start from a button): the page
    // colour grows, and the PDF fades in once the card is in place.
    previewDoc.style.opacity = "0";
  }

  return Promise.all(animations.map((animation) => animation.finished)).then(
    () => animations
  );
}

function settle(animations) {
  const faded = previewDoc.style.opacity === "0";

  for (const animation of animations) {
    animation.cancel();
  }

  // Keep the viewer's own spacing variables; drop only the grow styles.
  for (const property of ["position", "top", "left", "width", "height", "transform-origin", "opacity"]) {
    previewDoc.style.removeProperty(property);
  }

  if (faded) {
    previewDoc.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: "ease-out" });
  }

  // Draw the pages sharp at their new size.
  pdfView.hold(false);
}

/* -------- Pinning the card's contents --------
   The steps overlap rather than running one after another: the text column
   fades and slides away while the card is already growing, and slides back
   in while it is still shrinking. For that it stays on screen during the
   grow, held at the spot it occupies in the small card (absolutely placed
   inside the card, so it rides along with the card's edge), even though
   the grown layout would normally hide it. */

const pinnedParts = [".card-main", ".preview-head", ".preview-foot"].map((selector) =>
  builderCard.querySelector(selector)
);

// Where each part sits inside the card, measured without the fade's slide
// so a part caught mid-fade is still pinned at its true place.
function measureParts() {
  const card = builderCard.getBoundingClientRect();

  return pinnedParts.map((part) => {
    part.style.transition = "none";
    part.style.transform = "none";

    const rect = part.getBoundingClientRect();

    part.style.transform = "";
    void part.offsetWidth;
    part.style.transition = "";

    return rect.width
      ? {
          left: rect.left - card.left - builderCard.clientLeft,
          right: card.right - rect.right - (builderCard.offsetWidth - builderCard.clientWidth - builderCard.clientLeft),
          top: rect.top - card.top - builderCard.clientTop,
          width: rect.width,
          height: rect.height,
        }
      : null;
  });
}

function pinParts(boxes, { leaving = false } = {}) {
  pinnedParts.forEach((part, index) => {
    const box = boxes[index];

    if (!box) {
      return;
    }

    // Leaving in Persian, the text column is held by the card's right edge
    // (its own side), so the growing card carries it away from the preview,
    // the way it is sliding. Everything else is held by the left edge.
    const byRight = leaving && part === pinnedParts[0] && document.documentElement.dir === "rtl";

    part.dataset.pinned = "";
    Object.assign(part.style, {
      left: byRight ? "auto" : `${box.left}px`,
      right: byRight ? `${box.right}px` : "auto",
      top: `${box.top}px`,
      width: `${box.width}px`,
      height: `${box.height}px`,
    });
  });

  builderCard.classList.add("is-growing");
}

function unpinParts() {
  builderCard.classList.remove("is-growing");

  for (const part of pinnedParts) {
    delete part.dataset.pinned;

    for (const property of ["left", "right", "top", "width", "height"]) {
      part.style.removeProperty(property);
    }
  }
}

async function expandPreview() {
  if (expandState === "closing") {
    queued = "open";
    return;
  }

  if (expandState !== "closed" || !variants.has(selectedKey())) {
    return;
  }

  expandState = "opening";
  hideTip();
  closeMenu();
  closeA11y();

  const quick = reducedMotion();
  const cardFrom = builderCard.getBoundingClientRect();
  const frameFrom = within(previewOrigin(), cardFrom);
  const parts = measureParts();

  document.body.classList.add("preview-open");
  pinParts(parts, { leaving: true });

  // The card starts growing at once; the text starts to leave a moment
  // later (a transition delay, so it stays in step with the grow).
  builderCard.style.setProperty("--fade-delay", `${quick ? 0 : LEAVE_DELAY_MS}ms`);
  builderCard.classList.add("is-expanded", "is-fading");

  const cardTo = builderCard.getBoundingClientRect();
  const frameTo = within(previewBox.getBoundingClientRect(), cardTo);
  const growing = growBetween(within(cardFrom), within(cardTo), frameFrom, frameTo, quick ? 0 : GROW_MS);

  // The bar with the title and Close starts fading in early in the grow.
  await wait(quick ? 0 : GROW_MS * 0.2);
  builderCard.classList.add("is-open");

  const animations = await growing;

  settle(animations);
  unpinParts();
  builderCard.style.removeProperty("--fade-delay");
  expandState = "open";

  // The grown card covers the skulls, so they rest while it is open.
  setSkullsPaused("covered", true);
  window.setTimeout(() => pdfView.flashLinks(), 350);
  runQueued();
  previewCollapse.focus({ preventScroll: true });
}

async function collapsePreview() {
  if (expandState === "opening") {
    queued = "close";
    return;
  }

  if (expandState !== "open") {
    return;
  }

  expandState = "closing";
  hideTip();
  setSkullsPaused("covered", false);

  const quick = reducedMotion();

  // Shrink the same layout it lands on: back to fitting the width first.
  if (pdfView.fit !== "width" && !previewDoc.hidden) {
    pdfView.fit = "width";
    await pdfView.render();
  }

  const cardFrom = builderCard.getBoundingClientRect();
  const frameFrom = within(previewBox.getBoundingClientRect(), cardFrom);

  // Measure where everything returns to, then put the grown layout back for
  // the animation. All of it happens before the browser paints.
  builderCard.classList.remove("is-expanded");
  const cardTo = builderCard.getBoundingClientRect();
  const frameTo = within(previewOrigin(), cardTo);
  const parts = measureParts();
  builderCard.classList.add("is-expanded");
  pinParts(parts);

  // The bar fades as the card starts to shrink…
  builderCard.classList.remove("is-open");
  const shrinking = growBetween(within(cardFrom), within(cardTo), frameFrom, frameTo, quick ? 0 : SHRINK_MS);

  // …and once it is past halfway, the text slides back in, more slowly
  // than it left.
  await wait(quick ? 0 : SHRINK_MS * RETURN_AT);
  builderCard.style.setProperty("--fade-ms", `${RETURN_FADE_MS}ms`);
  builderCard.classList.remove("is-fading");

  const animations = await shrinking;

  builderCard.classList.remove("is-expanded");
  settle(animations);
  unpinParts();
  document.body.classList.remove("preview-open");

  // The text's return outlasts the shrink a little; restore the normal
  // fade speed once it is back.
  wait(quick ? 0 : RETURN_FADE_MS).then(() => builderCard.style.removeProperty("--fade-ms"));
  expandState = "closed";

  if (queued) {
    runQueued();
    return;
  }

  (isPhone() ? mobilePreview : previewExpand).focus({ preventScroll: true });
}

// Shows the page-shaped skeleton until the PDF has actually loaded. PDFs
// that a browser refuses to render in a frame never fire "load", so the
// skeleton gives way after a few seconds regardless.
function setPreviewLoading(loading) {
  window.clearTimeout(previewLoadTimer);
  previewSkeleton.hidden = !loading;
  previewDoc.classList.toggle("is-loading", loading);

  if (loading) {
    previewLoadTimer = window.setTimeout(() => setPreviewLoading(false), 10000);
  }
}


function refreshPreview() {
  previewLabel.textContent = selectionLabel();
  expandedLabel.textContent = selectionLabel();

  // Until the full listing is in, only a copy already known can be shown;
  // anything else keeps its skeleton rather than claiming it is missing.
  if (!variantsLoaded && !variants.has(selectedKey())) {
    return;
  }

  previewMeta.classList.remove("is-loading");

  const published = variants.get(selectedKey());

  // Phones have no inline preview; their button opens the viewer instead.
  mobilePreview.disabled = !published;

  // The download button hands over the published copy directly, no build.
  if (published) {
    for (const link of [downloadLatest, expandedDownload]) {
      // The service sends each copy's download link; the release address
      // only covers a service from before copies moved to storage.
      link.href =
        published.downloadUrl ||
        `https://github.com/radyalz/Cv-Builder/releases/download/latest/${published.name}`;
      link.setAttribute("aria-disabled", "false");
    }
  } else {
    for (const link of [downloadLatest, expandedDownload]) {
      link.removeAttribute("href");
      link.setAttribute("aria-disabled", "true");
    }
  }

  if (!published) {
    setPreviewLoading(false);
    previewDoc.hidden = true;
    pdfView.clear();
    linkCount = 0;
    showLinksHint();
    delete previewDoc.dataset.url;

    previewState.hidden = false;
    previewState.textContent =
      t("notGenerated");

    previewMeta.textContent = "";
    previewExpand.hidden = true;

    collapsePreview();

    return;
  }

  const url = previewUrlFor(published);

  // Each copy is downloaded once and kept for the session, so switching
  // back to a colour, or expanding it, never fetches it again.
  if (previewDoc.dataset.url !== url) {
    previewDoc.dataset.url = url;

    // Already downloaded: keep the current pages up until the new ones are
    // drawn, then swap straight over. Otherwise show the skeleton.
    if (!previewReady.has(url)) {
      setPreviewLoading(true);
    }

    cachedPreview(url)
      .catch(() => url)
      .then((source) => previewDoc.dataset.url === url && pdfView.open(source))
      .then((shown) => {
        if (shown && previewDoc.dataset.url === url) {
          setPreviewLoading(false);
          planPrefetch();
        }
      })
      .catch((error) => {
        console.error("Preview failed:", error);
        setPreviewLoading(false);
      });
  }

  previewDoc.hidden = false;
  previewState.hidden = true;

  const date = formatPublished(published.updatedAt);

  previewMeta.textContent = date ? t("published", { date }) : "";
  expandedMeta.textContent = previewMeta.textContent;
  previewExpand.hidden = false;

}

// Clicking through swatches should not fire a request per click.
function schedulePreview() {
  window.clearTimeout(previewTimer);
  previewTimer = window.setTimeout(refreshPreview, 180);
}



/* -------------------------------------------------------------------------
   Interface sync
   ---------------------------------------------------------------------- */

function syncInterface() {
  const accent = uiAccent(selectedHex(), uiPrefs.theme);

  document.documentElement.style.setProperty("--accent", accent);
  document.documentElement.style.setProperty("--accent-text", textOn(accent));
  document.documentElement.style.setProperty("--accent-soft", `${accent}33`);

  paintSkulls(accent, uiPrefs.theme);

  colourTriggerLabel.textContent = colourLabel();

  resetCv.disabled = isDefaultSelection() || button.disabled;

  // The loading skeleton stands in for the CV, so it is laid out in the
  // CV's direction (a Persian CV right to left), not the page's.
  previewSkeleton.dir = selection.language === "fa" ? "rtl" : "ltr";

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

  for (const segment of languageToggle.children) {
    segment.setAttribute(
      "aria-checked",
      segment.dataset.language === selection.language ? "true" : "false"
    );
  }

  if (selection.mode === "custom") {
    setHint(
      relativeLuminance(selection.color) > 0.7
        ? t("hintLight")
        : t("hintCustom")
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

  for (const segment of [...variantToggle.children, ...languageToggle.children]) {
    segment.disabled = !enabled;
  }

  colourTrigger.disabled = !enabled;
  resetCv.disabled = !enabled || isDefaultSelection();
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
  elapsedTime.textContent = t("elapsed", { time: "0:00" });

  elapsedTimer = window.setInterval(() => {
    elapsedTime.textContent =
      t("elapsed", { time: formatElapsed(Date.now() - buildStartedAt) });
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
  button.querySelector(".button-label").textContent = t("building");
  setControlsEnabled(false);
  closeMenu();

  setBuildStatus(
    t("requestingTitle"),
    t("requestingText", { selection: selectionLabel() })
  );

  startElapsedTimer();
}

function showSuccess() {
  stopElapsedTimer();

  buildPanel.hidden = true;
  errorPanel.hidden = true;
  successPanel.hidden = false;

  button.disabled = false;
  button.querySelector(".button-label").textContent = t("generateAgain");
  setControlsEnabled(true);
}

function showError(message) {
  stopElapsedTimer();

  buildPanel.hidden = true;
  successPanel.hidden = true;
  errorPanel.hidden = false;

  errorText.textContent = message;

  button.disabled = false;
  button.querySelector(".button-label").textContent = t("tryAgain");
  setControlsEnabled(true);
}

/* -------------------------------------------------------------------------
   Build flow
   ---------------------------------------------------------------------- */

async function startBuild() {
  const payload = { variant: selection.variant, language: selection.language };

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
    throw new Error(result.error || t("errStart"));
  }

  if (!result.buildId) {
    throw new Error(t("errNoId"));
  }

  return {
    buildId: result.buildId,
    theme: result.theme || selectedSlug(),
    variant: result.variant || selection.variant,
    language: result.language || selection.language,
    // Present when a current copy was already published: no build needed.
    downloadUrl: result.status === "completed" ? result.downloadUrl : null,
  };
}

async function deliver(downloadUrl, message) {
  setBuildStatus(t("completeTitle"), message);

  await new Promise((resolve) => window.setTimeout(resolve, 650));

  showSuccess();

  // The refreshed listing carries the new publish time, which is part of
  // the preview URL, so the new copy is fetched instead of a cached one.
  await loadVariants();
  refreshPreview();

  window.location.assign(downloadUrl);
}

async function getBuildStatus(buildId, theme, variant, language) {
  const response = await fetch(
    `${API_URL}/status?id=${encodeURIComponent(buildId)}` +
      `&theme=${encodeURIComponent(theme)}` +
      `&variant=${encodeURIComponent(variant)}` +
      `&language=${encodeURIComponent(language)}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || t("errStatus"));
  }

  return result;
}

// A build takes about fifteen seconds, so there is no point asking before
// then; after that the service is asked every second and a half, so the
// download starts within moments of the copy being stored.
async function waitForBuild(buildId, theme, variant, language) {
  let first = true;

  while (true) {
    await new Promise((resolve) => window.setTimeout(resolve, first ? 9000 : 1500));
    first = false;

    const result = await getBuildStatus(buildId, theme, variant, language);

    if (result.status === "completed") {
      if (!result.downloadUrl) {
        throw new Error(t("errNoUrl"));
      }

      await deliver(
        result.downloadUrl,
        t("publishedStarting")
      );
      return;
    }

    if (result.status === "failed") {
      throw new Error(t("errFailed"));
    }

    if (result.status === "running") {
      setBuildStatus(
        t("renderingTitle"),
        t("renderingText")
      );
      continue;
    }

    setBuildStatus(
      t("queuedTitle"),
      t("queuedText")
    );
  }
}


/* -------- Tooltip content --------
   Every tooltip says what the control does and, where it matters, exactly
   what it will act on right now: the file, colour, edition, language,
   publish date and so on. Built fresh each time it opens. */

function assetNameFor(theme, variant, language) {
  return (
    "RadmanAlizadeh-Cv" +
    (theme === DEFAULT_THEME ? "" : `-${theme}`) +
    (variant === "print" ? "-print" : "") +
    (language === "fa" ? "-fa" : "") +
    ".pdf"
  );
}

function formatSize(bytes) {
  if (!bytes) {
    return "";
  }

  const kb = Math.round(bytes / 1024);

  return uiPrefs.lang === "fa" ? `${kb.toLocaleString("fa-IR")} کیلوبایت` : `${kb} KB`;
}

function publishedFor(variant, language) {
  return variants.get(variantKey(selectedSlug(), variant, language));
}

function tipContent(element) {
  const lang = uiPrefs.lang;
  const key = element.dataset.tip;
  const fact = (name) => FACTS[lang][name] ?? FACTS.en[name];
  const base = (name) => (TIPS[lang] && TIPS[lang][name]) || TIPS.en[name] || [name, ""];
  const colourRow = [fact("colour"), colourLabel(), { dot: selectedHex() }];
  const editionRow = [fact("edition"), t(selection.variant)];
  const languageRow = [fact("language"), t(`lang_${selection.language}`)];
  const statusOf = (item) => [
    fact("status"),
    item ? t("published", { date: formatPublished(item.updatedAt) }) : fact("notYet"),
  ];

  let [title, body] = base(key);
  let facts = [];
  let hint = "";

  switch (key) {
    case "generate": {
      facts = [colourRow, editionRow, languageRow];

      if (selection.mode !== "custom") {
        facts.unshift([fact("file"), assetNameFor(selection.theme, selection.variant, selection.language), { mono: true }]);
      }

      facts.push([fact("buildTime"), fact("buildTimeValue")]);
      break;
    }

    case "download": {
      const published = variants.get(selectedKey());

      if (selection.mode === "custom") {
        [title, body] = base("downloadCustom");
        facts = [colourRow];
      } else if (!published) {
        [title, body] = base("downloadMissing");
        facts = [colourRow, editionRow, languageRow];
      } else {
        facts = [
          [fact("file"), published.name, { mono: true }],
          colourRow,
          editionRow,
          languageRow,
          [fact("published"), formatPublished(published.updatedAt)],
          [fact("size"), formatSize(published.size)],
        ];
      }
      break;
    }

    case "allCopies": {
      if (variantsLoaded) {
        const latest = Math.max(0, ...[...variants.values()].map((item) => Date.parse(item.updatedAt) || 0));

        facts = [
          [fact("copies"), uiPrefs.lang === "fa" ? variants.size.toLocaleString("fa-IR") : String(variants.size)],
          [fact("latest"), latest ? formatPublished(latest) : "—"],
        ];
      }

      facts.push([fact("opens"), fact("newTab")]);
      break;
    }

    case "accent":
      facts = [colourRow, [fact("hex"), selectedHex(), { mono: true }]];
      break;

    case "digital":
    case "print":
      facts = [colourRow, languageRow, statusOf(publishedFor(key, selection.language))];
      break;

    case "cvEn":
    case "cvFa": {
      const language = key === "cvFa" ? "fa" : "en";

      facts = [colourRow, editionRow, statusOf(publishedFor(selection.variant, language))];
      break;
    }

    case "expand": {
      const published = variants.get(selectedKey());

      facts = [colourRow, editionRow, languageRow];

      if (published) {
        facts.push([fact("published"), formatPublished(published.updatedAt)]);
      }

      hint = { label: fact("shortcut"), key: "Esc" };
      break;
    }

    case "close":
      hint = { label: fact("shortcut"), key: "Esc" };
      break;

    case "pick":
      facts = [[fact("hex"), customColor.value.toUpperCase(), { mono: true, dot: customColor.value }]];
      break;

    case "use": {
      const hex = normaliseHex(customHex.value);

      facts = [[fact("hex"), hex || customHex.value, { mono: true, dot: hex || undefined }]];
      break;
    }

    case "resetCv":
      facts = [
        [fact("colour"), themeName(DEFAULT_THEME), { dot: THEME_BY_SLUG.get(DEFAULT_THEME).hex }],
        [fact("edition"), t(DEFAULT_VARIANT)],
        [fact("language"), t(`lang_${DEFAULT_LANGUAGE}`)],
      ];
      break;

    case "resetPrefs": {
      const index = lang === "fa" ? 1 : 0;

      facts = [
        [fact("page"), t("lang_en")],
        [fact("appearance"), t("system")],
        [fact("text"), "100%"],
        [fact("fonts"), lang === "fa" ? FA_FONTS.yekan.name[index] : EN_FONTS.inter.name],
      ];
      break;
    }

    case "a11y": {
      const en = EN_FONTS[uiPrefs.enFont];
      const fa = FA_FONTS[uiPrefs.faFont];
      const index = lang === "fa" ? 1 : 0;

      facts = [
        [fact("page"), t(`lang_${uiPrefs.lang}`)],
        [fact("appearance"), t(uiPrefs.theme)],
        [fact("text"), `${Math.round(uiPrefs.fs * 100)}%`],
        [fact("fonts"), lang === "fa" ? fa.name[index] : en.name],
      ];
      break;
    }

    case "sizeSmall":
    case "sizeDefault":
    case "sizeLarge":
    case "sizeLarger":
      facts = [[fact("scale"), `${Math.round(Number(element.dataset.fs) * 100)}%`]];
      break;

    case "swatch": {
      const theme = THEME_BY_SLUG.get(element.dataset.slug);
      const built = [...variants.values()].filter((item) => item.theme === element.dataset.slug).length;

      title = themeName(element.dataset.slug);
      facts = [[fact("hex"), theme.hex, { mono: true, dot: theme.hex }]];

      if (variantsLoaded) {
        facts.push([fact("builtCopies"), lang === "fa" ? `${built.toLocaleString("fa-IR")} از ۴` : `${built} of 4`]);
      }
      break;
    }

    case "font": {
      const index = lang === "fa" ? 1 : 0;
      const font = element.dataset.enFont ? EN_FONTS[element.dataset.enFont] : FA_FONTS[element.dataset.faFont];

      title = Array.isArray(font.name) ? font.name[index] : font.name;
      body = font.note[index];
      facts = [[fact("style"), font.style[index]]];
      break;
    }

    default:
      break;
  }

  return { title, body, facts: facts.filter((row) => row[1]), hint };
}


/* -------------------------------------------------------------------------
   Wiring
   ---------------------------------------------------------------------- */

let started = false;

export function initBuilder() {
  if (started) {
    return;
  }

  started = true;

  // Idempotent; makes sure the stored preferences are in place before the
  // first paint of the accent and skulls, whichever script runs first.
  initPrefs();
  setTipContent(tipContent);
  loadSelection();

  customColor.value = selectedHex().toLowerCase();
  customHex.value = selectedHex();

  localiseSwatches();
  syncInterface();
  // The copy on screen first, then everything else, then the likely next
  // copies (which need the full listing to find the neighbours).
  // A returning visitor's kept listing lets the preview start at once; the
  // question about the current copy is then unnecessary.
  const restored = restoreListing();

  if (restored) {
    refreshPreview();
  }

  (restored ? Promise.resolve() : loadCurrentVariant())
    .then(() => {
      if (variants.size) {
        refreshPreview();
      }

      return loadVariants();
    })
    .then(() => {
      refreshPreview();

      if (!previewDoc.hidden && !previewDoc.classList.contains("is-loading")) {
        planPrefetch();
      }
    });

  // Page language or appearance changed in the accessibility menu.
  document.addEventListener("prefs:change", () => {
    showLinksHint();
    localiseSwatches();
    syncInterface();
  });

  for (const hint of linksHints) {
    hint.addEventListener("click", () => pdfView.flashLinks());
  }

  resetCv.addEventListener("click", resetSelection);

  // Hover intent: the copy a pointer is resting on is probably next.
  themeGrid.addEventListener("pointerover", (event) => {
    const swatch = event.target.closest(".swatch");

    if (swatch) {
      prefetchNow(swatch.dataset.slug, selection.variant, selection.language);
    }
  });

  variantToggle.addEventListener("pointerover", (event) => {
    const segment = event.target.closest(".segment");

    if (segment) {
      prefetchNow(selectedSlug(), segment.dataset.variant, selection.language);
    }
  });

  languageToggle.addEventListener("pointerover", (event) => {
    const segment = event.target.closest(".segment");

    if (segment) {
      prefetchNow(selectedSlug(), selection.variant, segment.dataset.language);
    }
  });

  // Opening the accessibility menu closes this one.
  document.addEventListener("menus:close", closeMenu);

  themeGrid.addEventListener("click", (event) => {
    const swatch = event.target.closest(".swatch");

    if (!swatch || swatch.disabled) {
      return;
    }

    selection = { ...selection, mode: "theme", theme: swatch.dataset.slug };
    saveSelection();
    syncInterface();
  });

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

    if (expandState !== "closed") {
      collapsePreview();
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

  languageToggle.addEventListener("click", (event) => {
    const segment = event.target.closest(".segment");

    if (!segment || !LANGUAGES.has(segment.dataset.language)) {
      return;
    }

    selection = { ...selection, language: segment.dataset.language };
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

  pdfView = new PdfView(previewDoc);

  // Fit and zoom controls in the grown card's bar.
  builderCard.querySelector(".pdf-tools").addEventListener("click", (event) => {
    const action = event.target.closest("[data-pdf]")?.dataset.pdf;

    if (action === "fit-width") pdfView.setFit("width");
    if (action === "fit-page") pdfView.setFit("page");
    if (action === "zoom-in") pdfView.zoomBy(1.2);
    if (action === "zoom-out") pdfView.zoomBy(1 / 1.2);
  });

  // PDF.js scale 1 is one CSS pixel per point; 100% is the page's printed
  // size on screen, 96/72 of that.
  previewDoc.addEventListener("pdf:rendered", ({ detail }) => {
    linkCount = detail.links;
    showLinksHint();

    // Light the links the first time each copy is on screen.
    if (previewDoc.dataset.url !== flashedUrl && previewDoc.clientWidth) {
      flashedUrl = previewDoc.dataset.url;
      pdfView.flashLinks();
    }

    pdfZoom.textContent = `${Math.round((detail.scale / (96 / 72)) * 100)}%`;

    for (const button of builderCard.querySelectorAll("[data-pdf^=fit]")) {
      button.setAttribute("aria-pressed", String(button.dataset.pdf === `fit-${pdfView.fit}`));
    }
  });


  previewExpand.addEventListener("click", expandPreview);
  mobilePreview.addEventListener("click", expandPreview);
  previewCollapse.addEventListener("click", () => collapsePreview());

  // A click in the margin around the grown card closes it.
  document.addEventListener("click", (event) => {
    if (expandState === "open" && !builderCard.contains(event.target)) {
      collapsePreview();
    }
  });

  button.addEventListener("click", async () => {
    try {
      showBuilding();

      const { buildId, theme, variant, language, downloadUrl } = await startBuild();

      if (downloadUrl) {
        await deliver(
          downloadUrl,
          t("upToDate")
        );
        return;
      }

      setBuildStatus(
        t("startedTitle"),
        t("startedText", { id: buildId })
      );

      await waitForBuild(buildId, theme, variant, language);
    } catch (error) {
      console.error("CV Builder error:", error);

      showError(
        error instanceof Error
          ? error.message
          : t("errGeneric")
      );
    }
  });
}
