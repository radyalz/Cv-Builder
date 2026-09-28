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
      positionPopover(document.getElementById("a11yTrigger"), menu);
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

export function openA11y() {
  const menu = document.getElementById("a11yMenu");
  const trigger = document.getElementById("a11yTrigger");

  document.dispatchEvent(new CustomEvent("menus:close"));
  menu.hidden = false;
  trigger.setAttribute("aria-expanded", "true");
  positionPopover(trigger, menu);
}

export function closeA11y() {
  const menu = document.getElementById("a11yMenu");

  if (menu) {
    menu.hidden = true;
    document.getElementById("a11yTrigger").setAttribute("aria-expanded", "false");
  }
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
      if (menu.hidden) {
        openA11y();
      } else {
        closeA11y();
      }

      return;
    }

    if (!menu || menu.hidden) {
      return;
    }

    if (!menu.contains(event.target)) {
      closeA11y();
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

    if (event.key === "Escape" && menu && !menu.hidden) {
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
