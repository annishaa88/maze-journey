const {chromium}=require('playwright');
const K=['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const u='file://'+__dirname+'/../dist/page.html';await p.goto(u);
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('journey_tut',JSON.stringify(window.__T.WORLDS.map(w=>w.id)));});await p.goto(u);
const worlds=JSON.parse(process.argv[2]||'[43,44,45,46,47,48]'),diffs=JSON.parse(process.argv[3]||'[1]'),levels=JSON.parse(process.argv[4]||'[0,3,5]');
const press=async(dirs,ms)=>{for(const d of dirs){await p.keyboard.press(K[d]);await p.waitForTimeout(ms||30);}};
const route=(to)=>p.evaluate((to)=>{const G=window.__G(),lv=G.lv,n=lv.n,DV=[[0,-1],[1,0],[0,1],[-1,0]];
  const B=new Set((G.ftGates||[]).filter(q=>!G.inv[q.c]).map(q=>q.x+','+q.y));
  const prev={[G.p.x+','+G.p.y]:null},q=[[G.p.x,G.p.y]];
  for(let h=0;h<q.length;h++){const [x,y]=q[h],k=x+','+y;if(x===to[0]&&y===to[1]){const out=[];let c=k;while(prev[c]){out.unshift(prev[c][1]);c=prev[c][0];}return out;}
    for(let d=0;d<4;d++){if(lv.g[y][x][d])continue;const a=x+DV[d][0],bb=y+DV[d][1],nk=a+','+bb;if(nk in prev||B.has(nk))continue;prev[nk]=[k,d];q.push([a,bb]);}}return null;},to);
const report=[];
for(const dv of diffs){await p.evaluate(v=>window.__T.setDiff(v),dv);
for(const w of worlds)for(const l of levels){
  await p.evaluate(([w,l])=>window.__start(w,l),[w,l]);await p.waitForTimeout(500);
  const id=await p.evaluate(()=>window.__G().W.id);const t0=Date.now();let note='';
  if(id==='snow'||id==='savanna'){await p.evaluate(()=>{window.__G().lv.herds=[];});
    const items=await p.evaluate(()=>window.__G().ftItems.map(q=>[q.x,q.y]));
    for(const it of items){const r=await route(it);if(!r){note='no route item';break;}await press(r,25);}
    const g=await p.evaluate(()=>[window.__G().lv.goal.x,window.__G().lv.goal.y]);const r=await route(g);if(r)await press(r,25);else note+=' no route goal';
    note+=' gates left '+await p.evaluate(()=>window.__G().ftGates.length);}
  if(id==='lagoon'){const s=await p.evaluate(()=>{const G=window.__G();return window.__T.GEN.lagSolve(G.lv.t,G.lv.n,G.p,G.lv.goal);});await press(s,30);note='len '+s.length;}
  if(id==='carpet'){const sol=await p.evaluate(()=>window.__G().lv.sol);
    for(const st of sol){if(st.wish){await p.click('#act');await p.waitForTimeout(60);}await p.keyboard.press(K[st.d]);for(let i=0;i<40&&await p.evaluate(()=>!!window.__G().anim);i++)await p.waitForTimeout(40);}
    note='moves '+sol.length+' wishes '+sol.filter(s=>s.wish).length;}
  if(id==='ball'){const sl=await p.evaluate(()=>[window.__G().lv.slipper.x,window.__G().lv.slipper.y]);await press(await route(sl),25);
    const g=await p.evaluate(()=>[window.__G().lv.goal.x,window.__G().lv.goal.y]);await press(await route(g),25);note='used '+await p.evaluate(()=>window.__G().stepsUsed+'/'+window.__G().lv.steps);}
  if(id==='toyroom'){const g=await p.evaluate(()=>[window.__G().lv.goal.x,window.__G().lv.goal.y]);const r=await route(g);let caught=0;
    for(const d of r){for(let i=0;i<100;i++){const ph=await p.evaluate(()=>{const G=window.__G(),c=G.cfg,T=c.green+800+c.red,ph=(performance.now()-G.rlT0)%T;return ph<c.green-150?0:2;});if(ph===0)break;await p.waitForTimeout(80);}
      await p.keyboard.press(K[d]);await p.waitForTimeout(40);}
    note='hits '+await p.evaluate(()=>window.__G().hits||0);}
  await p.waitForTimeout(600);
  const won=await p.isVisible('#win');
  report.push(`${id} d${dv} L${l+1} n=${await p.evaluate(()=>window.__G().lv.n)}: ${won?'WON':'NOT WON'} ${note} ${((Date.now()-t0)/1000).toFixed(1)}s`);
  if(won)await p.click('#winMap');else await p.evaluate(()=>document.getElementById('fsExit').click());await p.waitForTimeout(150);
}}
console.log(report.join('\n'));console.log('errors',errs);await b.close();})();
