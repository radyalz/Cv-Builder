import { closeA11y, openA11y } from "../../lib/prefs";
import { onScreen } from "./dom";
import type { StageMenu } from "./types";

const TRIGGERS: Record<Exclude<StageMenu, "expanded">, string> = {
  forms: "#formsTrigger",
  actions: ".split-toggle",
  a11y: "#a11yTrigger",
  wallpaper: "#wallpaperToggle",
};

const click = (selector: string) => document.querySelector<HTMLElement>(selector)?.click();

function isOpen(name: StageMenu): boolean {
  if (name === "expanded") {
    return Boolean(document.querySelector(".builder-card")?.classList.contains("is-expanded"));
  }

  return document.querySelector(TRIGGERS[name])?.getAttribute("aria-expanded") === "true";
}

export function openMenu(name: StageMenu): void {
  if (isOpen(name)) {
    return;
  }

  if (name === "a11y") {
    openA11y();
  } else if (name === "expanded") {
    click(onScreen(document.getElementById("previewExpand")) ? "#previewExpand" : ".preview-frame");
  } else {
    click(TRIGGERS[name]);
  }
}

export function closeMenu(name: StageMenu): void {
  if (!isOpen(name)) {
    return;
  }

  if (name === "a11y") {
    closeA11y();
  } else if (name === "expanded") {
    click("#previewCollapse");
  } else {
    click(TRIGGERS[name]);
  }
}
