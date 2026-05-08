// KAFConnect Service Worker - Push Notifications
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

self.addEventListener('push', (event) => {
  let data = { title: 'KAFConnect', body: 'You have a new message', url: '/messages' }
  try { if (event.data) data = JSON.parse(event.data.text()) } catch {}
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/kaf-logo.png',
      badge: '/kaf-logo.png',
      tag: 'kaf-message',
      renotify: true,
      data: { url: data.url },
      actions: [{ action: 'open', title: 'Open Chat' }],
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(wcs => {
      const match = wcs.find(c => c.url.includes(self.location.origin))
      if (match) { match.focus(); match.navigate(url) }
      else clients.openWindow(url)
    })
  )
})
