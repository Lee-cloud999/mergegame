const V='adel-merge-v62';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
const AUDIO=['./audio/ending.mp3','./audio/bgm1.mp3','./audio/bgm2.mp3','./audio/bgm3.mp3','./audio/bgm4.mp3'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(async c=>{await c.addAll(FILES);AUDIO.forEach(u=>c.add(u).catch(()=>{}))}).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
/* 음악 파일: 재생 시 구간 요청(Range)을 캐시에서 잘라 응답 (iOS 대응, 오프라인 재생) */
async function rangeResp(r){
  const c=await caches.open(V);let hit=await c.match(r.url,{ignoreSearch:true});
  if(!hit){const res=await fetch(r.url);if(!res.ok)return res;c.put(r.url,res.clone());hit=res}
  const buf=await hit.arrayBuffer(),n=buf.byteLength;
  const m=/bytes=(\d*)-(\d*)/.exec(r.headers.get('range')||'');
  let s=m&&m[1]!==''?+m[1]:0,e=m&&m[2]!==''?+m[2]:n-1;if(e>=n)e=n-1;
  return new Response(buf.slice(s,e+1),{status:206,headers:{'Content-Type':'audio/mpeg','Content-Range':'bytes '+s+'-'+e+'/'+n,'Content-Length':String(e-s+1),'Accept-Ranges':'bytes'}});
}
/* offline-first: serve cache at once, refresh it in the background for next launch */
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  if(r.headers.has('range')&&/\.mp3$/.test(new URL(r.url).pathname)){e.respondWith(rangeResp(r));return}
  e.respondWith(caches.open(V).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:true});
    const net=fetch(r).then(res=>{if(res&&res.ok&&res.status===200&&new URL(r.url).origin===location.origin)c.put(r,res.clone());return res}).catch(()=>hit);
    return hit||net;
  }));
});
