import { t } from "../../../lib/prefs";
import { closeMenu } from "../colour-menu";
import { el } from "../dom";
import { reducedMotion } from "../expand/motion";
import { setControlsEnabled } from "../interface";
import { setPreviewLoading } from "../preview/loading";
import { refreshPreview } from "../preview/refresh";
import { selectionLabel } from "../selection";

let elapsedTimer: number | null = null;
let successTimer = 0;

export function setBuildStatus(title: string, message: string): void {
  el.statusTitle.textContent = title;
  el.statusText.textContent = message;
}

function formatElapsed(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));

  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

function startElapsedTimer(): void {
  const startedAt = Date.now();

  el.elapsedTime.textContent = t("elapsed", { time: "0:00" });
  elapsedTimer = window.setInterval(() => {
    el.elapsedTime.textContent = t("elapsed", { time: formatElapsed(Date.now() - startedAt) });
  }, 1000);
}

function stopElapsedTimer(): void {
  if (elapsedTimer !== null) {
    window.clearInterval(elapsedTimer);
    elapsedTimer = null;
  }
}

function leave(panel: HTMLElement): void {
  const token = String(Math.random());

  panel.dataset.leaving = token;
  void panel
    .animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(10px) scaleY(0.85)" }], {
      duration: reducedMotion() ? 0 : 220,
      easing: "ease-in",
    })
    .finished.then(() => {
      if (panel.dataset.leaving === token) {
        panel.hidden = true;
        delete panel.dataset.leaving;
      }
    });
}

function arrive(panel: HTMLElement): void {
  delete panel.dataset.leaving;
  panel.getAnimations().forEach((running) => running.cancel());

  if (panel.hidden) {
    panel.hidden = false;
    panel.animate([{ opacity: 0, transform: "translateY(16px) scaleY(0.4)" }, { opacity: 1, transform: "none" }], {
      duration: reducedMotion() ? 0 : 380,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    });
  }
}

function revealStatus(panel: HTMLElement | null): void {
  window.clearTimeout(successTimer);
  [el.buildPanel, el.successPanel, el.errorPanel].filter((other) => other !== panel && !other.hidden).forEach(leave);

  if (panel) arrive(panel);
}

function setGenerate(enabled: boolean, label: string): void {
  el.generate.disabled = !enabled;
  el.generate.querySelector(".button-label")!.textContent = t(label);
  setControlsEnabled(enabled);
}

export function showBuilding(): void {
  revealStatus(el.buildPanel);

  if (el.previewDoc.hidden) {
    el.previewState.hidden = true;
    setPreviewLoading(true, { patient: true });
  }

  setGenerate(false, "building");
  closeMenu();
  setBuildStatus(t("requestingTitle"), t("requestingText", { selection: selectionLabel() }));
  startElapsedTimer();
}

export function showSuccess(): void {
  stopElapsedTimer();
  revealStatus(el.successPanel);
  successTimer = window.setTimeout(() => revealStatus(null), 5000);
  setGenerate(true, "generateAgain");
}

export function showError(message: string): void {
  stopElapsedTimer();
  revealStatus(el.errorPanel);
  setPreviewLoading(false);
  refreshPreview();
  el.errorText.textContent = message;
  setGenerate(true, "tryAgain");
}
