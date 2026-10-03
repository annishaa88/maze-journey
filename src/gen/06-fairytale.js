/* ================= fairy-tale land: level makers ================= */
/* a perfect maze whose one true path is blocked by k "gates" (cells); gate i opens with an item of type c[i] found before it */
function gatedPath(n,types){
  const g=maze(n),r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n);const path=pathTo(r0.par,0,0,gx,gy),k=types.length;
  const gates=[];for(let i=0;i<k;i++){const idx=Math.min(path.length-2,Math.max(2,Math.floor(path.length*(i+1)/(k+1))));gates.push({x:path[idx][0],y:path[idx][1],c:types[i]});}
  const gi=(x,y)=>gates.findIndex(q=>q.x===x&&q.y===y);
  const closed=t=>(x,y,d)=>{const j=gi(x+DV[d][0],y+DV[d][1]);return j>=t;};
  const used=new Set(['0,0',gx+','+gy,...gates.map(q=>q.x+','+q.y)]),items=[];let prev=new Set();
  for(let i=0;i<k;i++){const reach=bfs(g,n,0,0,closed(i)).dist,dd=bfs(g,n,gates[i].x,gates[i].y,closed(i)).dist;let best=null,bd=-1;
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){const s=x+','+y;if(reach[y][x]<0||used.has(s)||prev.has(s))continue;const v=dd[y][x]+Math.random()*3;if(v>bd){bd=v;best=[x,y];}}
    if(!best)return null;items.push({x:best[0],y:best[1],c:types[i]});used.add(best.join(','));
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(reach[y][x]>=0)prev.add(x+','+y);}
  const stars=pickStars(n,3,used);
  return {g,n,start:{x:0,y:0},goal:{x:gx,y:gy},gates,items,stars,best:r0.dist[gy][gx]};
}
/* --- snow palace: ❄️ freezes water into a bridge, 🔥 melts an ice wall --- */
function snow(cfg){
  for(let t=0;t<30;t++){const types=Array.from({length:cfg.gates},(_,i)=>cfg.melt&&i%2===1?1:0);if(cfg.melt&&cfg.gates===1)types[0]=1;
    const lv=gatedPath(cfg.n,types);if(lv)return lv;}
  return null;
}
/* --- savanna: each animal on the path wants its own food; stampedes cross some rows --- */
function savanna(cfg){
  for(let t=0;t<30;t++){const lv=gatedPath(cfg.n,shuffle([0,1,2,3]).slice(0,cfg.gates));if(!lv)continue;
    const rows=shuffle(Array.from({length:cfg.n-2},(_,i)=>i+1).filter(y=>y!==lv.goal.y)).slice(0,cfg.herds).sort((a,b)=>a-b);
    lv.herds=rows.map((y,i)=>({y,dir:i%2?-1:1,off:i*.5}));return lv;}
  return null;
}
/* --- mermaid lagoon: land and water meet only at shell pads 🐚 --- */
function lagStep(t,n,x,y,d){const a=x+DV[d][0],b=y+DV[d][1];if(!inB(n,a,b)||t[b][a]===2)return null;
  const f=t[y][x],to=t[b][a];if(f===3||to===3||f===to)return [a,b];return null;}
function lagSolve(t,n,s,goal){const prev={[s.x+','+s.y]:null},q=[[s.x,s.y]];
  for(let h=0;h<q.length;h++){const [x,y]=q[h],k=x+','+y;if(x===goal.x&&y===goal.y){const o=[];let c=k;while(prev[c]){o.unshift(prev[c][1]);c=prev[c][0];}return o;}
    for(let d=0;d<4;d++){const r=lagStep(t,n,x,y,d);if(!r)continue;const nk=r.join(',');if(nk in prev)continue;prev[nk]=[k,d];q.push(r);}}return null;}
function lagoon(cfg){
  const n=cfg.n;let fb=null;
  for(let tries=0;tries<300;tries++){
    const t=Array.from({length:n},()=>Array(n).fill(0));
    for(let i=0;i<cfg.pools;i++){const cx=rnd(n),cy=rnd(n),r=1.3+Math.random()*cfg.size;for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(Math.hypot(x-cx,(y-cy)*1.2)<r)t[y][x]=1;}
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(Math.random()<cfg.rock)t[y][x]=2;
    const land=allCells(n).filter(([x,y])=>t[y][x]===0),water=allCells(n).filter(([x,y])=>t[y][x]===1);
    if(land.length<n*2||water.length<n*2)continue;
    const shore=shuffle(land.filter(([x,y])=>DV.some(([dx,dy])=>inB(n,x+dx,y+dy)&&t[y+dy][x+dx]===1)));
    shore.slice(0,cfg.pads).forEach(([x,y])=>t[y][x]=3);
    const [sx,sy]=shuffle(land.filter(([x,y])=>t[y][x]===0))[0]||[];if(sx==null)continue;
    const far=shuffle(water).sort((a,b)=>Math.abs(b[0]-sx)+Math.abs(b[1]-sy)-Math.abs(a[0]-sx)-Math.abs(a[1]-sy))[0];
    const start={x:sx,y:sy},goal={x:far[0],y:far[1]},sol=lagSolve(t,n,start,goal);if(!sol)continue;
    const reach=[];for(const [x,y] of allCells(n))if(t[y][x]!==2&&lagSolve(t,n,start,{x,y}))reach.push([x,y]);
    const stars=pickStars(n,3,new Set([sx+','+sy,goal.x+','+goal.y]),reach.filter(([x,y])=>t[y][x]!==3));
    const lv={t,n,start,goal,stars,best:sol.length};
    if(sol.length>=cfg.min&&stars.length===3)return lv;if(stars.length===3&&(!fb||sol.length>fb.best))fb=lv;
  }
  return fb;
}
/* --- magic carpet: fly until something stops you; a wish 🪔 makes the first rock ahead vanish --- */
function carpetFly(t,n,x,y,d,goal){const cells=[];for(;;){const a=x+DV[d][0],b=y+DV[d][1];if(!inB(n,a,b)||t[b][a])break;x=a;y=b;cells.push([x,y]);if(x===goal.x&&y===goal.y)break;}return {x,y,cells};}
function carpetRock(t,n,x,y,d){for(;;){x+=DV[d][0];y+=DV[d][1];if(!inB(n,x,y))return null;if(t[y][x])return [x,y];}}
function carpetSolve(t,n,s,goal,wishes,cap){
  const key=(x,y,w,rm)=>x+','+y+','+w+'|'+rm;const k0=key(s.x,s.y,wishes,''),prev=new Map([[k0,null]]),q=[{x:s.x,y:s.y,w:wishes,rm:[]}],cells=new Set();
  for(let h=0;h<q.length;h++){if(prev.size>(cap||40000))break;const c=q[h],ck=key(c.x,c.y,c.w,c.rm.join(';'));
    const tt=c.rm.length?t.map(r=>r.slice()):t;c.rm.forEach(k=>{const [a,b]=k.split(',').map(Number);tt[b][a]=0;});
    for(let d=0;d<4;d++)for(const wish of c.w>0?[0,1]:[0]){
      let rm=c.rm,t2=tt;if(wish){const r=carpetRock(tt,n,c.x,c.y,d);if(!r)continue;rm=c.rm.concat(r.join(',')).sort();t2=tt.map(row=>row.slice());t2[r[1]][r[0]]=0;}
      const f=carpetFly(t2,n,c.x,c.y,d,goal);if(!f.cells.length)continue;
      const nk=key(f.x,f.y,c.w-wish,rm.join(';'));if(prev.has(nk))continue;prev.set(nk,[ck,d*2+wish]);f.cells.forEach(p=>cells.add(p.join(',')));
      if(f.x===goal.x&&f.y===goal.y){const sol=[];let z=nk;while(prev.get(z)){const v=prev.get(z)[1];sol.unshift({d:v>>1,wish:v&1});z=prev.get(z)[0];}return {sol,cells};}
      q.push({x:f.x,y:f.y,w:c.w-wish,rm});}}
  return null;
}
function carpet(cfg){
  const n=cfg.n;let fb=null;
  for(let tries=0;tries<400;tries++){
    const t=Array.from({length:n},()=>Array(n).fill(0));for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(Math.random()<cfg.rock)t[y][x]=1;
    const free=shuffle(allCells(n).filter(([x,y])=>!t[y][x]));if(free.length<6)continue;
    const start={x:free[0][0],y:free[0][1]},g0=free.find(([x,y])=>Math.abs(x-start.x)+Math.abs(y-start.y)>=n-1);if(!g0)continue;const goal={x:g0[0],y:g0[1]};
    const R=carpetSolve(t,n,start,goal,cfg.wishes,30000);if(!R)continue;
    if(cfg.wishes&&carpetSolve(t,n,start,goal,0,20000))continue;   // the lamp must really be needed
    const used=new Set([start.x+','+start.y,goal.x+','+goal.y]);
    const stars=pickStars(n,3,used,[...R.cells].map(k=>k.split(',').map(Number)).filter(([x,y])=>!t[y][x]));
    const lv={t,n,start,goal,stars,best:R.sol.length,sol:R.sol};
    if(R.sol.length>=cfg.min&&stars.length===3)return lv;if(stars.length===3&&(!fb||R.sol.length>fb.best))fb=lv;
  }
  return fb;
}
/* --- midnight ball: find the glass slipper and reach the palace before the clock strikes twelve --- */
function ball(cfg){
  const n=cfg.n,g=maze(n);addLoops(g,n,cfg.loops);
  const r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n),rg=bfs(g,n,gx,gy).dist;
  const cand=allCells(n).filter(([x,y])=>!(x===0&&y===0)&&!(x===gx&&y===gy)).map(([x,y])=>[x,y,r0.dist[y][x]+rg[y][x]]).sort((a,b)=>b[2]-a[2]);
  const pick=cand[rnd(Math.max(1,Math.floor(cand.length*.25)))];const slipper={x:pick[0],y:pick[1]};
  const used=new Set(['0,0',gx+','+gy,pick[0]+','+pick[1]]),wands=[];
  for(const [x,y] of shuffle(allCells(n))){if(wands.length>=cfg.wands)break;if(used.has(x+','+y)||r0.dist[y][x]<3)continue;wands.push({x,y});used.add(x+','+y);}
  const stars=pickStars(n,3,used);
  const need=pick[2];
  return {g,n,start:{x:0,y:0},goal:{x:gx,y:gy},slipper,wands,stars,steps:need+cfg.slack,best:need};
}
/* --- living toys: move while the child plays, freeze when she looks; blankets 🧺 hide you --- */
function toyroom(cfg){
  const n=cfg.n,g=maze(n);addLoops(g,n,cfg.loops);
  const r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n);const path=pathTo(r0.par,0,0,gx,gy);
  const hides=[];for(let i=1;i<=cfg.hides;i++){const c=path[Math.floor(path.length*i/(cfg.hides+1))];if(c&&!hides.some(h=>h.x===c[0]&&h.y===c[1]))hides.push({x:c[0],y:c[1]});}
  const used=new Set(['0,0',gx+','+gy,...hides.map(h=>h.x+','+h.y)]);
  const stars=pickStars(n,3,used);
  return {g,n,start:{x:0,y:0},goal:{x:gx,y:gy},hides,stars,best:r0.dist[gy][gx]};
}

/* --- little red hood: stay on the path and the wolf can't reach you; flowers grow in the forest --- */
function redhood(cfg){
  const n=cfg.n;let fb=null;
  for(let tries=0;tries<200;tries++){
    // a thin winding trail: a small maze drawn at double size, with forest between its turns
    const m=Math.ceil(n/2),g=maze(m),r0=bfs(g,m,0,0);const [mx,my]=farthest(r0.dist,m);const mp=pathTo(r0.par,0,0,mx,my);
    const t=Array.from({length:n},()=>Array(n).fill(0)),path=[];
    mp.forEach(([x,y],i)=>{if(i){const [px,py]=mp[i-1];path.push([px+x,py+y]);}path.push([2*x,2*y]);});
    path.forEach(([x,y])=>t[y][x]=2);const [gx,gy]=path[path.length-1];
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(!t[y][x]&&Math.random()<cfg.trees)t[y][x]=1;
    // how far each forest square is from the path, walking only through the forest
    const dist=Array.from({length:n},()=>Array(n).fill(-1)),q=[];
    path.forEach(([x,y])=>{dist[y][x]=0;q.push([x,y]);});
    for(let h=0;h<q.length;h++){const [x,y]=q[h];for(let d=0;d<4;d++){const a=x+DV[d][0],b=y+DV[d][1];if(!inB(n,a,b)||t[b][a]!==0||dist[b][a]>=0)continue;dist[b][a]=dist[y][x]+1;q.push([a,b]);}}
    const grass=allCells(n).filter(([x,y])=>t[y][x]===0&&dist[y][x]>0);
    const fl=[];for(const c of shuffle(grass.filter(([x,y])=>dist[y][x]>=cfg.deep&&dist[y][x]<=cfg.deep+2))){if(fl.length>=cfg.flowers)break;if(fl.some(f=>Math.abs(f.x-c[0])+Math.abs(f.y-c[1])<3))continue;fl.push({x:c[0],y:c[1]});}
    if(fl.length<cfg.flowers)continue;
    const used=new Set(['0,0',gx+','+gy,...fl.map(f=>f.x+','+f.y)]);
    const dens=[];for(const c of shuffle(grass)){if(dens.length>=cfg.wolves)break;const k=c.join(',');if(used.has(k)||c[0]+c[1]<4||dist[c[1]][c[0]]<2||fl.some(f=>Math.abs(f.x-c[0])+Math.abs(f.y-c[1])<4))continue;dens.push({x:c[0],y:c[1]});used.add(k);}
    if(dens.length<cfg.wolves){fb=fb||null;continue;}
    const stars=pickStars(n,3,used,allCells(n).filter(([x,y])=>t[y][x]===2||(t[y][x]===0&&dist[y][x]>0)));
    const lv={t,n,start:{x:0,y:0},goal:{x:gx,y:gy},flowers:fl,dens,stars,best:path.length-1};
    if(stars.length===3)return lv;fb=lv;
  }
  if(!fb&&cfg.deep>1)return redhood(Object.assign({},cfg,{deep:cfg.deep-1}));
  if(!fb&&cfg.flowers>1)return redhood(Object.assign({},cfg,{flowers:cfg.flowers-1}));
  return fb;
}

