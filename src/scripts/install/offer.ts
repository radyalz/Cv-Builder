import type { StringKey } from "../../lib/data";
import { t } from "../../lib/prefs";
import { countdown } from "./countdown";
import { forced, isInstalled } from "./env";
import { DISMISS_KEY, recentlyDismissed, writeStore } from "./store";

const OFFER_DELAY_MS = 7000;
const OFFER_MS = 30000;
const HIDDEN: Keyframe = { opacity: 0, transform: "translateY(18px) scale(0.96)" };
const SHOWN: Keyframe = { opacity: 1, transform: "none" };

export interface Offer {
  schedule(): void;
  hide(options?: { dismissed?: boolean }): void;
  refresh(): void;
}

const still = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function createOffer(offer: HTMLElement, stepsKey: () => StringKey | null): Offer {
  const text = document.getElementById("installOfferText")!;
  const button = document.getElementById("installOfferButton")!;
  const timer = countdown(offer, offer.querySelector<HTMLElement>(".install-offer-time")!, OFFER_MS, () => hide());
  const loadedAt = performance.now();
  let offered = false;
  let open = false;

  function refresh(): void {
    const key = stepsKey() ?? "installPitch";

    text.dataset.i18n = key;
    text.textContent = t(key);
    button.hidden = key !== "installPitch";
  }

  function show(): void {
    if (offered || isInstalled() || (!forced() && recentlyDismissed())) {
      return;
    }

    offered = open = true;
    refresh();
    offer.hidden = false;
    timer.start();

    if (!still()) offer.animate([HIDDEN, SHOWN], { duration: 320, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
  }

  function hide({ dismissed = false } = {}): void {
    if (!open) return;

    open = false;
    timer.stop();

    if (dismissed) writeStore(localStorage, DISMISS_KEY, String(Date.now()));
    if (offer.contains(document.activeElement)) document.getElementById("introInfo")?.focus({ preventScroll: true });

    if (still()) offer.hidden = true;
    else void offer.animate([SHOWN, HIDDEN], { duration: 240, easing: "ease-in" }).finished.then(() => (offer.hidden = true));
  }

  document.getElementById("installOfferClose")!.addEventListener("click", () => hide({ dismissed: true }));
  offer.addEventListener("keydown", (event) => event.key === "Escape" && hide({ dismissed: true }));

  return {
    schedule: () => void window.setTimeout(show, Math.max(0, OFFER_DELAY_MS - (performance.now() - loadedAt))),
    hide,
    refresh,
  };
}
