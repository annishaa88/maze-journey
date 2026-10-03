/* ================= newest worlds: playing (sheep, chef, memory, spell, paint, gravity) ================= */
const NW=new Set(['sheep','chef','memory','spell','paint','gravity']);
const nwIn=(n,x,y)=>x>=0&&y>=0&&x<n&&y<n;
function nwFresh(lv){
  return {flock:(lv.sheep||[]).map(s=>s.slice()),penned:0,shUndo:[],shVis:new Map(),
    gotIng:0,itemsLeft:(lv.items||[]).map(i=>Object.assign({},i)),stoveT:0,prevP:{x:lv.start.x,y:lv.start.y},
    memHide:false,peekUntil:0,peeksUsed:0,memG:null,
    spellI:0,tilesLeft:(lv.tiles||[]).map(t=>Object.assign({},t)),
    painted:lv.cells?[lv.start.x+','+lv.start.y]:[],pUndo:[],
    grav:2,gravHurt:false};
}
function baa(){beep(330,.09,'triangle');setTimeout(()=>beep(290,.14,'triangle'),90);}
function stoveHot(st){return (G.stoveT+st.ph)%3===0;}
function stoveWarm(st){return (G.stoveT+st.ph)%3===2;}
function memGrid(){
  if(!G.memG){const n=G.lv.n;G.memG=Array.from({length:n},(_,y)=>Array.from({length:n},(_,x)=>[y===0?1:0,x===n-1?1:0,y===n-1?1:0,x===0?1:0]));}
  return G.memG;
}
function memReveal(x,y,d){const g=G.lv.g,n=G.lv.n,m=memGrid();if(!g[y][x][d])return;m[y][x][d]=1;const a=x+DV[d][0],b=y+DV[d][1];if(nwIn(n,a,b))m[b][a][(d+2)%4]=1;}
function sayWord(){if(!muted&&G&&G.lv.word)speak(G.lv.word.toLowerCase(),true,'en-US');}
function nwAction(){
  if(!G||G.done)return;
  if(G.W.id==='spell'){sayWord();return;}
  if(G.W.id==='memory'){
    if(!G.memHide){toast('הקירות עוד כאן 🙂 תסתכלי טוב ותזוזי');return;}
    const left=G.cfg.peeks-G.peeksUsed;if(left<=0){toast('נגמרו ההצצות 👁️ נסי להיזכר, או להתחיל מחדש');return;}
    G.peeksUsed++;G.peekUntil=performance.now()+2500;beep(880,.1,'sine');beep(1175,.12,'sine');updateHud();
  }
}
function nwMove(d){
  const id=G.W.id,lv=G.lv,n=lv.n,x=G.p.x,y=G.p.y,nx=x+DV[d][0],ny=y+DV[d][1],toGoal=nx===lv.goal.x&&ny===lv.goal.y;
  if(id==='sheep'){
    if(!nwIn(n,nx,ny)||lv.t[ny][nx]){bumpWall(d);return;}
    if(G.flock.some(s=>s[0]===nx&&s[1]===ny)){bumpWall(d);baa();arcSay('כבשה בדרך! 🐑 כבשה זזה רק כשמתקרבים אליה');return;}
    if(toGoal&&G.flock.length){bumpWall(d);arcSay('קודם כל הכבשים נכנסות לדיר 🐑 נשארו '+G.flock.length);return;}
    G.shUndo.push({p:{x,y},flock:G.flock.map(s=>s.slice()),penned:G.penned,stars:new Set(G.stars),got:G.got});
    G.p={x:nx,y:ny};enter(nx,ny);
    const old=G.flock,r=GEN.sheepStep(lv.t,n,G.p,old,lv.goal),vis=new Map();
    r.sh.forEach(s=>{const k=s[0]+','+s[1];let o=G.shVis.get(k);
      if(!old.some(q=>q[0]===s[0]&&q[1]===s[1])){const dx=Math.sign(s[0]-G.p.x),dy=Math.sign(s[1]-G.p.y);o=G.shVis.get((s[0]-dx)+','+(s[1]-dy));}
      vis.set(k,o||{});});
    const moved=r.penned||r.sh.some(s=>!old.some(q=>q[0]===s[0]&&q[1]===s[1]));
    G.flock=r.sh;G.shVis=vis;
    if(r.penned){G.penned+=r.penned;baa();sparkle(lv.goal.x,lv.goal.y,['#ffffff','#ffd23f'],12);
      toast(G.flock.length?'כבשה בדיר! 🐑 עוד '+G.flock.length:'כל הכבשים בדיר! 🐑 עכשיו היכנסי גם את');updateHud();}
    else if(moved)baa();else beep(520,.03,'sine');
    if(atGoal())win();return;
  }
  if(id==='chef'){
    if(lv.g[y][x][d]){bumpWall(d);return;}
    if(toGoal&&G.gotIng<lv.want.length){bumpWall(d);arcSay('עוד חסר במתכון: '+lv.want.slice(G.gotIng).join(' '));return;}
    const st=lv.stoves.find(s=>s.x===nx&&s.y===ny);
    if(st&&stoveHot(st)){bumpWall(d);arcSay('אוי, חם! 🔥 מחכים שהכיריים יכבו');return;}
    G.prevP={x,y};G.p={x:nx,y:ny};enter(nx,ny);
    const ii=G.itemsLeft.findIndex(i=>i.x===nx&&i.y===ny);
    if(ii>=0){const it=G.itemsLeft[ii];
      if(it.need===G.gotIng){G.itemsLeft.splice(ii,1);G.gotIng++;[660,880].forEach((f,i)=>setTimeout(()=>beep(f,.08,'sine'),i*70));sparkle(nx,ny,['#ffd23f','#ff8fab'],8);
        toast(G.gotIng<lv.want.length?'הוספת '+it.e+'! עכשיו צריך '+lv.want[G.gotIng]:'יש את כל המצרכים! רוצי אל הסיר 🍲');updateHud();}
      else if(it.need>G.gotIng)arcSay('עוד לא! קודם צריך '+lv.want[G.gotIng]);
      else arcSay(it.e+' לא במתכון של ה'+lv.dishName+' 🙂');}
    if(atGoal()){toast('בישלת '+lv.dishName+'! '+lv.dish);win();}return;
  }
  if(id==='memory'){
    if(!G.memHide){G.memHide=true;toast('פוף! 🪄 הקירות נעלמו. זוכרת את הדרך?');updateHud();}
    if(lv.g[y][x][d]){memReveal(x,y,d);bumpWall(d);return;}
    G.p={x:nx,y:ny};enter(nx,ny);if(G.cfg.near)for(let k=0;k<4;k++)memReveal(nx,ny,k);
    beep(520,.03,'sine');if(atGoal())win();return;
  }
  if(id==='spell'){
    if(lv.g[y][x][d]){bumpWall(d);return;}
    if(toGoal&&G.spellI<lv.word.length){bumpWall(d);arcSay('הדלת נפתחת כשהמילה מוכנה '+lv.pic);return;}
    G.p={x:nx,y:ny};enter(nx,ny);
    const ti=G.tilesLeft.findIndex(t=>t.x===nx&&t.y===ny);
    if(ti>=0){const t=G.tilesLeft[ti];
      if(t.ch===lv.word[G.spellI]){G.tilesLeft.splice(ti,1);G.spellI++;beep(700+G.spellI*80,.1,'sine');sparkle(nx,ny,['#4cc9f0','#ffd23f'],8);
        if(!muted)speak(t.ch,true,'en-US');
        if(G.spellI===lv.word.length){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,.1,'sine'),i*80));toast('יש! '+lv.word+' '+lv.pic+' הדלת פתוחה');setTimeout(sayWord,700);}
        updateHud();}
      else arcSay(G.cfg.show?'זו האות '+t.ch+'. עכשיו צריך את '+lv.word[G.spellI]:'זו לא האות הבאה. איזו אות באה עכשיו? 🤔');}
    if(atGoal())win();return;
  }
  if(id==='paint'){
    if(!nwIn(n,nx,ny)||lv.t[ny][nx]){bumpWall(d);return;}
    const k=nx+','+ny;
    if(G.painted.includes(k)){bumpWall(d);arcSay('כאן כבר צבוע 🎨 נתקעת? צעד אחורה ↩');return;}
    G.pUndo.push({p:{x,y},stars:new Set(G.stars),got:G.got});
    G.p={x:nx,y:ny};G.painted.push(k);enter(nx,ny);beep(400+(G.painted.length%12)*45,.06,'sine');
    if(G.painted.length===lv.cells){updateHud();win();return;}
    let ex=0;for(let e=0;e<4;e++){const a=nx+DV[e][0],b=ny+DV[e][1];if(nwIn(n,a,b)&&!lv.t[b][a]&&!G.painted.includes(a+','+b))ex++;}
    if(!ex)toast('אין לאן להמשיך 🙈 נשארו '+(lv.cells-G.painted.length)+' משבצות. לחצי ↩ צעד אחורה');
    updateHud();return;
  }
  if(id==='gravity'){
    if(G.anim)return;
    const r=GEN.gravMove(lv.t,n,x,y,G.grav,d,lv.goal);
    if(!r){bumpWall(d);return;}
    if(r.g!==G.grav){G.grav=r.g;beep(r.g===0?700:400,.12,'sine');updateHud();}
    if(r.spike)G.gravHurt=true;
    if(r.path.length)G.anim={cells:r.path,i:0,t:0,ms:65};
    return;
  }
}
function nwUndo(){
  if(!G||G.done)return false;
  if(G.W.id==='sheep'){const u=G.shUndo.pop();if(!u)return true;G.p=u.p;G.flock=u.flock;G.penned=u.penned;G.stars=u.stars;G.got=u.got;G.shVis=new Map();beep(500,.08,'sine');updateHud();return true;}
  if(G.W.id==='paint'){const u=G.pUndo.pop();if(!u)return true;G.painted.pop();G.p=u.p;G.stars=u.stars;G.got=u.got;beep(500,.08,'sine');updateHud();return true;}
  return false;
}
function nwHint(){
  if(!G||G.done||G.anim)return false;const id=G.W.id,lv=G.lv;
  if(id==='sheep'){const R=GEN.sheepSolve(lv.t,lv.n,G.p,G.flock,lv.goal,80000);
    if(!R){toast('מכאן הכבשים תקועות. לחצי ↩ צעד אחורה');return true;}G.hint={d:R.sol[0],until:performance.now()+1800};return true;}
  if(id==='paint'){const d=GEN.paintSolve(lv.t,lv.n,G.painted,G.p,60000);
    if(d<0){toast('מכאן אי אפשר לצבוע הכול. לחצי ↩ צעד אחורה');return true;}G.hint={d,until:performance.now()+1800};return true;}
  if(id==='gravity'){const R=GEN.gravSolve(lv.t,lv.n,{x:G.p.x,y:G.p.y,g:G.grav},lv.goal,30000);
    if(!R){toast('מכאן אי אפשר להגיע. נסי להתחיל מחדש');return true;}G.hint={d:R.sol[0],until:performance.now()+1800};return true;}
  return false;
}
function nwTick(now){
  const id=G.W.id;
  if(id==='chef'&&G.lv.stoves.length&&now-G.arcAt>G.cfg.speed){G.arcAt=now;G.stoveT++;
    const st=G.lv.stoves.find(s=>s.x===G.p.x&&s.y===G.p.y);
    if(st&&stoveHot(st))arcHurt('אוי, חם! 🔥 קפצת מהכיריים',G.prevP,false);}
  if(id==='gravity'&&G.gravHurt&&!G.anim){G.gravHurt=false;G.grav=2;arcHurt('בום! 💥 מוקש חלל. חוזרים להתחלה',G.lv.start,false);}
}
function nwHud(add){
  const id=G.W.id,lv=G.lv;
  if(id==='sheep')add('🐑 בדיר: '+G.penned+' מתוך '+lv.sheep.length);
  if(id==='chef')add(lv.dish+' '+lv.dishName+': '+lv.want.map((e,i)=>i<G.gotIng?'✅':i===G.gotIng?'👉'+e:e).join(' '));
  if(id==='memory'){add(G.memHide?'🪄 הקירות נעלמו':'👀 תסתכלי טוב!');add('👁️ הצצות: '+Math.max(0,G.cfg.peeks-G.peeksUsed));}
  if(id==='spell'){const s=add('');s.dir='ltr';s.style.letterSpacing='.15em';
    s.innerHTML=lv.pic+' '+lv.word.split('').map((c,i)=>i<G.spellI?'<b>'+c+'</b>':G.cfg.show?'<span style="opacity:.35">'+c+'</span>':'_').join(' ');}
  if(id==='paint')add('🎨 צבוע: '+G.painted.length+' מתוך '+lv.cells);
  if(id==='gravity')add(G.grav===2?'⬇️ נופלים למטה':'⬆️ נופלים למעלה');
}
/* drawing */
function drawSheep(c,x,y,r,now){
  const b=now?Math.sin(now/260+x)*r*.04:0;
  circle(c,x-r*.55,y+r*.55,r*.12,'#3d3346');circle(c,x+r*.4,y+r*.55,r*.12,'#3d3346');
  [[-.4,-.15],[0,-.32],[.4,-.15],[-.45,.2],[.45,.2],[0,.28],[0,0]].forEach(([a,q])=>circle(c,x+a*r,y+q*r+b,r*.36,'#ffffff'));
  c.strokeStyle='#ddd6ea';c.lineWidth=Math.max(1,r*.04);c.beginPath();c.arc(x,y+b,r*.7,0,7);c.stroke();
  c.fillStyle='#4a4058';c.beginPath();c.ellipse(x,y+r*.05+b,r*.3,r*.34,0,0,7);c.fill();
  c.fillStyle='#4a4058';c.beginPath();c.ellipse(x-r*.36,y-r*.08+b,r*.14,r*.07,-.5,0,7);c.ellipse(x+r*.36,y-r*.08+b,r*.14,r*.07,.5,0,7);c.fill();
  circle(c,x-r*.12,y+b,r*.07,'#ffffff');circle(c,x+r*.12,y+b,r*.07,'#ffffff');circle(c,x-r*.12,y+r*.01+b,r*.035,'#1d1530');circle(c,x+r*.12,y+r*.01+b,r*.035,'#1d1530');
  circle(c,x-r*.2,y+r*.2+b,r*.05,'#ff9eb5');circle(c,x+r*.2,y+r*.2+b,r*.05,'#ff9eb5');
}
function drawPen(c,x,y,r){
  c.fillStyle='#e9c46a';c.beginPath();c.ellipse(x,y+r*.3,r*.7,r*.28,0,0,7);c.fill();
  c.fillStyle='#c0392b';c.fillRect(x-r*.55,y-r*.35,r*1.1,r*.65);c.fillStyle='#8e2a1e';c.beginPath();c.moveTo(x-r*.7,y-r*.3);c.lineTo(x,y-r*.85);c.lineTo(x+r*.7,y-r*.3);c.fill();
  c.fillStyle='#fff';c.fillRect(x-r*.2,y-r*.1,r*.4,r*.4);c.strokeStyle='#c0392b';c.lineWidth=Math.max(1,r*.06);c.beginPath();c.moveTo(x-r*.2,y-r*.1);c.lineTo(x+r*.2,y+r*.3);c.moveTo(x+r*.2,y-r*.1);c.lineTo(x-r*.2,y+r*.3);c.stroke();
  c.fillStyle='#f4f1de';for(let i=0;i<4;i++)c.fillRect(x-r*.8+i*r*.53,y+r*.05,r*.08,r*.4);c.fillRect(x-r*.85,y+r*.12,r*1.7,r*.07);c.fillRect(x-r*.85,y+r*.3,r*1.7,r*.07);
}
function drawPot(c,x,y,r,now){
  const t=now||0;c.globalAlpha=.55;for(let i=0;i<3;i++){const yy=y-r*.55-((t/30+i*20)%40)/40*r*.5;circle(c,x-r*.25+i*r*.25+Math.sin(t/300+i)*r*.05,yy,r*.1,'#ffffff');}c.globalAlpha=1;
  c.fillStyle='#5c677d';c.beginPath();c.ellipse(x,y+r*.05,r*.62,r*.5,0,0,Math.PI);c.fill();c.fillRect(x-r*.62,y-r*.25,r*1.24,r*.32);
  c.fillStyle='#7d8597';c.beginPath();c.ellipse(x,y-r*.25,r*.66,r*.16,0,0,7);c.fill();c.fillStyle='#ff9f1c';c.beginPath();c.ellipse(x,y-r*.25,r*.52,r*.1,0,0,7);c.fill();
  c.fillStyle='#33415c';c.fillRect(x-r*.85,y-r*.2,r*.25,r*.1);c.fillRect(x+r*.6,y-r*.2,r*.25,r*.1);
}
function drawCrystal(c,x,y,r,now){
  const t=now||0;c.fillStyle='#8d6e63';c.beginPath();c.moveTo(x-r*.45,y+r*.75);c.lineTo(x+r*.45,y+r*.75);c.lineTo(x+r*.3,y+r*.45);c.lineTo(x-r*.3,y+r*.45);c.fill();
  const gr=c.createRadialGradient(x-r*.2,y-r*.2,r*.05,x,y,r*.6);gr.addColorStop(0,'#ffffff');gr.addColorStop(.4,'#c77dff');gr.addColorStop(1,'#5a189a');
  c.fillStyle=gr;c.beginPath();c.arc(x,y,r*.58,0,7);c.fill();
  c.globalAlpha=.7;star(c,x+Math.sin(t/400)*r*.2,y+Math.cos(t/500)*r*.15,r*.15);c.globalAlpha=1;
}
function drawAbcDoor(c,x,y,r){
  c.fillStyle='#3a86ff';rrect(c,x-r*.55,y-r*.8,r*1.1,r*1.6,r*.5);c.fill();c.fillStyle='#8ecae6';rrect(c,x-r*.42,y-r*.66,r*.84,r*1.4,r*.4);c.fill();
  c.fillStyle='#023047';c.font='bold '+Math.round(r*.42)+'px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('ABC',x,y-r*.1);circle(c,x+r*.25,y+r*.3,r*.07,'#ffd23f');
}
function drawPalette(c,x,y,r){
  c.fillStyle='#e9c46a';c.beginPath();c.ellipse(x,y,r*.8,r*.62,-.2,0,7);c.fill();c.fillStyle='rgba(0,0,0,.18)';circle(c,x+r*.35,y+r*.2,r*.14,'rgba(0,0,0,.15)');
  [['#ff595e',-.45,-.15],['#ffca3a',-.15,-.38],['#8ac926',.2,-.35],['#1982c4',.45,-.08],['#6a4c93',-.3,.25]].forEach(([col,a,b])=>circle(c,x+a*r,y+b*r,r*.15,col));
  c.save();c.translate(x+r*.15,y+r*.15);c.rotate(-.8);c.fillStyle='#8d5524';c.fillRect(-r*.05,-r*.1,r*.1,r*.7);c.fillStyle='#ff595e';c.beginPath();c.ellipse(0,-r*.15,r*.07,r*.14,0,0,7);c.fill();c.restore();
}
function drawRocket(c,x,y,r,now){
  const t=now||0,f=1+Math.sin(t/80)*.15;
  c.fillStyle='#ff9f1c';c.beginPath();c.moveTo(x-r*.18,y+r*.45);c.lineTo(x,y+r*(.45+.4*f));c.lineTo(x+r*.18,y+r*.45);c.fill();
  c.fillStyle='#e63946';c.beginPath();c.moveTo(x-r*.25,y+r*.15);c.lineTo(x-r*.5,y+r*.55);c.lineTo(x-r*.2,y+r*.45);c.fill();c.beginPath();c.moveTo(x+r*.25,y+r*.15);c.lineTo(x+r*.5,y+r*.55);c.lineTo(x+r*.2,y+r*.45);c.fill();
  c.fillStyle='#f1faee';c.beginPath();c.moveTo(x,y-r*.85);c.quadraticCurveTo(x+r*.38,y-r*.35,x+r*.25,y+r*.48);c.lineTo(x-r*.25,y+r*.48);c.quadraticCurveTo(x-r*.38,y-r*.35,x,y-r*.85);c.fill();
  c.fillStyle='#e63946';c.beginPath();c.moveTo(x,y-r*.85);c.quadraticCurveTo(x+r*.2,y-r*.62,x+r*.24,y-r*.5);c.lineTo(x-r*.24,y-r*.5);c.quadraticCurveTo(x-r*.2,y-r*.62,x,y-r*.85);c.fill();
  circle(c,x,y-r*.12,r*.16,'#457b9d');circle(c,x,y-r*.12,r*.1,'#a8dadc');
}
function drawMine(c,x,y,r,now){
  const t=now||0;c.strokeStyle='#6c757d';c.lineWidth=Math.max(2,r*.14);c.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4+t/2000;c.moveTo(x+Math.cos(a)*r*.4,y+Math.sin(a)*r*.4);c.lineTo(x+Math.cos(a)*r*.8,y+Math.sin(a)*r*.8);}c.stroke();
  circle(c,x,y,r*.5,'#495057');circle(c,x,y,r*.2,Math.floor(t/400)%2?'#ff4d6d':'#ffb3c1');
}
function nwLock(s){const lv=G.lv,X=lv.goal.x*s,Y=lv.goal.y*s;ctx.fillStyle='rgba(20,15,40,.35)';rrect(ctx,X+s*.08,Y+s*.08,s*.84,s*.84,s*.14);ctx.fill();ctx.font=Math.round(s*.34)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🔒',X+s*.75,Y+s*.25);}
function nwDraw(s,n,W,now){
  const id=G.W.id,lv=G.lv;ctx.textAlign='center';ctx.textBaseline='middle';
  if(id==='sheep'){
    const gr=ctx.createLinearGradient(0,0,0,W);gr.addColorStop(0,'#cdeac0');gr.addColorStop(1,'#a7d49b');ctx.fillStyle=gr;ctx.fillRect(0,0,W,W);
    ctx.strokeStyle='rgba(56,142,60,.3)';ctx.lineWidth=Math.max(1,s*.04);ctx.beginPath();
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if((x*5+y*3)%3===0){const gx=x*s+s*.3,gy=y*s+s*.7;ctx.moveTo(gx,gy);ctx.lineTo(gx+s*.05,gy-s*.15);ctx.moveTo(gx+s*.12,gy);ctx.lineTo(gx+s*.14,gy-s*.12);}ctx.stroke();
    drawTrail(s,'rgba(255,255,255,.4)');
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(lv.t[y][x]){const cx=(x+.5)*s,cy=(y+.5)*s;
      circle(ctx,cx,cy+s*.08,s*.42,'#2d6a4f');circle(ctx,cx-s*.18,cy,s*.26,'#40916c');circle(ctx,cx+s*.16,cy-s*.06,s*.28,'#52b788');circle(ctx,cx,cy-s*.18,s*.22,'#74c69d');
      circle(ctx,cx-s*.12,cy-s*.05,s*.05,'#ff8fab');circle(ctx,cx+s*.15,cy+s*.1,s*.05,'#ffd23f');}
  }else if(id==='chef'){
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){ctx.fillStyle=(x+y)%2?'#ffffff':'#e3f2fd';ctx.fillRect(x*s,y*s,s+1,s+1);}
    drawTrail(s,'rgba(255,159,28,.3)');
    lv.stoves.forEach(st=>{const X=st.x*s,Y=st.y*s,hot=stoveHot(st),warm=stoveWarm(st);
      ctx.fillStyle='#343a40';rrect(ctx,X+s*.06,Y+s*.06,s*.88,s*.88,s*.1);ctx.fill();
      ctx.strokeStyle=hot?'#ff4d4d':warm&&Math.floor(now/200)%2?'#ff9f1c':'#6c757d';ctx.lineWidth=Math.max(2,s*.07);
      ctx.beginPath();ctx.arc(X+s/2,Y+s/2,s*.3,0,7);ctx.stroke();ctx.beginPath();ctx.arc(X+s/2,Y+s/2,s*.16,0,7);ctx.stroke();
      if(hot){ctx.font=Math.round(s*.45)+'px sans-serif';ctx.fillText('🔥',X+s/2,Y+s*.45+Math.sin(now/90)*s*.03);}});
    drawWalls(lv.g,n,s,'#b5651d');
    G.itemsLeft.forEach(it=>{const cx=(it.x+.5)*s,cy=(it.y+.5)*s,next=it.need===G.gotIng;
      if(next){ctx.globalAlpha=.35+.25*Math.sin(now/200);circle(ctx,cx,cy,s*.46,'#ffd23f');ctx.globalAlpha=1;}
      circle(ctx,cx,cy+s*.04,s*.36,'#ced4da');circle(ctx,cx,cy,s*.36,'#ffffff');circle(ctx,cx,cy,s*.27,'#f1f3f5');
      ctx.font=Math.round(s*.42)+'px sans-serif';ctx.fillText(it.e,cx,cy+s*.03);});
  }else if(id==='memory'){
    const gr=ctx.createLinearGradient(0,0,W,W);gr.addColorStop(0,'#f3e8ff');gr.addColorStop(1,'#e0c3fc');ctx.fillStyle=gr;ctx.fillRect(0,0,W,W);
    ctx.fillStyle='rgba(90,24,154,.08)';for(let y=0;y<n;y++)for(let x=0;x<n;x++)if((x+y)%2)ctx.fillRect(x*s,y*s,s,s);
    drawTrail(s,'rgba(199,125,255,.45)');
    const peek=now<G.peekUntil;
    if(!G.memHide||peek){if(peek){ctx.globalAlpha=Math.min(1,(G.peekUntil-now)/400);}drawWalls(lv.g,n,s,peek?'#9d4edd':'#5a189a');ctx.globalAlpha=1;}
    if(G.memHide)drawWalls(memGrid(),n,s,'#5a189a');
  }else if(id==='spell'){
    ctx.fillStyle='#f6f9ff';ctx.fillRect(0,0,W,W);ctx.strokeStyle='rgba(58,134,255,.15)';ctx.lineWidth=1;ctx.beginPath();for(let i=1;i<n*2;i++){ctx.moveTo(0,i*s/2);ctx.lineTo(W,i*s/2);}ctx.stroke();
    ctx.strokeStyle='rgba(255,93,143,.3)';ctx.beginPath();ctx.moveTo(s*.4,0);ctx.lineTo(s*.4,W);ctx.stroke();
    drawTrail(s,'rgba(58,134,255,.25)');drawWalls(lv.g,n,s,'#023e8a');
    const cols=['#ff595e','#ffca3a','#8ac926','#1982c4','#6a4c93','#ff924c'];
    G.tilesLeft.forEach((t,i)=>{const cx=(t.x+.5)*s,cy=(t.y+.5)*s,next=G.cfg.show&&t.ch===lv.word[G.spellI];
      if(next){ctx.globalAlpha=.35+.25*Math.sin(now/200);circle(ctx,cx,cy,s*.48,'#ffd23f');ctx.globalAlpha=1;}
      const col=cols[(t.ch.charCodeAt(0))%cols.length];ctx.fillStyle='rgba(0,0,0,.18)';rrect(ctx,cx-s*.34,cy-s*.3,s*.68,s*.68,s*.14);ctx.fill();
      ctx.fillStyle=col;rrect(ctx,cx-s*.34,cy-s*.36,s*.68,s*.68,s*.14);ctx.fill();
      ctx.fillStyle='#ffffff';ctx.font='bold '+Math.round(s*.46)+'px sans-serif';ctx.fillText(t.ch,cx,cy-s*.01);});
  }else if(id==='paint'){
    ctx.fillStyle='#fffdf7';ctx.fillRect(0,0,W,W);
    ctx.strokeStyle='rgba(0,0,0,.06)';ctx.lineWidth=1;ctx.beginPath();for(let i=1;i<n;i++){ctx.moveTo(i*s,0);ctx.lineTo(i*s,W);ctx.moveTo(0,i*s);ctx.lineTo(W,i*s);}ctx.stroke();
    G.painted.forEach((k,i)=>{const [x,y]=k.split(',').map(Number);ctx.fillStyle='hsl('+((i*360/lv.cells)%360)+',85%,68%)';rrect(ctx,x*s+s*.04,y*s+s*.04,s*.92,s*.92,s*.16);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.35)';rrect(ctx,x*s+s*.12,y*s+s*.1,s*.4,s*.14,s*.07);ctx.fill();});
    // a thin line shows the order she painted in
    if(G.painted.length>1){ctx.strokeStyle='rgba(42,33,64,.18)';ctx.lineWidth=Math.max(1,s*.06);ctx.beginPath();G.painted.forEach((k,i)=>{const [x,y]=k.split(',').map(Number);if(i)ctx.lineTo((x+.5)*s,(y+.5)*s);else ctx.moveTo((x+.5)*s,(y+.5)*s);});ctx.stroke();}
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(lv.t[y][x]){const X=x*s,Y=y*s;
      ctx.fillStyle='#adb5bd';rrect(ctx,X+s*.18,Y+s*.22,s*.64,s*.64,s*.08);ctx.fill();ctx.fillStyle='#6c757d';ctx.fillRect(X+s*.18,Y+s*.22,s*.64,s*.12);
      ctx.fillStyle=['#ff595e','#1982c4','#8ac926','#ffca3a'][(x+y)%4];ctx.fillRect(X+s*.18,Y+s*.34,s*.64,s*.18);ctx.beginPath();ctx.ellipse(X+s*.35,Y+s*.55,s*.05,s*.09,0,0,7);ctx.fill();
      ctx.strokeStyle='#495057';ctx.lineWidth=Math.max(1,s*.04);ctx.beginPath();ctx.arc(X+s/2,Y+s*.22,s*.22,Math.PI,0);ctx.stroke();}
  }else if(id==='gravity'){
    const gr=ctx.createLinearGradient(0,0,0,W);gr.addColorStop(0,'#0b1d51');gr.addColorStop(1,'#3a0ca3');ctx.fillStyle=gr;ctx.fillRect(0,0,W,W);
    for(let i=0;i<40;i++){const h=(i*9301+49297)%233280/233280,h2=(i*4271+1301)%9973/9973;ctx.globalAlpha=.35+.35*Math.sin(now/600+i);circle(ctx,h*W,h2*W,Math.max(1,s*.025),'#ffffff');}ctx.globalAlpha=1;
    drawTrail(s,'rgba(76,201,240,.3)');
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){const v=lv.t[y][x],X=x*s,Y=y*s;
      if(v===1){ctx.fillStyle='#8d99ae';ctx.fillRect(X,Y,s+.5,s+.5);ctx.fillStyle='#adb5c4';ctx.fillRect(X+s*.06,Y+s*.06,s*.88,s*.2);ctx.fillStyle='#5c677d';ctx.fillRect(X,Y+s*.85,s+.5,s*.15);
        circle(ctx,X+s*.18,Y+s*.5,s*.05,'#5c677d');circle(ctx,X+s*.82,Y+s*.5,s*.05,'#5c677d');}
      else if(v===2)drawMine(ctx,X+s/2,Y+s/2,s*.4,now);}
  }
}
function nwDraw2(s,n,W,now){
  const id=G.W.id,lv=G.lv;
  if(id==='sheep'){G.flock.forEach(sh=>{const k=sh[0]+','+sh[1];let o=G.shVis.get(k);if(!o){o={};G.shVis.set(k,o);}const [x,y]=glide(o,sh[0],sh[1]);drawSheep(ctx,(x+.5)*s,(y+.5)*s,s*.42,now);});
    if(G.flock.length)nwLock(s);}
  if(id==='chef'&&G.gotIng<lv.want.length)nwLock(s);
  if(id==='spell'&&G.spellI<lv.word.length)nwLock(s);
  if(id==='gravity'){const cx=(G.vis.x+.5)*s,cy=(G.vis.y+.5)*s,up=G.grav===0;ctx.globalAlpha=.75;ctx.fillStyle='#4cc9f0';ctx.beginPath();
    const yy=cy+(up?-s*.5:s*.5),dir=up?-1:1;ctx.moveTo(cx-s*.12,yy-dir*s*.06);ctx.lineTo(cx+s*.12,yy-dir*s*.06);ctx.lineTo(cx,yy+dir*s*.08);ctx.fill();ctx.globalAlpha=1;}
  if(id==='memory'&&!G.memHide){ctx.font='bold '+Math.round(s*.4)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.globalAlpha=.6+.4*Math.sin(now/300);ctx.fillText('👀',(G.vis.x+.5)*s,(G.vis.y-.1)*s+s*.1);ctx.globalAlpha=1;}
}

