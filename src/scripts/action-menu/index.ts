import { findOriginals, readChoice, saveChoice, type Action } from "./choice";
import { onMenuKeydown } from "./keys";
import { actionMenu, type ActionMenu } from "./menu";
import { mirror, watchOriginals, type SplitParts } from "./mirror";

let started = false;

function wire(parts: SplitParts, toggle: HTMLElement, menu: ActionMenu, state: { choice: Action }): void {
  const { split, main, items, originals } = parts;
  const update = () => mirror(parts, state.choice);

  watchOriginals(originals, update);

  document.addEventListener("prefs:change", () => {
    update();
    if (!parts.menu.hidden) menu.place();
  });

  main.addEventListener("click", () => !main.disabled && originals[state.choice].click());

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    menu.isOpen() ? menu.close() : menu.open(items.find((item) => item.dataset.action === state.choice) || items[0]);
  });

  parts.menu.addEventListener("click", (event) => {
    const item = (event.target as Element).closest<HTMLElement>(".action-item");

    event.stopPropagation();

    if (item) {
      state.choice = item.dataset.action as Action;
      saveChoice(state.choice);
      update();
      menu.close({ refocus: true });
    }
  });

  parts.menu.addEventListener("keydown", (event) => onMenuKeydown(event, items, menu));
  document.addEventListener("keydown", (event) => event.key === "Escape" && menu.isOpen() && menu.close({ refocus: true }));

  document.addEventListener("click", (event) => {
    const target = event.target as Node;

    if (menu.isOpen() && !parts.menu.contains(target) && !split.contains(target)) menu.close();
  });

  window.addEventListener("resize", () => menu.isOpen() && menu.place());
}

export function initActionMenu(): void {
  const split = document.querySelector<HTMLElement>(".action-split");
  const main = split?.querySelector<HTMLButtonElement>(".split-main");
  const toggle = split?.querySelector<HTMLElement>(".split-toggle");
  const element = document.getElementById("actionMenu");

  if (started || !split || !main || !toggle || !element) {
    return;
  }

  started = true;
  document.body.append(element);

  const parts: SplitParts = {
    split,
    main,
    menu: element,
    items: [...element.querySelectorAll<HTMLElement>(".action-item")],
    originals: findOriginals(),
  };
  const state = { choice: readChoice() };

  wire(parts, toggle, actionMenu(split, toggle, element), state);
  mirror(parts, state.choice);
}
