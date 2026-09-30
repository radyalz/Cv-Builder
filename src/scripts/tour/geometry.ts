import type { Box } from "./dom";

const GAP = 14;
const EDGE = 16;
const RING = 6;

export function placeSpot(spot: HTMLElement, parts: Element[], box: Box, round = false): Box {
  const radius = parts.length === 1 ? parseFloat(getComputedStyle(parts[0]).borderRadius) || 0 : 12;
  let ring = { left: box.left - RING, top: box.top - RING, width: box.width + RING * 2, height: box.height + RING * 2 };
  let corner = `${radius + RING}px`;

  if (round) {
    const size = Math.max(ring.width, ring.height);

    ring = { left: box.left + box.width / 2 - size / 2, top: box.top + box.height / 2 - size / 2, width: size, height: size };
    corner = "50%";
  }

  Object.assign(spot.style, {
    width: `${ring.width}px`,
    height: `${ring.height}px`,
    borderRadius: corner,
    transform: `translate(${ring.left}px, ${ring.top}px)`,
  });

  return ring;
}

export function placeCard(card: HTMLElement, ring: Box): void {
  const { offsetWidth: width, offsetHeight: height } = card;
  const { innerWidth, innerHeight } = window;
  const clampX = (x: number) => Math.min(Math.max(EDGE, x), innerWidth - width - EDGE);
  const clampY = (y: number) => Math.min(Math.max(EDGE, y), innerHeight - height - EDGE);
  const centreX = clampX(ring.left + ring.width / 2 - width / 2);
  const centreY = clampY(ring.top + ring.height / 2 - height / 2);
  const below = ring.top + ring.height + GAP;
  const options: [boolean, number, number][] = [
    [innerHeight - EDGE - below >= height, centreX, below],
    [ring.top - GAP - EDGE >= height, centreX, ring.top - GAP - height],
    [ring.left - GAP - EDGE >= width, ring.left - GAP - width, centreY],
    [innerWidth - EDGE - (ring.left + ring.width + GAP) >= width, ring.left + ring.width + GAP, centreY],
  ];
  const [, left, top] = options.find(([fits]) => fits) ?? [true, centreX, innerHeight - height - EDGE];

  card.style.left = `${Math.round(left)}px`;
  card.style.top = `${Math.round(top)}px`;
}
