/* ================= challenge region: playing ================= */
const CHAL=new Set(['firetruck','schoolbus','train','parking','lights','race','broom','stairs','potion','owlpost','flykeys','wand','match3','blocks','match3b','blockscore','hansel','pigs','beanstalk','thorns','redhood','snow','savanna','lagoon','carpet','ball','toyroom','tilt','shadow','floors','escape','sheep','chef','memory','spell','paint','gravity']);
const CLUEC=['🔴','🟢','🔵','🟡'];
function clueExpr(v,g){
  const r=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pick=a=>a[Math.floor(Math.random()*a.length)];
  if(g<=0){const a=r(0,v);return a+' + '+(v-a);}
  if(g===1){if(Math.random()<.5){const a=r(0,v);return a+' + '+(v-a);}const b=r(1,9);return (v+b)+' − '+b;}
  if(g===2){const f=[2,3].filter(d=>v%d===0&&v>0);if(f.length&&Math.random()<.6){const d=pick(f);return d+' × '+(v/d);}const b=r(2,9);return (v+b)+' − '+b;}
  if(g===3){if(Math.random()<.5){const d=r(2,9);return (v*d)+' ÷ '+d;}const a=r(2,5),b=r(2,5),c=a*b-v;return c>=0?a+' × '+b+' − '+c:(v*2)+' ÷ 2';}
  const c=r(2,5),s=v*c,a=r(0,s);if(Math.random()<.5)return '('+a+' + '+(s-a)+') ÷ '+c;
  const x=r(3,9),y=x*x-v;return y>=0?x+'² − '+y:(v*3)+' ÷ 3';
}
function chFresh(lv){
  if(lv.clues&&!lv.clueText){lv.clueText=lv.code.map(v=>clueExpr(v,grade));}
  return {...nwFresh(lv),...ftFresh(lv),bpos:(lv.boulders||[]).map(b=>b.slice()),tiltUndo:[],tiltA:null,tilts:0,
    trailPath:[{x:lv.start.x,y:lv.start.y}],shIdx:-1,shAt:0,lightsLeft:(lv.lights||[]).map(l=>Object.assign({},l)),
    found:new Set(),doorOpen:false,typed:''};
}
function chMove(d){
  const id=G.W.id,lv=G.lv,n=lv.n,x=G.p.x,y=G.p.y;
  if(id==='tilt'){
    if(G.anim||G.tiltA)return;
    const r=GEN.tiltSim(lv.t,n,G.p,G.bpos,d,lv.goal);
    if(!r.path.length&&r.bs.join()===G.bpos.slice().sort((a,b)=>a[1]*n+a[0]-(b[1]*n+b[0])).join()){bumpWall(d);return;}
    G.tiltUndo.push({p:{x,y},bs:G.bpos.map(b=>b.slice())});G.tilts++;
    G.tiltA={from:G.bpos.map(b=>b.slice()),to:r.bs,t0:performance.now(),dur:Math.max(160,r.path.length*55)};G.bpos=r.bs;
    if(r.path.length)G.anim={cells:r.path,i:0,t:0,ms:55};
    beep(300+d*60,.1,'sine');updateHud();return;
  }
  const g=lv.g;
  if(g[y][x][d]){bumpWall(d);return;}
  let nx=x+DV[d][0],ny=y+DV[d][1];
  if(id==='shadow'){
    if(nx===lv.goal.x&&ny===lv.goal.y&&G.lightsLeft.length){bumpWall(d);arcSay('הדלת נפתחת רק אחרי כל הפנסים 🏮 נשארו '+G.lightsLeft.length);return;}
    G.p={x:nx,y:ny};G.trailPath.push({x:nx,y:ny});enter(nx,ny);
    const li=G.lightsLeft.findIndex(l=>l.x===nx&&l.y===ny);
    if(li>=0){G.lightsLeft.splice(li,1);[660,880,1100].forEach((f,i)=>setTimeout(()=>beep(f,.08,'sine'),i*70));toast(G.lightsLeft.length?'פנס! 🏮 עוד '+G.lightsLeft.length:'כל הפנסים אצלך! 🏮 רוצי אל היציאה');updateHud();}
    if(G.shIdx<0&&G.trailPath.length>G.cfg.delay){G.shIdx=0;G.shAt=performance.now();toast('הצל יצא לדרך! 👣 אל תחזרי על העקבות שלך');}
    shadowHit();if(atGoal())win();return;
  }
  if(id==='floors'){
    G.p={x:nx,y:ny};enter(nx,ny);const k=nx+','+ny;
    if(lv.links[k]){const L=lv.links[k],[a,b]=L.to.split(',').map(Number);G.p={x:a,y:b};enter(a,b);[L.up?500:700,L.up?700:500].forEach((f,i)=>setTimeout(()=>beep(f,.08,'sine'),i*80));
      toast(L.up?'עלית קומה! ⬆️ קומה '+(floorOf(a,b)+1):'ירדת קומה ⬇️ קומה '+(floorOf(a,b)+1));updateHud();}
    else if(lv.holes[k]){const [a,b]=lv.holes[k].split(',').map(Number);G.p={x:a,y:b};enter(a,b);[600,400,250].forEach((f,i)=>setTimeout(()=>beep(f,.1,'sine'),i*70));toast('אופס! נפלת דרך חור לקומה '+(floorOf(a,b)+1)+' 🕳️');updateHud();}
    else beep(520,.03,'sine');
    if(atGoal())win();return;
  }
  if(id==='escape'){
    if(nx===lv.goal.x&&ny===lv.goal.y&&!G.doorOpen){bumpWall(d);openKeypad();return;}
    G.p={x:nx,y:ny};enter(nx,ny);
    const ci=lv.clues.findIndex(c=>c.x===nx&&c.y===ny);
    if(ci>=0&&!G.found.has(ci)){G.found.add(ci);[700,900].forEach((f,i)=>setTimeout(()=>beep(f,.08,'sine'),i*70));
      toast('רמז! 📜 '+CLUEC[ci]+' = '+lv.clueText[ci]);updateHud();}
    if(atGoal())win();return;
  }
}
function floorOf(x,y){const lv=G.lv;for(let f=0;f<lv.F;f++){const [ox,oy]=lv.O[f];if(x>=ox&&x<ox+lv.m&&y>=oy&&y<oy+lv.m)return f;}return 0;}
function shadowHit(){
  if(G.shIdx<0)return;const s=G.trailPath[G.shIdx];
  if(s.x===G.p.x&&s.y===G.p.y&&performance.now()>G.hurtUntil){
    // caught: the shadow takes back one lantern and starts following again from here
    const got=G.lv.lights.filter(l=>!G.lightsLeft.some(q=>q.x===l.x&&q.y===l.y));
    if(got.length){const l=got[got.length-1];G.lightsLeft.push(Object.assign({},l));}
    arcHurt(got.length?'הצל תפס אותך! 👣 הוא לקח פנס אחד והחזיר אותו למקום':'הצל תפס אותך! 👣 ברחי ממנו',G.p,true);
    G.trailPath=[{x:G.p.x,y:G.p.y}];G.shIdx=-1;updateHud();}
}
function chTick(now){
  const id=G.W.id;
  if(G.tiltA&&now-G.tiltA.t0>G.tiltA.dur)G.tiltA=null;
  if(id==='shadow'&&G.shIdx>=0&&now-G.shAt>G.cfg.speed){G.shAt=now;if(G.shIdx<G.trailPath.length-1)G.shIdx++;shadowHit();}
}
function chHud(add){
  const id=G.W.id,lv=G.lv;
  if(id==='tilt')add('🔄 הטיות: '+G.tilts);
  if(id==='shadow'){add('🏮 פנסים: '+(lv.lights.length-G.lightsLeft.length)+' מתוך '+lv.lights.length);add(G.shIdx<0?'👣 הצל מחכה':'👣 הצל בדרך!');}
  if(id==='floors')add('🏢 קומה '+(floorOf(G.p.x,G.p.y)+1)+' מתוך '+lv.F+' · היציאה בקומה '+lv.F);
  if(id==='escape')lv.clues.forEach((c,i)=>{const s=add(CLUEC[i]+' '+(G.found.has(i)?'= '+lv.clueText[i]:'= ?'));s.dir='ltr';});
}
/* escape room keypad */
function openKeypad(){
  const lv=G.lv,el=document.getElementById('keypad');G.typed='';
  document.getElementById('kpCode').textContent=lv.code.map((_,i)=>CLUEC[i]).join(' ');
  kpShow();el.hidden=false;
  document.getElementById('kpNote').textContent=G.found.size<lv.code.length?'עוד לא מצאת את כל הרמזים 📜':'';
}
function kpShow(){const lv=G.lv;document.getElementById('kpSlots').textContent=lv.code.map((_,i)=>G.typed[i]!=null?G.typed[i]:'_').join(' ');}
function kpPress(v){
  if(!G||G.W.id!=='escape')return;const lv=G.lv;
  if(v==='x'){document.getElementById('keypad').hidden=true;return;}
  if(v==='<'){G.typed=G.typed.slice(0,-1);kpShow();return;}
  if(G.typed.length>=lv.code.length)return;G.typed+=v;beep(600+Number(v)*40,.05,'square');kpShow();
  if(G.typed.length===lv.code.length){
    if(G.typed===lv.code.join('')){setTimeout(()=>{document.getElementById('keypad').hidden=true;G.doorOpen=true;[523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,.12,'square'),i*90));
      toast('קליק! 🔓 הדלת נפתחה, אפשר לצאת');updateHud();},250);}
    else{const box=document.querySelector('#keypad .kp');box.classList.remove('shake');void box.offsetWidth;box.classList.add('shake');beep(180,.25,'square');
      document.getElementById('kpNote').textContent='הקוד לא נכון. בדקי את החישובים ברמזים 🔎';setTimeout(()=>{G.typed='';kpShow();},500);}}
}
/* drawing */
function drawBoulder(c,x,y,r){circle(c,x,y+r*.08,r,'#6d6875');circle(c,x,y,r,'#8d8a99');circle(c,x-r*.3,y-r*.3,r*.25,'#b5b2c2');c.strokeStyle='#5a5766';c.lineWidth=Math.max(1,r*.08);c.beginPath();c.moveTo(x+r*.1,y-r*.2);c.lineTo(x+r*.35,y+r*.15);c.stroke();}
function drawLantern(c,x,y,r){c.fillStyle='#5d4037';c.fillRect(x-r*.05,y-r*.85,r*.1,r*.2);circle(c,x,y,r*.7,'rgba(255,200,80,.25)');
  c.fillStyle='#e63946';rrect(c,x-r*.4,y-r*.6,r*.8,r*1.1,r*.3);c.fill();c.fillStyle='#ffd166';rrect(c,x-r*.22,y-r*.4,r*.44,r*.7,r*.15);c.fill();
  c.fillStyle='#5d4037';c.fillRect(x-r*.45,y-r*.66,r*.9,r*.1);c.fillRect(x-r*.45,y+r*.45,r*.9,r*.1);}
function drawShadowGhost(c,x,y,r,now){c.globalAlpha=.75;c.fillStyle='#2b2140';c.beginPath();c.moveTo(x-r*.6,y+r*.6);c.quadraticCurveTo(x-r*.7,y-r*.8,x,y-r*.8);c.quadraticCurveTo(x+r*.7,y-r*.8,x+r*.6,y+r*.6);
  for(let i=0;i<4;i++)c.lineTo(x+r*.6-r*.3*(i+1),y+r*(.6+(i%2?.0:.18)+Math.sin(now/150+i)*.05));c.closePath();c.fill();c.globalAlpha=1;
  circle(c,x-r*.22,y-r*.2,r*.12,'#ff4d6d');circle(c,x+r*.22,y-r*.2,r*.12,'#ff4d6d');}
function drawHoleGoal(c,x,y,r){circle(c,x,y,r*.75,'#3a2f4f');circle(c,x,y,r*.55,'#1d1530');c.strokeStyle='#ffd23f';c.lineWidth=Math.max(1.5,r*.1);c.setLineDash([r*.2,r*.15]);c.beginPath();c.arc(x,y,r*.8,0,7);c.stroke();c.setLineDash([]);star(c,x,y,r*.25);}
function drawRoof(c,x,y,r){c.fillStyle='#8d99ae';c.fillRect(x-r*.7,y-r*.1,r*1.4,r*.8);c.fillStyle='#e63946';c.beginPath();c.moveTo(x-r*.85,y-r*.05);c.lineTo(x,y-r*.75);c.lineTo(x+r*.85,y-r*.05);c.fill();
  c.fillStyle='#ffd23f';[[-.4,.15],[0,.15],[.4,.15],[-.4,.42],[.4,.42]].forEach(([a,b])=>c.fillRect(x+a*r-r*.1,y+b*r,r*.2,r*.16));c.fillStyle='#5d3a1a';c.fillRect(x-r*.1,y+r*.38,r*.2,r*.32);}
function drawCodeDoor(c,x,y,r,open){c.fillStyle='#5d4037';rrect(c,x-r*.55,y-r*.8,r*1.1,r*1.6,r*.12);c.fill();c.fillStyle=open?'#2a9d5c':'#8d6e63';rrect(c,x-r*.42,y-r*.66,r*.84,r*1.32,r*.08);c.fill();
  c.fillStyle='#ffd23f';c.fillRect(x+r*.12,y-r*.1,r*.22,r*.3);c.strokeStyle='#ffd23f';c.lineWidth=Math.max(1,r*.07);c.beginPath();c.arc(x+r*.23,y-r*.12,r*.09,Math.PI,0);c.stroke();}
function chDraw(s,n,W,now){
  const id=G.W.id,lv=G.lv;
  if(id==='tilt'){
    const grd=ctx.createLinearGradient(0,0,W,W);grd.addColorStop(0,'#c9ada7');grd.addColorStop(1,'#9a8c98');ctx.fillStyle=grd;ctx.fillRect(0,0,W,W);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){const X=x*s,Y=y*s;if(lv.t[y][x]){ctx.fillStyle='#4a4e69';rrect(ctx,X+s*.04,Y+s*.04,s*.92,s*.92,s*.14);ctx.fill();ctx.fillStyle='#6c6f93';rrect(ctx,X+s*.04,Y+s*.04,s*.92,s*.3,s*.14);ctx.fill();}
      else{ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=1;ctx.strokeRect(X+1,Y+1,s-2,s-2);}}
    ctx.strokeStyle='#4a4e69';ctx.lineWidth=Math.max(3,s*.12);ctx.strokeRect(0,0,W,W);
    drawTrail(s,'rgba(255,255,255,.25)');
  }else if(id==='shadow'){
    ctx.fillStyle='#e9e3f5';ctx.fillRect(0,0,W,W);ctx.fillStyle='rgba(43,33,64,.06)';for(let y=0;y<n;y++)for(let x=0;x<n;x++)if((x+y)%2)ctx.fillRect(x*s,y*s,s,s);
    // her footprints: the way the shadow will walk
    for(let i=Math.max(0,G.shIdx);i<G.trailPath.length-1;i++){const c=G.trailPath[i];ctx.globalAlpha=G.shIdx<0?.25:.45;circle(ctx,(c.x+.4)*s,(c.y+.55)*s,s*.07,'#2b2140');circle(ctx,(c.x+.6)*s,(c.y+.45)*s,s*.07,'#2b2140');ctx.globalAlpha=1;}
    drawWalls(lv.g,n,s,'#5a4b81');
    G.lightsLeft.forEach(l=>drawLantern(ctx,(l.x+.5)*s,(l.y+.5)*s+Math.sin(now/300+l.x)*s*.03,s*.4));
  }else if(id==='floors'){
    ctx.fillStyle='#bde0fe';ctx.fillRect(0,0,W,W);
    const cols=['#fff1e6','#e2ece9','#fde2e4','#dfe7fd'];
    for(let f=0;f<4;f++){const [ox,oy]=lv.O[f],X=ox*s,Y=oy*s,M=lv.m*s;
      if(f<lv.F){ctx.fillStyle=cols[f];ctx.fillRect(X,Y,M,M);ctx.fillStyle='rgba(42,33,64,.55)';ctx.font='bold '+Math.round(s*.5)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.globalAlpha=.18;ctx.font='bold '+Math.round(M*.5)+'px sans-serif';ctx.fillText(f+1,X+M/2,Y+M/2);ctx.globalAlpha=1;}
      else{ctx.fillStyle='#95d5b2';ctx.fillRect(X,Y,M,M);for(let i=0;i<6;i++){circle(ctx,X+M*(.15+.14*i),Y+M*(.3+.4*(i%2)),s*.3,'#52b788');circle(ctx,X+M*(.15+.14*i),Y+M*(.3+.4*(i%2))-s*.1,s*.15,'#ff8fab');}}}
    drawTrail(s,'rgba(255,93,143,.25)');
    drawWalls(lv.g,n,s,'#3d405b');
    Object.keys(lv.links).forEach(k=>{const [x,y]=k.split(',').map(Number),L=lv.links[k],cx=(x+.5)*s,cy=(y+.5)*s;
      ctx.fillStyle=L.up?'#06d6a0':'#ffd166';rrect(ctx,cx-s*.36,cy-s*.36,s*.72,s*.72,s*.12);ctx.fill();
      ctx.fillStyle='#2a2140';for(let i=0;i<3;i++)ctx.fillRect(cx-s*.25+i*s*.12,cy+s*.2-i*s*.15,s*.14,s*.08+i*s*.15);
      ctx.font='bold '+Math.round(s*.3)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(L.up?'▲':'▼',cx+s*.18,cy-s*.18);});
    Object.keys(lv.holes).forEach(k=>{const [x,y]=k.split(',').map(Number),cx=(x+.5)*s,cy=(y+.5)*s;ctx.fillStyle='#2a2140';ctx.beginPath();ctx.ellipse(cx,cy,s*.38,s*.28,0,0,7);ctx.fill();ctx.fillStyle='#4a3b73';ctx.beginPath();ctx.ellipse(cx,cy-s*.04,s*.26,s*.16,0,0,7);ctx.fill();});
  }else if(id==='escape'){
    ctx.fillStyle='#f4e9d8';ctx.fillRect(0,0,W,W);ctx.strokeStyle='rgba(120,80,40,.12)';ctx.lineWidth=1;ctx.beginPath();for(let i=1;i<n*2;i++){ctx.moveTo(0,i*s/2);ctx.lineTo(W,i*s/2);}ctx.stroke();
    drawTrail(s,'rgba(120,80,40,.2)');drawWalls(lv.g,n,s,'#6d4c41');
    lv.clues.forEach((c,i)=>{const cx=(c.x+.5)*s,cy=(c.y+.5)*s;if(G.found.has(i)){ctx.globalAlpha=.35;}
      ctx.fillStyle='#fff8e1';rrect(ctx,cx-s*.32,cy-s*.38,s*.64,s*.76,s*.08);ctx.fill();ctx.strokeStyle='#c9a227';ctx.lineWidth=Math.max(1,s*.05);ctx.stroke();
      ctx.font=Math.round(s*.36)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(G.found.has(i)?CLUEC[i]:'📜',cx,cy);ctx.globalAlpha=1;});
  }
}
function chDraw2(s,n,W,now){
  const id=G.W.id,lv=G.lv;
  if(id==='tilt'){const a=G.tiltA,e=a?Math.min(1,(now-a.t0)/a.dur):1;
    G.bpos.forEach((b,i)=>{let x=b[0],y=b[1];if(a&&a.from[i]){const f=a.from.slice().sort((p,q)=>Math.hypot(p[0]-b[0],p[1]-b[1])-Math.hypot(q[0]-b[0],q[1]-b[1]))[0];x=f[0]+(b[0]-f[0])*e;y=f[1]+(b[1]-f[1])*e;}
      drawBoulder(ctx,(x+.5)*s,(y+.5)*s,s*.36);});}
  if(id==='shadow'&&G.shIdx>=0){const c=G.trailPath[G.shIdx],[x,y]=glide(G.shVis||(G.shVis={}),c.x,c.y);drawShadowGhost(ctx,(x+.5)*s,(y+.5)*s,s*.4,now);}
  if(id==='shadow'&&G.lightsLeft.length){const X=lv.goal.x*s,Y=lv.goal.y*s;ctx.fillStyle='rgba(20,15,40,.45)';rrect(ctx,X+s*.08,Y+s*.08,s*.84,s*.84,s*.14);ctx.fill();ctx.font=Math.round(s*.42)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🔒',X+s/2,Y+s*.52);}
  if(id==='escape'&&G.doorOpen){ctx.font=Math.round(s*.4)+'px sans-serif';ctx.textAlign='center';ctx.fillText('🔓',(lv.goal.x+.8)*s,(lv.goal.y+.2)*s);}
}
kit(['tilt','shadow','floors','escape'],{move:chMove,tick:chTick,hud:chHud,draw:chDraw,draw2:chDraw2});
