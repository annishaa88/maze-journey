// keeps a copy of the game on the device, so it opens with no internet
const V='mj-c2b1404d5f';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png','favicon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  if(r.mode==='navigate'){
    // the newest game when online, the saved one when not (or when the network is slow)
    e.respondWith(new Promise(res=>{let done=false;const fall=()=>caches.match('index.html').then(m=>{if(!done){done=true;res(m||fetch(r));}});
      const t=setTimeout(fall,3500);
      fetch(r).then(n=>{clearTimeout(t);if(n.ok){const cp=n.clone();caches.open(V).then(c=>c.put('index.html',cp));}if(!done){done=true;res(n);}}).catch(()=>{clearTimeout(t);fall();});}));
    return;}
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(n=>{if(n.ok){const cp=n.clone();caches.open(V).then(c=>c.put(r,cp));}return n;})));
});
