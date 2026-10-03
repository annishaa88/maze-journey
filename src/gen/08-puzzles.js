/* ================= arcade puzzles: candies in a row, block puzzle ================= */
/* candy board: colours 0..k-1, -1 = cherry that must reach the bottom; no ready-made rows at the start */
function m3Find(b,n){
  const runs=[];
  for(let y=0;y<n;y++){let x=0;while(x<n){const c=b[y][x]?b[y][x].c:null;let e=x+1;if(c!=null&&c>=0)while(e<n&&b[y][e]&&b[y][e].c===c)e++;if(c!=null&&c>=0&&e-x>=3)runs.push({cells:Array.from({length:e-x},(_,i)=>[x+i,y]),dir:'h'});x=e;}}
  for(let x=0;x<n;x++){let y=0;while(y<n){const c=b[y][x]?b[y][x].c:null;let e=y+1;if(c!=null&&c>=0)while(e<n&&b[e][x]&&b[e][x].c===c)e++;if(c!=null&&c>=0&&e-y>=3)runs.push({cells:Array.from({length:e-y},(_,i)=>[x,y+i]),dir:'v'});y=e;}}
  return runs;
}
function m3AnyMove(b,n){
  for(let y=0;y<n;y++)for(let x=0;x<n;x++)for(const [dx,dy] of [[1,0],[0,1]]){const a=x+dx,c=y+dy;if(a>=n||c>=n||!b[y][x]||!b[c][a])continue;
    const P=b[y][x],Q=b[c][a];if(P.lk||Q.lk||P.c===-5||Q.c===-5)continue;
    if(P.sp===3||Q.sp===3||(P.sp&&Q.sp))return [[x,y],[a,c]];
    const t=b[y][x];b[y][x]=b[c][a];b[c][a]=t;const ok=m3Find(b,n).length>0;b[c][a]=b[y][x];b[y][x]=t;if(ok)return [[x,y],[a,c]];}
  return null;
}
function m3Fill(n,k){
  for(let tries=0;tries<200;tries++){
    const b=Array.from({length:n},()=>Array(n).fill(null));
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){let c,g=0;do{c=rnd(k);g++;}while(g<30&&((x>=2&&b[y][x-1].c===c&&b[y][x-2].c===c)||(y>=2&&b[y-1][x].c===c&&b[y-2][x].c===c)));b[y][x]={c,sp:0};}
    if(m3Find(b,n).length===0&&m3AnyMove(b,n))return b;
  }
  return null;
}
function match3(cfg){
  const n=cfg.n,b=m3Fill(n,cfg.colors);
  const jelly=Array.from({length:n},()=>Array(n).fill(0));
  if(cfg.jelly){const cells=shuffle(allCells(n).filter(([x,y])=>y>=Math.floor(n*.35)));cells.slice(0,cfg.jelly).forEach(([x,y])=>jelly[y][x]=1);}
  const drops=[];if(cfg.drops){shuffle(Array.from({length:n},(_,i)=>i)).slice(0,cfg.drops).forEach(x=>{b[Math.floor(n/2)-1][x]={c:-1,sp:0};drops.push(x);});}
  // chocolate blocks sit in the lower part; cages lock some candies
  let choc=0;if(cfg.choc){for(const [x,y] of shuffle(allCells(n).filter(([x,y])=>y>=Math.floor(n/2)&&b[y][x].c>=0))){if(choc>=cfg.choc)break;b[y][x]={c:-5,sp:0};choc++;}}
  let cages=0;if(cfg.cages){for(const [x,y] of shuffle(allCells(n).filter(([x,y])=>b[y][x].c>=0))){if(cages>=cfg.cages)break;b[y][x].lk=1;cages++;}}
  if(!m3AnyMove(b,n))return match3(cfg);
  return {n,b,jelly,start:{x:Math.floor(n/2),y:Math.floor(n/2)},goal:{x:-9,y:-9},stars:[],colors:cfg.colors,spread:!!cfg.spread,
    want:{color:cfg.collect?rnd(cfg.colors):null,collect:cfg.collect||0,jelly:cfg.jelly||0,drops:cfg.drops||0,cages,choc},moves:cfg.moves};
}
/* block puzzle: an 8 x 8 board (with a few blocks already there) and a tray of three shapes below */
const BLOCKS={
  small:[[[0,0]],[[0,0],[1,0]],[[0,0],[0,1]],[[0,0],[1,0],[2,0]],[[0,0],[0,1],[0,2]],[[0,0],[1,0],[0,1]],[[0,0],[1,0],[1,1]],[[0,0],[1,0],[0,1],[1,1]]],
  big:[[[0,0],[1,0],[2,0],[3,0]],[[0,0],[0,1],[0,2],[0,3]],[[0,0],[0,1],[0,2],[1,2]],[[0,0],[1,0],[2,0],[1,1]],[[1,0],[0,1],[1,1],[2,1]],[[0,0],[1,0],[1,1],[2,1]],[[1,0],[2,0],[0,1],[1,1]],[[0,0],[1,0],[2,0],[0,1],[0,2]]],
  huge:[[[0,0],[1,0],[2,0],[3,0],[4,0]],[[0,0],[0,1],[0,2],[0,3],[0,4]],[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]],[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1],[0,2],[1,2],[2,2]]]};
function blocks(cfg){
  const m=8,grid=Array.from({length:m},()=>Array(m).fill(0));
  // a few starting blocks that never make a full line
  for(let y=Math.floor(m/2);y<m;y++)for(let x=0;x<m;x++)if(Math.random()<cfg.fill)grid[y][x]=1+rnd(6);
  for(let y=0;y<m;y++)if(grid[y].every(v=>v))grid[y][rnd(m)]=0;
  for(let x=0;x<m;x++)if(grid.every(r=>r[x]))grid[rnd(m)][x]=0;
  return {n:10,m,grid,start:{x:4,y:4},goal:{x:-9,y:-9},stars:[],lines:cfg.lines,pool:cfg.pool};
}

