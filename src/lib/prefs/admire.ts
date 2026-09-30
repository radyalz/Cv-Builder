import { closeA11y } from "./menu";
import { t } from "./state";

export function setAdmiring(on: boolean): void {
  document.body.classList.toggle("is-admiring", on);

  document.querySelectorAll("#admireToggle, #admireFromMenu").forEach((toggle) => {
    toggle.setAttribute("aria-pressed", String(on));
  });

  document.getElementById("admireToggle")?.setAttribute("aria-label", t(on ? "showCard" : "admire"));

  const label = document.querySelector<HTMLElement>("#admireFromMenu [data-i18n]");

  if (label) {
    label.dataset.i18n = on ? "showCard" : "admire";
    label.textContent = t(label.dataset.i18n);
  }

  if (on) {
    closeA11y();
  }
}
