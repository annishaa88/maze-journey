/* ================= newest worlds: level makers ================= */
const inB=(n,x,y)=>x>=0&&y>=0&&x<n&&y<n;
/* --- sheep herding: a sheep next to you runs one square straight away; herd them all into the pen --- */
function sheepStep(t,n,p,sh,pen){
  const occ=new Set(sh.map(s=>s[0]+','+s[1])),out=[];let penned=0;
  for(const s of sh){const dx=s[0]-p.x,dy=s[1]-p.y;
    if(Math.abs(dx)+Math.abs(dy)!==1){out.push(s);continue;}
    const nx=s[0]+dx,ny=s[1]+dy;
    if(!inB(n,nx,ny)||t[ny][nx]||occ.has(nx+','+ny)){out.push(s);continue;}
    occ.delete(s[0]+','+s[1]);
    if(nx===pen.x&&ny===pen.y){penned++;continue;}
    occ.add(nx+','+ny);out.push([nx,ny]);}
  return {sh:out,penned};
}
function sheepSolve(t,n,p,sh,pen,cap){
  // best-first search: states whose sheep are closer to the pen come first
  const dist=Array.from({length:n},()=>Array(n).fill(1e9)),bq=[[pen.x,pen.y]];dist[pen.y][pen.x]=0;
  for(let h=0;h<bq.length;h++){const [x,y]=bq[h];for(let d=0;d<4;d++){const a=x+DV[d][0],b=y+DV[d][1];if(inB(n,a,b)&&!t[b][a]&&dist[b][a]>dist[y][x]+1){dist[b][a]=dist[y][x]+1;bq.push([a,b]);}}}
  const H=(p,sh)=>{let v=0;for(const s of sh){const d=dist[s[1]][s[0]];if(d>=1e9)return 1e9;v+=d*3+2;}if(!sh.length)v=dist[p.y][p.x];else{let m=1e9;for(const s of sh)m=Math.min(m,Math.abs(s[0]-p.x)+Math.abs(s[1]-p.y));v+=m;}return v;};
  const key=(p,sh)=>p.x+','+p.y+'|'+sh.map(s=>s[0]+','+s[1]).sort().join(';');
  const heap=[],push=(f,o)=>{heap.push([f,o]);let i=heap.length-1;while(i){const j=(i-1)>>1;if(heap[j][0]<=heap[i][0])break;[heap[i],heap[j]]=[heap[j],heap[i]];i=j;}},
    pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===i)break;[heap[i],heap[m]]=[heap[m],heap[i]];i=m;}}return top[1];};
  const k0=key(p,sh),prev=new Map([[k0,null]]),cells=new Set();push(H(p,sh),{p,sh,g:0});
  while(heap.length){if(prev.size>(cap||60000))return null;const s=pop(),sk=key(s.p,s.sh);
    for(let d=0;d<4;d++){const nx=s.p.x+DV[d][0],ny=s.p.y+DV[d][1];
      if(!inB(n,nx,ny)||t[ny][nx]||s.sh.some(o=>o[0]===nx&&o[1]===ny))continue;
      if(nx===pen.x&&ny===pen.y&&s.sh.length)continue;
      const np={x:nx,y:ny},r=sheepStep(t,n,np,s.sh,pen),nk=key(np,r.sh);
      if(prev.has(nk))continue;prev.set(nk,[sk,d]);cells.add(nx+','+ny);
      if(nx===pen.x&&ny===pen.y){const sol=[];let c=nk;while(prev.get(c)){sol.unshift(prev.get(c)[1]);c=prev.get(c)[0];}return {sol,cells};}
      const h=H(np,r.sh);if(h>=1e9)continue;push(s.g+1+h*2,{p:np,sh:r.sh,g:s.g+1});}}
  return null;
}
function sheep(cfg){
  const n=cfg.sheep>2?Math.min(8,cfg.n):cfg.n,T0=Date.now();let fb=null;
  for(let tries=0;tries<260;tries++){
    if(fb&&Date.now()-T0>700||Date.now()-T0>3000)break;
    const t=Array.from({length:n},()=>Array(n).fill(0));
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(Math.random()<cfg.bush)t[y][x]=1;
    const free=shuffle(allCells(n).filter(([x,y])=>!t[y][x]));if(free.length<cfg.sheep+8)continue;
    const [gx,gy]=free[0];
    // sheep stand away from the edge so there is room to walk behind them
    const mid=free.filter(([x,y])=>x>0&&y>0&&x<n-1&&y<n-1&&Math.abs(x-gx)+Math.abs(y-gy)>=2);if(mid.length<cfg.sheep+1)continue;
    const sh=mid.slice(0,cfg.sheep).map(c=>c.slice());
    const st=free.find(([x,y])=>!(x===gx&&y===gy)&&!sh.some(s=>s[0]===x&&s[1]===y)&&sh.every(s=>Math.abs(s[0]-x)+Math.abs(s[1]-y)>=3));if(!st)continue;
    const start={x:st[0],y:st[1]},goal={x:gx,y:gy};
    const R=sheepSolve(t,n,start,sh,goal,cfg.sheep>2?25000:20000);if(!R)continue;
    const used=new Set([st.join(','),gx+','+gy,...sh.map(s=>s.join(','))]);
    const stars=pickStars(n,3,used,[...R.cells].map(k=>k.split(',').map(Number)));
    const lv={t,n,start,goal,sheep:sh,stars,best:R.sol.length};
    if(R.sol.length>=cfg.min&&stars.length===3)return lv;
    if(stars.length===3&&(!fb||R.sol.length>fb.best))fb=lv;
  }
  return fb;
}
/* --- chef: collect the recipe in order, then cook it in the pot --- */
const RECIPES=[
  {dish:'🍕',name:'פיצה',ing:['🍅','🧀','🍄','🫒','🌿']},
  {dish:'🎂',name:'עוגה',ing:['🥚','🥛','🍫','🧈','🍓']},
  {dish:'🥞',name:'פנקייקים',ing:['🥚','🥛','🧈','🍯','🫐']},
  {dish:'🥗',name:'סלט',ing:['🥬','🥒','🍅','🥕','🫒']},
  {dish:'🍪',name:'עוגיות',ing:['🧈','🥚','🍫','🥛','🍯']},
  {dish:'🥤',name:'שייק',ing:['🍌','🍓','🥛','🫐','🍯']},
  {dish:'🍲',name:'מרק',ing:['🥕','🧅','🥔','🍅','🌿']}];
const ALLING=[...new Set(RECIPES.flatMap(r=>r.ing))];
function chef(cfg){
  const n=cfg.n,g=maze(n);addLoops(g,n,cfg.loops);
  const r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n);
  const rec=RECIPES[rnd(RECIPES.length)],want=rec.ing.slice(0,cfg.ing);
  const used=new Set(['0,0',gx+','+gy]),spots=[];
  const cand=shuffle(allCells(n).filter(([x,y])=>r0.dist[y][x]>=2));
  const far=c=>spots.every(s=>Math.abs(s[0]-c[0])+Math.abs(s[1]-c[1])>=Math.max(2,Math.floor(n/3)));
  for(const c of cand){if(spots.length>=want.length+cfg.decoys)break;if(used.has(c.join(','))||!far(c))continue;spots.push(c);used.add(c.join(','));}
  for(const c of cand){if(spots.length>=want.length+cfg.decoys)break;if(used.has(c.join(',')))continue;spots.push(c);used.add(c.join(','));}
  const others=shuffle(ALLING.filter(e=>!want.includes(e)));
  const items=spots.map((c,i)=>({x:c[0],y:c[1],e:i<want.length?want[i]:others[(i-want.length)%others.length],need:i<want.length?i:-1}));
  // stoves sit on plain floor
  const stoves=[];for(const c of shuffle(allCells(n))){if(stoves.length>=cfg.stoves)break;const k=c.join(',');if(used.has(k)||r0.dist[c[1]][c[0]]<2)continue;stoves.push({x:c[0],y:c[1],ph:rnd(3)});used.add(k);}
  const stars=pickStars(n,3,used);
  return {g,n,start:{x:0,y:0},goal:{x:gx,y:gy},dish:rec.dish,dishName:rec.name,want,items,stoves,stars,best:r0.dist[gy][gx]};
}
/* --- memory maze: look well, then the walls vanish --- */
function memory(cfg){
  const n=cfg.n,g=maze(n);addLoops(g,n,cfg.loops);
  const r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n);
  const stars=pickStars(n,3,new Set(['0,0',gx+','+gy]));
  return {g,n,start:{x:0,y:0},goal:{x:gx,y:gy},stars,best:r0.dist[gy][gx]};
}
/* --- spelling: collect the letters of the word in order --- */
const WORDS={
  3:[['CAT','🐱'],['DOG','🐶'],['SUN','☀️'],['BUS','🚌'],['PIG','🐷'],['CUP','🥤'],['HAT','🎩'],['BEE','🐝'],['EGG','🥚'],['BED','🛏️'],['FOX','🦊'],['COW','🐄'],['ANT','🐜'],['KEY','🔑'],['CAR','🚗']],
  4:[['FISH','🐟'],['FROG','🐸'],['CAKE','🎂'],['BOOK','📖'],['STAR','⭐'],['MOON','🌙'],['BEAR','🐻'],['DUCK','🦆'],['TREE','🌳'],['BALL','⚽'],['LION','🦁'],['SHIP','🚢'],['BIRD','🐦'],['MILK','🥛'],['DOOR','🚪']],
  5:[['APPLE','🍎'],['HORSE','🐴'],['HOUSE','🏠'],['TIGER','🐯'],['PIZZA','🍕'],['CLOCK','🕰️'],['TRAIN','🚂'],['WHALE','🐳'],['ZEBRA','🦓'],['SNAKE','🐍'],['MOUSE','🐭'],['PANDA','🐼'],['BREAD','🍞'],['CHAIR','🪑'],['SHEEP','🐑']]};
function spell(cfg){
  const n=cfg.n,g=maze(n);addLoops(g,n,cfg.loops);
  const r0=bfs(g,n,0,0);const [gx,gy]=farthest(r0.dist,n);
  const [word,pic]=WORDS[cfg.len][rnd(WORDS[cfg.len].length)];
  const used=new Set(['0,0',gx+','+gy]),spots=[];
  const cand=shuffle(allCells(n).filter(([x,y])=>r0.dist[y][x]>=2));
  const far=c=>spots.every(s=>Math.abs(s[0]-c[0])+Math.abs(s[1]-c[1])>=2);
  for(const c of cand){if(spots.length>=word.length+cfg.decoys)break;if(used.has(c.join(','))||!far(c))continue;spots.push(c);used.add(c.join(','));}
  for(const c of cand){if(spots.length>=word.length+cfg.decoys)break;if(used.has(c.join(',')))continue;spots.push(c);used.add(c.join(','));}
  const AB='ABCDEFGHIJKLMNOPRSTUVWY'.split('').filter(ch=>!word.includes(ch));
  const tiles=spots.map((c,i)=>({x:c[0],y:c[1],ch:i<word.length?word[i]:AB[rnd(AB.length)]}));
  const stars=pickStars(n,3,used);
  return {g,n,start:{x:0,y:0},goal:{x:gx,y:gy},word,pic,tiles,stars,best:r0.dist[gy][gx]};
}
/* --- paint the floor: every square once, no stepping on wet paint --- */
function paintSolve(t,n,painted,p,cap){
  // depth-first with the "fewest exits first" rule; returns the next step or -1
  const free=[];for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(!t[y][x])free.push(x+','+y);
  const seen=new Set(painted),total=free.length;let nodes=0,first=-1;
  const exits=(x,y)=>{let c=0;for(let d=0;d<4;d++){const a=x+DV[d][0],b=y+DV[d][1];if(inB(n,a,b)&&!t[b][a]&&!seen.has(a+','+b))c++;}return c;};
  function go(x,y,depth){
    if(seen.size===total)return true;if(++nodes>(cap||40000))return false;
    const opts=[];for(let d=0;d<4;d++){const a=x+DV[d][0],b=y+DV[d][1];if(inB(n,a,b)&&!t[b][a]&&!seen.has(a+','+b))opts.push([exits(a,b),d,a,b]);}
    opts.sort((p,q)=>p[0]-q[0]);
    for(const [,d,a,b] of opts){seen.add(a+','+b);if(go(a,b,depth+1)){if(depth===0)first=d;return true;}seen.delete(a+','+b);}
    return false;}
  return go(p.x,p.y,0)?first:-1;
}
function paint(cfg){
  const n=cfg.n;let fb=null;
  for(let tries=0;tries<400;tries++){
    const sx=rnd(n),sy=rnd(n),seen=new Set([sx+','+sy]),path=[[sx,sy]];let x=sx,y=sy;
    for(;;){const opts=[];for(let d=0;d<4;d++){const a=x+DV[d][0],b=y+DV[d][1];if(!inB(n,a,b)||seen.has(a+','+b))continue;
        let e=0;for(let k=0;k<4;k++){const c=a+DV[k][0],f=b+DV[k][1];if(inB(n,c,f)&&!seen.has(c+','+f))e++;}opts.push([e+Math.random()*cfg.wild,a,b]);}
      if(!opts.length)break;opts.sort((p,q)=>p[0]-q[0]);[,x,y]=opts[0];seen.add(x+','+y);path.push([x,y]);}
    const rocks=n*n-path.length;if(rocks>cfg.maxRocks||rocks<cfg.minRocks){if(!fb||Math.abs(rocks-cfg.minRocks)<fb.miss)fb={miss:Math.abs(rocks-cfg.minRocks),path};continue;}
    return paintLv(n,path);
  }
  return paintLv(n,fb.path);
}
function paintLv(n,path){
  const t=Array.from({length:n},()=>Array(n).fill(1));path.forEach(([x,y])=>t[y][x]=0);
  const [sx,sy]=path[0];
  const stars=pickStars(n,3,new Set([sx+','+sy]),path.slice(1));
  // the finish is wherever the last square gets painted, so the goal sits off the board
  return {t,n,start:{x:sx,y:sy},goal:{x:-9,y:-9},stars,best:path.length-1,cells:path.length};
}
/* --- gravity flip (seen from the side): up and down flip gravity, left and right walk --- */
function gravFall(t,n,x,y,g,goal){
  const path=[];
  for(;;){if(x===goal.x&&y===goal.y)return {x,y,path,win:true};
    const a=x+DV[g][0],b=y+DV[g][1];if(!inB(n,a,b)||t[b][a]===1)return {x,y,path,win:false};
    x=a;y=b;path.push([x,y]);if(t[y][x]===2)return {x,y,path,spike:true};}
}
function gravMove(t,n,x,y,g,d,goal){
  // returns null when nothing happens
  if(d===0||d===2){if(d===g)return null;const r=gravFall(t,n,x,y,d,goal);if(!r.path.length&&!r.win)return Object.assign(r,{g:d});return Object.assign(r,{g:d});}
  const a=x+DV[d][0],b=y+DV[d][1];if(!inB(n,a,b)||t[b][a]===1)return null;
  if(t[b][a]===2)return {x:a,y:b,path:[[a,b]],spike:true,g};
  const r=gravFall(t,n,a,b,g,goal);r.path.unshift([a,b]);return Object.assign(r,{g});
}
function gravSolve(t,n,s,goal,cap){
  const k=s=>s.x+','+s.y+','+s.g,prev=new Map([[k(s),null]]),q=[s],cells=new Set();
  for(let h=0;h<q.length;h++){if(prev.size>(cap||20000))break;const c=q[h];
    for(let d=0;d<4;d++){const r=gravMove(t,n,c.x,c.y,c.g,d,goal);if(!r||r.spike)continue;
      const ns={x:r.x,y:r.y,g:r.g},nk=k(ns);if(prev.has(nk))continue;prev.set(nk,[k(c),d]);r.path.forEach(p=>cells.add(p.join(',')));
      if(r.win){const sol=[];let z=nk;while(prev.get(z)){sol.unshift(prev.get(z)[1]);z=prev.get(z)[0];}return {sol,cells};}
      q.push(ns);}}
  return null;
}
function gravity(cfg){
  const n=cfg.n;let fb=null;
  for(let tries=0;tries<500;tries++){
    const t=Array.from({length:n},()=>Array(n).fill(0));
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(Math.random()<cfg.walls)t[y][x]=1;
    // a few floating platforms make it read like a space station
    for(let i=0;i<cfg.plat;i++){const y=1+rnd(n-2),x0=rnd(n-2),L=2+rnd(3);for(let x=x0;x<Math.min(n,x0+L);x++)t[y][x]=1;}
    const free=shuffle(allCells(n).filter(([x,y])=>!t[y][x]));if(free.length<n*2)continue;
    for(let i=0;i<cfg.spikes;i++){const c=free.pop();t[c[1]][c[0]]=2;}
    const [sx,sy0]=free[0];const s0=gravFall(t,n,sx,sy0,2,{x:-1,y:-1});if(s0.spike)continue;
    const start={x:s0.x,y:s0.y};
    const gc=free.find(([x,y])=>t[y][x]===0&&Math.abs(x-start.x)+Math.abs(y-start.y)>=n-1);if(!gc)continue;
    const goal={x:gc[0],y:gc[1]};
    const R=gravSolve(t,n,{x:start.x,y:start.y,g:2},goal,30000);if(!R)continue;
    const used=new Set([start.x+','+start.y,goal.x+','+goal.y]);
    const stars=pickStars(n,3,used,[...R.cells].map(k=>k.split(',').map(Number)).filter(([x,y])=>t[y][x]===0));
    const lv={t,n,start,goal,stars,best:R.sol.length,sol:R.sol};
    if(R.sol.length>=cfg.min&&stars.length===3)return lv;
    if(stars.length===3&&(!fb||R.sol.length>fb.best))fb=lv;
  }
  return fb;
}

