const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
const u='file://'+__dirname+'/../dist/page.html';await p.goto(u);
await p.evaluate(()=>{localStorage.setItem('journey_tut',JSON.stringify(window.__T.WORLDS.map(w=>w.id)));});await p.goto(u);
const out=[];const W=+(process.argv[4]||55);const levels=JSON.parse(process.argv[2]||'[0,2,5]'),diffs=JSON.parse(process.argv[3]||'[1]');
for(const dv of diffs){await p.evaluate(v=>window.__T.setDiff(v),dv);
for(const l of levels){await p.evaluate(a=>window.__start(a[0],a[1]),[W,l]);await p.waitForFunction(()=>window.__G()&&window.__G().W.id);await p.waitForTimeout(500);
  let placed=0,kb=0;const t0=Date.now();
  for(let i=0;i<300&&!(await p.isVisible('#win'));i++){
    const mv=await p.evaluate(()=>{const G=window.__G(),k=G.k,m=G.lv.m;let best=null,bs=-1e9;
      k.tray.forEach((q,ti)=>{if(q.used)return;for(let y=0;y<m;y++)for(let x=0;x<m;x++){if(!q.cells.every(([a,b])=>{const X=x+a,Y=y+b;return X<m&&Y<m&&!k.grid[Y][X];}))continue;
        const g=k.grid.map(r=>r.slice());q.cells.forEach(([a,b])=>g[y+b][x+a]=1);let lines=0;for(let r=0;r<m;r++)if(g[r].every(v=>v))lines++;for(let c=0;c<m;c++)if(g.every(r=>r[c]))lines++;
        let fill=0;for(let r=0;r<m;r++){const f=g[r].filter(Boolean).length;fill+=f*f;}for(let c=0;c<m;c++){const f=g.filter(r=>r[c]).length;fill+=f*f;}
        const sc=lines*1000+fill;if(sc>bs){bs=sc;best={ti,x,y,w:Math.max(...q.cells.map(c=>c[0]))+1,h:Math.max(...q.cells.map(c=>c[1]))+1};}}});return best;});
    if(!mv){await p.waitForTimeout(100);continue;}
    const box=await p.evaluate(()=>{const r=document.querySelector('#board canvas').getBoundingClientRect();return [r.left,r.top,r.width];});
    const cs=box[2]/10;
    if(placed%4===3){ // sometimes use the keyboard: pick with hint-free arrows and place with the button
      await p.evaluate(mv=>{const G=window.__G();G.k.pick=mv.ti;G.k.ghost={x:0,y:0};},mv);
      for(let x=0;x<mv.x;x++){await p.keyboard.press('ArrowRight');}for(let y=0;y<mv.y;y++){await p.keyboard.press('ArrowDown');}await p.click('#act');kb++;}
    else{await p.mouse.move(box[0]+(mv.ti*3+2)*cs,box[1]+9.02*cs);await p.mouse.down();
      await p.mouse.move(box[0]+(mv.x+1+mv.w/2)*cs,box[1]+(mv.y+1.6+mv.h/2)*cs,{steps:6});await p.mouse.up();}
    placed++;await p.waitForTimeout(80);}
  await p.waitForTimeout(700);
  out.push(`blocks d${dv} L${l+1}: ${await p.isVisible('#win')?'WON':'NOT WON'} placed ${placed} (keys ${kb}) lines ${await p.evaluate(()=>window.__G().k.cleared+'/'+window.__G().lv.lines+' score '+window.__G().k.score+'/'+window.__G().lv.target+' best '+window.__G().k.best)} helps ${await p.evaluate(()=>window.__G().k.helps)} stars ${await p.evaluate(()=>window.__G().got)} ${((Date.now()-t0)/1000).toFixed(1)}s`);
  if(l===2&&dv===1){await p.screenshot({path:'bk'+W+'.png'});}
  if(await p.isVisible('#win'))await p.click('#winMap');else await p.evaluate(()=>document.getElementById('fsExit').click());await p.waitForTimeout(200);}}
// a mid-game picture
await p.evaluate(w=>window.__start(w,3),W);await p.waitForTimeout(700);
const box=await p.evaluate(()=>{const r=document.querySelector('#board canvas').getBoundingClientRect();return [r.left,r.top,r.width];});const cs=box[2]/10;
await p.mouse.move(box[0]+2*cs,box[1]+9.02*cs);await p.mouse.down();await p.mouse.move(box[0]+4*cs,box[1]+5*cs,{steps:5});await p.screenshot({path:'bk-drag.png'});await p.mouse.up();
console.log(out.join('\n'));console.log('errors',[...new Set(errs)].slice(0,8));await b.close();})();
