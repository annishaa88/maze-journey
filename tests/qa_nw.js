const {chromium}=require('playwright');
const K=['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const u='file://'+__dirname+'/../dist/page.html';await p.goto(u);
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('journey_tut',JSON.stringify(window.__T.WORLDS.map(w=>w.id)));});await p.goto(u);
const worlds=JSON.parse(process.argv[2]||'[37,38,39,40,41,42]'),diffs=JSON.parse(process.argv[3]||'[1]'),levels=JSON.parse(process.argv[4]||'[0,3,5]');
const press=async(dirs,ms)=>{for(const d of dirs){await p.keyboard.press(K[d]);await p.waitForTimeout(ms||30);}};
const route=(to,block)=>p.evaluate(([to,block])=>{const G=window.__G(),lv=G.lv,n=lv.n,DV=[[0,-1],[1,0],[0,1],[-1,0]];const B=new Set(block||[]);
  const prev={[G.p.x+','+G.p.y]:null},q=[[G.p.x,G.p.y]];
  for(let h=0;h<q.length;h++){const [x,y]=q[h],k=x+','+y;if(x===to[0]&&y===to[1]){const out=[];let c=k;while(prev[c]){out.unshift(prev[c][1]);c=prev[c][0];}return out;}
    for(let d=0;d<4;d++){if(lv.g[y][x][d])continue;const a=x+DV[d][0],b=y+DV[d][1],nk=a+','+b;if(nk in prev||B.has(nk))continue;prev[nk]=[k,d];q.push([a,b]);}}return null;},[to,block]);
const report=[];
for(const dv of diffs){await p.evaluate(v=>window.__T.setDiff(v),dv);
for(const w of worlds)for(const l of levels){
  await p.evaluate(([w,l])=>window.__start(w,l),[w,l]);await p.waitForTimeout(500);
  const id=await p.evaluate(()=>window.__G().W.id);const t0=Date.now();let note='';
  const G=()=>p.evaluate(()=>window.__G());
  if(id==='sheep'){for(let guard=0;guard<6&&!(await p.isVisible('#win'));guard++){
      const sol=await p.evaluate(()=>{const G=window.__G(),lv=G.lv,R=window.__T.GEN.sheepSolve(lv.t,lv.n,G.p,G.flock,lv.goal,200000);return R&&R.sol;});
      if(!sol){note='no sol';break;}await press(sol,25);await p.waitForTimeout(200);}
    note+=' penned '+await p.evaluate(()=>window.__G().penned);}
  if(id==='chef'){await p.evaluate(()=>{window.__G().lv.stoves=[];});
    const want=await p.evaluate(()=>window.__G().lv.want.length);
    for(let i=0;i<want;i++){const it=await p.evaluate(i=>{const t=window.__G().itemsLeft.find(q=>q.need===i);return [t.x,t.y];},i);const r=await route(it,[]);await press(r,25);}
    const g=await p.evaluate(()=>[window.__G().lv.goal.x,window.__G().lv.goal.y]);await press(await route(g,[]),25);note='got '+await p.evaluate(()=>window.__G().gotIng);}
  if(id==='memory'){const g=await p.evaluate(()=>[window.__G().lv.goal.x,window.__G().lv.goal.y]);const r=await route(g,[]);
    await press(r.slice(0,2),40);note='hidden '+await p.evaluate(()=>window.__G().memHide);
    await p.click('#act');note+=' peek '+await p.evaluate(()=>window.__G().peeksUsed);await press(r.slice(2),25);}
  if(id==='spell'){const L=await p.evaluate(()=>window.__G().lv.word.length);
    for(let i=0;i<L;i++){const t=await p.evaluate(()=>{const G=window.__G(),ch=G.lv.word[G.spellI],ts=G.tilesLeft.filter(q=>q.ch===ch);return ts.map(q=>[q.x,q.y]);});
      // avoid stepping on other letter tiles is not needed (wrong letters do nothing)
      const r=await route(t[0],[]);await press(r,25);}
    note='word '+await p.evaluate(()=>window.__G().lv.word+' '+window.__G().spellI);
    const g=await p.evaluate(()=>[window.__G().lv.goal.x,window.__G().lv.goal.y]);await press(await route(g,[]),25);}
  if(id==='paint'){for(let guard=0;guard<80&&!(await p.isVisible('#win'));guard++){
      const d=await p.evaluate(()=>{const G=window.__G(),lv=G.lv;return window.__T.GEN.paintSolve(lv.t,lv.n,G.painted,G.p,200000);});
      if(d<0){note='stuck';break;}await p.keyboard.press(K[d]);await p.waitForTimeout(25);}
    note+=' painted '+await p.evaluate(()=>window.__G().painted.length+'/'+window.__G().lv.cells);}
  if(id==='gravity'){const sol=await p.evaluate(()=>window.__G().lv.sol);for(const d of sol){await p.keyboard.press(K[d]);for(let i=0;i<40&&await p.evaluate(()=>!!window.__G().anim);i++)await p.waitForTimeout(40);}
    note='moves '+sol.length;}
  await p.waitForTimeout(500);
  const won=await p.isVisible('#win');
  report.push(`${id} d${dv} L${l+1} n=${await p.evaluate(()=>window.__G().lv.n)}: ${won?'WON':'NOT WON'} ${note} ${((Date.now()-t0)/1000).toFixed(1)}s`);
  if(won)await p.click('#winMap');else await p.evaluate(()=>document.getElementById('fsExit').click());await p.waitForTimeout(150);
}}
console.log(report.join('\n'));console.log('errors',errs);await b.close();})();
