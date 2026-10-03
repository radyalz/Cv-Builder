import { report } from "../../lib/progress";
import { readWithProgress } from "../../lib/stream";
import { previewUrlFor } from "./listing";
import { app } from "./state";

const DEVICE_CACHE = "cv-previews-v1";

export const previewCache = new Map<string, Promise<Blob>>();

async function deviceCache(): Promise<Cache | null> {
  try {
    return "caches" in window ? await caches.open(DEVICE_CACHE) : null;
  } catch {
    return null;
  }
}

const COPY_BYTES = 200_000;

async function fetchCopy(url: string, background: boolean, expected = COPY_BYTES): Promise<Blob> {
  const store = await deviceCache();
  const kept = store && (await store.match(url));

  if (kept) {
    if (!background) report("copy", 1);
    return kept.blob();
  }

  const response = await fetch(url, { priority: background ? "low" : "high" } as RequestInit);

  if (!response.ok) {
    throw new Error("Preview request failed.");
  }

  store?.put(url, response.clone()).catch(() => undefined);

  if (background) return response.blob();

  return readWithProgress(response, expected, (loaded, total) => report("copy", loaded / total, { loaded, total }));
}

export async function pruneDeviceCache(): Promise<void> {
  const store = await deviceCache();

  if (!store) {
    return;
  }

  const current = new Set([...app.variants.values()].map(previewUrlFor));

  for (const request of await store.keys()) {
    if (!current.has(request.url)) store.delete(request).catch(() => undefined);
  }
}

export function cachedPreview(url: string, { background = false, size = 0 } = {}): Promise<Blob> {
  if (!previewCache.has(url)) {
    previewCache.set(
      url,
      fetchCopy(url, background, size || undefined).catch((error) => {
        previewCache.delete(url);
        throw error;
      })
    );
  }

  return previewCache.get(url)!;
}
