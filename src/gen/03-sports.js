/* ================= sports region: level makers ================= */
function freeTiles(t,n){return allCells(n).filter(([x,y])=>!t[y][x]);}
function tilesConnected(t,n,sx,sy,block){const seen=bfsTiles(t,n,sx,sy,block||new Set());return seen;}
// straight stretches of open tiles in a row, for patrolling players and defenders
function tileRuns(t,n,avoid,minLen){const out=[];
  for(let y=0;y<n;y++){let cur=[];for(let x=0;x<=n;x++){if(x<n&&!t[y][x]&&!avoid.has(x+','+y))cur.push([x,y]);else{if(cur.length>=minLen)out.push(cur);cur=[];}}}
  return out;}
function patrols(t,n,count,avoid,maxLen){const runs=shuffle(tileRuns(t,n,avoid,3)),out=[];
  for(const r of runs){if(out.length>=count)break;const s=r.length>maxLen?rnd(r.length-maxLen+1):0,c=r.slice(s,s+maxLen);out.push({cells:c,i:rnd(c.length),dir:1});}
  return out;}

/* --- soccer: kick the ball (it rolls until something stops it) into the net --- */
function soccerRoll(t,n,bx,by,d,goal,block){
  let x=bx,y=by;const path=[];
  for(;;){const nx=x+DV[d][0],ny=y+DV[d][1];
    if(nx===goal.x&&ny===goal.y){path.push([nx,ny]);return {x:nx,y:ny,path,goal:true};}
    if(nx<0||ny<0||nx>=n||ny>=n||t[ny][nx]||(block&&block(nx,ny)))break;
    x=nx;y=ny;path.push([x,y]);}
  return {x,y,path,goal:false};
}
function soccerSolve(t,n,start,ball,goal){
  const walk=(px,py,bx,by)=>bfsTiles(t,n,px,py,new Set([bx+','+by,goal.x+','+goal.y]));
  const key=(bx,by,reach)=>bx+','+by+'|'+Math.min(...[...reach].map(k=>{const [a,b]=k.split(',').map(Number);return b*n+a;}));
  const r0=walk(start.x,start.y,ball.x,ball.y);
  const q=[{bx:ball.x,by:ball.y,px:start.x,py:start.y,reach:r0,sol:[]}],seen=new Set([key(ball.x,ball.y,r0)]);
  for(let h=0;h<q.length&&h<6000;h++){const s=q[h];
    for(let d=0;d<4;d++){const sx=s.bx-DV[d][0],sy=s.by-DV[d][1];if(!s.reach.has(sx+','+sy))continue;
      const r=soccerRoll(t,n,s.bx,s.by,d,goal);if(!r.path.length)continue;
      const sol=s.sol.concat([{x:sx,y:sy,d}]);if(r.goal)return {kicks:sol.length,sol};
      const reach=walk(sx,sy,r.x,r.y),k=key(r.x,r.y,reach);if(seen.has(k))continue;seen.add(k);
      q.push({bx:r.x,by:r.y,px:sx,py:sy,reach,sol});}}
  return null;
}
function soccer(cfg){
  const n=cfg.n;let fb=null;
  for(let tries=0;tries<300;tries++){
    const t=Array.from({length:n},()=>Array(n).fill(0)),mid=Math.floor(n/2);
    const goal={x:mid,y:0},start={x:mid,y:n-1};
    for(let y=1;y<n-1;y++)for(let x=0;x<n;x++)if(Math.random()<cfg.cones)t[y][x]=1;
    for(let x=0;x<n;x++)t[0][x]=x===mid?0:(Math.abs(x-mid)<=1?1:t[0][x]);   // goal posts beside the net
    const ball={x:Math.max(0,Math.min(n-1,mid+rnd(5)-2)),y:Math.floor(n/2)+rnd(2)};t[ball.y][ball.x]=0;t[start.y][start.x]=0;
    if(!tilesConnected(t,n,start.x,start.y).has(ball.x+','+ball.y))continue;
    const R=soccerSolve(t,n,start,ball,goal);if(!R)continue;
    const lv={t,n,start,goal,ball,sol:R.sol,best:R.kicks};
    const avoid=new Set([start.x+','+start.y,ball.x+','+ball.y,goal.x+','+goal.y]);
    lv.defs=patrols(t,n,cfg.defs,new Set([...avoid,...allCells(n).filter(([x,y])=>y===0||y>=n-2||y===ball.y).map(c=>c.join(','))]),4);
    const pool=[...tilesConnected(t,n,start.x,start.y,new Set([goal.x+','+goal.y]))].map(k=>k.split(',').map(Number));
    lv.stars=pickStars(n,3,avoid,pool);
    if(R.kicks>=cfg.min&&lv.stars.length===3&&lv.defs.length>=cfg.defs)return lv;
    if(lv.stars.length===3&&(!fb||R.kicks>fb.best))fb=lv;
  }
  return fb;
}
/* --- basketball: throw the ball through every hoop, then the exit opens --- */
function hoops(cfg){
  const n=cfg.n;
  for(let tries=0;tries<200;tries++){
    const g=maze(n);addLoops(g,n,Math.round(n*.8));
    const r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n);
    const used=new Set(['0,0',gx+','+gy]);
    // a hoop needs a straight run of at least two open squares leading to it
    const cand=shuffle(allCells(n)).filter(([x,y])=>!used.has(x+','+y)&&r0.dist[y][x]>2&&[0,1,2,3].some(d=>{const a=OPP[d];return !g[y][x][a]&&(()=>{const bx=x+DV[a][0],by=y+DV[a][1];return bx>=0&&by>=0&&bx<n&&by<n&&!g[by][bx][a];})();}));
    const hoopsL=[];for(const [x,y] of cand){if(hoopsL.length>=cfg.baskets)break;if(hoopsL.some(h=>Math.abs(h.x-x)+Math.abs(h.y-y)<3))continue;hoopsL.push({x,y});used.add(x+','+y);}
    if(hoopsL.length<cfg.baskets)continue;
    const {movers}=corridors(g,n,cfg.defs,new Set([...used,...nearStart(n)]));
    const stars=pickStars(n,3,used);
    return {g,n,start:{x:0,y:0},goal:{x:gx,y:gy},hoops:hoopsL,defs:movers,stars,best:r0.dist[gy][gx]};
  }
}
/* --- ski slope: gravity pulls you down; steer through every gate, miss the trees --- */
function ski(cfg){
  const n=cfg.n;let fb=null;
  for(let tries=0;tries<400;tries++){
    const t=Array.from({length:n},()=>Array(n).fill(0));
    for(let y=2;y<n-1;y++)for(let x=0;x<n;x++)if(Math.random()<cfg.trees)t[y][x]=1;
    const gates=[];
    for(let i=0;i<cfg.gates;i++){const y=Math.floor((n-2)*(i+1)/(cfg.gates+1))+1,w=cfg.gw,x1=1+rnd(Math.max(1,n-w-1)),x2=x1+w-1;
      for(let x=x1;x<=x2;x++)t[y][x]=0;if(x1-1>=0)t[y][x1-1]=2;if(x2+1<n)t[y][x2+1]=2;gates.push({y,x1,x2});}
    const sx=rnd(n),start={x:sx,y:0};t[0][sx]=0;
    // search: a few side steps per row, then the slope pulls you one row down
    const L=cfg.lat,all=(1<<gates.length)-1,gm=(x,y,m)=>{gates.forEach((g,i)=>{if(g.y===y&&x>=g.x1&&x<=g.x2)m|=1<<i;});return m;};
    const q=[[sx,0,0,gm(sx,0,0)]],seen=new Set([q[0].join(',')]),cells=new Set();let ok=false;
    for(let h=0;h<q.length&&!ok;h++){const [x,y,l,m]=q[h];cells.add(x+','+y);
      if(y===n-1&&m===all){ok=true;break;}
      const nxt=[];
      if(l<L)for(const dx of [-1,1]){const a=x+dx;if(a>=0&&a<n&&!t[y][a])nxt.push([a,y,l+1,gm(a,y,m)]);}
      if(y<n-1&&!t[y+1][x])nxt.push([x,y+1,0,gm(x,y+1,m)]);
      for(const s of nxt){const k=s.join(',');if(!seen.has(k)){seen.add(k);q.push(s);}}}
    if(!ok)continue;
    const used=new Set([sx+',0']);gates.forEach(g=>{for(let x=g.x1;x<=g.x2;x++)used.add(x+','+g.y);});
    const stars=pickStars(n,3,used,[...cells].map(k=>k.split(',').map(Number)).filter(([x,y])=>y>0&&y<n-1));
    const lv={t,n,start,goal:{x:Math.floor(n/2),y:n-1},gates,stars,best:n};
    if(stars.length===3)return lv;fb=fb||lv;
  }
  return fb||ski(Object.assign({},cfg,{trees:cfg.trees*.7,gw:cfg.gw+1,lat:cfg.lat+1}));
}
/* --- swimming race: lane ropes with gaps; get to the far wall before the other swimmer --- */
function swim(cfg){
  const n=cfg.n;
  for(let tries=0;tries<200;tries++){
    const g=Array.from({length:n},(_,y)=>Array.from({length:n},(_,x)=>[y===0?1:0,x===n-1?1:0,y===n-1?1:0,x===0?1:0]));
    for(let y=0;y<n-1;y++){const gaps=new Set();while(gaps.size<cfg.gaps)gaps.add(rnd(n));
      for(let x=0;x<n;x++)if(!gaps.has(x)){g[y][x][2]=1;g[y+1][x][0]=1;}}
    // a few floating dividers so lanes are not just straight lines
    for(let i=0;i<cfg.dividers;i++){const x=1+rnd(n-2),y=rnd(n);g[y][x][1]=1;g[y][x+1][3]=1;}
    const r0=bfs(g,n,0,0),gx=n-1,gy=n-1;if(r0.dist[gy][gx]<0)continue;
    const path=pathTo(r0.par,0,0,gx,gy);
    const stars=pickStars(n,3,new Set(['0,0',gx+','+gy]));
    return {g,n,start:{x:0,y:0},goal:{x:gx,y:gy},rival:path,stars,best:path.length-1};
  }
  return swim(Object.assign({},cfg,{dividers:Math.max(0,cfg.dividers-2),gaps:cfg.gaps+1}));
}
/* --- tennis: the ball bounces diagonally; stand in its way to hit it back --- */
function tennis(cfg){
  const n=cfg.n;
  for(let tries=0;tries<200;tries++){
    const t=Array.from({length:n},()=>Array(n).fill(0));
    for(let y=1;y<n-1;y++)for(let x=1;x<n-1;x++)if(Math.random()<cfg.cones&&y!==Math.floor(n/2))t[y][x]=1;
    const start={x:Math.floor(n/2),y:n-1},goal={x:n-1,y:0};t[start.y][start.x]=0;t[goal.y][goal.x]=0;
    const reach=tilesConnected(t,n,start.x,start.y);if(reach.size!==freeTiles(t,n).length)continue;
    const ball={x:Math.floor(n/2),y:1,dx:Math.random()<.5?1:-1,dy:1};if(t[ball.y][ball.x])continue;
    const stars=pickStars(n,3,new Set([start.x+','+start.y,goal.x+','+goal.y]),freeTiles(t,n));
    return {t,n,start,goal,ball,stars,best:n};
  }
}
/* --- obstacle run: hurdles to jump, mud that holds you, and a clock --- */
function hurdleCost(g,n,hurd,mud,start,goal){
  const H=new Set(hurd.map(c=>c.x+','+c.y)),M=new Set(mud.map(c=>c.x+','+c.y));
  const dist=new Map([[start.x+','+start.y,0]]),q=[[start.x,start.y]];
  // small Dijkstra with costs 1 or 2 (leaving mud costs an extra press)
  const pq=[[0,start.x,start.y]];
  while(pq.length){pq.sort((a,b)=>a[0]-b[0]);const [c,x,y]=pq.shift();if(c>dist.get(x+','+y))continue;
    if(x===goal.x&&y===goal.y)return c;const extra=M.has(x+','+y)?1:0;
    for(let d=0;d<4;d++){if(g[y][x][d])continue;
      const a=x+DV[d][0],b=y+DV[d][1];
      if(!H.has(a+','+b)){const k=a+','+b,nc=c+1+extra;if(!dist.has(k)||nc<dist.get(k)){dist.set(k,nc);pq.push([nc,a,b]);}}
      if(!g[b][a][d]){const a2=a+DV[d][0],b2=b+DV[d][1],k=a2+','+b2;if(!H.has(k)){const nc=c+1+extra;if(!dist.has(k)||nc<dist.get(k)){dist.set(k,nc);pq.push([nc,a2,b2]);}}}}}
  return null;
}
function hurdles(cfg){
  const n=cfg.n;
  for(let tries=0;tries<200;tries++){
    const g=maze(n);addLoops(g,n,Math.round(n*.3));
    const r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n);const path=pathTo(r0.par,0,0,gx,gy);
    const used=new Set(['0,0',gx+','+gy]),hurd=[],mud=[];const key=c=>c[0]+','+c[1];
    const straight=[];for(let i=2;i<path.length-2;i++){const [ax,ay]=path[i-1],[bx,by]=path[i],[cx,cy]=path[i+1];if(bx-ax===cx-bx&&by-ay===cy-by)straight.push(i);}
    for(const i of shuffle(straight)){if(hurd.length>=cfg.hurdles)break;if([i-1,i,i+1].some(j=>used.has(key(path[j]))))continue;
      hurd.push({x:path[i][0],y:path[i][1]});[i-1,i,i+1].forEach(j=>used.add(key(path[j])));}
    for(const [x,y] of shuffle(path.slice(2,-2))){if(mud.length>=cfg.mud)break;if(used.has(x+','+y))continue;mud.push({x,y});used.add(x+','+y);}
    const cost=hurdleCost(g,n,hurd,mud,{x:0,y:0},{x:gx,y:gy});if(cost==null)continue;
    const stars=pickStars(n,3,used);
    return {g,n,start:{x:0,y:0},goal:{x:gx,y:gy},hurd,mud,cost,stars,best:cost};
  }
}
/* --- mini golf: the ball rolls until it hits something; sand stops it, water sends it back --- */
function golfRoll(t,n,x,y,d,hole){
  const path=[];
  for(;;){const nx=x+DV[d][0],ny=y+DV[d][1];
    if(nx<0||ny<0||nx>=n||ny>=n||t[ny][nx]===1)return {x,y,path};
    path.push([nx,ny]);
    if(nx===hole.x&&ny===hole.y)return {x:nx,y:ny,path,hole:true};
    if(t[ny][nx]===3)return {x:nx,y:ny,path,water:true};
    if(t[ny][nx]===2)return {x:nx,y:ny,path};
    x=nx;y=ny;}
}
function golf(cfg){
  const n=cfg.n;let fb=null;
  for(let tries=0;tries<500;tries++){
    const t=Array.from({length:n},()=>Array(n).fill(0));
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){const r=Math.random();t[y][x]=r<cfg.bush?1:r<cfg.bush+cfg.sand?2:r<cfg.bush+cfg.sand+cfg.water?3:0;}
    const start={x:rnd(n),y:n-1},hole={x:rnd(n),y:rnd(Math.max(1,Math.floor(n/3)))};
    t[start.y][start.x]=0;t[hole.y][hole.x]=0;if(start.x===hole.x&&start.y===hole.y)continue;
    const next=k=>{const [x,y]=k.split(',').map(Number),out=[];for(let d=0;d<4;d++){const r=golfRoll(t,n,x,y,d,hole);if(!r.path.length||r.water)continue;out.push(r.x+','+r.y);}return out;};
    const R=explore(start.x+','+start.y,next,k=>k===hole.x+','+hole.y);
    if(!R.won||!R.safe)continue;
    const lv={t,n,start,goal:hole,par:R.best,best:R.best};
    const pool=allCells(n).filter(([x,y])=>!t[y][x]&&!(x===start.x&&y===start.y)&&!(x===hole.x&&y===hole.y));
    lv.stars=[];lv.stars.rest=shuffle([...R.seen.keys()].map(k=>k.split(',').map(Number)).filter(([x,y])=>!(x===start.x&&y===start.y)&&!(x===hole.x&&y===hole.y)));
    if(R.best>=cfg.min)return lv;
    if(!fb||R.best>fb.par)fb=lv;
  }
  return fb;
}
/* --- judo dojo: blue and red mats take turns being open; white mats are always fine --- */
function dojoOpen(t,x,y,ph){const v=t[y][x];return v===0||v===(ph?2:1);}
function dojo(cfg){
  const n=cfg.n;let fb=null;
  for(let tries=0;tries<500;tries++){
    const t=Array.from({length:n},()=>Array(n).fill(0));
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){const r=Math.random();t[y][x]=r<cfg.posts?3:r<cfg.posts+cfg.color?1+rnd(2):0;}
    const start={x:0,y:0},goal={x:n-1,y:n-1};t[0][0]=0;t[n-1][n-1]=0;
    // state: square + which colour is open; every step flips it
    const next=k=>{const [x,y,ph]=k.split(',').map(Number),out=[];for(let d=0;d<4;d++){const a=x+DV[d][0],b=y+DV[d][1];
      if(a<0||b<0||a>=n||b>=n||t[b][a]===3||!dojoOpen(t,a,b,ph))continue;out.push(a+','+b+','+(1-ph));}return out;};
    const R=explore('0,0,0',next,k=>k.startsWith(goal.x+','+goal.y+','));
    if(!R.won||!R.safe)continue;
    const cells=[...new Set([...R.seen.keys()].map(k=>k.split(',').slice(0,2).join(',')))];
    const avoid=new Set(['0,0',goal.x+','+goal.y]);
    const opp=patrols(t.map(r=>r.map(v=>v===3?1:0)),n,cfg.opp,new Set([...avoid,'1,0','0,1','1,1']),4);
    const lv={t,n,start,goal,opp,stars:pickStars(n,3,avoid,cells.map(k=>k.split(',').map(Number))),best:R.best};
    if(R.best>=cfg.min&&lv.stars.length===3)return lv;
    if(lv.stars.length===3&&(!fb||R.best>fb.best))fb=lv;
  }
  return fb;
}
