/* ================= pure level generators (no DOM) ================= */
var GEN=(function(){
const DV=[[0,-1],[1,0],[0,1],[-1,0]]; // up right down left
const OPP=[2,3,0,1];
function rnd(n){return Math.floor(Math.random()*n);}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}

/* --- wall mazes --- */
function maze(n){
  const g=[];for(let y=0;y<n;y++){g.push([]);for(let x=0;x<n;x++)g[y].push([1,1,1,1]);}
  const seen=Array.from({length:n},()=>Array(n).fill(0));
  const st=[[0,0]];seen[0][0]=1;
  while(st.length){
    const [x,y]=st[st.length-1];
    const opts=[0,1,2,3].filter(d=>{const nx=x+DV[d][0],ny=y+DV[d][1];return nx>=0&&ny>=0&&nx<n&&ny<n&&!seen[ny][nx];});
    if(!opts.length){st.pop();continue;}
    const d=opts[rnd(opts.length)],nx=x+DV[d][0],ny=y+DV[d][1];
    g[y][x][d]=0;g[ny][nx][OPP[d]]=0;seen[ny][nx]=1;st.push([nx,ny]);
  }
  return g;
}
function edgeKey(x,y,d){
  if(d===1)return x+','+y+',h';if(d===3)return (x-1)+','+y+',h';
  if(d===2)return x+','+y+',v';return x+','+(y-1)+',v';
}
// BFS on a wall maze; blocked(x,y,d) can veto extra edges
function bfs(g,n,sx,sy,blocked){
  const dist=Array.from({length:n},()=>Array(n).fill(-1)),par={};dist[sy][sx]=0;const q=[[sx,sy]];
  for(let h=0;h<q.length;h++){const [x,y]=q[h];
    for(let d=0;d<4;d++){if(g[y][x][d])continue;if(blocked&&blocked(x,y,d))continue;
      const nx=x+DV[d][0],ny=y+DV[d][1];if(dist[ny][nx]<0){dist[ny][nx]=dist[y][x]+1;par[nx+','+ny]=[x,y];q.push([nx,ny]);}}}
  return {dist,par};
}
function pathTo(par,sx,sy,tx,ty){const p=[[tx,ty]];let k=tx+','+ty;while(k!==sx+','+sy){const pp=par[k];p.push(pp);k=pp[0]+','+pp[1];}return p.reverse();}
function farthest(dist,n){let b=[0,0],bd=-1;for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(dist[y][x]>bd){bd=dist[y][x];b=[x,y];}return b;}

function pickStars(n,count,avoid,pool){
  const out=[];const cand=shuffle((pool||allCells(n)).filter(([x,y])=>!avoid.has(x+','+y)));
  for(const c of cand){if(out.length>=count)break;out.push(c);}out.rest=cand.slice(out.length);return out;
}
function allCells(n){const a=[];for(let y=0;y<n;y++)for(let x=0;x<n;x++)a.push([x,y]);return a;}

/* --- castle: coloured doors on the one true path, each key hidden in the part you can reach before it --- */
function castle(cfg){
  const n=cfg.n,g=maze(n);
  const r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n);
  const path=pathTo(r0.par,0,0,gx,gy);const k=cfg.doors;
  const doors={};const doorAt=[];
  for(let i=0;i<k;i++){
    const idx=Math.max(2,Math.floor(path.length*(i+1)/(k+1)));
    const [ax,ay]=path[idx-1],[bx,by]=path[idx];
    const d=DV.findIndex(v=>v[0]===bx-ax&&v[1]===by-ay);
    doors[edgeKey(ax,ay,d)]=i;doorAt.push([ax,ay]);
  }
  const closedFrom=t=>(x,y,d)=>{const c=doors[edgeKey(x,y,d)];return c!==undefined&&c>=t;};
  const keys=[];const used=new Set(['0,0',gx+','+gy]);
  let prev=new Set();
  for(let i=0;i<k;i++){
    const reach=bfs(g,n,0,0,closedFrom(i)).dist;
    const region=new Set();for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(reach[y][x]>=0&&!prev.has(x+','+y))region.add(x+','+y);
    const [nx,ny]=doorAt[i];
    const dd=bfs(g,n,nx,ny,closedFrom(i)).dist;
    let best=null,bd=-1;
    region.forEach(s=>{if(used.has(s))return;const [x,y]=s.split(',').map(Number);const v=dd[y][x]+Math.random()*2;if(v>bd){bd=v;best=[x,y];}});
    if(!best)best=doorAt[i];
    keys.push({x:best[0],y:best[1],c:i});used.add(best[0]+','+best[1]);
    region.forEach(s=>prev.add(s));
  }
  const stars=pickStars(n,3,used);
  return {g,n,start:{x:0,y:0},goal:{x:gx,y:gy},doors,keys,stars,best:path.length-1};
}

/* --- sea: maze with a few loops, air stations along the route, fish swimming in corridors --- */
function sea(cfg){
  const n=cfg.n,g=maze(n);
  let loops=Math.round(n*0.9),guard=0;
  while(loops>0&&guard++<500){const x=rnd(n),y=rnd(n),d=rnd(4),nx=x+DV[d][0],ny=y+DV[d][1];
    if(nx<0||ny<0||nx>=n||ny>=n||!g[y][x][d])continue;g[y][x][d]=0;g[ny][nx][OPP[d]]=0;loops--;}
  const r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n);
  const path=pathTo(r0.par,0,0,gx,gy);
  const gap=Math.max(5,Math.floor(cfg.air*0.55));
  const bubbles=[];const used=new Set(['0,0',gx+','+gy]);
  for(let i=gap;i<path.length-2;i+=gap){const [x,y]=path[i];bubbles.push({x,y});used.add(x+','+y);}
  // one extra station off the route
  const extra=pickStars(n,1,used);extra.forEach(([x,y])=>{bubbles.push({x,y});used.add(x+','+y);});
  const near=new Set();for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(Math.abs(x)+Math.abs(y)<=2)near.add(x+','+y);
  const fish=[];const taken=new Set();guard=0;
  while(fish.length<cfg.fish&&guard++<800){
    const x=rnd(n),y=rnd(n),hz=Math.random()<.5;const a=hz?3:0,b=hz?1:2;
    let cx=x,cy=y;while(!g[cy][cx][a]){cx+=DV[a][0];cy+=DV[a][1];}
    const seg=[[cx,cy]];while(!g[cy][cx][b]&&seg.length<5){cx+=DV[b][0];cy+=DV[b][1];seg.push([cx,cy]);}
    if(seg.length<3)continue;
    if(seg.some(([sx,sy])=>{const s=sx+','+sy;return taken.has(s)||near.has(s)||used.has(s);}))continue;
    seg.forEach(([sx,sy])=>taken.add(sx+','+sy));
    fish.push({cells:seg,i:rnd(seg.length),dir:1,t:rnd(11)});
  }
  const stars=pickStars(n,3,new Set([...used,...taken]));
  return {g,n,start:{x:0,y:0},goal:{x:gx,y:gy},bubbles,fish,stars,best:path.length-1};
}

/* --- ice: rocks on a grid; you slide until you hit a rock or the edge; the igloo catches you --- */
function slide(t,n,x,y,d,goal){
  const cells=[];
  for(;;){const nx=x+DV[d][0],ny=y+DV[d][1];
    if(nx<0||ny<0||nx>=n||ny>=n||t[ny][nx])break;
    x=nx;y=ny;cells.push([x,y]);if(goal&&x===goal.x&&y===goal.y)break;}
  return {x,y,cells};
}
function solveIce(t,n,s,goal){
  const seen={},q=[[s.x,s.y]];seen[s.x+','+s.y]={p:null};
  for(let h=0;h<q.length;h++){const [x,y]=q[h];
    if(goal&&x===goal.x&&y===goal.y){const moves=[];let k=x+','+y;while(seen[k].p){moves.push(seen[k].d);k=seen[k].p;}return moves.reverse();}
    for(let d=0;d<4;d++){const r=slide(t,n,x,y,d,goal);const k=r.x+','+r.y;if(!r.cells.length||seen[k])continue;seen[k]={p:x+','+y,d};q.push([r.x,r.y]);}}
  return goal?null:seen;
}
function ice(cfg){
  const n=cfg.n;let best=null;
  for(let tries=0;tries<500;tries++){
    const t=Array.from({length:n},()=>Array.from({length:n},()=>Math.random()<cfg.rock?1:0));
    const free=allCells(n).filter(([x,y])=>!t[y][x]);if(free.length<n)continue;
    const [sx,sy]=free[rnd(free.length)];const s={x:sx,y:sy};
    // every cell you can pass over is a possible igloo spot
    const stops=solveIce(t,n,s,null);const over=new Set();
    Object.keys(stops).forEach(k=>{const [x,y]=k.split(',').map(Number);for(let d=0;d<4;d++)slide(t,n,x,y,d,null).cells.forEach(([cx,cy])=>over.add(cx+','+cy));});
    over.delete(sx+','+sy);
    const cand=shuffle([...over]).slice(0,70);
    for(const c of cand){const [gx,gy]=c.split(',').map(Number);const goal={x:gx,y:gy};
      const sol=solveIce(t,n,s,goal);if(!sol)continue;const m=sol.length;
      if(m>=cfg.min&&m<=cfg.min+3&&(!best||m>best.moves.length)){best={t,n,start:s,goal,moves:sol};}}
    if(best&&best.moves.length>=cfg.min+1)break;
    if(best&&tries>120)break;
  }
  // stars sit on the cells the solution slides across
  let x=best.start.x,y=best.start.y;const route=[];
  best.moves.forEach(d=>{const r=slide(best.t,n,x,y,d,best.goal);route.push(...r.cells);x=r.x;y=r.y;});
  const avoid=new Set([best.start.x+','+best.start.y,best.goal.x+','+best.goal.y]);
  best.stars=pickStars(n,3,avoid,route.filter((c,i,a)=>a.findIndex(o=>o[0]===c[0]&&o[1]===c[1])===i));
  if(best.stars.length<3)best.stars=best.stars.concat(pickStars(n,3-best.stars.length,new Set([...avoid,...best.stars.map(c=>c[0]+','+c[1])]),[...Object.keys(solveIce(best.t,n,best.start,null))].map(k=>k.split(',').map(Number))));
  best.best=best.moves.length;
  return best;
}
/* --- movers (fish / monkeys) swim back and forth along straight corridors --- */
function corridors(g,n,count,bad){
  const out=[],taken=new Set();let guard=0;
  while(out.length<count&&guard++<1000){
    const x=rnd(n),y=rnd(n),hz=Math.random()<.5;const a=hz?3:0,b=hz?1:2;
    let cx=x,cy=y;while(!g[cy][cx][a]){cx+=DV[a][0];cy+=DV[a][1];}
    const seg=[[cx,cy]];while(!g[cy][cx][b]&&seg.length<5){cx+=DV[b][0];cy+=DV[b][1];seg.push([cx,cy]);}
    if(seg.length<3)continue;
    if(seg.some(([sx,sy])=>{const s=sx+','+sy;return taken.has(s)||bad.has(s);}))continue;
    seg.forEach(([sx,sy])=>taken.add(sx+','+sy));
    out.push({cells:seg,i:rnd(seg.length),dir:1,t:rnd(11)});
  }
  return {movers:out,taken};
}
function nearStart(n){const s=new Set();for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(x+y<=2)s.add(x+','+y);return s;}

/* --- jungle: rope bridges on the one true path fall after you cross; grab the stars behind you first --- */
function jungle(cfg){
  const n=cfg.n,g=maze(n);
  const r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n);
  const path=pathTo(r0.par,0,0,gx,gy);
  const bridges=[];const used=new Set(['0,0',gx+','+gy]);
  const corridor=(x,y)=>g[y][x].filter(w=>!w).length===2;
  for(let i=0;i<cfg.bridges;i++){
    const want=Math.min(path.length-3,Math.max(3,Math.floor(path.length*(i+1)/(cfg.bridges+1))));
    let idx=-1;for(let o=0;o<path.length&&idx<0;o++)for(const j of [want+o,want-o]){if(j<3||j>path.length-3)continue;const [cx,cy]=path[j];
      if(corridor(cx,cy)&&!used.has(cx+','+cy)&&!bridges.some(b=>Math.abs(b.x-cx)+Math.abs(b.y-cy)<2)){idx=j;break;}}
    if(idx<0)continue;
    const [x,y]=path[idx];bridges.push({x,y});used.add(x+','+y);
  }
  const isBridge=(x,y)=>bridges.some(b=>b.x===x&&b.y===y);
  // one star hides in a dead end before the first bridge
  const before=bfs(g,n,0,0,(x,y,d)=>isBridge(x+DV[d][0],y+DV[d][1])).dist;
  const onPath=new Set(path.map(c=>c[0]+','+c[1]));
  let early=null,bd=-1;
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const k=x+','+y;if(before[y][x]>=0&&!onPath.has(k)&&!used.has(k)){const v=before[y][x]+Math.random()*2;if(v>bd){bd=v;early=[x,y];}}}
  const bad=new Set([...used,...nearStart(n)]);
  const {movers,taken}=corridors(g,n,cfg.monkeys,new Set([...bad,...(early?[early[0]+','+early[1]]:[])]));
  const stars=early?[early]:[];
  const avoid=new Set([...used,...taken]);stars.forEach(c=>avoid.add(c[0]+','+c[1]));
  const more=pickStars(n,3-stars.length,avoid);stars.push(...more);stars.rest=more.rest;
  return {g,n,start:{x:0,y:0},goal:{x:gx,y:gy},bridges,monkeys:movers,stars,best:path.length-1};
}

/* --- space: the true path is cut into pieces; a portal pair links each piece to the next --- */
function space(cfg){
  const n=cfg.n,g=maze(n);
  const r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n);
  const path=pathTo(r0.par,0,0,gx,gy);const k=cfg.pairs;
  const cuts=[];
  for(let i=0;i<k;i++){
    const idx=Math.max(2,Math.floor(path.length*(i+1)/(k+1)));
    const [ax,ay]=path[idx-1],[bx,by]=path[idx];const d=DV.findIndex(v=>v[0]===bx-ax&&v[1]===by-ay);
    g[ay][ax][d]=1;g[by][bx][OPP[d]]=1;cuts.push(idx);
  }
  const starts=[path[0],...cuts.map(i=>path[i])];
  const comp=Array.from({length:n},()=>Array(n).fill(-1));
  starts.forEach(([sx,sy],j)=>{const d=bfs(g,n,sx,sy).dist;for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(d[y][x]>=0)comp[y][x]=j;});
  const used=new Set(['0,0',gx+','+gy]);
  function farIn(j,fx,fy){
    const d=bfs(g,n,fx,fy).dist;let best=null,bd=-1;
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){if(comp[y][x]!==j||used.has(x+','+y)||d[y][x]<0)continue;const v=d[y][x]+Math.random()*3;if(v>bd){bd=v;best=[x,y];}}
    if(best)used.add(best[0]+','+best[1]);return best;
  }
  function anyIn(j){const c=shuffle(allCells(n).filter(([x,y])=>comp[y][x]===j&&!used.has(x+','+y)))[0];if(c)used.add(c[0]+','+c[1]);return c;}
  const portals=[];
  for(let j=0;j<k;j++){
    const a=farIn(j,starts[j][0],starts[j][1]);
    const exit=j+1<k?path[cuts[j+1]-1]:[gx,gy];
    const b=farIn(j+1,exit[0],exit[1]);
    if(a&&b)portals.push({a:{x:a[0],y:a[1]},b:{x:b[0],y:b[1]},c:j});
  }
  for(let i=0;i<cfg.decoys;i++){
    const j=rnd(k+1);const a=anyIn(j),b=anyIn(j);
    if(a&&b)portals.push({a:{x:a[0],y:a[1]},b:{x:b[0],y:b[1]},c:k+i});
  }
  const stars=pickStars(n,3,new Set([...used,...nearStart(n)]));
  return {g,n,start:{x:0,y:0},goal:{x:gx,y:gy},portals,stars,best:path.length-1};
}
/* --- candy factory: conveyors carry you along their arrow; buttons swap pink and blue gates --- */
function candyGateClosed(lv,x,y,d,tog){const c=lv.gates[edgeKey(x,y,d)];if(c===undefined)return false;return c===0?tog===0:tog===1;}
function candyStep(lv,x,y,tog,d){
  const g=lv.g,cells=[];
  if(g[y][x][d])return {cells,x,y,tog,why:'wall'};
  if(candyGateClosed(lv,x,y,d,tog))return {cells,x,y,tog,why:'gate',gate:lv.gates[edgeKey(x,y,d)]};
  x+=DV[d][0];y+=DV[d][1];if(lv.sw.has(x+','+y))tog^=1;cells.push([x,y,tog]);
  let guard=0;
  while(lv.conv[x+','+y]!==undefined&&guard++<60){
    const cd=lv.conv[x+','+y];
    if(g[y][x][cd]||candyGateClosed(lv,x,y,cd,tog))break;
    x+=DV[cd][0];y+=DV[cd][1];if(lv.sw.has(x+','+y))tog^=1;cells.push([x,y,tog]);
  }
  return {cells,x,y,tog};
}
function candyReach(lv,sx,sy,tog){
  const seen=new Map(),q=[[sx,sy,tog]],over=new Set([sx+','+sy]);seen.set(sx+','+sy+','+tog,0);
  for(let h=0;h<q.length;h++){const [x,y,t]=q[h];const d0=seen.get(x+','+y+','+t);
    for(let d=0;d<4;d++){const r=candyStep(lv,x,y,t,d);if(!r.cells.length)continue;
      r.cells.forEach(c=>over.add(c[0]+','+c[1]));
      const k=r.x+','+r.y+','+r.tog;if(!seen.has(k)){seen.set(k,d0+1);q.push([r.x,r.y,r.tog]);}}}
  return {seen,over};
}
function candy(cfg){
  const n=cfg.n;let fallback=null;
  for(let tries=0;tries<300;tries++){
    const g=maze(n);
    let loops=cfg.loops,guard=0;
    while(loops>0&&guard++<400){const x=rnd(n),y=rnd(n),d=rnd(4),nx=x+DV[d][0],ny=y+DV[d][1];
      if(nx<0||ny<0||nx>=n||ny>=n||!g[y][x][d])continue;g[y][x][d]=0;g[ny][nx][OPP[d]]=0;loops--;}
    const r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n);const path=pathTo(r0.par,0,0,gx,gy);
    const lv={g,n,start:{x:0,y:0},goal:{x:gx,y:gy},gates:{},sw:new Set(),conv:{}};
    const used=new Set(['0,0',gx+','+gy]);
    // conveyor belts on straight corridors, never touching each other
    const {movers}=corridors(g,n,cfg.conv*2,new Set([...used,...nearStart(n)]));
    let belts=0;
    for(const m of movers){if(belts>=cfg.conv)break;
      const touch=m.cells.some(([x,y])=>[0,1,2,3].some(d=>lv.conv[(x+DV[d][0])+','+(y+DV[d][1])]!==undefined));if(touch)continue;
      const hz=m.cells[0][1]===m.cells[1][1];const dir=hz?(Math.random()<.5?1:3):(Math.random()<.5?0:2);
      m.cells.forEach(([x,y])=>{lv.conv[x+','+y]=dir;used.add(x+','+y);});belts++;}
    const isConv=(x,y)=>lv.conv[x+','+y]!==undefined;
    // pink gates (closed at the start) on the main route
    for(let i=0;i<cfg.gA;i++){const idx=Math.max(2,Math.floor(path.length*(i+1)/(cfg.gA+1)));
      const [ax,ay]=path[idx-1],[bx,by]=path[idx];if(isConv(ax,ay)||isConv(bx,by))continue;
      const d=DV.findIndex(v=>v[0]===bx-ax&&v[1]===by-ay);lv.gates[edgeKey(ax,ay,d)]=0;}
    // blue gates (open at the start) anywhere
    let gb=0;guard=0;
    while(gb<cfg.gB&&guard++<200){const x=rnd(n),y=rnd(n),d=rnd(4),nx=x+DV[d][0],ny=y+DV[d][1];
      if(nx<0||ny<0||nx>=n||ny>=n||g[y][x][d]||isConv(x,y)||isConv(nx,ny))continue;
      const k=edgeKey(x,y,d);if(lv.gates[k]!==undefined)continue;lv.gates[k]=1;gb++;}
    // buttons
    guard=0;while(lv.sw.size<cfg.sw&&guard++<200){const x=rnd(n),y=rnd(n),k=x+','+y;if(used.has(k)||(x===0&&y===0))continue;lv.sw.add(k);used.add(k);}
    const R=candyReach(lv,0,0,0);
    const won=[...R.seen.keys()].some(k=>k.startsWith(gx+','+gy+','));
    if(!won)continue;
    const noSw=Object.assign({},lv,{sw:new Set()});
    const needs=![...candyReach(noSw,0,0,0).seen.keys()].some(k=>k.startsWith(gx+','+gy+','));
    // from anywhere you can get to, the cake must still be reachable
    const back=new Map();
    for(const k of R.seen.keys()){const [x,y,t]=k.split(',').map(Number);
      for(let d=0;d<4;d++){const r=candyStep(lv,x,y,t,d);if(!r.cells.length)continue;const to=r.x+','+r.y+','+r.tog;
        if(!back.has(to))back.set(to,[]);back.get(to).push(k);}}
    const good=new Set([...R.seen.keys()].filter(k=>k.startsWith(gx+','+gy+',')));const bq=[...good];
    for(let h=0;h<bq.length;h++)(back.get(bq[h])||[]).forEach(k=>{if(!good.has(k)){good.add(k);bq.push(k);}});
    if(good.size<R.seen.size)continue;
    let best=Infinity;R.seen.forEach((v,k)=>{if(k.startsWith(gx+','+gy+','))best=Math.min(best,v);});
    lv.best=best;
    const pool=[...R.over].map(k=>k.split(',').map(Number)).filter(([x,y])=>!isConv(x,y));
    lv.stars=pickStars(n,3,used,pool);
    if(needs&&lv.stars.length===3)return lv;
    if(!fallback)fallback=lv;
  }
  if(fallback)return fallback;
  // too crowded to make a fair level: try again with one belt less
  return candy(Object.assign({},cfg,{conv:Math.max(0,cfg.conv-1),gB:Math.max(1,cfg.gB-(cfg.conv?0:1))}));
}
/* --- shared: explore a puzzle's states; also checks you can always still win from anywhere you can reach --- */
function explore(start,next,isGoal,cap){
  const seen=new Map([[start,0]]),q=[start],back=new Map();
  for(let h=0;h<q.length;h++){if(cap&&q.length>cap)return {seen,won:false,capped:true};
    const k=q[h];for(const nk of next(k)){if(!back.has(nk))back.set(nk,[]);back.get(nk).push(k);if(!seen.has(nk)){seen.set(nk,seen.get(k)+1);q.push(nk);}}}
  const good=new Set([...seen.keys()].filter(isGoal));const bq=[...good];
  for(let h=0;h<bq.length;h++)(back.get(bq[h])||[]).forEach(k=>{if(!good.has(k)){good.add(k);bq.push(k);}});
  let best=Infinity;seen.forEach((v,k)=>{if(isGoal(k))best=Math.min(best,v);});
  return {seen,won:best<Infinity,best,safe:good.size===seen.size};
}
function addLoops(g,n,count){let guard=0;while(count>0&&guard++<600){const x=rnd(n),y=rnd(n),d=rnd(4),nx=x+DV[d][0],ny=y+DV[d][1];
  if(nx<0||ny<0||nx>=n||ny>=n||!g[y][x][d])continue;g[y][x][d]=0;g[ny][nx][OPP[d]]=0;count--;}}

/* --- farm: lost chicks join a line behind you; bring them all to the hen. A sleepy fox scares the last one home --- */
function farm(cfg){
  const n=cfg.n,g=maze(n);addLoops(g,n,Math.round(n*.9));
  const r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n);
  const used=new Set(['0,0',gx+','+gy]);const chicks=[];let guard=0;
  while(chicks.length<cfg.chicks&&guard++<2000){const x=rnd(n),y=rnd(n),k=x+','+y;
    if(used.has(k)||r0.dist[y][x]<3)continue;
    if(chicks.some(c=>Math.abs(c.x-x)+Math.abs(c.y-y)<(guard<1000?3:2)))continue;
    chicks.push({x,y});used.add(k);}
  const bad=new Set([...used,...nearStart(n)]);
  const {movers,taken}=corridors(g,n,cfg.fox,bad);
  const stars=pickStars(n,3,new Set([...used,...taken]));
  return {g,n,start:{x:0,y:0},goal:{x:gx,y:gy},chicks,fox:movers,stars,best:r0.dist[gy][gx]};
}

/* --- rainbow: paint buckets colour you; coloured floor lets through only the same colour --- */
function rbStep(lv,x,y,c,d){
  if(lv.g[y][x][d])return null;
  const nx=x+DV[d][0],ny=y+DV[d][1],tc=lv.col[ny][nx];
  if(tc&&tc!==c)return {blocked:tc};
  const b=lv.buckets[nx+','+ny];return {x:nx,y:ny,c:b||c};
}
function rainbow(cfg){
  const n=cfg.n;let fb=null;
  for(let tries=0;tries<300;tries++){
    const g=maze(n);addLoops(g,n,cfg.loops);
    const r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n);const path=pathTo(r0.par,0,0,gx,gy);
    const col=Array.from({length:n},()=>Array(n).fill(0));const used=new Set(['0,0',gx+','+gy]);
    for(let i=0;i<cfg.gates;i++){const idx=Math.floor(path.length*(i+1)/(cfg.gates+1)),c=(i%cfg.colors)+1;
      [idx,idx+1].forEach(j=>{if(j>0&&j<path.length-1){const [x,y]=path[j];col[y][x]=c;used.add(x+','+y);}});}
    for(let i=0;i<cfg.extra;i++){let [x,y]=[rnd(n),rnd(n)];if(used.has(x+','+y))continue;const c=rnd(cfg.colors)+1;
      const size=1+rnd(3);for(let j=0;j<size;j++){if(used.has(x+','+y))break;col[y][x]=c;used.add(x+','+y);
        const ds=shuffle([0,1,2,3]).filter(d=>!g[y][x][d]);if(!ds.length)break;x+=DV[ds[0]][0];y+=DV[ds[0]][1];}}
    const buckets={};
    for(let c=1;c<=cfg.colors;c++){let guard=0;while(guard++<200){const x=rnd(n),y=rnd(n),k=x+','+y;if(used.has(k)||col[y][x])continue;buckets[k]=c;used.add(k);break;}}
    const lv={g,n,start:{x:0,y:0},goal:{x:gx,y:gy},col,buckets};
    const next=L=>k=>{const [x,y,c]=k.split(',').map(Number),out=[];for(let d=0;d<4;d++){const r=rbStep(L,x,y,c,d);if(r&&!r.blocked)out.push(r.x+','+r.y+','+r.c);}return out;};
    const isG=k=>k.startsWith(gx+','+gy+',');
    const R=explore('0,0,0',next(lv),isG);
    if(!R.won||!R.safe)continue;
    const needs=!explore('0,0,0',next(Object.assign({},lv,{buckets:{}})),isG).won;
    const pool=[...new Set([...R.seen.keys()].map(k=>k.split(',').slice(0,2).join(',')))].map(k=>k.split(',').map(Number)).filter(([x,y])=>!col[y][x]);
    lv.stars=pickStars(n,3,used,pool);lv.best=R.best;
    if(needs&&lv.stars.length===3)return lv;
    if(!fb&&lv.stars.length===3)fb=lv;
  }
  return fb||rainbow(Object.assign({},cfg,{extra:0,loops:cfg.loops+3}));
}

/* --- toy storeroom: shelves with gaps, toy boxes you can push (one at a time, never into a wall or another box) --- */
function toysStep(lv,px,py,boxes,d){
  const n=lv.n,nx=px+DV[d][0],ny=py+DV[d][1];
  if(nx<0||ny<0||nx>=n||ny>=n||lv.t[ny][nx])return null;
  const k=nx+','+ny;
  if(boxes.has(k)){const bx=nx+DV[d][0],by=ny+DV[d][1],bk=bx+','+by;
    if(bx<0||by<0||bx>=n||by>=n||lv.t[by][bx]||boxes.has(bk)||(bx===lv.goal.x&&by===lv.goal.y))return {stuck:true};
    const nb=new Set(boxes);nb.delete(k);nb.add(bk);return {x:nx,y:ny,boxes:nb,pushed:[k,bk]};}
  return {x:nx,y:ny,boxes};
}
function toys(cfg){
  const n=cfg.n;let fb=null;
  for(let tries=0;tries<300;tries++){
    const t=Array.from({length:n},()=>Array(n).fill(0));const boxes=new Set();const shelfRows=new Set();
    for(let i=0;i<cfg.shelves;i++){const y=2+i*3;if(y>n-3)break;shelfRows.add(y);
      for(let x=0;x<n;x++)t[y][x]=1;
      shuffle(allCells(n).map(c=>c[0]).slice(0,n)).slice(0,cfg.gaps).forEach(x=>{t[y][x]=0;boxes.add(x+','+y);});}
    for(let y=1;y<n;y++)if(!shelfRows.has(y))for(let x=0;x<n;x++)if(Math.random()<cfg.rock&&!shelfRows.has(y-1)&&!shelfRows.has(y+1))t[y][x]=1;
    const free=(x,y)=>!t[y][x]&&!boxes.has(x+','+y);
    const row0=[...Array(n).keys()].filter(x=>free(x,0));if(!row0.length)continue;
    const sx=row0[rnd(row0.length)];
    const rowN=[...Array(n).keys()].filter(x=>free(x,n-1));if(!rowN.length)continue;
    const gx=rowN[rnd(rowN.length)];
    for(let i=0,guard=0;i<cfg.extra&&guard<200;guard++){const x=rnd(n),y=1+rnd(n-2);if(shelfRows.has(y)||!free(x,y))continue;boxes.add(x+','+y);i++;}
    const lv={t,n,start:{x:sx,y:0},goal:{x:gx,y:n-1}};
    const R=toysSolve(lv,sx,0,boxes,15000);
    if(!R.won)continue;
    // pushing must matter: with boxes as walls you cannot get there
    const wall=bfsTiles(t,n,sx,0,boxes);if(wall.has(gx+','+(n-1)))continue;
    const pool=[...R.spots].map(i=>[i%n,Math.floor(i/n)]);
    lv.boxes=[...boxes];lv.stars=pickStars(n,3,new Set([sx+',0',gx+','+(n-1),...boxes]),pool);lv.best=R.best;
    if(R.best>=cfg.min&&lv.stars.length===3)return lv;
    if(!fb||R.best>fb.best)fb=lv;
  }
  return fb;
}
// fast search with numbers: player cell + sorted box cells; stops at the first way to the goal
function toysSolve(lv,sx,sy,boxSet,cap){
  const n=lv.n,t=lv.t,G=lv.goal.y*n+lv.goal.x;
  const start=[...boxSet].map(k=>{const [x,y]=k.split(',').map(Number);return y*n+x;}).sort((a,b)=>a-b);
  const key=(p,b)=>p+'|'+b.join(',');
  const seen=new Set([key(sy*n+sx,start)]),q=[[sy*n+sx,start,0]],spots=new Set([sy*n+sx]);
  for(let h=0;h<q.length;h++){
    if(seen.size>cap)return {won:false,spots};
    const [p,b,dist]=q[h];if(p===G)return {won:true,best:dist,spots};
    const px=p%n,py=Math.floor(p/n);
    for(let d=0;d<4;d++){const nx=px+DV[d][0],ny=py+DV[d][1];if(nx<0||ny<0||nx>=n||ny>=n||t[ny][nx])continue;
      const np=ny*n+nx;let nb=b;const bi=b.indexOf(np);
      if(bi>=0){const bx=nx+DV[d][0],by=ny+DV[d][1];if(bx<0||by<0||bx>=n||by>=n||t[by][bx])continue;const bp=by*n+bx;
        if(bp===G||b.includes(bp))continue;nb=b.slice();nb[bi]=bp;nb.sort((a,c)=>a-c);}
      const k=key(np,nb);if(seen.has(k))continue;seen.add(k);spots.add(np);q.push([np,nb,dist+1]);}
  }
  return {won:false,spots};
}
function bfsTiles(t,n,sx,sy,block){const seen=new Set([sx+','+sy]),q=[[sx,sy]];
  for(let h=0;h<q.length;h++){const [x,y]=q[h];for(let d=0;d<4;d++){const nx=x+DV[d][0],ny=y+DV[d][1],k=nx+','+ny;
    if(nx<0||ny<0||nx>=n||ny>=n||t[ny][nx]||block.has(k)||seen.has(k))continue;seen.add(k);q.push([nx,ny]);}}return seen;}
/* --- magic forest: purple mushrooms flip the arrows until the next mushroom --- */
function forest(cfg){
  const n=cfg.n,g=maze(n);addLoops(g,n,Math.round(n*.5));
  const r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n);const path=pathTo(r0.par,0,0,gx,gy);
  const used=new Set(['0,0',gx+','+gy]),mush=[];
  for(let i=0;i<cfg.onPath;i++){const idx=Math.max(2,Math.floor(path.length*(i+1)/(cfg.onPath+1)));const [x,y]=path[Math.min(idx,path.length-2)];
    if(!used.has(x+','+y)){mush.push({x,y});used.add(x+','+y);}}
  let guard=0;while(mush.length<cfg.onPath+cfg.extra&&guard++<300){const x=rnd(n),y=rnd(n),k=x+','+y;if(used.has(k)||x+y<3)continue;mush.push({x,y});used.add(k);}
  const stars=pickStars(n,3,used);
  return {g,n,start:{x:0,y:0},goal:{x:gx,y:gy},mush,stars,best:path.length-1};
}
/* --- beach: tide cells flood and dry again in two waves; wait for low tide and run --- */
function beach(cfg){
  const n=cfg.n,g=maze(n);addLoops(g,n,Math.round(n*.6));
  const r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n);const path=pathTo(r0.par,0,0,gx,gy);
  const used=new Set(['0,0',gx+','+gy]),tides=[];
  for(let i=0;i<cfg.bands;i++){const idx=Math.max(2,Math.floor(path.length*(i+1)/(cfg.bands+1))),len=1+rnd(2);
    for(let j=0;j<len;j++){const c=path[idx+j];if(!c||idx+j>=path.length-1)break;const k=c[0]+','+c[1];if(used.has(k))continue;tides.push({x:c[0],y:c[1],grp:i%2});used.add(k);}}
  let guard=0;while(guard++<300&&tides.length<cfg.bands*2+cfg.extra*2){const x=rnd(n),y=rnd(n),k=x+','+y;if(used.has(k)||x+y<3)continue;tides.push({x,y,grp:rnd(2)});used.add(k);}
  const stars=pickStars(n,3,used);
  return {g,n,start:{x:0,y:0},goal:{x:gx,y:gy},tides,stars,best:path.length-1};
}
/* --- mirror palace: you and your reflection move together, left and right swapped; each must reach her own mirror --- */
function mirror(cfg){
  const n=cfg.n,g=maze(n);addLoops(g,n,cfg.loops);
  const r0=bfs(g,n,0,0);
  const cells=allCells(n).filter(([x,y])=>!(x===0&&y===0)&&!(x===n-1&&y===0)&&x!==n-1-x).sort((a,b)=>r0.dist[b[1]][b[0]]-r0.dist[a[1]][a[0]]);
  let goal=null,tgoal=null;
  for(const [x,y] of cells){const tx=n-1-x;if((tx===0&&y===0)||(tx===n-1&&y===0))continue;goal={x,y};tgoal={x:tx,y};break;}
  const used=new Set(['0,0',(n-1)+',0',goal.x+','+goal.y,tgoal.x+','+tgoal.y]);
  const stars=pickStars(n,3,used);
  return {g,n,start:{x:0,y:0},goal,twinStart:{x:n-1,y:0},twinGoal:tgoal,stars,best:r0.dist[goal.y][goal.x]};
}
/* --- haunted house (cute): dark rooms, a torch that fades step by step, batteries, sleepy ghosts --- */
function haunt(cfg){
  const n=cfg.n,g=maze(n);addLoops(g,n,Math.round(n*.6));
  const r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n);const path=pathTo(r0.par,0,0,gx,gy);
  const used=new Set(['0,0',gx+','+gy]),batteries=[];const gap=Math.max(5,Math.floor(cfg.bat*.6));
  for(let i=gap;i<path.length-2;i+=gap){const [x,y]=path[i];batteries.push({x,y});used.add(x+','+y);}
  pickStars(n,1,used).forEach(([x,y])=>{batteries.push({x,y});used.add(x+','+y);});
  const {movers,taken}=corridors(g,n,cfg.ghosts,new Set([...used,...nearStart(n)]));
  const stars=pickStars(n,3,new Set([...used,...taken]));
  return {g,n,start:{x:0,y:0},goal:{x:gx,y:gy},batteries,ghosts:movers,batMax:cfg.bat,stars,best:path.length-1};
}
