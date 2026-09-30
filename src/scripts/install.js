/* -------- Installing the app --------
   Registers the service worker (public/sw.js; only in the built site, so
   development never serves a stale cached copy) and offers to install the
   site as an app, in two places:

   - an offer that rises in the bottom-left corner a few seconds after the
     page opens and stays 30 seconds (hovering or focusing it holds the
     time). Closing it keeps it away for two weeks on this device; letting
     the time run out only until the next visit.
   - "Install the app" in the accessibility menu, there whenever the site
     can be installed.

   Chrome, Edge and Samsung Internet announce when the site can be
   installed; Install then opens their own prompt. iPhones and iPads have
   no such prompt, so there both show the Add to Home Screen steps instead.
   Anywhere else, and once the site runs as an installed app, neither
   shows.

   Once it is installed, "Uninstall the app" takes their place. A page
   cannot remove an installed app, so it shows how on this device (desktop,
   Android or iPhone), and it can delete the offline copy: the service
   worker and its caches, which then stay off until the app is installed
   again. In a normal tab Chrome can say whether the app is installed
   (related_applications in the manifest); elsewhere the button shows only
   inside the installed app. Opening the page with ?install shows the offer regardless of
   when it was last closed or shown (for trying it out). */

import { positionPopover } from "../lib/popover.js";
import { t } from "../lib/prefs.js";

const OFFER_DELAY_MS = 7000; // after the touch hint (tooltip.js) has gone
const OFFER_MS = 30000;
const DISMISS_DAYS = 14;
const DISMISS_KEY = "cv-builder-install-offer";
const SHOWN_KEY = "cv-builder-install-offer-shown";
const OFFLINE_OFF_KEY = "cv-builder-offline-off";

let started = false;

function isInstalled() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.navigator.standalone === true
  );
}

// Safari on an iPhone or iPad (iPads report themselves as Macs, with touch).
function isAppleMobile() {
  const touchMac = /Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1;

  return /iPhone|iPad|iPod/.test(navigator.userAgent) || touchMac;
}

// Storage is only a convenience here: blocked, the offer simply shows.
function readStore(store, key) {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

function writeStore(store, key, value) {
  try {
    store.setItem(key, value);
  } catch {
    // Not remembered; nothing else depends on it.
  }
}

function platform() {
  if (isAppleMobile()) return "ios";
  if (/Android/.test(navigator.userAgent)) return "android";
  return "desktop";
}

// In a normal tab: whether this site is installed as an app (Chrome only).
async function installedElsewhere() {
  if (!navigator.getInstalledRelatedApps) {
    return false;
  }

  try {
    return (await navigator.getInstalledRelatedApps()).some((app) => app.platform === "webapp");
  } catch {
    return false;
  }
}

function scope() {
  return new URL(import.meta.env.BASE_URL.replace(/\/?$/, "/"), window.location.origin);
}

function registerWorker() {
  navigator.serviceWorker?.register(new URL("sw.js", scope()), { scope: scope().pathname }).catch(() => {
    // Without it the site still works, just not offline.
  });
}

// The offline copy: the service worker and every cache it or the page made.
async function removeOfflineCopy() {
  const registrations = (await navigator.serviceWorker?.getRegistrations?.()) ?? [];

  await Promise.all(registrations.map((registration) => registration.unregister()));

  if (window.caches) {
    const keys = await caches.keys();

    await Promise.all(keys.filter((key) => key.startsWith("cv-")).map((key) => caches.delete(key)));
  }
}

// The accessibility menu grows when steps open in it; it is placed above
// its button again, and the new part scrolled into view if it scrolls.
function refit(shown) {
  const menu = document.getElementById("a11yMenu");
  const trigger = document.getElementById("a11yTrigger");

  if (!menu || menu.hidden || !trigger) {
    return;
  }

  positionPopover(trigger, menu);

  if (shown && !shown.hidden) {
    shown.scrollIntoView({ block: "nearest" });
  }
}

// ?install in the address: show the offer whatever it remembers.
function forced() {
  return new URLSearchParams(window.location.search).has("install");
}

function recentlyDismissed() {
  const at = Number(readStore(localStorage, DISMISS_KEY));

  return at > 0 && Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

export function initInstall(production) {
  if (started) {
    return;
  }

  started = true;

  // Not after the visitor removed the offline copy (until they install
  // again).
  if (production && "serviceWorker" in navigator && !readStore(localStorage, OFFLINE_OFF_KEY)) {
    registerWorker();
  }

  const button = document.getElementById("installApp");
  const steps = document.getElementById("installSteps");
  const offer = document.getElementById("installOffer");

  if (!button || !steps || !offer) {
    return;
  }

  /* -------- Uninstalling -------- */

  const uninstall = document.getElementById("uninstallApp");
  const panel = document.getElementById("uninstallPanel");
  const how = panel.querySelector(".uninstall-how");
  const clearButton = document.getElementById("clearOffline");
  const status = panel.querySelector(".offline-status");
  const howKey = { desktop: "uninstallDesktop", android: "uninstallAndroid", ios: "uninstallIos" }[platform()];

  function showUninstall() {
    uninstall.hidden = false;
    button.hidden = true;
    steps.hidden = true;
    how.dataset.i18n = howKey;
    how.textContent = t(howKey);
  }

  uninstall.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    uninstall.setAttribute("aria-expanded", String(!panel.hidden));
    refit(panel);
  });

  clearButton.addEventListener("click", async () => {
    writeStore(localStorage, OFFLINE_OFF_KEY, "1");
    await removeOfflineCopy();
    status.dataset.i18n = "offlineCleared";
    status.textContent = t("offlineCleared");
    refit(status);
  });

  if (isInstalled()) {
    showUninstall();
    return;
  }

  installedElsewhere().then((installed) => {
    if (installed) {
      showUninstall();
    }
  });

  const offerText = document.getElementById("installOfferText");
  const offerButton = document.getElementById("installOfferButton");
  const offerClose = document.getElementById("installOfferClose");
  const offerTime = offer.querySelector(".install-offer-time");
  const apple = isAppleMobile();
  const loadedAt = performance.now();

  let prompt = null;

  /* -------- The offer -------- */

  let offered = false;
  let open = false;
  let left = OFFER_MS;
  let held = false;
  let last = 0;
  let frame = 0;

  const still = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function tick(now) {
    if (!open) {
      return;
    }

    if (!held) {
      left -= now - last;
    }

    last = now;
    offerTime.style.transform = `scaleX(${Math.max(0, left / OFFER_MS)})`;

    if (left <= 0) {
      hideOffer();
      return;
    }

    frame = requestAnimationFrame(tick);
  }

  function showOffer() {
    if (offered || isInstalled() || (!forced() && (recentlyDismissed() || readStore(sessionStorage, SHOWN_KEY)))) {
      return;
    }

    offered = true;
    open = true;
    writeStore(sessionStorage, SHOWN_KEY, "1");

    // iPhones: the steps themselves, as there is nothing to press.
    if (apple && !prompt) {
      offerText.dataset.i18n = "installIos";
      offerText.textContent = t("installIos");
      offerButton.hidden = true;
    }

    offer.hidden = false;
    left = OFFER_MS;
    last = performance.now();
    frame = requestAnimationFrame(tick);

    if (!still()) {
      offer.animate(
        [
          { opacity: 0, transform: "translateY(18px) scale(0.96)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 320, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
      );
    }
  }

  function hideOffer({ dismissed = false } = {}) {
    if (!open) {
      return;
    }

    open = false;
    cancelAnimationFrame(frame);

    if (dismissed) {
      writeStore(localStorage, DISMISS_KEY, String(Date.now()));
    }

    // Focus inside it goes back to the page rather than being lost.
    if (offer.contains(document.activeElement)) {
      document.getElementById("introInfo")?.focus({ preventScroll: true });
    }

    const done = () => {
      offer.hidden = true;
    };

    if (still()) {
      done();
      return;
    }

    offer
      .animate(
        [
          { opacity: 1, transform: "none" },
          { opacity: 0, transform: "translateY(18px) scale(0.96)" },
        ],
        { duration: 240, easing: "ease-in" }
      )
      .finished.then(done);
  }

  // Once installing is possible, the offer comes a few seconds after load.
  function scheduleOffer() {
    window.setTimeout(showOffer, Math.max(0, OFFER_DELAY_MS - (performance.now() - loadedAt)));
  }

  for (const [type, value] of [["pointerenter", true], ["pointerleave", false], ["focusin", true], ["focusout", false]]) {
    offer.addEventListener(type, () => {
      held = value;
    });
  }

  offerClose.addEventListener("click", () => hideOffer({ dismissed: true }));
  offer.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideOffer({ dismissed: true });
    }
  });

  // Any menu opening takes over the screen, so the offer steps aside.
  document.addEventListener("menus:close", () => hideOffer());
  document.getElementById("a11yTrigger")?.addEventListener("click", () => hideOffer());

  /* -------- Installing -------- */

  async function install() {
    if (readStore(localStorage, OFFLINE_OFF_KEY)) {
      try {
        localStorage.removeItem(OFFLINE_OFF_KEY);
      } catch {
        // Nothing to undo.
      }

      if (production) {
        registerWorker();
      }
    }

    if (!prompt) {
      steps.hidden = !steps.hidden;
      refit(steps);
      return;
    }

    const shown = prompt;

    // A prompt can only be used once. If it is declined, the browser
    // announces a new one later and the buttons come back then.
    prompt = null;
    button.hidden = true;
    hideOffer();
    await shown.prompt();
  }

  if (apple) {
    button.hidden = false;
    scheduleOffer();
  }

  // Kept for our buttons, instead of the browser's own banner. It may
  // already have come before this script ran (caught in Base.astro).
  const installable = (event) => {
    event.preventDefault();
    prompt = event;
    window.__installPrompt = null;
    button.hidden = false;
    offerButton.hidden = false;
    scheduleOffer();
  };

  if (window.__installPrompt) {
    installable(window.__installPrompt);
  }

  window.addEventListener("beforeinstallprompt", installable);

  window.addEventListener("appinstalled", () => {
    prompt = null;
    button.hidden = true;
    steps.hidden = true;
    hideOffer();
  });

  button.addEventListener("click", install);
  offerButton.addEventListener("click", install);
}
