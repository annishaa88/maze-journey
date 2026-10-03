/* ================= retro arcade worlds: playing ================= */
// the arcade-style worlds below play through arc*; every family file adds its own worlds with kit(...)
kit(['munch','snake','road','bomb','ladders','mines','deep'],{});
const rndi=k=>Math.floor(Math.random()*k);
function minesFlood(lv,known,x,y){
  const st=[[x,y]];
  while(st.length){const [a,b]=st.pop(),k=a+','+b;if(known.has(k))continue;known.add(k);
    if(lv.num[b][a]===0)for(let d=0;d<4;d++){const nx=a+DV[d][0],ny=b+DV[d][1];if(nx>=0&&ny>=0&&nx<lv.n&&ny<lv.n&&!lv.hole[ny][nx])st.push([nx,ny]);}}
}
function arcFresh(lv){
  const o={dots:new Set(lv.dots||[]),powerLeft:(lv.power||[]).map(p=>Object.assign({},p)),powerUntil:0,
    blobs:(lv.blobs||[]).map(b=>Object.assign({},b)),foes:(lv.foes||[]).map(f=>Object.assign({},f)),
    body:lv.fruits?[[lv.start.x,lv.start.y]]:null,fruitsLeft:new Set(lv.fruits||[]),snUndo:[],
    roadT:0,roadAnim:0,crack:new Set(),bombAt:null,blast:null,
    barrels:(lv.barrels||[]).map(b=>({cells:b.cells,i:b.i,dir:b.dir})),bestRow:lv.start.y,jump:null,face:lv.start.x===0?1:-1,
    known:new Set(),holesShown:new Set(),mon:(lv.monsters||[]).map(m=>({cells:m.cells,i:m.i,dir:m.dir,t:m.t})),boostsLeft:(lv.boosts||[]).map(b=>Object.assign({},b)),fastUntil:0,deepT:0,swirl:null,pend:false,arcAt:0,score:0,dotsEaten:0,boomed:0};
  if(lv.t&&lv.range)lv.t.forEach((row,y)=>row.forEach((v,x)=>{if(v===2)o.crack.add(x+','+y);}));
  if(lv.hole)minesFlood(lv,o.known,lv.start.x,lv.start.y);
  return Object.assign(o,spFresh(lv),chFresh(lv));
}
let arcSaid={t:'',at:0};
function arcSay(t){const now=performance.now();if(t===arcSaid.t&&now-arcSaid.at<1600)return;arcSaid={t,at:now};toast(t);}
function arcHurt(text,to,guard){
  const now=performance.now();if(guard&&now<G.hurtUntil)return false;
  G.hurtUntil=now+1800;G.hits=(G.hits||0)+1;stopRun();beep(160,.25,'square');buzz(40);
  G.anim=null;G.p={x:to.x,y:to.y};toast(text);updateHud();return true;
}
function arcMove(d){
  const id=G.W.id,lv=G.lv,n=lv.n,x=G.p.x,y=G.p.y,nx=x+DV[d][0],ny=y+DV[d][1];
  const inside=nx>=0&&ny>=0&&nx<n&&ny<n,toGoal=nx===lv.goal.x&&ny===lv.goal.y;
  const K=kitHook('move');if(K){K(d);return;}
  if(id==='deep'){deepMove(d);return;}
  if(id==='munch'){
    if(lv.g[y][x][d]){bumpWall(d);return;}
    if(toGoal&&G.dots.size){bumpWall(d);arcSay('השער נפתח אחרי כל הנקודות. נשארו עוד '+G.dots.size);return;}
    G.p={x:nx,y:ny};enter(nx,ny);const k=nx+','+ny;
    if(G.dots.delete(k)){G.score+=10;G.dotsEaten++;beep(G.dots.size%2?520:700,.04,'square');
      if(!G.dots.size){toast('אכלת את כל הנקודות! השער אל הדובדבנים פתוח 🍒');[523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,.1,'square'),i*80));}}
    const pi=G.powerLeft.findIndex(p=>p.x===nx&&p.y===ny);
    if(pi>=0){G.powerLeft.splice(pi,1);G.powerUntil=performance.now()+G.cfg.powerMs;G.score+=50;[400,600,800,1000].forEach((f,i)=>setTimeout(()=>beep(f,.07,'square'),i*50));
      toast('תות כוח! 🍓 עכשיו הבלובים בורחים ממך. תפסי אותם!');}
    blobHit();updateHud();if(atGoal())win();return;
  }
  if(id==='snake'){
    const k=nx+','+ny;
    if(!GEN.snakeOk(lv.t,n,G.body,nx,ny)){bumpWall(d);
      if(inside&&!lv.t[ny][nx])arcSay('אי אפשר לעבור דרך הזנב 🐍');return;}
    if(toGoal&&G.fruitsLeft.size){bumpWall(d);arcSay('הקן מחכה. קודם אוכלים את כל הפירות: נשארו '+G.fruitsLeft.size);return;}
    G.snUndo.push({p:{x,y},body:G.body.map(c=>c.slice()),fruits:new Set(G.fruitsLeft),stars:new Set(G.stars),got:G.got});
    const eat=G.fruitsLeft.delete(k);
    G.body=GEN.snakeStep(G.body,nx,ny,eat);G.p={x:nx,y:ny};enter(nx,ny);
    if(eat){[700,900].forEach((f,i)=>setTimeout(()=>beep(f,.08,'square'),i*70));G.score+=100;
      toast(G.fruitsLeft.size?'ממם! 🍏 הזנב גדל':'כל הפירות נאכלו! עכשיו אל הקן 🪺');}
    else beep(330,.03,'square');
    updateHud();if(atGoal()){win();return;}
    const can=[0,1,2,3].some(e=>{const ax=nx+DV[e][0],ay=ny+DV[e][1];return GEN.snakeOk(lv.t,n,G.body,ax,ay)&&!(ax===lv.goal.x&&ay===lv.goal.y&&G.fruitsLeft.size);});
    if(!can)toast('אוי, נתקעת! לחצי "צעד אחורה" ↩');
    return;
  }
  if(id==='road'){
    if(!inside){bumpWall(d);return;}
    const L=lv.lanes[ny];
    if(L&&L.type==='R'&&GEN.laneAt(L,nx,G.roadT)){bumpWall(d);arcSay('מכונית! 🚗 חכי שתעבור');return;}
    if(L&&L.type==='W'&&!GEN.laneAt(L,nx,G.roadT)){bumpWall(d);arcSay('שם אין בול עץ. חכי שיגיע 🪵');return;}
    G.p={x:nx,y:ny};enter(nx,ny);beep(L?600:480,.04,'square');
    if(!L)G.check={x:nx,y:ny};
    if(atGoal())win();return;
  }
  if(id==='bomb'){
    if(!inside||lv.t[ny][nx]===1){bumpWall(d);return;}
    if(G.crack.has(nx+','+ny)){bumpWall(d);arcSay('קיר סדוק! שימי לידו זיקוק 🎆');return;}
    if(G.bombAt&&G.bombAt.x===nx&&G.bombAt.y===ny){bumpWall(d);return;}
    G.p={x:nx,y:ny};enter(nx,ny);foeHit();if(atGoal())win();return;
  }
  if(id==='ladders'){
    if(G.jump)return;
    if(d===1||d===3)G.face=DV[d][0];
    if(d===0&&lv.t[y][x]!==2){ladJump();return;}   // no ladder here: up means jump
    const r=GEN.ladStep(lv.t,n,x,y,d);
    if(!r){bumpWall(d);if(d===0)arcSay('עולים רק בסולם 🪜');else if(d===2)arcSay('יורדים רק בסולם, או נופלים בחור');return;}
    if(r.length>1){G.anim={cells:r,i:0,t:0,ms:70};[500,400,300].forEach((f,i)=>setTimeout(()=>beep(f,.06,'square'),i*60));return;}
    G.p={x:r[0][0],y:r[0][1]};enter(G.p.x,G.p.y);beep(d===0||d===2?440:360,.03,'square');barrelHit();if(atGoal())win();return;
  }
  if(id==='mines'){
    if(!inside){bumpWall(d);return;}
    if(lv.hole[ny][nx]){G.holesShown.add(nx+','+ny);[300,220,150].forEach((f,i)=>setTimeout(()=>beep(f,.12,'sine'),i*90));
      arcHurt('נפלת לבור של חפרפרת! 🕳️ עכשיו את יודעת איפה הוא. חוזרים להתחלה',lv.start);return;}
    G.p={x:nx,y:ny};enter(nx,ny);const was=G.known.size;minesFlood(lv,G.known,nx,ny);
    beep(G.known.size-was>1?760:520,.05,'square');updateHud();if(atGoal())win();return;
  }
}
/* munch blobs and fireworks-maze balloons wander; when powered up the blobs run away from you */
function wander(list,canGo,chase,flee){
  for(const b of list){
    const opts=[0,1,2,3].filter(d=>canGo(b.x,b.y,d));if(!opts.length)continue;
    let ch=b.last>=0?opts.filter(d=>d!==(b.last+2)%4):opts;if(!ch.length)ch=opts;
    const dist=d=>Math.abs(b.x+DV[d][0]-G.p.x)+Math.abs(b.y+DV[d][1]-G.p.y);
    let d;
    if(flee)d=ch.reduce((a,c)=>dist(c)>dist(a)?c:a);
    else if(Math.random()<chase)d=ch.reduce((a,c)=>dist(c)<dist(a)?c:a);
    else d=ch[rndi(ch.length)];
    b.x+=DV[d][0];b.y+=DV[d][1];b.last=d;
  }
}
function blobHit(){
  const now=performance.now();
  for(const b of G.blobs){if(b.x!==G.p.x||b.y!==G.p.y)continue;
    if(now<G.powerUntil){b.x=b.hx;b.y=b.hy;b.last=-1;G.score+=200;[1200,1600].forEach((f,i)=>setTimeout(()=>beep(f,.08,'square'),i*60));toast('הבלוב רץ הביתה! 💨');updateHud();continue;}
    arcHurt('אופס! בלוב תפס אותך. חוזרים להתחלה, והנקודות שאכלת נשארות אכולות',G.lv.start,true);return;}
}
function foeHit(){
  for(const f of G.foes)if(f.x===G.p.x&&f.y===G.p.y){arcHurt('בום! 🎈 בלון נגע בך. חוזרים להתחלה',G.lv.start,true);return;}
}
function barrelHit(){
  if(performance.now()<G.hurtUntil||G.jump)return;
  for(const b of G.barrels){const [bx,by]=b.cells[b.i];if(bx===G.p.x&&by===G.p.y){arcHurt('חבית! 🛢️ בפעם הבאה קופצים מעליה בחץ למעלה. חוזרים לנקודה האחרונה ששמרת',G.check);return;}}
}
/* ladder tower: a real jump, two steps forward in the air; barrels roll under you while you fly */
function ladJump(){
  if(!G||G.done||G.W.id!=='ladders'||G.jump||G.anim||arcPaused())return;
  const lv=G.lv,n=lv.n,x=G.p.x,y=G.p.y,dir=G.face||1;
  if(!GEN.ladStand(lv.t,n,x,y))return;
  const ok=a=>a>=0&&a<n&&lv.t[y][a]!==1;
  let tx=x+2*dir;if(!ok(x+dir))tx=x;else if(!ok(tx))tx=x+dir;
  G.jump={fx:x,tx,y,t0:performance.now(),dur:tx===x?420:560};
  [520,780,1040].forEach((f,i)=>setTimeout(()=>beep(f,.06,'square'),i*45));
}
function ladLand(){
  const j=G.jump,lv=G.lv;G.jump=null;G.p={x:j.tx,y:j.y};enter(j.tx,j.y);
  const cells=[];let fy=j.y;while(!GEN.ladStand(lv.t,lv.n,j.tx,fy)){fy++;cells.push([j.tx,fy]);}
  if(cells.length){G.anim={cells,i:0,t:0,ms:70};return;}
  beep(300,.05,'square');barrelHit();if(atGoal())win();
}
function arcAction(){if(!G)return;const K=kitHook('action');if(K){K();return;}if(G.W.id==='bomb')placeBomb();else if(G.W.id==='ladders')ladJump();}
function placeBomb(){
  if(!G||G.done||G.W.id!=='bomb'||arcPaused())return;
  if(G.bombAt){arcSay('אפשר זיקוק אחד בכל פעם');return;}
  G.bombAt={x:G.p.x,y:G.p.y,t:performance.now()+G.cfg.fuse};beep(420,.08,'square');
  if(!G.bombTold){G.bombTold=true;toast('זיקוק! 🎆 עכשיו להתרחק');}
}
function explode(){
  const b=G.bombAt,lv=G.lv,n=lv.n;G.bombAt=null;const cells=[[b.x,b.y]];let broke=0;
  for(let d=0;d<4;d++)for(let i=1;i<=lv.range;i++){const x=b.x+DV[d][0]*i,y=b.y+DV[d][1]*i;
    if(x<0||y<0||x>=n||y>=n||lv.t[y][x]===1)break;cells.push([x,y]);
    if(G.crack.delete(x+','+y)){broke++;break;}}
  G.boomed+=broke;G.score+=broke*50;
  G.blast={cells,until:performance.now()+550};
  [260,180,120].forEach((f,i)=>setTimeout(()=>beep(f,.16,'sawtooth'),i*70));buzz(50);
  const inB=(x,y)=>cells.some(c=>c[0]===x&&c[1]===y);
  const before=G.foes.length;G.foes=G.foes.filter(f=>!inB(f.x,f.y));
  if(G.foes.length<before){G.score+=300;setTimeout(()=>toast('פוף! 🎈 הבלון התפוצץ'),150);}
  if(inB(G.p.x,G.p.y))arcHurt('הזיקוק הקפיץ אותך להתחלה! בפעם הבאה מתרחקים 😉',lv.start);
  else if(broke&&!G.boomTold){G.boomTold=true;toast('בּוּם! 🎆 הקיר נעלם');}
  updateHud();
}
function arcPaused(){return ['tut','turn','duelRes','building','pause','keypad'].some(id=>!document.getElementById(id).hidden);}
/* pause: when she switches apps, locks the phone, or taps ⏸ — everything freezes until ▶ */
let pausedAt=0,pausedDate=0;
function pauseGame(){
  if(!G||G.done||pausedAt||document.getElementById('gameScreen').hidden)return;
  pausedAt=performance.now();pausedDate=Date.now();stopRun();try{speechSynthesis.cancel();}catch(e){}
  document.getElementById('pause').hidden=false;
}
function resumeGame(){
  if(!pausedAt)return;const d=performance.now()-pausedAt,dd=Date.now()-pausedDate;pausedAt=0;document.getElementById('pause').hidden=true;
  if(!G)return;
  ['fishT','arcAt','tideAt','powerUntil','fastUntil','hurtUntil','spinUntil','roadAnim','barT','boing','flipLock','jumpUntil','shAt','raceT0','spAt','stunUntil','hitLock','peekUntil','stT0','rlT0'].forEach(k=>{if(G[k])G[k]+=d;});if(G.m&&G.m.mT)G.m.mT+=d;if(G.wz){G.wz.stT0+=d;if(G.wz.brT)G.wz.brT+=d;if(G.wz.keyAt)G.wz.keyAt+=d;}
  [G.roll,G.throwA,G.tiltA].forEach(o=>{if(o&&o.t0)o.t0+=d;});
  if(G.bombAt)G.bombAt.t+=d;if(G.jump)G.jump.t0+=d;if(G.anim&&G.anim.t)G.anim.t+=d;if(G.swirl)G.swirl.t0+=d;if(G.blast)G.blast.until+=d;
  if(G.cuts)for(const k in G.cuts)G.cuts[k]+=d;
  G.t0+=dd;G.lastNow=performance.now();
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseGame();});
window.addEventListener('pagehide',pauseGame);
function arcTick(now){
  if(arcPaused()){G.arcAt=now;if(G.bombAt)G.bombAt.t=Math.max(G.bombAt.t,now+400);return;}
  const id=G.W.id,lv=G.lv;
  const K=kitHook('tick');if(K){K(now);return;}
  if(id==='ladders'&&!G.anim&&G.p.y<G.bestRow&&GEN.ladStand(lv.t,lv.n,G.p.x,G.p.y)&&lv.t[G.p.y][G.p.x]!==2){G.bestRow=G.p.y;G.check={x:G.p.x,y:G.p.y};}
  if(id==='ladders'){const fl=lv.floors.filter(yb=>yb>G.p.y).length;if(fl!==G.floorShown){G.floorShown=fl;updateHud();}}
  if(G.jump){const j=G.jump,e=Math.min(1,(now-j.t0)/j.dur),fy=j.fy??j.y,ty=j.ty??j.y;G.vis={x:j.fx+(j.tx-j.fx)*e,y:fy+(ty-fy)*e-Math.sin(e*Math.PI)*1.15};if(e>=1){if(j.land)j.land();else ladLand();}}
  if(id==='deep'){deepTick(now);return;}
  if(id==='bomb'&&G.bombAt&&now>=G.bombAt.t)explode();
  if(G.blast&&now>G.blast.until)G.blast=null;
  const speed=G.cfg.speed||800;
  if(now-G.arcAt<speed*(id==='munch'&&now<G.powerUntil?1.5:1))return;
  G.arcAt=now;
  if(id==='munch'){wander(G.blobs,(x,y,d)=>!lv.g[y][x][d]&&!(x+DV[d][0]===lv.goal.x&&y+DV[d][1]===lv.goal.y),G.cfg.chase||0,now<G.powerUntil);blobHit();}
  if(id==='bomb'&&G.foes.length){const n=lv.n;wander(G.foes,(x,y,d)=>{const a=x+DV[d][0],b=y+DV[d][1];return a>=0&&b>=0&&a<n&&b<n&&lv.t[b][a]!==1&&!G.crack.has(a+','+b)&&!(G.bombAt&&G.bombAt.x===a&&G.bombAt.y===b)&&!(a===lv.goal.x&&b===lv.goal.y);},.2,false);foeHit();}
  if(id==='road'){const T=G.roadT;G.roadT++;G.roadAnim=now;G.roadPrevT=T;
    if(!G.anim){const nx=GEN.roadTick(lv,G.p.x,G.p.y,T);
      if(nx==null){const L=lv.lanes[G.p.y];
        if(L&&L.type==='R')arcHurt('צפצוף! 🚗 מכונית. חוזרים לדשא',G.check);
        else{beep(300,.2,'sine');arcHurt('פלאש! 💦 נפלת למים. חוזרים לדשא',G.check);}}
      else if(nx!==G.p.x){G.p={x:nx,y:G.p.y};G.trail.add(nx+','+G.p.y);}}}
  if(id==='ladders'){G.barT=now;G.barrels.forEach(b=>{if(b.i+b.dir<0||b.i+b.dir>=b.cells.length)b.dir*=-1;b.pi=b.i;b.i+=b.dir;});if(!G.anim)barrelHit();}
}
function arcHud(hud){
  const id=G.W.id,add=t=>{const s=document.createElement('span');s.className='chip';s.textContent=t;hud.appendChild(s);return s;};
  const K=kitHook('hud');if(K){K(add);return;}
  if(id==='munch'){add('🟡 נקודות: '+G.dots.size);const s=add('ניקוד '+String(G.score).padStart(5,'0'));s.style.fontFamily='monospace';}
  if(id==='snake'){add('🍏 פירות: '+(G.lv.fruits.length-G.fruitsLeft.size)+' מתוך '+G.lv.fruits.length);add('🐍 אורך: '+G.body.length);}
  if(id==='road')add('🚗 מחכים לרווח');
  if(id==='bomb'){add('🧱 קירות שפוצצו: '+G.boomed);if(G.lv.foes.length)add('🎈 בלונים: '+G.foes.length);}
  if(id==='ladders'){const fl=G.lv.floors.filter(yb=>yb>G.p.y).length;add('🪜 קומה '+fl+' מתוך '+G.lv.floors.length);}
  if(id==='mines')add('🕳️ בורות שמצאת: '+G.holesShown.size);
  if(id==='deep'){if(performance.now()<G.fastUntil)add('⚡ מהירה!');add('🐚 צדפים קופצים: '+G.lv.pads.length);}
}
/* ---------- deep sea ---------- */
function spikeOut(x,y){const sp=G.lv.spikes.find(q=>q.x===x&&q.y===y);return !!sp&&((G.deepT+sp.ph)%6)>=4;}
function spikeWarn(sp){return ((G.deepT+sp.ph)%6)===3;}
function deepStop(x,y){const lv=G.lv;return lv.pads.some(p=>p.x===x&&p.y===y)||G.boostsLeft.some(b=>b.x===x&&b.y===y)||(x===lv.goal.x&&y===lv.goal.y)||lv.spikes.some(q=>q.x===x&&q.y===y);}
function deepMove(d){
  const lv=G.lv,n=lv.n,x=G.p.x,y=G.p.y,nx=x+DV[d][0],ny=y+DV[d][1];
  if(G.jump||G.swirl)return;
  if(lv.g[y][x][d]){bumpWall(d);return;}
  if(spikeOut(nx,ny)){bumpWall(d);arcSay('קוצים! 🦔 חכי שהקיפוד ייכנס פנימה');return;}
  const cells=[[nx,ny]];
  if(performance.now()<G.fastUntil){let cx=nx,cy=ny;
    while(cells.length<n&&!deepStop(cx,cy)){const c=lv.g[cy][cx];if(c[d])break;
      if([0,1,2,3].some(k=>k!==d&&k!==(d+2)%4&&!c[k]))break;
      const ax=cx+DV[d][0],ay=cy+DV[d][1];if(spikeOut(ax,ay))break;cells.push([ax,ay]);cx=ax;cy=ay;}}
  if(cells.length>1){G.anim={cells,i:0,t:0,ms:45};G.pend=true;beep(900,.08,'sine');return;}
  G.p={x:nx,y:ny};enter(nx,ny);beep(560,.03,'sine');deepArrive();
}
function deepArrive(){
  if(!G||G.done)return;const lv=G.lv,now=performance.now();
  const bi=G.boostsLeft.findIndex(b=>b.x===G.p.x&&b.y===G.p.y);
  if(bi>=0){G.boostsLeft.splice(bi,1);G.fastUntil=now+9000;[700,900,1100,1300].forEach((f,i)=>setTimeout(()=>beep(f,.06,'sine'),i*40));
    toast('⚡ צדף מהירות! עכשיו כל לחיצה שוחה עד הפנייה הבאה');updateHud();}
  const pad=lv.pads.find(p=>p.x===G.p.x&&p.y===G.p.y);
  if(pad){const tx=pad.x+2*DV[pad.d][0],ty=pad.y+2*DV[pad.d][1];stopRun();
    G.jump={fx:pad.x,fy:pad.y,tx,ty,t0:now,dur:650,land:()=>{G.jump=null;G.p={x:tx,y:ty};enter(tx,ty);G.check={x:tx,y:ty};
      beep(330,.08,'sine');if(!G.padTold){G.padTold=true;toast('בּוֹיְנְג! 🐚 עפת מעל הקיר. מעכשיו המערבולת תחזיר אותך לכאן');}deepArrive();}};
    [300,450,700,1000].forEach((f,i)=>setTimeout(()=>beep(f,.07,'square'),i*50));return;}
  if(spikeOut(G.p.x,G.p.y)){deepHurt('אאוץ׳! 🦔 קוצים. המערבולת מחזירה אותך');return;}
  deepMonsterHit();
  if(atGoal())win();
}
function deepHurt(text){
  const now=performance.now();if(G.swirl||now<G.hurtUntil)return;
  G.swirl={t0:now,x:G.p.x,y:G.p.y};G.hits=(G.hits||0)+1;stopRun();G.anim=null;G.pend=false;G.fastUntil=0;
  [600,500,400,300,200].forEach((f,i)=>setTimeout(()=>beep(f,.1,'sine'),i*90));buzz(40);toast(text);updateHud();
}
function deepMonsterHit(){
  if(G.jump||G.swirl)return;
  for(const m of G.mon){const [mx,my]=m.cells[m.i];if(mx===G.p.x&&my===G.p.y&&awake(m)){deepHurt('המפלצת בלעה אותך! 🌀 נכנסת למערבולת');return;}}
}
function deepTick(now){
  if(G.swirl&&now-G.swirl.t0>900){G.p={x:G.check.x,y:G.check.y};G.vis={x:G.p.x,y:G.p.y};G.swirl=null;G.hurtUntil=now+1500;}
  if(G.pend&&!G.anim){G.pend=false;deepArrive();}
  if(now-G.arcAt<(G.cfg.speed||700))return;
  G.arcAt=now;G.deepT++;
  G.mon.forEach(f=>{f.t=((f.t||0)+1)%CYCLE;if(!awake(f))return;if(f.i+f.dir<0||f.i+f.dir>=f.cells.length)f.dir*=-1;f.i+=f.dir;});
  if(!G.jump&&!G.swirl&&!G.anim){if(spikeOut(G.p.x,G.p.y))deepHurt('אאוץ׳! 🦔 הקוצים יצאו. המערבולת מחזירה אותך');else deepMonsterHit();}
}
function drawWhirl(c,x,y,r,now,col){
  c.save();c.translate(x,y);c.rotate(now/300);c.strokeStyle=col||'rgba(255,255,255,.75)';c.lineCap='round';
  for(let i=0;i<3;i++){c.lineWidth=Math.max(1.5,r*(.16-i*.04));c.beginPath();c.arc(0,0,r*(.9-i*.28),i*2,i*2+Math.PI*1.2);c.stroke();}c.restore();
}
function drawClam(c,x,y,r,d,now){
  const bounce=Math.abs(Math.sin(now/250))*r*.08;
  c.strokeStyle='#ffd23f';c.lineWidth=Math.max(1.5,r*.12);c.beginPath();for(let i=0;i<4;i++){c.moveTo(x-r*.35,y+r*.5-i*r*.18-bounce*i/3);c.lineTo(x+r*.35,y+r*.42-i*r*.18-bounce*i/3);}c.stroke();
  c.fillStyle='#ff8fb8';c.beginPath();c.ellipse(x,y-r*.15-bounce,r*.7,r*.36,0,Math.PI,0);c.fill();
  c.strokeStyle='#e05a8a';c.lineWidth=Math.max(1,r*.06);c.beginPath();for(let i=-2;i<=2;i++){c.moveTo(x,y-r*.15-bounce);c.lineTo(x+i*r*.28,y-r*.48-bounce+Math.abs(i)*r*.08);}c.stroke();
  c.save();c.translate(x,y);c.rotate([-Math.PI/2,0,Math.PI/2,Math.PI][d]);c.fillStyle='rgba(255,255,255,.9)';
  c.beginPath();c.moveTo(r*.95,0);c.lineTo(r*.62,-r*.22);c.lineTo(r*.62,r*.22);c.fill();c.restore();
}
function drawUrchin(c,x,y,r,out,warn,now){
  const sh=warn?Math.sin(now/30)*r*.06:0;
  if(out){c.strokeStyle='#3c1a5b';c.lineWidth=Math.max(1.5,r*.1);c.beginPath();for(let i=0;i<12;i++){const a=i/12*Math.PI*2;c.moveTo(x+Math.cos(a)*r*.3,y+Math.sin(a)*r*.3);c.lineTo(x+Math.cos(a)*r*.95,y+Math.sin(a)*r*.95);}c.stroke();}
  circle(c,x+sh,y,r*(out?.45:.38),'#6a3d9a');circle(c,x+sh-r*.1,y-r*.1,r*.08,'rgba(255,255,255,.5)');
  circle(c,x+sh-r*.12,y,r*.05,'#fff');circle(c,x+sh+r*.12,y,r*.05,'#fff');
}
function drawSeaMonster(c,x,y,r,flip){
  c.save();c.translate(x,y);if(flip)c.scale(-1,1);
  c.fillStyle='#5e4bd1';c.beginPath();c.moveTo(-r*.95,0);c.lineTo(-r*1.25,-r*.35);c.lineTo(-r*1.25,r*.35);c.fill();
  c.beginPath();c.ellipse(-r*.1,0,r*.85,r*.62,0,0,7);c.fill();
  c.strokeStyle='#9ef0ff';c.lineWidth=Math.max(1,r*.06);c.beginPath();c.moveTo(r*.1,-r*.55);c.quadraticCurveTo(r*.4,-r*1.05,r*.65,-r*.75);c.stroke();circle(c,r*.66,-r*.73,r*.13,'#fff59d');
  c.fillStyle='#2a1a55';c.beginPath();c.moveTo(r*.75,-r*.05);c.lineTo(r*.15,r*.1);c.lineTo(r*.75,r*.38);c.fill();
  c.fillStyle='#fff';for(let i=0;i<3;i++){c.beginPath();c.moveTo(r*(.3+i*.15),r*(.06+i*.06));c.lineTo(r*(.36+i*.15),r*(.18+i*.06));c.lineTo(r*(.42+i*.15),r*(.08+i*.06));c.fill();}
  circle(c,r*.2,-r*.25,r*.17,'#fff');circle(c,r*.24,-r*.25,r*.09,'#2a1a55');c.restore();
}
function drawSpeedShell(c,x,y,r,now){
  c.globalAlpha=.35+.25*Math.sin(now/200);circle(c,x,y,r,'#9ef0ff');c.globalAlpha=1;circle(c,x,y,r*.72,'#2fb5e8');
  c.fillStyle='#ffe066';c.beginPath();c.moveTo(x+r*.12,y-r*.6);c.lineTo(x-r*.3,y+r*.08);c.lineTo(x,y+r*.08);c.lineTo(x-r*.12,y+r*.6);c.lineTo(x+r*.32,y-r*.1);c.lineTo(x+r*.02,y-r*.1);c.closePath();c.fill();
}
function deepDraw(s,n,W,now){
  const lv=G.lv,grd=ctx.createLinearGradient(0,0,0,W);grd.addColorStop(0,'#14507a');grd.addColorStop(1,'#0a2240');ctx.fillStyle=grd;ctx.fillRect(0,0,W,W);
  ctx.fillStyle='rgba(255,255,255,.05)';for(let i=0;i<4;i++){ctx.beginPath();const x0=W*(i*.28+.05)+Math.sin(now/2000+i)*s;ctx.moveTo(x0,0);ctx.lineTo(x0+s*.8,0);ctx.lineTo(x0+s*2.2,W);ctx.lineTo(x0+s*1.2,W);ctx.fill();}
  for(let i=0;i<10;i++){const bx=((i*97)%n+.5)*s+Math.sin(now/700+i)*s*.2,by=W-((now/30+i*W/10)%W);circle(ctx,bx,by,Math.max(1,s*.05),'rgba(255,255,255,.35)');}
  drawTrail(s,'rgba(158,240,255,.25)');
  drawWalls(lv.g,n,s,'#3fd0c9');
  drawWhirl(ctx,(G.check.x+.5)*s,(G.check.y+.5)*s,s*.4,now,'rgba(158,240,255,.6)');
  // a dotted arc shows where each clam throws you
  lv.pads.forEach(p=>{const x0=(p.x+.5)*s,y0=(p.y+.5)*s,x1=(p.x+2*DV[p.d][0]+.5)*s,y1=(p.y+2*DV[p.d][1]+.5)*s,mx=(x0+x1)/2+(y1-y0)*.25,my=(y0+y1)/2-(x1-x0)*.25-(p.d%2?s*.6:0);
    ctx.strokeStyle='rgba(255,224,102,.75)';ctx.lineWidth=Math.max(1.5,s*.06);ctx.setLineDash([s*.1,s*.12]);ctx.lineDashOffset=-now/40;ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo(mx,my,x1,y1);ctx.stroke();ctx.setLineDash([]);
    circle(ctx,x1,y1,s*.12,'rgba(255,224,102,.5)');
    ctx.globalAlpha=.3+.15*Math.sin(now/200);circle(ctx,x0,y0,s*.46,'#ffe066');ctx.globalAlpha=1;drawClam(ctx,x0,(p.y+.55)*s,s*.46,p.d,now);});
  lv.spikes.forEach(sp=>drawUrchin(ctx,(sp.x+.5)*s,(sp.y+.5)*s,s*.42,((G.deepT+sp.ph)%6)>=4,spikeWarn(sp),now));
  G.boostsLeft.forEach(b=>drawSpeedShell(ctx,(b.x+.5)*s,(b.y+.5)*s,s*.36,now));
}
function deepDraw2(s,n,W,now){
  G.mon.forEach(m=>{const [x,y]=glide(m,...m.cells[m.i]),up=awake(m),cx=(x+.5)*s,cy=(y+.5)*s;
    if(up&&(m.t||0)>=AWAKE-1)ctx.globalAlpha=.55+.45*Math.sin(now/80);if(!up)ctx.globalAlpha=.4;
    drawSeaMonster(ctx,cx,cy,s*.36,m.dir<0&&m.cells[0][1]===m.cells[1][1]);ctx.globalAlpha=1;
    if(!up){ctx.fillStyle='#fff';ctx.font='bold '+Math.round(s*.3)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';const b=Math.sin(now/300)*s*.05;ctx.fillText('z',cx+s*.25,cy-s*.3+b);ctx.fillText('z',cx+s*.38,cy-s*.45+b);}});
  if(performance.now()<G.fastUntil){ctx.globalAlpha=.6;for(let i=0;i<5;i++){const a=now/90+i*1.26;circle(ctx,(G.vis.x+.5)*s+Math.cos(a)*s*.45,(G.vis.y+.5)*s+Math.sin(a)*s*.45,s*.05,'#ffe066');}ctx.globalAlpha=1;}
  if(G.jump){ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();const j=G.jump,e=Math.min(1,(now-j.t0)/j.dur);ctx.ellipse((j.fx+(j.tx-j.fx)*e+.5)*s,(j.fy+(j.ty-j.fy)*e+.85)*s,s*.25,s*.07,0,0,7);ctx.fill();}
}
// drawn on top of the player: the whirlpool that swallows her
function deepDraw3(s,n,W,now){
  if(!G.swirl)return;const e=Math.max(0,Math.min(1,(now-G.swirl.t0)/900)),cx=(G.swirl.x+.5)*s,cy=(G.swirl.y+.5)*s;
  circle(ctx,cx,cy,s*(.3+.35*Math.sin(e*Math.PI)),'rgba(20,80,122,.9)');drawWhirl(ctx,cx,cy,s*(.35+.4*Math.sin(e*Math.PI)),now*2.5,'#9ef0ff');
}
/* ---------- arcade drawing ---------- */
function wallStroke(g,n,s,col,w){
  ctx.strokeStyle=col;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const c=g[y][x],X=x*s,Y=y*s;
    if(c[0]){ctx.moveTo(X,Y);ctx.lineTo(X+s,Y);}if(c[3]){ctx.moveTo(X,Y);ctx.lineTo(X,Y+s);}
    if(y===n-1&&c[2]){ctx.moveTo(X,Y+s);ctx.lineTo(X+s,Y+s);}if(x===n-1&&c[1]){ctx.moveTo(X+s,Y);ctx.lineTo(X+s,Y+s);}}
  ctx.stroke();
}
const BLOBC=['#ff5d8f','#4cc9f0','#ffb703','#8ac926'];
function drawBlob(c,x,y,r,col,scared,flash,now){
  const sq=1+.06*Math.sin(now/120+x);
  c.fillStyle=scared?(flash?'#ffffff':'#3a56ff'):col;
  c.beginPath();c.moveTo(x-r*.8*sq,y+r*.65);c.quadraticCurveTo(x-r*.85*sq,y-r*.85/sq,x,y-r*.85/sq);c.quadraticCurveTo(x+r*.85*sq,y-r*.85/sq,x+r*.8*sq,y+r*.65);c.closePath();c.fill();
  circle(c,x-r*.35,y-r*.45,r*.12,'rgba(255,255,255,.55)');
  if(scared){c.fillStyle='#fff';c.fillRect(x-r*.38,y-r*.2,r*.16,r*.16);c.fillRect(x+r*.22,y-r*.2,r*.16,r*.16);
    c.strokeStyle='#fff';c.lineWidth=Math.max(1,r*.08);c.beginPath();c.moveTo(x-r*.45,y+r*.3);for(let i=1;i<=6;i++)c.lineTo(x-r*.45+i*r*.15,y+r*.3+(i%2?-.1:.1)*r);c.stroke();}
  else{circle(c,x-r*.28,y-r*.12,r*.2,'#fff');circle(c,x+r*.28,y-r*.12,r*.2,'#fff');
    const dx=Math.sign(G.p.x-(x/(cv.width/G.lv.n)-.5))*r*.06;circle(c,x-r*.28+dx,y-r*.1,r*.1,'#2a2140');circle(c,x+r*.28+dx,y-r*.1,r*.1,'#2a2140');
    c.strokeStyle='#2a2140';c.lineWidth=Math.max(1,r*.07);c.beginPath();c.arc(x,y+r*.22,r*.14,Math.PI*.15,Math.PI*.85);c.stroke();}
}
function drawCar(c,X,Y,s,col,dir){
  c.fillStyle=col;rrect(c,X+s*.06,Y+s*.22,s*.88,s*.5,s*.12);c.fill();
  c.fillStyle='rgba(255,255,255,.75)';rrect(c,X+s*(dir>0?.42:.18),Y+s*.27,s*.32,s*.18,s*.05);c.fill();
  c.fillStyle='#1d1d2b';circle(c,X+s*.27,Y+s*.74,s*.11,'#1d1d2b');circle(c,X+s*.73,Y+s*.74,s*.11,'#1d1d2b');
  c.fillStyle='#ffe066';c.fillRect(X+(dir>0?s*.86:s*.06),Y+s*.36,s*.08,s*.12);
}
function drawBarrel(c,x,y,r,a){
  c.save();c.translate(x,y);c.rotate(a);circle(c,0,0,r,'#a0522d');circle(c,0,0,r*.72,'#c0703f');
  c.strokeStyle='#5b2e14';c.lineWidth=Math.max(1,r*.16);c.beginPath();c.moveTo(-r*.9,0);c.lineTo(r*.9,0);c.moveTo(0,-r*.9);c.lineTo(0,r*.9);c.stroke();c.restore();
}
function drawBalloon(c,x,y,r,now){
  const b=Math.sin(now/250+x)*r*.08;
  c.strokeStyle='#6d6384';c.lineWidth=Math.max(1,r*.05);c.beginPath();c.moveTo(x,y+r*.55+b);c.quadraticCurveTo(x+r*.15,y+r*.8,x,y+r*.95);c.stroke();
  c.fillStyle='#ff6fa8';c.beginPath();c.ellipse(x,y-r*.05+b,r*.55,r*.62,0,0,7);c.fill();
  circle(c,x-r*.2,y-r*.3+b,r*.12,'rgba(255,255,255,.6)');
  circle(c,x-r*.17,y-r*.02+b,r*.07,'#2a2140');circle(c,x+r*.17,y-r*.02+b,r*.07,'#2a2140');
  c.strokeStyle='#2a2140';c.beginPath();c.arc(x,y+r*.14+b,r*.13,Math.PI*.15,Math.PI*.85);c.stroke();
}
function arcDraw(s,n,W,now){
  const id=G.W.id,lv=G.lv;
  if(id==='deep'){deepDraw(s,n,W,now);return;}
  const K=kitHook('draw');if(K){K(s,n,W,now);return;}
  if(id==='munch'){
    ctx.fillStyle='#0b0b2a';ctx.fillRect(0,0,W,W);
    wallStroke(lv.g,n,s,'#3f5efb',Math.max(3,s*.22));wallStroke(lv.g,n,s,'#0b0b2a',Math.max(1,s*.08));
    ctx.fillStyle='#ffd7a8';G.dots.forEach(k=>{const [x,y]=k.split(',').map(Number);ctx.fillRect((x+.5)*s-s*.07,(y+.5)*s-s*.07,s*.14,s*.14);});
    G.powerLeft.forEach(p=>drawBerry(ctx,(p.x+.5)*s,(p.y+.5)*s,s*.3*(1+.12*Math.sin(now/140))));
  }else if(id==='snake'){
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){ctx.fillStyle=(x+y)%2?'#a8c94a':'#9bbc3f';ctx.fillRect(x*s,y*s,s+1,s+1);}
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(lv.t[y][x]){const X=x*s,Y=y*s;
      ctx.fillStyle='#306230';ctx.fillRect(X+s*.08,Y+s*.08,s*.84,s*.84);ctx.fillStyle='#0f380f';ctx.fillRect(X+s*.08,Y+s*.7,s*.84,s*.22);
      ctx.fillStyle='#4f8a2f';ctx.fillRect(X+s*.2,Y+s*.18,s*.22,s*.18);ctx.fillRect(X+s*.55,Y+s*.4,s*.2,s*.16);}
    G.fruitsLeft.forEach(k=>{const [x,y]=k.split(',').map(Number),cx=(x+.5)*s,cy=(y+.5)*s+Math.sin(now/250+x)*s*.03;
      circle(ctx,cx,cy+s*.04,s*.3,'#e63946');circle(ctx,cx-s*.1,cy-s*.04,s*.08,'#ffb3b8');ctx.fillStyle='#3a7d2c';ctx.fillRect(cx-s*.02,cy-s*.36,s*.05,s*.14);
      ctx.fillStyle='#5cb85c';ctx.beginPath();ctx.ellipse(cx+s*.12,cy-s*.3,s*.12,s*.06,-.4,0,7);ctx.fill();});
  }else if(id==='road'){
    const e=Math.min(1,(now-G.roadAnim)/150);
    for(let y=0;y<n;y++){const k=lv.rows[y],Y=y*s;
      if(k==='R'){ctx.fillStyle='#3d3d4f';ctx.fillRect(0,Y,W,s+1);ctx.fillStyle='rgba(255,255,255,.5)';for(let x=0;x<n;x++)ctx.fillRect(x*s+s*.3,Y+s*.47,s*.4,s*.06);}
      else if(k==='W'){ctx.fillStyle='#2b7de9';ctx.fillRect(0,Y,W,s+1);ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=Math.max(1,s*.04);ctx.beginPath();
        for(let x=0;x<n;x++){const yy=Y+s*.5+Math.sin(now/300+x)*s*.06;ctx.moveTo(x*s+s*.15,yy);ctx.quadraticCurveTo(x*s+s*.35,yy-s*.08,x*s+s*.55,yy);}ctx.stroke();
        const L=lv.lanes[y],off=GEN.laneMoves(L,G.roadPrevT==null?-5:G.roadPrevT)?(e-1)*L.dir:0;
        for(let x=0;x<n;x++)if(GEN.laneAt(L,x,G.roadT)){const X=(x+off)*s;
          ctx.fillStyle='#8b5a2b';ctx.fillRect(X-1,Y+s*.18,s+2,s*.64);ctx.fillStyle='#a0703f';ctx.fillRect(X-1,Y+s*.24,s+2,s*.12);
          ctx.strokeStyle='#6b4220';ctx.lineWidth=Math.max(1,s*.04);ctx.beginPath();ctx.moveTo(X+s*.3,Y+s*.5);ctx.lineTo(X+s*.7,Y+s*.5);ctx.stroke();
          if(!GEN.laneAt(L,x-1,G.roadT)){circle(ctx,X+s*.08,Y+s*.5,s*.3,'#c8925a');circle(ctx,X+s*.08,Y+s*.5,s*.16,'#a0703f');}}}
      else{ctx.fillStyle=(y%2)?'#5cb85c':'#54ad54';ctx.fillRect(0,Y,W,s+1);ctx.fillStyle='rgba(30,90,30,.35)';
        for(let x=0;x<n;x++)if((x*7+y*3)%3===0){ctx.fillRect(x*s+s*.25,Y+s*.55,s*.06,s*.18);ctx.fillRect(x*s+s*.35,Y+s*.5,s*.06,s*.23);}}}
  }else if(id==='bomb'){
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){ctx.fillStyle=(x+y)%2?'#7ec850':'#76c046';ctx.fillRect(x*s,y*s,s+1,s+1);}
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(lv.t[y][x]===1){const X=x*s,Y=y*s;
      ctx.fillStyle='#6c7a89';ctx.fillRect(X,Y,s+1,s+1);ctx.fillStyle='#95a5b5';ctx.fillRect(X,Y,s,s*.14);ctx.fillRect(X,Y,s*.14,s);
      ctx.fillStyle='#4d5966';ctx.fillRect(X,Y+s*.86,s,s*.14);ctx.fillRect(X+s*.86,Y,s*.14,s);}
  }else if(id==='ladders'){
    const grd=ctx.createLinearGradient(0,0,0,W);grd.addColorStop(0,'#1b1446');grd.addColorStop(1,'#2d1b4e');ctx.fillStyle=grd;ctx.fillRect(0,0,W,W);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){const v=lv.t[y][x],X=x*s,Y=y*s;
      if(v===1){ctx.fillStyle='#e0464e';ctx.fillRect(X,Y+s*.1,s+1,s*.8);ctx.fillStyle='#a82f36';ctx.fillRect(X,Y+s*.75,s+1,s*.15);
        ctx.strokeStyle='#ff8a8f';ctx.lineWidth=Math.max(1,s*.05);ctx.beginPath();ctx.moveTo(X,Y+s*.12);ctx.lineTo(X+s*.5,Y+s*.72);ctx.lineTo(X+s,Y+s*.12);ctx.stroke();
        circle(ctx,X+s*.12,Y+s*.3,s*.05,'#ffd6d8');circle(ctx,X+s*.88,Y+s*.3,s*.05,'#ffd6d8');}
      if(v===2){ctx.strokeStyle='#4cc9f0';ctx.lineWidth=Math.max(1.5,s*.08);ctx.beginPath();ctx.moveTo(X+s*.22,Y);ctx.lineTo(X+s*.22,Y+s);ctx.moveTo(X+s*.78,Y);ctx.lineTo(X+s*.78,Y+s);
        for(let i=0;i<3;i++){ctx.moveTo(X+s*.22,Y+s*(.18+i*.33));ctx.lineTo(X+s*.78,Y+s*(.18+i*.33));}ctx.stroke();}}
  }else if(id==='mines'){
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){const k=x+','+y,X=x*s,Y=y*s;
      if(G.known.has(k)){ctx.fillStyle=(x+y)%2?'#e6cfa4':'#dcc394';ctx.fillRect(X,Y,s+1,s+1);
        const v=lv.num[y][x];if(v){ctx.fillStyle=['','#1982c4','#2a9d5c','#e63946','#7b2cbf'][v];ctx.font='bold '+Math.round(s*.55)+'px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(v,X+s/2,Y+s*.54);}}
      else{ctx.fillStyle=(x+y)%2?'#7cb342':'#73a83b';ctx.fillRect(X,Y,s+1,s+1);ctx.fillStyle='#5d8f2a';
        ctx.fillRect(X+s*.25,Y+s*.5,s*.07,s*.22);ctx.fillRect(X+s*.38,Y+s*.42,s*.07,s*.3);ctx.fillRect(X+s*.62,Y+s*.55,s*.07,s*.2);}
      if(G.holesShown.has(k)){ctx.fillStyle='#3b2a1f';ctx.beginPath();ctx.ellipse(X+s/2,Y+s*.62,s*.38,s*.22,0,0,7);ctx.fill();drawMole(ctx,X+s/2,Y+s*.5,s*.26);}}
    ctx.strokeStyle='rgba(60,40,20,.12)';ctx.lineWidth=1;ctx.beginPath();for(let i=1;i<n;i++){ctx.moveTo(i*s,0);ctx.lineTo(i*s,W);ctx.moveTo(0,i*s);ctx.lineTo(W,i*s);}ctx.stroke();
  }
}
// drawn above stars and the goal, under the player
function arcDraw2(s,n,W,now){
  const id=G.W.id,lv=G.lv;
  if(id==='deep'){deepDraw2(s,n,W,now);return;}
  const K=kitHook('draw2');if(K){K(s,n,W,now);return;}
  const lock=left=>{if(!left)return;const X=lv.goal.x*s,Y=lv.goal.y*s;ctx.fillStyle='rgba(20,15,40,.45)';rrect(ctx,X+s*.08,Y+s*.08,s*.84,s*.84,s*.14);ctx.fill();
    ctx.font=Math.round(s*.42)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🔒',X+s/2,Y+s*.52);};
  if(id==='munch'){lock(G.dots.size);const sc=now<G.powerUntil,fl=sc&&G.powerUntil-now<1800&&Math.floor(now/160)%2;
    G.blobs.forEach(b=>{const [x,y]=glide(b,b.x,b.y);drawBlob(ctx,(x+.5)*s,(y+.55)*s,s*.4,BLOBC[b.c],sc,fl,now);});}
  if(id==='snake'){lock(G.fruitsLeft.size);
    const B=G.body;for(let i=B.length-1;i>=1;i--){const [x,y]=B[i],[px,py]=B[i-1],cx=(x+.5)*s,cy=(y+.5)*s,k=.42-.12*(i/B.length);
      ctx.strokeStyle=i%2?'#2e7d32':'#43a047';ctx.lineWidth=s*k*1.6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(i===1?(G.vis.x+.5)*s:(px+.5)*s,i===1?(G.vis.y+.5)*s:(py+.5)*s);ctx.stroke();
      circle(ctx,cx,cy,s*k*.8,i%2?'#2e7d32':'#43a047');circle(ctx,cx-s*.08,cy-s*.08,s*.06,'rgba(255,255,255,.35)');}}
  if(id==='road'){const e=Math.min(1,(now-G.roadAnim)/150);
    lv.lanes.forEach((L,y)=>{if(!L||L.type!=='R')return;const off=GEN.laneMoves(L,G.roadPrevT==null?-5:G.roadPrevT)?(e-1)*L.dir:0;
      for(let x=0;x<n;x++)if(GEN.laneAt(L,x,G.roadT))drawCar(ctx,(x+off)*s,y*s,s,['#ff595e','#ffca3a','#1982c4','#8338ec','#ff924c'][(y*3+((x-Math.floor(G.roadT/L.rate)*L.dir)%n+n)%n)%5],L.dir);});}
  if(id==='bomb'){
    G.crack.forEach(k=>{const [x,y]=k.split(',').map(Number),X=x*s,Y=y*s;
      ctx.fillStyle='#c8763a';ctx.fillRect(X,Y,s+1,s+1);ctx.strokeStyle='#8a4a1c';ctx.lineWidth=Math.max(1,s*.05);ctx.beginPath();
      for(let r=1;r<3;r++){ctx.moveTo(X,Y+r*s/3);ctx.lineTo(X+s,Y+r*s/3);}ctx.moveTo(X+s*.5,Y);ctx.lineTo(X+s*.5,Y+s/3);ctx.moveTo(X+s*.25,Y+s/3);ctx.lineTo(X+s*.25,Y+2*s/3);ctx.moveTo(X+s*.75,Y+s/3);ctx.lineTo(X+s*.75,Y+2*s/3);ctx.moveTo(X+s*.5,Y+2*s/3);ctx.lineTo(X+s*.5,Y+s);ctx.stroke();
      ctx.strokeStyle='#3b1f0a';ctx.lineWidth=Math.max(1,s*.04);ctx.beginPath();ctx.moveTo(X+s*.3,Y+s*.15);ctx.lineTo(X+s*.45,Y+s*.4);ctx.lineTo(X+s*.38,Y+s*.6);ctx.lineTo(X+s*.55,Y+s*.85);ctx.stroke();});
    if(G.bombAt){const b=G.bombAt,cx=(b.x+.5)*s,cy=(b.y+.55)*s,left=b.t-now,pulse=1+.1*Math.sin(now/(left<700?40:110));
      circle(ctx,cx,cy,s*.3*pulse,left<700&&Math.floor(now/90)%2?'#e63946':'#2a2140');circle(ctx,cx-s*.1,cy-s*.1,s*.07,'rgba(255,255,255,.5)');
      ctx.strokeStyle='#d4a373';ctx.lineWidth=Math.max(1,s*.06);ctx.beginPath();ctx.moveTo(cx+s*.15,cy-s*.22);ctx.quadraticCurveTo(cx+s*.3,cy-s*.42,cx+s*.22,cy-s*.5);ctx.stroke();
      circle(ctx,cx+s*.22,cy-s*.52,s*(.06+.04*Math.random()),'#ffd23f');}
    if(G.blast){const e=1-(G.blast.until-now)/550;G.blast.cells.forEach(([x,y],i)=>{const cx=(x+.5)*s,cy=(y+.5)*s;
      ctx.globalAlpha=Math.max(0,1-e*.9);circle(ctx,cx,cy,s*(.42+.1*Math.sin(now/40+i)),'#ffb703');circle(ctx,cx,cy,s*.26,'#fff3b0');
      ['#ff5d8f','#4cc9f0','#8ac926','#ffd23f'].forEach((col,j)=>{const a=j*1.57+e*3+i;circle(ctx,cx+Math.cos(a)*s*.35*e*1.4,cy+Math.sin(a)*s*.35*e*1.4,s*.06,col);});ctx.globalAlpha=1;});}
    G.foes.forEach(f=>{const [x,y]=glide(f,f.x,f.y);drawBalloon(ctx,(x+.5)*s,(y+.45)*s,s*.42,now);});}
  if(id==='ladders'){const e=Math.min(1,(now-(G.barT||0))/220);G.barrels.forEach((b,i)=>{const [x,y]=b.cells[b.i],[px]=b.cells[b.pi??b.i],bx=px+(x-px)*e;drawBarrel(ctx,(bx+.5)*s,(y+.62)*s,s*.32,now/200*b.dir+i);});
    if(G.jump){ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse((G.vis.x+.5)*s,(G.jump.y+.9)*s,s*.28,s*.08,0,0,7);ctx.fill();}}
}

