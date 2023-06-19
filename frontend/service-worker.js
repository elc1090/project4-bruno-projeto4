// Defina o nome do cache
const staticCacheName = 'potrol-cache-v1';

// Lista de arquivos a serem armazenados em cache
const filesToCache = [
    //'/',
    '/index.html',
    '/main.css',
    '/js/index.js',
    '/icon.jpg'
];

// Instalação do Service Worker e armazenamento em cache dos arquivos
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(staticCacheName)
            .then(cache => cache.addAll(filesToCache))
            .then(() => self.skipWaiting())
    );
});

// Clear cache on activate
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cacheName => (cacheName.startsWith('potrol-cache-')))
                    .filter(cacheName => (cacheName !== staticCacheName))
                    .map(cacheName => caches.delete(cacheName))
            );
        })
    );
});

// Interceptação das solicitações e fornecimento dos recursos em cache (offline-first)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});