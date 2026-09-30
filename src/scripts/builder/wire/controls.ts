import { LANGUAGES, THEMES, VARIANTS } from "../../../lib/data";
import { applyCustomColour, closeMenu, menuIsOpen, positionMenu, toggleMenu } from "../colour-menu";
import { el } from "../dom";
import { resetSelection, syncInterface } from "../interface";
import { prefetchNow } from "../prefetch";
import { choose, selectedSlug } from "../selection";
import { app } from "../state";

const closest = (event: Event, selector: string) => (event.target as Element).closest<HTMLElement>(selector);

function pick(patch: Parameters<typeof choose>[0]): void {
  choose(patch);
  syncInterface();
}

function wireHoverPrefetch(): void {
  el.themeGrid.addEventListener("pointerover", (event) => {
    const swatch = closest(event, ".swatch");

    if (swatch) prefetchNow(swatch.dataset.slug!, app.selection.variant, app.selection.language);
  });

  el.variantToggle.addEventListener("pointerover", (event) => {
    const segment = closest(event, ".segment");

    if (segment) prefetchNow(selectedSlug(), segment.dataset.variant!, app.selection.language);
  });

  el.languageToggle.addEventListener("pointerover", (event) => {
    const segment = closest(event, ".segment");

    if (segment) prefetchNow(selectedSlug(), app.selection.variant, segment.dataset.language!);
  });
}

function wireColourMenu(): void {
  document.addEventListener("menus:close", closeMenu);

  el.themeGrid.addEventListener("click", (event) => {
    const swatch = closest(event, ".swatch") as HTMLButtonElement | null;

    if (swatch && !swatch.disabled) pick({ mode: "theme", theme: swatch.dataset.slug! });
  });

  el.colourTrigger.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMenu();
  });

  el.colourMenu.addEventListener("click", (event) => event.stopPropagation());
  document.addEventListener("click", () => menuIsOpen() && closeMenu());
}

function wireGridKeys(): void {
  const keys = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"];

  el.themeGrid.addEventListener("keydown", (event) => {
    if (!keys.includes(event.key)) return;

    event.preventDefault();

    const slugs = THEMES.map((theme) => theme.slug);
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const next = slugs[(slugs.indexOf(app.selection.theme) + step + slugs.length) % slugs.length];

    pick({ mode: "theme", theme: next });
    el.themeGrid.querySelector<HTMLElement>(`[data-slug="${next}"]`)!.focus();
  });
}

function wireChoices(): void {
  el.variantToggle.addEventListener("click", (event) => {
    const variant = closest(event, ".segment")?.dataset.variant;

    if (variant && VARIANTS.has(variant)) pick({ variant });
  });

  el.languageToggle.addEventListener("click", (event) => {
    const language = closest(event, ".segment")?.dataset.language;

    if (language && LANGUAGES.has(language)) pick({ language });
  });

  el.customColor.addEventListener("input", () => applyCustomColour(el.customColor.value));
  el.customApply.addEventListener("click", () => applyCustomColour(el.customHex.value));
  el.customHex.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyCustomColour(el.customHex.value);
    }
  });
}

export function wireControls(): void {
  el.resetButtons.forEach((reset) => reset.addEventListener("click", resetSelection));
  wireHoverPrefetch();
  wireColourMenu();
  window.addEventListener("resize", () => menuIsOpen() && positionMenu());
  wireChoices();
  wireGridKeys();
}
