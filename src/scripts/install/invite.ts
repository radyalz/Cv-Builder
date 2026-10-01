import { installDialog } from "./dialog";
import { manualSteps, type InstallPromptEvent } from "./env";
import { createOffer, whenLoaded } from "./offer";
import { OFFLINE_OFF_KEY, readStore, removeStore } from "./store";
import { registerWorker } from "./worker";

const MANUAL_GRACE_MS = 800;

export function invite(production: boolean, button: HTMLElement, element: HTMLElement, settled: Promise<boolean>): void {
  const manual = manualSteps();
  const showSteps = installDialog();
  const offer = createOffer(element);
  let prompt: InstallPromptEvent | null = null;
  let done = false;

  document.addEventListener("menus:close", (event) => (event as CustomEvent).detail === "tour" && offer.hide());

  const install = async () => {
    if (readStore(localStorage, OFFLINE_OFF_KEY)) {
      removeStore(localStorage, OFFLINE_OFF_KEY);
      if (production) registerWorker();
    }

    offer.hide();

    if (!prompt) {
      if (manual) showSteps(manual);
      return;
    }

    const shown = prompt;

    prompt = null;
    button.hidden = !manual;

    try {
      await shown.prompt();
    } catch {
      if (manual) showSteps(manual);
    }
  };

  const installable = (event: Event) => {
    event.preventDefault();
    prompt = event as InstallPromptEvent;
    window.__installPrompt = null;
    button.hidden = false;
    offer.schedule();
  };

  const byHand = async () => {
    if (prompt || !manual || done || (await settled)) return;

    button.hidden = false;
    offer.schedule();
  };

  if (window.__installPrompt) installable(window.__installPrompt);
  whenLoaded(() => window.setTimeout(() => void byHand(), manual === "Ios" ? 0 : MANUAL_GRACE_MS));

  window.addEventListener("beforeinstallprompt", installable);
  window.addEventListener("appinstalled", () => {
    prompt = null;
    done = true;
    button.hidden = true;
    offer.hide();
  });

  button.addEventListener("click", () => void install());
  document.getElementById("installOfferButton")!.addEventListener("click", () => void install());
}
