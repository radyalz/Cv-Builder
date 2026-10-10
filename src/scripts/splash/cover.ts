import { PURPLE_GOLD } from "../../lib/transition/palette";
import { accentPalette } from "./accent";
import { field, takeHandoff } from "./ascii";

const MORPH_MS = 400;
const REVEAL_MS = 1000;

const still = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function handoffCover(splash: HTMLElement, ascii: HTMLCanvasElement): () => Promise<void> {
  const handoff = takeHandoff();
  const cover = handoff && !still() ? field(ascii, handoff.seed, handoff.time, PURPLE_GOLD) : null;
  let uncovered: Promise<void> | undefined;

  if (cover) ascii.classList.add("is-shown");
  splash.classList.remove("is-handoff");

  return () =>
    (uncovered ??= cover
      ? cover.morph(accentPalette(), MORPH_MS).then(() => cover.reveal(REVEAL_MS))
      : Promise.resolve());
}
