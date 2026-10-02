import { growPart, morphPart } from "./animate";
import { boxOf, union, type Boxes } from "./boxes";
import { COMPACT, LANDSCAPE_PHONE, ROWS_UNDER_ACTIONS } from "../../lib/layout";
import { placeFoot } from "./foot";
import { watchLayout, type Memory } from "./memory";
import { partElements } from "./parts";

const BREAKPOINTS = ["(max-width: 599px)", COMPACT, "(max-width: 399px)", "(max-width: 349px)", LANDSCAPE_PHONE];

let started = false;

function morph(card: Element, previous: Boxes): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || card.classList.contains("is-growing")) {
    return;
  }

  const expanded = card.classList.contains("is-expanded");
  const parts = partElements()
    .filter(({ part }) => Boolean(part.bar) === expanded)
    .map(({ element, part }) => ({ element, part, before: previous.get(element), after: boxOf(element) }));
  let order = 0;

  for (const { element, part, before, after } of parts) {
    if (!after) {
      continue;
    }

    const delay = Math.min(order++ * 18, 140);

    if (before) {
      morphPart(element, part, before, after, delay);
    } else if (part.from) {
      const origin = union([...document.querySelectorAll(part.from)].map((from) => previous.get(from)));

      if (origin) growPart(element, origin, after, delay);
    }
  }
}

function onCrossing(card: Element, memory: Memory): () => void {
  let pending: Boxes | null = null;

  return () => {
    if (pending) {
      return;
    }

    pending = memory.boxes();
    requestAnimationFrame(() => {
      morph(card, pending!);
      pending = null;
      memory.remember();

      const moving = document.getAnimations().filter((animation) => card.contains((animation.effect as KeyframeEffect)?.target ?? null));

      void Promise.allSettled(moving.map((animation) => animation.finished)).then(memory.remember);
    });
  };
}

export function initMorph(): void {
  const card = document.querySelector(".builder-card");

  if (started || !card) {
    return;
  }

  started = true;

  const memory = watchLayout(card);
  const crossing = onCrossing(card, memory);

  placeFoot();
  window.matchMedia(ROWS_UNDER_ACTIONS).addEventListener("change", placeFoot);

  for (const query of BREAKPOINTS) {
    window.matchMedia(query).addEventListener("change", crossing);
  }

  memory.remember();
}
