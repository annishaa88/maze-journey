/* ================= wizard school: playing ================= */
const WZ=new Set(['broom','stairs','potion','owlpost','flykeys','wand']);
const OWLC=['#e63946','#3a86ff','#2a9d8f','#ffb703','#9d4edd'],OWLE=['🟥','🟦','🟩','🟨','🟪'];
const KEYCOL=['#e63946','#3a86ff','#2a9d8f','#ffb703','#9d4edd'],KEYE=['🔴','🔵','🟢','🟡','🟣'];
const ARW=['⬆️','➡️','⬇️','⬅️'];
function wzFresh(lv){
  return {wz:{flying:false,brT:0,ringsGot:new Set(),missed:false,birds:(lv.birds||[]).map(b=>Object.assign({},b)),
    stT0:performance.now(),
    bag:new Set(),brewed:false,
    letters:new Set((lv.towers||[]).map(t=>t.c)),energy:lv.energy||0,
    keys:(lv.keys||[]).map(k=>Object.assign({},k)),gotKeys:[],keyAt:0,
    open:new Set(),casting:false,spell:[]}};
}
function stairO(s,now){return (s.o0+Math.floor((now-G.wz.stT0)/G.cfg.period))%2;}   // 0 across, 1 up-down
function wzAction(){
  if(!G||G.done)return;const W=G.wz,lv=G.lv;
  if(G.W.id==='wand'){
    if(W.casting){W.casting=false;W.spell=[];toast('הלחש בוטל');updateHud();return;}
    const near=[0,1,2,3].map(d=>GEN.edgeKey(G.p.x,G.p.y,d)).find(k=>lv.doors[k]&&!W.open.has(k));
    if(!near){toast('גשי לדלת קסומה ✨ ואז לחצי 🪄');return;}
    W.casting=true;W.spell=[];W.door=near;chime([880,1175],70,.08,'sine');
    toast('לחצי על החיצים לפי הסדר: '+lv.doors[near].map(a=>ARW[a]).join(' '));updateHud();}
}
function wzMove(d){
  const id=G.W.id,lv=G.lv,n=lv.n,W=G.wz,x=G.p.x,y=G.p.y,nx=x+DV[d][0],ny=y+DV[d][1];
  if(id==='broom'){
    if(!W.flying&&x<n-1){W.flying=true;W.brT=performance.now();toast('ממריאים! 🧹 למעלה ולמטה, דרך הטבעות');}
    if(d===3){bumpWall(d);return;}
    if(d===1){if(nx>=n){return;}if(lv.t[y][nx]){wzCrash();return;}G.p={x:nx,y};W.brT=performance.now();wzPass();return;}
    if(!nwIn(n,nx,ny)){bumpWall(d);return;}if(lv.t[ny][nx]){wzCrash();return;}
    G.p={x:nx,y:ny};enter(nx,ny);wzBirdHit();if(nx===lv.n-1&&W.ringsGot.size>=lv.rings.length&&atGoal())win();return;
  }
  if(id==='stairs'){
    const now=performance.now(),here=lv.stairs.find(s=>s.x===x&&s.y===y),there=lv.stairs.find(s=>s.x===nx&&s.y===ny),horiz=d===1||d===3;
    if(here&&(stairO(here,now)===0)!==horiz){bumpWall(d);arcSay('המדרגות פונות לכיוון אחר 🪜 חכי שיסתובבו');return;}
    if(lv.g[y][x][d]){bumpWall(d);return;}
    if(there&&(stairO(there,now)===0)!==horiz){bumpWall(d);arcSay('המדרגות עוד לא בכיוון שלך 🪜 חכי רגע');return;}
    G.p={x:nx,y:ny};enter(nx,ny);beep(there?700:520,.04,'sine');if(atGoal())win();return;
  }
  if(id==='potion'){
    if(lv.g[y][x][d]){bumpWall(d);return;}
    if(lv.bars.some(b=>b.x===nx&&b.y===ny)&&!W.brewed){bumpWall(d);arcSay(W.bag.size<lv.want.length?'וילון קסם! 🔮 צריך שיקוי. המתכון: '+lv.want.join(' '):'יש לך הכול! לכי לקדרה 🧪 לבשל את השיקוי');return;}
    G.p={x:nx,y:ny};enter(nx,ny);beep(520,.03,'sine');
    const it=lv.items.find(q=>q.x===nx&&q.y===ny);
    if(it&&!W.bag.has(it.e)){if(it.good){W.bag.add(it.e);chime([700,900],70,.08,'sine');toast('לקחת '+it.e+'! '+(W.bag.size<lv.want.length?'עוד '+(lv.want.length-W.bag.size):'עכשיו לקדרה 🧪'));updateHud();}
      else arcSay(it.e+' לא במתכון. המתכון: '+lv.want.join(' '));}
    if(nx===lv.cauldron.x&&ny===lv.cauldron.y&&!W.brewed){
      if(W.bag.size>=lv.want.length){W.brewed=true;sparkle(nx,ny,['#c77dff','#7bf1a8','#ffd23f'],20);chime([523,659,784,1047,1319],80,.1,'sine');toast('בּוּלבּוּל! 🧪 השיקוי מוכן. עכשיו אפשר לעבור דרך וילונות הקסם');updateHud();}
      else arcSay('הקדרה מחכה 🧪 חסר: '+lv.want.filter(e=>!W.bag.has(e)).join(' '));}
    if(atGoal())win();return;
  }
  if(id==='owlpost'){
    if(lv.g[y][x][d]){bumpWall(d);return;}
    G.p={x:nx,y:ny};enter(nx,ny);W.energy--;beep(520,.03,'sine');
    const tw=lv.towers.find(t=>t.x===nx&&t.y===ny);
    if(tw&&W.letters.has(tw.c)){W.letters.delete(tw.c);W.energy=lv.energy;sparkle(nx,ny,[OWLC[tw.c],'#ffffff'],14);chime([784,988,1175],70,.09,'sine');
      if(!W.letters.size){toast('כל המכתבים נמסרו! 🦉✉️');updateHud();win();return;}toast('מכתב נמסר! ✉️ הינשוף קיבל חטיף וחזר לכוחות');}
    else if((nx===0&&ny===0)||lv.perches.some(p=>p.x===nx&&p.y===ny)){if(W.energy<lv.energy){W.energy=lv.energy;beep(880,.08,'sine');arcSay('הינשוף נח 🌳 וחזר לכוחות');}}
    if(W.energy<=0){W.energy=lv.energy;G.p={x:0,y:0};G.hits=(G.hits||0)+1;G.hurtUntil=performance.now()+1200;toast('הינשוף התעייף 😴 ועף הביתה. המכתבים עדיין אצלך');}
    updateHud();return;
  }
  if(id==='flykeys'){
    if(!nwIn(n,nx,ny)||lv.t[ny][nx]){bumpWall(d);return;}
    if(nx===lv.goal.x&&ny===lv.goal.y&&W.gotKeys.length<lv.need.length){bumpWall(d);arcSay('הדלת צריכה: '+lv.need.map((c,i)=>i<W.gotKeys.length?'✓':KEYE[c]).join(' '));return;}
    G.p={x:nx,y:ny};enter(nx,ny);beep(520,.03,'sine');wzKeyCatch();if(atGoal())win();return;
  }
  if(id==='wand'){
    if(W.casting){const rune=lv.doors[W.door];
      if(d!==rune[W.spell.length]){beep(180,.15,'square');buzz(30);W.miss={t0:performance.now()};arcSay('לא החץ הזה 🙂 עכשיו צריך '+ARW[rune[W.spell.length]]);updateHud();return;}
      W.spell.push(d);beep(600+W.spell.length*90,.07,'sine');
      if(W.spell.length>=rune.length){W.casting=false;W.spell=[];W.open.add(W.door);const [a,b]=W.door.split(',');sparkle(+a,+b,['#c77dff','#ffd23f','#ffffff'],20);chime([523,784,1047,1568],80,.1,'sine');toast('✨ הדלת נפתחה! לחש מושלם');}
      updateHud();return;}
    const k=GEN.edgeKey(x,y,d);if(lv.doors[k]&&!W.open.has(k)){bumpWall(d);arcSay('דלת קסומה! 🚪 לחצי 🪄 ואז על החיצים: '+lv.doors[k].map(a=>ARW[a]).join(' '));return;}
    if(lv.g[y][x][d]){bumpWall(d);return;}
    G.p={x:nx,y:ny};enter(nx,ny);beep(520,.03,'sine');if(atGoal())win();return;
  }
}
function wzCrash(){const W=G.wz;if(performance.now()<G.hurtUntil)return;G.p={x:Math.max(0,G.p.x-2),y:G.p.y};arcHurt('פוף! ☁️ נכנסת בענן. העפת קצת אחורה',G.p,true);W.brT=performance.now()+600;}
function wzBirdHit(){const W=G.wz;if(W.birds.some(b=>b.x===G.p.x&&Math.round(b.y)===G.p.y))wzCrash();}
function wzPass(){
  const lv=G.lv,W=G.wz,x=G.p.x,y=G.p.y;enter(x,y);
  lv.rings.forEach((r,i)=>{if(r.x!==x||W.ringsGot.has(i))return;if(r.y===y){W.ringsGot.add(i);sparkle(x,y,['#ffd23f','#ffffff'],14);[880,1175].forEach((f,k)=>setTimeout(()=>beep(f,.08,'sine'),k*60));updateHud();}
    else{W.missed=true;arcSay('פספסת טבעת 💫');}});
  if(lv.t[y][x])wzCrash();
  wzBirdHit();
  if(x>=lv.n-1){
    if(W.ringsGot.size>=lv.rings.length){W.flying=false;if(atGoal()){win();return;}toast('כמעט! 🏰 עכשיו למעלה או למטה אל דלת המגדל');updateHud();return;}
    W.flying=false;G.p={x:lv.start.x,y:lv.start.y};W.ringsGot=new Set();W.missed=false;toast('צריך לעבור בכל הטבעות 💫 עוד סיבוב! לחצי חץ כדי להמריא');updateHud();}
}
function wzKeyCatch(){
  const W=G.wz,lv=G.lv,n=lv.n;const ki=W.keys.findIndex(k=>k.x===G.p.x&&k.y===G.p.y);if(ki<0)return;const k=W.keys[ki];
  const want=lv.need[W.gotKeys.length];
  if(k.c===want){W.keys.splice(ki,1);W.gotKeys.push(k.c);sparkle(k.x,k.y,[KEYCOL[k.c],'#ffffff'],14);chime([784,988],70,.09,'sine');
    toast(W.gotKeys.length<lv.need.length?'תפסת! 🗝️ עכשיו את '+KEYE[lv.need[W.gotKeys.length]]:'כל המפתחות! 🗝️ לדלת');updateHud();}
  else{const free=[];for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(!lv.t[y][x]&&Math.abs(x-G.p.x)+Math.abs(y-G.p.y)>=3&&!(x===lv.goal.x&&y===lv.goal.y)&&!W.keys.some(o=>o.x===x&&o.y===y))free.push([x,y]);
    const c=free[rndi(free.length)];if(c){k.x=c[0];k.y=c[1];k.gx=null;}beep(300,.12,'triangle');arcSay('לא המפתח הזה! 🗝️💨 צריך את '+(want!=null?KEYE[want]:''));}
}
function wzTick(now){
  const id=G.W.id,lv=G.lv,W=G.wz;
  if(id==='broom'){
    if(now-(W.bdT||0)>G.cfg.speed*.8){W.bdT=now;W.birds.forEach(b=>{b.y+=b.dir;if(b.y>=b.y1||b.y<=b.y0)b.dir*=-1;});if(W.flying)wzBirdHit();}
    if(W.flying&&!G.anim&&now-W.brT>G.cfg.speed){W.brT=now;const nx=G.p.x+1;if(nx>=lv.n)return;if(lv.t[G.p.y][nx]){wzCrash();return;}G.p={x:nx,y:G.p.y};wzPass();}}
  if(id==='flykeys'&&now-W.keyAt>G.cfg.speed){W.keyAt=now;const n=lv.n;
    W.keys.forEach(k=>{const opts=[];for(let d=0;d<4;d++){const a=k.x+DV[d][0],b=k.y+DV[d][1];if(!nwIn(n,a,b)||lv.t[b][a]||(a===lv.goal.x&&b===lv.goal.y)||W.keys.some(o=>o!==k&&o.x===a&&o.y===b))continue;
        const dd=Math.abs(a-G.p.x)+Math.abs(b-G.p.y);opts.push([a,b,G.cfg.shy&&Math.abs(k.x-G.p.x)+Math.abs(k.y-G.p.y)<=2?-dd+Math.random():Math.random()]);}
      if(opts.length&&Math.random()<.8){opts.sort((p,q)=>p[2]-q[2]);k.x=opts[0][0];k.y=opts[0][1];}});
    wzKeyCatch();}
  if(id==='stairs'){const p=Math.floor((now-W.stT0)/G.cfg.period);if(p!==W.lastFlip){if(W.lastFlip!=null)beep(400,.06,'triangle');W.lastFlip=p;}}
}
function wzHud(add){
  const id=G.W.id,lv=G.lv,W=G.wz;
  if(id==='broom')add('💫 '+W.ringsGot.size+'/'+lv.rings.length+(W.flying?'':G.p.x>=lv.n-1?' · 🏰 אל הדלת':' · חץ = המראה'));
  if(id==='potion')add('🧪 '+lv.want.map(e=>W.bag.has(e)?'✅':e).join(' ')+(W.brewed?' · מוכן!':''));
  if(id==='owlpost'){add('✉️ '+[...W.letters].map(c=>OWLE[c]).join('')+(W.letters.size?'':' ✓'));const s=add('🦉 '+'▮'.repeat(Math.max(0,Math.ceil(W.energy/lv.energy*5)))+'▯'.repeat(Math.max(0,5-Math.ceil(W.energy/lv.energy*5))));if(W.energy<=4){s.style.background='#ffd6d6';s.style.color='#2a2140';}}
  if(id==='flykeys')add('🚪 '+lv.need.map((c,i)=>i<W.gotKeys.length?'✅':KEYE[c]).join(' '));
  if(id==='wand'){if(W.casting){const s=add('🪄 '+lv.doors[W.door].map((a,i)=>i<W.spell.length?'✨':ARW[a]).join(' '));s.style.background='#f3e8ff';s.style.color='#2a2140';}else add('🚪 דלתות: '+W.open.size+' מתוך '+Object.keys(lv.doors).length);}
  if(id==='stairs')add('🪜 המדרגות מסתובבות');
}
/* goals and friends */
function drawWizTower(c,x,y,r){
  c.fillStyle='#6c757d';c.fillRect(x-r*.3,y-r*.35,r*.6,r*1.05);c.fillStyle='#495057';for(let i=0;i<3;i++)c.fillRect(x-r*.3+i*r*.24,y-r*.5,r*.14,r*.16);
  c.fillStyle='#5a189a';c.beginPath();c.moveTo(x-r*.42,y-r*.35);c.lineTo(x,y-r*1);c.lineTo(x+r*.42,y-r*.35);c.fill();circle(c,x,y-r*1,r*.07,'#ffd23f');
  c.fillStyle='#ffd23f';c.fillRect(x-r*.08,y-r*.15,r*.16,r*.22);c.fillStyle='#3c096c';rrect(c,x-r*.12,y+r*.35,r*.24,r*.35,r*.1);c.fill();
}
function drawCauldron(c,x,y,r,now){
  const t=now||0;c.fillStyle='#212529';c.beginPath();c.ellipse(x,y+r*.15,r*.65,r*.5,0,0,Math.PI);c.fill();c.fillRect(x-r*.65,y-r*.15,r*1.3,r*.32);
  c.fillStyle='#7bf1a8';c.beginPath();c.ellipse(x,y-r*.15,r*.58,r*.14,0,0,7);c.fill();
  c.globalAlpha=.7;for(let i=0;i<3;i++)circle(c,x-r*.25+i*r*.25,y-r*.35-((t/25+i*15)%30)/30*r*.4,r*.09,'#c7f9cc');c.globalAlpha=1;
}
function drawOwlery(c,x,y,r){
  c.fillStyle='#8d5524';c.fillRect(x-r*.5,y-r*.2,r,r*.85);c.fillStyle='#6f4518';c.beginPath();c.moveTo(x-r*.65,y-r*.2);c.lineTo(x,y-r*.8);c.lineTo(x+r*.65,y-r*.2);c.fill();
  circle(c,x,y+r*.15,r*.22,'#2b2d42');c.font=Math.round(r*.45)+'px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('🦉',x,y+r*.15);
}
function drawMagicDoor(c,x,y,r){c.fillStyle='#5a189a';rrect(c,x-r*.5,y-r*.75,r,r*1.5,r*.5);c.fill();c.fillStyle='#c77dff';rrect(c,x-r*.38,y-r*.62,r*.76,r*1.28,r*.38);c.fill();c.globalAlpha=.9;star(c,x,y-r*.1,r*.25);c.globalAlpha=1;circle(c,x+r*.22,y+r*.25,r*.07,'#ffd23f');}
function drawWizCat(c,x,y,r){
  c.fillStyle='#2b2d42';c.beginPath();c.moveTo(x-r*.55,y-r*.15);c.lineTo(x-r*.45,y-r*.7);c.lineTo(x-r*.12,y-r*.4);c.fill();c.beginPath();c.moveTo(x+r*.55,y-r*.15);c.lineTo(x+r*.45,y-r*.7);c.lineTo(x+r*.12,y-r*.4);c.fill();
  c.fillStyle='#2b2d42';c.beginPath();c.ellipse(x,y,r*.6,r*.5,0,0,7);c.fill();
  circle(c,x-r*.22,y-r*.05,r*.13,'#7bf1a8');circle(c,x+r*.22,y-r*.05,r*.13,'#7bf1a8');circle(c,x-r*.22,y-r*.05,r*.05,'#111');circle(c,x+r*.22,y-r*.05,r*.05,'#111');
  c.fillStyle='#ff8fab';c.beginPath();c.moveTo(x-r*.06,y+r*.12);c.lineTo(x+r*.06,y+r*.12);c.lineTo(x,y+r*.2);c.fill();
  c.strokeStyle='#adb5bd';c.lineWidth=Math.max(1,r*.03);c.beginPath();[-1,1].forEach(s=>{c.moveTo(x+s*r*.15,y+r*.18);c.lineTo(x+s*r*.5,y+r*.12);c.moveTo(x+s*r*.15,y+r*.22);c.lineTo(x+s*r*.5,y+r*.26);});c.stroke();
}
function drawToad(c,x,y,r){
  c.fillStyle='#606c38';c.beginPath();c.ellipse(x,y+r*.1,r*.65,r*.45,0,0,7);c.fill();circle(c,x-r*.3,y-r*.3,r*.2,'#606c38');circle(c,x+r*.3,y-r*.3,r*.2,'#606c38');
  circle(c,x-r*.3,y-r*.32,r*.12,'#fefae0');circle(c,x+r*.3,y-r*.32,r*.12,'#fefae0');circle(c,x-r*.3,y-r*.3,r*.06,'#283618');circle(c,x+r*.3,y-r*.3,r*.06,'#283618');
  [[-.3,.2],[.2,.3],[.35,0]].forEach(([a,b])=>circle(c,x+a*r,y+b*r,r*.06,'#dda15e'));c.strokeStyle='#283618';c.lineWidth=Math.max(1,r*.05);c.beginPath();c.arc(x,y+r*.05,r*.25,Math.PI*.2,Math.PI*.8);c.stroke();
}
function drawPhoenix(c,x,y,r){
  [['#ffb703',-.5],['#fb8500',-.25],['#e63946',0]].forEach(([col,a])=>{c.fillStyle=col;c.beginPath();c.moveTo(x,y+r*.2);c.quadraticCurveTo(x-r*.9,y+a*r,x-r*.6,y+r*.7);c.fill();c.beginPath();c.moveTo(x,y+r*.2);c.quadraticCurveTo(x+r*.9,y+a*r,x+r*.6,y+r*.7);c.fill();});
  circle(c,x,y,r*.4,'#e63946');circle(c,x,y+r*.15,r*.25,'#ffb703');
  c.fillStyle='#ffd23f';c.beginPath();c.moveTo(x-r*.15,y-r*.35);c.lineTo(x-r*.05,y-r*.7);c.lineTo(x+r*.05,y-r*.4);c.lineTo(x+r*.15,y-r*.65);c.lineTo(x+r*.18,y-r*.3);c.fill();
  eyes(c,x,y-r*.08,r,.15,.07);c.fillStyle='#ffb703';c.beginPath();c.moveTo(x-r*.07,y+r*.02);c.lineTo(x+r*.07,y+r*.02);c.lineTo(x,y+r*.14);c.fill();
}
function drawRaven(c,x,y,r){
  c.fillStyle='#343a40';c.beginPath();c.ellipse(x-r*.5,y+r*.1,r*.2,r*.38,.4,0,7);c.ellipse(x+r*.5,y+r*.1,r*.2,r*.38,-.4,0,7);c.fill();
  circle(c,x,y,r*.55,'#495057');circle(c,x-r*.2,y-r*.12,r*.13,'#ffffff');circle(c,x+r*.2,y-r*.12,r*.13,'#ffffff');circle(c,x-r*.18,y-r*.1,r*.07,'#111');circle(c,x+r*.22,y-r*.1,r*.07,'#111');
  c.fillStyle='#ffb703';c.beginPath();c.moveTo(x-r*.1,y+r*.05);c.lineTo(x+r*.1,y+r*.05);c.lineTo(x,y+r*.3);c.fill();circle(c,x-r*.35,y+r*.12,r*.06,'#ff8fab');circle(c,x+r*.35,y+r*.12,r*.06,'#ff8fab');
}
function drawPixie(c,x,y,r){
  c.globalAlpha=.6;c.fillStyle='#caf0f8';c.beginPath();c.ellipse(x-r*.45,y-r*.15,r*.32,r*.45,-.5,0,7);c.ellipse(x+r*.45,y-r*.15,r*.32,r*.45,.5,0,7);c.fill();c.globalAlpha=1;
  c.fillStyle='#ffafcc';c.beginPath();c.moveTo(x-r*.3,y+r*.7);c.lineTo(x,y+r*.1);c.lineTo(x+r*.3,y+r*.7);c.fill();
  circle(c,x,y-r*.1,r*.32,'#ffe5d9');c.fillStyle='#9d4edd';c.beginPath();c.arc(x,y-r*.18,r*.34,Math.PI,0);c.fill();
  eyes(c,x,y-r*.08,r,.12,.06);circle(c,x-r*.18,y+r*.02,r*.05,'#ff8fab');circle(c,x+r*.18,y+r*.02,r*.05,'#ff8fab');star(c,x+r*.5,y-r*.55,r*.12);
}
function drawSprout(c,x,y,r){
  c.fillStyle='#bc6c25';c.beginPath();c.moveTo(x-r*.45,y+r*.2);c.lineTo(x+r*.45,y+r*.2);c.lineTo(x+r*.35,y+r*.75);c.lineTo(x-r*.35,y+r*.75);c.fill();
  circle(c,x,y-r*.05,r*.38,'#e9c46a');c.fillStyle='#52b788';c.beginPath();c.ellipse(x-r*.25,y-r*.55,r*.25,r*.12,-.6,0,7);c.ellipse(x+r*.25,y-r*.55,r*.25,r*.12,.6,0,7);c.fill();
  eyes(c,x,y-r*.08,r,.15,.07);c.strokeStyle='#6f4518';c.lineWidth=Math.max(1,r*.04);c.beginPath();c.arc(x,y+r*.05,r*.12,Math.PI*.15,Math.PI*.85);c.stroke();
}
/* boards */
function wzDraw(s,n,W,now){
  const id=G.W.id,lv=G.lv,Z=G.wz;ctx.textAlign='center';ctx.textBaseline='middle';
  if(id==='broom'){
    const gr=ctx.createLinearGradient(0,0,0,W);gr.addColorStop(0,'#48cae4');gr.addColorStop(1,'#caf0f8');ctx.fillStyle=gr;ctx.fillRect(0,0,W,W);
    ctx.globalAlpha=.25;ctx.strokeStyle='#ffffff';ctx.setLineDash([s*.15,s*.2]);ctx.lineWidth=Math.max(1,s*.04);ctx.beginPath();lv.ys.forEach((y,x)=>{if(x)ctx.lineTo((x+.5)*s,(y+.5)*s);else ctx.moveTo((x+.5)*s,(y+.5)*s);});ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(lv.t[y][x]){const cx=(x+.5)*s,cy=(y+.5)*s+Math.sin(now/700+x)*s*.04;circle(ctx,cx-s*.2,cy+s*.05,s*.25,'#ffffff');circle(ctx,cx+s*.2,cy+s*.05,s*.25,'#ffffff');circle(ctx,cx,cy-s*.1,s*.3,'#f8f9fa');}
    lv.rings.forEach((r,i)=>{const cx=(r.x+.5)*s,cy=(r.y+.5)*s,got=Z.ringsGot.has(i);ctx.strokeStyle=got?'#52b788':'#ffd23f';ctx.lineWidth=Math.max(3,s*.12);ctx.beginPath();ctx.ellipse(cx,cy,s*.2,s*.42,0,0,7);ctx.stroke();if(got){glyph('✓',cx,cy,s*.3);}});
    Z.birds.forEach(b=>{const [bx,by]=glide(b,b.x,b.y);glyph('🐦',(bx+.5)*s,(by+.5)*s,s*.55);});
  }else if(id==='stairs'){
    ctx.fillStyle='#3c2f2f';ctx.fillRect(0,0,W,W);for(let y=0;y<n;y++)for(let x=0;x<n;x++){ctx.fillStyle=(x+y)%2?'#4a3b3b':'#45373a';ctx.fillRect(x*s,y*s,s+.5,s+.5);}
    for(let i=0;i<n;i++)if(i%3===1){ctx.globalAlpha=.5+.3*Math.sin(now/300+i);circle(ctx,(i+.5)*s,s*.12,s*.06,'#ffd166');ctx.globalAlpha=1;}
    drawTrail(s,'rgba(255,209,102,.25)');drawWalls(lv.g,n,s,'#8d6e63');
    lv.stairs.forEach(st=>{const o=stairO(st,now),X=st.x*s,Y=st.y*s,ph=((now-Z.stT0)%G.cfg.period)/G.cfg.period,warn=ph>.8;
      ctx.save();ctx.translate(X+s/2,Y+s/2);const turn=warn?(ph-.8)/.2*Math.PI/2:0;ctx.rotate((o?Math.PI/2:0)+turn*0);
      ctx.fillStyle=warn&&Math.floor(now/120)%2?'#ffd166':'#bc8a5f';rrect(ctx,-s*.48,-s*.3,s*.96,s*.6,s*.08);ctx.fill();ctx.fillStyle='#7f5539';for(let i=0;i<4;i++)ctx.fillRect(-s*.42+i*s*.24,-s*.28,s*.06,s*.56);ctx.restore();});
  }else if(id==='potion'){
    ctx.fillStyle='#2d2a32';ctx.fillRect(0,0,W,W);for(let y=0;y<n;y++)for(let x=0;x<n;x++){ctx.fillStyle=(x+y)%2?'#3b3640':'#36313b';ctx.fillRect(x*s,y*s,s+.5,s+.5);}
    drawTrail(s,'rgba(123,241,168,.25)');drawWalls(lv.g,n,s,'#6c757d');
    lv.bars.forEach(b=>{const X=b.x*s,Y=b.y*s;ctx.globalAlpha=Z.brewed?.25:.75;const gr2=ctx.createLinearGradient(X,Y,X+s,Y+s);gr2.addColorStop(0,'#c77dff');gr2.addColorStop(.5+.3*Math.sin(now/300),'#7b2cbf');gr2.addColorStop(1,'#c77dff');ctx.fillStyle=gr2;ctx.fillRect(X+s*.08,Y+s*.08,s*.84,s*.84);ctx.globalAlpha=1;if(!Z.brewed){glyph('🔮',X+s/2,Y+s/2,s*.4);}});
    drawCauldron(ctx,(lv.cauldron.x+.5)*s,(lv.cauldron.y+.5)*s,s*.42,now);
    lv.items.forEach(it=>{if(Z.bag.has(it.e))return;const cx=(it.x+.5)*s,cy=(it.y+.5)*s;circle(ctx,cx,cy,s*.34,'rgba(255,255,255,.12)');ctx.fillStyle='#000';glyph(it.e,cx,cy+Math.sin(now/400+it.x)*s*.03,s*.48);});
  }else if(id==='owlpost'){
    ctx.fillStyle='#e9edc9';ctx.fillRect(0,0,W,W);for(let y=0;y<n;y++)for(let x=0;x<n;x++)if((x*5+y*3)%4===0)circle(ctx,(x+.3)*s,(y+.7)*s,s*.05,'#ccd5ae');
    drawTrail(s,'rgba(108,88,76,.2)');drawWalls(lv.g,n,s,'#6c584c');
    drawOwlery(ctx,.5*s,.5*s,s*.42);
    lv.perches.forEach(p=>{glyph('🌳',(p.x+.5)*s,(p.y+.5)*s,s*.55);});
    lv.towers.forEach(t=>{const cx=(t.x+.5)*s,cy=(t.y+.5)*s,done=!Z.letters.has(t.c);ctx.fillStyle='#adb5bd';ctx.fillRect(cx-s*.2,cy-s*.25,s*.4,s*.6);ctx.fillStyle=OWLC[t.c];ctx.beginPath();ctx.moveTo(cx-s*.3,cy-s*.25);ctx.lineTo(cx,cy-s*.5);ctx.lineTo(cx+s*.3,cy-s*.25);ctx.fill();
      if(done){glyph('✅',cx,cy+s*.08,s*.35);}else{ctx.fillStyle=OWLC[t.c];ctx.fillRect(cx-s*.12,cy-s*.05,s*.24,s*.16);ctx.strokeStyle='#ffffff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx-s*.12,cy-s*.05);ctx.lineTo(cx,cy+s*.04);ctx.lineTo(cx+s*.12,cy-s*.05);ctx.stroke();}});
  }else if(id==='flykeys'){
    const gr=ctx.createLinearGradient(0,0,W,W);gr.addColorStop(0,'#e0c3fc');gr.addColorStop(1,'#8ec5fc');ctx.fillStyle=gr;ctx.fillRect(0,0,W,W);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(lv.t[y][x]){const X=x*s,Y=y*s;ctx.fillStyle='#6c757d';ctx.fillRect(X+s*.22,Y+s*.05,s*.56,s*.9);ctx.fillStyle='#adb5bd';ctx.fillRect(X+s*.15,Y+s*.02,s*.7,s*.14);ctx.fillRect(X+s*.15,Y+s*.84,s*.7,s*.14);}
    drawTrail(s,'rgba(255,255,255,.35)');
  }else if(id==='wand'){
    ctx.fillStyle='#10002b';ctx.fillRect(0,0,W,W);for(let i=0;i<30;i++){const h=(i*9301+49297)%233280/233280,h2=(i*4271+1301)%9973/9973;ctx.globalAlpha=.3+.3*Math.sin(now/500+i);circle(ctx,h*W,h2*W,Math.max(1,s*.025),'#ffffff');}ctx.globalAlpha=1;
    drawTrail(s,'rgba(199,125,255,.3)');drawWalls(lv.g,n,s,'#7b2cbf');
    Object.keys(lv.doors).forEach(k=>{const [a,b,o]=k.split(','),x=+a,y=+b,open=Z.open.has(k);const X=o==='h'?(x+1)*s:(x+.5)*s,Y=o==='h'?(y+.5)*s:(y+1)*s;
      if(open){ctx.globalAlpha=.35;}ctx.strokeStyle='#ffd23f';ctx.lineWidth=Math.max(5,s*.24);ctx.lineCap='round';ctx.beginPath();if(o==='h'){ctx.moveTo(X,Y-s*.42);ctx.lineTo(X,Y+s*.42);}else{ctx.moveTo(X-s*.42,Y);ctx.lineTo(X+s*.42,Y);}ctx.stroke();ctx.globalAlpha=1;
      if(!open){ctx.fillStyle='rgba(16,0,43,.85)';const rune=lv.doors[k],wdt=rune.length*s*.3+s*.1;rrect(ctx,X-wdt/2,Y-s*.2,wdt,s*.4,s*.12);ctx.fill();ctx.font=Math.round(s*.24)+'px sans-serif';rune.forEach((a,i)=>ctx.fillText(ARW[a],X+wdt/2-s*.2-i*s*.3,Y));}});
  }
}
function wzDraw2(s,n,W,now){
  const id=G.W.id,lv=G.lv,Z=G.wz;ctx.textAlign='center';ctx.textBaseline='middle';
  if(id==='broom'){const cx=(G.vis.x+.5)*s,cy=(G.vis.y+.5)*s+s*.3;ctx.strokeStyle='#8d5524';ctx.lineWidth=Math.max(2,s*.08);ctx.beginPath();ctx.moveTo(cx-s*.45,cy);ctx.lineTo(cx+s*.35,cy-s*.05);ctx.stroke();
    ctx.fillStyle='#e9c46a';ctx.beginPath();ctx.moveTo(cx-s*.4,cy);ctx.lineTo(cx-s*.65,cy-s*.15);ctx.lineTo(cx-s*.65,cy+s*.15);ctx.fill();
    if(!Z.flying){ctx.globalAlpha=.6+.4*Math.sin(now/200);glyph('➡️',cx+s*.7,cy-s*.3,s*.4);ctx.globalAlpha=1;}}
  if(id==='potion'&&Z.brewed){ctx.globalAlpha=.35+.2*Math.sin(now/200);circle(ctx,(G.vis.x+.5)*s,(G.vis.y+.5)*s,s*.5,'#7bf1a8');ctx.globalAlpha=1;}
  if(id==='flykeys'){Z.keys.forEach(k=>{const [x,y]=glide(k,k.x,k.y),cx=(x+.5)*s,cy=(y+.5)*s+Math.sin(now/150+k.c)*s*.06,flap=Math.abs(Math.sin(now/90+k.c));
      ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.ellipse(cx-s*.2,cy-s*.12,s*.16,s*.08*flap+1,-.4,0,7);ctx.ellipse(cx+s*.2,cy-s*.12,s*.16,s*.08*flap+1,.4,0,7);ctx.fill();
      drawKey(ctx,cx,cy,s*.32,KEYCOL[k.c]);});
    if(Z.gotKeys.length<lv.need.length)nwLock(s);}
  if(id==='wand'&&Z.casting){ctx.globalAlpha=.35+.25*Math.sin(now/120);circle(ctx,(G.vis.x+.5)*s,(G.vis.y+.5)*s,s*.55,'#c77dff');ctx.globalAlpha=1;
    const rune=lv.doors[Z.door],k=rune.length,bw=Math.min(W*.9,k*s*1.3+s*.6),bh=s*1.95,bx=(W-bw)/2,by=W*.06,shake=Z.miss&&now-Z.miss.t0<300?Math.sin((now-Z.miss.t0)/20)*s*.12:0;
    ctx.fillStyle='rgba(16,0,43,.88)';rrect(ctx,bx+shake,by,bw,bh,s*.3);ctx.fill();ctx.strokeStyle='#ffd23f';ctx.lineWidth=Math.max(2,s*.06);ctx.stroke();
    ctx.font=Math.round(s*.32)+'px sans-serif';ctx.fillStyle='#ffffff';ctx.fillText('🪄 לוחצים על החיצים לפי הסדר',W/2+shake,by+s*.38);
    const cw=(bw-s*.6)/k;rune.forEach((a,i)=>{const cx=bx+bw-s*.3-cw*(i+.5)+shake,cy=by+s*1.02,done=i<Z.spell.length,cur=i===Z.spell.length;
      if(cur){ctx.globalAlpha=.5+.4*Math.sin(now/130);circle(ctx,cx,cy,s*.42,'#ffd23f');ctx.globalAlpha=1;}
      ctx.font=Math.round(s*.6)+'px sans-serif';ctx.globalAlpha=done?.35:1;ctx.fillText(done?'✨':ARW[a],cx,cy);ctx.globalAlpha=1;ctx.font='bold '+Math.round(s*.22)+'px sans-serif';ctx.fillStyle='#ffd23f';ctx.fillText(i+1,cx,cy+s*.48);ctx.fillStyle='#ffffff';});}
}

function drawLolly(c,x,y,r){
  c.fillStyle='#f1faee';c.fillRect(x-r*.06,y+r*.35,r*.12,r*.5);
  const cols=['#ff5d8f','#ffd23f','#4cc9f0','#8ac926'];for(let i=0;i<4;i++){c.strokeStyle=cols[i];c.lineWidth=Math.max(2,r*.14);c.beginPath();c.arc(x,y-r*.05,r*(.5-i*.12),i*1.2,i*1.2+5);c.stroke();}
  circle(c,x,y-r*.05,r*.15,'#ffffff');eyes(c,x,y-r*.1,r,.16,.07);
}
function drawFountain(c,x,y,r){
  c.fillStyle='#adb5bd';c.beginPath();c.ellipse(x,y+r*.45,r*.85,r*.28,0,0,7);c.fill();c.fillStyle='#4cc9f0';c.beginPath();c.ellipse(x,y+r*.4,r*.68,r*.18,0,0,7);c.fill();
  c.fillStyle='#ced4da';c.fillRect(x-r*.12,y-r*.25,r*.24,r*.65);c.beginPath();c.ellipse(x,y-r*.25,r*.42,r*.13,0,0,7);c.fill();
  c.strokeStyle='#90e0ef';c.lineWidth=Math.max(1.5,r*.09);c.beginPath();c.moveTo(x,y-r*.3);c.quadraticCurveTo(x-r*.45,y-r*.95,x-r*.6,y+r*.3);c.moveTo(x,y-r*.3);c.quadraticCurveTo(x+r*.45,y-r*.95,x+r*.6,y+r*.3);c.stroke();
  circle(c,x,y-r*.62,r*.12,'#caf0f8');
}
function drawSnail(c,x,y,r){
  circle(c,x+r*.12,y-r*.12,r*.52,'#f4a261');c.strokeStyle='#bc6c25';c.lineWidth=Math.max(1.5,r*.08);c.beginPath();
  for(let a=0;a<12.5;a+=.3){const rr=r*.44*(1-a/14);const px=x+r*.12+Math.cos(a)*rr,py=y-r*.12+Math.sin(a)*rr;a?c.lineTo(px,py):c.moveTo(px,py);}c.stroke();
  c.fillStyle='#b5e48c';c.beginPath();c.ellipse(x,y+r*.42,r*.8,r*.2,0,0,7);c.fill();
  circle(c,x-r*.42,y+r*.08,r*.34,'#b5e48c');c.strokeStyle='#76c893';c.lineWidth=Math.max(1,r*.06);c.beginPath();c.moveTo(x-r*.55,y-r*.2);c.lineTo(x-r*.68,y-r*.55);c.moveTo(x-r*.3,y-r*.2);c.lineTo(x-r*.22,y-r*.55);c.stroke();
  circle(c,x-r*.68,y-r*.57,r*.07,'#76c893');circle(c,x-r*.22,y-r*.57,r*.07,'#76c893');eyes(c,x-r*.42,y+r*.05,r,.12,.07);circle(c,x-r*.62,y+r*.2,r*.05,'#ffafcc');circle(c,x-r*.22,y+r*.2,r*.05,'#ffafcc');
}
function drawCubie(c,x,y,r){
  c.fillStyle='#ff924c';rrect(c,x-r*.55,y-r*.5,r*1.1,r*1.05,r*.18);c.fill();c.fillStyle='rgba(255,255,255,.35)';rrect(c,x-r*.42,y-r*.42,r*.6,r*.18,r*.08);c.fill();
  c.fillStyle='rgba(0,0,0,.15)';c.fillRect(x-r*.5,y+r*.38,r,r*.12);eyes(c,x,y-r*.02,r,.2,.09);circle(c,x-r*.32,y+r*.15,r*.06,'#ffafcc');circle(c,x+r*.32,y+r*.15,r*.06,'#ffafcc');
}
kit(WZ,ftWrap({move:wzMove,tick:wzTick,hud:wzHud,draw:wzDraw,draw2:wzDraw2,action:wzAction}));
