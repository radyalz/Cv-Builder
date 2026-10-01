import { t } from "../../lib/prefs";
import { manualSteps, type InstallPromptEvent } from "./env";
import { createOffer, whenLoaded } from "./offer";
import { OFFLINE_OFF_KEY, readStore, removeStore } from "./store";
import { refit, registerWorker } from "./worker";

const MANUAL_GRACE_MS = 800;

export function invite(production: boolean, button: HTMLElement, steps: HTMLElement, element: HTMLElement, settled: Promise<boolean>): void {
  const manual = manualSteps();
  let prompt: InstallPromptEvent | null = null;
  let done = false;
  const offer = createOffer(element, () => (prompt ? null : manual));

  document.addEventListener("menus:close", () => offer.hide());
  document.getElementById("a11yTrigger")?.addEventListener("click", () => offer.hide());

  const install = async () => {
    if (readStore(localStorage, OFFLINE_OFF_KEY)) {
      removeStore(localStorage, OFFLINE_OFF_KEY);
      if (production) registerWorker();
    }

    if (!prompt) {
      steps.hidden = !steps.hidden;
      refit(steps);
      return;
    }

    const shown = prompt;

    prompt = null;
    button.hidden = true;
    offer.hide();
    await shown.prompt();
  };

  const installable = (event: Event) => {
    event.preventDefault();
    prompt = event as InstallPromptEvent;
    window.__installPrompt = null;
    button.hidden = false;
    steps.hidden = true;
    offer.refresh();
    offer.schedule();
  };

  const byHand = async () => {
    if (prompt || !manual || done || (await settled)) return;

    steps.dataset.i18n = manual;
    steps.textContent = t(manual);
    button.hidden = false;
    offer.schedule();
  };

  if (window.__installPrompt) installable(window.__installPrompt);
  whenLoaded(() => window.setTimeout(() => void byHand(), manual === "installIos" ? 0 : MANUAL_GRACE_MS));

  window.addEventListener("beforeinstallprompt", installable);
  window.addEventListener("appinstalled", () => {
    prompt = null;
    done = true;
    button.hidden = true;
    steps.hidden = true;
    offer.hide();
  });

  button.addEventListener("click", install);
  document.getElementById("installOfferButton")!.addEventListener("click", install);
}
