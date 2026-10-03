const {chromium}=require('playwright');const K=['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const u='file://'+__dirname+'/../dist/page.html';await p.goto(u);
await p.evaluate(()=>{localStorage.setItem('journey_tut',JSON.stringify(window.__T.WORLDS.map(w=>w.id)));});await p.goto(u);
const out=[];
// route that prefers the path: forest squares cost 3, path squares 1
const step=()=>p.evaluate(()=>{const G=window.__G(),lv=G.lv,n=lv.n,DV=[[0,-1],[1,0],[0,1],[-1,0]];
  const T=G.flowersLeft.length?G.flowersLeft.map(f=>f.x+','+f.y):[lv.goal.x+','+lv.goal.y];
  const dist={},prev={},s0=G.p.x+','+G.p.y;dist[s0]=0;const Q=[[0,G.p.x,G.p.y]];
  while(Q.length){Q.sort((a,b)=>a[0]-b[0]);const [c,x,y]=Q.shift(),k=x+','+y;if(c>dist[k])continue;if(T.includes(k)&&k!==s0){let z=k;while(prev[z][0]!==s0)z=prev[z][0];return prev[z][1];}
    for(let d=0;d<4;d++){const a=x+DV[d][0],bb=y+DV[d][1],nk=a+','+bb;if(a<0||bb<0||a>=n||bb>=n||lv.t[bb][a]===1)continue;if(G.flowersLeft.length&&a===lv.goal.x&&bb===lv.goal.y)continue;
      const nc=c+(lv.t[bb][a]===2?1:3);if(dist[nk]!=null&&dist[nk]<=nc)continue;dist[nk]=nc;prev[nk]=[k,d];Q.push([nc,a,bb]);}}return -1;});
for(const [dv,l] of [[1,0],[1,1],[1,3],[1,5],[0,5],[2,5],[3,5],[3,2]]){await p.evaluate(v=>window.__T.setDiff(v),dv);await p.evaluate(l=>window.__start(49,l),l);await p.waitForTimeout(500);let moves=0;
  for(let i=0;i<400&&!(await p.isVisible('#win'));i++){const d=await step();if(d<0){await p.waitForTimeout(200);continue;}await p.keyboard.press(K[d]);moves++;await p.waitForTimeout(170);}
  out.push(`redhood d${dv} L${l+1} n=${await p.evaluate(()=>window.__G().lv.n)} wolves ${await p.evaluate(()=>window.__G().wolves.length)}: ${await p.isVisible('#win')?'WON':'NOT WON'} moves ${moves} caught ${await p.evaluate(()=>window.__G().hits||0)}`);
  if(await p.isVisible('#win'))await p.click('#winMap');else await p.evaluate(()=>document.getElementById('fsExit').click());await p.waitForTimeout(200);}
// a catch: stand in the forest next to a wolf
await p.evaluate(()=>window.__T.setDiff(1));await p.evaluate(()=>window.__start(49,2));await p.waitForTimeout(500);
out.push('catch: '+await p.evaluate(async()=>{const G=window.__G(),lv=G.lv;const f=G.flowersLeft[0];G.bouquet.push(G.flowersLeft.shift());const w=G.wolves[0];
  const g=[];for(let y=0;y<lv.n;y++)for(let x=0;x<lv.n;x++)if(lv.t[y][x]===0)g.push([x,y]);const c=g.find(([x,y])=>!(x===w.x&&y===w.y));G.p={x:w.x,y:w.y};G.arcAt=0;
  await new Promise(r=>setTimeout(r,1200));return 'p='+JSON.stringify(G.p)+' onPath='+(lv.t[G.p.y][G.p.x]===2)+' bouquet '+G.bouquet.length+' hits '+G.hits+' msg '+document.getElementById('msg').textContent;}));
await p.evaluate(()=>document.getElementById('fsExit').click());await p.waitForTimeout(200);
await p.evaluate(()=>window.__start(49,3));await p.waitForTimeout(500);
for(let i=0;i<6;i++){const d=await step();if(d>=0){await p.keyboard.press(K[d]);await p.waitForTimeout(150);}}
await p.screenshot({path:'rh.png'});
console.log(out.join('\n'));console.log('errors',errs);await b.close();})();
