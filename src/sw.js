import { precacheAndRoute } from 'workbox-precaching';

// Injected at build time by vite-plugin-pwa (injectManifest strategy) with
// the list of app assets to precache for offline support.
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('push', (event) => {
  let data = { title: 'TaskLink', body: 'You have a new notification' };
  try {
    if (event.data) data = event.data.json();
  } catch {
    if (event.data) data.body = event.data.text();
  }

  const options = {
    body: data.body || '',
    icon: './assets/126895-removebg-preview.png',
    badge: '/assets/logo.png',
    data: { url: data.url || '/notifications' },
    tag: data.tag || undefined,
    renotify: Boolean(data.tag),
  };

  event.waitUntil(self.registration.showNotification(data.title || 'TaskLink', options));
});

// Clicking the OS notification focuses an already-open TaskLink tab if
// there is one, otherwise opens a new one at the relevant page.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/notifications';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      const existing = clientsArr.find((c) => c.url.startsWith(self.location.origin));
      if (existing) {
        existing.focus();
        if ('navigate' in existing) existing.navigate(url);
        return undefined;
      }
      return self.clients.openWindow(url);
    })
  );
});
