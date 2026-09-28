import { EN_FONTS, FA_COLOURS, FA_FONTS, STRINGS, TEXT_SIZES, THEME_BY_SLUG, UI_KEY } from "./data.js";
import { positionPopover } from "./popover.js";

/* -------- Page preferences --------
   Page language, appearance, text size and fonts, chosen in the
   accessibility menu (A11yMenu.astro) and remembered on this device. The
   inline script in Base.astro applies the stored values before the first
   paint; this module keeps them in sync afterwards and tells the page
   through a "prefs:change" event on document. */

// Appearance starts from the system setting until the visitor picks one.
export const uiPrefs = { lang: "en", theme: "dark", fs: 1, enFont: "inter", faFont: "yekan" };

export function t(key, vars = {}) {
  let text = (STRINGS[uiPrefs.lang] || STRINGS.en)[key] ?? STRINGS.en[key] ?? key;

  for (const [name, value] of Object.entries(vars)) {
    text = text.replace(`{${name}}`, value);
  }

  return text;
}

export function themeName(slug) {
  if (uiPrefs.lang === "fa" && FA_COLOURS[slug]) {
    return FA_COLOURS[slug];
  }

  const theme = THEME_BY_SLUG.get(slug);

  return theme ? theme.label : "Purple";
}

// Back to the defaults: English, the system's appearance, normal text and
// the default fonts. The stored choice is forgotten, so the appearance
// follows the system again from now on.
export function resetPrefs() {
  Object.assign(uiPrefs, {
    lang: "en",
    theme: window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark",
    fs: 1,
    enFont: "inter",
    faFont: "yekan",
  });

  try {
    localStorage.removeItem(UI_KEY);
  } catch {
    // Nothing stored, or storage blocked: the defaults apply either way.
  }

  applyPrefs({ save: false });
}

function loadUiPrefs() {
  uiPrefs.theme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";

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

      if (Object.hasOwn(EN_FONTS, stored.enFont)) {
        uiPrefs.enFont = stored.enFont;
      }

      if (Object.hasOwn(FA_FONTS, stored.faFont)) {
        uiPrefs.faFont = stored.faFont;
      }
    }
  } catch {
    // A blocked or corrupt store just means the defaults are used.
  }
}

// The text eases to its new size over about a third of a second (see
// --fs in tokens.css) and the open menu grows or shrinks with it, so it is
// kept against its button on every frame until the text has settled.
function followMenu(menu) {
  const trigger = document.getElementById("a11yTrigger");
  const until = performance.now() + 400;
  const step = () => {
    positionPopover(trigger, menu);

    if (!menu.hidden && performance.now() < until) {
      requestAnimationFrame(step);
    }
  };

  step();
}

export function applyPrefs({ save = true } = {}) {
  const root = document.documentElement;

  root.lang = uiPrefs.lang;
  root.dir = uiPrefs.lang === "fa" ? "rtl" : "ltr";
  root.dataset.theme = uiPrefs.theme;
  root.dataset.enFont = uiPrefs.enFont;
  root.dataset.faFont = uiPrefs.faFont;
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

  const menu = document.getElementById("a11yMenu");

  if (menu) {
    for (const group of menu.querySelectorAll("[data-font-lang]")) {
      group.hidden = group.dataset.fontLang !== uiPrefs.lang;
    }

    for (const option of menu.querySelectorAll("[role=radio]")) {
      const { uiLang, theme, fs, enFont, faFont } = option.dataset;
      const current =
        uiLang !== undefined ? uiLang === uiPrefs.lang
        : theme !== undefined ? theme === uiPrefs.theme
        : fs !== undefined ? Number(fs) === uiPrefs.fs
        : enFont !== undefined ? enFont === uiPrefs.enFont
        : faFont === uiPrefs.faFont;

      option.setAttribute("aria-checked", current ? "true" : "false");
    }

    if (!menu.hidden) {
      followMenu(menu);
    }
  }

  if (save) {
    try {
      localStorage.setItem(UI_KEY, JSON.stringify(uiPrefs));
    } catch {
      // Remembering the choice is a convenience, never a requirement.
    }
  }

  document.dispatchEvent(new CustomEvent("prefs:change"));
}

/* -------- Opening and closing the menu --------
   It rises out of the button: fading in while it slides up from below and
   grows from the corner nearest the button, and closing plays the same
   motion backwards, a little faster, before it is hidden. It is one Web
   Animation played forwards or backwards, so a click mid-way simply turns
   it around from wherever it is instead of jumping or getting stuck. */

const MENU_OPEN_MS = 260;
const MENU_CLOSE_RATE = 1.3; // closing runs at 260 / 1.3 = 200 ms

let menuOpen = false;
let menuMotion = null;

function menuAnimation(menu) {
  // Rebuilt if a page change has replaced the menu element.
  if (!menuMotion || menuMotion.effect.target !== menu) {
    menuMotion = menu.animate(
      [
        { opacity: 0, transform: "translateY(14px) scale(0.92)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: MENU_OPEN_MS, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" }
    );
    menuMotion.pause();
  }

  // Reduced motion: the menu simply appears and disappears.
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  menuMotion.effect.updateTiming({ duration: still ? 0 : MENU_OPEN_MS });

  return menuMotion;
}

// Grow from the point of the menu nearest the button's centre.
function originTowards(menu, trigger) {
  const box = menu.getBoundingClientRect();
  const button = trigger.getBoundingClientRect();
  const x = Math.min(box.width, Math.max(0, button.left + button.width / 2 - box.left));
  const y = Math.min(box.height, Math.max(0, button.top + button.height / 2 - box.top));

  menu.style.transformOrigin = `${Math.round(x)}px ${Math.round(y)}px`;
}

export function openA11y() {
  const menu = document.getElementById("a11yMenu");
  const trigger = document.getElementById("a11yTrigger");

  document.dispatchEvent(new CustomEvent("menus:close"));
  menuOpen = true;
  menu.hidden = false;
  menu.style.pointerEvents = "";
  trigger.setAttribute("aria-expanded", "true");
  positionPopover(trigger, menu);

  const motion = menuAnimation(menu);

  // From fully closed it starts at the beginning; if it was still closing,
  // it turns back from where it is.
  if (motion.playState !== "running") {
    motion.currentTime = 0;
    originTowards(menu, trigger);
  }

  motion.updatePlaybackRate(1);
  motion.play();
}

export function closeA11y() {
  const menu = document.getElementById("a11yMenu");

  if (!menu || !menuOpen) {
    return;
  }

  menuOpen = false;
  menu.style.pointerEvents = "none";
  document.getElementById("a11yTrigger").setAttribute("aria-expanded", "false");

  const motion = menuAnimation(menu);

  motion.updatePlaybackRate(-MENU_CLOSE_RATE);
  motion.play();
  motion.finished.then(() => {
    // Still closed once the motion ends (not reopened in the meantime).
    if (!menuOpen) {
      menu.hidden = true;
    }
  });
}

let started = false;

export function initPrefs() {
  if (started) {
    return;
  }

  started = true;
  loadUiPrefs();
  applyPrefs({ save: false });

  // Page changes replace the <html> attributes with the new page's, so the
  // preferences are put back straight after each swap.
  document.addEventListener("astro:after-swap", () => applyPrefs({ save: false }));

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest?.("#a11yTrigger");
    const menu = document.getElementById("a11yMenu");

    if (trigger) {
      if (!menuOpen) {
        openA11y();
      } else {
        closeA11y();
      }

      return;
    }

    if (!menu || !menuOpen) {
      return;
    }

    if (!menu.contains(event.target)) {
      closeA11y();
      return;
    }

    if (event.target.closest("#resetPrefs")) {
      resetPrefs();
      return;
    }

    const option = event.target.closest("[role=radio]");

    if (!option) {
      return;
    }

    const { uiLang, theme, fs, enFont, faFont } = option.dataset;

    if (enFont) {
      uiPrefs.enFont = enFont;
    } else if (faFont) {
      uiPrefs.faFont = faFont;
    } else if (uiLang) {
      uiPrefs.lang = uiLang;
    } else if (theme) {
      uiPrefs.theme = theme;
    } else if (fs) {
      uiPrefs.fs = Number(fs);
    }

    applyPrefs();
  });

  document.addEventListener("keydown", (event) => {
    const menu = document.getElementById("a11yMenu");

    if (event.key === "Escape" && menu && menuOpen) {
      closeA11y();
      document.getElementById("a11yTrigger").focus();
    }
  });

  window.addEventListener("resize", () => {
    const menu = document.getElementById("a11yMenu");

    if (menu && !menu.hidden) {
      positionPopover(document.getElementById("a11yTrigger"), menu);
    }
  });
}
