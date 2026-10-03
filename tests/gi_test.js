const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
const u='file://'+__dirname+'/../dist/page.html';await p.goto(u);await p.evaluate(()=>localStorage.setItem('journey_tut',JSON.stringify(window.__T.WORLDS.map(w=>w.id).filter(i=>i!=='giant'))));await p.goto(u);
const K=['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'];const out=[];
const levels=JSON.parse(process.argv[2]||'[0,3,5]');
for(const l of levels){await p.evaluate(l=>window.__start(64,l),l);await p.waitForTimeout(500);
  if(await p.isVisible('#tut')){await p.screenshot({path:'gi_tut.png'});await p.evaluate(()=>{const b=document.querySelector('#tut button.big, #tutGo, #tut .big');b&&b.click();});await p.waitForTimeout(200);}
  const t0=Date.now();let steps=0;
  for(let guard=0;guard<6&&!(await p.isVisible('#win'));guard++){const path=await p.evaluate(()=>{const G=window.__G(),lv=G.lv,DV=[[0,-1],[1,0],[0,1],[-1,0]];const tg=[...G.stars].map(k=>k.split(',').map(Number));const T=tg.length?tg:[[lv.goal.x,lv.goal.y]];
    const prev={},s0=G.p.x+','+G.p.y,q=[[G.p.x,G.p.y]];prev[s0]=null;for(let h=0;h<q.length;h++){const [x,y]=q[h];if(T.some(t=>t[0]===x&&t[1]===y)){const o=[];let k=x+','+y;while(prev[k]){o.unshift(prev[k][1]);k=prev[k][0];}return o;}
    for(let d=0;d<4;d++){if(lv.g[y][x][d])continue;const a=x+DV[d][0],b=y+DV[d][1],nk=a+','+b;if(nk in prev)continue;prev[nk]=[x+','+y,d];q.push([a,b]);}}return null;});
    if(!path)break;for(const d of path){await p.keyboard.press(K[d]);steps++;await p.waitForTimeout(35);if(steps===25&&l===levels[0])await p.screenshot({path:'gi_mid.png'});}await p.waitForTimeout(250);}
  await p.waitForTimeout(500);out.push(`giant L${l+1} n=${await p.evaluate(()=>window.__G().lv.n)}: ${await p.isVisible('#win')?'WON':'NOT WON'} steps ${steps} best ${await p.evaluate(()=>window.__G().lv.best)} stars ${await p.evaluate(()=>window.__G().got)} ${((Date.now()-t0)/1000).toFixed(1)}s`);
  if(await p.isVisible('#win'))await p.click('#winMap');else await p.click('#fsExit');await p.waitForTimeout(200);}
// tap-to-run on the scrolled view
await p.evaluate(()=>window.__start(64,4));await p.waitForTimeout(500);
for(let i=0;i<12;i++){const m=await p.evaluate(()=>{const G=window.__G();for(let d=0;d<4;d++)if(!G.lv.g[G.p.y][G.p.x][d])return d;});await p.keyboard.press(K[m]);await p.waitForTimeout(60);}
await p.waitForTimeout(500);const before=await p.evaluate(()=>{const G=window.__G();return {p:G.p,cam:G.cam};});
const d=await p.evaluate(()=>{const G=window.__G();for(let d=0;d<4;d++)if(!G.lv.g[G.p.y][G.p.x][d])return d;});
const box=await p.evaluate(()=>{const r=document.querySelector('#board canvas').getBoundingClientRect();return [r.left,r.top,r.width];});const cs=box[2]/9,DV=[[0,-1],[1,0],[0,1],[-1,0]];
await p.mouse.click(box[0]+(before.p.x-before.cam.x+.5+DV[d][0]*1.5)*cs,box[1]+(before.p.y-before.cam.y+.5+DV[d][1]*1.5)*cs);await p.waitForTimeout(900);
out.push('tap run: from '+JSON.stringify(before.p)+' dir '+d+' to '+JSON.stringify(await p.evaluate(()=>window.__G().p)));await p.screenshot({path:'gi_l5.png'});
await p.setViewportSize({width:844,height:390});await p.waitForTimeout(400);await p.screenshot({path:'gi_land.png'});
await p.click('#fsExit');await p.evaluate(()=>{});
console.log(out.join('\n'));console.log('errors',[...new Set(errs)]);await b.close();})();
