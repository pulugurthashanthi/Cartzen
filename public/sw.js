// Fake Basket service worker — lightweight offline shell + runtime caching.
//
// Caching policy (learned the hard way):
//  - Navigations: network-first, cache/offline fallback.
//  - Immutable build assets (/_next/static) + images/fonts: stale-while-revalidate.
//  - Everything else (RSC payloads `?_rsc=`, JSON, API): network only, never cached —
//    serving a previous build's RSC payload with the current build's JS crashes the app.
const CACHE = "fakebasket-v3";
const PRECACHE = ["/", "/offline", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

const STATIC_DEST = new Set(["image", "font", "style", "script"]);

function isImmutableAsset(url, request) {
  return url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/icon.svg" ||
    STATIC_DEST.has(request.destination);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // Navigation requests: network-first, fall back to cache, then offline page
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("/offline")))
    );
    return;
  }

  // Immutable/static assets: stale-while-revalidate
  if (isImmutableAsset(url, request)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Dynamic data (RSC payloads, API, JSON): network only — let the browser handle it.
});
