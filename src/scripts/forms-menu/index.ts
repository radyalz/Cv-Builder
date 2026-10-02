import { COMPACT } from "../../lib/layout";
import { formsMenu, type FormsMenu } from "./menu";


let started = false;

const colourOpen = (): boolean => !document.getElementById("colourMenu")?.hidden;

function keepSummary(summary: HTMLElement, label: HTMLElement): void {
  const mirror = () => {
    summary.textContent = label.textContent;
  };

  new MutationObserver(mirror).observe(label, { childList: true, characterData: true, subtree: true });
  mirror();
}

function placeControls(controls: HTMLElement, body: Element, menu: FormsMenu): void {
  const home = document.createComment("controls");
  const compact = window.matchMedia(COMPACT);
  const arrange = (isCompact: boolean) => {
    if (isCompact && controls.parentElement !== body) {
      body.append(controls);
    } else if (!isCompact && controls.parentElement === body) {
      menu.close({ instant: true });
      home.after(controls);
    }
  };

  controls.before(home);
  arrange(compact.matches);
  compact.addEventListener("change", (event) => arrange(event.matches));
}

function wire(trigger: HTMLElement, element: HTMLElement, menu: FormsMenu): void {
  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    menu.isOpen() ? menu.close() : menu.open();
  });

  document.addEventListener("click", (event) => {
    if (menu.isOpen() && !element.contains(event.target as Node) && !colourOpen()) menu.close();
  });

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && menu.isOpen() && !colourOpen()) menu.close({ refocus: true });
    },
    true
  );

  document.addEventListener("menus:close", (event) => {
    if ((event as CustomEvent).detail !== "forms") menu.close();
  });

  window.addEventListener("resize", () => menu.isOpen() && menu.place());
}

export function initFormsMenu(): void {
  const controls = document.getElementById("cvControls");
  const trigger = document.getElementById("formsTrigger");
  const element = document.getElementById("formsMenu");
  const body = element?.querySelector(".forms-body");

  if (started || !controls || !trigger || !element || !body) {
    return;
  }

  started = true;

  const menu = formsMenu(trigger, element);

  placeControls(controls, body, menu);
  keepSummary(document.getElementById("formsSummary")!, document.getElementById("previewLabel")!);
  wire(trigger, element, menu);
}
