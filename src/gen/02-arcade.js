/* ================= retro arcade worlds: level makers ================= */
// open up dead ends so the board is all loops, like an arcade maze
function noDeadEnds(g,n){for(let y=0;y<n;y++)for(let x=0;x<n;x++){if(g[y][x].filter(w=>w).length<3)continue;
  const ds=shuffle([0,1,2,3]).filter(d=>{const nx=x+DV[d][0],ny=y+DV[d][1];return g[y][x][d]&&nx>=0&&ny>=0&&nx<n&&ny<n;});
  if(ds.length){const d=ds[0];g[y][x][d]=0;g[y+DV[d][1]][x+DV[d][0]][OPP[d]]=0;}}}
/* --- dot muncher: eat every dot to open the exit; blobs wander; a power berry sends them running --- */
function munch(cfg){
  const n=cfg.n,g=maze(n);noDeadEnds(g,n);addLoops(g,n,Math.round(n*.5));
  const r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n);
  const used=new Set(['0,0',gx+','+gy]);
  const power=[[n-1,0],[0,n-1],[n-1,n-1],[Math.floor(n/2),Math.floor(n/2)]].filter(([x,y])=>!used.has(x+','+y)).slice(0,cfg.power);
  power.forEach(([x,y])=>used.add(x+','+y));
  const stars=pickStars(n,3,used);stars.forEach(([x,y])=>used.add(x+','+y));
  const dots=allCells(n).filter(([x,y])=>!used.has(x+','+y)).map(([x,y])=>x+','+y);
  const far=allCells(n).filter(([x,y])=>r0.dist[y][x]>=Math.max(4,n-1)&&!(x===gx&&y===gy));
  const blobs=shuffle(far).slice(0,cfg.blobs).map(([x,y],i)=>({x,y,hx:x,hy:y,last:-1,c:i%4}));
  return {g,n,start:{x:0,y:0},goal:{x:gx,y:gy},dots,power:power.map(([x,y])=>({x,y})),blobs,stars,best:r0.dist[gy][gx]};
}
/* --- snake: every fruit makes the tail longer and you cannot cross it.
       Each level is made by playing it first, so it can always be solved --- */
function snakeOk(t,n,body,x,y){
  if(x<0||y<0||x>=n||y>=n||t[y][x])return false;
  for(let i=0;i<body.length;i++)if(body[i][0]===x&&body[i][1]===y)return i===body.length-1&&body.length>2; // the tail tip moves away
  return true;
}
function snakeStep(body,x,y,eat){const nb=[[x,y],...body.map(c=>c.slice())];if(!eat)nb.pop();return nb;}
function snake(cfg){
  const n=cfg.n;
  for(let tries=0;tries<800;tries++){
    const t=Array.from({length:n},()=>Array(n).fill(0));
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(x+y>2&&Math.random()<cfg.rock)t[y][x]=1;
    let body=[[0,0]];const first=new Map([['0,0',0]]),fruits=[],sol=[];let goal=null;
    const gap=Math.max(3,Math.floor(cfg.steps/(cfg.fruits+1)));let since=0,dir=rnd(4);
    for(let step=1;step<=cfg.steps*2&&!goal;step++){
      const [hx,hy]=body[0];
      const opts=[0,1,2,3].filter(d=>snakeOk(t,n,body,hx+DV[d][0],hy+DV[d][1]));
      if(!opts.length)break;
      const d=opts.includes(dir)&&Math.random()<.55?dir:opts[rnd(opts.length)];dir=d;sol.push(d);
      const nx=hx+DV[d][0],ny=hy+DV[d][1],k=nx+','+ny,isNew=!first.has(k);if(isNew)first.set(k,step);
      since++;let eat=false;
      if(isNew&&fruits.length<cfg.fruits&&since>=gap){eat=true;fruits.push(k);since=0;}
      body=snakeStep(body,nx,ny,eat);
      if(isNew&&!eat&&fruits.length===cfg.fruits&&since>=3&&step>=cfg.steps*.8)goal={x:nx,y:ny};
    }
    if(!goal)continue;
    const used=new Set(['0,0',goal.x+','+goal.y,...fruits]);
    const pool=[...first.keys()].map(k=>k.split(',').map(Number));
    const stars=pickStars(n,3,used,pool);if(stars.length<3)continue;
    return {t,n,start:{x:0,y:0},goal,fruits,stars,sol,best:first.get(goal.x+','+goal.y)};
  }
  return snake(Object.assign({},cfg,{rock:Math.max(0,cfg.rock-.04)}));
}
/* --- road and river: cars and logs move one step at a time; cross to the far bank --- */
function laneAt(L,x,T){const sh=Math.floor(T/L.rate)*L.dir;return L.pat[(((x-sh)%L.w)+L.w)%L.w];}
function laneMoves(L,T){return Math.floor((T+1)/L.rate)!==Math.floor(T/L.rate);}
// one tick of the world with the player standing at x,y: logs carry her; returns her new x or null when she falls or is hit
function roadTick(lv,x,y,T){
  const L=lv.lanes[y];if(!L)return x;
  if(L.type==='W'&&laneMoves(L,T))x+=L.dir;
  if(x<0||x>=lv.n)return null;
  if(L.type==='W'&&!laneAt(L,x,T+1))return null;
  if(L.type==='R'&&laneAt(L,x,T+1))return null;
  return x;
}
function roadCanStep(lv,x,y,T){
  if(x<0||y<0||x>=lv.n||y>=lv.n)return false;const L=lv.lanes[y];if(!L)return true;
  return L.type==='R'?!laneAt(L,x,T):!!laneAt(L,x,T);
}
function road(cfg){
  const rows=['H'];for(let i=0;i<cfg.river;i++)rows.push('W');if(cfg.river)rows.push('G');
  for(let i=0;i<cfg.road;i++)rows.push('R');rows.push('S');
  while(rows.length<cfg.n){const i=1+rnd(rows.length-1);rows.splice(i,0,'G');}
  const n=rows.length;let fb=null;
  for(let tries=0;tries<300;tries++){
    let dir=Math.random()<.5?1:-1;
    const lanes=rows.map(k=>{if(k!=='R'&&k!=='W')return null;
      const pat=Array(n).fill(0);
      if(k==='R'){const want=Math.max(1,Math.round(n*cfg.dens));let placed=0,guard=0;
        while(placed<want&&guard++<80){const len=Math.random()<.35?2:1,x0=rnd(n);let ok=true;
          for(let j=-1;j<=len;j++)if(pat[((x0+j)%n+n)%n])ok=false;if(!ok)continue;
          for(let j=0;j<len;j++)pat[(x0+j)%n]=1;placed+=len;}}
      else{let x=rnd(2);while(x<n){const len=2+rnd(3);for(let j=0;j<len&&x+j<n;j++)pat[x+j]=1;x+=len+1+rnd(2);}}
      dir=-dir;return {pat,w:n,dir,rate:Math.random()<.5?1:2,type:k};});
    const sx=Math.floor(n/2),sy=n-1,gx=rnd(n);
    const lv={n,rows,lanes,start:{x:sx,y:sy},goal:{x:gx,y:0}};
    // can she cross by doing only one step (or waiting) per tick? then she surely can for real
    const P=2*n,seen=new Set([sx+','+sy+',0']),q=[[sx,sy,0]],cells=new Set([sx+','+sy]);let ok=false;
    for(let h=0;h<q.length&&!ok;h++){const [x,y,T]=q[h];
      for(const d of [-1,0,1,2,3]){let nx=x,ny=y;if(d>=0){nx=x+DV[d][0];ny=y+DV[d][1];if(!roadCanStep(lv,nx,ny,T))continue;}
        if(ny===0){ok=true;break;}
        const ax=roadTick(lv,nx,ny,T);if(ax==null)continue;const T1=(T+1)%P,k=ax+','+ny+','+T1;
        if(seen.has(k))continue;seen.add(k);cells.add(ax+','+ny);q.push([ax,ny,T1]);}}
    if(!ok)continue;
    const used=new Set([sx+','+sy,gx+',0']);
    const pool=[...cells].map(k=>k.split(',').map(Number)).filter(([x,y])=>rows[y]!=='W');
    for(let x=0;x<n;x++)pool.push([x,0]);
    lv.stars=pickStars(n,3,used,pool);lv.best=n-1;
    if(lv.stars.length===3)return lv;
    fb=fb||lv;
  }
  return fb||road(Object.assign({},cfg,{dens:Math.max(.1,cfg.dens-.1)}));
}
/* --- fireworks maze: stone pillars, cracked blocks, and a firework that clears them in a plus shape --- */
function bomb(cfg){
  const n=cfg.n,t=Array.from({length:n},()=>Array(n).fill(0));
  for(let y=1;y<n;y+=2)for(let x=1;x<n;x+=2)t[y][x]=1;
  const goal={x:n-1,y:n-1};
  for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(!t[y][x]&&x+y>1&&!(x===goal.x&&y===goal.y)&&Math.random()<cfg.crack)t[y][x]=2;
  // the door is always behind cracked blocks, so you need at least one firework
  [[goal.x-1,goal.y],[goal.x,goal.y-1]].forEach(([x,y])=>{if(!t[y][x])t[y][x]=2;});
  const cracks=allCells(n).filter(([x,y])=>t[y][x]===2),free=allCells(n).filter(([x,y])=>!t[y][x]);
  const used=new Set(['0,0',goal.x+','+goal.y]);
  const s1=pickStars(n,2,used,cracks);s1.forEach(([x,y])=>used.add(x+','+y));
  const s2=pickStars(n,3-s1.length,used,free.filter(([x,y])=>x+y>2));
  const stars=s1.concat(s2);stars.forEach(([x,y])=>used.add(x+','+y));
  stars.rest=shuffle(allCells(n).filter(([x,y])=>t[y][x]!==1&&!used.has(x+','+y)));
  const foes=shuffle(free.filter(([x,y])=>x+y>=n&&!(x===goal.x&&y===goal.y))).slice(0,cfg.foes).map(([x,y])=>({x,y,last:-1}));
  return {t,n,start:{x:0,y:0},goal,foes,stars,range:cfg.range,best:2*(n-1)};
}
/* --- ladder tower (seen from the side): floors, ladders, holes to fall through, barrels rolling along --- */
// tiles: 0 air, 1 brick, 2 ladder
function ladStand(t,n,x,y){return y>=n-1||t[y+1][x]===1||t[y][x]===2||t[y+1][x]===2;}
function ladStep(t,n,x,y,d){
  const nx=x+DV[d][0],ny=y+DV[d][1];
  if(nx<0||nx>=n||ny<0||ny>=n||t[ny][nx]===1)return null;
  if(d===0&&t[y][x]!==2)return null;                 // up only on a ladder
  if(d===2&&t[y][x]!==2&&t[ny][nx]!==2)return null;   // down only along a ladder
  const cells=[[nx,ny]];let fy=ny;while(!ladStand(t,n,nx,fy)){fy++;cells.push([nx,fy]);}
  return cells;
}
function ladders(cfg){
  const n=cfg.n;let fb=null;
  for(let tries=0;tries<300;tries++){
    const t=Array.from({length:n},()=>Array(n).fill(0));for(let x=0;x<n;x++)t[n-1][x]=1;
    const floors=[n-1];for(let yb=n-4;yb>=2;yb-=3){floors.push(yb);for(let x=0;x<n;x++)t[yb][x]=1;}
    const half=Math.floor(n/2),lads=[];let side=1;
    for(let k=1;k<floors.length;k++){const lo=floors[k-1],hi=floors[k];
      const lx=side>0?half+1+rnd(n-half-1):rnd(half);side=-side;
      for(let y=hi;y<=lo-1;y++)t[y][lx]=2;lads.push(lx);}
    const top=floors[floors.length-1]-1,topLad=lads[lads.length-1];
    const goal={x:topLad>=half?0:n-1,y:top};
    for(let k=1;k<floors.length;k++){const yb=floors[k];let placed=0,guard=0;
      while(placed<cfg.gaps&&guard++<60){const x=1+rnd(n-2);if(t[yb][x]!==1)continue;
        const to=lads[k]!=null?lads[k]:goal.x;  // the way across this floor stays whole; holes go off to the sides
        if(x>=Math.min(lads[k-1],to)-1&&x<=Math.max(lads[k-1],to)+1)continue;t[yb][x]=0;placed++;}}
    let gy=goal.y;while(!ladStand(t,n,goal.x,gy))gy++;if(gy!==goal.y)continue;
    const start={x:lads[0]>=half?0:n-1,y:n-2};
    const next=k=>{const [x,y]=k.split(',').map(Number),out=[];for(let d=0;d<4;d++){const r=ladStep(t,n,x,y,d);if(r){const c=r[r.length-1];out.push(c[0]+','+c[1]);}}return out;};
    const R=explore(start.x+','+start.y,next,k=>k===goal.x+','+goal.y);
    if(!R.won||!R.safe)continue;
    // barrels roll along the floors (one per floor at most, never on the start floor near the start)
    const barrels=[];
    shuffle(floors.map((yb,k)=>k)).forEach(k=>{if(barrels.length>=cfg.barrels)return;const y=floors[k]-1;
      // rolling lanes: floor cells, but not right next to the start or the flag
      const free=x=>t[y][x]!==1&&t[floors[k]][x]===1&&!(y===start.y&&Math.abs(x-start.x)<=2)&&!(y===goal.y&&Math.abs(x-goal.x)<=1);
      const runs=[];let cur=[];for(let x=0;x<n;x++){if(free(x))cur.push([x,y]);else{if(cur.length)runs.push(cur);cur=[];}}if(cur.length)runs.push(cur);
      const ok=runs.filter(r=>r.length>=3);
      if(!ok.length)return;const r=ok[rnd(ok.length)];barrels.push({cells:r,i:rnd(r.length),dir:Math.random()<.5?1:-1,noSleep:true});});
    if(barrels.length<cfg.barrels&&tries<200)continue;
    const used=new Set([start.x+','+start.y,goal.x+','+goal.y]);
    const pool=[...R.seen.keys()].map(k=>k.split(',').map(Number));
    const stars=pickStars(n,3,used,pool);
    const lv={t,n,floors,start,goal,barrels,stars,best:R.best};
    if(stars.length===3)return lv;
    fb=fb||lv;
  }
  return fb;
}
/* --- mole field: hidden holes; a number tells how many holes touch that spot (up, down, left, right) --- */
function mines(cfg){
  const n=cfg.n;
  for(let tries=0;tries<400;tries++){
    const hole=Array.from({length:n},()=>Array(n).fill(0));const goal={x:n-1,y:n-1};
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(x+y>1&&!(x===goal.x&&y===goal.y)&&Math.random()<cfg.holes)hole[y][x]=1;
    const reach=bfsTiles(hole,n,0,0,new Set());if(!reach.has(goal.x+','+goal.y))continue;
    const num=hole.map((row,y)=>row.map((_,x)=>[0,1,2,3].filter(d=>{const a=x+DV[d][0],b=y+DV[d][1];return a>=0&&b>=0&&a<n&&b<n&&hole[b][a];}).length));
    const used=new Set(['0,0',goal.x+','+goal.y]);
    const stars=pickStars(n,3,used,[...reach].map(k=>k.split(',').map(Number)));if(stars.length<3)continue;
    return {n,hole,num,start:{x:0,y:0},goal,stars,best:2*(n-1)};
  }
}
/* --- deep sea: bounce clams fling you over a wall, sea urchins pop their spikes, sleepy sea monsters patrol --- */
function deepLand(pads,x,y){const p=pads.find(q=>q.x===x&&q.y===y);return p?[p.x+2*DV[p.d][0],p.y+2*DV[p.d][1]]:[x,y];}
// every spot you can stand on: walking, and flying from the clams; keeps the way back for each spot
function deepReach(g,n,pads,sx,sy){
  const seen=new Map([[sx+','+sy,null]]),q=[[sx,sy]];
  for(let h=0;h<q.length;h++){const [x,y]=q[h];
    for(let d=0;d<4;d++){if(g[y][x][d])continue;const [a,b]=deepLand(pads,x+DV[d][0],y+DV[d][1]);const k=a+','+b;
      if(seen.has(k))continue;seen.set(k,[x+','+y,d]);q.push([a,b]);}}
  return seen;
}
function deep(cfg){
  const n=cfg.n;let fb=null;
  for(let tries=0;tries<300;tries++){
    const g=maze(n);const r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n);const goalK=gx+','+gy;
    const pads=[];let ok=true;
    const isPadOrLand=(x,y)=>pads.some(p=>(p.x===x&&p.y===y)||(p.x+2*DV[p.d][0]===x&&p.y+2*DV[p.d][1]===y));
    for(let c=0;c<cfg.pads&&ok;c++){
      // cut the way to the goal somewhere along it...
      for(let guard=0;guard<8;guard++){
        const R=deepReach(g,n,pads,0,0);if(!R.has(goalK))break;
        const route=[];let k=goalK;while(R.get(k)){const [pk,d]=R.get(k);route.unshift([pk,d,k]);k=pk;}
        const steps=route.filter(([pk,d,kk])=>{const [x,y]=pk.split(',').map(Number);return (x+DV[d][0])+','+(y+DV[d][1])===kk&&!isPadOrLand(x,y)&&x+y>1;});
        if(steps.length<3){ok=false;break;}
        const lo=Math.floor(steps.length*c/cfg.pads),hi=Math.max(lo+1,Math.floor(steps.length*(c+1)/cfg.pads)-1);
        const [pk,d]=steps[Math.min(steps.length-1,lo+rnd(hi-lo))];const [x,y]=pk.split(',').map(Number);
        g[y][x][d]=1;g[y+DV[d][1]][x+DV[d][0]][OPP[d]]=1;
      }
      if(!ok)break;
      // ...then a clam on this side flings you over to the other side
      const R=deepReach(g,n,pads,0,0);if(R.has(goalK)){ok=false;break;}
      const cands=[];
      for(const kk of R.keys()){const [x,y]=kk.split(',').map(Number);if(x+y<2||isPadOrLand(x,y))continue;
        for(let d=0;d<4;d++){const lx=x+2*DV[d][0],ly=y+2*DV[d][1];
          if(lx<0||ly<0||lx>=n||ly>=n||R.has(lx+','+ly)||isPadOrLand(lx,ly)||(lx===gx&&ly===gy))continue;cands.push({x,y,d});}}
      shuffle(cands);let placed=false;
      for(const cd of cands.slice(0,60)){pads.push(cd);if(deepReach(g,n,pads,0,0).has(goalK)){placed=true;break;}pads.pop();}
      if(!placed)ok=false;
    }
    if(!ok)continue;
    // you can never fly into a corner you can't get out of
    const next=k=>{const [x,y]=k.split(',').map(Number),out=[];for(let d=0;d<4;d++){if(g[y][x][d])continue;const [a,b]=deepLand(pads,x+DV[d][0],y+DV[d][1]);out.push(a+','+b);}return out;};
    const E=explore('0,0',next,k=>k===goalK);
    if(!E.won||!E.safe)continue;
    const R=deepReach(g,n,pads,0,0);
    const route=[];let k=goalK;while(R.get(k)){const [pk]=R.get(k);route.unshift(k);k=pk;}
    const used=new Set(['0,0',goalK]);pads.forEach(p=>{used.add(p.x+','+p.y);used.add((p.x+2*DV[p.d][0])+','+(p.y+2*DV[p.d][1]));});
    // urchins sit on the way, spread out; they pull their spikes in and out
    const spikes=[];const onRoute=route.filter(kk=>!used.has(kk));
    for(let i=0;i<cfg.spikes&&onRoute.length;i++){const kk=onRoute[Math.floor(onRoute.length*(i+.5)/cfg.spikes)];if(!kk||used.has(kk))continue;
      const [x,y]=kk.split(',').map(Number);spikes.push({x,y,ph:rnd(6)});used.add(kk);}
    const {movers,taken}=corridors(g,n,cfg.monsters,new Set([...used,...nearStart(n)]));
    movers.forEach(m=>{m.t=rnd(11);});
    const pool=[...R.keys()].map(kk=>kk.split(',').map(Number));
    const boosts=pickStars(n,cfg.boosts,new Set([...used,...taken]),pool);boosts.forEach(([x,y])=>used.add(x+','+y));
    const stars=pickStars(n,3,new Set([...used,...taken]),pool);
    const lv={g,n,start:{x:0,y:0},goal:{x:gx,y:gy},pads,spikes,monsters:movers,boosts:boosts.map(([x,y])=>({x,y})),stars,best:E.best};
    if(stars.length===3)return lv;
    fb=fb||lv;
  }
  return fb||deep(Object.assign({},cfg,{pads:Math.max(1,cfg.pads-1)}));
}
