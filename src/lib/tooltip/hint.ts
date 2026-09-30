const HINT_KEY = "cv-builder-touch-hint";

function firstTouchVisit(): boolean {
  if (!window.matchMedia("(hover: none)").matches) {
    return false;
  }

  try {
    if (localStorage.getItem(HINT_KEY)) {
      return false;
    }

    localStorage.setItem(HINT_KEY, "1");
    return true;
  } catch {
    return false;
  }
}

export function showTouchHint(text: string): void {
  if (!firstTouchVisit()) {
    return;
  }

  const note = document.createElement("div");

  note.className = "touch-hint";
  note.setAttribute("role", "status");
  note.textContent = text;
  document.body.append(note);

  window.setTimeout(() => note.classList.add("is-visible"), 1200);
  window.setTimeout(() => note.classList.remove("is-visible"), 6200);
  window.setTimeout(() => note.remove(), 6800);
}
