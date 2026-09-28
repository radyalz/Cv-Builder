const API_URL = "https://cv-api.radyalz.ir";
const RELEASE_URL = "https://github.com/radyalz/Cv-Builder/releases/download/latest";
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

const DEFAULT_LANGUAGE = "en";
const LANGUAGES = new Set([DEFAULT_LANGUAGE, "fa"]);

// Page text in both languages. The accessibility menu switches between
// them; English fills any key Persian is missing.
const STRINGS = {
  en: {
    eyebrow: "ON-DEMAND CV",
    name: "Radman Alizadeh",
    lead: "Generate the newest version of my CV, in whichever colour and edition you prefer.",
    accent: "Accent",
    edition: "Edition",
    cvLanguage: "CV language",
    digital: "Digital",
    print: "Print",
    generate: "Generate Latest CV",
    generateAgain: "Generate Again",
    tryAgain: "Try Again",
    building: "Building CV…",
    allCopies: "All published copies",
    preview: "Preview",
    previewFrame: "Published CV preview",
    expand: "Expand",
    expandPreview: "Expand preview",
    close: "Close",
    chooseAccent: "Choose an accent colour",
    presets: "Preset colours",
    custom: "Custom",
    customHex: "Custom colour, hex value",
    use: "Use",
    typical: "Typical build: under a minute",
    readyTitle: "Latest CV is ready",
    readyText: "Your download should start automatically.",
    failedTitle: "Build failed",
    a11y: "Accessibility",
    pageLanguage: "Page language",
    appearance: "Appearance",
    dark: "Dark",
    light: "Light",
    textSize: "Text size",
    sizeSmall: "Small",
    sizeDefault: "Default",
    sizeLarge: "Large",
    sizeLarger: "Larger",
    lang_en: "English",
    lang_fa: "Persian",
    published: "Published {date}",
    notGenerated: "This combination has not been generated yet. Use Generate Latest CV to build it, and the result appears here.",
    elapsed: "Elapsed: {time}",
    requestingTitle: "Requesting a fresh build…",
    requestingText: "Connecting to the CV build service. {selection}.",
    startedTitle: "Build started",
    startedText: "Build #{id} is running. You can keep this tab open.",
    renderingTitle: "Rendering the latest CV…",
    renderingText: "Compiling the document and recalculating current experience durations.",
    queuedTitle: "Build queued…",
    queuedText: "The request was accepted and is waiting for a runner.",
    completeTitle: "Build complete",
    publishedStarting: "The newest CV has been published. Starting your download…",
    upToDate: "This copy is already up to date. Starting your download…",
    errStart: "Unable to start CV generation.",
    errNoId: "The build service did not return a build ID.",
    errStatus: "Unable to check CV generation status.",
    errNoUrl: "The build completed without a download URL.",
    errFailed: "The CV build failed.",
    errGeneric: "CV generation failed. Please try again.",
    hexInvalid: "Enter a colour as six hex digits, for example #FF8800.",
    hintLight: "Very light colours can be hard to read on a printed CV. The headings are darkened automatically, but a mid-tone colour usually reads better.",
    hintCustom: "The lighter and muted shades of the CV are derived from this colour automatically.",
    download: "Download published copy",
    downloadTip: "Download the published copy of this colour, edition and language straight away",
    generateTip: "Build a fresh copy with today's durations, then download it",
    allCopiesTip: "See every published copy on GitHub",
    accentTip: "Choose the CV's accent colour",
    digitalTip: "Digital edition, with links to the portfolio",
    printTip: "Print edition, without links",
    cvEnTip: "Build the CV in English",
    cvFaTip: "Build the CV in Persian",
    expandTip: "Expand the preview to fill the window",
    closeTip: "Close the expanded preview (Esc)",
    pickTip: "Pick any colour",
    useTip: "Apply the colour typed in the box",
    a11yTip: "Accessibility: page language, appearance and text size",
    uiEnTip: "Show this page in English",
    uiFaTip: "Show this page in Persian",
    darkTip: "Dark appearance",
    lightTip: "Light appearance",
    sizeSmallTip: "Smaller text",
    sizeDefaultTip: "Default text size",
    sizeLargeTip: "Larger text",
    sizeLargerTip: "Largest text",
  },
  fa: {
    eyebrow: "رزومه به‌روز",
    name: "رادمان علیزاده",
    lead: "جدیدترین نسخه رزومه‌ام را با رنگ و نسخه دلخواه‌تان بسازید.",
    accent: "رنگ",
    edition: "نسخه",
    cvLanguage: "زبان رزومه",
    digital: "دیجیتال",
    print: "چاپی",
    generate: "ساخت جدیدترین رزومه",
    generateAgain: "ساخت دوباره",
    tryAgain: "تلاش دوباره",
    building: "در حال ساخت رزومه…",
    allCopies: "همه نسخه‌های منتشرشده",
    preview: "پیش‌نمایش",
    previewFrame: "پیش‌نمایش رزومه منتشرشده",
    expand: "بزرگ‌نمایی",
    expandPreview: "بزرگ‌نمایی پیش‌نمایش",
    close: "بستن",
    chooseAccent: "انتخاب رنگ",
    presets: "رنگ‌های آماده",
    custom: "دلخواه",
    customHex: "رنگ دلخواه، کد هگز",
    use: "اعمال",
    typical: "زمان معمول ساخت: کمتر از یک دقیقه",
    readyTitle: "رزومه آماده است",
    readyText: "دانلود باید خودکار آغاز شود.",
    failedTitle: "ساخت ناموفق بود",
    a11y: "دسترس‌پذیری",
    pageLanguage: "زبان صفحه",
    appearance: "ظاهر",
    dark: "تیره",
    light: "روشن",
    textSize: "اندازه متن",
    sizeSmall: "کوچک",
    sizeDefault: "پیش‌فرض",
    sizeLarge: "بزرگ",
    sizeLarger: "بزرگ‌تر",
    lang_en: "انگلیسی",
    lang_fa: "فارسی",
    published: "منتشرشده در {date}",
    notGenerated: "این ترکیب هنوز ساخته نشده است. با «ساخت جدیدترین رزومه» آن را بسازید تا نتیجه همین‌جا نمایش داده شود.",
    elapsed: "زمان سپری‌شده: {time}",
    requestingTitle: "درخواست ساخت تازه…",
    requestingText: "در حال اتصال به سرویس ساخت رزومه. {selection}.",
    startedTitle: "ساخت آغاز شد",
    startedText: "ساخت شماره {id} در حال اجراست. می‌توانید این صفحه را باز نگه دارید.",
    renderingTitle: "در حال ساخت جدیدترین رزومه…",
    renderingText: "در حال کامپایل سند و محاسبه دوباره مدت سوابق کاری.",
    queuedTitle: "در صف ساخت…",
    queuedText: "درخواست پذیرفته شد و منتظر اجراست.",
    completeTitle: "ساخت کامل شد",
    publishedStarting: "جدیدترین رزومه منتشر شد. دانلود آغاز می‌شود…",
    upToDate: "این نسخه به‌روز است. دانلود آغاز می‌شود…",
    errStart: "آغاز ساخت رزومه ممکن نشد.",
    errNoId: "سرویس ساخت شناسه‌ای برنگرداند.",
    errStatus: "بررسی وضعیت ساخت ممکن نشد.",
    errNoUrl: "ساخت کامل شد اما پیوند دانلودی برنگشت.",
    errFailed: "ساخت رزومه ناموفق بود.",
    errGeneric: "ساخت رزومه ناموفق بود. دوباره تلاش کنید.",
    hexInvalid: "رنگ را به‌صورت شش رقم هگز وارد کنید، مثلاً #FF8800.",
    hintLight: "رنگ‌های خیلی روشن در رزومه چاپی سخت خوانده می‌شوند. عنوان‌ها خودکار تیره‌تر می‌شوند، اما رنگی با روشنایی متوسط معمولاً خواناتر است.",
    hintCustom: "سایه‌های روشن‌تر و ملایم رزومه خودکار از همین رنگ ساخته می‌شوند.",
    download: "دانلود نسخه منتشرشده",
    downloadTip: "دانلود فوری نسخه منتشرشده با همین رنگ، نسخه و زبان",
    generateTip: "ساخت نسخه‌ای تازه با مدت‌های امروز و دانلود آن",
    allCopiesTip: "دیدن همه نسخه‌های منتشرشده در گیت‌هاب",
    accentTip: "انتخاب رنگ رزومه",
    digitalTip: "نسخه دیجیتال، همراه با پیوند نمونه‌کارها",
    printTip: "نسخه چاپی، بدون پیوند",
    cvEnTip: "ساخت رزومه به انگلیسی",
    cvFaTip: "ساخت رزومه به فارسی",
    expandTip: "بزرگ‌نمایی پیش‌نمایش به اندازه پنجره",
    closeTip: "بستن پیش‌نمایش بزرگ (Esc)",
    pickTip: "انتخاب هر رنگی",
    useTip: "اعمال رنگ واردشده",
    a11yTip: "دسترس‌پذیری: زبان صفحه، ظاهر و اندازه متن",
    uiEnTip: "نمایش این صفحه به انگلیسی",
    uiFaTip: "نمایش این صفحه به فارسی",
    darkTip: "ظاهر تیره",
    lightTip: "ظاهر روشن",
    sizeSmallTip: "متن کوچک‌تر",
    sizeDefaultTip: "اندازه پیش‌فرض متن",
    sizeLargeTip: "متن بزرگ‌تر",
    sizeLargerTip: "بزرگ‌ترین متن",
  },
};

const FA_COLOURS = {
  purple: "بنفش",
  violet: "بنفشه‌ای",
  indigo: "نیلی",
  blue: "آبی",
  sky: "آبی آسمانی",
  teal: "سبزآبی",
  emerald: "زمردی",
  green: "سبز",
  olive: "زیتونی",
  amber: "کهربایی",
  orange: "نارنجی",
  red: "قرمز",
  rose: "گلبهی",
  burgundy: "زرشکی",
  brown: "قهوه‌ای",
  slate: "سنگی",
  graphite: "گرافیتی",
  mono: "سیاه و سفید",
};

const UI_KEY = "cv-builder-a11y";
const TEXT_SIZES = [0.9, 1, 1.15, 1.3];

// Page language, appearance and text size from the accessibility menu.
// Appearance starts from the system setting until the visitor picks one.
let uiPrefs = { lang: "en", theme: "dark", fs: 1 };

function t(key, vars = {}) {
  let text = (STRINGS[uiPrefs.lang] || STRINGS.en)[key] ?? STRINGS.en[key] ?? key;

  for (const [name, value] of Object.entries(vars)) {
    text = text.replace(`{${name}}`, value);
  }

  return text;
}

function themeName(slug) {
  if (uiPrefs.lang === "fa" && FA_COLOURS[slug]) {
    return FA_COLOURS[slug];
  }

  const theme = THEME_BY_SLUG.get(slug);

  return theme ? theme.label : "Purple";
}

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
const previewFrame = document.getElementById("previewFrame");
const previewState = document.getElementById("previewState");
const previewLabel = document.getElementById("previewLabel");
const previewMeta = document.getElementById("previewMeta");
const previewExpand = document.getElementById("previewExpand");

const previewSkeleton = document.getElementById("previewSkeleton");
const skullField = document.querySelector(".skull-field");
const previewBox = document.querySelector(".preview-frame");
const previewCollapse = document.getElementById("previewCollapse");
const previewBackdrop = document.querySelector(".preview-backdrop");
const a11yTrigger = document.getElementById("a11yTrigger");
const a11yMenu = document.getElementById("a11yMenu");
const downloadLatest = document.getElementById("downloadLatest");
const tooltip = document.getElementById("tooltip");
const mobilePreview = document.getElementById("mobilePreview");

let variants = new Map();
// False until the published listing arrives. Until then the preview keeps
// its skeleton instead of wrongly reporting a colour as not generated.
let variantsLoaded = false;
let previewLoadTimer = null;
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
  language: DEFAULT_LANGUAGE,
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

  // On the light appearance the problem flips: pale accents are darkened.
  if (uiPrefs.theme === "light") {
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

// The card clips its own overflow so the page never scrolls, so the menu
// lives at the top level and is placed against its trigger instead.
// Menus sit outside the card, which clips its own overflow, and are placed
// against their trigger: its start edge, which is the right edge in RTL.
function positionPopover(trigger, menu) {
  const rect = trigger.getBoundingClientRect();
  const width = menu.offsetWidth;
  const height = menu.offsetHeight;
  const margin = 8;

  let left = document.documentElement.dir === "rtl" ? rect.right - width : rect.left;
  let top = rect.bottom + margin;

  left = Math.min(left, window.innerWidth - width - margin);
  left = Math.max(margin, left);

  if (top + height > window.innerHeight - margin) {
    top = Math.max(margin, rect.top - height - margin);
  }

  menu.style.left = `${Math.round(left)}px`;
  menu.style.top = `${Math.round(top)}px`;
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
async function loadVariants() {
  try {
    const response = await fetch(`${API_URL}/variants`);

    if (!response.ok) {
      throw new Error("Variants unavailable.");
    }

    const data = await response.json();

    variants = new Map(
      (data.variants || []).map((item) => [
        variantKey(
          item.theme,
          item.variant || DEFAULT_VARIANT,
          item.language || DEFAULT_LANGUAGE
        ),
        item,
      ])
    );

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
function previewUrl(published) {
  return (
    `${API_URL}/preview?theme=${encodeURIComponent(selectedSlug())}` +
    `&variant=${encodeURIComponent(selection.variant)}` +
    `&language=${encodeURIComponent(selection.language)}` +
    `&v=${Date.parse(published.updatedAt)}`
  );
}

const previewCache = new Map();

function cachedPreview(url) {
  if (!previewCache.has(url)) {
    const promise = fetch(url)
      .then(response => {
        if (!response.ok) throw new Error("Preview request failed.");
        return response.blob();
      })
      .then(blob => URL.createObjectURL(blob))
      .catch(error => {
        previewCache.delete(url);
        throw error;
      });
    previewCache.set(url, promise);
  }
  return previewCache.get(url);
}

function expandPreview() {
  if (!variants.has(selectedKey()) || previewBox.classList.contains("is-expanded")) return;
  const first = previewBox.getBoundingClientRect();
  document.body.classList.add("preview-open");
  previewBox.classList.add("is-expanded");
  const last = previewBox.getBoundingClientRect();
  if (first.width > 0) {
    previewBox.style.transformOrigin = "0 0";
    const dx = first.left - last.left;
    const dy = first.top - last.top;
    const sx = first.width / last.width;
    const sy = first.height / last.height;
    previewBox.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
    void previewBox.offsetWidth;
    previewBox.style.transition = "transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1)";
    previewBox.style.transform = "";
  }
  previewCollapse.hidden = false;
  previewCollapse.focus();
}

function collapsePreview() {
  if (!previewBox.classList.contains("is-expanded")) return;
  const first = previewBox.getBoundingClientRect();
  previewBox.classList.remove("is-expanded");
  document.body.classList.remove("preview-open");
  previewCollapse.hidden = true;
  const last = previewBox.getBoundingClientRect();
  if (last.width > 0) {
    previewBox.style.transition = "none";
    previewBox.style.transformOrigin = "0 0";
    const dx = first.left - last.left;
    const dy = first.top - last.top;
    const sx = first.width / last.width;
    const sy = first.height / last.height;
    previewBox.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
    void previewBox.offsetWidth;
    previewBox.style.transition = "transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1)";
    previewBox.style.transform = "";
  } else {
    previewBox.style.transform = "";
    previewBox.style.transition = "";
  }
}

// Shows the page-shaped skeleton until the PDF has actually loaded. PDFs
// that a browser refuses to render in a frame never fire "load", so the
// skeleton gives way after a few seconds regardless.
function setPreviewLoading(loading) {
  window.clearTimeout(previewLoadTimer);
  previewSkeleton.hidden = !loading;
  previewFrame.classList.toggle("is-loading", loading);

  if (loading) {
    previewLoadTimer = window.setTimeout(() => setPreviewLoading(false), 10000);
  }
}


function refreshPreview() {
  previewLabel.textContent = selectionLabel();

  if (!variantsLoaded) {
    return;
  }

  previewMeta.classList.remove("is-loading");

  const published = variants.get(selectedKey());

  // Phones have no inline preview; their button opens the viewer instead.
  mobilePreview.disabled = !published;

  // The download button hands over the published copy directly, no build.
  if (published) {
    downloadLatest.href = `${RELEASE_URL}/${published.name}?v=${Date.parse(published.updatedAt)}`;
    downloadLatest.setAttribute("aria-disabled", "false");
  } else {
    downloadLatest.removeAttribute("href");
    downloadLatest.setAttribute("aria-disabled", "true");
  }

  if (!published) {
    setPreviewLoading(false);
    previewFrame.hidden = true;
    previewFrame.removeAttribute("src");
    delete previewFrame.dataset.url;

    previewState.hidden = false;
    previewState.textContent =
      t("notGenerated");

    previewMeta.textContent = "";
    previewExpand.hidden = true;

    collapsePreview();

    return;
  }

  const url = previewUrl(published);

  // Each copy is downloaded once and kept for the session, so switching
  // back to a colour, or expanding it, never fetches it again.
  if (previewFrame.dataset.url !== url) {
    previewFrame.dataset.url = url;
    setPreviewLoading(true);

    cachedPreview(url)
      .then((objectUrl) => {
        if (previewFrame.dataset.url === url) {
          previewFrame.src = objectUrl;
        }
      })
      .catch(() => {
        if (previewFrame.dataset.url === url) {
          previewFrame.src = url;
        }
      });
  }

  previewFrame.hidden = false;
  previewState.hidden = true;

  const date = formatPublished(published.updatedAt);

  previewMeta.textContent = date ? t("published", { date }) : "";
  previewExpand.hidden = false;

}

// Clicking through swatches should not fire a request per click.
function schedulePreview() {
  window.clearTimeout(previewTimer);
  previewTimer = window.setTimeout(refreshPreview, 180);
}



/* -------------------------------------------------------------------------
   Accessibility: page language, appearance, text size
   ---------------------------------------------------------------------- */

function loadUiPrefs() {
  uiPrefs.theme = window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";

  try {
    const stored = JSON.parse(localStorage.getItem(UI_KEY) || "null");

    if (stored && typeof stored === "object") {
      if (stored.lang === "en" || stored.lang === "fa") {
        uiPrefs.lang = stored.lang;
      }

      if (stored.theme === "dark" || stored.theme === "light") {
        uiPrefs.theme = stored.theme;
      }

      if (TEXT_SIZES.includes(stored.fs)) {
        uiPrefs.fs = stored.fs;
      }
    }
  } catch {
    // A blocked or corrupt store just means the defaults are used.
  }
}

function applyUi({ save = true } = {}) {
  const root = document.documentElement;

  root.lang = uiPrefs.lang;
  root.dir = uiPrefs.lang === "fa" ? "rtl" : "ltr";
  root.dataset.theme = uiPrefs.theme;
  root.style.setProperty("--fs", String(uiPrefs.fs));

  for (const el of document.querySelectorAll("[data-i18n]")) {
    el.textContent = t(el.dataset.i18n);
  }

  for (const el of document.querySelectorAll("[data-i18n-aria]")) {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  }

  for (const el of document.querySelectorAll("[data-i18n-title]")) {
    el.title = t(el.dataset.i18nTitle);
  }

  for (const swatch of themeGrid.children) {
    const name = themeName(swatch.dataset.slug);
    swatch.removeAttribute("title");
    swatch.dataset.tipText = name;
    swatch.setAttribute("aria-label", name);
  }

  for (const segment of a11yMenu.querySelectorAll(".segment")) {
    const current =
      segment.dataset.uiLang !== undefined
        ? segment.dataset.uiLang === uiPrefs.lang
        : segment.dataset.theme !== undefined
          ? segment.dataset.theme === uiPrefs.theme
          : Number(segment.dataset.fs) === uiPrefs.fs;

    segment.setAttribute("aria-checked", current ? "true" : "false");
  }

  if (save) {
    try {
      localStorage.setItem(UI_KEY, JSON.stringify(uiPrefs));
    } catch {
      // Remembering the choice is a convenience, never a requirement.
    }
  }

  syncInterface();

  if (!a11yMenu.hidden) {
    positionPopover(a11yTrigger, a11yMenu);
  }
}

function openA11y() {
  closeMenu();
  a11yMenu.hidden = false;
  a11yTrigger.setAttribute("aria-expanded", "true");
  positionPopover(a11yTrigger, a11yMenu);
}

function closeA11y() {
  a11yMenu.hidden = true;
  a11yTrigger.setAttribute("aria-expanded", "false");
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

async function waitForBuild(buildId, theme, variant, language) {
  while (true) {
    await new Promise((resolve) => window.setTimeout(resolve, 5000));

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

/* -------------------------------------------------------------------------
   Ripple and tooltips
   ---------------------------------------------------------------------- */

const RIPPLE_TARGETS =
  ".primary-button, .ghost-button, .segment, .menu-trigger, .mobile-preview, .download-button, .swatch, .a11y-trigger";

// A material-style ink ripple from the point of the press.
document.addEventListener("pointerdown", (event) => {
  const target = event.target.closest(RIPPLE_TARGETS);

  if (!target || target.disabled || target.getAttribute("aria-disabled") === "true") {
    return;
  }

  const rect = target.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const wave = document.createElement("span");

  wave.className = "ripple";
  wave.style.width = `${size}px`;
  wave.style.height = `${size}px`;
  wave.style.left = `${event.clientX - rect.left - size / 2}px`;
  wave.style.top = `${event.clientY - rect.top - size / 2}px`;

  target.append(wave);
  wave.addEventListener("animationend", () => wave.remove());
});

let tipTimer = null;
let tipTarget = null;

function tipText(element) {
  return element.dataset.tipText || (element.dataset.tip ? t(element.dataset.tip) : "");
}

function showTip(element) {
  const text = tipText(element);

  if (!text) {
    return;
  }

  tooltip.textContent = text;
  tooltip.classList.add("is-visible");

  const rect = element.getBoundingClientRect();
  const margin = 8;
  let top = rect.top - tooltip.offsetHeight - margin;

  if (top < margin) {
    top = rect.bottom + margin;
  }

  const left = Math.max(
    margin,
    Math.min(
      rect.left + rect.width / 2 - tooltip.offsetWidth / 2,
      window.innerWidth - tooltip.offsetWidth - margin
    )
  );

  tooltip.style.left = `${Math.round(left)}px`;
  tooltip.style.top = `${Math.round(top)}px`;
  element.setAttribute("aria-describedby", "tooltip");
}

function hideTip() {
  window.clearTimeout(tipTimer);

  if (tipTarget) {
    tipTarget.removeAttribute("aria-describedby");
  }

  tipTarget = null;
  tooltip.classList.remove("is-visible");
}

// Hover shows the tip after a short delay, as in Material UI; touch skips it.
document.addEventListener("pointerover", (event) => {
  if (event.pointerType === "touch") {
    return;
  }

  const target = event.target.closest("[data-tip], [data-tip-text]");

  if (target === tipTarget) {
    return;
  }

  hideTip();

  if (target) {
    tipTarget = target;
    tipTimer = window.setTimeout(() => showTip(target), 450);
  }
});

// Keyboard focus shows it at once.
document.addEventListener("focusin", (event) => {
  const target = event.target.closest?.("[data-tip], [data-tip-text]");

  if (!target || !target.matches(":focus-visible")) {
    return;
  }

  hideTip();
  tipTarget = target;
  showTip(target);
});

document.addEventListener("focusout", hideTip);
document.addEventListener("pointerdown", hideTip, true);
window.addEventListener("scroll", hideTip, true);

/* -------------------------------------------------------------------------
   Wiring
   ---------------------------------------------------------------------- */

renderSwatches();
loadSelection();

customColor.value = selectedHex().toLowerCase();
customHex.value = selectedHex();

loadUiPrefs();
applyUi({ save: false });
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

  if (!a11yMenu.hidden) {
    closeA11y();
  }
});

a11yTrigger.addEventListener("click", (event) => {
  event.stopPropagation();

  if (a11yMenu.hidden) {
    openA11y();
  } else {
    closeA11y();
  }
});

a11yMenu.addEventListener("click", (event) => {
  event.stopPropagation();

  const segment = event.target.closest(".segment");

  if (!segment) {
    return;
  }

  if (segment.dataset.uiLang) {
    uiPrefs.lang = segment.dataset.uiLang;
  } else if (segment.dataset.theme) {
    uiPrefs.theme = segment.dataset.theme;
  } else if (segment.dataset.fs) {
    uiPrefs.fs = Number(segment.dataset.fs);
  }

  applyUi();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  if (previewBox.classList.contains("is-expanded")) {
    collapsePreview();
    return;
  }

  if (!a11yMenu.hidden) {
    closeA11y();
    a11yTrigger.focus();
    return;
  }

  if (menuIsOpen()) {
    closeMenu();
    colourTrigger.focus();
  }
});

window.addEventListener("resize", () => {
  if (!a11yMenu.hidden) {
    positionPopover(a11yTrigger, a11yMenu);
  }

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

previewFrame.addEventListener("load", () => {
  if (previewFrame.getAttribute("src")) {
    setPreviewLoading(false);
  }
});


previewExpand.addEventListener("click", expandPreview);
mobilePreview.addEventListener("click", expandPreview);
previewCollapse.addEventListener("click", collapsePreview);
previewBackdrop.addEventListener("click", collapsePreview);

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

// A sibling hue for the lightning. Cool accents lean towards cyan and warm
// ones towards yellow, the colours that read as electric, so blue gets an
// electric blue rather than just more of the same blue. Greys stay grey.
function electricHue(hex, lightness) {
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

function svgImage(defs, body) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 200">' +
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
  const { bolt, veins1, veins2, veins3 } = boltPaths();

  // Bone is pale and only tinted by the accent; the eyes are a bright tint
  // of the accent and the lightning a sibling hue, so each part stands apart
  // without leaving the chosen colour.
  // On the light appearance pale bone would vanish into the page, so the
  // skull is drawn in deeper shades of the accent instead.
  const light = uiPrefs.theme === "light";
  const boneLight = light ? mixHex(accent, "#ffffff", 0.3) : mixHex(accent, "#fbf6f0", 0.84);
  const boneMid = light ? mixHex(accent, "#000000", 0.2) : mixHex(accent, "#9a908a", 0.58);
  const boneDark = light ? mixHex(accent, "#000000", 0.55) : mixHex(accent, "#1a1413", 0.66);
  const rim = light ? mixHex(accent, "#000000", 0.35) : mixHex(accent, "#ffffff", 0.4);
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

function paintSkulls(accent) {
  // The art depends on the appearance as well as the accent.
  const key = `${accent}|${uiPrefs.theme}`;

  if (key === skullAccent) {
    return;
  }

  skullAccent = key;

  const parts = skullParts(accent);
  const root = document.documentElement.style;

  for (const [name, image] of Object.entries(parts)) {
    root.setProperty(`--skull-${name}`, image);
  }

  skullField.classList.add("is-painted");
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
