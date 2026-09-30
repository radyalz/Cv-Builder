import { barMenuOpen, openBarMenuButton, setBarMenu } from "../bar-menus";
import { closeMenu, menuIsOpen } from "../colour-menu";
import { el } from "../dom";
import { collapsePreview } from "../expand/collapse";
import { expand } from "../expand/queue";

export function onEscape(event: KeyboardEvent): void {
  if (event.key !== "Escape") {
    return;
  }

  if (barMenuOpen()) {
    const opener = openBarMenuButton();

    setBarMenu(null);
    opener.focus();
  } else if (expand.state !== "closed") {
    void collapsePreview();
  } else if (menuIsOpen()) {
    closeMenu();
    el.colourTrigger.focus();
  }
}
