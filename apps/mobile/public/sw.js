// Service Worker — NEXA Mobile
const CACHE_NAME = 'nexa-mobile-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (event.data) {
    const payload = event.data.json();
    self.registration.showNotification(payload.title || 'NEXA Mobile', {
      body: payload.body || 'Atualização na sua linha virtual.',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
    });
  }
});
