// plays every arcade level for real with the keyboard (enemies switched off), checks the win screen
const {chromium}=require('playwright');
const K=['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const u='file://'+__dirname+'/../dist/page.html';await p.goto(u);
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('journey_tut',JSON.stringify(['munch','snake','road','bomb','ladders','mines','deep']));});await p.goto(u);
const worlds=JSON.parse(process.argv[2]||'[17,18,19,20,21,22]'),diffs=JSON.parse(process.argv[3]||'[1]'),levels=JSON.parse(process.argv[4]||'[0,1,2,3,4,5]');
const report=[];
const press=async(dirs,ms)=>{for(const d of dirs){await p.keyboard.press(K[d]);await p.waitForTimeout(ms||25);}};
for(const dv of diffs){await p.evaluate(v=>window.__T.setDiff(v),dv);
for(const w of worlds)for(const l of levels){
  await p.evaluate(([w,l])=>window.__start(w,l),[w,l]);await p.waitForTimeout(700);
  const id=await p.evaluate(()=>window.__G().W.id);const t0=Date.now();let note='';
  if(id==='munch'){
    if(process.argv[5]!=='enemies')await p.evaluate(()=>{window.__G().blobs=[];});
    for(let guard=0;guard<400;guard++){
      const dirs=await p.evaluate(()=>{const G=window.__G(),lv=G.lv,n=lv.n,DV=[[0,-1],[1,0],[0,1],[-1,0]];
        const goalK=lv.goal.x+','+lv.goal.y,want=G.dots.size?k=>G.dots.has(k):k=>k===goalK;
        const prev={[G.p.x+','+G.p.y]:null},q=[[G.p.x,G.p.y]];
        for(let h=0;h<q.length;h++){const [x,y]=q[h],k=x+','+y;if(h&&want(k)){const out=[];let c=k;while(prev[c]){out.unshift(prev[c][1]);c=prev[c][0];}return out;}
          for(let d=0;d<4;d++){if(lv.g[y][x][d])continue;const nk=(x+DV[d][0])+','+(y+DV[d][1]);if(nk in prev)continue;if(G.dots.size&&nk===goalK)continue;prev[nk]=[k,d];q.push([x+DV[d][0],y+DV[d][1]]);}}
        return null;});
      if(!dirs){note='no route';break;}await press(dirs.slice(0,3),process.argv[5]==='enemies'?170:20);
      if(await p.isVisible('#win'))break;}
  }
  if(id==='deep'){
    await p.evaluate(()=>{const G=window.__G();G.mon=[];G.lv.spikes=[];});
    for(let guard=0;guard<400;guard++){
      if(await p.isVisible('#win'))break;
      const d=await p.evaluate(()=>{const G=window.__G(),lv=G.lv,n=lv.n,T=window.__T.GEN,DV=[[0,-1],[1,0],[0,1],[-1,0]];
        if(G.jump||G.anim||G.pend||G.swirl)return -1;
        const prev={[G.p.x+','+G.p.y]:null},q=[[G.p.x,G.p.y]],gk=lv.goal.x+','+lv.goal.y;
        for(let h=0;h<q.length;h++){const [x,y]=q[h],k=x+','+y;if(k===gk){let c=k,first=null;while(prev[c]){first=prev[c][1];c=prev[c][0];}return first;}
          for(let e=0;e<4;e++){if(lv.g[y][x][e])continue;const [a,b]=T.deepLand(lv.pads,x+DV[e][0],y+DV[e][1]);const nk=a+','+b;if(nk in prev)continue;prev[nk]=[k,e];q.push([a,b]);}}
        return -2;});
      if(d===-2){note='no route';break;}
      if(d===-1){await p.waitForTimeout(80);continue;}
      await p.keyboard.press(K[d]);await p.waitForTimeout(40);
    }
  }
  if(id==='snake'){const sol=await p.evaluate(()=>window.__G().lv.sol);await press(sol,30);}
  if(id==='mines'||id==='ladders'){
    if(id==='ladders')await p.evaluate(()=>{window.__G().barrels=[];});
    const dirs=await p.evaluate(()=>{const G=window.__G(),lv=G.lv,n=lv.n,T=window.__T.GEN,DV=[[0,-1],[1,0],[0,1],[-1,0]];
      const step=(x,y,d)=>{if(lv.hole){const a=x+DV[d][0],b=y+DV[d][1];return a>=0&&b>=0&&a<n&&b<n&&!lv.hole[b][a]?[a,b]:null;}const r=T.ladStep(lv.t,n,x,y,d);return r?r[r.length-1]:null;};
      const prev={[G.p.x+','+G.p.y]:null},q=[[G.p.x,G.p.y]],gk=lv.goal.x+','+lv.goal.y;
      for(let h=0;h<q.length;h++){const [x,y]=q[h],k=x+','+y;if(k===gk){const out=[];let c=k;while(prev[c]){out.unshift(prev[c][1]);c=prev[c][0];}return out;}
        for(let d=0;d<4;d++){const r=step(x,y,d);if(!r)continue;const nk=r[0]+','+r[1];if(nk in prev)continue;prev[nk]=[k,d];q.push(r);}}return null;});
    if(!dirs)note='no route';else await press(dirs,id==='ladders'?260:30);
  }
  if(id==='road'){
    await p.evaluate(()=>{window.__G().cfg.speed=1e9;});
    const plan=await p.evaluate(()=>{const G=window.__G(),lv=G.lv,n=lv.n,T=window.__T.GEN,DV=[[0,-1],[1,0],[0,1],[-1,0]],P=2*n;
      const s0=G.p.x+','+G.p.y+','+(G.roadT%P),prev={[s0]:null},q=[[G.p.x,G.p.y,G.roadT%P]];
      for(let h=0;h<q.length;h++){const [x,y,t]=q[h],k=x+','+y+','+t;
        for(const d of [-1,0,1,2,3]){let nx=x,ny=y;if(d>=0){nx=x+DV[d][0];ny=y+DV[d][1];if(!T.roadCanStep(lv,nx,ny,t))continue;}
          if(ny===0){const out=[d];let c=k;while(prev[c]){out.unshift(prev[c][1]);c=prev[c][0];}return {acts:out,gx:nx};}
          const ax=T.roadTick(lv,nx,ny,t);if(ax==null)continue;const nk=ax+','+ny+','+((t+1)%P);if(nk in prev)continue;prev[nk]=[k,d];q.push([ax,ny,(t+1)%P]);}}
      return null;});
    if(!plan)note='no plan';else{
      for(let i=0;i<plan.acts.length;i++){const a=plan.acts[i];if(a>=0){await p.keyboard.press(K[a]);await p.waitForTimeout(20);}
        if(i<plan.acts.length-1){await p.evaluate(()=>{window.__G().arcAt=-1e12;});await p.waitForTimeout(45);}}
      // walk along the far bank to the lily pad
      const gx=await p.evaluate(()=>window.__G().lv.goal.x),px=await p.evaluate(()=>window.__G().p.x);
      for(let i=0;i<Math.abs(gx-px);i++){await p.keyboard.press(gx>px?'ArrowRight':'ArrowLeft');await p.waitForTimeout(25);}
    }
  }
  if(id==='bomb'){
    await p.evaluate(()=>{const G=window.__G();G.foes=[];G.cfg.fuse=600;});
    for(let guard=0;guard<200;guard++){
      if(await p.isVisible('#win'))break;
      const act=await p.evaluate(()=>{const G=window.__G(),lv=G.lv,n=lv.n,DV=[[0,-1],[1,0],[0,1],[-1,0]];
        if(G.bombAt||G.blast)return {t:'wait'};
        const ok=(x,y)=>x>=0&&y>=0&&x<n&&y<n&&lv.t[y][x]!==1;
        const bfs=(from,goal,allowCrack,avoid)=>{const prev={[from.x+','+from.y]:null},q=[[from.x,from.y]];
          for(let h=0;h<q.length;h++){const [x,y]=q[h],k=x+','+y;if(goal(x,y)){const out=[];let c=k;while(prev[c]){out.unshift(prev[c][1]);c=prev[c][0];}return out;}
            for(let d=0;d<4;d++){const a=x+DV[d][0],b=y+DV[d][1],nk=a+','+b;if(!ok(a,b)||nk in prev)continue;if(!allowCrack&&G.crack.has(nk))continue;if(avoid&&avoid(a,b))continue;prev[nk]=[k,d];q.push([a,b]);}}return null;};
        const path=bfs(G.p,(x,y)=>x===lv.goal.x&&y===lv.goal.y,true);if(!path)return {t:'stuck'};
        let x=G.p.x,y=G.p.y;const walk=[];
        for(const d of path){const a=x+DV[d][0],b=y+DV[d][1];if(G.crack.has(a+','+b))break;walk.push(d);x=a;y=b;}
        if(walk.length===path.length)return {t:'go',dirs:walk};
        // stand next to the crack, light it, run to a cell outside the plus
        const bx=x,by=y,inBlast=(a,c)=>(a===bx&&Math.abs(c-by)<=lv.range)||(c===by&&Math.abs(a-bx)<=lv.range);
        const away=bfs({x:bx,y:by},(a,c)=>!inBlast(a,c),false,(a,c)=>a===bx&&c===by);
        return {t:'bomb',walk,away};});
      if(act.t==='wait'){await p.waitForTimeout(120);continue;}
      if(act.t==='stuck'){note='stuck';break;}
      await press(act.dirs||act.walk,25);
      if(act.t==='bomb'){if(!act.away){note='no escape';break;}await p.keyboard.press(' ');await p.waitForTimeout(20);await press(act.away,25);await p.waitForTimeout(800);}
    }
  }
  await p.waitForTimeout(300);
  const won=await p.isVisible('#win');
  const st=await p.evaluate(()=>{const G=window.__G();return {got:G.got,hits:G.hits,n:G.lv.n+(G.lv.pads?' pads='+G.lv.pads.length:'')};});
  report.push(`${id} d${dv} L${l+1} n=${st.n}: ${won?'WON':'NOT WON'} ${note} hits=${st.hits} ${((Date.now()-t0)/1000).toFixed(1)}s`);
  if(won)await p.click('#winMap');else await p.evaluate(()=>document.getElementById('fsExit').click());
  await p.waitForTimeout(100);
}}
console.log(report.join('\n'));console.log('errors',errs);await b.close();})();
