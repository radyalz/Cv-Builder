import { el } from "../dom";
import { app } from "../state";

export const GROW_MS = 820;
export const SHRINK_MS = 920;
export const RETURN_FADE_MS = 540;
export const LEAVE_DELAY_MS = 180;
export const RETURN_AT = 0.55;

const GROW_EASE = "cubic-bezier(0.45, 0, 0.2, 1)";

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const wait = (ms: number): Promise<Animation> => document.body.animate([], { duration: ms }).finished;


export const reducedMotion = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const previewOrigin = (): DOMRect => el.previewBox.getBoundingClientRect();

export const within = (rect: Box, outer = { left: 0, top: 0 }): Box => ({
  left: rect.left - outer.left,
  top: rect.top - outer.top,
  width: rect.width,
  height: rect.height,
});

const boxFrame = (rect: Box): Keyframe => ({
  left: `${rect.left}px`,
  top: `${rect.top}px`,
  width: `${rect.width}px`,
  height: `${rect.height}px`,
  right: "auto",
  bottom: "auto",
});

export interface Grow {
  card: [Box, Box];
  frame: [Box, Box];
  duration: number;
  paper: { from: number; to: number } | null;
}

export function growBetween({ card, frame, duration, paper }: Grow): Promise<Animation[]> {
  const timing: KeyframeAnimationOptions = { duration, easing: GROW_EASE, fill: "forwards" };
  const animations = [
    el.card.animate([boxFrame(card[0]), boxFrame(card[1])], timing),
    el.previewBox.animate([boxFrame(frame[0]), boxFrame(frame[1])], timing),
  ];

  if (paper) {
    animations.push(el.previewDoc.animate([{ transform: `scale(${paper.from})` }, { transform: `scale(${paper.to})` }], timing));
  } else {
    app.pdfView.hold(true);
    el.previewDoc.style.opacity = "0";
  }

  return Promise.all(animations.map((animation) => animation.finished)).then(() => animations);
}

export function holdPaper(small: Box, big: Box): number | null {
  const doc = el.previewDoc;

  if (doc.hidden || doc.classList.contains("is-loading") || small.width <= 40 || big.width <= 40) {
    return null;
  }

  const gutter = doc.offsetWidth - doc.clientWidth;
  const scale = (small.width - gutter) / (big.width - gutter);
  const rtl = getComputedStyle(doc).direction === "rtl";

  app.pdfView.hold(true);
  Object.assign(doc.style, {
    position: "absolute",
    top: "0",
    left: rtl ? "auto" : "0",
    right: rtl ? "0" : "auto",
    width: `${big.width}px`,
    height: `${Math.max(big.height, small.height / scale)}px`,
    transformOrigin: rtl ? "100% 0" : "0 0",
  });

  return scale;
}

const GROW_STYLES = ["position", "top", "left", "right", "width", "height", "transform", "transform-origin", "opacity"];

export function settle(animations: Animation[]): void {
  const faded = el.previewDoc.style.opacity === "0";

  animations.forEach((animation) => animation.cancel());
  GROW_STYLES.forEach((property) => el.previewDoc.style.removeProperty(property));

  if (faded) {
    el.previewDoc.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: "ease-out" });
  }

  app.pdfView.hold(false);
}
