const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8765/');await p.waitForTimeout(1500);
console.log('sw',await p.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();return !!(r&&r.active);}),'cached',await p.evaluate(async()=>{const ks=await caches.keys();const c=await caches.open(ks[0]);return (await c.keys()).length;}));
console.log('fonts',await p.evaluate(async()=>{await document.fonts.ready;return [document.fonts.check('20px "Secular One"','מסע'),document.fonts.check('16px "Varela Round"','שלום')];}));
await ctx.setOffline(true);await p.reload();await p.waitForTimeout(1200);
console.log('offline title',await p.title(),'| map shown',await p.isVisible('#contBtn'));
await p.click('#contBtn');await p.waitForTimeout(800);if(await p.isVisible('#tutGo'))await p.click('#tutGo');await p.keyboard.press('ArrowRight');await p.waitForTimeout(300);
console.log('offline game running',await p.isVisible('#gameScreen'));await p.screenshot({path:'off_game.png'});
const man=await (await ctx.request.get('http://localhost:8765/manifest.webmanifest').catch(()=>null));console.log(errs);await b.close();})();
