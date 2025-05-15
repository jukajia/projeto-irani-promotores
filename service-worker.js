const CACHE_NAME = "irani-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/gestor.html",
  "/loja.html",
  "/css/style.css",
  "/js/config.js",
  "/js/gestor.js",
  "/js/loja.js",
  "/imagens/favicon-juka.png",
  "https://www.gstatic.com/charts/loader.js",
  "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",
  "https://cdn.jsdelivr.net/npm/chart.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        urlsToCache.map(url =>
          cache.add(url).catch(err => {
            console.error('Falha ao adicionar no cache:', url, err);
          })
        )
      );
    })
  );
});


self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
