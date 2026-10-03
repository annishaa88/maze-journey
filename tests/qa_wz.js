const {chromium}=require('playwright');const K=['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
const u='file://'+__dirname+'/../dist/page.html';await p.goto(u);
await p.evaluate(()=>{localStorage.setItem('journey_tut',JSON.stringify(window.__T.WORLDS.map(w=>w.id)));});await p.goto(u);
const worlds=JSON.parse(process.argv[2]||'[56,57,58,59,60,61]'),diffs=JSON.parse(process.argv[3]||'[1]'),levels=JSON.parse(process.argv[4]||'[0,3,5]');
// generic router over walls (g) or tiles (t); avoid = set of cells
const route=(to,avoid)=>p.evaluate(([to,avoid])=>{const G=window.__G(),lv=G.lv,n=lv.n,DV=[[0,-1],[1,0],[0,1],[-1,0]];const A=new Set(avoid||[]);
  const prev={[G.p.x+','+G.p.y]:null},q=[[G.p.x,G.p.y]];
  for(let h=0;h<q.length;h++){const [x,y]=q[h],k=x+','+y;if(x===to[0]&&y===to[1]){const o=[];let c=k;while(prev[c]){o.unshift(prev[c][1]);c=prev[c][0];}return o;}
    for(let d=0;d<4;d++){const a=x+DV[d][0],bb=y+DV[d][1],nk=a+','+bb;if(a<0||bb<0||a>=n||bb>=n||nk in prev||A.has(nk))continue;if(lv.g&&lv.g[y][x][d])continue;if(lv.t&&lv.t[bb][a])continue;prev[nk]=[k,d];q.push([a,bb]);}}return null;},[to,avoid]);
const G=f=>p.evaluate(f);
const report=[];
for(const dv of diffs){await p.evaluate(v=>window.__T.setDiff(v),dv);
for(const w of worlds)for(const l of levels){await p.evaluate(([w,l])=>window.__start(w,l),[w,l]);await p.waitForTimeout(400);await p.waitForFunction(w=>window.__G()&&window.__G().w===w,w);await p.waitForTimeout(150);
  const id=await G(()=>window.__G().W.id);const t0=Date.now();let note='';
  if(id==='broom'){await p.keyboard.press('ArrowRight');
    for(let i=0;i<600&&!(await p.isVisible('#win'));i++){const d=await G(()=>{const G=window.__G(),lv=G.lv,x=G.p.x,want=lv.ys[Math.min(lv.n-1,x+1)];return want<G.p.y?0:want>G.p.y?2:-1;});if(d>=0)await p.keyboard.press(K[d]);await p.waitForTimeout(60);}
    note='rings '+await G(()=>window.__G().wz.ringsGot.size+'/'+window.__G().lv.rings.length)+' hits '+await G(()=>window.__G().hits||0);}
  if(id==='stairs'){const goal=await G(()=>[window.__G().lv.goal.x,window.__G().lv.goal.y]);
    for(let i=0;i<400&&!(await p.isVisible('#win'));i++){const r=await route(goal);if(!r)break;const before=await G(()=>window.__G().p.x+','+window.__G().p.y);await p.keyboard.press(K[r[0]]);await p.waitForTimeout(40);
      if(before===await G(()=>window.__G().p.x+','+window.__G().p.y))await p.waitForTimeout(300);}
    note='hits '+await G(()=>window.__G().hits||0);}
  if(id==='potion'){const items=await G(()=>window.__G().lv.items.filter(q=>q.good).map(q=>[q.x,q.y]));const bars=await G(()=>window.__G().lv.bars.map(b=>b.x+','+b.y));
    for(const it of items){const r=await route(it,bars);for(const d of r){await p.keyboard.press(K[d]);await p.waitForTimeout(25);}}
    const c=await G(()=>[window.__G().lv.cauldron.x,window.__G().lv.cauldron.y]);for(const d of await route(c,bars)){await p.keyboard.press(K[d]);await p.waitForTimeout(25);}
    const goal=await G(()=>[window.__G().lv.goal.x,window.__G().lv.goal.y]);for(const d of await route(goal,[])){await p.keyboard.press(K[d]);await p.waitForTimeout(25);}
    note='brewed '+await G(()=>window.__G().wz.brewed);}
  if(id==='owlpost'){for(let g=0;g<30&&!(await p.isVisible('#win'));g++){
      const tgt=await G(()=>{const G=window.__G(),lv=G.lv,n=lv.n,Z=G.wz,DV=[[0,-1],[1,0],[0,1],[-1,0]];const dist=(sx,sy)=>{const D={},q=[[sx,sy]];D[sx+','+sy]=0;for(let h=0;h<q.length;h++){const [x,y]=q[h];for(let d=0;d<4;d++){if(lv.g[y][x][d])continue;const a=x+DV[d][0],b=y+DV[d][1];if((a+','+b) in D)continue;D[a+','+b]=D[x+','+y]+1;q.push([a,b]);}}return D;};
        const D=dist(G.p.x,G.p.y),T=lv.towers.filter(t=>Z.letters.has(t.c)).sort((a,b)=>D[a.x+','+a.y]-D[b.x+','+b.y]);const rests=[{x:0,y:0}].concat(lv.perches,lv.towers.filter(t=>!Z.letters.has(t.c)));
        for(const t of T){if(D[t.x+','+t.y]<=Z.energy)return [t.x,t.y];}
        // too far: rest at the rest point that is closest to the nearest tower and reachable now
        const t=T[0],Dt=dist(t.x,t.y);const ok=rests.filter(r=>D[r.x+','+r.y]<=Z.energy&&!(r.x===G.p.x&&r.y===G.p.y)).sort((a,b)=>Dt[a.x+','+a.y]-Dt[b.x+','+b.y]);return ok.length?[ok[0].x,ok[0].y]:[t.x,t.y];});
      const r=await route(tgt);for(const d of r){await p.keyboard.press(K[d]);await p.waitForTimeout(25);}}
    note='tired '+await G(()=>window.__G().hits||0);}
  if(id==='flykeys'){for(let i=0;i<500&&!(await p.isVisible('#win'));i++){
      const d=await G(()=>{const G=window.__G(),lv=G.lv,Z=G.wz,need=lv.need[Z.gotKeys.length];let to;if(need==null)to=[lv.goal.x,lv.goal.y];else{const k=Z.keys.find(k=>k.c===need);to=[k.x,k.y];}
        const n=lv.n,DV=[[0,-1],[1,0],[0,1],[-1,0]],avoid=new Set(Z.keys.filter(k=>k.c!==need).map(k=>k.x+','+k.y));const prev={[G.p.x+','+G.p.y]:null},q=[[G.p.x,G.p.y]];
        for(let h=0;h<q.length;h++){const [x,y]=q[h],k=x+','+y;if(x===to[0]&&y===to[1]){let c=k;if(!prev[c])return -1;while(prev[c][0]!==G.p.x+','+G.p.y)c=prev[c][0];return prev[c][1];}
          for(let d=0;d<4;d++){const a=x+DV[d][0],b=y+DV[d][1],nk=a+','+b;if(a<0||b<0||a>=n||b>=n||lv.t[b][a]||nk in prev||avoid.has(nk))continue;if(need!=null&&a===lv.goal.x&&b===lv.goal.y)continue;prev[nk]=[k,d];q.push([a,b]);}}return -1;});
      if(d>=0)await p.keyboard.press(K[d]);await p.waitForTimeout(120);}
    note='keys '+await G(()=>window.__G().wz.gotKeys.length+'/'+window.__G().lv.need.length);}
  if(id==='wand'){for(let g=0;g<12&&!(await p.isVisible('#win'));g++){
      const plan=await G(()=>{const G=window.__G(),lv=G.lv,n=lv.n,Z=G.wz,DV=[[0,-1],[1,0],[0,1],[-1,0]];const ek=window.__T.GEN.edgeKey;const prev={[G.p.x+','+G.p.y]:null},q=[[G.p.x,G.p.y]];
        for(let h=0;h<q.length;h++){const [x,y]=q[h],k=x+','+y;if(x===lv.goal.x&&y===lv.goal.y){const o=[];let c=k;while(prev[c]){o.unshift(prev[c][1]);c=prev[c][0];}return {dirs:o};}
          for(let d=0;d<4;d++){if(lv.g[y][x][d])continue;const a=x+DV[d][0],b=y+DV[d][1],nk=a+','+b;if(nk in prev)continue;const dk=ek(x,y,d);if(lv.doors[dk]&&!Z.open.has(dk)){const o=[];let c=k;while(prev[c]){o.unshift(prev[c][1]);c=prev[c][0];}return {dirs:o,rune:lv.doors[dk]};}prev[nk]=[k,d];q.push([a,b]);}}return null;});
      for(const d of plan.dirs){await p.keyboard.press(K[d]);await p.waitForTimeout(25);}
      if(plan.rune){await p.click('#act');await p.waitForTimeout(50);for(const a of plan.rune){await p.keyboard.press(K[a]);await p.waitForTimeout(40);}await p.waitForTimeout(100);}}
    note='doors '+await G(()=>window.__G().wz.open.size+'/'+Object.keys(window.__G().lv.doors).length);}
  await p.waitForTimeout(500);const won=await p.isVisible('#win');
  report.push(`${id} d${dv} L${l+1} n=${await G(()=>window.__G().lv.n)}: ${won?'WON':'NOT WON'} ${note} ${((Date.now()-t0)/1000).toFixed(1)}s`);
  if(won)await p.click('#winMap');else await p.evaluate(()=>document.getElementById('fsExit').click());await p.waitForTimeout(150);}}
console.log(report.join('\n'));console.log('errors',[...new Set(errs)].slice(0,6));await b.close();})();
