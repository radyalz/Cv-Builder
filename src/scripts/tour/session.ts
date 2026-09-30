import type { Step, StageMenu } from "./types";

export interface Session {
  tour: HTMLElement;
  spot: HTMLElement;
  card: HTMLElement;
  stepLabel: HTMLElement;
  title: HTMLElement;
  text: HTMLElement;
  back: HTMLElement;
  next: HTMLElement;
  steps: Step[];
  index: number;
  open: boolean;
  returnTo: HTMLElement | null;
  menu: StageMenu | null;
  admiring: boolean;
  token: number;
}

export function createSession(tour: HTMLElement): Session {
  const byId = (id: string) => document.getElementById(id)!;

  return {
    tour,
    spot: tour.querySelector<HTMLElement>(".tour-spot")!,
    card: tour.querySelector<HTMLElement>(".tour-card")!,
    stepLabel: byId("tourStep"),
    title: byId("tourTitle"),
    text: byId("tourText"),
    back: byId("tourBack"),
    next: byId("tourNext"),
    steps: [],
    index: 0,
    open: false,
    returnTo: null,
    menu: null,
    admiring: false,
    token: 0,
  };
}

export const still = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const pause = (ms: number): Promise<void> =>
  new Promise((resolve) => window.setTimeout(resolve, still() ? 0 : ms));
