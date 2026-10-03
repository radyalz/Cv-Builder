const PASS_MS = 980;
const STAGGER_MS = 120;
const COVER_AT = 0.42;
const LEAVE_AT = 0.58;

export async function wipe(splash: HTMLElement, onCovered: () => void): Promise<void> {
  const panels = [...splash.querySelectorAll<HTMLElement>(".splash-wipe > span")];
  const sign = document.documentElement.dir === "rtl" ? 1 : -1;
  const at = (fraction: number, offset: number, easing: string): Keyframe => ({
    transform: `translateX(${fraction * 101}%)`,
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
      { duration: PASS_MS, delay: index * STAGGER_MS, fill: "both" }
    )
  );

  window.setTimeout(onCovered, PASS_MS * COVER_AT + 16);
  await Promise.all(passes.map((pass) => pass.finished));
}
