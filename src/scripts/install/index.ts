import { installedElsewhere, isAppleMobile, isInstalled, type InstallPromptEvent } from "./env";
import { createOffer } from "./offer";
import { OFFLINE_OFF_KEY, readStore, removeStore } from "./store";
import { setUpUninstall } from "./uninstall";
import { refit, registerWorker } from "./worker";

let started = false;

export function initInstall(production: boolean): void {
  if (started) {
    return;
  }

  started = true;

  if (production && "serviceWorker" in navigator && !readStore(localStorage, OFFLINE_OFF_KEY)) {
    registerWorker();
  }

  const button = document.getElementById("installApp");
  const steps = document.getElementById("installSteps");
  const element = document.getElementById("installOffer");

  if (!button || !steps || !element) {
    return;
  }

  const showUninstall = setUpUninstall(button, steps);

  if (isInstalled()) {
    showUninstall();
    return;
  }

  void installedElsewhere().then((installed) => installed && showUninstall());
  offerInstall(production, button, steps, element);
}

function offerInstall(production: boolean, button: HTMLElement, steps: HTMLElement, element: HTMLElement): void {
  const apple = isAppleMobile();
  const offerButton = document.getElementById("installOfferButton")!;
  let prompt: InstallPromptEvent | null = null;
  const offer = createOffer(element, () => apple && !prompt);

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
    offerButton.hidden = false;
    offer.schedule();
  };

  if (apple) {
    button.hidden = false;
    offer.schedule();
  }

  if (window.__installPrompt) installable(window.__installPrompt);

  window.addEventListener("beforeinstallprompt", installable);
  window.addEventListener("appinstalled", () => {
    prompt = null;
    button.hidden = true;
    steps.hidden = true;
    offer.hide();
  });

  button.addEventListener("click", install);
  offerButton.addEventListener("click", install);
}
