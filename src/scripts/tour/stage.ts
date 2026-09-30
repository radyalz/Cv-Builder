import { setAdmiring } from "../../lib/prefs";
import { closeMenu, openMenu } from "./menus";
import { pause, type Session } from "./session";
import type { Step } from "./types";

const MENU_MS = 320;
const GROW_MS = 1200;

function switchMenu(session: Session, wanted: Step["menu"] | null): number {
  let waited = 0;

  if (session.menu === wanted) {
    return 0;
  }

  if (session.menu) {
    closeMenu(session.menu);
    waited = session.menu === "expanded" ? GROW_MS : MENU_MS;
  }

  session.menu = wanted ?? null;

  if (wanted) {
    openMenu(wanted);
    waited = wanted === "expanded" ? GROW_MS : Math.max(waited, MENU_MS);
  }

  return waited;
}

export async function stage(session: Session, step: Step): Promise<void> {
  let waited = switchMenu(session, step.menu ?? null);

  if (session.admiring !== Boolean(step.admire)) {
    session.admiring = Boolean(step.admire);
    setAdmiring(session.admiring);
    waited = Math.max(waited, MENU_MS);
  }

  session.tour.classList.toggle("is-light", session.admiring);

  if (waited) {
    await pause(waited);
    session.next.focus({ preventScroll: true });
  }
}

export function unstage(session: Session): void {
  if (session.menu) {
    closeMenu(session.menu);
    session.menu = null;
  }

  if (session.admiring) {
    setAdmiring(false);
    session.admiring = false;
  }
}
