export type TipMode = "cursor" | "arrow";

export interface TipElements {
  tooltip: HTMLElement;
  pop: HTMLElement;
  bubble: HTMLElement;
  box: HTMLElement;
}

interface Vector {
  x: number;
  y: number;
}

export const tip = {
  els: null as TipElements | null,
  target: null as HTMLElement | null,
  mode: "cursor" as TipMode,
  showTimer: 0,
  hideTimer: 0,
  frame: 0,
  lastTime: 0,
  mouse: { x: 0, y: 0 } as Vector,
  pos: { x: 0, y: 0 } as Vector,
  vel: { x: 0, y: 0 } as Vector,
};

export const isVisible = (): boolean => Boolean(tip.els?.tooltip.classList.contains("is-visible"));

export const clamp = (value: number, low: number, high: number): number => Math.min(high, Math.max(low, value));

export const closestTip = (target: EventTarget | null): HTMLElement | null =>
  (target as Element | null)?.closest?.<HTMLElement>("[data-tip]") ?? null;
