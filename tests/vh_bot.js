const {chromium}=require('playwright');const K=['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
const u='file://'+__dirname+'/../dist/page.html';await p.goto(u);await p.evaluate(()=>localStorage.setItem('journey_tut',JSON.stringify(window.__T.WORLDS.map(w=>w.id))));await p.goto(u);
const worlds=JSON.parse(process.argv[2]||'[65,66,67,68,69,70]'),levels=JSON.parse(process.argv[3]||'[0,3,5]'),diffs=JSON.parse(process.argv[4]||'[1]');
// shortest route with the world's own rules
const route=(to,mode)=>p.evaluate(([to,mode])=>{const G=window.__G(),lv=G.lv,n=lv.n,V=G.vh,DV=[[0,-1],[1,0],[0,1],[-1,0]],ek=window.__T.GEN.edgeKey;
  const fires=new Set((V.fires||[]).map(f=>f.x+','+f.y));const s0=G.p.x+','+G.p.y,prev={[s0]:null},q=[[G.p.x,G.p.y]];
  for(let h=0;h<q.length;h++){const [x,y]=q[h];if(x===to[0]&&y===to[1]){const o=[];let k=x+','+y;while(prev[k]){o.unshift(prev[k][1]);k=prev[k][0];}return o;}
    for(let d=0;d<4;d++){if(lv.g[y][x][d])continue;const a=x+DV[d][0],b=y+DV[d][1],nk=a+','+b;if(nk in prev)continue;
      if(G.W.id==='schoolbus'){const ow=lv.oneway[ek(x,y,d)];if(ow!==undefined&&ow!==d)continue;if(a===lv.goal.x&&b===lv.goal.y&&!(to[0]===a&&to[1]===b))continue;}
      if(G.W.id==='firetruck'&&mode!=='free'&&fires.has(nk)&&!(to[0]===a&&to[1]===b))continue;
      if(mode==='notback'&&h===0&&d===[2,3,0,1][V.dir])continue;if(G.W.id==='race'&&(lv.oil||[]).some(o=>o.x===a&&o.y===b)&&!(to[0]===a&&to[1]===b)&&mode!=='free')continue;
      prev[nk]=[x+','+y,d];q.push([a,b]);}}return null;},[to,mode]);
const out=[];
for(const dv of diffs){await p.evaluate(v=>window.__T.setDiff(v),dv);
for(const w of worlds)for(const l of levels){await p.evaluate(a=>window.__start(a[0],a[1]),[w,l]);await p.waitForTimeout(400);
  const id=await p.evaluate(()=>window.__G().W.id),t0=Date.now();let note='',presses=0;const done=()=>p.isVisible('#win');
  const S=()=>p.evaluate(()=>{const G=window.__G();return {p:[G.p.x,G.p.y],V:G.vh,lv:{goal:[G.lv.goal.x,G.lv.goal.y],start:[G.lv.start.x,G.lv.start.y],hyd:(G.lv.hydrants||[]).map(h=>[h.x,h.y]),stops:G.lv.stops,cap:G.lv.cap,cargo:G.lv.cargo,best:G.lv.best},stars:[...G.stars]};});
  if(id==='firetruck'){for(let g=0;g<40&&!(await done());g++){const st=await S();let tg;
      const dist=([x,y])=>Math.abs(x-st.p[0])+Math.abs(y-st.p[1]);
      if(st.V.fires.length&&st.V.tank>0){tg=st.V.fires.map(f=>[f.x,f.y]).sort((a,b)=>dist(a)-dist(b))[0];}
      else if(st.V.fires.length){tg=[st.lv.start,...st.lv.hyd].sort((a,b)=>dist(a)-dist(b))[0];}else tg=st.lv.start;
      let r=await route(tg);
      if(!r&&st.V.fires.length&&st.V.tank>0){for(const f of st.V.fires){r=await route([f.x,f.y]);if(r)break;}}
      if(!r)r=await route(tg,'free');
      if(!r){note='no route';break;}for(const d of r){await p.keyboard.press(K[d]);presses++;await p.waitForTimeout(30);}
      if(!st.V.fires.length||(!st.V.tank&&st.V.fires.length&&r.length===0))break;}
    note+=' fires left '+await p.evaluate(()=>window.__G().vh.fires.length);}
  if(id==='schoolbus'||id==='lights'){const tg=id==='schoolbus'?[...(await S()).lv.stops.map(s=>[s.x,s.y]),(await S()).lv.goal]:[(await S()).lv.goal];
    for(const t of tg){for(let tries=0;tries<400;tries++){const r=await route(t);if(!r||!r.length)break;const pos=(await S()).p;await p.keyboard.press(K[r[0]]);presses++;await p.waitForTimeout(40);
        if(JSON.stringify((await S()).p)===JSON.stringify(pos))await p.waitForTimeout(350);}}
    if(id==='schoolbus')note='kids '+(await S()).V.kids;}
  if(id==='train'){await p.keyboard.press('ArrowRight');let last='';for(let i=0;i<900&&!(await done());i++){const st=await S();const key=st.p.join()+st.V.wait;
      if(key!==last){last=key;const tg=st.V.cargo.length?st.V.cargo.map(c=>[c.x,c.y]).sort((a,b)=>Math.abs(a[0]-st.p[0])+Math.abs(a[1]-st.p[1])-Math.abs(b[0]-st.p[0])-Math.abs(b[1]-st.p[1]))[0]:st.lv.goal;
        let r=await route(tg,'notback');if(!r)r=await route(tg);if(r&&r.length){await p.keyboard.press(K[r[0]]);presses++;}}
      await p.waitForTimeout(60);}
    note='cargo '+(await S()).V.loaded;}
  if(id==='parking'){for(let g=0;g<40&&!(await done());g++){const mv=await p.evaluate(()=>{const G=window.__G(),V=G.vh,sol=window.__T.GEN.pkSolve(V.cars,60000);if(!sol||!sol.length)return null;const [i,v]=sol[0],c=V.cars[i];return {i,delta:v-(c.h?c.x:c.y),h:c.h};});
      if(!mv)break;await p.evaluate(i=>{window.__G().vh.sel=i;},mv.i);const k=mv.h?(mv.delta>0?1:3):(mv.delta>0?2:0);for(let j=0;j<Math.abs(mv.delta);j++){await p.keyboard.press(K[k]);presses++;await p.waitForTimeout(25);}await p.waitForTimeout(60);}
    await p.waitForTimeout(1200);note='moves '+await p.evaluate(()=>window.__G().vh.moves)+' best '+(await S()).lv.best;}
  if(id==='race'){await p.waitForTimeout(3200);for(let i=0;i<200&&!(await done());i++){const st=await S();if(st.V.lost){note='LOST';break;}let r=await route(st.lv.goal);if(!r)r=await route(st.lv.goal,'free');if(!r||!r.length)break;await p.keyboard.press(K[r[0]]);presses++;await p.waitForTimeout(160);}
    note+=' spins '+(await p.evaluate(()=>window.__G().vh.spins||0))+' rival at '+(await S()).V.ri+'/'+(await p.evaluate(()=>window.__G().lv.rival.length));}
  await p.waitForTimeout(700);
  out.push(`${id} d${dv} L${l+1}: ${await done()?'WON':'NOT WON'} ${note} presses ${presses} stars ${await p.evaluate(()=>window.__G().got)} ${((Date.now()-t0)/1000).toFixed(1)}s`);
  if(await done())await p.click('#winMap');else await p.click('#fsExit');await p.waitForTimeout(200);}}
console.log(out.join('\n'));console.log('errors',[...new Set(errs)].slice(0,8));await b.close();})();
