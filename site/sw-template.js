const CACHE = "__SBC_CACHE_NAME__";
const SHELL = __SBC_SHELL__;

self.addEventListener("install", (event) => {
  // Force full responses into Cache Storage. Without `reload`, Chromium can
  // satisfy install fetches with conditional 304 responses that have no body.
  const requests = SHELL.map((path) => new Request(path, { cache: "reload" }));
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(requests)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("sbc-shell-") && key !== CACHE)
          .map((key) => caches.delete(key))
      ).then(() => self.clients.claim())
    )
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          return response;
        })
    )
  );
});
