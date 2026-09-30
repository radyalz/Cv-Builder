/* -------- Installing the app --------
   Registers the service worker (public/sw.js; only in the built site, so
   development never serves a stale cached copy) and offers to install the
   site as an app from the accessibility menu.

   Chrome, Edge and Samsung Internet announce when the site can be
   installed; the button then opens their own install prompt. iPhones and
   iPads have no such prompt, so there the button shows the Add to Home
   Screen steps instead. Anywhere else, and once the site is running as an
   installed app, the button stays hidden. */

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

export function initInstall(production) {
  if (started) {
    return;
  }

  started = true;

  if (production && "serviceWorker" in navigator) {
    const scope = new URL(import.meta.env.BASE_URL.replace(/\/?$/, "/"), window.location.origin);

    navigator.serviceWorker.register(new URL("sw.js", scope), { scope: scope.pathname }).catch(() => {
      // Without it the site still works, just not offline or installable.
    });
  }

  const button = document.getElementById("installApp");
  const steps = document.getElementById("installSteps");

  if (!button || !steps || isInstalled()) {
    return;
  }

  let prompt = null;

  if (isAppleMobile()) {
    button.hidden = false;
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    // Kept for the button, instead of the browser's own banner.
    event.preventDefault();
    prompt = event;
    button.hidden = false;
  });

  window.addEventListener("appinstalled", () => {
    prompt = null;
    button.hidden = true;
    steps.hidden = true;
  });

  button.addEventListener("click", async () => {
    if (prompt) {
      const shown = prompt;

      // A prompt can only be used once. If it is declined, the browser
      // announces a new one later and the button comes back then.
      prompt = null;
      button.hidden = true;
      await shown.prompt();
      return;
    }

    steps.hidden = !steps.hidden;
  });
}
