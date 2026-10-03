const POLL_MS = 120;

function until(check: () => boolean): Promise<void> {
  return new Promise((resolve) => {
    const look = () => (check() ? resolve() : window.setTimeout(look, POLL_MS));

    look();
  });
}

const shown = (selector: string): boolean => {
  const element = document.querySelector<HTMLElement>(selector);

  return Boolean(element && !element.hidden);
};

export const fontsLoaded = (): Promise<void> => document.fonts.ready.then(() => undefined);

export const backgroundDrawn = (): Promise<void> =>
  until(() => !document.querySelector(".skull-field") || document.querySelector(".skull-field.is-painted") !== null);

export const previewSettled = (): Promise<void> =>
  until(() => {
    if (!document.getElementById("previewDoc")) return true;

    const rendered = shown("#previewDoc") && !document.getElementById("previewDoc")!.classList.contains("is-loading");
    const missing = shown("#previewState") && !document.getElementById("previewState")!.hasAttribute("data-slow");

    return rendered || missing || shown("#previewError");
  });
