// A material-style ink ripple from the point of the press, on every
// control matching RIPPLE_TARGETS. Delegated, so controls added later get
// it too.

const RIPPLE_TARGETS =
  ".primary-button, .ghost-button, .segment, .font-option, .menu-trigger, .mobile-preview, .download-button, .secondary-link, .icon-button, .links-hint, .swatch, .a11y-trigger";

let started = false;

export function initRipple() {
  if (started) {
    return;
  }

  started = true;

  document.addEventListener("pointerdown", (event) => {
    const target = event.target.closest(RIPPLE_TARGETS);

    if (!target || target.disabled || target.getAttribute("aria-disabled") === "true") {
      return;
    }

    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const wave = document.createElement("span");

    wave.className = "ripple";
    wave.style.width = `${size}px`;
    wave.style.height = `${size}px`;
    wave.style.left = `${event.clientX - rect.left - size / 2}px`;
    wave.style.top = `${event.clientY - rect.top - size / 2}px`;

    target.append(wave);
    wave.addEventListener("animationend", () => wave.remove());
  });
}
