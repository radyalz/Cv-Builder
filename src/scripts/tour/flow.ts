import { t, uiPrefs } from "../../lib/prefs";
import { boxAround, targetsOf } from "./dom";
import { placeCard, placeSpot } from "./geometry";
import { still, type Session } from "./session";
import { stage, unstage } from "./stage";
import { currentSteps } from "./steps";

const SETTLE_MS = 300;

const number = (n: number): string => (uiPrefs.lang === "fa" ? n.toLocaleString("fa-IR") : String(n));

export function place(session: Session): void {
  const step = session.steps[session.index];
  const parts = targetsOf(step.target);

  if (parts.length) {
    placeCard(session.card, placeSpot(session.spot, parts, boxAround(parts), step.round));
  }
}

function describe(session: Session): void {
  const { steps, index } = session;
  const step = steps[index];
  const textKey = typeof step.text === "function" ? step.text() : step.text;

  session.stepLabel.textContent = t("tourStep", { n: number(index + 1), total: number(steps.length) });
  session.title.textContent = t(step.title);
  session.text.textContent = t(textKey);
  session.back.hidden = index === 0;
  session.next.textContent = t(index === steps.length - 1 ? "tourDone" : "tourNext");
}

export async function show(session: Session, to: number, direction = 1): Promise<void> {
  const mine = ++session.token;

  session.index = Math.max(0, Math.min(session.steps.length - 1, to));

  const step = session.steps[session.index];

  await stage(session, step);

  if (mine !== session.token) {
    return;
  }

  if (!targetsOf(step.target).length) {
    const onward = session.index + direction;

    if ((step.optional || step.menu) && onward >= 0 && onward < session.steps.length) {
      void show(session, onward, direction);
    } else {
      end(session);
    }

    return;
  }

  describe(session);
  targetsOf(step.target)[0].scrollIntoView({ block: "nearest", behavior: still() ? "auto" : "smooth" });
  place(session);
  window.setTimeout(() => mine === session.token && session.open && place(session), SETTLE_MS);

  if (!still()) {
    session.card.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: 220, easing: "ease-out" });
  }
}

export async function start(session: Session, step: number): Promise<void> {
  session.steps = currentSteps();
  document.dispatchEvent(new CustomEvent("menus:close", { detail: "tour" }));
  Object.assign(session, { returnTo: document.getElementById("introInfo"), open: true, menu: null, admiring: false });
  session.tour.hidden = false;
  session.tour.classList.remove("is-open", "is-light");
  session.spot.style.transition = "none";
  await show(session, step);
  void session.spot.offsetWidth;
  session.spot.style.transition = "";
  requestAnimationFrame(() => session.tour.classList.add("is-open"));
  session.next.focus({ preventScroll: true });
}

export function end(session: Session): void {
  if (!session.open) {
    return;
  }

  session.open = false;
  session.token++;
  unstage(session);
  session.tour.classList.remove("is-open");
  window.setTimeout(
    () => {
      if (!session.open) {
        session.tour.hidden = true;
        session.tour.classList.remove("is-light");
      }
    },
    still() ? 0 : 260
  );
  session.returnTo?.focus({ preventScroll: true });
}
