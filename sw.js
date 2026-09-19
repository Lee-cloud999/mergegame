const C='naeun-merge-v2';
const F=['./','index.html','manifest.webmanifest',
'assets/seed.png','assets/sprout.png','assets/seedling.png','assets/flower.png',
'assets/fruit1.png','assets/fruit3.png','assets/orange.png','assets/grape.png',
'assets/poodle.png','assets/rabbit.png','assets/cat.png','assets/chick.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(c => c.addAll(F)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== C).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const copy = r.clone();
        caches.open(C).then(c => c.put(e.request, copy));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
