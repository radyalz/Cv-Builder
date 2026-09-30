import { t } from "../../lib/prefs";
import { forced, isInstalled } from "./env";
import { DISMISS_KEY, SHOWN_KEY, readStore, recentlyDismissed, writeStore } from "./store";

const OFFER_DELAY_MS = 7000;
const OFFER_MS = 30000;
const HIDDEN: Keyframe = { opacity: 0, transform: "translateY(18px) scale(0.96)" };
const SHOWN: Keyframe = { opacity: 1, transform: "none" };

export interface Offer {
  schedule(): void;
  hide(options?: { dismissed?: boolean }): void;
}

const still = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function createOffer(offer: HTMLElement, useSteps: () => boolean): Offer {
  const text = document.getElementById("installOfferText")!;
  const time = offer.querySelector<HTMLElement>(".install-offer-time")!;
  const loadedAt = performance.now();
  let offered = false;
  let open = false;
  let left = OFFER_MS;
  let held = false;
  let last = 0;
  let frame = 0;

  const tick = (now: number) => {
    if (!open) return;
    if (!held) left -= now - last;

    last = now;
    time.style.transform = `scaleX(${Math.max(0, left / OFFER_MS)})`;

    if (left <= 0) hide();
    else frame = requestAnimationFrame(tick);
  };

  function show(): void {
    if (offered || isInstalled() || (!forced() && (recentlyDismissed() || readStore(sessionStorage, SHOWN_KEY)))) {
      return;
    }

    offered = open = true;
    writeStore(sessionStorage, SHOWN_KEY, "1");

    if (useSteps()) {
      text.dataset.i18n = "installIos";
      text.textContent = t("installIos");
      document.getElementById("installOfferButton")!.hidden = true;
    }

    offer.hidden = false;
    left = OFFER_MS;
    last = performance.now();
    frame = requestAnimationFrame(tick);

    if (!still()) offer.animate([HIDDEN, SHOWN], { duration: 320, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
  }

  function hide({ dismissed = false } = {}): void {
    if (!open) return;

    open = false;
    cancelAnimationFrame(frame);

    if (dismissed) writeStore(localStorage, DISMISS_KEY, String(Date.now()));
    if (offer.contains(document.activeElement)) document.getElementById("introInfo")?.focus({ preventScroll: true });

    if (still()) offer.hidden = true;
    else void offer.animate([SHOWN, HIDDEN], { duration: 240, easing: "ease-in" }).finished.then(() => (offer.hidden = true));
  }

  for (const [type, value] of [["pointerenter", true], ["pointerleave", false], ["focusin", true], ["focusout", false]] as const) {
    offer.addEventListener(type, () => (held = value));
  }

  document.getElementById("installOfferClose")!.addEventListener("click", () => hide({ dismissed: true }));
  offer.addEventListener("keydown", (event) => event.key === "Escape" && hide({ dismissed: true }));

  return {
    schedule: () => void window.setTimeout(show, Math.max(0, OFFER_DELAY_MS - (performance.now() - loadedAt))),
    hide,
  };
}
