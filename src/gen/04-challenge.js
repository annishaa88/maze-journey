/* ================= challenge region: level makers ================= */
/* --- tilting maze: every tilt slides you AND the boulders until something stops them --- */
function tiltSim(t,n,p,bs,d,goal){
  const objs=[{k:'p',x:p.x,y:p.y}].concat(bs.map(b=>({k:'b',x:b[0],y:b[1]})));
  const key=o=>d===1?-o.x:d===3?o.x:d===2?-o.y:o.y;objs.sort((a,b)=>key(a)-key(b));
  const occ=new Set(objs.map(o=>o.x+','+o.y));let path=[],win=false;
  for(const o of objs){occ.delete(o.x+','+o.y);
    for(;;){const nx=o.x+DV[d][0],ny=o.y+DV[d][1];
      if(nx<0||ny<0||nx>=n||ny>=n||t[ny][nx]||occ.has(nx+','+ny))break;
      if(o.k==='b'&&nx===goal.x&&ny===goal.y)break;
      o.x=nx;o.y=ny;if(o.k==='p'){path.push([nx,ny]);if(nx===goal.x&&ny===goal.y){win=true;break;}}}
    occ.add(o.x+','+o.y);}
  const P=objs.find(o=>o.k==='p');
  return {p:{x:P.x,y:P.y},bs:objs.filter(o=>o.k==='b').map(o=>[o.x,o.y]).sort((a,b)=>a[1]*n+a[0]-(b[1]*n+b[0])),path,win};
}
function tiltSolve(t,n,p,bs,goal,cap){
  const k=(p,bs)=>p.x+','+p.y+'|'+bs.map(b=>b.join(',')).join(';');
  const start={p,bs:bs.slice().sort((a,b)=>a[1]*n+a[0]-(b[1]*n+b[0]))};
  const seen=new Map([[k(start.p,start.bs),null]]),q=[start],rests=new Set([p.x+','+p.y]);
  for(let h=0;h<q.length;h++){if(seen.size>(cap||60000))return {won:false,rests};
    const s=q[h];for(let d=0;d<4;d++){const r=tiltSim(t,n,s.p,s.bs,d,goal);if(!r.path.length&&r.bs.join()===s.bs.join())continue;
      const nk=k(r.p,r.bs);if(seen.has(nk))continue;seen.set(nk,[k(s.p,s.bs),d]);r.path.forEach(c=>rests.add(c.join(',')));
      if(r.win){const sol=[d];let c=k(s.p,s.bs);while(seen.get(c)){sol.unshift(seen.get(c)[1]);c=seen.get(c)[0];}return {won:true,sol,rests};}
      q.push({p:r.p,bs:r.bs});}}
  return {won:false,rests};
}
function tilt(cfg){
  const n=cfg.n;let fb=null;
  for(let tries=0;tries<400;tries++){
    const t=Array.from({length:n},()=>Array(n).fill(0));
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(Math.random()<cfg.walls)t[y][x]=1;
    const free=shuffle(allCells(n).filter(([x,y])=>!t[y][x]));if(free.length<cfg.boulders+6)continue;
    const [sx,sy]=free[0],[gx,gy]=free.find(([x,y])=>Math.abs(x-sx)+Math.abs(y-sy)>=n-1)||free[1];
    const bs=free.filter(([x,y])=>!(x===sx&&y===sy)&&!(x===gx&&y===gy)).slice(0,cfg.boulders);
    const start={x:sx,y:sy},goal={x:gx,y:gy};
    const R=tiltSolve(t,n,start,bs,goal,cfg.boulders?40000:5000);if(!R.won)continue;
    const used=new Set([sx+','+sy,gx+','+gy,...bs.map(b=>b.join(','))]);
    const stars=pickStars(n,3,used,[...R.rests].map(k=>k.split(',').map(Number)));
    const lv={t,n,start,goal,boulders:bs,sol:R.sol,stars,best:R.sol.length};
    if(R.sol.length>=cfg.min&&stars.length===3)return lv;
    if(stars.length===3&&(!fb||R.sol.length>fb.best))fb=lv;
  }
  return fb;
}
/* --- shadow chaser: a shadow walks your exact trail; collect the lanterns and get out --- */
function shadow(cfg){
  const n=cfg.n,g=maze(n);addLoops(g,n,cfg.loops);
  const r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n);
  const used=new Set(['0,0',gx+','+gy]);
  // lanterns sit on loops, never at the end of a dead end, so she can grab one and keep going without walking back into the shadow
  const deg=(x,y)=>[0,1,2,3].filter(d=>!g[y][x][d]).length,cut=new Set();let changed=true;
  while(changed){changed=false;for(let y=0;y<n;y++)for(let x=0;x<n;x++){const k=x+','+y;if(cut.has(k))continue;
    const open=[0,1,2,3].filter(d=>!g[y][x][d]&&!cut.has((x+DV[d][0])+','+(y+DV[d][1]))).length;if(open<=1){cut.add(k);changed=true;}}}
  const far0=allCells(n).filter(([x,y])=>r0.dist[y][x]>=Math.floor(n*.6)&&!used.has(x+','+y));
  const core=far0.filter(([x,y])=>!cut.has(x+','+y)),far=core.length>=cfg.lights*2?core:far0;
  const lights=[];for(const [x,y] of shuffle(far)){if(lights.length>=cfg.lights)break;if(lights.some(l=>Math.abs(l.x-x)+Math.abs(l.y-y)<n/2))continue;lights.push({x,y});used.add(x+','+y);}
  const stars=pickStars(n,3,used);
  return {g,n,start:{x:0,y:0},goal:{x:gx,y:gy},lights,stars,best:r0.dist[gy][gx]};
}
/* --- multi-floor building: floors side by side; stairs link the same spot on the next floor; holes drop you down --- */
const FLOORPOS=m=>[[0,m+1],[m+1,m+1],[0,0],[m+1,0]];
function floors(cfg){
  const m=cfg.m,F=cfg.floors,n=2*m+1,O=FLOORPOS(m);let fb=null;
  for(let tries=0;tries<300;tries++){
    const g=Array.from({length:n},()=>Array.from({length:n},()=>[1,1,1,1]));
    for(let f=0;f<F;f++){const mg=maze(m);addLoops(mg,m,Math.round(m*.6));const [ox,oy]=O[f];
      for(let y=0;y<m;y++)for(let x=0;x<m;x++)g[oy+y][ox+x]=mg[y][x].slice();}
    const G2=(f,x,y)=>[O[f][0]+x,O[f][1]+y],used=new Set(),links={},holes={};
    for(let f=0;f<F-1;f++)for(let i=0;i<cfg.stairs;i++){for(let guard=0;guard<60;guard++){const x=rnd(m),y=rnd(m),[ax,ay]=G2(f,x,y),[bx,by]=G2(f+1,x,y),ka=ax+','+ay,kb=bx+','+by;
      if(used.has(ka)||used.has(kb))continue;links[ka]={to:kb,up:true};links[kb]={to:ka,up:false};used.add(ka);used.add(kb);break;}}
    for(let i=0;i<cfg.holes;i++){for(let guard=0;guard<60;guard++){const f=1+rnd(F-1),x=rnd(m),y=rnd(m),[ax,ay]=G2(f,x,y),[bx,by]=G2(f-1,x,y),ka=ax+','+ay;
      if(used.has(ka)||used.has(bx+','+by))continue;holes[ka]=bx+','+by;used.add(ka);break;}}
    const [sx,sy]=G2(0,0,m-1);if(used.has(sx+','+sy))continue;
    const land=k=>links[k]?links[k].to:holes[k]||k;
    const next=k=>{const [x,y]=k.split(',').map(Number),out=[];for(let d=0;d<4;d++){if(g[y][x][d])continue;out.push(land((x+DV[d][0])+','+(y+DV[d][1])));}return out;};
    // the goal is the farthest spot on the top floor
    const top=F-1,[tx,ty]=O[top];let goalK=null,bd=-1;
    const R0=explore(sx+','+sy,next,()=>false);
    R0.seen.forEach((dd,k)=>{const [x,y]=k.split(',').map(Number);if(x>=tx&&x<tx+m&&y>=ty&&y<ty+m&&!used.has(k)&&dd>bd){bd=dd;goalK=k;}});
    if(!goalK)continue;
    const R=explore(sx+','+sy,next,k=>k===goalK);if(!R.won||!R.safe)continue;
    const [gx,gy]=goalK.split(',').map(Number);
    const pool=[...R.seen.keys()].filter(k=>!used.has(k)&&k!==goalK).map(k=>k.split(',').map(Number));
    const stars=pickStars(n,3,new Set([sx+','+sy,goalK]),pool);
    const lv={g,n,m,F,O,start:{x:sx,y:sy},goal:{x:gx,y:gy},links,holes,stars,best:R.best};
    if(stars.length===3)return lv;fb=fb||lv;
  }
  return fb;
}
/* --- escape room: find the clue scrolls, work out each coloured digit, type the code at the door --- */
function escape(cfg){
  const n=cfg.n,g=maze(n);addLoops(g,n,Math.round(n*.5));
  const r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n);
  const used=new Set(['0,0',gx+','+gy]),clues=[];
  for(const [x,y] of shuffle(allCells(n).filter(([x,y])=>r0.dist[y][x]>=3))){if(clues.length>=cfg.digits)break;if(used.has(x+','+y)||clues.some(c=>Math.abs(c.x-x)+Math.abs(c.y-y)<Math.max(3,n/3)))continue;clues.push({x,y});used.add(x+','+y);}
  const code=clues.map(()=>rnd(10));
  const stars=pickStars(n,3,used);
  return {g,n,start:{x:0,y:0},goal:{x:gx,y:gy},clues,code,stars,best:r0.dist[gy][gx]};
}
/* --- numbers land: question tiles on the one true path; wrong-answer tiles sit at the side-turns just before them --- */
function numbers(cfg){
  const n=cfg.n;let best=null;
  for(let tries=0;tries<60;tries++){
    const g=maze(n);
    const r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n);const path=pathTo(r0.par,0,0,gx,gy);
    const onPath=new Set(path.map(c=>c[0]+','+c[1]));
    if(cfg.kind==='wallet'){
      const used=new Set(['0,0',gx+','+gy]);
      // coins sit only in dead ends, so each one can be taken or skipped freely
      const ends=allCells(n).filter(([x,y])=>g[y][x].filter(w=>!w).length===1);
      if(ends.filter(([x,y])=>!used.has(x+','+y)).length<cfg.coins+3)continue;
      const coins=pickStars(n,cfg.coins+3,used,ends);coins.forEach(c=>used.add(c[0]+','+c[1]));
      const stars=pickStars(n,3,used);
      return {g,n,start:{x:0,y:0},goal:{x:gx,y:gy},coins:coins.map(([x,y])=>({x,y})),quiz:[],stars,best:path.length-1};
    }
    // candidate spots: the cell before has at least one side-turn off the path
    const cand=[];
    for(let i=2;i<path.length-1;i++){const [qx,qy]=path[i-1];
      const sides=[0,1,2,3].filter(d=>!g[qy][qx][d]).map(d=>[qx+DV[d][0],qy+DV[d][1]]).filter(([x,y])=>!onPath.has(x+','+y));
      const room=[0,1,2,3].filter(d=>{const nx=qx+DV[d][0],ny=qy+DV[d][1];return g[qy][qx][d]&&nx>=0&&ny>=0&&nx<n&&ny<n&&!onPath.has(nx+','+ny)&&!(nx===0&&ny===0);}).length;
      if(sides.length+room>=1)cand.push({i,sides,choices:Math.min(2,sides.length+room)});}
    const want=cfg.q,picked=[];
    for(let j=0;j<want;j++){const target=Math.floor(path.length*(j+1)/(want+1));
      let bestC=null,bd=1e9;for(const c of cand){if(picked.some(p=>Math.abs(p.i-c.i)<3))continue;const dd=Math.abs(c.i-target)-(c.choices>1?6:0);if(dd<bd){bd=dd;bestC=c;}}
      if(bestC)picked.push(bestC);}
    picked.sort((a,b)=>a.i-b.i);
    const taken=new Set();
    const quiz=picked.map(c=>{const [x,y]=path[c.i],[qx,qy]=path[c.i-1];
      const wrong=shuffle(c.sides).slice(0,2).map(([wx,wy])=>({x:wx,y:wy}));
      // open one more side-turn next to the question so there are three answers to pick from
      for(const d of shuffle([0,1,2,3])){if(wrong.length>=2)break;const nx=qx+DV[d][0],ny=qy+DV[d][1],k=nx+','+ny;
        if(nx<0||ny<0||nx>=n||ny>=n||!g[qy][qx][d]||onPath.has(k)||taken.has(k)||(nx===0&&ny===0))continue;
        g[qy][qx][d]=0;g[ny][nx][OPP[d]]=0;wrong.push({x:nx,y:ny});}
      wrong.forEach(w=>taken.add(w.x+','+w.y));
      return {x,y,wrong};});
    // the wrong tiles are closed, so stars go only where you can walk
    const closed=new Set();quiz.forEach(q=>q.wrong.forEach(w=>closed.add(w.x+','+w.y)));
    const open=bfs(g,n,0,0,(x,y,d)=>closed.has((x+DV[d][0])+','+(y+DV[d][1]))).dist;
    const used=new Set(['0,0',gx+','+gy,...closed,...quiz.map(q=>q.x+','+q.y)]);
    const pool=allCells(n).filter(([x,y])=>open[y][x]>=0);
    const stars=pickStars(n,3,used,pool);
    const lv={g,n,start:{x:0,y:0},goal:{x:gx,y:gy},quiz,stars,best:path.length-1};
    if(stars.length<3||!quiz.every(q=>q.wrong.length>=1)){if(!best)best=lv;continue;}
    // prefer mazes where most questions have three answers to choose from
    const three=quiz.filter(q=>q.wrong.length>=2).length;lv.score=quiz.length*100+three;
    if(quiz.length>=want&&three>=Math.ceil(want*.7))return lv;
    if(!best||lv.score>(best.score||-1))best=lv;
  }
  return best;
}
