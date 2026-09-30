import { skullParts, type PartName } from "./art";
import { initSkulls } from "./index";
import { run } from "./loop";
import { draw, rasterise } from "./render";
import { state, type PartImages } from "./state";

const ART_CACHE_SIZE = 8;
const PAINT_SETTLE_MS = 90;
const artCache = new Map<string, PartImages>();

let paintTimer = 0;

function useImages(images: PartImages): void {
  state.images = images;

  if (state.still || state.pauses.size) {
    draw(performance.now());
  }

  state.field?.classList.add("is-painted");
  run();
}

async function buildImages(accent: string, theme: string): Promise<PartImages> {
  const parts = skullParts(accent, theme === "light");
  const names = Object.keys(parts) as PartName[];
  const drawn = await Promise.all(names.map((name) => rasterise(parts[name], state.ratio)));

  return Object.fromEntries(names.map((name, index) => [name, drawn[index]])) as PartImages;
}

function remember(key: string, images: PartImages): void {
  artCache.set(key, images);

  if (artCache.size > ART_CACHE_SIZE) {
    artCache.delete(artCache.keys().next().value!);
  }
}

export function paintSkulls(accent: string, theme: string): void {
  initSkulls();
  state.last = [accent, theme];

  const key = `${accent}|${theme}|${state.ratio}`;
  const kept = artCache.get(key);

  if (!state.canvas || key === state.painted) {
    return;
  }

  state.painted = key;
  window.clearTimeout(paintTimer);

  if (kept) {
    artCache.delete(key);
    artCache.set(key, kept);
    useImages(kept);
    return;
  }

  paintTimer = window.setTimeout(async () => {
    const images = await buildImages(accent, theme);

    remember(key, images);

    if (state.painted === key) {
      useImages(images);
    }
  }, state.images ? PAINT_SETTLE_MS : 0);
}
