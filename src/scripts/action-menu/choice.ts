export type Action = "generate" | "download" | "allCopies";

const CHOICE_KEY = "cv-builder-action";
const ACTIONS: Action[] = ["generate", "download", "allCopies"];

export type Originals = Record<Action, HTMLButtonElement | HTMLAnchorElement>;

export function findOriginals(): Originals {
  return {
    generate: document.getElementById("generateButton") as HTMLButtonElement,
    download: document.getElementById("downloadLatest") as HTMLButtonElement,
    allCopies: document.querySelector<HTMLAnchorElement>(".actions .secondary-link")!,
  };
}

export function readChoice(): Action {
  try {
    const kept = sessionStorage.getItem(CHOICE_KEY) as Action | null;

    return kept && ACTIONS.includes(kept) ? kept : "generate";
  } catch {
    return "generate";
  }
}

export function saveChoice(choice: Action): void {
  try {
    sessionStorage.setItem(CHOICE_KEY, choice);
  } catch {
    return;
  }
}

export function labelOf(originals: Originals, action: Action): string {
  const original = originals[action];

  if (action === "generate") {
    return original.querySelector(".button-label")?.textContent?.trim() || "";
  }

  if (action === "allCopies") {
    return original.querySelector("[data-i18n]")?.textContent?.trim() || "";
  }

  return original.textContent?.trim() || "";
}

export const isDisabled = (originals: Originals, action: Action): boolean =>
  Boolean((originals[action] as HTMLButtonElement | undefined)?.disabled);
