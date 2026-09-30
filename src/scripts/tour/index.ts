import { end, place, show, start } from "./flow";
import { onKeydown } from "./keys";
import { createSession, type Session } from "./session";

export { renderTopics } from "./topics";

let session: Session | null = null;

export function startTour(step = 0): void {
  if (session) {
    void start(session, step);
  }
}

function wire(current: Session, close: HTMLElement): void {
  current.next.addEventListener("click", () => {
    if (current.index === current.steps.length - 1) end(current);
    else void show(current, current.index + 1, 1);
  });

  current.back.addEventListener("click", () => void show(current, current.index - 1, -1));
  close.addEventListener("click", () => end(current));

  current.tour.addEventListener("click", (event) => {
    event.stopPropagation();

    if (!current.card.contains(event.target as Node)) end(current);
  });

  document.addEventListener("keydown", (event) => onKeydown(current, event), true);
  window.addEventListener("resize", () => current.open && place(current));
  document.addEventListener("prefs:change", () => current.open && void show(current, current.index));
}

export function initTour(): void {
  const tour = document.getElementById("tour");

  if (session || !tour) {
    return;
  }

  session = createSession(tour);
  wire(session, document.getElementById("tourClose")!);
}
