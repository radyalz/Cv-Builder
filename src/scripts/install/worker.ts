import { positionPopover } from "../../lib/popover";

const scope = (): URL => new URL(import.meta.env.BASE_URL.replace(/\/?$/, "/"), window.location.origin);

export function registerWorker(): void {
  navigator.serviceWorker?.register(new URL("sw.js", scope()), { scope: scope().pathname }).catch(() => undefined);
}

export async function removeOfflineCopy(): Promise<void> {
  const registrations = (await navigator.serviceWorker?.getRegistrations?.()) ?? [];

  await Promise.all(registrations.map((registration) => registration.unregister()));

  if (window.caches) {
    const keys = await caches.keys();

    await Promise.all(keys.filter((key) => key.startsWith("cv-")).map((key) => caches.delete(key)));
  }
}

export function refit(shown: HTMLElement): void {
  const menu = document.getElementById("a11yMenu");
  const trigger = document.getElementById("a11yTrigger");

  if (!menu || menu.hidden || !trigger) {
    return;
  }

  positionPopover(trigger, menu);

  if (!shown.hidden) {
    shown.scrollIntoView({ block: "nearest" });
  }
}
