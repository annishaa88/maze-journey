const {chromium}=require('playwright');
const K=['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const u='file://'+__dirname+'/../dist/page.html';await p.goto(u);
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('journey_tut',JSON.stringify(window.__T.WORLDS.map(w=>w.id)));});await p.goto(u);
// 1) every clue sum really equals its digit, all grades
const bad=await p.evaluate(()=>{const out=[];const ev=s=>Function('return '+s.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/(\d+)²/g,'($1*$1)'))();
  for(let g=0;g<6;g++)for(let v=0;v<10;v++)for(let i=0;i<60;i++){const e=window.__T.clue(v,g);if(ev(e)!==v||/-\d/.test(e.replace(/ − /g,'')))out.push(g+':'+v+'='+e);}return out.slice(0,10);});
console.log('clue check problems:',bad.length?bad:'none');
const route=async(to,teleport)=>(await route0(to,teleport,true))||route0(to,teleport,false);
const route0=(to,teleport,av)=>p.evaluate(([to,teleport,av])=>{const G=window.__G(),lv=G.lv,n=lv.n,DV=[[0,-1],[1,0],[0,1],[-1,0]];
  const avoid=new Set(av&&G.W.id==='shadow'?G.trailPath.slice(Math.max(0,G.shIdx),-1).map(c=>c.x+','+c.y):[]);
  const land=k=>teleport?(lv.links[k]?lv.links[k].to:lv.holes[k]||k):k;const lock=G.W.id==='escape'&&!G.doorOpen?lv.goal.x+','+lv.goal.y:G.W.id==='shadow'&&G.lightsLeft.length?lv.goal.x+','+lv.goal.y:'';
  const prev={[G.p.x+','+G.p.y]:null},q=[G.p.x+','+G.p.y];
  for(let h=0;h<q.length;h++){const k=q[h],[x,y]=k.split(',').map(Number);if(x===to[0]&&y===to[1]){const out=[];let c=k;while(prev[c]){out.unshift(prev[c][1]);c=prev[c][0];}return out;}
    for(let d=0;d<4;d++){if(lv.g[y][x][d])continue;const raw=(x+DV[d][0])+','+(y+DV[d][1]);if(raw===lock&&raw!==to[0]+','+to[1])continue;if(avoid.has(raw))continue;const nk=land(raw);if(nk in prev)continue;prev[nk]=[k,d];q.push(nk);}}return null;},[to,teleport,av]);
const out=[];
for(const [w,dv,l] of [[34,1,0],[34,1,3],[34,1,5],[34,3,5],[34,0,5]]){
  await p.evaluate(v=>window.__T.setDiff(v),dv);await p.evaluate(([w,l])=>window.__start(w,l),[w,l]);await p.waitForTimeout(400);
  const id=await p.evaluate(()=>window.__G().W.id);let note='',moves=0;const t0=Date.now();
  if(id==='tilt'){for(let g=0;g<40&&!(await p.isVisible('#win'));g++){await p.click('#hintBtn');await p.waitForTimeout(30);const h=await p.evaluate(()=>window.__G().hint);if(!h){note='no hint';break;}await p.keyboard.press(K[h.d]);moves++;await p.waitForTimeout(700);}}
  if(id==='floors'){const g=await p.evaluate(()=>[window.__G().lv.goal.x,window.__G().lv.goal.y]);const r=await route(g,true);if(!r)note='no route';else for(const d of r){await p.keyboard.press(K[d]);moves++;await p.waitForTimeout(40);}}
  if(id==='shadow'||id==='escape'){
    const targets=await p.evaluate(()=>{const G=window.__G();return (G.W.id==='shadow'?G.lv.lights:G.lv.clues).map(c=>[c.x,c.y]);});
    if(id==='shadow'){for(let round=0;round<12;round++){const left=await p.evaluate(()=>{const G=window.__G();return G.lightsLeft.map(c=>[c.x,c.y]).sort((a,b)=>Math.abs(a[0]-G.p.x)+Math.abs(a[1]-G.p.y)-Math.abs(b[0]-G.p.x)-Math.abs(b[1]-G.p.y));});if(!left.length)break;
      const r=await route(left[0],false);if(!r){note='no route';break;}for(const d of r){await p.keyboard.press(K[d]);moves++;await p.waitForTimeout(200);}}}
    else for(const t of targets){const r=await route(t,false);if(!r){note='no route';break;}for(const d of r){await p.keyboard.press(K[d]);moves++;await p.waitForTimeout(30);}}
    if(id==='escape'){const g=await p.evaluate(()=>[window.__G().lv.goal.x,window.__G().lv.goal.y]);
      // walk next to the door, bump into it, type the code from the clues
      const r=await route(g,false);for(const d of r){await p.keyboard.press(K[d]);await p.waitForTimeout(30);}
      const code=await p.evaluate(()=>{const ev=s=>Function('return '+s.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/(\d+)²/g,'($1*$1)'))();return window.__G().lv.clueText.map(ev).join('');});
      for(const ch of code)await p.click('#keypad button[data-k="'+ch+'"]');await p.waitForTimeout(500);
      await p.keyboard.press(K[r[r.length-1]]);await p.waitForTimeout(300);}
    else{const g=await p.evaluate(()=>[window.__G().lv.goal.x,window.__G().lv.goal.y]);const r=await route(g,false);if(r)for(const d of r){await p.keyboard.press(K[d]);moves++;await p.waitForTimeout(200);}}}
  await p.waitForTimeout(500);
  out.push(`${id} d${dv} L${l+1}: ${await p.isVisible('#win')?'WON':'NOT WON'} moves ${moves} hits ${await p.evaluate(()=>window.__G().hits||0)} ${note} ${((Date.now()-t0)/1000).toFixed(1)}s`);
  if(await p.isVisible('#win'))await p.click('#winMap');else await p.evaluate(()=>document.getElementById('fsExit').click());await p.waitForTimeout(100);}
console.log(out.join('\n'));console.log('errors',errs);await b.close();})();
