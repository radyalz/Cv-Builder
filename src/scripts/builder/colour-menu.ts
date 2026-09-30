import { normaliseHex } from "../../lib/colour";
import { positionPopover } from "../../lib/popover";
import { closeA11y, t, themeName } from "../../lib/prefs";
import { el } from "./dom";
import { syncInterface } from "./interface";
import { choose } from "./selection";

export const menuIsOpen = (): boolean => !el.colourMenu.hidden;

export const positionMenu = (): void => positionPopover(el.colourTrigger, el.colourMenu);

export function openMenu(): void {
  closeA11y();
  el.colourMenu.hidden = false;
  el.colourTrigger.setAttribute("aria-expanded", "true");
  positionMenu();
}

export function closeMenu(): void {
  el.colourMenu.hidden = true;
  el.colourTrigger.setAttribute("aria-expanded", "false");
}

export const toggleMenu = (): void => (menuIsOpen() ? closeMenu() : openMenu());

export function localiseSwatches(): void {
  for (const swatch of el.themeGrid.children) {
    swatch.setAttribute("aria-label", themeName((swatch as HTMLElement).dataset.slug!));
  }
}

export function setHint(message: string): void {
  el.themeHint.hidden = !message;
  el.themeHint.textContent = message;
}

export function applyCustomColour(value: string): boolean {
  const hex = normaliseHex(value);

  if (!hex) {
    el.customHex.setAttribute("aria-invalid", "true");
    setHint(t("hexInvalid"));
    return false;
  }

  el.customHex.removeAttribute("aria-invalid");
  el.customHex.value = hex;
  el.customColor.value = hex.toLowerCase();
  choose({ mode: "custom", color: hex });
  syncInterface();

  return true;
}
