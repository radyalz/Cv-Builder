import { t, uiPrefs } from "../../lib/prefs";
import { el } from "./dom";
import { app } from "./state";

export function showLinksHint(): void {
  const count = app.linkCount;
  const text = count === 1 ? t("linksHintOne") : t("linksHint", { n: uiPrefs.lang === "fa" ? count.toLocaleString("fa-IR") : String(count) });

  for (const hint of el.linksHints) {
    hint.hidden = count === 0;
    hint.querySelector(".links-hint-text")!.textContent = text;
  }
}
