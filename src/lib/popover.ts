const MARGIN = 8;

export function positionPopover(trigger: Element, menu: HTMLElement): void {
  const rect = trigger.getBoundingClientRect();
  const width = menu.offsetWidth;
  const height = menu.offsetHeight;
  const rtl = document.documentElement.dir === "rtl";

  let left = rtl ? rect.right - width : rect.left;
  let top = rect.bottom + MARGIN;

  left = Math.max(MARGIN, Math.min(left, window.innerWidth - width - MARGIN));

  if (top + height > window.innerHeight - MARGIN) {
    top = Math.max(MARGIN, rect.top - height - MARGIN);
  }

  menu.style.left = `${Math.round(left)}px`;
  menu.style.top = `${Math.round(top)}px`;
}

export function positionBeside(trigger: Element, menu: HTMLElement): void {
  const rect = trigger.getBoundingClientRect();
  const width = menu.offsetWidth;
  const height = menu.offsetHeight;
  const rtl = document.documentElement.dir === "rtl";
  const gap = MARGIN + 4;

  let left = rtl ? rect.left - width - gap : rect.right + gap;

  left = Math.max(MARGIN, Math.min(left, window.innerWidth - width - MARGIN));

  const top = Math.max(MARGIN, Math.min(rect.top, window.innerHeight - height - MARGIN));
  const y = Math.round(Math.min(height, Math.max(0, rect.top + rect.height / 2 - top)));

  menu.style.left = `${Math.round(left)}px`;
  menu.style.top = `${Math.round(top)}px`;
  menu.style.transformOrigin = `${rtl ? "100%" : "0"} ${y}px`;
}
