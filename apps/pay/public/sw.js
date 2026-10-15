// Service Worker — NEXA Pay
const CACHE_NAME = 'nexa-pay-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (event.data) {
    const payload = event.data.json();
    self.registration.showNotification(payload.title || 'NEXA Pay', {
      body: payload.body || 'Nova atividade na sua conta.',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
    });
  }
});
