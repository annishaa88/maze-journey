/* ================= wizard school: level makers ================= */
/* --- broom flight: the broom flies right by itself; up and down to pass the rings, dodge the clouds --- */
function broom(cfg){
  const n=cfg.n;
  for(let tries=0;tries<200;tries++){
    const ys=[1+rnd(n-2)];for(let x=1;x<n;x++)ys.push(Math.max(0,Math.min(n-1,ys[x-1]+rnd(2*cfg.lat+1)-cfg.lat)));
    const safe=new Set();for(let x=0;x<n;x++){const a=ys[x],b=x<n-1?ys[x+1]:ys[x];for(let y=Math.min(a,b);y<=Math.max(a,b);y++)safe.add(x+','+y);}
    const t=Array.from({length:n},()=>Array(n).fill(0));
    for(let y=0;y<n;y++)for(let x=1;x<n-1;x++)if(!safe.has(x+','+y)&&Math.random()<cfg.clouds)t[y][x]=1;
    const ringX=shuffle(Array.from({length:n-3},(_,i)=>i+2)).slice(0,cfg.rings).sort((a,b)=>a-b);
    const rings=ringX.map(x=>({x,y:ys[x]}));
    const birds=[];for(let i=0;i<cfg.birds;i++){const x=2+rnd(n-3);const free=[];for(let y=0;y<n;y++)if(!safe.has(x+','+y)&&!t[y][x])free.push(y);
      // a bird flaps up and down in a stretch of sky away from the flight line
      let best=null;for(let s=0;s<free.length;s++){let e=s;while(e+1<free.length&&free[e+1]===free[e]+1)e++;if(!best||e-s>best[1]-best[0])best=[free[s],free[e]];s=e;}
      if(best&&best[1]-best[0]>=1)birds.push({x,y0:best[0],y1:best[1],y:best[0],dir:1});}
    const used=new Set(rings.map(r=>r.x+','+r.y).concat(['0,'+ys[0]]));
    const stars=pickStars(n,3,used,ys.map((y,x)=>[x,y]).filter(([x])=>x>0&&x<n-1));
    if(stars.length<3)continue;
    return {t,n,start:{x:0,y:ys[0]},goal:{x:n-1,y:ys[n-1]},ys,rings,birds,stars,best:n-1};
  }
  return null;
}
/* --- moving staircases: stairs on the way swing between across and up-down --- */
function stairs(cfg){
  const n=cfg.n,g=maze(n);if(cfg.loops)addLoops(g,n,cfg.loops);
  const r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n),path=pathTo(r0.par,0,0,gx,gy);
  const straight=[];for(let i=2;i<path.length-2;i++){const [ax,ay]=path[i-1],[bx,by]=path[i],[cx,cy]=path[i+1];if(ax===cx||ay===cy)straight.push({x:bx,y:by,o:ay===cy?0:1,i});}
  const st=[];for(const c of shuffle(straight)){if(st.length>=cfg.stairs)break;if(st.some(s=>Math.abs(s.i-c.i)<3))continue;st.push({x:c.x,y:c.y,o0:(c.o+1)%2});}
  const used=new Set(['0,0',gx+','+gy,...st.map(s=>s.x+','+s.y)]);
  return {g,n,start:{x:0,y:0},goal:{x:gx,y:gy},stairs:st,stars:pickStars(n,3,used),best:r0.dist[gy][gx]};
}
/* --- potions: gather the recipe, brew it in the cauldron, and walk through the magic curtains --- */
const POTI=['🍄','🌿','🦎','🪶','💎','🌙','🐸','🌰','🍓','❄️'];
function potion(cfg){
  const n=cfg.n,g=maze(n),r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n),path=pathTo(r0.par,0,0,gx,gy);
  const bars=[];for(let i=0;i<cfg.barriers;i++){const idx=Math.min(path.length-2,Math.max(3,Math.floor(path.length*(.45+.45*i/Math.max(1,cfg.barriers)))));bars.push({x:path[idx][0],y:path[idx][1]});}
  const bk=new Set(bars.map(b=>b.x+','+b.y));
  const reach=bfs(g,n,0,0,(x,y,d)=>bk.has((x+DV[d][0])+','+(y+DV[d][1]))).dist;
  const region=shuffle(allCells(n).filter(([x,y])=>reach[y][x]>=2));
  const used=new Set(['0,0',gx+','+gy,...bk]),pick=()=>{const c=region.find(c=>!used.has(c.join(','))&&[...used].every(k=>{const [a,b]=k.split(',').map(Number);return Math.abs(a-c[0])+Math.abs(b-c[1])>=2;}))||region.find(c=>!used.has(c.join(',')));if(c)used.add(c.join(','));return c;};
  const kinds=shuffle(POTI.slice()),want=kinds.slice(0,cfg.ings),bad=kinds.slice(cfg.ings,cfg.ings+cfg.decoys);
  const cauldron=pick();const items=want.map(e=>{const c=pick();return c&&{x:c[0],y:c[1],e,good:true};}).concat(bad.map(e=>{const c=pick();return c&&{x:c[0],y:c[1],e,good:false};})).filter(Boolean);
  return {g,n,start:{x:0,y:0},goal:{x:gx,y:gy},bars,cauldron:{x:cauldron[0],y:cauldron[1]},items,want,stars:pickStars(n,3,used),best:r0.dist[gy][gx]};
}
/* --- owl post: deliver each letter to the tower of its colour before the owl gets tired --- */
function owlpost(cfg){
  const n=cfg.n,g=maze(n);addLoops(g,n,cfg.loops);
  const used=new Set(['0,0']),far=c=>[...used].every(k=>{const [a,b]=k.split(',').map(Number);return Math.abs(a-c[0])+Math.abs(b-c[1])>=Math.max(3,Math.floor(n/2));});
  const towers=[];for(const c of shuffle(allCells(n))){if(towers.length>=cfg.letters)break;if(used.has(c.join(','))||!far(c))continue;towers.push({x:c[0],y:c[1],c:towers.length});used.add(c.join(','));}
  const perches=[];for(const c of shuffle(allCells(n))){if(perches.length>=cfg.perches)break;if(used.has(c.join(','))||!far(c))continue;perches.push({x:c[0],y:c[1]});used.add(c.join(','));}
  // the owl's strength: enough for the longest hop in the best chain of rests and towers
  const pts=[{x:0,y:0}].concat(perches,towers),D=pts.map(p=>bfs(g,n,p.x,p.y).dist);
  const inT=new Set([0]),best=Array(pts.length).fill(1e9);let E=0;pts.forEach((p,i)=>best[i]=D[0][p.y][p.x]);
  while(inT.size<pts.length){let j=-1;for(let i=0;i<pts.length;i++)if(!inT.has(i)&&(j<0||best[i]<best[j]))j=i;E=Math.max(E,best[j]);inT.add(j);pts.forEach((p,i)=>{if(!inT.has(i))best[i]=Math.min(best[i],D[j][p.y][p.x]);});}
  return {g,n,start:{x:0,y:0},goal:{x:-9,y:-9},towers,perches,energy:E+cfg.slack,stars:pickStars(n,3,used),best:E};
}
/* --- flying keys: catch the keys in the colours the door asks for --- */
function flykeys(cfg){
  const n=cfg.n;
  for(let tries=0;tries<100;tries++){
    const t=Array.from({length:n},()=>Array(n).fill(0));for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(Math.random()<cfg.pillars)t[y][x]=1;
    t[0][0]=0;const gx=n-1,gy=n-1;t[gy][gx]=0;
    const seen=new Set(['0,0']),q=[[0,0]];for(let h=0;h<q.length;h++){const [x,y]=q[h];for(let d=0;d<4;d++){const a=x+DV[d][0],b=y+DV[d][1];if(inB(n,a,b)&&!t[b][a]&&!seen.has(a+','+b)){seen.add(a+','+b);q.push([a,b]);}}}
    if(!seen.has(gx+','+gy)||seen.size<n*n*.7)continue;
    const free=shuffle([...seen].map(k=>k.split(',').map(Number)).filter(([x,y])=>x+y>=3&&!(x===gx&&y===gy)));
    const keys=free.slice(0,cfg.keys).map(([x,y],i)=>({x,y,c:i}));
    const need=shuffle(keys.map(k=>k.c)).slice(0,cfg.need);
    const used=new Set(['0,0',gx+','+gy]);
    return {t,n,start:{x:0,y:0},goal:{x:gx,y:gy},keys,need,stars:pickStars(n,3,used,[...seen].map(k=>k.split(',').map(Number))),best:2*(n-1)};
  }
  return null;
}
/* --- spell class: magic doors open with a spell drawn in arrows --- */
function wand(cfg){
  const n=cfg.n,g=maze(n),r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n),path=pathTo(r0.par,0,0,gx,gy);
  const doors={};for(let i=0;i<cfg.doors;i++){const idx=Math.max(2,Math.min(path.length-1,Math.floor(path.length*(i+1)/(cfg.doors+1))));const [ax,ay]=path[idx-1],[bx,by]=path[idx];const d=DV.findIndex(v=>v[0]===bx-ax&&v[1]===by-ay);
    let rune=[];for(let k=0;k<cfg.len;k++){let a;do{a=rnd(4);}while(rune.length&&a===rune[rune.length-1]);rune.push(a);}doors[edgeKey(ax,ay,d)]=rune;}
  return {g,n,start:{x:0,y:0},goal:{x:gx,y:gy},doors,stars:pickStars(n,3,new Set(['0,0',gx+','+gy])),best:r0.dist[gy][gx]};
}

/* --- the giant garden maze: much bigger than the screen --- */
function giant(cfg){
  const n=cfg.n,g=maze(n);if(cfg.loops)addLoops(g,n,cfg.loops);
  const r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n);
  return {g,n,view:cfg.view||9,start:{x:0,y:0},goal:{x:gx,y:gy},stars:pickStars(n,3,new Set(['0,0',gx+','+gy])),best:r0.dist[gy][gx]};
}
