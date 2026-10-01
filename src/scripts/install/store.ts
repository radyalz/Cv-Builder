export const OFFLINE_OFF_KEY = "cv-builder-offline-off";

export function readStore(store: Storage, key: string): string | null {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

export function writeStore(store: Storage, key: string, value: string): void {
  try {
    store.setItem(key, value);
  } catch {
    return;
  }
}

export function removeStore(store: Storage, key: string): void {
  try {
    store.removeItem(key);
  } catch {
    return;
  }
}
