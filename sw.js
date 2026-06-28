/* かいものメモ Service Worker
   ネットワーク優先（push後の更新が届きやすい）＋ オフライン時はキャッシュへフォールバック。
   外部（Firebase等）のリクエストには触らない。 */
const CACHE = 'kaimono-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=> c.addAll(ASSETS)).catch(()=>{}).then(()=> self.skipWaiting())
  );
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=> Promise.all(keys.filter(k=> k!==CACHE).map(k=> caches.delete(k))))
      .then(()=> self.clients.claim())
  );
});

self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin !== location.origin) return;   // Firebase/Google CDN等はそのまま（ネット直）
  e.respondWith(
    fetch(req)
      .then(res=>{ const copy = res.clone(); caches.open(CACHE).then(c=> c.put(req, copy)); return res; })
      .catch(()=> caches.match(req).then(m=> m || caches.match('./index.html')))
  );
});
