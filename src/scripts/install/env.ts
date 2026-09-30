export interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
}

declare global {
  interface Window {
    __installPrompt?: InstallPromptEvent | null;
  }

  interface Navigator {
    standalone?: boolean;
    getInstalledRelatedApps?: () => Promise<{ platform: string }[]>;
  }
}

export type Platform = "ios" | "android" | "desktop";

export function isInstalled(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.navigator.standalone === true
  );
}

export function isAppleMobile(): boolean {
  const touchMac = /Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1;

  return /iPhone|iPad|iPod/.test(navigator.userAgent) || touchMac;
}

export function platform(): Platform {
  if (isAppleMobile()) return "ios";
  if (/Android/.test(navigator.userAgent)) return "android";
  return "desktop";
}

export async function installedElsewhere(): Promise<boolean> {
  if (!navigator.getInstalledRelatedApps) {
    return false;
  }

  try {
    return (await navigator.getInstalledRelatedApps()).some((app) => app.platform === "webapp");
  } catch {
    return false;
  }
}

export const forced = (): boolean => new URLSearchParams(window.location.search).has("install");
