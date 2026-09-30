import { measureAll, type Boxes } from "./boxes";

const RESIZE_FRAMES = 30;

export interface Memory {
  boxes(): Boxes;
  remember(): void;
}

export function watchLayout(card: Element): Memory {
  let boxes: Boxes = new Map();
  let frames = 0;
  let looping = false;

  const remember = () => {
    boxes = measureAll();
  };

  const loop = () => {
    remember();

    if (--frames > 0) {
      requestAnimationFrame(loop);
    } else {
      looping = false;
    }
  };

  const keepRemembering = () => {
    frames = RESIZE_FRAMES;

    if (!looping) {
      looping = true;
      requestAnimationFrame(loop);
    }
  };

  window.addEventListener("resize", keepRemembering);
  window.addEventListener("scroll", keepRemembering, { passive: true, capture: true });
  new ResizeObserver(remember).observe(card);

  return { boxes: () => boxes, remember };
}
