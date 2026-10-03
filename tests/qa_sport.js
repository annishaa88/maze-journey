// plays sports levels for real with the keyboard (enemies off, timers frozen where noted)
const {chromium}=require('playwright');
const K=['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const u='file://'+__dirname+'/../dist/page.html';await p.goto(u);
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('journey_tut',JSON.stringify(window.__T.WORLDS.map(w=>w.id)));});await p.goto(u);
const worlds=JSON.parse(process.argv[2]||'[25,26,27,28,29,30,31,32]'),diffs=JSON.parse(process.argv[3]||'[1]'),levels=JSON.parse(process.argv[4]||'[0,2,5]');
const press=async(dirs,ms)=>{for(const d of dirs){await p.keyboard.press(K[d]);await p.waitForTimeout(ms||30);}};
// generic path finder in the page: walk(from,to,blocked) over tiles or walls
await p.addInitScript(()=>{});
const route=(to,mode)=>p.evaluate(([to,mode])=>{const G=window.__G(),lv=G.lv,n=lv.n,DV=[[0,-1],[1,0],[0,1],[-1,0]];
  const ok=(x,y,a,b,d)=>{if(a<0||b<0||a>=n||b>=n)return false;if(lv.g)return !lv.g[y][x][d];return !lv.t[b][a];};
  const block=new Set(mode&&mode.block||[]);
  const prev={[G.p.x+','+G.p.y]:null},q=[[G.p.x,G.p.y]];
  for(let h=0;h<q.length;h++){const [x,y]=q[h],k=x+','+y;if(x===to[0]&&y===to[1]){const out=[];let c=k;while(prev[c]){out.unshift(prev[c][1]);c=prev[c][0];}return out;}
    for(let d=0;d<4;d++){const a=x+DV[d][0],b=y+DV[d][1],nk=a+','+b;if(!ok(x,y,a,b,d)||nk in prev||block.has(nk))continue;prev[nk]=[k,d];q.push([a,b]);}}return null;},[to,mode]);
const report=[];
for(const dv of diffs){await p.evaluate(v=>window.__T.setDiff(v),dv);
for(const w of worlds)for(const l of levels){
  await p.evaluate(([w,l])=>window.__start(w,l),[w,l]);await p.waitForTimeout(400);
  const id=await p.evaluate(()=>window.__G().W.id);const t0=Date.now();let note='';
  await p.evaluate(()=>{const G=window.__G();G.defs=[];G.opp=[];});
  if(id==='soccer'){const sol=await p.evaluate(()=>window.__G().lv.sol);
    for(const st of sol){const bl=await p.evaluate(()=>{const G=window.__G();return [G.ball.x+','+G.ball.y,G.lv.goal.x+','+G.lv.goal.y];});
      const r=await route([st.x,st.y],{block:bl});if(!r){note='no walk';break;}await press(r,25);await p.keyboard.press(K[st.d]);await p.waitForTimeout(700);}}
  if(id==='golf'){const dirs=await p.evaluate(()=>{const G=window.__G(),lv=G.lv,n=lv.n,T=window.__T.GEN;
      const prev={[G.p.x+','+G.p.y]:null},q=[[G.p.x,G.p.y]];
      for(let h=0;h<q.length;h++){const [x,y]=q[h],k=x+','+y;if(x===lv.goal.x&&y===lv.goal.y){const out=[];let c=k;while(prev[c]){out.unshift(prev[c][1]);c=prev[c][0];}return out;}
        for(let d=0;d<4;d++){const r=T.golfRoll(lv.t,n,x,y,d,lv.goal);if(!r.path.length||r.water)continue;const nk=r.x+','+r.y;if(nk in prev)continue;prev[nk]=[k,d];q.push([r.x,r.y]);}}return null;});
    if(!dirs)note='no plan';else for(const d of dirs){await p.keyboard.press(K[d]);await p.waitForTimeout(900);}
    note+=' par '+await p.evaluate(()=>window.__G().lv.par)+' stars '+await p.evaluate(()=>window.__G().got);}
  if(id==='dojo'){const dirs=await p.evaluate(()=>{const G=window.__G(),lv=G.lv,n=lv.n,T=window.__T.GEN,DV=[[0,-1],[1,0],[0,1],[-1,0]];
      const s0=G.p.x+','+G.p.y+','+G.phase,prev={[s0]:null},q=[[G.p.x,G.p.y,G.phase]];
      for(let h=0;h<q.length;h++){const [x,y,ph]=q[h],k=x+','+y+','+ph;if(x===lv.goal.x&&y===lv.goal.y){const out=[];let c=k;while(prev[c]){out.unshift(prev[c][1]);c=prev[c][0];}return out;}
        for(let d=0;d<4;d++){const a=x+DV[d][0],b=y+DV[d][1];if(a<0||b<0||a>=n||b>=n||lv.t[b][a]===3||!T.dojoOpen(lv.t,a,b,ph))continue;const nk=a+','+b+','+(1-ph);if(nk in prev)continue;prev[nk]=[k,d];q.push([a,b,1-ph]);}}return null;});
    if(!dirs)note='no plan';else await press(dirs,40);}
  if(id==='swim'){const dirs=await p.evaluate(()=>{const r=window.__G().lv.rival,out=[];for(let i=1;i<r.length;i++){const dx=r[i][0]-r[i-1][0],dy=r[i][1]-r[i-1][1];out.push(dy<0?0:dx>0?1:dy>0?2:3);}return out;});await press(dirs,90);}
  if(id==='ski'){await p.evaluate(()=>{window.__G().cfg.speed=1e9;});
    const acts=await p.evaluate(()=>{const G=window.__G(),lv=G.lv,n=lv.n,gs=lv.gates,all=(1<<gs.length)-1;
      const gm=(x,y,m)=>{gs.forEach((g,i)=>{if(g.y===y&&x>=g.x1&&x<=g.x2)m|=1<<i;});return m;};
      const s0=[G.p.x,G.p.y,gm(G.p.x,G.p.y,0)],prev={[s0.join(',')]:null},q=[s0];
      for(let h=0;h<q.length;h++){const [x,y,m]=q[h],k=x+','+y+','+m;if(y===n-1&&m===all){const out=[];let c=k;while(prev[c]){out.unshift(prev[c][1]);c=prev[c][0];}return out;}
        for(const [d,a,b] of [[3,x-1,y],[1,x+1,y],[2,x,y+1]]){if(a<0||a>=n||b>=n||lv.t[b][a])continue;const nm=gm(a,b,m),nk=a+','+b+','+nm;if(nk in prev)continue;prev[nk]=[k,d];q.push([a,b,nm]);}}return null;});
    if(!acts)note='no plan';else await press(acts,45);}
  if(id==='hurdles'){
    for(let guard=0;guard<300;guard++){if(await p.isVisible('#win'))break;
      const act=await p.evaluate(()=>{const G=window.__G(),lv=G.lv,n=lv.n,DV=[[0,-1],[1,0],[0,1],[-1,0]];if(G.jump)return {t:'wait'};if(G.stuck)return {t:'unstick'};
        const H=new Set(lv.hurd.map(h=>h.x+','+h.y));const prev={[G.p.x+','+G.p.y]:null},q=[[G.p.x,G.p.y]];
        for(let h=0;h<q.length;h++){const [x,y]=q[h],k=x+','+y;if(x===lv.goal.x&&y===lv.goal.y){let c=k,first=null;while(prev[c]){first=prev[c];c=prev[c][0];}return {t:first[2],d:first[1]};}
          for(let d=0;d<4;d++){if(lv.g[y][x][d])continue;const a=x+DV[d][0],b=y+DV[d][1];
            if(!H.has(a+','+b)&&!((a+','+b) in prev)){prev[a+','+b]=[k,d,'m'];q.push([a,b]);}
            if(!lv.g[b][a][d]){const a2=a+DV[d][0],b2=b+DV[d][1],k2=a2+','+b2;if(H.has(a+','+b)&&!H.has(k2)&&!(k2 in prev)){prev[k2]=[k,d,'j'];q.push([a2,b2]);}}}}
        return {t:'stuck'};});
      if(act.t==='wait'){await p.waitForTimeout(80);continue;}
      if(act.t==='stuck'){note='no route';break;}
      if(act.t==='unstick'){await p.keyboard.press('ArrowUp');await p.waitForTimeout(40);continue;}
      if(act.t==='m'){await p.keyboard.press(K[act.d]);await p.waitForTimeout(40);}
      else{await p.keyboard.press(K[act.d]);await p.waitForTimeout(30);await p.keyboard.press(' ');await p.waitForTimeout(450);}}
    note+=' time left '+await p.evaluate(()=>{const G=window.__G();return Math.round((G.timeLeft-(performance.now()-G.raceT0))/1000);});}
  if(id==='tennis'){await p.evaluate(()=>{window.__G().cfg.speed=1e9;});
    const hits=await p.evaluate(()=>window.__G().cfg.hits);
    for(let i=0;i<hits;i++){const b=await p.evaluate(()=>{const G=window.__G(),bl=G.tball;return [bl.x,bl.y];});
      // walk next to the ball, then step into it
      let done=false;for(const [dx,dy,d] of [[0,1,0],[0,-1,2],[1,0,3],[-1,0,1]]){const r=await route([b[0]+dx,b[1]+dy],{block:[b.join(','),'x']});
        if(r){await press(r,25);await p.keyboard.press(K[d]);await p.waitForTimeout(350);done=true;break;}}
      if(!done){note='cannot reach ball';break;}}
    const g=await p.evaluate(()=>[window.__G().lv.goal.x,window.__G().lv.goal.y]);const r=await route(g,{});if(r)await press(r,25);}
  if(id==='hoops'){
    const hs=await p.evaluate(()=>window.__G().lv.hoops);
    for(const h of hs){
      const plan=await p.evaluate(h=>{const G=window.__G(),lv=G.lv,n=lv.n,DV=[[0,-1],[1,0],[0,1],[-1,0]];
        // a square from which a straight throw passes the hoop
        for(let d=0;d<4;d++){let x=h.x,y=h.y;const back=(d+2)%4;for(let k=0;k<n;k++){if(lv.g[y][x][back])break;x+=DV[back][0];y+=DV[back][1];return {x,y,d};}}return null;},h);
      if(!plan){note='no line';break;}
      if(!(await p.evaluate(()=>window.__G().hasBall))){const ba=await p.evaluate(()=>{const b=window.__G().ballAt;return [b.x,b.y];});const r=await route(ba,{});await press(r,25);}
      const r=await route([plan.x,plan.y],{});await press(r,25);await p.evaluate(d=>{window.__G().face4=d;},plan.d);await p.keyboard.press(' ');await p.waitForTimeout(1200);}
    if(!(await p.evaluate(()=>window.__G().hasBall))){const ba=await p.evaluate(()=>{const b=window.__G().ballAt;return [b.x,b.y];});const r=await route(ba,{});if(r)await press(r,25);}
    const g=await p.evaluate(()=>[window.__G().lv.goal.x,window.__G().lv.goal.y]);const r=await route(g,{});if(r)await press(r,25);
    note+=' scored '+await p.evaluate(()=>window.__G().scored.size)+'/'+hs.length;}
  await p.waitForTimeout(500);
  const won=await p.isVisible('#win');
  report.push(`${id} d${dv} L${l+1} n=${await p.evaluate(()=>window.__G().lv.n)}: ${won?'WON':'NOT WON'} ${note} ${((Date.now()-t0)/1000).toFixed(1)}s`);
  if(won)await p.click('#winMap');else await p.evaluate(()=>document.getElementById('fsExit').click());await p.waitForTimeout(150);
}}
console.log(report.join('\n'));console.log('errors',errs);await b.close();})();
