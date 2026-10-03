/* ================= fairy-tale land: playing ================= */
const SNOWI=['❄️','🔥'],SNOWN=['פתית שלג','להבה'];
const SAVA=['🦒','🐘','🦓','🦛'],SAVF=['🍃','🥜','🌾','🍉'],SAVN=['הג׳ירפה','הפיל','הזברה','ההיפופוטם'];
function ftFresh(lv){
  const ft=lv.items&&Array.isArray(lv.gates);
  return {ftGates:ft?lv.gates.map(q=>Object.assign({},q)):[],ftItems:ft?lv.items.map(q=>Object.assign({},q)):[],inv:[0,0,0,0],frozen:new Set(),
    stT0:performance.now(),safeP:{x:lv.start.x,y:lv.start.y},
    ct:lv.sol&&lv.t?lv.t.map(r=>r.slice()):null,wishLeft:null,wishArm:false,puff:null,
    stepsUsed:0,slipperGot:false,wandsLeft:(lv.wands||[]).map(q=>Object.assign({},q)),
    rlT0:performance.now(),...rhFresh(lv),...stFresh(lv),...pzFresh(lv),...wzFresh(lv),...vhFresh(lv)};
}
function ftAction(){
  if(!G||G.done)return;
  if(G.W.id==='carpet'){if(G.wishLeft==null)G.wishLeft=G.cfg.wishes;
    if(G.wishArm){G.wishArm=false;toast('המשאלה מחכה 🪔');updateHud();return;}
    if(G.wishLeft<=0){toast('נגמרו המשאלות 🪔 אפשר להתחיל מחדש');return;}
    G.wishArm=true;[660,880,1100].forEach((f,i)=>setTimeout(()=>beep(f,.08,'sine'),i*60));toast('✨ משאלה! עכשיו בחרי כיוון, והסלע הראשון שם ייעלם');updateHud();}
}
function rlPhase(now){const c=G.cfg,T=c.green+800+c.red,ph=(now-G.rlT0)%T;return ph<c.green?0:ph<c.green+800?1:2;}
function herdAt(h,now){const P=G.cfg.period,n=G.lv.n,ph=(((now-G.stT0)/P+h.off)%1)*P,run=n*110;
  if(ph<1500)return {warn:true};if(ph<1500+run){const k=(ph-1500)/110;return {x:h.dir>0?k-.5:n-.5-k};}return {};}
function ftMove(d){
  const id=G.W.id,lv=G.lv,n=lv.n,x=G.p.x,y=G.p.y,nx=x+DV[d][0],ny=y+DV[d][1];
  if(id==='snow'||id==='savanna'){
    if(lv.g[y][x][d]){bumpWall(d);return;}
    const gi=G.ftGates.findIndex(q=>q.x===nx&&q.y===ny);
    if(gi>=0){const q=G.ftGates[gi];
      if(G.inv[q.c]<=0){bumpWall(d);arcSay(id==='snow'?(q.c?'קיר קרח! 🧊 צריך להבה 🔥 כדי להמיס אותו':'מים! 🌊 צריך פתית שלג ❄️ כדי להקפיא גשר'):SAVN[q.c]+' '+SAVA[q.c]+' רעבה. היא רוצה '+SAVF[q.c]);return;}
      G.inv[q.c]--;G.ftGates.splice(gi,1);sparkle(nx,ny,id==='snow'?['#caf0f8','#ffffff']:['#ffd23f','#95d5b2'],12);
      if(id==='snow'){if(!q.c)G.frozen.add(nx+','+ny);[1200,1500,1800].forEach((f,i)=>setTimeout(()=>beep(f,.07,'sine'),i*60));toast(q.c?'הקרח נמס! 💧':'המים קפאו לגשר! ❄️');}
      else{beep(300,.15,'triangle');setTimeout(()=>beep(500,.12,'sine'),120);toast(SAVN[q.c]+' אכלה '+SAVF[q.c]+' וזזה הצידה. תודה! '+SAVA[q.c]);}
      updateHud();}
    G.p={x:nx,y:ny};enter(nx,ny);
    const ii=G.ftItems.findIndex(q=>q.x===nx&&q.y===ny);
    if(ii>=0){const q=G.ftItems[ii];G.ftItems.splice(ii,1);G.inv[q.c]++;[660,880].forEach((f,i)=>setTimeout(()=>beep(f,.08,'sine'),i*70));
      toast(id==='snow'?'מצאת '+SNOWN[q.c]+' '+SNOWI[q.c]:'מצאת '+SAVF[q.c]+'! מי רוצה את זה?');updateHud();}
    if(id==='savanna'&&!(lv.herds||[]).some(h=>h.y===ny))G.safeP={x:nx,y:ny};
    if(atGoal())win();return;
  }
  if(id==='lagoon'){const r=GEN.lagStep(lv.t,n,x,y,d);
    if(!r){bumpWall(d);if(nwIn(n,nx,ny)&&lv.t[ny][nx]!==2)arcSay(lv.t[ny][nx]===1?'בשביל לקפוץ למים צריך קודם לעמוד על צדף 🐚':'בשביל לצאת מהמים צריך לעלות על צדף 🐚');return;}
    const was=lv.t[y][x];G.p={x:nx,y:ny};enter(nx,ny);const now=lv.t[ny][nx];
    if(was===3&&now===1){beep(500,.1,'sine');beep(800,.12,'sine');sparkle(nx,ny,['#4cc9f0','#ffffff'],10);arcSay('שפריץ! 🧜‍♀️ יש לך זנב');}
    else if(was===3&&now===0){beep(700,.1,'sine');arcSay('רגליים! 🦶 חזרת ליבשה');}
    else beep(now===1?440:520,.03,'sine');
    if(was===3)updateHud();
    if(atGoal())win();return;
  }
  if(id==='carpet'){if(G.anim)return;if(G.wishLeft==null)G.wishLeft=G.cfg.wishes;
    if(G.wishArm){const r=GEN.carpetRock(G.ct,n,x,y,d);
      if(!r){bumpWall(d);toast('אין סלע בכיוון הזה 🪔 נסי כיוון אחר');return;}
      G.ct[r[1]][r[0]]=0;G.wishArm=false;G.wishLeft--;G.puff={x:r[0],y:r[1],t0:performance.now()};sparkle(r[0],r[1],['#c77dff','#ffd23f'],16);
      [1000,1300,1600].forEach((f,i)=>setTimeout(()=>beep(f,.08,'sine'),i*60));updateHud();}
    const f=GEN.carpetFly(G.ct,n,x,y,d,lv.goal);if(!f.cells.length){bumpWall(d);return;}
    G.anim={cells:f.cells,i:0,t:0,ms:70};G.moves=(G.moves||0);beep(520,.1,'sine');return;
  }
  if(id==='ball'){
    if(lv.g[y][x][d]){bumpWall(d);return;}
    if(nx===lv.goal.x&&ny===lv.goal.y&&!G.slipperGot){bumpWall(d);arcSay('בלי נעל הזכוכית 👠 לא נכנסים לנשף! חפשי אותה');return;}
    G.p={x:nx,y:ny};G.stepsUsed++;enter(nx,ny);beep(520,.03,'sine');
    if(nx===lv.slipper.x&&ny===lv.slipper.y&&!G.slipperGot){G.slipperGot=true;sparkle(nx,ny,['#caf0f8','#ffffff','#ffd23f'],16);[784,988,1175,1568].forEach((f,i)=>setTimeout(()=>beep(f,.1,'sine'),i*80));toast('נעל הזכוכית! 👠 עכשיו מהר לארמון');}
    const wi=G.wandsLeft.findIndex(q=>q.x===nx&&q.y===ny);
    if(wi>=0){G.wandsLeft.splice(wi,1);G.stepsUsed=Math.max(0,G.stepsUsed-G.cfg.bonus);sparkle(nx,ny,['#ffd23f','#ff8fab'],14);toast('שרביט קסמים! ✨ השעון חזר '+G.cfg.bonus+' דקות אחורה');}
    if(atGoal()){win();return;}
    if(G.stepsUsed>=lv.steps){[523,523,523].forEach((f,i)=>setTimeout(()=>beep(f,.25,'triangle'),i*350));
      G.p={x:lv.start.x,y:lv.start.y};G.stepsUsed=0;G.slipperGot=false;G.wandsLeft=(lv.wands||[]).map(q=>Object.assign({},q));G.hits=(G.hits||0)+1;G.hurtUntil=performance.now()+1500;
      toast('דינג דונג! 🕛 השעון צלצל 12. מתחילים שוב מההתחלה');}
    updateHud();return;
  }
  if(id==='toyroom'){
    if(lv.g[y][x][d]){bumpWall(d);return;}
    const hide=k=>lv.hides.some(h=>h.x===k.x&&h.y===k.y),ph=rlPhase(performance.now());
    G.p={x:nx,y:ny};enter(nx,ny);
    if(ph===2&&!hide({x,y})&&!hide({x:nx,y:ny})){arcHurt('אופס! 👀 הילדה ראתה אותך זזה. חוזרים לשמיכה האחרונה',G.safeP,false);return;}
    if(hide({x:nx,y:ny})&&(G.safeP.x!==nx||G.safeP.y!==ny)){G.safeP={x:nx,y:ny};beep(700,.08,'sine');arcSay('מתחבאת מתחת לשמיכה 🧺');}
    else beep(520,.03,'sine');
    if(atGoal())win();return;
  }
}
function ftHint(){
  if(!G||G.done||G.anim)return false;const id=G.W.id,lv=G.lv;
  if(id==='carpet'){if(G.wishLeft==null)G.wishLeft=G.cfg.wishes;const R=GEN.carpetSolve(G.ct,lv.n,G.p,lv.goal,G.wishLeft,40000);
    if(!R){toast('מכאן אי אפשר להגיע. נסי להתחיל מחדש');return true;}
    G.hint={d:R.sol[0].d,until:performance.now()+1800};if(R.sol[0].wish)toast('כאן צריך משאלה 🪔 ואז לטוס לכיוון החץ');return true;}
  if(id==='lagoon'){const s=GEN.lagSolve(lv.t,lv.n,G.p,lv.goal);if(s&&s.length){G.hint={d:s[0],until:performance.now()+1800};}return true;}
  return false;
}
function ftTick(now){
  const id=G.W.id;
  if(id==='savanna'&&now>G.hurtUntil){for(const h of G.lv.herds||[]){if(G.p.y!==h.y)continue;const a=herdAt(h,now);if(a.x!=null&&Math.abs(a.x-G.p.x)<.7){arcHurt('עדר! 🐃 העדר דחף אותך. מחכים בצד עד שהאבק עובר',G.safeP,true);break;}}}
  if(id==='toyroom'){const ph=rlPhase(now);if(ph!==G.rlLast){G.rlLast=ph;updateHud();if(ph===1)beep(300,.15,'triangle');if(ph===2)beep(200,.2,'triangle');if(ph===0)beep(600,.08,'sine');}}
}
function ftHud(add){
  const id=G.W.id,lv=G.lv;
  if(id==='snow')add('❄️ '+G.inv[0]+' · 🔥 '+G.inv[1]);
  if(id==='savanna'){const have=G.inv.map((v,i)=>v?SAVF[i].repeat(v):'').join('');add(have?'🧺 '+have:'🧺 הסל ריק');}
  if(id==='lagoon')add(G.lv.t[G.p.y][G.p.x]===1?'🧜‍♀️ זנב של בת ים':'🦶 רגליים');
  if(id==='carpet'){if(G.wishLeft==null)G.wishLeft=G.cfg.wishes;const s=add('🪔 משאלות: '+G.wishLeft+(G.wishArm?' · ✨ מוכנה!':''));if(G.wishArm){s.style.background='#f3e8ff';s.style.color='#2a2140';}}
  if(id==='ball'){const left=Math.max(0,lv.steps-G.stepsUsed),m=60-left,clock=m>=0?'11:'+String(m).padStart(2,'0'):'10:'+String(120-left).padStart(2,'0');
    const s=add('🕰️ '+clock+' · עוד '+left+' · 👠 '+(G.slipperGot?'✓':'?'));if(left<=8){s.style.background='#ffd6d6';s.style.color='#2a2140';}}
  if(id==='toyroom'){const ph=rlPhase(performance.now()),s=add(ph===0?'🙈 הילדה משחקת: זזים!':ph===1?'⚠️ היא מסתובבת...':'👀 היא מסתכלת! לא זזים');s.style.background=ph===0?'#d8f3dc':ph===1?'#fff3bf':'#ffd6d6';s.style.color='#2a2140';}
}
/* friends and goals */
function drawSnowPalace(c,x,y,r){
  c.fillStyle='#caf0f8';c.fillRect(x-r*.6,y-r*.1,r*1.2,r*.75);
  [[-.45,.55],[0,.8],[.45,.55]].forEach(([a,h])=>{c.fillStyle='#90e0ef';c.fillRect(x+a*r-r*.13,y-h*r,r*.26,h*r);c.fillStyle='#48cae4';c.beginPath();c.moveTo(x+a*r-r*.18,y-h*r);c.lineTo(x+a*r,y-(h+.3)*r);c.lineTo(x+a*r+r*.18,y-h*r);c.fill();});
  c.fillStyle='#0077b6';rrect(c,x-r*.15,y+r*.25,r*.3,r*.4,r*.12);c.fill();c.globalAlpha=.8;star(c,x,y-r*1.05,r*.12);c.globalAlpha=1;
}
function drawSunRock(c,x,y,r){
  c.fillStyle='#ffb703';c.beginPath();c.arc(x+r*.25,y-r*.25,r*.42,0,7);c.fill();
  c.fillStyle='#9c6644';c.beginPath();c.moveTo(x-r*.8,y+r*.6);c.lineTo(x-r*.5,y-r*.1);c.lineTo(x+r*.2,y-r*.2);c.lineTo(x+r*.05,y+r*.05);c.lineTo(x+r*.7,y+r*.6);c.fill();
  c.fillStyle='#7f5539';c.beginPath();c.moveTo(x-r*.5,y-r*.1);c.lineTo(x+r*.2,y-r*.2);c.lineTo(x+r*.25,y-r*.12);c.lineTo(x-r*.48,y-r*.02);c.fill();
}
function drawGrotto(c,x,y,r){
  c.fillStyle='#6d597a';c.beginPath();c.arc(x,y+r*.2,r*.75,Math.PI,0);c.lineTo(x+r*.75,y+r*.6);c.lineTo(x-r*.75,y+r*.6);c.fill();
  c.fillStyle='#2b2d42';c.beginPath();c.arc(x,y+r*.4,r*.42,Math.PI,0);c.lineTo(x+r*.42,y+r*.6);c.lineTo(x-r*.42,y+r*.6);c.fill();
  [['#ffd23f',-.25,.35],['#ff8fab',.05,.45],['#caf0f8',.28,.38]].forEach(([col,a,b])=>circle(c,x+a*r,y+b*r,r*.1,col));
  c.fillStyle='#ff8fab';c.beginPath();c.ellipse(x-r*.55,y-r*.3,r*.12,r*.2,-.4,0,7);c.fill();
}
function drawPalace(c,x,y,r){
  c.fillStyle='#f6bd60';c.fillRect(x-r*.65,y-r*.05,r*1.3,r*.7);
  c.fillStyle='#f28482';c.beginPath();c.arc(x,y-r*.1,r*.38,Math.PI,0);c.fill();c.beginPath();c.moveTo(x-r*.06,y-r*.48);c.lineTo(x,y-r*.75);c.lineTo(x+r*.06,y-r*.48);c.fill();
  [-.55,.55].forEach(a=>{c.fillStyle='#f6bd60';c.fillRect(x+a*r-r*.1,y-r*.45,r*.2,r*.45);c.fillStyle='#f28482';c.beginPath();c.arc(x+a*r,y-r*.45,r*.13,Math.PI,0);c.fill();});
  c.fillStyle='#84a59d';rrect(c,x-r*.14,y+r*.25,r*.28,r*.4,r*.14);c.fill();
}
function drawBallCastle(c,x,y,r){
  c.fillStyle='#e0aaff';c.fillRect(x-r*.6,y-r*.15,r*1.2,r*.8);
  [[-.48,.55],[0,.75],[.48,.55]].forEach(([a,h])=>{c.fillStyle='#c77dff';c.fillRect(x+a*r-r*.12,y-h*r,r*.24,h*r);c.fillStyle='#7b2cbf';c.beginPath();c.moveTo(x+a*r-r*.16,y-h*r);c.lineTo(x+a*r,y-(h+.32)*r);c.lineTo(x+a*r+r*.16,y-h*r);c.fill();});
  circle(c,x,y+r*.05,r*.17,'#fff');c.strokeStyle='#3c096c';c.lineWidth=Math.max(1,r*.04);c.beginPath();c.moveTo(x,y+r*.05);c.lineTo(x,y-r*.07);c.moveTo(x,y+r*.05);c.lineTo(x+r*.08,y+r*.05);c.stroke();
  c.fillStyle='#3c096c';rrect(c,x-r*.12,y+r*.32,r*.24,r*.33,r*.12);c.fill();
}
function drawToyChest(c,x,y,r){
  c.fillStyle='#e76f51';rrect(c,x-r*.7,y-r*.15,r*1.4,r*.75,r*.1);c.fill();c.fillStyle='#f4a261';rrect(c,x-r*.75,y-r*.45,r*1.5,r*.35,r*.15);c.fill();
  c.fillStyle='#ffd23f';c.fillRect(x-r*.1,y-r*.2,r*.2,r*.25);
  circle(c,x-r*.4,y-r*.55,r*.16,'#4cc9f0');c.fillStyle='#8ac926';c.fillRect(x+r*.15,y-r*.75,r*.3,r*.3);
}
function drawSnowFox(c,x,y,r){
  c.fillStyle='#ffffff';c.beginPath();c.moveTo(x-r*.55,y-r*.15);c.lineTo(x-r*.45,y-r*.75);c.lineTo(x-r*.1,y-r*.35);c.fill();c.beginPath();c.moveTo(x+r*.55,y-r*.15);c.lineTo(x+r*.45,y-r*.75);c.lineTo(x+r*.1,y-r*.35);c.fill();
  c.fillStyle='#bde0fe';c.beginPath();c.moveTo(x-r*.47,y-r*.25);c.lineTo(x-r*.43,y-r*.58);c.lineTo(x-r*.22,y-r*.35);c.fill();c.beginPath();c.moveTo(x+r*.47,y-r*.25);c.lineTo(x+r*.43,y-r*.58);c.lineTo(x+r*.22,y-r*.35);c.fill();
  c.fillStyle='#f1f5ff';c.beginPath();c.ellipse(x,y,r*.6,r*.48,0,0,7);c.fill();c.strokeStyle='#cbd5e1';c.lineWidth=Math.max(1,r*.04);c.stroke();
  c.fillStyle='#ffffff';c.beginPath();c.moveTo(x-r*.55,y+r*.05);c.quadraticCurveTo(x,y+r*.7,x+r*.55,y+r*.05);c.fill();
  eyes(c,x,y-r*.05,r,.22,.09);circle(c,x,y+r*.18,r*.07,'#2a2140');circle(c,x-r*.35,y+r*.12,r*.06,'#ffc8dd');circle(c,x+r*.35,y+r*.12,r*.06,'#ffc8dd');
}
function drawZebra(c,x,y,r){
  c.fillStyle='#ffffff';c.beginPath();c.ellipse(x-r*.42,y-r*.48,r*.1,r*.2,-.3,0,7);c.ellipse(x+r*.42,y-r*.48,r*.1,r*.2,.3,0,7);c.fill();
  c.fillStyle='#ffffff';c.beginPath();c.ellipse(x,y-r*.05,r*.5,r*.55,0,0,7);c.fill();
  c.save();c.beginPath();c.ellipse(x,y-r*.05,r*.5,r*.55,0,0,7);c.clip();c.fillStyle='#2b2d42';for(let i=-2;i<=2;i++){c.beginPath();c.ellipse(x+i*r*.22,y-r*.5,r*.06,r*.3,i*.15,0,7);c.fill();}c.restore();
  c.fillStyle='#2b2d42';for(let i=0;i<4;i++)c.fillRect(x-r*.08,y-r*.75+i*r*.08,r*.16,r*.05);
  c.fillStyle='#e9d8fd';c.beginPath();c.ellipse(x,y+r*.3,r*.32,r*.22,0,0,7);c.fill();circle(c,x-r*.12,y+r*.3,r*.05,'#6c5b7b');circle(c,x+r*.12,y+r*.3,r*.05,'#6c5b7b');
  circle(c,x-r*.2,y-r*.1,r*.11,'#ffffff');circle(c,x+r*.2,y-r*.1,r*.11,'#ffffff');eyes(c,x,y-r*.1,r,.2,.08);
}
function drawFishy(c,x,y,r){
  c.fillStyle='#ff9f1c';c.beginPath();c.moveTo(x+r*.45,y);c.lineTo(x+r*.85,y-r*.35);c.lineTo(x+r*.85,y+r*.35);c.fill();
  c.fillStyle='#ffbf69';c.beginPath();c.ellipse(x-r*.05,y,r*.6,r*.48,0,0,7);c.fill();
  c.fillStyle='#ff9f1c';c.beginPath();c.moveTo(x-r*.15,y-r*.42);c.quadraticCurveTo(x+r*.1,y-r*.75,x+r*.3,y-r*.38);c.fill();
  c.strokeStyle='#ffffff';c.lineWidth=Math.max(1,r*.06);c.beginPath();c.arc(x+r*.12,y,r*.38,-1.2,1.2);c.stroke();
  circle(c,x-r*.3,y-r*.08,r*.16,'#ffffff');circle(c,x-r*.32,y-r*.07,r*.09,'#2a2140');circle(c,x-r*.35,y-r*.1,r*.03,'#ffffff');
  c.strokeStyle='#c45a00';c.lineWidth=Math.max(1,r*.04);c.beginPath();c.arc(x-r*.45,y+r*.18,r*.08,0,Math.PI);c.stroke();circle(c,x-r*.15,y+r*.12,r*.06,'#ff8fab');
}
function drawSpirit(c,x,y,r){
  c.fillStyle='#c77dff';c.beginPath();c.moveTo(x-r*.15,y+r*.4);c.quadraticCurveTo(x+r*.3,y+r*.6,x+r*.05,y+r*.85);c.quadraticCurveTo(x-r*.35,y+r*.6,x-r*.15,y+r*.4);c.fill();
  [[-.35,.05,.32],[.35,.05,.32],[0,-.2,.42],[0,.2,.4]].forEach(([a,b,s])=>circle(c,x+a*r,y+b*r,r*s,'#e0aaff'));
  c.fillStyle='#ffd23f';c.beginPath();c.moveTo(x-r*.25,y-r*.55);c.lineTo(x-r*.15,y-r*.75);c.lineTo(x,y-r*.6);c.lineTo(x+r*.15,y-r*.75);c.lineTo(x+r*.25,y-r*.55);c.fill();
  eyes(c,x,y-r*.05,r,.18,.09);c.strokeStyle='#5a189a';c.lineWidth=Math.max(1,r*.05);c.beginPath();c.arc(x,y+r*.12,r*.14,Math.PI*.15,Math.PI*.85);c.stroke();
  circle(c,x-r*.32,y+r*.1,r*.06,'#ff8fab');circle(c,x+r*.32,y+r*.1,r*.06,'#ff8fab');
}
function drawSwan(c,x,y,r){
  c.fillStyle='#ffffff';c.beginPath();c.ellipse(x,y+r*.25,r*.62,r*.35,0,0,7);c.fill();c.strokeStyle='#dee2e6';c.lineWidth=Math.max(1,r*.04);c.stroke();
  c.fillStyle='#f1f3f5';c.beginPath();c.ellipse(x+r*.25,y+r*.15,r*.35,r*.2,-.4,0,7);c.fill();
  c.strokeStyle='#ffffff';c.lineWidth=Math.max(3,r*.2);c.lineCap='round';c.beginPath();c.moveTo(x-r*.35,y+r*.15);c.quadraticCurveTo(x-r*.55,y-r*.3,x-r*.2,y-r*.45);c.stroke();
  circle(c,x-r*.15,y-r*.45,r*.24,'#ffffff');c.fillStyle='#ff9f1c';c.beginPath();c.moveTo(x+r*.05,y-r*.5);c.lineTo(x+r*.28,y-r*.42);c.lineTo(x+r*.05,y-r*.36);c.fill();
  circle(c,x-r*.1,y-r*.5,r*.05,'#2a2140');circle(c,x-r*.2,y-r*.38,r*.05,'#ffc8dd');
  c.fillStyle='#ffd23f';c.beginPath();c.moveTo(x-r*.3,y-r*.65);c.lineTo(x-r*.25,y-r*.8);c.lineTo(x-r*.15,y-r*.68);c.lineTo(x-r*.05,y-r*.8);c.lineTo(x,y-r*.65);c.fill();
}
function drawRockHorse(c,x,y,r){
  c.strokeStyle='#bc6c25';c.lineWidth=Math.max(2,r*.12);c.beginPath();c.arc(x,y-r*.3,r*.95,Math.PI*.3,Math.PI*.7);c.stroke();
  c.fillStyle='#e9c46a';c.beginPath();c.ellipse(x,y+r*.15,r*.5,r*.3,0,0,7);c.fill();
  c.fillStyle='#e9c46a';c.fillRect(x-r*.4,y+r*.3,r*.1,r*.25);c.fillRect(x+r*.3,y+r*.3,r*.1,r*.25);
  c.save();c.translate(x-r*.35,y-r*.25);c.rotate(-.5);c.fillStyle='#e9c46a';c.beginPath();c.ellipse(0,0,r*.24,r*.42,0,0,7);c.fill();c.restore();
  c.fillStyle='#e76f51';for(let i=0;i<4;i++)circle(c,x-r*.15+i*r*.02,y-r*.55+i*r*.15,r*.1,'#e76f51');
  circle(c,x-r*.45,y-r*.35,r*.06,'#2a2140');circle(c,x-r*.63,y-r*.08,r*.04,'#2a2140');
  c.fillStyle='#e76f51';c.fillRect(x-r*.1,y-r*.05,r*.3,r*.12);circle(c,x+r*.5,y+r*.1,r*.08,'#e76f51');
}
/* drawing the boards */
function ftDraw(s,n,W,now){
  const id=G.W.id,lv=G.lv;ctx.textAlign='center';ctx.textBaseline='middle';
  if(id==='snow'){
    const gr=ctx.createLinearGradient(0,0,W,W);gr.addColorStop(0,'#f0f8ff');gr.addColorStop(1,'#dbeafe');ctx.fillStyle=gr;ctx.fillRect(0,0,W,W);
    ctx.strokeStyle='rgba(144,224,239,.35)';ctx.lineWidth=Math.max(1,s*.03);for(let y=0;y<n;y++)for(let x=0;x<n;x++)if((x*3+y*5)%7===0){const cx=(x+.5)*s,cy=(y+.5)*s;ctx.beginPath();for(let k=0;k<3;k++){const a=k*Math.PI/3;ctx.moveTo(cx-Math.cos(a)*s*.12,cy-Math.sin(a)*s*.12);ctx.lineTo(cx+Math.cos(a)*s*.12,cy+Math.sin(a)*s*.12);}ctx.stroke();}
    G.frozen.forEach(k=>{const [x,y]=k.split(',').map(Number);ctx.fillStyle='#bde0fe';ctx.fillRect(x*s,y*s,s,s);ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=Math.max(1,s*.05);ctx.beginPath();ctx.moveTo(x*s+s*.2,y*s+s*.3);ctx.lineTo(x*s+s*.45,y*s+s*.15);ctx.moveTo(x*s+s*.5,y*s+s*.75);ctx.lineTo(x*s+s*.8,y*s+s*.55);ctx.stroke();});
    G.ftGates.forEach(q=>{const X=q.x*s,Y=q.y*s;
      if(q.c===0){ctx.fillStyle='#4895ef';ctx.fillRect(X,Y,s,s);ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=Math.max(1,s*.05);ctx.beginPath();for(let i=0;i<2;i++){const yy=Y+s*(.35+i*.35)+Math.sin(now/250+i+q.x)*s*.04;ctx.moveTo(X+s*.1,yy);ctx.quadraticCurveTo(X+s*.3,yy-s*.1,X+s*.5,yy);ctx.quadraticCurveTo(X+s*.7,yy+s*.1,X+s*.9,yy);}ctx.stroke();}
      else{ctx.fillStyle='#90e0ef';rrect(ctx,X+s*.06,Y+s*.06,s*.88,s*.88,s*.1);ctx.fill();ctx.fillStyle='rgba(255,255,255,.6)';ctx.beginPath();ctx.moveTo(X+s*.2,Y+s*.2);ctx.lineTo(X+s*.5,Y+s*.2);ctx.lineTo(X+s*.2,Y+s*.5);ctx.fill();ctx.strokeStyle='#48cae4';ctx.lineWidth=Math.max(1,s*.05);ctx.strokeRect(X+s*.1,Y+s*.1,s*.8,s*.8);}});
    drawTrail(s,'rgba(72,149,239,.25)');drawWalls(lv.g,n,s,'#5e60ce');
    G.ftItems.forEach(q=>{const cx=(q.x+.5)*s,cy=(q.y+.5)*s+Math.sin(now/300+q.x)*s*.04;ctx.globalAlpha=.3;circle(ctx,cx,cy,s*.4,q.c?'#ffb703':'#caf0f8');ctx.globalAlpha=1;ctx.font=Math.round(s*.5)+'px sans-serif';ctx.fillText(SNOWI[q.c],cx,cy);});
  }else if(id==='savanna'){
    const gr=ctx.createLinearGradient(0,0,0,W);gr.addColorStop(0,'#ffe8a3');gr.addColorStop(1,'#f4c97a');ctx.fillStyle=gr;ctx.fillRect(0,0,W,W);
    ctx.strokeStyle='rgba(188,108,37,.25)';ctx.lineWidth=Math.max(1,s*.04);ctx.beginPath();for(let y=0;y<n;y++)for(let x=0;x<n;x++)if((x*7+y*3)%4===0){const gx=x*s+s*.3,gy=y*s+s*.75;ctx.moveTo(gx,gy);ctx.lineTo(gx+s*.06,gy-s*.18);ctx.moveTo(gx+s*.12,gy);ctx.lineTo(gx+s*.14,gy-s*.14);}ctx.stroke();
    (lv.herds||[]).forEach(h=>{const a=herdAt(h,now),Y=h.y*s;ctx.fillStyle='rgba(156,102,68,.12)';ctx.fillRect(0,Y,W,s);
      if(a.warn){ctx.globalAlpha=.4+.4*Math.sin(now/100);ctx.fillStyle='#e76f51';ctx.font='bold '+Math.round(s*.4)+'px sans-serif';for(let i=0;i<n;i+=2)ctx.fillText(h.dir>0?'»':'«',(i+.5)*s,Y+s/2);ctx.globalAlpha=1;}});
    drawTrail(s,'rgba(188,108,37,.25)');drawWalls(lv.g,n,s,'#8d5b2f');
    G.ftGates.forEach(q=>{const cx=(q.x+.5)*s,cy=(q.y+.5)*s;ctx.fillStyle='rgba(255,255,255,.5)';rrect(ctx,cx-s*.42,cy-s*.42,s*.84,s*.84,s*.2);ctx.fill();ctx.fillStyle='#000';ctx.font=Math.round(s*.6)+'px sans-serif';ctx.fillText(SAVA[q.c],cx,cy+Math.sin(now/600+q.x)*s*.02);
      ctx.font=Math.round(s*.28)+'px sans-serif';ctx.globalAlpha=.85;ctx.fillText('💭',cx+s*.3,cy-s*.32);ctx.font=Math.round(s*.18)+'px sans-serif';ctx.fillText(SAVF[q.c],cx+s*.3,cy-s*.33);ctx.globalAlpha=1;});
    G.ftItems.forEach(q=>{const cx=(q.x+.5)*s,cy=(q.y+.5)*s;circle(ctx,cx,cy+s*.04,s*.32,'rgba(0,0,0,.12)');circle(ctx,cx,cy,s*.32,'#fff8e1');ctx.font=Math.round(s*.42)+'px sans-serif';ctx.fillText(SAVF[q.c],cx,cy+s*.02);});
  }else if(id==='lagoon'){
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){const v=lv.t[y][x],X=x*s,Y=y*s;
      if(v===1){ctx.fillStyle=(x+y)%2?'#48cae4':'#4cc9f0';ctx.fillRect(X,Y,s+.5,s+.5);ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=Math.max(1,s*.04);ctx.beginPath();const yy=Y+s*.5+Math.sin(now/400+x+y)*s*.06;ctx.moveTo(X+s*.15,yy);ctx.quadraticCurveTo(X+s*.35,yy-s*.1,X+s*.55,yy);ctx.stroke();}
      else{ctx.fillStyle=(x+y)%2?'#f6e7b4':'#f3dfa2';ctx.fillRect(X,Y,s+.5,s+.5);if(v===2){circle(ctx,X+s/2,Y+s*.55,s*.38,'#8d99ae');circle(ctx,X+s*.42,Y+s*.45,s*.2,'#adb5bd');}
        if(v===3){ctx.globalAlpha=.35+.2*Math.sin(now/300+x);circle(ctx,X+s/2,Y+s/2,s*.45,'#ffafcc');ctx.globalAlpha=1;ctx.font=Math.round(s*.6)+'px sans-serif';ctx.fillText('🐚',X+s/2,Y+s/2);}}}
    drawTrail(s,'rgba(255,255,255,.45)');
  }else if(id==='carpet'){
    const gr=ctx.createLinearGradient(0,0,0,W);gr.addColorStop(0,'#ffd6a5');gr.addColorStop(1,'#f4a261');ctx.fillStyle=gr;ctx.fillRect(0,0,W,W);
    ctx.strokeStyle='rgba(231,111,81,.25)';ctx.lineWidth=Math.max(1,s*.04);ctx.beginPath();for(let y=0;y<n;y++){const Y=(y+.7)*s;ctx.moveTo(0,Y);for(let x=0;x<=n;x++)ctx.quadraticCurveTo((x-.5)*s,Y-s*.15,x*s,Y);}ctx.stroke();
    drawTrail(s,'rgba(199,125,255,.3)');
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(G.ct[y][x]){const X=x*s,Y=y*s;ctx.fillStyle='#bc6c25';rrect(ctx,X+s*.1,Y+s*.18,s*.8,s*.76,s*.18);ctx.fill();ctx.fillStyle='#dda15e';rrect(ctx,X+s*.18,Y+s*.12,s*.64,s*.4,s*.16);ctx.fill();circle(ctx,X+s*.35,Y+s*.3,s*.06,'#fefae0');}
    if(G.puff&&now-G.puff.t0<700){const e=(now-G.puff.t0)/700;ctx.globalAlpha=1-e;for(let i=0;i<6;i++){const a=i*Math.PI/3;circle(ctx,(G.puff.x+.5)*s+Math.cos(a)*s*.5*e,(G.puff.y+.5)*s+Math.sin(a)*s*.5*e,s*.15*(1-e*.5),'#e0aaff');}ctx.globalAlpha=1;}
  }else if(id==='ball'){
    const gr=ctx.createLinearGradient(0,0,0,W);gr.addColorStop(0,'#3c096c');gr.addColorStop(1,'#5a189a');ctx.fillStyle=gr;ctx.fillRect(0,0,W,W);
    for(let i=0;i<30;i++){const h=(i*9301+49297)%233280/233280,h2=(i*4271+1301)%9973/9973;ctx.globalAlpha=.3+.3*Math.sin(now/500+i);circle(ctx,h*W,h2*W,Math.max(1,s*.03),'#ffffff');}ctx.globalAlpha=1;
    drawTrail(s,'rgba(255,214,255,.3)');drawWalls(lv.g,n,s,'#f72585');
    if(!G.slipperGot){const cx=(lv.slipper.x+.5)*s,cy=(lv.slipper.y+.5)*s;ctx.globalAlpha=.3+.2*Math.sin(now/200);circle(ctx,cx,cy,s*.45,'#caf0f8');ctx.globalAlpha=1;ctx.font=Math.round(s*.55)+'px sans-serif';ctx.fillText('👠',cx,cy);}
    G.wandsLeft.forEach(q=>{ctx.font=Math.round(s*.5)+'px sans-serif';ctx.fillText('✨',(q.x+.5)*s,(q.y+.5)*s+Math.sin(now/250+q.x)*s*.05);});
  }else if(id==='toyroom'){
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){ctx.fillStyle=(x+y)%2?'#ffe5d9':'#fcd5ce';ctx.fillRect(x*s,y*s,s+.5,s+.5);}
    ctx.fillStyle='rgba(76,201,240,.15)';ctx.beginPath();ctx.ellipse(W/2,W/2,W*.35,W*.28,0,0,7);ctx.fill();
    lv.hides.forEach(h=>{const X=h.x*s,Y=h.y*s;ctx.fillStyle='#9d4edd';rrect(ctx,X+s*.05,Y+s*.1,s*.9,s*.8,s*.2);ctx.fill();ctx.fillStyle='#e0aaff';for(let i=0;i<3;i++)for(let j=0;j<3;j++)if((i+j)%2)ctx.fillRect(X+s*(.15+i*.25),Y+s*(.18+j*.22),s*.2,s*.18);});
    drawTrail(s,'rgba(231,111,81,.25)');drawWalls(lv.g,n,s,'#e76f51');
    const ph=rlPhase(now);if(ph===2){ctx.fillStyle='rgba(255,77,109,.12)';ctx.fillRect(0,0,W,W);}
  }
}
function ftDraw2(s,n,W,now){
  const id=G.W.id,lv=G.lv;ctx.textAlign='center';ctx.textBaseline='middle';
  if(id==='savanna')(lv.herds||[]).forEach(h=>{const a=herdAt(h,now);if(a.x==null)return;const cx=(a.x+.5)*s,cy=(h.y+.5)*s;
    ctx.globalAlpha=.4;for(let i=1;i<4;i++)circle(ctx,cx-h.dir*i*s*.35,cy+s*.2,s*.18*(1-i*.2),'#c9a27e');ctx.globalAlpha=1;
    ctx.save();ctx.translate(cx,cy+Math.abs(Math.sin(now/80))*-s*.06);if(h.dir<0)ctx.scale(-1,1);ctx.font=Math.round(s*.65)+'px sans-serif';ctx.fillText('🐃',0,0);ctx.restore();});
  if(id==='snow'||id==='savanna'||id==='ball'){}
  if(id==='lagoon'&&lv.t[G.p.y][G.p.x]===1){const cx=(G.vis.x+.5)*s,cy=(G.vis.y+.5)*s,w=Math.sin(now/200)*.3;
    ctx.save();ctx.translate(cx,cy+s*.3);ctx.rotate(w);ctx.fillStyle='#2ec4b6';ctx.beginPath();ctx.ellipse(0,0,s*.14,s*.24,0,0,7);ctx.fill();
    ctx.beginPath();ctx.moveTo(0,s*.18);ctx.lineTo(-s*.2,s*.36);ctx.lineTo(0,s*.28);ctx.lineTo(s*.2,s*.36);ctx.fill();ctx.restore();}
  if(id==='carpet'){const cx=(G.vis.x+.5)*s,cy=(G.vis.y+.5)*s+s*.32;ctx.fillStyle='#9d4edd';ctx.beginPath();ctx.moveTo(cx-s*.45,cy);ctx.quadraticCurveTo(cx,cy+Math.sin(now/150)*s*.06,cx+s*.45,cy);ctx.lineTo(cx+s*.4,cy+s*.12);ctx.quadraticCurveTo(cx,cy+s*.12+Math.sin(now/150+1)*s*.06,cx-s*.4,cy+s*.12);ctx.fill();
    ctx.strokeStyle='#ffd23f';ctx.lineWidth=Math.max(1,s*.03);ctx.stroke();
    if(G.wishArm){ctx.globalAlpha=.4+.3*Math.sin(now/120);circle(ctx,cx,cy-s*.3,s*.55,'#e0aaff');ctx.globalAlpha=1;ctx.font=Math.round(s*.35)+'px sans-serif';ctx.fillText('🪔',cx+s*.38,cy-s*.7);}}
  if(id==='toyroom'){const ph=rlPhase(now);ctx.font=Math.round(s*.9)+'px sans-serif';ctx.globalAlpha=ph===2?.95:ph===1?.7+.3*Math.sin(now/80):.45;ctx.fillText(ph===2?'👀':ph===1?'😮':'🙈',W-s*.6,s*.55);ctx.globalAlpha=1;}
}
kit(['snow','savanna','lagoon','carpet','ball','toyroom'],{move:ftMove,tick:ftTick,hud:ftHud,draw:ftDraw,draw2:ftDraw2,action:ftAction,hint:ftHint});
// the story-book families (red hood, stories, puzzles, wizards, vehicles) share two habits: board text is centred, and buttons do nothing after the win
function ftWrap(h){const o=Object.assign({},h);
  for(const k of ['draw','draw2'])if(h[k])o[k]=(s,n,W,now)=>{ctx.textAlign='center';ctx.textBaseline='middle';h[k](s,n,W,now);};
  if(h.action)o.action=()=>{if(!G||G.done)return;h.action();};
  return o;}

/* ---------- little red hood ---------- */
function rhFresh(lv){return lv.dens?{flowersLeft:lv.flowers.map(f=>Object.assign({},f)),bouquet:[],wolves:lv.dens.map(d=>({x:d.x,y:d.y,hx:d.x,hy:d.y})),lastPath:{x:lv.start.x,y:lv.start.y}}:{};}
function rhOnPath(){const lv=G.lv;return lv.t[G.p.y][G.p.x]===2;}
function rhMove(d){
  const lv=G.lv,n=lv.n,x=G.p.x,y=G.p.y,nx=x+DV[d][0],ny=y+DV[d][1];
  if(!nwIn(n,nx,ny)||lv.t[ny][nx]===1){bumpWall(d);return;}
  if(nx===lv.goal.x&&ny===lv.goal.y&&G.flowersLeft.length){bumpWall(d);arcSay('סבתא מחכה לזר פרחים 🌷 חסרים עוד '+G.flowersLeft.length);return;}
  const was=rhOnPath();G.p={x:nx,y:ny};enter(nx,ny);
  const fi=G.flowersLeft.findIndex(f=>f.x===nx&&f.y===ny);
  if(fi>=0){G.bouquet.push(G.flowersLeft.splice(fi,1)[0]);[700,900,1100].forEach((f,i)=>setTimeout(()=>beep(f,.07,'sine'),i*60));sparkle(nx,ny,['#ff8fab','#ffd23f'],10);
    toast(G.flowersLeft.length?'פרח לסבתא! 🌷 עוד '+G.flowersLeft.length:'הזר מוכן! 💐 חזרי לשביל ולכי לבית של סבתא');}
  const now=rhOnPath();
  if(now)G.lastPath={x:nx,y:ny};
  if(was&&!now&&G.wolves.length){beep(260,.15,'triangle');arcSay('נכנסת ליער 🌲 הזאב התעורר! מהר לפרח וחזרה לשביל');}
  else if(!was&&now&&G.wolves.length){beep(660,.08,'sine');arcSay('על השביל 🛤️ כאן הזאב לא מתקרב');}
  else beep(520,.03,'sine');
  updateHud();rhCatch();
  if(atGoal())win();
}
function rhStepToward(w,tx,ty){
  const lv=G.lv,n=lv.n,prev={[w.x+','+w.y]:null},q=[[w.x,w.y]];
  for(let h=0;h<q.length;h++){const [x,y]=q[h],k=x+','+y;if(x===tx&&y===ty){let c=k;if(!prev[c])return;while(prev[c][0]!==w.x+','+w.y)c=prev[c][0];const [a,b]=c.split(',').map(Number);w.x=a;w.y=b;return;}
    for(let d=0;d<4;d++){const a=x+DV[d][0],b=y+DV[d][1],nk=a+','+b;if(!nwIn(n,a,b)||lv.t[b][a]!==0||nk in prev)continue;if(G.wolves.some(o=>o!==w&&o.x===a&&o.y===b))continue;prev[nk]=[k,d];q.push([a,b]);}}
}
function rhCatch(){
  if(rhOnPath()||performance.now()<G.hurtUntil)return;
  const w=G.wolves.find(w=>w.x===G.p.x&&w.y===G.p.y);if(!w)return;
  const lost=G.bouquet.pop();if(lost)G.flowersLeft.push(lost);
  w.x=w.hx;w.y=w.hy;
  arcHurt(lost?'הזאב הבהיל אותך! 🐺 פרח אחד נפל וחזר ליער. חזרת לשביל':'הזאב הבהיל אותך! 🐺 חזרת לשביל',G.lastPath,false);updateHud();
}
function rhTick(now){
  if(!G.wolves.length||now-G.arcAt<G.cfg.speed)return;G.arcAt=now;
  const safe=rhOnPath();
  G.wolves.forEach(w=>{if(safe){if(w.x!==w.hx||w.y!==w.hy)rhStepToward(w,w.hx,w.hy);}else rhStepToward(w,G.p.x,G.p.y);});
  rhCatch();
}
function rhHud(add){
  add('🌷 '+G.bouquet.length+' מתוך '+G.lv.flowers.length);
  if(G.wolves.length){const s=add(rhOnPath()?'🛤️ על השביל: בטוח':'🌲 ביער: הזאב ער!');s.style.background=rhOnPath()?'#d8f3dc':'#ffd6d6';s.style.color='#2a2140';}
}
function drawWolf(c,x,y,r,awake){
  c.fillStyle='#6c757d';c.beginPath();c.moveTo(x-r*.55,y-r*.15);c.lineTo(x-r*.42,y-r*.78);c.lineTo(x-r*.12,y-r*.38);c.fill();c.beginPath();c.moveTo(x+r*.55,y-r*.15);c.lineTo(x+r*.42,y-r*.78);c.lineTo(x+r*.12,y-r*.38);c.fill();
  c.fillStyle='#868e96';c.beginPath();c.ellipse(x,y,r*.6,r*.5,0,0,7);c.fill();
  c.fillStyle='#dee2e6';c.beginPath();c.moveTo(x-r*.3,y+r*.05);c.quadraticCurveTo(x,y+r*.65,x+r*.3,y+r*.05);c.fill();
  circle(c,x,y+r*.15,r*.09,'#212529');
  if(awake){circle(c,x-r*.22,y-r*.12,r*.1,'#ffd23f');circle(c,x+r*.22,y-r*.12,r*.1,'#ffd23f');circle(c,x-r*.22,y-r*.12,r*.04,'#212529');circle(c,x+r*.22,y-r*.12,r*.04,'#212529');}
  else{c.strokeStyle='#212529';c.lineWidth=Math.max(1,r*.05);c.beginPath();c.arc(x-r*.22,y-r*.12,r*.08,0,Math.PI);c.arc(x+r*.22,y-r*.12,r*.08,0,Math.PI);c.stroke();}
}
function drawGrandma(c,x,y,r){
  c.fillStyle='#e9c46a';c.fillRect(x-r*.6,y-r*.15,r*1.2,r*.8);c.fillStyle='#bc4749';c.beginPath();c.moveTo(x-r*.78,y-r*.1);c.lineTo(x,y-r*.8);c.lineTo(x+r*.78,y-r*.1);c.fill();
  c.fillStyle='#8d5524';c.fillRect(x+r*.3,y-r*.72,r*.16,r*.3);
  c.fillStyle='#6f4518';rrect(c,x-r*.15,y+r*.22,r*.3,r*.43,r*.12);c.fill();
  c.fillStyle='#a8dadc';c.fillRect(x-r*.48,y+r*.02,r*.22,r*.2);c.fillRect(x+r*.26,y+r*.02,r*.22,r*.2);
  circle(c,x-r*.37,y+r*.27,r*.07,'#ff8fab');circle(c,x+r*.37,y+r*.27,r*.07,'#ffd23f');
}
function drawDeer(c,x,y,r){
  c.strokeStyle='#7f5539';c.lineWidth=Math.max(2,r*.08);c.lineCap='round';c.beginPath();[-1,1].forEach(s=>{c.moveTo(x+s*r*.25,y-r*.45);c.lineTo(x+s*r*.4,y-r*.85);c.moveTo(x+s*r*.33,y-r*.65);c.lineTo(x+s*r*.55,y-r*.72);});c.stroke();
  c.fillStyle='#c68b59';c.beginPath();c.ellipse(x-r*.55,y-r*.25,r*.2,r*.1,-.5,0,7);c.ellipse(x+r*.55,y-r*.25,r*.2,r*.1,.5,0,7);c.fill();
  c.fillStyle='#d4a373';c.beginPath();c.ellipse(x,y,r*.48,r*.55,0,0,7);c.fill();
  c.fillStyle='#fefae0';c.beginPath();c.ellipse(x,y+r*.28,r*.25,r*.2,0,0,7);c.fill();circle(c,x,y+r*.2,r*.08,'#3d2b1f');
  [[-.25,-.35],[.3,-.3],[-.3,.05]].forEach(([a,b])=>circle(c,x+a*r,y+b*r,r*.05,'#fefae0'));
  eyes(c,x,y-r*.08,r,.2,.1);circle(c,x-r*.32,y+r*.12,r*.06,'#ffafcc');circle(c,x+r*.32,y+r*.12,r*.06,'#ffafcc');
}
function rhDraw(s,n,W,now){
  const lv=G.lv;
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const v=lv.t[y][x],X=x*s,Y=y*s;
    ctx.fillStyle=v===2?((x+y)%2?'#e9c89b':'#e3bd8c'):((x+y)%2?'#a7c957':'#9bc04e');ctx.fillRect(X,Y,s+.5,s+.5);
    if(v===2){ctx.fillStyle='rgba(127,85,57,.25)';circle(ctx,X+s*.3,Y+s*.65,s*.05,'rgba(127,85,57,.3)');circle(ctx,X+s*.7,Y+s*.35,s*.04,'rgba(127,85,57,.3)');}
    else if(v===0&&(x*5+y*7)%4===0){ctx.strokeStyle='rgba(56,102,65,.35)';ctx.lineWidth=Math.max(1,s*.04);ctx.beginPath();ctx.moveTo(X+s*.3,Y+s*.7);ctx.lineTo(X+s*.34,Y+s*.52);ctx.moveTo(X+s*.42,Y+s*.7);ctx.lineTo(X+s*.44,Y+s*.56);ctx.stroke();}}
  drawTrail(s,'rgba(255,255,255,.35)');
  for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(lv.t[y][x]===1){const cx=(x+.5)*s,cy=(y+.5)*s;
    ctx.fillStyle='#6f4518';ctx.fillRect(cx-s*.07,cy+s*.1,s*.14,s*.32);circle(ctx,cx,cy-s*.02,s*.36,'#386641');circle(ctx,cx-s*.14,cy+s*.05,s*.22,'#4f772d');circle(ctx,cx+s*.12,cy-s*.12,s*.2,'#6a994e');}
  G.flowersLeft.forEach(f=>{ctx.font=Math.round(s*.55)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🌷',(f.x+.5)*s,(f.y+.5)*s+Math.sin(now/400+f.x)*s*.03);});
}
function rhDraw2(s,n,W,now){
  const awake=!rhOnPath();
  G.wolves.forEach(w=>{const [x,y]=glide(w,w.x,w.y),cx=(x+.5)*s,cy=(y+.5)*s;ctx.globalAlpha=awake?1:.6;drawWolf(ctx,cx,cy,s*.42,awake);ctx.globalAlpha=1;
    if(!awake){ctx.fillStyle='#2a2140';ctx.font='bold '+Math.round(s*.3)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('z',cx+s*.3,cy-s*.35+Math.sin(now/300)*s*.04);}});
  if(G.flowersLeft.length)nwLock(s);
}
kit(['redhood'],ftWrap({move:rhMove,tick:rhTick,hud:rhHud,draw:rhDraw,draw2:rhDraw2}));
