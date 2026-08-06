/* ═══════════════════════════════════════════════════
   UniSchedule — Service Worker  (cache-first, offline)
═══════════════════════════════════════════════════ */

const CACHE_NAME = 'unischedule-cache-v9';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png'
];

// ─── INSTALL: pre-cache core assets ───────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ─── ACTIVATE: purge old caches ───────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ─── FETCH: cache-first strategy ──────────────────
self.addEventListener('fetch', e => {
  // Only handle GET requests
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  // Do NOT cache API requests to Supabase
  if (url.hostname.includes('supabase.co')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request)
        .then(response => {
          // Cache successful same-origin and CORS responses
          if (response && response.status === 200) {
            const type = response.type;
            if (type === 'basic' || type === 'cors') {
              const clone = response.clone();
              caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
            }
          }
          return response;
        })
        .catch(() => {
          // Offline fallback: serve index.html for navigation requests
          if (e.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});
