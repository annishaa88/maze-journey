// wrap the built game as an installable app that works offline
const fs=require('fs'),path=require('path'),crypto=require('crypto');
function buildApp(game,dir,icons){fs.mkdirSync(dir,{recursive:true});for(const f of fs.readdirSync(icons))fs.copyFileSync(path.join(icons,f),path.join(dir,f));
const W=(f,t)=>fs.writeFileSync(path.join(dir,f),t);
const ver=crypto.createHash('sha1').update(game).digest('hex').slice(0,10);
const head=`<!doctype html>
<html lang="he" dir="rtl"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#ff5d8f">
<meta name="description" content="מסע המבוכים – משחק מבוכים לילדים">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="favicon.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="מסע המבוכים">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<script>window.__APP='${ver}';</script>
</head><body>
`;
const tail=`
<script>if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));</script>
</body></html>
`;
W('index.html',head+game+tail);
W('manifest.webmanifest',JSON.stringify({name:'מסע המבוכים',short_name:'מסע המבוכים',lang:'he',dir:'rtl',start_url:'./',scope:'./',display:'standalone',orientation:'any',
  background_color:'#fff6e8',theme_color:'#ff5d8f',
  icons:[{src:'icon-192.png',sizes:'192x192',type:'image/png'},{src:'icon-512.png',sizes:'512x512',type:'image/png'},{src:'icon-maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}]},null,1));
W('sw.js',`// keeps a copy of the game on the device, so it opens with no internet
const V='mj-${ver}';
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
`);
W('.nojekyll','');
console.log('app built',ver,Math.round(fs.statSync(path.join(dir,'index.html')).size/1024)+'KB');}
module.exports={buildApp};
