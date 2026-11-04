// VibePod (formerly Deka): keeps the player shell available offline so tracks saved in IndexedDB play without internet.
// The page is always fetched fresh when there is a connection (no stale versions); the cache is only a fallback.
// Music and Yandex Disk requests are never touched here. CACHE name is kept as 'deka-shell-v1' for seamless upgrade.
const CACHE = 'deka-shell-v1';
const LEGACY_CACHES = [];
const SHELL = ['./', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  // Only delete explicitly known obsolete caches of this app so other GitHub Pages projects on the same origin are untouched.
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => LEGACY_CACHES.includes(k)).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req.mode === 'navigate' ? './' : req, copy)); }
      return res;
    }).catch(() => caches.match(req.mode === 'navigate' ? './' : req, { ignoreSearch: true }))
  );
});