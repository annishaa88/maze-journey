/* ================= arcade puzzles: playing ================= */
const PZ=new Set(['match3','match3b','blocks','blockscore']);
const isM3=()=>G&&G.lv&&!!G.lv.b,isBK=()=>G&&G.lv&&!!G.lv.grid;
const M3C=['#ff4d6d','#ff9f1c','#ffd23f','#52b788','#3a86ff','#9d4edd'],M3E=['🔴','🟠','🟡','🟢','🔵','🟣'];
const CHOC=-5;
function pzFresh(lv){
  if(lv.b){const b=lv.b.map(r=>r.map(c=>c?{c:c.c,sp:c.sp,lk:c.lk||0,dy:0,pop:0}:null));
    return {m:{b,jelly:lv.jelly.map(r=>r.slice()),moves:lv.moves,got:{collect:0,jelly:0,drops:0,cages:0,choc:0},phase:'idle',mT:0,sel:null,hint:null,bonus:false,
      idleT:performance.now(),swapA:null,last:0,shake:null,praise:null,combo:0,chocHit:false,sugar:false,flies:0}};}
  if(lv.grid){return {k:{grid:lv.grid.map(r=>r.slice()),tray:[],pick:0,ghost:{x:3,y:3},cleared:0,helps:0,drag:null,flash:[],popT:0,placed:0,
    score:0,streak:0,land:[],praise:null,best:load('journey_blockbest',0),over:false}};}
  return {};
}
function pzPraise(text,big){const o={text,t0:performance.now(),big:!!big};if(isM3())G.m.praise=o;else if(isBK())G.k.praise=o;}
/* ---------- candies in a row ---------- */
function m3Cell(x,y){const m=G.m,n=G.lv.n;return x>=0&&y>=0&&x<n&&y<n?m.b[y][x]:null;}
const m3Movable=c=>c&&!c.lk&&c.c!==CHOC;
function m3Offset(c,dx,dy){c.ox0=dx;c.oy0=dy;c.oT0=performance.now();}
function m3Swap(a,b){
  const m=G.m,n=G.lv.n;if(m.phase!=='idle'||G.done)return;
  if(!(Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])===1))return;
  const A=m3Cell(...a),B=m3Cell(...b);
  if(!A||!B)return;
  if(!m3Movable(A)||!m3Movable(B)){beep(160,.1,'square');arcSay(A&&A.lk||B&&B.lk?'הסוכרייה נעולה 🔒 שורה של 3 דרכה תשבור את המנעול':'את השוקולד 🍫 לא מזיזים. שורה לידו ממיסה אותו');return;}
  if(A.c===-1&&B.c===-1)return;
  m.sel=null;m.hint=null;m.idleT=performance.now();m.chocHit=false;m.combo=0;
  m.b[a[1]][a[0]]=B;m.b[b[1]][b[0]]=A;m3Offset(B,b[0]-a[0],b[1]-a[1]);m3Offset(A,a[0]-b[0],a[1]-b[1]);beep(520,.04,'sine');
  const special=(A.sp&&B.sp)||A.sp===3||B.sp===3;
  if(!special&&!GEN.m3Find(m.b,n).length){m.phase='swapback';m.mT=performance.now();m.swapA=[a,b];return;}
  m.moves--;m.swapA=[a,b];m.phase='swapgo';m.mT=performance.now();updateHud();
}
function m3AfterSwap(){
  const m=G.m,n=G.lv.n,[a,b]=m.swapA,A=m3Cell(...b),B=m3Cell(...a);   // A moved to b, B moved to a
  const both=A.sp&&B.sp,hasBomb=A.sp===3||B.sp===3;
  if(hasBomb||both){m3Combo(a,b,B,A);return;}
  m3Resolve(GEN.m3Find(m.b,n));
}
// two special candies swapped together make something bigger
function m3Combo(pa,pb,P,Q){
  const m=G.m,n=G.lv.n,clr=new Set(),add=(x,y)=>{if(x>=0&&y>=0&&x<n&&y<n)clr.add(x+','+y);};
  const s1=P.sp,s2=Q.sp,[x,y]=pb,st=s=>s===1||s===2;
  if(s1===3&&s2===3){P.sp=Q.sp=0;for(let yy=0;yy<n;yy++)for(let xx=0;xx<n;xx++)add(xx,yy);pzPraise('🌈 פיצוץ ענק!',true);}
  else if(s1===3||s2===3){const other=s1===3?Q:P,col=other.c;(s1===3?P:Q).sp=0;add(...pa);add(...pb);
    for(let yy=0;yy<n;yy++)for(let xx=0;xx<n;xx++){const c=m.b[yy][xx];if(c&&c.c===col&&!c.lk){if(st(other.sp)||other.sp===4){c.sp=other.sp===4?4:(Math.random()<.5?1:2);}add(xx,yy);}}
    pzPraise(other.sp?'💥 בּוּם צבעוני!':'🍫 פצצת שוקולד!',true);}
  else if(st(s1)&&st(s2)){for(let i=0;i<n;i++){add(i,y);add(x,i);}P.sp=Q.sp=0;pzPraise('✨ פסים כפולים!',true);}
  else if((st(s1)&&s2===4)||(s1===4&&st(s2))){for(let i=0;i<n;i++)for(let d=-1;d<=1;d++){add(i,y+d);add(x+d,i);}P.sp=Q.sp=0;pzPraise('🌟 צלב ענק!',true);}
  else if(s1===4&&s2===4){for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)add(x+dx,y+dy);P.sp=Q.sp=0;pzPraise('🎁 פיצוץ כפול!',true);}
  [523,784,1047,1319,1568].forEach((f,i)=>setTimeout(()=>beep(f,.08,'sine'),i*55));
  m.combo=1;m3Clear(clr,[]);
}
function m3Resolve(runs){
  const m=G.m,n=G.lv.n,clr=new Set(),make=[],inH=new Map(),inV=new Map();
  runs.forEach(r=>r.cells.forEach(c=>{(r.dir==='h'?inH:inV).set(c.join(),r);clr.add(c.join());}));
  const used=new Set();
  // an L or T shape (a candy in both a row and a column) makes a wrapped candy
  inH.forEach((rh,k)=>{if(!inV.has(k)||used.has(rh)||used.has(inV.get(k)))return;const rv=inV.get(k),at=k.split(',').map(Number);used.add(rh);used.add(rv);
    if(rh.cells.length>=5||rv.cells.length>=5)make.push({at,sp:3,c:-2});else make.push({at,sp:4,c:m.b[at[1]][at[0]].c});});
  runs.forEach(r=>{if(used.has(r)||r.cells.length<4)return;
    const at=r.cells.find(c=>m.swapA&&m.swapA.some(s=>s[0]===c[0]&&s[1]===c[1]))||r.cells[Math.floor(r.cells.length/2)];
    const col=m.b[at[1]][at[0]].c;make.push({at,sp:r.cells.length>=5?3:(r.dir==='h'?2:1),c:r.cells.length>=5?-2:col});});
  m.combo=(m.combo||0)+1;
  const words=['','','מתוק! 🍬','טעים! 😋','מדהים! 🌟','סוכר-על! 🎉'];if(m.combo>=2)pzPraise(words[Math.min(5,m.combo)],m.combo>=4);
  else if(make.some(q=>q.sp===3))pzPraise('🍫 פצצת שוקולד!');else if(make.some(q=>q.sp===4))pzPraise('🎁 סוכרייה עטופה!');else if(make.length)pzPraise('✨ סוכריית פסים!');
  beep(480+m.combo*110,.08,'sine');m3Clear(clr,make);
}
function m3Clear(clr,make){
  const m=G.m,n=G.lv.n,lv=G.lv;
  const keep=new Set(make.map(q=>q.at.join()));
  // specials inside the blast go off too: stripes clear a line, wrapped clears around itself, bombs clear a colour
  let grew=true;while(grew){grew=false;[...clr].forEach(k=>{const [x,y]=k.split(',').map(Number),c=m.b[y][x];if(!c||c.done||keep.has(k))return;c.done=true;
    const add=(a,b)=>{const kk=a+','+b;if(a<0||b<0||a>=n||b>=n||clr.has(kk))return;const cc=m.b[b][a];if(!cc||cc.c===-1)return;clr.add(kk);grew=true;};
    if(c.sp===1||c.sp===2){for(let i=0;i<n;i++)c.sp===2?add(i,y):add(x,i);sparkle(x,y,['#ffffff'],6);}
    if(c.sp===4){for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)add(x+dx,y+dy);sparkle(x,y,['#ffd23f','#ffffff'],8);}
    if(c.sp===3&&!c.lk){const cols={};for(const row of m.b)for(const q of row)if(q&&q.c>=0)cols[q.c]=(cols[q.c]||0)+1;const col=+Object.keys(cols).sort((p,q)=>cols[q]-cols[p])[0];
      for(let b=0;b<n;b++)for(let a=0;a<n;a++)if(m.b[b][a]&&m.b[b][a].c===col)add(a,b);}});}
  let flies=0;const chocNear=new Set();
  clr.forEach(k=>{const [x,y]=k.split(',').map(Number),c=m.b[y][x];if(!c)return;delete c.done;
    if(c.c===CHOC){c.pop=1;m.got.choc++;m.chocHit=true;sparkle(x,y,['#6f4518','#d4a373'],8);if(flies++<5)m3Fly(x,y,'🍫','choc');return;}
    if(lv.jelly&&m.jelly[y][x]){m.jelly[y][x]=0;m.got.jelly++;if(flies++<5)m3Fly(x,y,'🟪','jelly');}
    if(keep.has(k))return;
    if(c.lk){c.lk=0;m.got.cages++;sparkle(x,y,['#adb5bd','#ffffff'],6);if(flies++<5)m3Fly(x,y,'🔓','cages');return;}
    if(c.c===-1)return;
    if(c.c===lv.want.color){m.got.collect++;if(flies++<6)m3Fly(x,y,M3E[c.c],'collect');}
    c.pop=1;sparkle(x,y,[M3C[c.c]||'#ffffff'],3);
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{const q=m3Cell(x+dx,y+dy);if(q&&q.c===CHOC&&!clr.has((x+dx)+','+(y+dy)))chocNear.add((x+dx)+','+(y+dy));});});
  // chocolate next to a match melts
  chocNear.forEach(k=>{const [x,y]=k.split(',').map(Number),q=m.b[y][x];if(q&&!q.pop){q.pop=1;m.got.choc++;m.chocHit=true;sparkle(x,y,['#6f4518','#d4a373'],8);if(flies++<8)m3Fly(x,y,'🍫','choc');}});
  make.forEach(q=>{const c=m.b[q.at[1]][q.at[0]];if(c.lk){m.got.cages++;sparkle(q.at[0],q.at[1],['#adb5bd','#ffffff'],6);}c.sp=q.sp;c.c=q.c;c.pop=0;c.lk=0;c.born=performance.now();});
  m.phase='pop';m.mT=performance.now();updateHud();
}
// collected pieces fly up to their goal in the top bar
function m3Fly(x,y,emo,key){
  if(calmFx())return;const chip=document.querySelector('#hud [data-k="'+key+'"]');if(!chip)return;
  const r=cv.getBoundingClientRect(),cs=r.width/G.lv.n,t=chip.getBoundingClientRect();
  const f=document.createElement('span');f.className='fly';f.textContent=emo;const sx=r.left+(x+.5)*cs-14,sy=r.top+(y+.5)*cs-14;f.style.left=sx+'px';f.style.top=sy+'px';document.body.appendChild(f);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{f.style.transform='translate('+(t.left+t.width/2-14-sx)+'px,'+(t.top+t.height/2-14-sy)+'px) scale(.5)';f.style.opacity='.3';}));
  setTimeout(()=>{f.remove();chip.classList.remove('bump');void chip.offsetWidth;chip.classList.add('bump');},620);
}
function m3Fall(){
  const m=G.m,n=G.lv.n,now=performance.now();
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const c=m.b[y][x];if(c&&c.pop)m.b[y][x]=null;}
  // candies fall inside each stretch of a column; chocolate stays put and holds up what is above it
  for(let x=0;x<n;x++){let y=n-1;
    while(y>=0){if(m.b[y][x]&&m.b[y][x].c===CHOC){y--;continue;}
      let bot=y;while(y>=0&&!(m.b[y][x]&&m.b[y][x].c===CHOC))y--;const top=y+1;
      let w=bot;for(let yy=bot;yy>=top;yy--){const c=m.b[yy][x];if(c){if(w!==yy){m.b[w][x]=c;c.dy-=(w-yy);m.b[yy][x]=null;}w--;}}
      if(top===0)for(let yy=w;yy>=0;yy--)m.b[yy][x]={c:rndi(G.lv.colors),sp:0,lk:0,dy:-(w+1),pop:0};}}
  m.phase='fall';
}
function m3Spread(){
  const m=G.m,n=G.lv.n,opts=[];
  for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(m.b[y][x]&&m.b[y][x].c===CHOC)[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{const q=m3Cell(x+dx,y+dy);if(q&&q.c>=0&&!q.sp&&!q.lk)opts.push([x+dx,y+dy]);});
  if(!opts.length)return;const [x,y]=opts[rndi(opts.length)];m.b[y][x]={c:CHOC,sp:0,lk:0,dy:0,pop:0,born:performance.now()};beep(200,.15,'triangle');arcSay('השוקולד גדל! 🍫 שורה לידו ממיסה אותו');
}
function m3Done(){const w=G.lv.want,g=G.m.got;return g.collect>=w.collect&&g.jelly>=w.jelly&&g.drops>=w.drops&&g.cages>=(w.cages||0)&&g.choc>=(w.choc||0);}
function m3Settle(){
  const m=G.m,n=G.lv.n,lv=G.lv;
  // cherries that reach the bottom are collected
  let dropped=false;for(let x=0;x<n;x++){const c=m.b[n-1][x];if(c&&c.c===-1){c.pop=1;m.got.drops++;dropped=true;sparkle(x,n-1,['#e63946','#ffffff'],10);beep(880,.1,'sine');m3Fly(x,n-1,'🍒','drops');}}
  if(dropped){updateHud();m.phase='pop';m.mT=performance.now();return;}
  const runs=GEN.m3Find(m.b,n);if(runs.length){m.swapA=null;m3Resolve(runs);return;}
  if(m.sugar){m3SugarStep();return;}
  m.phase='idle';m.idleT=performance.now();
  if(m3Done()){
    const frac=m.moves/lv.moves;G.got=m.bonus?1:frac>=.35?3:frac>=.15?2:1;G.stars=new Set();
    // sugar rush: every move left becomes a striped candy that goes off
    if(m.moves>0&&!calmFx()){m.sugar=true;m.sugarLeft=Math.min(m.moves,10);pzPraise('🍭 סוכר-על!',true);[523,659,784,1047,1319].forEach((f,i)=>setTimeout(()=>beep(f,.1,'sine'),i*70));m3SugarStep();return;}
    toast('כל הכבוד! 🍬 נשארו '+m.moves+' מהלכים');win();return;}
  if(lv.spread&&!m.chocHit&&m.swapA!=='spread'){m3Spread();m.swapA='spread';}
  if(m.moves<=0){
    if(!m.bonus){m.bonus=true;m.moves=5;toast('נגמרו המהלכים… הנה עוד 5 במתנה! 🎁');updateHud();}
    else{const g0=G;toast('נגמרו המהלכים 🍬 מתחילים שוב');setTimeout(()=>{if(G===g0&&!G.done)document.getElementById('retry').click();},1400);}
    return;}
  if(!GEN.m3AnyMove(m.b,n)){m3Shuffle();toast('אין מהלכים, מערבבים! 🔀');}
}
function m3SugarStep(){
  const m=G.m,n=G.lv.n;
  if(m.sugarLeft>0){const plain=[];for(let y=0;y<n;y++)for(let x=0;x<n;x++){const c=m.b[y][x];if(c&&c.c>=0&&!c.sp&&!c.lk)plain.push([x,y]);}
    const pick=pzShuffle(plain).slice(0,m.sugarLeft);pick.forEach(([x,y])=>{const c=m.b[y][x];c.sp=Math.random()<.5?1:2;c.born=performance.now();sparkle(x,y,['#ffd23f'],4);});
    m.moves=Math.max(0,m.moves-m.sugarLeft);m.sugarLeft=0;updateHud();m.phase='sugarwait';m.mT=performance.now();return;}
  const clr=new Set();for(let y=0;y<n;y++)for(let x=0;x<n;x++){const c=m.b[y][x];if(c&&c.sp&&c.sp!==3)clr.add(x+','+y);}
  if(clr.size){m.combo=1;m3Clear(clr,[]);return;}
  m.sugar=false;m.phase='idle';toast('כל הכבוד! 🍬 סוכר-על!');win();
}
function m3Shuffle(){const m=G.m,n=G.lv.n,ok=c=>c&&c.c>=0&&!c.sp&&!c.lk;for(let t=0;t<100;t++){const all=[];for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(ok(m.b[y][x]))all.push(m.b[y][x].c);pzShuffle(all);let i=0;
  for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(ok(m.b[y][x]))m.b[y][x].c=all[i++];if(!GEN.m3Find(m.b,n).length&&GEN.m3AnyMove(m.b,n))return;}}
function pzShuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function m3Tick(now){
  const m=G.m;const dt=Math.min(50,now-(m.last||now));m.last=now;
  if(m.phase==='swapgo'&&now-m.mT>170){m.phase='busy';m3AfterSwap();}
  else if(m.phase==='swapback'&&now-m.mT>170){const [a,b]=m.swapA,A=m3Cell(...b),B=m3Cell(...a);m.b[a[1]][a[0]]=A;m.b[b[1]][b[0]]=B;m3Offset(A,b[0]-a[0],b[1]-a[1]);m3Offset(B,a[0]-b[0],a[1]-b[1]);
    beep(160,.1,'square');arcSay('אין כאן שורה של 3 🙂 נסי החלפה אחרת');m.phase='swapret';m.mT=now;}
  else if(m.phase==='swapret'&&now-m.mT>170){m.phase='idle';m.idleT=now;}
  else if(m.phase==='sugarwait'&&now-m.mT>500){m.phase='busy';m3SugarStep();}
  else if(m.phase==='pop'&&now-m.mT>230)m3Fall();
  else if(m.phase==='fall'){let moving=false;for(const row of m.b)for(const c of row)if(c&&c.dy<0){c.dy=Math.min(0,c.dy+dt*.013);if(c.dy===0)c.land=now;moving=true;}if(!moving)m3Settle();}
  if(m.phase==='idle'&&!m.hint&&now-m.idleT>7000){const mv=GEN.m3AnyMove(m.b,G.lv.n);if(mv)m.hint={cells:mv,t0:now};}
}
/* ---------- block puzzle ---------- */
const BKC=['#ffffff','#ff595e','#ffca3a','#8ac926','#1982c4','#6a4c93','#ff924c'];
function bkDeal(){const k=G.k,pool=G.lv.pool==='small'?BLOCKS_SMALL():G.lv.pool==='big'?BLOCKS_SMALL().concat(BLOCKS_BIG()):BLOCKS_SMALL().concat(BLOCKS_BIG(),BLOCKS_HUGE());
  for(let t=0;t<40;t++){k.tray=[0,1,2].map(()=>({cells:pool[Math.floor(Math.random()*pool.length)],col:1+Math.floor(Math.random()*6),used:false}));if(k.tray.some(p=>bkFitsAny(p)))break;}
  k.pick=0;bkGhostReset();}
function BLOCKS_SMALL(){return GEN.BLOCKS.small;}function BLOCKS_BIG(){return GEN.BLOCKS.big;}function BLOCKS_HUGE(){return GEN.BLOCKS.huge;}
function bkFits(p,ox,oy){const k=G.k,m=G.lv.m;return p.cells.every(([x,y])=>{const a=ox+x,b=oy+y;return a>=0&&b>=0&&a<m&&b<m&&!k.grid[b][a];});}
function bkFitsAny(p){const m=G.lv.m;let q={cells:p.cells};for(let r=0;r<4;r++){for(let y=0;y<m;y++)for(let x=0;x<m;x++)if(bkFits(q,x,y))return true;q={cells:bkTurn(q.cells)};}return false;}
function bkFitsNow(p){const m=G.lv.m;for(let y=0;y<m;y++)for(let x=0;x<m;x++)if(bkFits(p,x,y))return true;return false;}
// turn a shape a quarter turn clockwise
function bkTurn(cells){const h=Math.max(...cells.map(c=>c[1]))+1;return cells.map(([x,y])=>[h-1-y,x]);}
function bkRotate(){const k=G.k,p=bkCur();if(!p||G.done)return;p.cells=bkTurn(p.cells);const m=G.lv.m,w=Math.max(...p.cells.map(c=>c[0]))+1,h=Math.max(...p.cells.map(c=>c[1]))+1;
  k.ghost={x:Math.max(0,Math.min(m-w,k.ghost.x)),y:Math.max(0,Math.min(m-h,k.ghost.y))};k.turnT=performance.now();beep(760,.05,'sine');setTimeout(()=>beep(980,.05,'sine'),50);}
function bkCur(){const k=G.k;return k.tray[k.pick]&&!k.tray[k.pick].used?k.tray[k.pick]:null;}
function bkGhostReset(){const k=G.k,p=bkCur();if(!p)return;const m=G.lv.m;for(let y=0;y<m;y++)for(let x=0;x<m;x++)if(bkFits(p,x,y)){k.ghost={x,y};return;}k.ghost={x:2,y:2};}
function bkNextPick(){const k=G.k;for(let i=1;i<=3;i++){const j=(k.pick+i)%3;if(!k.tray[j].used){k.pick=j;bkGhostReset();return;}}}
function bkPlace(){
  const k=G.k,lv=G.lv,m=lv.m,p=bkCur();if(!p||G.done||k.over)return;
  if(!bkFits(p,k.ghost.x,k.ghost.y)){beep(160,.12,'square');arcSay('לא נכנס כאן 🙂 הזיזי את הצורה');return;}
  const now=performance.now();p.cells.forEach(([x,y])=>{k.grid[k.ghost.y+y][k.ghost.x+x]=p.col;k.land.push({x:k.ghost.x+x,y:k.ghost.y+y,t0:now});});p.used=true;k.placed++;beep(300,.07,'square');buzz(10);
  k.score+=p.cells.length;
  const rows=[],cols=[];for(let y=0;y<m;y++)if(k.grid[y].every(v=>v))rows.push(y);for(let x=0;x<m;x++)if(k.grid.every(r=>r[x]))cols.push(x);
  const lines=rows.length+cols.length;
  if(lines){k.flash=[];rows.forEach(y=>{for(let x=0;x<m;x++)k.flash.push([x,y,k.grid[y][x]]);});cols.forEach(x=>{for(let y=0;y<m;y++)k.flash.push([x,y,k.grid[y][x]]);});
    rows.forEach(y=>k.grid[y].fill(0));cols.forEach(x=>k.grid.forEach(r=>r[x]=0));k.popT=now;k.cleared+=lines;k.streak++;
    // points: every block, more for several lines at once, more again for a streak, a big bonus for an empty board
    let pts=k.flash.length*10+(lines>1?lines*lines*20:0)+(k.streak>1?k.streak*10*lines:0);const empty=k.grid.every(r=>r.every(v=>!v));if(empty)pts+=300;k.score+=pts;
    [600,800,1000,1200,1400].slice(0,lines+1).forEach((f,i)=>setTimeout(()=>beep(f,.09,'sine'),i*70));
    k.flash.forEach(([x,y,c],i)=>{if(i%2===0)sparkle(x+1,y,[BKC[c],'#ffffff'],3);});
    pzPraise(empty?'✨ לוח נקי! +300':lines>=4?'לא ייאמן! 🤩':lines===3?'מדהים! 🌟':lines===2?'מעולה! 🎉':k.streak>=3?'🔥 רצף ×'+k.streak:'יופי! ✨',lines>=3||empty);
    k.lastPts={v:pts,t0:now};}
  else if(k.streak){k.streak=0;}
  if(lv.target&&k.score>k.best){k.best=k.score;save('journey_blockbest',k.score);if(!k.newBest){k.newBest=true;if(load('journey_blockbest',0)>0&&k.placed>3)toast('שיא חדש! 🏆');}}
  const goalDone=lv.target?k.score>=lv.target:k.cleared>=lv.lines;
  if(goalDone){G.got=lv.target?3:Math.max(1,3-k.helps);G.stars=new Set();updateHud();setTimeout(()=>{if(G&&isBK()&&!G.done)win();},450);return;}
  if(k.tray.every(q=>q.used))bkDeal();else bkNextPick();
  if(!k.tray.some(q=>!q.used&&bkFitsAny(q))){
    if(lv.target){k.over=true;const need=lv.target-k.score;beep(220,.3,'triangle');
      toast(need<=lv.target*.25?'כמעט! 😮 חסרו רק '+need+' נקודות':'אין מקום! הגעת ל־'+k.score+' נקודות. עוד ניסיון? 💪');
      const g0=G;setTimeout(()=>{if(G===g0&&!G.done)document.getElementById('retry').click();},2600);updateHud();return;}
    // stuck: a magic broom sweeps the fullest rows (costs a star)
    k.helps++;const order=Array.from({length:m},(_,y)=>y).sort((a,b)=>k.grid[b].filter(Boolean).length-k.grid[a].filter(Boolean).length).slice(0,3);
    order.forEach(y=>k.grid[y].fill(0));toast('אין מקום! 🧹 מטאטא קסם ניקה קצת מקום');beep(300,.2,'triangle');
    if(!k.tray.some(q=>!q.used&&bkFitsAny(q)))bkDeal();else bkGhostReset();}
  updateHud();
}
/* ---------- shared: arrows, button, touch ---------- */
function pzMove(d){
  if(isM3()){const m=G.m,n=G.lv.n;if(m.phase!=='idle')return;
    if(m.sel){const b=[m.sel[0]+DV[d][0],m.sel[1]+DV[d][1]];m3Swap(m.sel,b);m.sel=null;return;}
    const nx=G.p.x+DV[d][0],ny=G.p.y+DV[d][1];if(nx<0||ny<0||nx>=n||ny>=n){bumpWall(d);return;}G.p={x:nx,y:ny};beep(600,.02,'sine');return;}
  if(isBK()){const k=G.k,p=bkCur();if(!p)return;const m=G.lv.m,w=Math.max(...p.cells.map(c=>c[0]))+1,h=Math.max(...p.cells.map(c=>c[1]))+1;
    const nx=k.ghost.x+DV[d][0],ny=k.ghost.y+DV[d][1];if(nx<0||ny<0||nx+w>m||ny+h>m){bumpWall(d);return;}k.ghost={x:nx,y:ny};beep(600,.02,'sine');}
}
function pzAction(){
  if(!G||G.done)return;
  if(isM3()){const m=G.m;if(m.phase!=='idle')return;m.sel=m.sel?null:[G.p.x,G.p.y];beep(m.sel?800:500,.06,'sine');if(m.sel)arcSay('עכשיו חץ לכיוון ההחלפה ↔️');}
  if(isBK())bkPlace();
}
function pzHint(){
  if(!G||G.done)return false;
  if(isM3()){const mv=GEN.m3AnyMove(G.m.b,G.lv.n);if(mv)G.m.hint={cells:mv,t0:performance.now()};return true;}
  if(isBK()){const k=G.k,m=G.lv.m;for(let r=0;r<4;r++)for(let i=0;i<3;i++){const p=k.tray[i];if(p.used)continue;let q={cells:p.cells};for(let t=0;t<r;t++)q={cells:bkTurn(q.cells)};for(let y=0;y<m;y++)for(let x=0;x<m;x++)if(bkFits(q,x,y)){p.cells=q.cells;k.pick=i;k.ghost={x,y};toast(r?'סובבתי אותה בשבילך. אפשר לשים כאן 👇':'אפשר לשים אותה כאן 👇');return true;}}return true;}
  return false;
}
let pzDown=null;
function pzPointer(type,e){
  const r=cv.getBoundingClientRect(),cs=r.width/G.lv.n,fx=(e.clientX-r.left)/cs,fy=(e.clientY-r.top)/cs;
  if(isM3()){const m=G.m,n=G.lv.n;
    if(type==='down'){pzDown={x:Math.floor(fx),y:Math.floor(fy),sx:e.clientX,sy:e.clientY,done:false};return;}
    if(!pzDown)return;
    if(type==='move'&&!pzDown.done){const dx=e.clientX-pzDown.sx,dy=e.clientY-pzDown.sy;if(Math.max(Math.abs(dx),Math.abs(dy))>cs*.4){pzDown.done=true;
      const d=Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0);G.p={x:pzDown.x,y:pzDown.y};m3Swap([pzDown.x,pzDown.y],[pzDown.x+DV[d][0],pzDown.y+DV[d][1]]);}return;}
    if(type==='up'){if(!pzDown.done&&pzDown.x>=0&&pzDown.y>=0&&pzDown.x<n&&pzDown.y<n){const c=[pzDown.x,pzDown.y];
        if(m.sel&&Math.abs(m.sel[0]-c[0])+Math.abs(m.sel[1]-c[1])===1){m3Swap(m.sel,c);}else{m.sel=(m.sel&&m.sel[0]===c[0]&&m.sel[1]===c[1])?null:c;G.p={x:c[0],y:c[1]};beep(700,.04,'sine');}}
      pzDown=null;}return;}
  if(isBK()){const k=G.k,m=G.lv.m;
    if(type==='down'){
      if(fy>=m+.1){const i=Math.min(2,Math.floor((fx-.5)/3));if(i>=0&&k.tray[i]&&!k.tray[i].used){k.tapTurn=k.pick===i;k.pick=i;k.drag={on:true};beep(700,.04,'sine');}}
      else{const p=bkCur();if(p){k.drag={on:true,board:true};}}
      pzDown={x:fx,y:fy};}
    if(type==='move'&&k.drag&&k.drag.on){const p=bkCur();if(!p)return;const w=Math.max(...p.cells.map(c=>c[0]))+1,h=Math.max(...p.cells.map(c=>c[1]))+1;
      // the shape floats a little above the finger so she can see where it goes
      const gx=Math.round(fx-1-w/2),gy=Math.round(fy-(k.drag.board?0:1.6)-h/2);k.ghost={x:Math.max(0,Math.min(m-w,gx)),y:Math.max(0,Math.min(m-h,gy))};k.drag.moved=true;}
    if(type==='up'){if(k.drag&&k.drag.moved)bkPlace();else if(k.drag&&!k.drag.board&&k.tapTurn)bkRotate();else if(k.drag&&!k.drag.board)arcSay('גררי את הצורה ללוח. נגיעה נוספת מסובבת אותה 🔄');k.drag=null;pzDown=null;k.tapTurn=false;}
  }
}
function pzHud(add){
  if(isM3()){const m=G.m,w=G.lv.want;const s=add('👆 '+m.moves);if(m.moves<=3){s.style.background='#ffd6d6';s.style.color='#2a2140';}
    const g=(k,txt)=>{const c=add(txt);c.dataset.k=k;};
    if(w.collect)g('collect',M3E[w.color]+' '+Math.min(m.got.collect,w.collect)+'/'+w.collect);if(w.jelly)g('jelly','🟪 '+Math.min(m.got.jelly,w.jelly)+'/'+w.jelly);
    if(w.cages)g('cages','🔒 '+Math.min(m.got.cages,w.cages)+'/'+w.cages);if(w.choc)g('choc','🍫 '+Math.min(m.got.choc,w.choc)+'/'+w.choc);if(w.drops)g('drops','🍒 '+m.got.drops+'/'+w.drops);}
  if(isBK()){const k=G.k;if(G.lv.target){add('⭐ '+k.score+'/'+G.lv.target);add('🏆 '+Math.max(k.best,k.score));}else{add('🧩 '+Math.min(k.cleared,G.lv.lines)+'/'+G.lv.lines);add('⭐ '+k.score);}
    if(k.streak>1){const s=add('🔥 ×'+k.streak);s.style.background='#ffe5d9';s.style.color='#2a2140';}}
}
function drawCandy(c,x,y,r,col,sp,now){
  if(col===-1){c.strokeStyle='#2d6a4f';c.lineWidth=Math.max(1,r*.12);c.beginPath();c.moveTo(x-r*.25,y-r*.1);c.quadraticCurveTo(x,y-r*.9,x+r*.3,y-r*.15);c.stroke();circle(c,x-r*.3,y+r*.15,r*.42,'#d00000');circle(c,x+r*.32,y+r*.2,r*.42,'#e63946');circle(c,x-r*.42,y,r*.12,'#ffb3c1');return;}
  if(col===CHOC){c.fillStyle='#6f4518';rrect(c,x-r*.95,y-r*.95,r*1.9,r*1.9,r*.25);c.fill();c.fillStyle='#8d5524';for(let i=0;i<2;i++)for(let j=0;j<2;j++){rrect(c,x-r*.82+i*r*.86,y-r*.82+j*r*.86,r*.74,r*.74,r*.12);c.fill();}return;}
  if(sp===3){circle(c,x,y,r*.85,'#6f4518');circle(c,x-r*.2,y-r*.25,r*.25,'#8d5524');['#ff595e','#ffca3a','#8ac926','#1982c4','#ffffff','#c77dff'].forEach((cc,i)=>{const a=i*1.05+(now||0)/900;c.fillStyle=cc;c.fillRect(x+Math.cos(a)*r*.5-r*.07,y+Math.sin(a)*r*.5-r*.04,r*.14,r*.08);});return;}
  const C=M3C[col];c.fillStyle=C;c.beginPath();
  if(col===0){c.moveTo(x,y+r*.75);c.bezierCurveTo(x-r*1.1,y,x-r*.5,y-r*.95,x,y-r*.35);c.bezierCurveTo(x+r*.5,y-r*.95,x+r*1.1,y,x,y+r*.75);}
  else if(col===1){rrect(c,x-r*.7,y-r*.7,r*1.4,r*1.4,r*.3);}
  else if(col===2){for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.42:r*.9;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.closePath();}
  else if(col===3){c.moveTo(x,y-r*.85);c.lineTo(x+r*.75,y);c.lineTo(x,y+r*.85);c.lineTo(x-r*.75,y);c.closePath();}
  else if(col===4){c.moveTo(x,y-r*.9);c.quadraticCurveTo(x+r*.85,y+r*.1,x,y+r*.8);c.quadraticCurveTo(x-r*.85,y+r*.1,x,y-r*.9);}
  else{for(let i=0;i<6;i++){const a=i*Math.PI/3;c.lineTo(x+Math.cos(a)*r*.8,y+Math.sin(a)*r*.8);}c.closePath();}
  c.fill();c.fillStyle='rgba(255,255,255,.45)';c.beginPath();c.ellipse(x-r*.22,y-r*.28,r*.22,r*.12,-.6,0,7);c.fill();
  if(sp===4){c.strokeStyle='#ffffff';c.lineWidth=Math.max(2,r*.16);c.beginPath();c.moveTo(x-r*.85,y);c.lineTo(x+r*.85,y);c.moveTo(x,y-r*.85);c.lineTo(x,y+r*.85);c.stroke();c.fillStyle=C;c.beginPath();c.moveTo(x-r*.85,y-r*.3);c.lineTo(x-r*1.15,y-r*.55);c.lineTo(x-r*1.15,y-r*.05);c.fill();c.beginPath();c.moveTo(x+r*.85,y-r*.3);c.lineTo(x+r*1.15,y-r*.55);c.lineTo(x+r*1.15,y-r*.05);c.fill();}
  if(sp===1||sp===2){c.save();c.beginPath();c.arc(x,y,r*.8,0,7);c.clip();c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=Math.max(1,r*.14);c.beginPath();
    for(let i=-2;i<=2;i++){if(sp===2){c.moveTo(x-r,y+i*r*.35);c.lineTo(x+r,y+i*r*.35);}else{c.moveTo(x+i*r*.35,y-r);c.lineTo(x+i*r*.35,y+r);}}c.stroke();c.restore();}
}
function pzDraw(s,n,W,now){
  ctx.textAlign='center';ctx.textBaseline='middle';
  if(isM3()){const m=G.m;
    const gr=ctx.createLinearGradient(0,0,0,W);gr.addColorStop(0,'#ffe5ec');gr.addColorStop(1,'#ffc2d1');ctx.fillStyle=gr;ctx.fillRect(0,0,W,W);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){ctx.fillStyle=(x+y)%2?'rgba(255,255,255,.55)':'rgba(255,255,255,.35)';rrect(ctx,x*s+s*.04,y*s+s*.04,s*.92,s*.92,s*.16);ctx.fill();
      if(m.jelly[y][x]){ctx.fillStyle='rgba(199,125,255,.45)';rrect(ctx,x*s+s*.06,y*s+s*.06,s*.88,s*.88,s*.18);ctx.fill();}}
    if(G.lv.want.drops){ctx.fillStyle='rgba(230,57,70,.18)';ctx.fillRect(0,(n-.12)*s,W,s*.12);}
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){const c=m.b[y][x];if(!c)continue;
      let ox=0,oy=0;if(c.oT0!=null){const e=Math.min(1,(now-c.oT0)/170);ox=c.ox0*(1-e);oy=c.oy0*(1-e);if(e>=1)c.oT0=null;}
      let cx=(x+.5+ox)*s,cy=(y+.5+oy+c.dy)*s,r=s*.38,sy=1,sx=1;
      if(c.land&&now-c.land<200){const e=(now-c.land)/200;sy=1-.18*Math.sin(e*Math.PI);sx=1+.1*Math.sin(e*Math.PI);}
      if(c.born&&now-c.born<350){const e=(now-c.born)/350;sx*=1+.35*Math.sin(e*Math.PI);sy*=1+.35*Math.sin(e*Math.PI);}
      if(c.pop){const e=Math.min(1,(now-m.mT)/230);r*=1+e*.4;ctx.globalAlpha=1-e;}
      if(m.hint&&m.hint.cells.some(q=>q[0]===x&&q[1]===y)){ctx.globalAlpha=.4+.3*Math.sin(now/150);circle(ctx,cx,cy,s*.48,'#ffffff');ctx.globalAlpha=c.pop?ctx.globalAlpha:1;}
      ctx.save();ctx.translate(cx,cy+r*(1-sy));ctx.scale(sx,sy);drawCandy(ctx,0,0,r,c.c,c.sp,now);ctx.restore();
      if(c.lk){ctx.strokeStyle='#495057';ctx.lineWidth=Math.max(2,s*.07);ctx.beginPath();for(let i=-1;i<=1;i++){ctx.moveTo(cx+i*s*.22,cy-s*.42);ctx.lineTo(cx+i*s*.22,cy+s*.42);}ctx.moveTo(cx-s*.42,cy);ctx.lineTo(cx+s*.42,cy);ctx.stroke();ctx.font=Math.round(s*.26)+'px sans-serif';ctx.fillText('🔒',cx+s*.28,cy-s*.28);}
      ctx.globalAlpha=1;}
    // the cursor (arrows) and the chosen candy
    const X=G.p.x*s,Y=G.p.y*s;ctx.strokeStyle='#ffffff';ctx.lineWidth=Math.max(2,s*.07);rrect(ctx,X+s*.04,Y+s*.04,s*.92,s*.92,s*.18);ctx.stroke();
    if(m.sel){ctx.strokeStyle='#ffd23f';ctx.lineWidth=Math.max(3,s*.1);ctx.globalAlpha=.6+.4*Math.sin(now/120);rrect(ctx,m.sel[0]*s+s*.03,m.sel[1]*s+s*.03,s*.94,s*.94,s*.2);ctx.stroke();ctx.globalAlpha=1;}
  }
  if(isBK()){const k=G.k,lv=G.lv,m=lv.m;
    ctx.fillStyle='#1d3557';ctx.fillRect(0,0,W,W);
    ctx.fillStyle='#14213d';rrect(ctx,s*.85,s*-.15+s*.15,s*8.3,s*8.0,s*.2);ctx.fill();
    k.land=k.land.filter(l=>now-l.t0<220);
    for(let y=0;y<m;y++)for(let x=0;x<m;x++){const v=k.grid[y][x],L=v&&k.land.find(l=>l.x===x&&l.y===y),g=L?1+.18*Math.sin((now-L.t0)/220*Math.PI):1,X=(x+1)*s+s*(1-g)/2,Y=y*s+s*(1-g)/2;ctx.fillStyle=v?BKC[v]:'rgba(255,255,255,.07)';rrect(ctx,X+s*.05*g,Y+s*.05*g,s*.9*g,s*.9*g,s*.14);ctx.fill();
      if(v){ctx.fillStyle='rgba(255,255,255,.35)';rrect(ctx,X+s*.14,Y+s*.12,s*.5,s*.16,s*.08);ctx.fill();ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(X+s*.1,Y+s*.78,s*.8,s*.1);}}
    if(k.flash.length&&now-k.popT<500){const e=(now-k.popT)/500;k.flash.forEach(([x,y,c])=>{const g=1+e*.5,X=(x+1.5)*s,Y=(y+.5)*s;ctx.globalAlpha=1-e;ctx.fillStyle=e<.25?'#ffffff':BKC[c];rrect(ctx,X-s*.45*g,Y-s*.45*g,s*.9*g,s*.9*g,s*.14);ctx.fill();});ctx.globalAlpha=1;}
    // the ghost of the chosen shape
    const p=k.over?null:bkCur();if(p){const ok=bkFits(p,k.ghost.x,k.ghost.y);ctx.globalAlpha=.55+.2*Math.sin(now/200);
      p.cells.forEach(([x,y])=>{const X=(k.ghost.x+x+1)*s,Y=(k.ghost.y+y)*s;ctx.fillStyle=ok?BKC[p.col]:'#adb5bd';rrect(ctx,X+s*.05,Y+s*.05,s*.9,s*.9,s*.14);ctx.fill();ctx.strokeStyle=ok?'#ffffff':'#ff4d6d';ctx.lineWidth=Math.max(1,s*.06);ctx.stroke();});ctx.globalAlpha=1;
      // where full lines would appear
      if(ok){const g=k.grid.map(r=>r.slice());p.cells.forEach(([x,y])=>g[k.ghost.y+y][k.ghost.x+x]=9);ctx.fillStyle='rgba(255,255,255,.2)';
        for(let y=0;y<m;y++)if(g[y].every(v=>v))ctx.fillRect(s,y*s,m*s,s);for(let x=0;x<m;x++)if(g.every(r=>r[x]))ctx.fillRect((x+1)*s,0,s,m*s);}}
    // the tray
    ctx.fillStyle='rgba(255,255,255,.08)';rrect(ctx,s*.3,(m+.15)*s,W-s*.6,s*1.75,s*.25);ctx.fill();
    k.tray.forEach((q,i)=>{if(q.used)return;const w=Math.max(...q.cells.map(c=>c[0]))+1,h=Math.max(...q.cells.map(c=>c[1]))+1,u=Math.min(s*.38,s*1.5/Math.max(w,h));
      const cx=(i*3+2)*s,cy=(m+1.02)*s;if(i===k.pick){ctx.strokeStyle='#ffd23f';ctx.lineWidth=Math.max(2,s*.07);rrect(ctx,cx-s*1.3,cy-s*.8,s*2.6,s*1.6,s*.2);ctx.stroke();}
      if(i===k.pick){const bx=cx+s*1.12,by=cy-s*.58,tt=k.turnT&&now-k.turnT<300?(now-k.turnT)/300*Math.PI*2:0;circle(ctx,bx,by,s*.3,'#ffd23f');ctx.save();ctx.translate(bx,by);ctx.rotate(tt);ctx.font=Math.round(s*.38)+'px sans-serif';ctx.fillText('🔄',0,s*.02);ctx.restore();}
      q.cells.forEach(([x,y])=>{ctx.fillStyle=bkFitsAny(q)?BKC[q.col]:'#6c757d';rrect(ctx,cx-w*u/2+x*u+1,cy-h*u/2+y*u+1,u-2,u-2,u*.2);ctx.fill();});});
  }
}
function pzDraw2(s,n,W,now){
  const P=isM3()?G.m.praise:isBK()?G.k.praise:null;
  if(P&&now-P.t0<1100){const e=(now-P.t0)/1100,sc=e<.2?.6+e*2.4:1+(e-.2)*.1;ctx.save();ctx.globalAlpha=e>.7?(1-e)/.3:1;ctx.translate(W/2,W*.42);ctx.scale(sc,sc);
    ctx.font='bold '+Math.round(s*(P.big?1:.75))+'px '+getComputedStyle(document.body).fontFamily;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.lineWidth=Math.max(4,s*.18);ctx.strokeStyle='#5a189a';ctx.strokeText(P.text,0,0);ctx.fillStyle='#ffd23f';ctx.fillText(P.text,0,0);ctx.restore();}
  if(isBK()){const k=G.k;if(k.lastPts&&now-k.lastPts.t0<900){const e=(now-k.lastPts.t0)/900;ctx.globalAlpha=1-e;ctx.font='bold '+Math.round(s*.6)+'px sans-serif';ctx.fillStyle='#ffffff';ctx.textAlign='center';ctx.fillText('+'+k.lastPts.v,W/2,W*.62-e*s);ctx.globalAlpha=1;}}
}


