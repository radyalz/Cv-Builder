import { installedElsewhere, isInstalled } from "./env";
import { invite } from "./invite";
import { OFFLINE_OFF_KEY, readStore } from "./store";
import { setUpUninstall } from "./uninstall";
import { registerWorker } from "./worker";

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

  const elsewhere = installedElsewhere().then((installed) => {
    if (installed) showUninstall();
    return installed;
  });

  invite(production, button, steps, element, elsewhere);
}
