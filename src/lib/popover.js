// Menus sit outside the card, which clips its own overflow, and are placed
// against their trigger: its start edge, which is the right edge in RTL.
// They flip above the trigger when there is no room below.
export function positionPopover(trigger, menu) {
  const rect = trigger.getBoundingClientRect();
  const width = menu.offsetWidth;
  const height = menu.offsetHeight;
  const margin = 8;

  let left = document.documentElement.dir === "rtl" ? rect.right - width : rect.left;
  let top = rect.bottom + margin;

  left = Math.min(left, window.innerWidth - width - margin);
  left = Math.max(margin, left);

  if (top + height > window.innerHeight - margin) {
    top = Math.max(margin, rect.top - height - margin);
  }

  menu.style.left = `${Math.round(left)}px`;
  menu.style.top = `${Math.round(top)}px`;
}
