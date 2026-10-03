// sky flight bot: follows the shortest flight (balloons first, gusts included) and must land on every level
const {chromium}=require('playwright');const K=['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const u='file://'+__dirname+'/../dist/page.html';await p.goto(u);await p.evaluate(()=>{localStorage.clear();localStorage.setItem('journey_tut',JSON.stringify(window.__T.WORLDS.map(w=>w.id)));});await p.goto(u);
const diffs=JSON.parse(process.argv[2]||'[1]'),levels=JSON.parse(process.argv[3]||'[0,2,5]');let bad=0;
for(const dv of diffs){await p.evaluate(v=>window.__T.setDiff(v),dv);
 for(const l of levels){await p.evaluate(l=>window.__start(window.__T.WORLDS.findIndex(w=>w.id==='plane'),l),l);await p.waitForTimeout(500);const t0=Date.now();let presses=0;
  for(let guard=0;guard<400&&!(await p.isVisible('#win'));guard++){
    const d=await p.evaluate(()=>{const G=window.__G(),lv=G.lv,V=G.vh;if(V.blow)return -1;let m=0;lv.balloons.forEach((q,i)=>{if(!V.bal.some(r=>r.x===q.x&&r.y===q.y))m|=1<<i;});const R=window.__T.GEN.planeSolve(lv,G.p.x,G.p.y,m);return R.path&&R.path.length?R.path[0]:-2;});
    if(d===-2)break;if(d<0){await p.waitForTimeout(80);continue;}await p.keyboard.press(K[d]);presses++;await p.waitForTimeout(60);}
  await p.waitForTimeout(400);const won=await p.isVisible('#win');const st=await p.evaluate(()=>{const G=window.__G();return {best:G.lv.best,gusts:G.vh.gusts,popped:G.vh.popped,winds:G.lv.winds.length,n:G.lv.n};});
  if(!won)bad++;console.log(`plane d${dv} L${l+1} n=${st.n}: ${won?'WON':'NOT WON'} presses ${presses} best ${st.best} winds ${st.winds} gusts ${st.gusts} balloons ${st.popped} ${((Date.now()-t0)/1000).toFixed(1)}s`);
  if(won)await p.evaluate(()=>{document.getElementById('win').hidden=true;});}}
console.log('errors',errs);process.exitCode=bad||errs.length?1:0;await b.close();})();
