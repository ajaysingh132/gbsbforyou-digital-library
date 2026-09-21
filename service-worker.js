const CACHE_NAME = "gbsbforyou-library-v1";

const CORE_FILES = [
  "./",
  "./index.html",
  "./library.html",
  "./book.html",
  "./manifest.json",
  "./robots.txt",
  "./sitemap.xml",
  "./assets/css/style.css",
  "./assets/js/app.js",
  "./data/books.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_FILES);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});
