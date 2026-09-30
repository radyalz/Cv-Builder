import { isDisabled, labelOf, type Action, type Originals } from "./choice";

export interface SplitParts {
  split: HTMLElement;
  main: HTMLButtonElement;
  menu: HTMLElement;
  items: HTMLElement[];
  originals: Originals;
}

export function mirror(parts: SplitParts, choice: Action): void {
  const { split, main, menu, items, originals } = parts;

  split.dataset.action = choice;
  main.querySelector(".split-label")!.textContent = labelOf(originals, choice);
  main.querySelector(".split-icon")!.innerHTML = menu.querySelector(`[data-action="${choice}"] .action-item-icon`)!.innerHTML;
  main.disabled = isDisabled(originals, choice);
  main.dataset.tip = choice;

  for (const item of items) {
    const action = item.dataset.action as Action;

    item.setAttribute("aria-checked", String(action === choice));
    item.setAttribute("aria-disabled", String(isDisabled(originals, action)));
  }
}

export function watchOriginals(originals: Originals, onChange: () => void): void {
  const watch = new MutationObserver(onChange);

  for (const original of Object.values(originals)) {
    watch.observe(original, {
      attributes: true,
      attributeFilter: ["disabled", "href"],
      childList: true,
      characterData: true,
      subtree: true,
    });
  }
}
