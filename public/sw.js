// Service Worker – AG SERVIZI
// Ignora scheme non supportati (chrome-extension://, moz-extension://, etc.)

const CACHE_NAME = "ag-servizi-v2";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
);

self.addEventListener("fetch", (e) => {
  // Salta scheme non HTTP
  if (!e.request.url.startsWith("http")) return;

  // Salta richieste non-GET (POST, PUT, DELETE, ecc.) — non si cachano
  if (e.request.method !== "GET") return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).catch(() => {
        // Rete non disponibile — lascia fallire silenziosamente
        return new Response("", { status: 503, statusText: "Offline" });
      });
    })
  );
});
