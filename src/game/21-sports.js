/* ================= sports region: playing ================= */
const SPORT=new Set(['soccer','hoops','ski','swim','tennis','hurdles','golf','dojo']);
function spFresh(lv){
  return {ball:lv.ball?Object.assign({},lv.ball):null,kicks:0,spUndo:[],
    defs:(lv.defs||[]).map(m=>({cells:m.cells,i:m.i,dir:m.dir})),
    hasBall:true,ballAt:null,scored:new Set(),throwA:null,
    gatesDone:new Set(),stunUntil:0,
    rivalI:0,raceOn:false,
    tball:lv.ball&&lv.ball.dx!=null?Object.assign({},lv.ball):null,hits:0,tspeed:1,
    timeLeft:lv.cost?null:0,raceT0:0,stuck:false,
    strokes:0,rest:null,
    phase:0,opp:(lv.opp||[]).map(m=>({cells:m.cells,i:m.i,dir:m.dir,out:0})),
    spAt:0,roll:null};
}
function spBlockedByDef(x,y){return G.defs.some(m=>m.cells[m.i][0]===x&&m.cells[m.i][1]===y);}
function spMove(d){
  const id=G.W.id,lv=G.lv,n=lv.n,x=G.p.x,y=G.p.y,nx=x+DV[d][0],ny=y+DV[d][1],inside=nx>=0&&ny>=0&&nx<n&&ny<n;
  if(G.roll||G.jump)return;
  if(d===1||d===3||id==='hoops'||id==='hurdles')G.face4=d;
  if(id==='soccer'){
    if(!inside||lv.t[ny][nx]||(nx===lv.goal.x&&ny===lv.goal.y)){bumpWall(d);return;}
    if(G.ball.x===nx&&G.ball.y===ny){
      const r=GEN.soccerRoll(lv.t,n,G.ball.x,G.ball.y,d,lv.goal,(a,b)=>spBlockedByDef(a,b));
      if(!r.path.length){bumpWall(d);arcSay('הכדור תקוע מהצד הזה. נסי לבעוט מכיוון אחר ⚽');return;}
      G.spUndo.push({p:{x,y},ball:{x:G.ball.x,y:G.ball.y}});G.kicks++;
      G.roll={cells:r.path,i:0,t0:performance.now(),goal:r.goal};beep(300,.08,'square');beep(500,.06,'square');updateHud();return;}
    if(spBlockedByDef(nx,ny)){bumpWall(d);return;}
    G.p={x:nx,y:ny};enter(nx,ny);defHit();return;
  }
  if(id==='hoops'){
    if(lv.g[y][x][d]){bumpWall(d);return;}
    if(nx===lv.goal.x&&ny===lv.goal.y&&G.scored.size<lv.hoops.length){bumpWall(d);arcSay('היציאה נפתחת אחרי '+lv.hoops.length+' סלים. נשארו '+(lv.hoops.length-G.scored.size)+' 🏀');return;}
    G.p={x:nx,y:ny};enter(nx,ny);
    if(G.ballAt&&G.ballAt.x===nx&&G.ballAt.y===ny){G.ballAt=null;G.hasBall=true;beep(660,.06,'square');toast('הכדור אצלך! 🏀 עכשיו לזרוק אל סל');updateHud();}
    defHit();if(atGoal())win();return;
  }
  if(id==='ski'){
    if(d===0){bumpWall(d);arcSay('בסקי לא מטפסים למעלה ⛷️');return;}
    if(!inside||lv.t[ny][nx]){bumpWall(d);if(d===2)skiCrash();return;}
    G.p={x:nx,y:ny};enter(nx,ny);if(d===2)G.spAt=performance.now();skiCheck();return;
  }
  if(id==='swim'){
    if(lv.g[y][x][d]){bumpWall(d);return;}
    if(!G.raceOn){G.raceOn=true;G.spAt=performance.now();toast('יצאנו לדרך! 🏊 הגיעי לקיר לפני השחיינית האחרת');}
    G.p={x:nx,y:ny};enter(nx,ny);beep(500,.03,'sine');if(atGoal()){toast('ניצחת במרוץ! 🥇');win();}return;
  }
  if(id==='tennis'){
    if(!inside||lv.t[ny][nx]){bumpWall(d);return;}
    if(nx===lv.goal.x&&ny===lv.goal.y&&G.hits<G.cfg.hits){bumpWall(d);arcSay('היציאה נפתחת אחרי '+G.cfg.hits+' חבטות. חסרות '+(G.cfg.hits-G.hits)+' 🎾');return;}
    G.p={x:nx,y:ny};enter(nx,ny);tennisHit();if(atGoal())win();return;
  }
  if(id==='hurdles'){
    if(G.stuck){G.stuck=false;beep(200,.08,'sine');arcSay('בוץ! 🟤 עוד לחיצה ויוצאים');return;}
    if(lv.g[y][x][d]){bumpWall(d);return;}
    if(lv.hurd.some(h=>h.x===nx&&h.y===ny)){hurdleJump();return;}   // running into a hurdle jumps it
    hurdleStart();G.p={x:nx,y:ny};hurdleLand();return;
  }
  if(id==='golf'){
    const r=GEN.golfRoll(lv.t,n,x,y,d,lv.goal);
    if(!r.path.length){bumpWall(d);return;}
    G.strokes++;G.rest={x,y};G.roll={cells:r.path,i:0,t0:performance.now(),water:r.water,hole:r.hole};
    beep(700,.05,'square');updateHud();return;
  }
  if(id==='dojo'){
    if(!inside||lv.t[ny][nx]===3){bumpWall(d);return;}
    const o=G.opp.find(m=>m.out<performance.now()&&m.cells[m.i][0]===nx&&m.cells[m.i][1]===ny);
    if(o){o.out=performance.now()+5000;chime([400,250,700],70,.09,'square');toast('איפּוֹן! 🥋 הפלת את היריבה');return;}
    if(!GEN.dojoOpen(lv.t,nx,ny,G.phase)){bumpWall(d);arcSay('המזרן ה'+(lv.t[ny][nx]===1?'כחול':'אדום')+' סגור עכשיו. דרכי על לבן או על הצבע הפתוח');return;}
    G.p={x:nx,y:ny};G.phase=1-G.phase;enter(nx,ny);beep(G.phase?520:620,.04,'square');updateHud();
    if(atGoal()){win();return;}
    const can=[0,1,2,3].some(e=>{const a=nx+DV[e][0],b=ny+DV[e][1];return a>=0&&b>=0&&a<n&&b<n&&lv.t[b][a]!==3&&GEN.dojoOpen(lv.t,a,b,G.phase);});
    if(!can)toast('אין לאן לזוז… לחצי ⋯ עוד ← להתחיל מחדש');return;
  }
}
function spAction(){
  if(!G||G.done||arcPaused())return;const id=G.W.id;
  if(id==='hoops')hoopThrow();else if(id==='hurdles')hurdleJump();
}
/* soccer */
function defHit(){
  if(!G.defs.length)return;const now=performance.now();if(now<G.hurtUntil)return;
  if(!spBlockedByDef(G.p.x,G.p.y))return;
  if(G.W.id==='soccer'){G.ball=Object.assign({},G.lv.ball);G.spUndo=[];arcHurt('הגנה! 🧤 השחקנית לקחה את הכדור, והוא חזר לנקודה שלו',G.p,true);}
  else if(G.W.id==='hoops'){if(G.hasBall){G.hasBall=false;G.ballAt={x:G.lv.start.x,y:G.lv.start.y};}
    arcHurt('חסימה! ✋ הכדור עף להתחלה',G.p,true);}
}
/* basketball */
// the ball's flight from where she stands: stops at a wall, a defender, the locked exit, or drops through the first hoop
function hoopLine(d){
  const lv=G.lv;let x=G.p.x,y=G.p.y;const cells=[];
  while(!lv.g[y][x][d]){const a=x+DV[d][0],b=y+DV[d][1];
    if(G.defs.some(m=>m.cells[m.i][0]===a&&m.cells[m.i][1]===b))break;
    if(a===lv.goal.x&&b===lv.goal.y&&G.scored.size<lv.hoops.length)break;
    x=a;y=b;cells.push([x,y]);
    const h=lv.hoops.find(h=>h.x===x&&h.y===y&&!G.scored.has(h.x+','+h.y));if(h)return {cells,hit:h};}
  return {cells,hit:null};
}
// aim help: if a hoop is in a straight line from her, the throw goes there
function hoopAim(){const f=G.face4==null?1:G.face4;for(const d of [f,0,1,2,3])if(hoopLine(d).hit)return d;return null;}
function hoopThrow(){
  if(G.throwA)return;
  if(!G.hasBall){arcSay('קודם להרים את הכדור 🏀');return;}
  const lv=G.lv,now=performance.now();
  const here=lv.hoops.find(h=>h.x===G.p.x&&h.y===G.p.y&&!G.scored.has(h.x+','+h.y));
  if(here){G.hasBall=false;G.throwA={cells:[[here.x,here.y]],t0:now,hit:here};beep(700,.06,'sine');toast('הטבעה! 🏀');return;}
  const aim=hoopAim(),d=aim!=null?aim:(G.face4==null?1:G.face4);G.face4=d;
  const L=hoopLine(d);
  if(!L.cells.length){bumpWall(d);arcSay('אין סל בקו ישר ממך. זוזי למקום שרואים ממנו סל 🏀');return;}
  G.hasBall=false;G.throwA={cells:L.cells,t0:now,hit:L.hit};beep(500,.06,'sine');
}
function hoopLand(){
  const a=G.throwA;G.throwA=null;const [x,y]=a.cells[a.cells.length-1];G.ballAt={x,y};
  if(a.hit){G.scored.add(a.hit.x+','+a.hit.y);chime([523,659,784,1047],80,.1,'square');sparkle(a.hit.x,a.hit.y,['#ffd23f'],12);
    toast(G.scored.size===G.lv.hoops.length?'סל! 🏀 כל הסלים נקלעו, היציאה פתוחה!':'סל! 🏀 עוד '+(G.lv.hoops.length-G.scored.size));}
  else arcSay('החטאה… הכדור על הרצפה. הרימי ונסי שוב');
  if(G.ballAt.x===G.p.x&&G.ballAt.y===G.p.y){G.ballAt=null;G.hasBall=true;}
  updateHud();
}
/* skiing */
function skiCheck(){
  const lv=G.lv;
  lv.gates.forEach((g,i)=>{if(!G.gatesDone.has(i)&&G.p.y===g.y&&G.p.x>=g.x1&&G.p.x<=g.x2){G.gatesDone.add(i);[700,900].forEach((f,j)=>setTimeout(()=>beep(f,.08,'sine'),j*70));toast('שער! 🚩 '+G.gatesDone.size+' מתוך '+lv.gates.length);updateHud();}});
  if(G.p.y===lv.n-1){
    if(G.gatesDone.size===lv.gates.length){win();return;}
    const miss=lv.gates.length-G.gatesDone.size;
    toast('פספסת '+(miss===1?'שער אחד':miss+' שערים')+'. הרכבל מעלה אותך שוב 🚡');G.p={x:lv.start.x,y:lv.start.y};G.spAt=performance.now()+800;}
}
function skiCrash(){const now=performance.now();if(now<G.stunUntil)return;G.stunUntil=now+900;G.hits=(G.hits||0)+1;beep(150,.2,'square');buzz(30);arcSay('בום! 🌲 נתקעת בעץ. זוזי הצידה');}
/* tennis */
function tennisHit(){
  const b=G.tball;if(b.x!==G.p.x||b.y!==G.p.y||performance.now()<(G.hitLock||0))return;
  G.hitLock=performance.now()+300;b.dx=-b.dx;b.dy=-b.dy;G.hits++;G.tspeed*=.92;
  chime([880,1320],50,.06,'square');sparkle(b.x,b.y,['#d4ff3a'],6);
  toast(G.hits>=G.cfg.hits?'חבטה! 🎾 היציאה פתוחה!':'חבטה! 🎾 '+G.hits+' מתוך '+G.cfg.hits);updateHud();
}
function tennisStep(){
  const lv=G.lv,n=lv.n,b=G.tball;b.px=b.x;b.py=b.y;
  const free=(x,y)=>x>=0&&y>=0&&x<n&&y<n&&!lv.t[y][x]&&!(x===lv.goal.x&&y===lv.goal.y&&G.hits<G.cfg.hits);
  if(!free(b.x+b.dx,b.y+b.dy)){
    if(!free(b.x+b.dx,b.y)&&free(b.x-b.dx,b.y))b.dx=-b.dx;
    if(!free(b.x,b.y+b.dy)&&free(b.x,b.y-b.dy))b.dy=-b.dy;
    if(!free(b.x+b.dx,b.y+b.dy)){b.dx=-b.dx;b.dy=-b.dy;}}
  if(free(b.x+b.dx,b.y+b.dy)){b.x+=b.dx;b.y+=b.dy;}
  tennisHit();
}
/* obstacle run */
function hurdleStart(){if(G.timeLeft==null){G.timeLeft=Math.round(G.lv.cost*G.cfg.msPer*1.3)+8000;G.raceT0=performance.now();updateHud();}}
function hurdleLand(){
  const lv=G.lv;enter(G.p.x,G.p.y);
  if(lv.mud.some(m=>m.x===G.p.x&&m.y===G.p.y)){G.stuck=true;beep(160,.1,'sine');arcSay('שלוּפּ! 🟤 נתקעת בבוץ');}
  if(atGoal()){toast('הגעת בזמן! ⏱');win();}
}
function hurdleJump(){
  const lv=G.lv,d=G.face4==null?1:G.face4,x=G.p.x,y=G.p.y;
  if(G.jump)return;
  if(G.stuck){G.stuck=false;beep(200,.08,'sine');return;}
  if(lv.g[y][x][d]){bumpWall(d);return;}
  const a=x+DV[d][0],b=y+DV[d][1];
  if(lv.g[b][a][d]){bumpWall(d);arcSay('אין מקום לנחות 🦘');return;}
  const a2=a+DV[d][0],b2=b+DV[d][1];if(lv.hurd.some(h=>h.x===a2&&h.y===b2)){bumpWall(d);return;}
  hurdleStart();G.jump={fx:x,fy:y,tx:a2,ty:b2,t0:performance.now(),dur:380};chime([520,780],50,.06,'square');
}
/* golf */
function golfStop(){
  const r=G.roll;G.roll=null;
  if(r.hole){const sc=G.strokes<=G.lv.par?3:G.strokes<=G.lv.par+2?2:1;G.got=sc;toast(G.strokes===1?'הול אין וואן! ⛳ במכה אחת!':'בגומה! ⛳ '+G.strokes+' חבטות (פאר '+G.lv.par+')');win();return;}
  if(r.water){toast('ספלאש! 💦 הכדור חוזר למקום הקודם');beep(250,.2,'sine');G.p={x:G.rest.x,y:G.rest.y};}
  updateHud();
}
function spTick(now){
  const id=G.W.id,lv=G.lv;
  // rolling balls (soccer kicks, golf shots)
  if(G.roll){const r=G.roll,ms=id==='golf'?60:55;const step=Math.floor((now-r.t0)/ms);
    while(G.roll&&r.i<=step&&r.i<r.cells.length){const [x,y]=r.cells[r.i++];if(id==='golf'){G.p={x,y};enter(x,y);}else{G.ball={x,y};}}
    if(r.i>=r.cells.length&&G.roll){if(id==='golf')golfStop();else{G.roll=null;
      if(r.goal){chime([523,659,784,1047,1319],80,.12,'square');sparkle(lv.goal.x,lv.goal.y,['#ffffff','#ffd23f'],18);toast('גוֹל! ⚽');
        G.p=G.p;win();return;}
      else if(!GEN.soccerSolve(lv.t,lv.n,G.p,G.ball,lv.goal))toast('אוי, הכדור נתקע במקום שאי אפשר להבקיע ממנו. לחצי ↩ צעד אחורה');}}}
  if(G.throwA&&now-G.throwA.t0>G.throwA.cells.length*60+120)hoopLand();
  if(G.jump&&id==='hurdles'){const j=G.jump,e=Math.min(1,(now-j.t0)/j.dur);G.vis={x:j.fx+(j.tx-j.fx)*e,y:j.fy+(j.ty-j.fy)*e-Math.sin(e*Math.PI)*.8};
    if(e>=1){G.jump=null;G.p={x:j.tx,y:j.ty};hurdleLand();}}
  if(id==='hurdles'&&G.timeLeft!=null&&G.raceT0){const left=G.timeLeft-(now-G.raceT0);
    if(Math.floor(left/1000)!==G.shownLeft){G.shownLeft=Math.floor(left/1000);updateHud();}
    if(left<=0){G.raceT0=0;toast('⏱ נגמר הזמן! מנסים שוב');beep(200,.3,'square');setTimeout(()=>{if(G&&!G.done)document.getElementById('retry').click();},900);}}
  if(id==='swim'&&G.raceOn&&now-G.spAt>G.cfg.rival){G.spAt=now;G.rivalI=Math.min(lv.rival.length-1,G.rivalI+1);
    if(G.rivalI===lv.rival.length-1&&!G.done){G.raceOn=false;toast('השחיינית האחרת הגיעה ראשונה 🏊 מנסים שוב!');beep(200,.3,'sine');setTimeout(()=>{if(G&&!G.done)document.getElementById('retry').click();},1100);}}
  const speed=G.cfg.speed||800;
  if(id==='ski'){if(now<G.stunUntil)return;if(now-G.spAt>speed){G.spAt=now;const b=G.p.y+1;
    if(b<lv.n){if(lv.t[b][G.p.x])skiCrash();else{G.p={x:G.p.x,y:b};enter(G.p.x,b);skiCheck();}}}return;}
  if(id==='tennis'&&now-G.spAt>speed*G.tspeed){G.spAt=now;tennisStep();}
  if((id==='soccer'||id==='hoops')&&G.defs.length&&now-G.arcAt>speed){G.arcAt=now;
    G.defs.forEach(m=>{if(m.i+m.dir<0||m.i+m.dir>=m.cells.length)m.dir*=-1;const [a,b]=m.cells[m.i+m.dir];
      if(G.ball&&G.ball.x===a&&G.ball.y===b){m.dir*=-1;return;}m.i+=m.dir;});defHit();}
  if(id==='dojo'&&G.opp.length&&now-G.arcAt>speed){G.arcAt=now;
    G.opp.forEach(m=>{if(m.out>now)return;if(m.i+m.dir<0||m.i+m.dir>=m.cells.length)m.dir*=-1;m.i+=m.dir;
      const [a,b]=m.cells[m.i];if(a===G.p.x&&b===G.p.y&&now>G.hurtUntil){m.i-=m.dir;m.dir*=-1;arcHurt('אוּפּס! 🥋 היריבה הפילה אותך. חוזרים לפינה',G.lv.start,true);G.phase=0;}});}
}
function spHud(add){
  const id=G.W.id,lv=G.lv;
  if(id==='soccer')add('⚽ בעיטות: '+G.kicks);
  if(id==='hoops'){add('🏀 סלים: '+G.scored.size+' מתוך '+lv.hoops.length);add(G.hasBall?'✋ הכדור אצלך':'🔎 הכדור על הרצפה');}
  if(id==='ski')add('🚩 שערים: '+G.gatesDone.size+' מתוך '+lv.gates.length);
  if(id==='swim')add(G.raceOn?'🏊 המרוץ בעיצומו!':'🏊 זזים כדי להתחיל');
  if(id==='tennis')add('🎾 חבטות: '+G.hits+' מתוך '+G.cfg.hits);
  if(id==='hurdles'){const left=G.timeLeft==null?Math.round(lv.cost*G.cfg.msPer*1.3)+8000:Math.max(0,G.timeLeft-(performance.now()-G.raceT0));add('⏱ '+Math.ceil(left/1000)+' שניות');}
  if(id==='golf')add('⛳ חבטות: '+G.strokes+' · פאר '+lv.par);
  if(id==='dojo'){const s=add(G.phase?'🟥 עכשיו פתוח: אדום':'🟦 עכשיו פתוח: כחול');s.style.background=G.phase?'#ffd6d6':'#d6e6ff';s.style.color='#2a2140';}
}
/* ---------- sports drawing ---------- */
function drawSoccerBall(c,x,y,r,rot){c.save();c.translate(x,y);c.rotate(rot||0);circle(c,0,0,r,'#ffffff');c.strokeStyle='#2a2140';c.lineWidth=Math.max(1,r*.12);c.beginPath();c.arc(0,0,r,0,7);c.stroke();
  c.fillStyle='#2a2140';c.beginPath();for(let i=0;i<5;i++){const a=i/5*Math.PI*2-Math.PI/2;c.lineTo(Math.cos(a)*r*.38,Math.sin(a)*r*.38);}c.fill();
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2-Math.PI/2;circle(c,Math.cos(a)*r*.85,Math.sin(a)*r*.85,r*.18,'#2a2140');}c.restore();}
function drawBasketball(c,x,y,r){circle(c,x,y,r,'#f77f00');c.strokeStyle='#5a2a00';c.lineWidth=Math.max(1,r*.1);c.beginPath();c.arc(x,y,r,0,7);c.moveTo(x-r,y);c.lineTo(x+r,y);c.moveTo(x,y-r);c.lineTo(x,y+r);c.stroke();
  c.beginPath();c.arc(x-r*1.1,y,r*.75,-.9,.9);c.stroke();c.beginPath();c.arc(x+r*1.1,y,r*.75,Math.PI-.9,Math.PI+.9);c.stroke();}
function drawHoop(c,x,y,r,done){c.fillStyle='#ffffff';c.strokeStyle='#2a2140';c.lineWidth=Math.max(1,r*.08);rrect(c,x-r*.7,y-r*.85,r*1.4,r*.9,r*.08);c.fill();c.stroke();
  c.strokeStyle='#e63946';c.strokeRect(x-r*.28,y-r*.6,r*.56,r*.42);
  c.strokeStyle=done?'#2a9d5c':'#ff6b1a';c.lineWidth=Math.max(2,r*.14);c.beginPath();c.ellipse(x,y+r*.1,r*.42,r*.13,0,0,7);c.stroke();
  c.strokeStyle='rgba(255,255,255,.95)';c.lineWidth=Math.max(1,r*.05);c.beginPath();for(let i=-2;i<=2;i++){c.moveTo(x+i*r*.18,y+r*.15);c.lineTo(x+i*r*.1,y+r*.6);}c.stroke();
  if(done){c.font='bold '+Math.round(r*.6)+'px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#2a9d5c';c.fillText('✓',x+r*.55,y-r*.75);}}
function drawTree(c,x,y,r){c.fillStyle='#6b4423';c.fillRect(x-r*.1,y+r*.35,r*.2,r*.35);c.fillStyle='#2d6a4f';
  for(let i=0;i<3;i++){c.beginPath();c.moveTo(x,y-r*.85+i*r*.3);c.lineTo(x-r*(.4+i*.13),y-r*.2+i*r*.3);c.lineTo(x+r*(.4+i*.13),y-r*.2+i*r*.3);c.fill();}
  c.fillStyle='#ffffff';c.beginPath();c.moveTo(x,y-r*.85);c.lineTo(x-r*.18,y-r*.55);c.lineTo(x+r*.18,y-r*.55);c.fill();}
function drawFlagPole(c,x,y,r,col){c.fillStyle='#5d6d7e';c.fillRect(x-r*.05,y-r*.8,r*.1,r*1.5);c.fillStyle=col;c.beginPath();c.moveTo(x+r*.05,y-r*.8);c.lineTo(x+r*.6,y-r*.6);c.lineTo(x+r*.05,y-r*.4);c.fill();}
function drawTennisBall(c,x,y,r){circle(c,x,y,r,'#d4ff3a');c.strokeStyle='#ffffff';c.lineWidth=Math.max(1,r*.15);c.beginPath();c.arc(x-r*.9,y,r*.75,-.9,.9);c.stroke();c.beginPath();c.arc(x+r*.9,y,r*.75,Math.PI-.9,Math.PI+.9);c.stroke();}
function drawHurdle(c,x,y,r){c.fillStyle='#ffffff';c.fillRect(x-r*.75,y-r*.3,r*1.5,r*.22);c.fillStyle='#e63946';for(let i=0;i<3;i++)c.fillRect(x-r*.75+i*r*.55,y-r*.3,r*.25,r*.22);
  c.fillStyle='#5d6d7e';c.fillRect(x-r*.7,y-r*.1,r*.1,r*.6);c.fillRect(x+r*.6,y-r*.1,r*.1,r*.6);}
function drawJudoka(c,x,y,r,asleep){c.globalAlpha=asleep?.35:1;circle(c,x,y+r*.25,r*.55,'#ffffff');c.strokeStyle='#2a2140';c.lineWidth=Math.max(1,r*.06);c.beginPath();c.arc(x,y+r*.25,r*.55,0,7);c.stroke();
  c.fillStyle='#2a2140';c.fillRect(x-r*.55,y+r*.3,r*1.1,r*.12);circle(c,x,y-r*.35,r*.32,'#f5c99b');eyes(c,x,y-r*.38,r,.12,.06);c.globalAlpha=1;
  if(asleep){c.fillStyle='#2a2140';c.font='bold '+Math.round(r*.5)+'px sans-serif';c.textAlign='center';c.fillText('💫',x+r*.5,y-r*.6);}}
function drawDefender(c,x,y,r,col){circle(c,x,y+r*.2,r*.55,col);circle(c,x,y-r*.35,r*.32,'#f5c99b');eyes(c,x,y-r*.38,r,.12,.06);
  c.fillStyle='#ffffff';c.font='bold '+Math.round(r*.45)+'px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('✋',x+r*.55,y);}
function spDraw(s,n,W,now){
  const id=G.W.id,lv=G.lv;
  if(id==='soccer'){
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){ctx.fillStyle=y%2?'#4caf50':'#43a047';ctx.fillRect(x*s,y*s,s+1,s+1);}
    ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=Math.max(1.5,s*.05);ctx.strokeRect(s*.08,s*.08,W-s*.16,W-s*.16);
    ctx.beginPath();ctx.moveTo(0,W/2);ctx.lineTo(W,W/2);ctx.stroke();ctx.beginPath();ctx.arc(W/2,W/2,s*1.2,0,7);ctx.stroke();
    ctx.strokeRect((lv.goal.x-1)*s,0,s*3,s*1.6);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(lv.t[y][x]){const cx=(x+.5)*s,cy=(y+.5)*s;
      if(y===0){ctx.fillStyle='#ffffff';ctx.fillRect(cx-s*.12,cy-s*.45,s*.24,s*.9);continue;}
      ctx.fillStyle='#ff7b00';ctx.beginPath();ctx.moveTo(cx,cy-s*.38);ctx.lineTo(cx-s*.28,cy+s*.3);ctx.lineTo(cx+s*.28,cy+s*.3);ctx.fill();ctx.fillStyle='#ffffff';ctx.fillRect(cx-s*.18,cy,s*.36,s*.08);ctx.fillStyle='#d35400';ctx.fillRect(cx-s*.36,cy+s*.28,s*.72,s*.1);}
    // the net
    const gx=lv.goal.x*s,gy=0;ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(gx,gy,s,s);ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=1;ctx.beginPath();
    for(let i=1;i<5;i++){ctx.moveTo(gx+i*s/5,gy);ctx.lineTo(gx+i*s/5,gy+s);ctx.moveTo(gx,gy+i*s/5);ctx.lineTo(gx+s,gy+i*s/5);}ctx.stroke();
  }else if(id==='hoops'){
    ctx.fillStyle='#e9b872';ctx.fillRect(0,0,W,W);ctx.strokeStyle='rgba(140,90,40,.18)';ctx.lineWidth=1;ctx.beginPath();for(let i=1;i<n*2;i++){ctx.moveTo(i*s/2,0);ctx.lineTo(i*s/2,W);}ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=Math.max(1.5,s*.05);ctx.beginPath();ctx.arc(W/2,W/2,s*1.3,0,7);ctx.stroke();
    drawTrail(s,'rgba(255,255,255,.35)');drawWalls(lv.g,n,s,'#7a4a1f');
    lv.hoops.forEach(h=>drawHoop(ctx,(h.x+.5)*s,(h.y+.5)*s,s*.42,G.scored.has(h.x+','+h.y)));
    if(G.ballAt)drawBasketball(ctx,(G.ballAt.x+.5)*s,(G.ballAt.y+.62)*s+Math.abs(Math.sin(now/200))*-s*.08,s*.22);
  }else if(id==='ski'){
    const grd=ctx.createLinearGradient(0,0,0,W);grd.addColorStop(0,'#ffffff');grd.addColorStop(1,'#e3f2fd');ctx.fillStyle=grd;ctx.fillRect(0,0,W,W);
    ctx.strokeStyle='rgba(120,160,200,.25)';ctx.lineWidth=Math.max(1,s*.04);ctx.beginPath();G.trail.forEach(k=>{const [x,y]=k.split(',').map(Number);ctx.moveTo((x+.38)*s,y*s);ctx.lineTo((x+.38)*s,(y+1)*s);ctx.moveTo((x+.62)*s,y*s);ctx.lineTo((x+.62)*s,(y+1)*s);});ctx.stroke();
    lv.gates.forEach((g,i)=>{const done=G.gatesDone.has(i),col=i%2?'#1982c4':'#e63946';
      ctx.fillStyle=done?'rgba(42,157,92,.18)':'rgba(255,210,63,.18)';ctx.fillRect(g.x1*s,g.y*s,(g.x2-g.x1+1)*s,s);
      if(g.x1>0)drawFlagPole(ctx,(g.x1-.5)*s,(g.y+.55)*s,s*.4,done?'#2a9d5c':col);if(g.x2<n-1)drawFlagPole(ctx,(g.x2+1.5)*s,(g.y+.55)*s,s*.4,done?'#2a9d5c':col);});
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(lv.t[y][x]===1)drawTree(ctx,(x+.5)*s,(y+.5)*s,s*.45);
    ctx.fillStyle='rgba(42,33,64,.8)';for(let x=0;x<n*2;x++)if(x%2)ctx.fillRect(x*s/2,W-s*.18,s/2,s*.18);
  }else if(id==='swim'){
    ctx.fillStyle='#48cae4';ctx.fillRect(0,0,W,W);
    for(let i=0;i<n;i++){ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=Math.max(1,s*.03);ctx.beginPath();for(let x=0;x<n;x++){const yy=(i+.5)*s+Math.sin(now/300+x+i)*s*.05;ctx.moveTo(x*s,yy);ctx.quadraticCurveTo((x+.5)*s,yy-s*.08,(x+1)*s,yy);}ctx.stroke();}
    ctx.fillStyle='#0077b6';ctx.fillRect(W-s*.12,(n-1)*s,s*.12,s);
    // lane ropes: red and white floats
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){const c=lv.g[y][x];
      if(y<n-1&&c[2])for(let k=0;k<3;k++)circle(ctx,x*s+s*(.17+k*.33),(y+1)*s,s*.08,(x*3+k)%2?'#ffffff':'#e63946');
      if(x<n-1&&c[1])for(let k=0;k<3;k++)circle(ctx,(x+1)*s,y*s+s*(.17+k*.33),s*.08,(y*3+k)%2?'#ffffff':'#ffd23f');}
    const [rx,ry]=glide(G.rivalObj||(G.rivalObj={}),...lv.rival[G.rivalI]);ctx.globalAlpha=.55;drawChar(ctx,{draw:drawDuck,id:'duck'},(rx+.5)*s,(ry+.5)*s,s*.38,{});ctx.globalAlpha=1;
  }else if(id==='tennis'){
    ctx.fillStyle='#1f7a8c';ctx.fillRect(0,0,W,W);ctx.fillStyle='#2a9d8f';ctx.fillRect(s*.3,s*.3,W-s*.6,W-s*.6);
    ctx.strokeStyle='#ffffff';ctx.lineWidth=Math.max(1.5,s*.06);ctx.strokeRect(s*.3,s*.3,W-s*.6,W-s*.6);ctx.beginPath();ctx.moveTo(W/2,s*.3);ctx.lineTo(W/2,W-s*.3);ctx.stroke();
    const ny=Math.floor(n/2);ctx.fillStyle='rgba(255,255,255,.55)';for(let x=0;x<n*4;x++)if(x%2)ctx.fillRect(x*s/4,ny*s+s*.45,s/4,s*.1);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(lv.t[y][x]){const cx=(x+.5)*s,cy=(y+.5)*s;ctx.fillStyle='#ff9f1c';rrect(ctx,cx-s*.32,cy-s*.32,s*.64,s*.64,s*.12);ctx.fill();ctx.fillStyle='#ffd166';ctx.fillRect(cx-s*.2,cy-s*.05,s*.4,s*.1);}
  }else if(id==='hurdles'){
    ctx.fillStyle='#c0522b';ctx.fillRect(0,0,W,W);ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=Math.max(1,s*.03);ctx.beginPath();for(let i=1;i<n;i++){ctx.moveTo(0,i*s);ctx.lineTo(W,i*s);}ctx.stroke();
    lv.mud.forEach(m=>{ctx.fillStyle='#5d4037';ctx.beginPath();ctx.ellipse((m.x+.5)*s,(m.y+.5)*s,s*.45,s*.38,0,0,7);ctx.fill();circle(ctx,(m.x+.35)*s,(m.y+.4)*s,s*.08,'#795548');circle(ctx,(m.x+.62)*s,(m.y+.6)*s,s*.06,'#795548');});
    drawTrail(s,'rgba(255,255,255,.3)');drawWalls(lv.g,n,s,'#2e7d32');
    lv.hurd.forEach(h=>drawHurdle(ctx,(h.x+.5)*s,(h.y+.5)*s,s*.45));
  }else if(id==='golf'){
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){const v=lv.t[y][x],X=x*s,Y=y*s;
      ctx.fillStyle=(x+y)%2?'#7bc950':'#72bf47';ctx.fillRect(X,Y,s+1,s+1);
      if(v===2){ctx.fillStyle='#f2d49b';ctx.beginPath();ctx.ellipse(X+s/2,Y+s/2,s*.48,s*.42,0,0,7);ctx.fill();ctx.fillStyle='#e0bc7a';circle(ctx,X+s*.35,Y+s*.4,s*.04,'#d4a95f');circle(ctx,X+s*.6,Y+s*.6,s*.04,'#d4a95f');}
      if(v===3){ctx.fillStyle='#3a86ff';ctx.beginPath();ctx.ellipse(X+s/2,Y+s/2,s*.48,s*.42,0,0,7);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=Math.max(1,s*.04);ctx.beginPath();ctx.arc(X+s/2,Y+s*.55,s*.18,Math.PI*1.1,Math.PI*1.9);ctx.stroke();}
      if(v===1){circle(ctx,X+s*.5,Y+s*.55,s*.42,'#2d6a4f');circle(ctx,X+s*.35,Y+s*.4,s*.25,'#40916c');circle(ctx,X+s*.65,Y+s*.42,s*.22,'#40916c');}}
    drawTrail(s,'rgba(255,255,255,.3)');
  }else if(id==='dojo'){
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){const v=lv.t[y][x],X=x*s,Y=y*s,open=GEN.dojoOpen(lv.t,x,y,G.phase);
      ctx.fillStyle=v===1?(open?'#3a86ff':'#a9c5f5'):v===2?(open?'#ef476f':'#f5b5c4'):v===3?'#6d4c41':'#f6efe0';ctx.fillRect(X,Y,s+1,s+1);
      ctx.strokeStyle='rgba(0,0,0,.12)';ctx.lineWidth=1;ctx.strokeRect(X+1,Y+1,s-2,s-2);
      if(v===3){ctx.fillStyle='#4e342e';ctx.fillRect(X+s*.3,Y+s*.1,s*.4,s*.8);ctx.fillStyle='#8d6e63';ctx.fillRect(X+s*.3,Y+s*.1,s*.4,s*.12);}
      if((v===1||v===2)&&!open){ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=Math.max(1,s*.05);ctx.beginPath();ctx.moveTo(X+s*.3,Y+s*.3);ctx.lineTo(X+s*.7,Y+s*.7);ctx.moveTo(X+s*.7,Y+s*.3);ctx.lineTo(X+s*.3,Y+s*.7);ctx.stroke();}}
  }
}
function spDraw2(s,n,W,now){
  const id=G.W.id,lv=G.lv;
  const lock=on=>{if(!on)return;const X=lv.goal.x*s,Y=lv.goal.y*s;ctx.fillStyle='rgba(20,15,40,.45)';rrect(ctx,X+s*.08,Y+s*.08,s*.84,s*.84,s*.14);ctx.fill();glyph('🔒',X+s/2,Y+s*.52,s*.42,1);};
  if(id==='soccer'){
    const bx0=G.ball.x,by0=G.ball.y,ddx=bx0-G.p.x,ddy=by0-G.p.y;
    if(!G.roll&&Math.abs(ddx)+Math.abs(ddy)===1){const d=ddy<0?0:ddx>0?1:ddy>0?2:3,r=GEN.soccerRoll(lv.t,n,bx0,by0,d,lv.goal,(a,b)=>spBlockedByDef(a,b));
      if(r.path.length){const col=r.goal?'rgba(255,235,59,.95)':'rgba(255,255,255,.8)';ctx.strokeStyle=col;ctx.lineWidth=Math.max(2,s*.08);ctx.setLineDash([s*.12,s*.14]);ctx.lineDashOffset=-now/30;
        ctx.beginPath();ctx.moveTo((bx0+.5)*s,(by0+.5)*s);const [ex,ey]=r.path[r.path.length-1];ctx.lineTo((ex+.5)*s,(ey+.5)*s);ctx.stroke();ctx.setLineDash([]);
        if(r.goal){glyph('⭐',(ex+.5)*s,(ey+.5)*s,s*.4,1);}
        else{ctx.strokeStyle=col;ctx.lineWidth=Math.max(2,s*.07);ctx.beginPath();ctx.arc((ex+.5)*s,(ey+.5)*s,s*.22,0,7);ctx.stroke();}}}
    if(G.kickHint&&now<G.kickHint.until){const h=G.kickHint,cx=(h.x+.5)*s,cy=(h.y+.5)*s;ctx.globalAlpha=.45+.35*Math.sin(now/150);circle(ctx,cx,cy,s*.45,'#ffeb3b');ctx.globalAlpha=1;
      ctx.save();ctx.translate(cx,cy);ctx.rotate([-Math.PI/2,0,Math.PI/2,Math.PI][h.d]);ctx.fillStyle='#ff5d8f';ctx.beginPath();ctx.moveTo(s*.95,0);ctx.lineTo(s*.62,-s*.25);ctx.lineTo(s*.62,s*.25);ctx.fill();ctx.fillRect(s*.3,-s*.08,s*.35,s*.16);ctx.restore();}
    G.defs.forEach(m=>{const [x,y]=glide(m,...m.cells[m.i]);drawDefender(ctx,(x+.5)*s,(y+.5)*s,s*.4,'#3a0ca3');});
    const [bx,by]=glide(G.ballVis||(G.ballVis={}),G.ball.x,G.ball.y);drawSoccerBall(ctx,(bx+.5)*s,(by+.5)*s,s*.28,(bx+by)*2);}
  if(id==='hoops'){lock(G.scored.size<lv.hoops.length);G.defs.forEach(m=>{const [x,y]=glide(m,...m.cells[m.i]);drawDefender(ctx,(x+.5)*s,(y+.5)*s,s*.4,'#3a0ca3');});
    if(G.throwA){const a=G.throwA,tot=a.cells.length,e=Math.min(1,(now-a.t0)/(tot*60+120)),[ex,ey]=a.cells[tot-1],x=G.p.x+(ex-G.p.x)*e,y=G.p.y+(ey-G.p.y)*e-Math.sin(e*Math.PI)*Math.min(1.5,tot*.35);
      drawBasketball(ctx,(x+.5)*s,(y+.5)*s,s*.22);}}
  if(id==='tennis'){lock(G.hits<G.cfg.hits);const b=G.tball,[x,y]=glide(b.v||(b.v={}),b.x,b.y);ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse((x+.5)*s,(y+.75)*s,s*.16,s*.05,0,0,7);ctx.fill();drawTennisBall(ctx,(x+.5)*s,(y+.45)*s,s*.24);}
  if(id==='dojo')G.opp.forEach(m=>{const [x,y]=glide(m,...m.cells[m.i]);drawJudoka(ctx,(x+.5)*s,(y+.5)*s,s*.42,m.out>now);});
  if(id==='golf'){ctx.fillStyle='#ffffff';circle(ctx,(G.vis.x+.72)*s,(G.vis.y+.78)*s,s*.12,'#ffffff');ctx.strokeStyle='#bbb';ctx.lineWidth=1;ctx.beginPath();ctx.arc((G.vis.x+.72)*s,(G.vis.y+.78)*s,s*.12,0,7);ctx.stroke();}
  if(id==='hoops'&&G.hasBall)drawBasketball(ctx,(G.vis.x+.78)*s,(G.vis.y+.72)*s,s*.16);
  // a little arrow shows which way the throw or the jump will go
  if((id==='hoops'&&G.hasBall&&!G.throwA)||(id==='hurdles'&&!G.jump)){const aim=id==='hoops'?hoopAim():null,d=aim!=null?aim:(G.face4==null?1:G.face4),cx=(G.vis.x+.5)*s,cy=(G.vis.y+.5)*s;
    // green arrow: a hoop is in line, the throw will go in
    if(aim!=null){const L=hoopLine(aim);ctx.strokeStyle='rgba(42,157,92,.45)';ctx.lineWidth=Math.max(2,s*.08);ctx.setLineDash([s*.12,s*.12]);ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo((L.hit.x+.5)*s,(L.hit.y+.5)*s);ctx.stroke();ctx.setLineDash([]);}
    ctx.save();ctx.translate(cx,cy);ctx.rotate([-Math.PI/2,0,Math.PI/2,Math.PI][d]);ctx.globalAlpha=.55+.25*Math.sin(now/200);ctx.fillStyle=id==='hoops'?(aim!=null?'#2a9d5c':'#f77f00'):'#ffffff';
    ctx.beginPath();ctx.moveTo(s*.78,0);ctx.lineTo(s*.56,-s*.14);ctx.lineTo(s*.56,s*.14);ctx.fill();ctx.restore();ctx.globalAlpha=1;}
  if(id==='ski'&&performance.now()<G.stunUntil){ctx.font=Math.round(s*.4)+'px sans-serif';ctx.textAlign='center';ctx.fillText('💫',(G.vis.x+.5)*s,(G.vis.y)*s);}
  if(id==='hurdles'&&G.stuck){ctx.font=Math.round(s*.35)+'px sans-serif';ctx.textAlign='center';ctx.fillText('💦',(G.vis.x+.75)*s,(G.vis.y+.2)*s);}
}
kit(SPORT,{move:spMove,tick:spTick,hud:spHud,draw:spDraw,draw2:spDraw2,action:spAction});
