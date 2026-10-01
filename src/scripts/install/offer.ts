import type { StringKey } from "../../lib/data";
import { t } from "../../lib/prefs";
import { countdown } from "./countdown";
import { isInstalled } from "./env";

const OFFER_MS = 30000;
const HIDDEN: Keyframe = { opacity: 0, transform: "translateY(calc(100% + 28px)) scale(0.9)" };
const SHOWN: Keyframe = { opacity: 1, transform: "none" };

export interface Offer {
  schedule(): void;
  hide(): void;
  refresh(): void;
}

export function whenLoaded(run: () => void): void {
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
}

const still = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function createOffer(offer: HTMLElement, stepsKey: () => StringKey | null): Offer {
  const text = document.getElementById("installOfferText")!;
  const button = document.getElementById("installOfferButton")!;
  const timer = countdown(offer, offer.querySelector<HTMLElement>(".install-offer-time")!, OFFER_MS, () => hide());
  let offered = false;
  let open = false;

  function refresh(): void {
    const key = stepsKey() ?? "installPitch";

    text.dataset.i18n = key;
    text.textContent = t(key);
    button.hidden = key !== "installPitch";
  }

  function show(): void {
    if (offered || isInstalled()) {
      return;
    }

    offered = open = true;
    refresh();
    offer.hidden = false;
    timer.start();

    offer.classList.add("is-calling");

    if (!still()) offer.animate([HIDDEN, SHOWN], { duration: 620, easing: "cubic-bezier(0.34, 1.45, 0.64, 1)" });
  }

  function hide(): void {
    if (!open) return;

    open = false;
    timer.stop();

    if (offer.contains(document.activeElement)) document.getElementById("introInfo")?.focus({ preventScroll: true });

    if (still()) offer.hidden = true;
    else void offer.animate([SHOWN, HIDDEN], { duration: 240, easing: "ease-in" }).finished.then(() => (offer.hidden = true));
  }

  for (const type of ["pointerenter", "focusin"]) {
    offer.addEventListener(type, () => offer.classList.remove("is-calling"));
  }

  document.getElementById("installOfferClose")!.addEventListener("click", () => hide());
  offer.addEventListener("keydown", (event) => event.key === "Escape" && hide());

  return {
    schedule: () => whenLoaded(show),
    hide,
    refresh,
  };
}
