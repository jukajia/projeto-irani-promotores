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

// Instalação e cache dos recursos essenciais
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => 
      Promise.all(
        urlsToCache.map(url => 
          cache.add(url).catch(err => {
            console.error(`[ServiceWorker] Falha ao adicionar no cache: ${url}`, err);
          })
        )
      )
    ).then(() => self.skipWaiting()) // Ativa SW imediatamente após instalação
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log(`[ServiceWorker] Removendo cache antigo: ${key}`);
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim()) // Controla clientes imediatamente
  );
});

// Interceptação das requisições
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse; // Retorna do cache se existir
      }
      // Busca na rede e, opcionalmente, pode adicionar ao cache para futuras requisições
      return fetch(event.request).catch(() => {
        // Fallback simples caso fetch falhe (exemplo: offline)
        // Pode implementar página offline customizada aqui
        return new Response("Você está offline e o recurso não está no cache.", {
          status: 503,
          statusText: "Service Unavailable",
          headers: new Headers({ "Content-Type": "text/plain" }),
        });
      });
    })
  );
});
