const VERSION = 'silip-v14';
const SHELL = ['./', 'index.html', 'styles.css?v=14', 'app.js?v=14', 'account.js?v=14', 'manifest.json', 'qr.html', 'vendor/jsQR.js', 'vendor/qrcode.js', 'vendor/supabase.js', 'config.js?v=14', 'cloud.js?v=14', 'admin.html',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png',
  'assets/heritage-collage.png', 'assets/thanks.jpg',
  'assets/stamp-barasoain.png', 'assets/stamp-casa-real.png',
  'assets/stamp-cathedral.png', 'assets/stamp-bahay.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c =>
    Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Account API responses must never enter the public offline cache.
  if (url.origin !== location.origin && !/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) return;

  // Page navigations (including QR links like /?stamp=barasoain): network first, fall back to cached shell
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('index.html')));
    return;
  }
  // Same-origin files and Google Fonts: cache first, refresh in background
  if (url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then(hit => {
      const net = fetch(req).then(res => {
        if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => hit);
      return hit || net;
    }));
  }
});
