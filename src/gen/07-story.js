/* ================= story land: level makers ================= */
/* --- hansel & gretel: a dark forest; crumbs mark the way, birds eat the old ones --- */
function hansel(cfg){
  const n=cfg.n,g=maze(n);addLoops(g,n,cfg.loops);
  const r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n);
  const stars=pickStars(n,3,new Set(['0,0',gx+','+gy]));
  return {g,n,start:{x:0,y:0},goal:{x:gx,y:gy},stars,best:r0.dist[gy][gx]*2};
}
/* --- three little pigs: carry bricks to the house before the wolf arrives --- */
function pigs(cfg){
  const n=cfg.n,g=maze(n);addLoops(g,n,cfg.loops);
  const hx=Math.floor(n/2),hy=Math.floor(n/2);
  const dh=bfs(g,n,hx,hy).dist,used=new Set([hx+','+hy]),bricks=[];
  for(const [x,y] of shuffle(allCells(n))){if(bricks.length>=cfg.bricks)break;const k=x+','+y;if(used.has(k)||dh[y][x]<2)continue;if(bricks.some(b=>Math.abs(b.x-x)+Math.abs(b.y-y)<2))continue;bricks.push({x,y});used.add(k);}
  // a fair budget: greedy trips from the house, nearest brick first
  let left=bricks.slice(),cost=0;
  while(left.length){let at={x:hx,y:hy};for(let c=0;c<cfg.carry&&left.length;c++){const d=bfs(g,n,at.x,at.y).dist;left.sort((a,b)=>d[a.y][a.x]-d[b.y][b.x]);const b=left.shift();cost+=d[b.y][b.x];at=b;}cost+=dh[at.y][at.x];}
  const stars=pickStars(n,3,used);
  return {g,n,start:{x:hx,y:hy},goal:{x:hx,y:hy},bricks,stars,wolfSteps:Math.ceil(cost*cfg.slack)+4,best:cost};
}
/* --- jack & the beanstalk: tiptoe through the giant's castle; creaky boards make noise --- */
function beanstalk(cfg){
  const n=cfg.n;let fb=null;
  for(let tries=0;tries<120;tries++){
    const g=maze(n);addLoops(g,n,cfg.loops);
    const r0=bfs(g,n,0,0);
    const cand=allCells(n).filter(([x,y])=>r0.dist[y][x]>=n);const [ex,ey]=cand.length?cand[rnd(cand.length)]:farthest(r0.dist,n);
    const creak=new Set();for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(!(x===0&&y===0)&&!(x===ex&&y===ey)&&Math.random()<cfg.creak)creak.add(x+','+y);
    // fewest creaks: start → egg → back to the beanstalk
    const quiet=(sx,sy)=>{const D=Array.from({length:n},()=>Array(n).fill(1e9)),P={},dq=[[sx,sy]];D[sy][sx]=0;
      while(dq.length){const [x,y]=dq.shift();for(let d=0;d<4;d++){if(g[y][x][d])continue;const a=x+DV[d][0],b=y+DV[d][1],c=D[y][x]+(creak.has(a+','+b)?1:0);if(c<D[b][a]){D[b][a]=c;P[a+','+b]=x+','+y;if(creak.has(a+','+b))dq.push([a,b]);else dq.unshift([a,b]);}}}return {D,P};};
    // keep a quiet way open: clear creaks on the quietest path until the trip there and back fits under the limit
    {const Q=quiet(0,0),onPath=[];let k=ex+','+ey;while(k&&k!=='0,0'){if(creak.has(k))onPath.push(k);k=Q.P[k];}
     const allowed=Math.floor((cfg.limit-1)/2);shuffle(onPath).slice(0,Math.max(0,onPath.length-allowed)).forEach(k=>creak.delete(k));}
    const need=quiet(0,0).D[ey][ex]*2;
    // a careless shortest walk should be too loud on the harder levels
    const path=pathTo(r0.par,0,0,ex,ey),loud=path.slice(1).filter(([x,y])=>creak.has(x+','+y)).length*2;
    if(need>cfg.limit-1)continue;
    const giant=farthest(bfs(g,n,ex,ey).dist.map((row,y)=>row.map((v,x)=>Math.min(v,r0.dist[y][x]))),n);
    const used=new Set(['0,0',ex+','+ey,giant.join(',')]);
    const stars=pickStars(n,3,used);
    const lv={g,n,start:{x:0,y:0},goal:{x:0,y:0},egg:{x:ex,y:ey},giant:{x:giant[0],y:giant[1]},creak:[...creak],limit:cfg.limit,stars,best:r0.dist[ey][ex]*2,need};
    if(!cfg.trap||loud>=cfg.limit)return lv;fb=fb||lv;
  }
  return fb;
}
/* --- sleeping beauty: cut through the thorns, they grow back; meadows are safe --- */
function thorns(cfg){
  const n=cfg.n;let fb=null;
  for(let tries=0;tries<100;tries++){
    const t=Array.from({length:n},()=>Array(n).fill(1));   // 1 thorns, 0 meadow, 2 stone
    // a wandering trail to the castle with a meadow every few squares
    let x=0,y=0;const trail=[[0,0]];const seen=new Set(['0,0']);
    while(!(x===n-1&&y===n-1)&&trail.length<n*n){const opts=[];for(let d=0;d<4;d++){const a=x+DV[d][0],b=y+DV[d][1];if(inB(n,a,b)&&!seen.has(a+','+b))opts.push([a,b,(a+b)-(x+y)+Math.random()*1.6]);}
      if(!opts.length)break;opts.sort((p,q)=>q[2]-p[2]);[x,y]=opts[0];seen.add(x+','+y);trail.push([x,y]);}
    if(!(x===n-1&&y===n-1))continue;
    let run=0;trail.forEach(([a,b],i)=>{run++;if(i===0||i===trail.length-1||run>cfg.gap){t[b][a]=0;run=0;}});
    for(let i=0;i<cfg.meadows;i++){const a=rnd(n),b=rnd(n);t[b][a]=0;}
    for(let i=0;i<cfg.stones;i++){const a=rnd(n),b=rnd(n);if(!seen.has(a+','+b))t[b][a]=2;}
    const stars=pickStars(n,3,new Set(['0,0',(n-1)+','+(n-1)]),allCells(n).filter(([a,b])=>t[b][a]!==2));
    const lv={t,n,start:{x:0,y:0},goal:{x:n-1,y:n-1},stars,best:trail.length-1};
    if(stars.length===3)return lv;fb=lv;
  }
  return fb;
}

