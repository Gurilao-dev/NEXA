// Service Worker — NEXA Chat
const CACHE_NAME = 'nexa-chat-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (event.data) {
    const payload = event.data.json();
    self.registration.showNotification(payload.title || 'NEXA Chat', {
      body: payload.body || 'Nova mensagem recebida.',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
    });
  }
});
