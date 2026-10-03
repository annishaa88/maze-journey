const {chromium}=require('playwright');const K=['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
const u='file://'+__dirname+'/../dist/page.html';await p.goto(u);
await p.evaluate(()=>{localStorage.setItem('journey_tut',JSON.stringify(window.__T.WORLDS.map(w=>w.id)));});await p.goto(u);
const out=[];const W=+(process.argv[4]||54);
const levels=JSON.parse(process.argv[2]||'[0,2,4,5]'),diffs=JSON.parse(process.argv[3]||'[1]');
for(const dv of diffs){await p.evaluate(v=>window.__T.setDiff(v),dv);
for(const l of levels){await p.evaluate(a=>window.__start(a[0],a[1]),[W,l]);await p.waitForFunction(()=>window.__G()&&window.__G().W.id);await p.waitForTimeout(400);
  let swaps=0,wt=0;const t0=Date.now();
  for(let i=0;i<400&&!(await p.isVisible('#win'));i++){
    const mv=await p.evaluate(()=>{const G=window.__G(),m=G.m,n=G.lv.n;if(m.phase!=='idle')return 'wait';
      // pick the swap that helps the goal most: prefer target colour, cherries down, jelly rows
      let best=null,bs=-1;const want=G.lv.want;
      for(let y=0;y<n;y++)for(let x=0;x<n;x++)for(const [dx,dy] of [[1,0],[0,1]]){const a=x+dx,c=y+dy;if(a>=n||c>=n)continue;const A=m.b[y][x],B=m.b[c][a];if(!A||!B||A.lk||B.lk||A.c<0||B.c<0)continue;
        m.b[y][x]=B;m.b[c][a]=A;const runs=window.__T.GEN.m3Find(m.b,n);m.b[y][x]=A;m.b[c][a]=B;let sc=0;
        if(A.sp===3||B.sp===3)sc=50;runs.forEach(r=>{sc+=r.cells.length;r.cells.forEach(([px,py])=>{const cc=(px===x&&py===y)?B:(px===a&&py===c)?A:m.b[py][px];if(cc&&cc.c===want.color)sc+=3;if(m.jelly[py][px])sc+=3;sc+=py*.3;});});
        if(sc>bs){bs=sc;best=[[x,y],[a,c]];}}
      return best;});
    if(mv==='wait'){if(++wt>150){out.push('STUCK phase '+await p.evaluate(()=>window.__G().m.phase));break;}await p.waitForTimeout(60);continue;}if(!mv)break;
    // swipe on the canvas from one candy to the other
    const box=await p.evaluate(()=>{const r=document.getElementById('cv')?document.getElementById('cv').getBoundingClientRect():document.querySelector('#board canvas').getBoundingClientRect();return [r.left,r.top,r.width];});
    const n=await p.evaluate(()=>window.__G().lv.n),cs=box[2]/n,[[x1,y1],[x2,y2]]=mv;
    await p.mouse.move(box[0]+(x1+.5)*cs,box[1]+(y1+.5)*cs);await p.mouse.down();await p.mouse.move(box[0]+(x2+.5)*cs,box[1]+(y2+.5)*cs,{steps:4});await p.mouse.up();swaps++;wt=0;await p.waitForTimeout(150);}
  await p.waitForTimeout(800);
  out.push(`match3 d${dv} L${l+1}: ${await p.isVisible('#win')?'WON':'NOT WON'} swaps ${swaps} moves left ${await p.evaluate(()=>window.__G().m.moves)} got ${await p.evaluate(()=>JSON.stringify(window.__G().m.got))} want ${await p.evaluate(()=>JSON.stringify(window.__G().lv.want))} stars ${await p.evaluate(()=>window.__G().got)} ${((Date.now()-t0)/1000).toFixed(1)}s`);
  if(await p.isVisible('#win'))await p.click('#winMap');else await p.evaluate(()=>document.getElementById('fsExit').click());await p.waitForTimeout(200);
}}
await p.evaluate(w=>window.__start(w,3),W);await p.waitForTimeout(700);await p.screenshot({path:'m3.png'});
console.log(out.join('\n'));console.log('errors',[...new Set(errs)].slice(0,8));await b.close();})();
