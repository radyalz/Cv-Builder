const ENTER_MS = 520;
const LAST_MS = 760;
const STAGGER_MS = 110;
const ROOM = 70;
const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

export async function wipe(splash: HTMLElement, onCovered: () => void): Promise<void> {
  const panels = [...splash.querySelectorAll<HTMLElement>(".splash-wipe > span")];
  const last = panels.pop()!;
  const sign = document.documentElement.dir === "rtl" ? 1 : -1;
  const at = (fraction: number): Keyframe => ({ transform: `translateX(calc(${fraction * 100}% + ${fraction * ROOM}px))` });
  const lastDelay = panels.length * STAGGER_MS;

  splash.classList.add("is-wiping");

  panels.forEach((panel, index) =>
    panel.animate([at(sign), at(0)], { duration: ENTER_MS, delay: index * STAGGER_MS, easing: EASE, fill: "both" })
  );

  const sweep = last.animate([{ ...at(sign), easing: EASE }, { ...at(0), offset: 0.5, easing: EASE }, at(-sign)], {
    duration: LAST_MS,
    delay: lastDelay,
    fill: "both",
  });

  window.setTimeout(onCovered, ENTER_MS + 16);
  window.setTimeout(() => panels.forEach((panel) => (panel.hidden = true)), lastDelay + LAST_MS / 2 + 16);
  await sweep.finished;
}
