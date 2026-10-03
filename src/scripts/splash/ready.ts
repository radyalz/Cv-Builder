export const isReady = (): boolean => document.documentElement.classList.contains("is-ready");

export function whenReady(run: () => void): void {
  if (isReady()) run();
  else document.addEventListener("app:ready", run, { once: true });
}
