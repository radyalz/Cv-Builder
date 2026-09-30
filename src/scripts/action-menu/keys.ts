import type { ActionMenu } from "./menu";

const MOVES: Record<string, number> = { ArrowDown: 1, ArrowUp: -1 };

export function onMenuKeydown(event: KeyboardEvent, items: HTMLElement[], menu: ActionMenu): void {
  const index = items.indexOf(document.activeElement as HTMLElement);
  const move = MOVES[event.key];

  if (move) {
    event.preventDefault();
    items[(index + move + items.length) % items.length].focus();
  } else if (event.key === "Home" || event.key === "End") {
    event.preventDefault();
    items[event.key === "Home" ? 0 : items.length - 1].focus();
  } else if (event.key === "Tab") {
    menu.close();
  }
}
