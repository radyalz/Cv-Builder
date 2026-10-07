const PASS_MS = 620;
const BOLT_ROOM = 48;
const STAGGER_MS = 70;
const LAST_EXTRA_MS = 40;
const COVER_AT = 0.46;
const LEAVE_AT = 0.54;

export async function wipe(splash: HTMLElement, onCovered: () => void): Promise<void> {
  const panels = [...splash.querySelectorAll<HTMLElement>(".splash-wipe > span")];
  const sign = document.documentElement.dir === "rtl" ? 1 : -1;
  const at = (fraction: number, offset: number, easing: string): Keyframe => ({
    transform: `translateX(calc(${fraction * 100}% + ${fraction * BOLT_ROOM}px))`,
    offset,
    easing,
  });

  const passes = panels.map((panel, index) =>
    panel.animate(
      [
        at(sign, 0, "cubic-bezier(0.7, 0, 0.3, 1)"),
        at(0, COVER_AT, "linear"),
        at(0, LEAVE_AT, "cubic-bezier(0.7, 0, 0.3, 1)"),
        at(-sign, 1, "linear"),
      ],
      { duration: PASS_MS, delay: index * STAGGER_MS + (index === panels.length - 1 ? LAST_EXTRA_MS : 0), fill: "both" }
    )
  );

  window.setTimeout(onCovered, PASS_MS * COVER_AT + 16);
  await Promise.all(passes.map((pass) => pass.finished));
}
