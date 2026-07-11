self.addEventListener('push', (event) => {
  let data = { title: 'Impulso MiPyMEs', body: '', url: '/' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // ignore malformed payload
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Impulso MiPyMEs', {
      body: data.body || '',
      icon: '/images/logo-rural-commerce.png',
      badge: '/images/logo-rural-commerce.png',
      data: { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client && client.url.includes(url)) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
