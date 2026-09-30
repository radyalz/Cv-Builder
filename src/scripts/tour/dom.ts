export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function onScreen(element: Element | null): boolean {
  if (!element?.getClientRects().length) {
    return false;
  }

  return "checkVisibility" in element ? element.checkVisibility({ visibilityProperty: true }) : true;
}

export function targetsOf(selector: string): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(selector)].filter(onScreen);
}

export function boxAround(elements: Element[]): Box {
  const boxes = elements.map((element) => element.getBoundingClientRect());
  const left = Math.min(...boxes.map((box) => box.left));
  const top = Math.min(...boxes.map((box) => box.top));

  return {
    left,
    top,
    width: Math.max(...boxes.map((box) => box.right)) - left,
    height: Math.max(...boxes.map((box) => box.bottom)) - top,
  };
}
