const RIPPLE_TARGETS = [
  ".primary-button",
  ".ghost-button",
  ".segment",
  ".font-option",
  ".menu-trigger",
  ".download-button",
  ".secondary-link",
  ".icon-button",
  ".links-hint",
  ".reset-icon",
  ".reset-control",
  ".admire-toggle",
  ".split-main",
  ".split-toggle",
  ".action-item",
  ".swatch",
  ".a11y-trigger",
].join(", ");

let started = false;

function isDisabled(target: HTMLElement): boolean {
  return (target as HTMLButtonElement).disabled === true || target.getAttribute("aria-disabled") === "true";
}

function spawnWave(target: HTMLElement, event: PointerEvent): void {
  const rect = target.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const wave = document.createElement("span");

  wave.className = "ripple";
  Object.assign(wave.style, {
    width: `${size}px`,
    height: `${size}px`,
    left: `${event.clientX - rect.left - size / 2}px`,
    top: `${event.clientY - rect.top - size / 2}px`,
  });

  target.append(wave);
  wave.addEventListener("animationend", () => wave.remove());
}

export function initRipple(): void {
  if (started) {
    return;
  }

  started = true;

  document.addEventListener("pointerdown", (event) => {
    const target = (event.target as Element | null)?.closest<HTMLElement>(RIPPLE_TARGETS);

    if (target && !isDisabled(target)) {
      spawnWave(target, event);
    }
  });
}
