// Fake Basket service worker — lightweight offline shell + runtime caching.
//
// Caching policy (learned the hard way):
//  - Navigations: network-first. On failure we fall back to the /offline page,
//    NEVER to a cached full-page HTML shell. A cached homepage embeds that
//    build's hashed /_next/static chunk URLs; after a new deploy those chunks
//    are gone, so booting a stale shell 404s its own scripts and the installed
//    app shows "page can't be displayed". The offline page is self-contained,
//    so it's always safe to serve.
//  - Immutable build assets (/_next/static) + images/fonts: stale-while-revalidate.
//  - Everything else (RSC payloads `?_rsc=`, JSON, API): network only.
const CACHE = "fakebasket-v4";
const PRECACHE = ["/offline", "/icon.svg"];

// Absolute last-resort response so respondWith() never receives undefined
// (which itself surfaces as "page can't be displayed").
const FALLBACK_HTML = new Response(
  "<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'>" +
    "<title>Offline</title><body style='font-family:system-ui;text-align:center;padding:3rem'>" +
    "<h1>You’re offline</h1><p>Reconnect and reopen Fake Basket.</p>",
  { headers: { "Content-Type": "text/html; charset=utf-8" } }
);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      // Cache each item independently — one 404 shouldn't abort the whole
      // install and leave us with no offline fallback at all.
      await Promise.allSettled(PRECACHE.map((url) => cache.add(url)));
      await self.skipWaiting();
    })
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

  // Navigation requests: network-first, fall back to the offline page only.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/offline").then((r) => r || FALLBACK_HTML)
      )
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
