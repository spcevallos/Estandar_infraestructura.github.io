// v2: network-first. La versión anterior servía el caché primero y
// eso hacía que los cambios (diseño, sincronización en vivo) no se
// vieran en los celulares. Ahora siempre se intenta la red primero.
const CACHE_NAME = 'campus-calidad-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Network-first: siempre intenta traer la versión más reciente del servidor.
  // Solo usa el caché como respaldo si no hay conexión.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
