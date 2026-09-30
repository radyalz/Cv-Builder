const CALL_MS = 30000;

export function callForAttention(button: HTMLElement): void {
  const quiet = () => button.classList.remove("is-calling");

  button.classList.add("is-calling");
  window.setTimeout(quiet, CALL_MS);

  for (const type of ["pointerenter", "focus", "click"]) {
    button.addEventListener(type, quiet, { once: true });
  }
}
