import { t } from "../../lib/prefs";
import { platform } from "./env";
import { OFFLINE_OFF_KEY, writeStore } from "./store";
import { refit, removeOfflineCopy } from "./worker";

const HOW_KEYS = { desktop: "uninstallDesktop", android: "uninstallAndroid", ios: "uninstallIos" };

export function setUpUninstall(installButton: HTMLElement): () => void {
  const uninstall = document.getElementById("uninstallApp")!;
  const panel = document.getElementById("uninstallPanel")!;
  const how = panel.querySelector<HTMLElement>(".uninstall-how")!;
  const status = panel.querySelector<HTMLElement>(".offline-status")!;
  const howKey = HOW_KEYS[platform()];

  uninstall.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    uninstall.setAttribute("aria-expanded", String(!panel.hidden));
    refit(panel);
  });

  document.getElementById("clearOffline")!.addEventListener("click", async () => {
    writeStore(localStorage, OFFLINE_OFF_KEY, "1");
    await removeOfflineCopy();
    status.dataset.i18n = "offlineCleared";
    status.textContent = t("offlineCleared");
    refit(status);
  });

  return () => {
    uninstall.hidden = false;
    installButton.hidden = true;
    how.dataset.i18n = howKey;
    how.textContent = t(howKey);
  };
}
