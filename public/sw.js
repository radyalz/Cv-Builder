/* -------- The service worker --------
   Makes the site an installable app that opens at once, even offline.

   - The page's shell (its HTML, styles and scripts) is cached when the
     worker installs. The build fills in the list below and a version made
     from it (see astro.config.mjs), so each deploy installs a fresh copy
     and clears the old one.
   - The page itself is fetched from the network first, so a new deploy
     shows straight away; the cached copy is only used offline.
   - Everything else of the site's own (the PDF viewer, fonts, icons) has
     a unique name per version, so it is served from the cache once it has
     been fetched the first time.
   - Requests to other sites (the CV API, GitHub) are left alone: the page
     keeps its own cache of previews (cv-previews-v1), which this worker
     never touches. */

const VERSION = "dev";
const PRECACHE = [];
const CACHE = `cv-app-${VERSION}`;
const SCOPE = new URL(self.registration.scope);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE.map((path) => new URL(path, SCOPE).href)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("cv-app-") && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== SCOPE.origin || !url.pathname.startsWith(SCOPE.pathname)) {
    return;
  }

  // The page: the network first, the cached shell when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();

            caches.open(CACHE).then((cache) => cache.put(SCOPE.href, copy));
          }

          return response;
        })
        .catch(() => caches.match(SCOPE.href))
    );
    return;
  }

  // Everything else of ours: the cache first, filled on first use.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();

            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }

          return response;
        })
    )
  );
});
