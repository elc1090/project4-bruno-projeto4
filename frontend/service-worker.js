// Defina o nome do cache
const cacheName = 'my-pwa-cache';

// Lista de arquivos a serem armazenados em cache
const filesToCache = [
    '/',
    '/index.html',
    '/main.css',
    '/js/index.js',
    '/icon.jpg'
];

// Instalação do Service Worker e armazenamento em cache dos arquivos
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName)
            .then(cache => cache.addAll(filesToCache))
            .then(() => self.skipWaiting())
    );
});

// Interceptação das solicitações e fornecimento dos recursos em cache (offline-first)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});