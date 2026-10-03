const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
const u='file://'+__dirname+'/../dist/page.html';await p.goto(u);await p.evaluate(()=>localStorage.setItem('journey_tut',JSON.stringify(window.__T.WORLDS.map(w=>w.id))));await p.goto(u);
const out=[];const G=(f,a)=>p.evaluate(f,a);
async function swipe(a,c){const box=await G(()=>{const r=document.querySelector('#board canvas').getBoundingClientRect();return [r.left,r.top,r.width,window.__G().lv.n];});const cs=box[2]/box[3];
  await p.mouse.move(box[0]+(a[0]+.5)*cs,box[1]+(a[1]+.5)*cs);await p.mouse.down();await p.mouse.move(box[0]+(c[0]+.5)*cs,box[1]+(c[1]+.5)*cs,{steps:4});await p.mouse.up();}
async function settle(ms=8000){const t=Date.now();while(Date.now()-t<ms){if(await G(()=>{const g=window.__G();return g.done||g.m.phase==='idle';}))return true;await p.waitForTimeout(100);}return false;}
async function start(w,l){await G(a=>window.__start(a[0],a[1]),[w,l]);await p.waitForTimeout(400);}
/*
for(const [name,s1,s2] of [['bomb+bomb',3,3],['bomb+stripe',3,1],['bomb+wrapped',3,4],['bomb+plain',3,0],['stripe+stripe',1,2],['stripe+wrapped',2,4],['wrapped+wrapped',4,4]]){
  await start(54,1);await G(a=>{const m=window.__G().m;const A=m.b[3][3],B=m.b[3][4];A.sp=a[0];if(a[0]===3)A.c=-2;B.sp=a[1];if(a[1]===3)B.c=-2;window.__G().m.moves=20;},[s1,s2]);
  const before=await G(()=>window.__G().m.moves);await swipe([3,3],[4,3]);await p.waitForTimeout(250);const pr=await G(()=>(window.__G().m.praise||{}).text);const ok=await settle();
  out.push(`${name}: settled ${ok} moves ${before}->${await G(()=>window.__G().m.moves)} praise ${pr} nulls ${await G(()=>window.__G().m.b.flat().filter(c=>!c).length)}`);}
*/
// block score game over + auto retry
await start(63,0);await p.waitForTimeout(300);await G(()=>{const k=window.__G().k,m=window.__G().lv.m;for(let y=0;y<m;y++)for(let x=0;x<m;x++)k.grid[y][x]=((x+y)%2)?1:0;k.score=250;});
const fit=await G(()=>{const k=window.__G().k;k.tray=[{cells:[[0,0]],col:2,used:false},{cells:[[0,0],[1,0]],col:3,used:false},{cells:[[0,0],[0,1]],col:4,used:false}];return {i:0,x:0,y:0};});
if(fit){await G(f=>{const k=window.__G().k;k.pick=f.i;k.ghost={x:f.x,y:f.y};},fit);await p.click('#act');await p.waitForTimeout(400);
 out.push('block over '+await G(()=>window.__G().k.over)+' toast '+await G(()=>{const t=document.getElementById('toast');return t?t.textContent:'';}));await p.screenshot({path:'qa_bkover.png'});await p.waitForTimeout(2800);
 out.push('auto retry: score '+await G(()=>window.__G().k.score)+' over '+await G(()=>window.__G().k.over));}else out.push('block over: no single fit');
// night mode + landscape candy look
await p.setViewportSize({width:844,height:390});await start(62,2);await p.waitForTimeout(500);await p.screenshot({path:'qa_land62.png'});
console.log(out.join('\n'));console.log('errors',[...new Set(errs)].slice(0,8));await b.close();})();
