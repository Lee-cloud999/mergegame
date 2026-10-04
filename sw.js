const V='adel-merge-v3';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
/* offline-first: serve cache at once, refresh it in the background for next launch */
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  e.respondWith(caches.open(V).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:true});
    const net=fetch(r).then(res=>{if(res&&res.ok&&new URL(r.url).origin===location.origin)c.put(r,res.clone());return res}).catch(()=>hit);
    return hit||net;
  }));
});
