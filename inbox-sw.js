/* Village Hub inbox notifications. Shows in-tab / background-tab pop-ups.
   Full Web Push (closed tab) is not wired; this worker only displays
   notifications posted by inbox.html. */
self.addEventListener('install', (event) => { self.skipWaiting(); });
self.addEventListener('activate', (event) => { event.waitUntil(self.clients.claim()); });

self.addEventListener('message', (event) => {
  const d = event.data || {};
  if (d.type !== 'notify') return;
  event.waitUntil(self.registration.showNotification(d.title || 'New WhatsApp message', {
    body: d.body || '',
    icon: d.icon,
    badge: d.badge || d.icon,
    tag: d.tag || 'vh-inbox',
    renotify: true,
    data: d.data || {},
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const c = event.notification.data && event.notification.data.c;
  const url = new URL('inbox.html' + (c ? ('?c=' + encodeURIComponent(c)) : ''), self.registration.scope).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if (client.url && client.url.indexOf('inbox.html') !== -1) {
        if ('focus' in client) await client.focus();
        client.postMessage({ type: 'open', c });
        return;
      }
    }
    await self.clients.openWindow(url);
  })());
});
