import { end, show } from "./flow";
import type { Session } from "./session";

function trapFocus(session: Session, event: KeyboardEvent): void {
  const buttons = [...session.card.querySelectorAll<HTMLElement>("button")].filter((button) => !button.hidden);
  const at = buttons.indexOf(document.activeElement as HTMLElement);

  event.preventDefault();
  buttons[(at + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length].focus();
}

export function onKeydown(session: Session, event: KeyboardEvent): void {
  if (!session.open) {
    return;
  }

  const forward = document.documentElement.dir === "rtl" ? "ArrowLeft" : "ArrowRight";
  const backward = forward === "ArrowLeft" ? "ArrowRight" : "ArrowLeft";
  const { index, steps } = session;

  if (event.key === "Escape") {
    event.stopImmediatePropagation();
    end(session);
  } else if (event.key === forward && index < steps.length - 1) {
    event.stopImmediatePropagation();
    void show(session, index + 1, 1);
  } else if (event.key === backward && index > 0) {
    event.stopImmediatePropagation();
    void show(session, index - 1, -1);
  } else if (event.key === "Tab") {
    trapFocus(session, event);
  }
}
