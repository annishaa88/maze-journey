/* ================= vehicles world: playing ================= */
const VH=new Set(['firetruck','schoolbus','train','parking','lights','race']);
const KIDS=['🧒','👧','👦','🧒🏽','👧🏻','👦🏾'];
const PKC=['#e63946','#3a86ff','#2a9d8f','#ffb703','#9d4edd','#fb8500','#06d6a0','#8ecae6','#ff70a6','#adb5bd'];
function vhFresh(lv){
  return {vh:{tank:lv.cap||0,fires:(lv.fires||[]).map(f=>Object.assign({},f)),kids:0,
    dir:lv.dir0!=null?lv.dir0:1,q:null,trT:0,going:false,wait:false,hist:[],cargo:(lv.cargo||[]).map(c=>Object.assign({},c)),loaded:0,
    cars:(lv.cars||[]).map(c=>Object.assign({},c)),sel:0,moves:0,last:null,undo:[],out:null,
    cd0:performance.now(),go:false,ri:0,rT:0,boost:0,lost:false,face:1}};
}
const vhLight=(L,now)=>{const p=((now/G.cfg.period)+L.off)%1;return p<.45?0:p<.57?1:2;};   // 0 green 1 yellow 2 red
function vhAction(){
  if(!G||G.done)return;const V=G.vh;
  if(G.W.id==='parking'){V.sel=(V.sel+1)%V.cars.length;beep(700,.04,'sine');updateHud();}
}
function vhStep(nx,ny,d){G.p={x:nx,y:ny};if(d===1||d===3)G.vh.face=d===1?1:-1;enter(nx,ny);}
function vhMove(d){
  const id=G.W.id,lv=G.lv,n=lv.n,V=G.vh,x=G.p.x,y=G.p.y,nx=x+DV[d][0],ny=y+DV[d][1];
  if(id==='parking'){pkArrow(d);return;}
  if(id==='train'){
    if(!V.going){V.going=true;V.dir=lv.g[y][x][d]?V.dir:d;V.trT=0;toast('צ׳וּ צ׳וּ! 🚂 החצים בוחרים לאן לפנות בצומת הבא');updateHud();return;}
    if(V.wait){if(lv.g[y][x][d]){bumpWall(d);arcSay('אין מסילה לשם 🛤️');return;}V.dir=d;V.wait=false;V.q=null;V.trT=0;updateHud();return;}
    if(d===OPP_D[V.dir]){V.dir=d;V.q=null;beep(400,.06,'triangle');arcSay('הרכבת נוסעת אחורה 🔄');updateHud();return;}
    V.q=d===V.dir?null:d;beep(660,.04,'sine');updateHud();return;
  }
  if(id==='race'&&!V.go){bumpWall(d);arcSay('עוד רגע… 3, 2, 1 🏁');return;}
  if(id==='race'&&V.lost)return;
  if(id==='race'&&V.spin&&performance.now()<V.spin){beep(180,.05,'square');return;}
  if(lv.g[y][x][d]){bumpWall(d);return;}
  if(id==='firetruck'){
    const fi=V.fires.findIndex(f=>f.x===nx&&f.y===ny);
    if(fi>=0){if(V.tank<=0){bumpWall(d);arcSay('אין מים! 💧 מלאי בברז כיבוי או בתחנה');return;}
      V.tank--;V.fires.splice(fi,1);sparkle(nx,ny,['#4cc9f0','#ffffff','#90e0ef'],18);chime([300,500,700],80,.1,'sine');
      toast(V.fires.length?'פשש! 💦 האש כבתה. עוד '+V.fires.length+' 🔥':'כל השריפות כבו! 🚒 חוזרים לתחנה');}
    vhStep(nx,ny,d);beep(500,.03,'sine');
    const atW=(nx===lv.start.x&&ny===lv.start.y)||lv.hydrants.some(h=>h.x===nx&&h.y===ny);
    if(atW&&V.tank<lv.cap){V.tank=lv.cap;chime([880,1100],70,.08,'sine');arcSay('המיכל מלא! 💧');}
    updateHud();if(!V.fires.length&&atGoal())win();return;
  }
  if(id==='schoolbus'){
    const k=GEN.edgeKey(x,y,d),ow=lv.oneway[k];
    if(ow!==undefined&&ow!==d){bumpWall(d);arcSay('רחוב חד־סטרי! ⛔ נוסעים רק לכיוון החץ');return;}
    if(nx===lv.goal.x&&ny===lv.goal.y&&V.kids<lv.stops.length){bumpWall(d);arcSay('קודם אוספים את כל הילדים 🧒 עכשיו תחנה '+(V.kids+1));return;}
    vhStep(nx,ny,d);beep(500,.03,'sine');
    const st=lv.stops.find(s=>s.x===nx&&s.y===ny);
    if(st){if(st.i===V.kids){V.kids++;sparkle(nx,ny,['#ffd23f','#ffffff'],12);chime([784,988],70,.08,'sine');
        toast(V.kids<lv.stops.length?KIDS[st.i%KIDS.length]+' עלה לאוטובוס! עכשיו תחנה '+(V.kids+1)+' 🚏':'כולם באוטובוס! 🚌 לבית הספר 🏫');updateHud();}
      else if(st.i>V.kids)arcSay('קודם תחנה '+(V.kids+1)+' 🚏 הילדים מחכים לפי הסדר');}
    if(atGoal())win();return;
  }
  if(id==='lights'){
    const L=lv.lights.find(q=>q.x===nx&&q.y===ny);
    if(L&&vhLight(L,performance.now())===2){bumpWall(d);arcSay('🔴 אדום! עוצרים ומחכים לירוק');return;}
    vhStep(nx,ny,d);beep(500,.03,'sine');if(L)beep(880,.05,'sine');if(atGoal())win();return;
  }
  if(id==='race'){
    vhStep(nx,ny,d);beep(520+(V.boost?200:0),.03,'sine');
    const slide=()=>{const a=G.p.x,b=G.p.y;if(lv.g[b][a][d])return false;vhStep(a+DV[d][0],b+DV[d][1],d);return true;};
    if(V.boost>0){V.boost--;slide();fxAdd({k:'ring',x:G.p.x,y:G.p.y,col:'#ffd23f',life:400});}
    if(lv.turbo.some(t=>t.x===G.p.x&&t.y===G.p.y)){V.boost=4;chime([660,990,1320],50,.07,'sine');toast('⚡ טורבו! ארבע קפיצות כפולות');}
    if(lv.oil.some(o=>o.x===G.p.x&&o.y===G.p.y)){V.spin=performance.now()+900;V.spins=(V.spins||0)+1;beep(220,.2,'sawtooth');arcSay('אופס, שמן! 🛢️ המכונית מסתובבת רגע');}
    updateHud();if(atGoal()&&!V.lost){toast('ניצחת במרוץ! 🏆');win();}return;
  }
}
const OPP_D=[2,3,0,1];
function vhTick(now){
  const id=G.W.id,lv=G.lv,V=G.vh;
  if(id==='train'&&V.going&&!V.wait&&now-V.trT>G.cfg.speed){V.trT=now;
    const x=G.p.x,y=G.p.y,opts=[0,1,2,3].filter(d=>!lv.g[y][x][d]&&d!==OPP_D[V.dir]);
    if(V.q!=null&&opts.includes(V.q)){V.dir=V.q;V.q=null;}
    else if(opts.includes(V.dir)){}
    else if(opts.length===1)V.dir=opts[0];
    else if(!opts.length){V.dir=OPP_D[V.dir];arcSay('סוף המסילה 🔄 הרכבת חוזרת');}
    else{V.wait=true;beep(520,.1,'triangle');arcSay('צומת! 🛤️ לאן נוסעים? לחצי חץ');updateHud();return;}
    const nx=x+DV[V.dir][0],ny=y+DV[V.dir][1];V.hist.unshift({x,y});V.hist.length=Math.min(V.hist.length,6);vhStep(nx,ny,V.dir);beep(300,.025,'triangle');
    const ci=V.cargo.findIndex(c=>c.x===nx&&c.y===ny);
    if(ci>=0){V.cargo.splice(ci,1);V.loaded++;sparkle(nx,ny,['#bc8a5f','#ffd23f'],12);chime([700,900],70,.08,'sine');
      toast(V.cargo.length?'📦 הועמס! עוד '+V.cargo.length:'כל המטען על הרכבת! 🚉 לתחנה');}
    updateHud();
    if(atGoal()){if(!V.cargo.length){V.going=false;win();}else arcSay('התחנה מחכה למטען 📦 עוד '+V.cargo.length);}
  }
  if(id==='race'){
    if(!V.go){const t=now-V.cd0;if(t>3000){V.go=true;V.rT=now;beep(1046,.25,'square');toast('צאו! 🏁');}
      else{const k=Math.floor(t/1000);if(k!==V.cdk){V.cdk=k;beep(520,.15,'square');}}return;}
    if(V.lost||G.done)return;
    if(now-V.rT>G.cfg.speed){V.rT=now;if(V.ri<lv.rival.length-1)V.ri++;
      if(V.ri>=lv.rival.length-1){V.lost=true;beep(200,.3,'triangle');toast('המכונית הירוקה הגיעה ראשונה! 🏁 עוד מרוץ?');updateHud();
        const g0=G;setTimeout(()=>{if(G===g0&&!G.done)document.getElementById('retry').click();},2200);}}
  }
  if(id==='lights'){const ph=lv.lights.map(L=>vhLight(L,now)).join('');if(ph!==V.lph){V.lph=ph;}}
}
function vhHud(add){
  const id=G.W.id,lv=G.lv,V=G.vh;
  if(id==='firetruck'){add('🔥 '+V.fires.length);const s=add('💧 '+'●'.repeat(V.tank)+'○'.repeat(Math.max(0,lv.cap-V.tank)));if(!V.tank){s.style.background='#ffd6d6';s.style.color='#2a2140';}}
  if(id==='schoolbus')add('🧒 '+V.kids+'/'+lv.stops.length+(V.kids<lv.stops.length?' · 🚏 '+(V.kids+1):' · 🏫'));
  if(id==='train'){add('📦 '+V.loaded+'/'+lv.cargo.length);
    // one status chip that is always there, so the top row never jumps
    const st=add(!V.going?'חץ = יציאה 🚂':V.wait?'🛤️ לאן?':V.q!=null?'בפנייה הבאה '+ARW[V.q]:'🚂 נוסעים');st.style.minWidth='8.5em';}
  if(id==='parking')add('🚗 מהלכים: '+V.moves+' · אפשר ב־'+lv.best);
  if(id==='lights')add('🚦 עוברים בירוק');
  if(id==='race'){add(V.go?(V.lost?'😮 הפסד':'🏁 מרוץ!'):'⏳ מוכנים…').style.minWidth='6em';const b=add('⚡ '+(V.boost||0));if(!V.boost)b.style.opacity='.45';}
}
/* ---------- the parking puzzle: tap or drag a car, or choose with 🔄 and slide with the arrows ---------- */
function pkFree(cars,i,v){const c=cars[i],g=pkGridR(cars);for(let k=0;k<c.len;k++){const X=c.h?v+k:c.x,Y=c.h?c.y:v+k;if(X<0||Y<0||X>=6||Y>=6)return false;const o=g[Y][X];if(o>=0&&o!==i)return false;}return true;}
function pkGridR(cars){const g=Array.from({length:6},()=>Array(6).fill(-1));cars.forEach((c,i)=>{for(let k=0;k<c.len;k++){if(c.h)g[c.y][c.x+k]=i;else g[c.y+k][c.x]=i;}});return g;}
function pkTry(i,dv,quiet){
  const V=G.vh,c=V.cars[i],v=(c.h?c.x:c.y)+dv;if(!pkFree(V.cars,i,v)){if(!quiet){beep(160,.08,'square');}return false;}
  V.undo.push(V.cars.map(q=>Object.assign({},q)));if(V.undo.length>80)V.undo.shift();
  if(c.h)c.x=v;else c.y=v;const key=i+':'+Math.sign(dv);if(V.last!==key){V.moves++;V.last=key;}V.hint=null;beep(440+i*30,.03,'sine');
  if(i===0&&c.x+c.len===6){V.out={t0:performance.now()};const opt=G.lv.best;G.got=V.moves<=opt+1?3:V.moves<=Math.round(opt*1.6)+2?2:1;G.stars=new Set();
    chime([523,659,784,1047],90,.1,'sine');toast('יצאת מהחניון! 🚗💨');updateHud();const g0=G;setTimeout(()=>{if(G===g0&&!G.done)win();},900);}
  else updateHud();return true;
}
function pkArrow(d){
  const V=G.vh,c=V.cars[V.sel];if(V.out)return;
  if(c.h&&(d===0||d===2)||!c.h&&(d===1||d===3)){beep(160,.08,'square');arcSay('המכונית הזאת נוסעת רק '+(c.h?'ימינה ושמאלה ↔️':'למעלה ולמטה ↕️')+'. 🔄 בוחר מכונית אחרת');return;}
  V.last=V.last&&V.last.startsWith(V.sel+':')?V.last:null;pkTry(V.sel,d===1||d===2?1:-1);
}
let pkDrag=null;
function vhPointer(type,e){
  const V=G.vh,r=cv.getBoundingClientRect(),cs=r.width/6,fx=(e.clientX-r.left)/cs,fy=(e.clientY-r.top)/cs;if(V.out)return;
  if(type==='down'){const g=pkGridR(V.cars),x=Math.floor(fx),y=Math.floor(fy);const i=x>=0&&y>=0&&x<6&&y<6?g[y][x]:-1;
    if(i<0){pkDrag=null;return;}V.sel=i;V.last=null;pkDrag={i,fx,fy,done:0};beep(700,.03,'sine');updateHud();return;}
  if(!pkDrag)return;
  if(type==='move'){const c=V.cars[pkDrag.i],want=Math.round(c.h?fx-pkDrag.fx:fy-pkDrag.fy);
    while(pkDrag.done<want&&pkTry(pkDrag.i,1,true))pkDrag.done++;while(pkDrag.done>want&&pkTry(pkDrag.i,-1,true))pkDrag.done--;return;}
  if(type==='up'){pkDrag=null;V.last=null;}
}
function vhUndo(){if(!G||G.W.id!=='parking'||G.done)return false;const V=G.vh,u=V.undo.pop();if(!u||V.out)return true;V.cars=u;V.moves=Math.max(0,V.moves-1);V.last=null;beep(500,.06,'sine');updateHud();return true;}
function vhHint(){if(!G||G.W.id!=='parking'||G.done)return false;const V=G.vh,p=GEN.pkSolve(V.cars,60000);
  if(!p||!p.length){toast('מכאן קשה למצוא דרך 🤔 נסי ↩');return true;}const [i,v]=p[0],c=V.cars[i];V.sel=i;V.hint={i,dv:Math.sign(v-(c.h?c.x:c.y)),until:performance.now()+2200};
  toast('נסי להזיז את המכונית המהבהבת '+(c.h?(v>c.x?'➡️':'⬅️'):(v>c.y?'⬇️':'⬆️')));updateHud();return true;}
/* ---------- drawing ---------- */
function vhBody(cx,cy,s,kind,face,now){
  ctx.save();ctx.translate(cx,cy);ctx.scale(face<0?-1:1,1);
  const w=s*.92,h=s*.42,y0=s*.06;
  const col={firetruck:'#e63946',schoolbus:'#ffb703',lights:'#3a86ff',race:'#ff5d8f'}[kind]||'#e63946';
  ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(0,y0+h*.95,w*.5,s*.07,0,0,7);ctx.fill();
  ctx.fillStyle=col;rrect(ctx,-w/2,y0,w,h,s*.12);ctx.fill();
  if(kind==='firetruck'){ctx.fillStyle='#ffffff';ctx.fillRect(-w*.45,y0-s*.08,w*.7,s*.06);for(let i=0;i<5;i++)ctx.fillRect(-w*.42+i*w*.14,y0-s*.1,s*.03,s*.1);
    ctx.fillStyle=Math.floor(now/250)%2?'#4cc9f0':'#ff595e';rrect(ctx,w*.18,y0-s*.12,s*.14,s*.1,s*.03);ctx.fill();}
  if(kind==='schoolbus'){ctx.fillStyle='#bde0fe';for(let i=0;i<3;i++){rrect(ctx,-w*.42+i*w*.26,y0+h*.12,w*.2,h*.36,s*.04);ctx.fill();}ctx.fillStyle='#2a2140';ctx.fillRect(-w/2,y0+h*.62,w,s*.035);}
  if(kind==='race'){ctx.fillStyle='#ffffff';ctx.fillRect(-w*.05,y0,w*.1,h);ctx.fillStyle='#2a2140';ctx.fillRect(-w*.52,y0+h*.15,s*.06,h*.6);}
  if(kind==='lights'){ctx.fillStyle='#bde0fe';rrect(ctx,w*.1,y0+h*.12,w*.3,h*.38,s*.05);ctx.fill();}
  ctx.fillStyle='#ffd23f';circle(ctx,w*.47,y0+h*.55,s*.05,'#ffd23f');
  [-w*.3,w*.3].forEach(wx=>{circle(ctx,wx,y0+h,s*.11,'#2a2140');circle(ctx,wx,y0+h,s*.05,'#adb5bd');});
  ctx.restore();
}
function vhLoco(cx,cy,s,dir,now,wag){
  ctx.save();ctx.translate(cx,cy);ctx.rotate([-Math.PI/2,0,Math.PI/2,Math.PI][dir]);
  ctx.fillStyle='#1d3557';rrect(ctx,-s*.4,-s*.28,s*.8,s*.56,s*.12);ctx.fill();ctx.fillStyle='#e63946';ctx.fillRect(s*.18,-s*.3,s*.2,s*.6);
  ctx.fillStyle='#2a2140';ctx.fillRect(s*.28,-s*.08,s*.18,s*.16);ctx.restore();
  if(!calmFx()){const t=(now/600)%1;ctx.globalAlpha=.5*(1-t);circle(ctx,cx-DV[dir][0]*s*.1,cy-s*.35-t*s*.4,s*(.08+t*.12),'#ffffff');ctx.globalAlpha=1;}
}
function vhRails(s,n,lv){
  for(let y=0;y<n;y++)for(let x=0;x<n;x++)[1,2].forEach(d=>{if(lv.g[y][x][d])return;const ax=(x+.5)*s,ay=(y+.5)*s,bx=ax+DV[d][0]*s,by=ay+DV[d][1]*s,ox=DV[d][1]*s*.16,oy=DV[d][0]*s*.16;
    ctx.strokeStyle='#8d6e63';ctx.lineWidth=Math.max(2,s*.09);for(let i=1;i<4;i++){const t=i/4,px=ax+(bx-ax)*t,py=ay+(by-ay)*t;ctx.beginPath();ctx.moveTo(px-ox*1.6,py-oy*1.6);ctx.lineTo(px+ox*1.6,py+oy*1.6);ctx.stroke();}
    ctx.strokeStyle='#6c757d';ctx.lineWidth=Math.max(1.5,s*.05);ctx.beginPath();ctx.moveTo(ax-ox,ay-oy);ctx.lineTo(bx-ox,by-oy);ctx.moveTo(ax+ox,ay+oy);ctx.lineTo(bx+ox,by+oy);ctx.stroke();});
}
function vhCity(s,n,W,lv,floor,wall){
  ctx.fillStyle=floor;ctx.fillRect(0,0,W,W);
  ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=Math.max(1,s*.04);ctx.setLineDash([s*.14,s*.14]);ctx.beginPath();
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){if(!lv.g[y][x][1]){ctx.moveTo((x+.5)*s,(y+.5)*s);ctx.lineTo((x+1.5)*s,(y+.5)*s);}if(!lv.g[y][x][2]){ctx.moveTo((x+.5)*s,(y+.5)*s);ctx.lineTo((x+.5)*s,(y+1.5)*s);}}
  ctx.stroke();ctx.setLineDash([]);drawTrail(s,'rgba(255,255,255,.25)');drawWalls(lv.g,n,s,wall);
}
function vhDraw(s,n,W,now){
  const id=G.W.id,lv=G.lv,V=G.vh;ctx.textAlign='center';ctx.textBaseline='middle';
  if(id==='firetruck'){vhCity(s,n,W,lv,'#adb5bd','#495057');
    lv.hydrants.forEach(h=>{const cx=(h.x+.5)*s,cy=(h.y+.5)*s;ctx.fillStyle='#d62828';rrect(ctx,cx-s*.12,cy-s*.22,s*.24,s*.42,s*.06);ctx.fill();ctx.fillRect(cx-s*.2,cy-s*.06,s*.4,s*.1);circle(ctx,cx,cy-s*.24,s*.1,'#d62828');
      if(V.tank<lv.cap){ctx.globalAlpha=.5+.3*Math.sin(now/250);circle(ctx,cx,cy,s*.42,'rgba(76,201,240,.35)');ctx.globalAlpha=1;}});
    V.fires.forEach(f=>{const cx=(f.x+.5)*s,cy=(f.y+.5)*s,fl=1+.12*Math.sin(now/90+f.x*3);ctx.globalAlpha=.35;circle(ctx,cx,cy,s*.46,'#ffb703');ctx.globalAlpha=1;
      ctx.font=Math.round(s*.62*fl)+'px sans-serif';ctx.fillStyle='#000';ctx.fillText('🔥',cx,cy-s*.04);});}
  else if(id==='schoolbus'){vhCity(s,n,W,lv,'#9aa5b1','#3d405b');
    Object.keys(lv.oneway).forEach(k=>{const [a,b,o]=k.split(','),x=+a,y=+b,d=lv.oneway[k],X=o==='h'?(x+1)*s:(x+.5)*s,Y=o==='h'?(y+.5)*s:(y+1)*s;
      circle(ctx,X,Y,s*.2,'#1d4ed8');ctx.strokeStyle='#ffffff';ctx.lineWidth=Math.max(1.5,s*.06);ctx.save();ctx.translate(X,Y);ctx.rotate([-Math.PI/2,0,Math.PI/2,Math.PI][d]);
      ctx.beginPath();ctx.moveTo(-s*.1,0);ctx.lineTo(s*.1,0);ctx.moveTo(s*.03,-s*.07);ctx.lineTo(s*.11,0);ctx.lineTo(s*.03,s*.07);ctx.stroke();ctx.restore();});
    lv.stops.forEach(st=>{if(st.i<V.kids)return;const cx=(st.x+.5)*s,cy=(st.y+.5)*s,next=st.i===V.kids;
      ctx.fillStyle='#6c757d';ctx.fillRect(cx+s*.22,cy-s*.32,s*.05,s*.6);circle(ctx,cx+s*.245,cy-s*.32,s*.12,next?'#ffb703':'#adb5bd');
      ctx.fillStyle='#2a2140';ctx.font='bold '+Math.round(s*.17)+'px sans-serif';ctx.fillText(st.i+1,cx+s*.245,cy-s*.31);
      glyph(KIDS[st.i%KIDS.length],cx-s*.08,cy+s*.06+(next?Math.sin(now/200)*s*.04:0),s*.46);});}
  else if(id==='train'){
    ctx.fillStyle='#b7e4c7';ctx.fillRect(0,0,W,W);for(let y=0;y<n;y++)for(let x=0;x<n;x++)if((x*7+y*3)%5===0){ctx.fillStyle='#95d5b2';ctx.fillRect(x*s+s*.1,y*s+s*.7,s*.12,s*.06);}
    vhRails(s,n,lv);
    V.cargo.forEach(c=>{const cx=(c.x+.5)*s,cy=(c.y+.5)*s;ctx.font=Math.round(s*.46)+'px sans-serif';ctx.fillStyle='#000';ctx.fillText('📦',cx,cy+Math.sin(now/300+c.x)*s*.03);});
    if(V.wait){const x=G.p.x,y=G.p.y;[0,1,2,3].forEach(d=>{if(lv.g[y][x][d]||d===OPP_D[V.dir])return;ctx.globalAlpha=.55+.4*Math.sin(now/150);glyph(ARW[d],(x+.5+DV[d][0]*.75)*s,(y+.5+DV[d][1]*.75)*s,s*.42);ctx.globalAlpha=1;});}
    // the wagons follow the engine; the loaded ones carry a crate
    const wn=Math.max(1,lv.cargo.length),e=1-Math.min(1,Math.hypot(G.vis.x-G.p.x,G.vis.y-G.p.y));
    // each wagon rolls from its old cell to its new one together with the engine, instead of hopping
    for(let i=Math.min(wn,V.hist.length)-1;i>=0;i--){const h=V.hist[i],o=V.hist[i+1]||h,hx=h.x+(o.x-h.x)*(1-e),hy=h.y+(o.y-h.y)*(1-e),cx=(hx+.5)*s,cy=(hy+.5)*s;ctx.fillStyle='#8d5524';rrect(ctx,cx-s*.32,cy-s*.22,s*.64,s*.44,s*.08);ctx.fill();
      circle(ctx,cx-s*.2,cy+s*.24,s*.07,'#2a2140');circle(ctx,cx+s*.2,cy+s*.24,s*.07,'#2a2140');if(i<V.loaded){glyph('📦',cx,cy,s*.32);}}
    vhLoco((G.vis.x+.5)*s,(G.vis.y+.5)*s,s,V.dir,now);}
  else if(id==='parking'){
    ctx.fillStyle='#495057';ctx.fillRect(0,0,W,W);ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=Math.max(1,s*.03);
    for(let i=1;i<6;i++){ctx.beginPath();ctx.moveTo(i*s,0);ctx.lineTo(i*s,W);ctx.moveTo(0,i*s);ctx.lineTo(W,i*s);ctx.stroke();}
    // the way out
    ctx.fillStyle='#52b788';ctx.fillRect(W-s*.08,PK_ROWV*s+s*.08,s*.08,s*.84);ctx.fillStyle='#ffffff';ctx.font='bold '+Math.round(s*.22)+'px sans-serif';
    ctx.save();ctx.translate(W-s*.28,PK_ROWV*s+s*.5);ctx.globalAlpha=.6+.3*Math.sin(now/250);ctx.fillText('➡',0,0);ctx.restore();ctx.globalAlpha=1;
    // cars slide to their new place instead of jumping there
    const k=Math.min(1,(G.dt||16)/70);
    V.cars.forEach((c,i)=>{if(c.vx==null||calmFx()){c.vx=c.x;c.vy=c.y;}c.vx+=(c.x-c.vx)*k;c.vy+=(c.y-c.vy)*k;if(Math.abs(c.x-c.vx)<.01)c.vx=c.x;if(Math.abs(c.y-c.vy)<.01)c.vy=c.y;
      let X=c.vx*s,Y=c.vy*s;if(i===0&&V.out)X+=Math.min(1,(now-V.out.t0)/800)*s*3;const w=(c.h?c.len:1)*s,h=(c.h?1:c.len)*s,m=s*.08;
      const hl=V.hint&&V.hint.i===i&&now<V.hint.until&&Math.floor(now/180)%2;
      if(i===V.sel){ctx.fillStyle='rgba(255,255,255,.5)';rrect(ctx,X+m*.3,Y+m*.3,w-m*.6,h-m*.6,s*.2);ctx.fill();}
      ctx.fillStyle=hl?'#ffffff':PKC[c.c];rrect(ctx,X+m,Y+m,w-2*m,h-2*m,s*.18);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.55)';if(c.h){rrect(ctx,X+w*.55,Y+h*.22,w*.18,h*.56,s*.06);ctx.fill();}else{rrect(ctx,X+w*.22,Y+h*.55,w*.56,h*.18,s*.06);ctx.fill();}
      ctx.fillStyle='rgba(0,0,0,.25)';if(c.h){ctx.fillRect(X+m*2,Y+m,s*.12,s*.1);ctx.fillRect(X+m*2,Y+h-m-s*.1,s*.12,s*.1);ctx.fillRect(X+w-m*2-s*.12,Y+m,s*.12,s*.1);ctx.fillRect(X+w-m*2-s*.12,Y+h-m-s*.1,s*.12,s*.1);}
      else{ctx.fillRect(X+m,Y+m*2,s*.1,s*.12);ctx.fillRect(X+w-m-s*.1,Y+m*2,s*.1,s*.12);ctx.fillRect(X+m,Y+h-m*2-s*.12,s*.1,s*.12);ctx.fillRect(X+w-m-s*.1,Y+h-m*2-s*.12,s*.1,s*.12);}
      if(i===0)drawChar(ctx,curChar(),X+w*.3,Y+h*.5,s*.3);});}
  else if(id==='lights'){vhCity(s,n,W,lv,'#adb5bd','#6c584c');
    lv.lights.forEach(L=>{const ph=vhLight(L,now),cx=(L.x+.5)*s,cy=(L.y+.5)*s;
      ctx.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<4;i++)ctx.fillRect(L.x*s+s*.12+i*s*.2,cy-s*.32,s*.1,s*.64);
      ctx.globalAlpha=.28;ctx.fillStyle=['#52b788','#ffb703','#e63946'][ph];ctx.fillRect(L.x*s,L.y*s,s,s);ctx.globalAlpha=1;
      ctx.fillStyle='#2a2140';rrect(ctx,cx+s*.2,cy-s*.42,s*.2,s*.5,s*.05);ctx.fill();
      [['#e63946',2],['#ffb703',1],['#52b788',0]].forEach(([col,p],j)=>{circle(ctx,cx+s*.3,cy-s*.33+j*s*.16,s*.055,ph===p?col:'#495057');});});}
  else if(id==='race'){
    ctx.fillStyle='#74c69d';ctx.fillRect(0,0,W,W);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){ctx.fillStyle='#495057';ctx.fillRect(x*s+s*.08,y*s+s*.08,s*.84,s*.84);}
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)[1,2].forEach(d=>{if(lv.g[y][x][d])return;ctx.fillStyle='#495057';if(d===1)ctx.fillRect(x*s+s*.5,y*s+s*.08,s,s*.84);else ctx.fillRect(x*s+s*.08,y*s+s*.5,s*.84,s);});
    drawTrail(s,'rgba(255,255,255,.18)');drawWalls(lv.g,n,s,'#e63946');
    lv.oil.forEach(o=>{const cx=(o.x+.5)*s,cy=(o.y+.5)*s;ctx.fillStyle='#1b1b1b';ctx.beginPath();ctx.ellipse(cx,cy+s*.1,s*.3,s*.16,0,0,7);ctx.fill();ctx.fillStyle='rgba(157,78,221,.5)';ctx.beginPath();ctx.ellipse(cx-s*.08,cy+s*.07,s*.1,s*.04,0,0,7);ctx.fill();});
    lv.turbo.forEach(t=>{const cx=(t.x+.5)*s,cy=(t.y+.5)*s;ctx.fillStyle='#ffd23f';ctx.globalAlpha=.7+.3*Math.sin(now/120);for(let i=0;i<2;i++){ctx.beginPath();ctx.moveTo(cx-s*.25+i*s*.2,cy-s*.2);ctx.lineTo(cx-s*.05+i*s*.2,cy);ctx.lineTo(cx-s*.25+i*s*.2,cy+s*.2);ctx.lineTo(cx-s*.15+i*s*.2,cy);ctx.fill();}ctx.globalAlpha=1;});
    const [rx,ry]=lv.rival[V.ri],rv=V.rvis||(V.rvis={x:rx,y:ry});rv.x+=(rx-rv.x)*.25;rv.y+=(ry-rv.y)*.25;
    ctx.save();ctx.translate((rv.x+.5)*s,(rv.y+.5)*s);ctx.fillStyle='#2a9d8f';rrect(ctx,-s*.4,-s*.08,s*.8,s*.36,s*.1);ctx.fill();ctx.fillStyle='#ffffff';ctx.fillRect(-s*.04,-s*.08,s*.08,s*.36);
    circle(ctx,-s*.25,s*.3,s*.1,'#2a2140');circle(ctx,s*.25,s*.3,s*.1,'#2a2140');glyph('🐢',0,-s*.2,s*.3);ctx.restore();}
  if(id!=='train'&&id!=='parking'){const sp=id==='race'&&V.spin&&now<V.spin;if(sp){ctx.save();ctx.translate((G.vis.x+.5)*s,(G.vis.y+.5)*s);ctx.rotate(((V.spin-now)/900)*Math.PI*2);ctx.translate(-(G.vis.x+.5)*s,-(G.vis.y+.5)*s);}
    vhBody((G.vis.x+.5)*s,(G.vis.y+.5)*s,s,id,V.face,now);if(sp)ctx.restore();}
}
const PK_ROWV=2;
function vhDraw2(s,n,W,now){
  const id=G.W.id,V=G.vh;ctx.textAlign='center';ctx.textBaseline='middle';
  if(id==='race'&&!V.go){const t=now-V.cd0,k=3-Math.floor(t/1000);ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(0,0,W,W);ctx.font='bold '+Math.round(W*.28)+'px sans-serif';ctx.fillStyle='#ffffff';ctx.fillText(k>0?String(k):'🏁',W/2,W/2);}
  if(id==='race'&&V.boost){ctx.globalAlpha=.4+.3*Math.sin(now/80);circle(ctx,(G.vis.x+.5)*s,(G.vis.y+.5)*s,s*.55,'#ffd23f');ctx.globalAlpha=1;}
  if(id==='train'&&V.q!=null&&!V.wait){ctx.font=Math.round(s*.38)+'px sans-serif';ctx.globalAlpha=.85;ctx.fillText(ARW[V.q],(G.vis.x+.5)*s,(G.vis.y-.25)*s);ctx.globalAlpha=1;}
  if(id==='schoolbus'&&V.kids<G.lv.stops.length){/* the school stays closed until everyone is on board */nwLock(s);}
  if(id==='firetruck'&&V.fires.length){/* the station waits for the fires */}
}
/* ---------- goals and new friends ---------- */
function drawFireStation(c,x,y,r){c.fillStyle='#d62828';c.fillRect(x-r*.7,y-r*.3,r*1.4,r*.95);c.fillStyle='#9d0208';c.beginPath();c.moveTo(x-r*.85,y-r*.3);c.lineTo(x,y-r*.85);c.lineTo(x+r*.85,y-r*.3);c.fill();
  c.fillStyle='#f8f9fa';c.fillRect(x-r*.45,y+r*.05,r*.9,r*.6);c.strokeStyle='#adb5bd';c.lineWidth=Math.max(1,r*.05);for(let i=1;i<4;i++){c.beginPath();c.moveTo(x-r*.45,y+r*.05+i*r*.15);c.lineTo(x+r*.45,y+r*.05+i*r*.15);c.stroke();}
  circle(c,x,y-r*.45,r*.14,'#ffd23f');}
function drawSchool(c,x,y,r){c.fillStyle='#e76f51';c.fillRect(x-r*.75,y-r*.2,r*1.5,r*.85);c.fillStyle='#9c6644';c.beginPath();c.moveTo(x-r*.85,y-r*.2);c.lineTo(x,y-r*.75);c.lineTo(x+r*.85,y-r*.2);c.fill();
  c.fillStyle='#ffd23f';circle(c,x,y-r*.42,r*.13,'#ffd23f');c.fillStyle='#bde0fe';[-.5,.3].forEach(dx=>c.fillRect(x+dx*r,y,r*.22,r*.22));c.fillStyle='#6f4518';c.fillRect(x-r*.12,y+r*.25,r*.24,r*.4);}
function drawTrainStation(c,x,y,r){c.fillStyle='#8d99ae';c.fillRect(x-r*.8,y+r*.1,r*1.6,r*.5);c.fillStyle='#2b2d42';c.fillRect(x-r*.85,y-r*.15,r*1.7,r*.25);c.fillStyle='#edf2f4';c.fillRect(x-r*.65,y+r*.2,r*.3,r*.3);c.fillRect(x+r*.35,y+r*.2,r*.3,r*.3);
  circle(c,x,y-r*.45,r*.28,'#ffffff');c.strokeStyle='#2b2d42';c.lineWidth=Math.max(1,r*.06);c.beginPath();c.arc(x,y-r*.45,r*.28,0,7);c.moveTo(x,y-r*.45);c.lineTo(x,y-r*.62);c.moveTo(x,y-r*.45);c.lineTo(x+r*.12,y-r*.45);c.stroke();}
function drawParkingSign(c,x,y,r){c.fillStyle='#6c757d';c.fillRect(x-r*.05,y,r*.1,r*.75);c.fillStyle='#1d4ed8';rrect(c,x-r*.5,y-r*.75,r,r*.85,r*.15);c.fill();c.fillStyle='#ffffff';c.font='bold '+Math.round(r*.7)+'px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('P',x,y-r*.32);}
function drawPlayground(c,x,y,r){c.strokeStyle='#e63946';c.lineWidth=Math.max(2,r*.1);c.beginPath();c.moveTo(x-r*.7,y+r*.6);c.lineTo(x-r*.4,y-r*.6);c.lineTo(x+r*.1,y+r*.6);c.stroke();
  c.strokeStyle='#ffb703';c.beginPath();c.moveTo(x-r*.4,y-r*.6);c.quadraticCurveTo(x+r*.5,y-r*.4,x+r*.75,y+r*.6);c.stroke();circle(c,x-r*.4,y-r*.6,r*.1,'#3a86ff');}
function drawFinishFlag(c,x,y,r){c.fillStyle='#6c757d';c.fillRect(x-r*.55,y-r*.75,r*.08,r*1.5);const q=r*.22;for(let i=0;i<4;i++)for(let j=0;j<3;j++){c.fillStyle=(i+j)%2?'#2a2140':'#ffffff';c.fillRect(x-r*.47+i*q,y-r*.75+j*q,q,q);}
  c.strokeStyle='#2a2140';c.lineWidth=Math.max(1,r*.04);c.strokeRect(x-r*.47,y-r*.75,q*4,q*3);}
function drawFirePup(c,x,y,r){circle(c,x,y,r*.55,'#ffffff');c.fillStyle='#2a2140';[[-.25,-.05,.09],[.28,.2,.07],[.05,.32,.06]].forEach(([a,b,k])=>circle(c,x+a*r,y+b*r,k*r,'#2a2140'));
  c.fillStyle='#2a2140';c.beginPath();c.ellipse(x-r*.5,y,r*.15,r*.3,.3,0,7);c.ellipse(x+r*.5,y,r*.15,r*.3,-.3,0,7);c.fill();
  c.fillStyle='#d62828';c.beginPath();c.ellipse(x,y-r*.42,r*.5,r*.22,0,Math.PI,0);c.fill();c.fillRect(x-r*.62,y-r*.44,r*1.24,r*.08);circle(c,x,y-r*.55,r*.09,'#ffd23f');
  eyes(c,x,y-r*.02,r,.2,.08);circle(c,x,y+r*.18,r*.08,'#2a2140');}
function drawParrot(c,x,y,r){circle(c,x,y,r*.55,'#2ec4b6');c.fillStyle='#ffb703';c.beginPath();c.moveTo(x-r*.08,y+r*.05);c.lineTo(x+r*.08,y+r*.05);c.lineTo(x,y+r*.3);c.fill();
  c.fillStyle='#e63946';c.beginPath();c.moveTo(x-r*.15,y-r*.5);c.lineTo(x,y-r*.85);c.lineTo(x+r*.12,y-r*.5);c.fill();circle(c,x-r*.25,y-r*.12,r*.17,'#ffffff');circle(c,x+r*.25,y-r*.12,r*.17,'#ffffff');eyes(c,x,y-r*.12,r,.25,.08);}
function drawWalrus(c,x,y,r){circle(c,x,y,r*.58,'#b08968');circle(c,x-r*.15,y+r*.12,r*.18,'#ddb892');circle(c,x+r*.15,y+r*.12,r*.18,'#ddb892');
  c.fillStyle='#ffffff';c.fillRect(x-r*.17,y+r*.22,r*.07,r*.32);c.fillRect(x+r*.1,y+r*.22,r*.07,r*.32);circle(c,x,y+r*.05,r*.07,'#2a2140');eyes(c,x,y-r*.18,r,.22,.08);
  c.fillStyle='#1d3557';c.fillRect(x-r*.42,y-r*.62,r*.84,r*.18);c.fillRect(x-r*.3,y-r*.78,r*.6,r*.18);}
function drawCrab(c,x,y,r){c.fillStyle='#ef476f';c.beginPath();c.ellipse(x,y+r*.08,r*.55,r*.4,0,0,7);c.fill();
  [[-1],[1]].forEach(([k])=>{circle(c,x+k*r*.6,y-r*.3,r*.16,'#ef476f');c.strokeStyle='#ef476f';c.lineWidth=Math.max(2,r*.1);c.beginPath();c.moveTo(x+k*r*.45,y-r*.05);c.lineTo(x+k*r*.58,y-r*.2);c.stroke();});
  c.strokeStyle='#ef476f';c.lineWidth=Math.max(1.5,r*.06);c.beginPath();c.moveTo(x-r*.15,y-r*.25);c.lineTo(x-r*.18,y-r*.48);c.moveTo(x+r*.15,y-r*.25);c.lineTo(x+r*.18,y-r*.48);c.stroke();
  circle(c,x-r*.18,y-r*.5,r*.1,'#ffffff');circle(c,x+r*.18,y-r*.5,r*.1,'#ffffff');circle(c,x-r*.18,y-r*.5,r*.05,'#2a2140');circle(c,x+r*.18,y-r*.5,r*.05,'#2a2140');}
function drawCone(c,x,y,r){c.fillStyle='#fb8500';c.beginPath();c.moveTo(x,y-r*.75);c.lineTo(x+r*.45,y+r*.45);c.lineTo(x-r*.45,y+r*.45);c.fill();c.fillStyle='#ffffff';c.beginPath();c.moveTo(x-r*.24,y-r*.15);c.lineTo(x+r*.24,y-r*.15);c.lineTo(x+r*.31,y+r*.05);c.lineTo(x-r*.31,y+r*.05);c.fill();
  c.fillStyle='#fb8500';c.fillRect(x-r*.6,y+r*.45,r*1.2,r*.15);eyes(c,x,y+r*.22,r,.15,.07);circle(c,x-r*.25,y+r*.32,r*.05,'#ffafcc');circle(c,x+r*.25,y+r*.32,r*.05,'#ffafcc');}
function drawPug(c,x,y,r){circle(c,x,y,r*.55,'#e9c46a');c.fillStyle='#6f4518';c.beginPath();c.ellipse(x-r*.45,y-r*.25,r*.16,r*.24,-.6,0,7);c.ellipse(x+r*.45,y-r*.25,r*.16,r*.24,.6,0,7);c.fill();
  c.fillStyle='#6f4518';c.beginPath();c.ellipse(x,y+r*.18,r*.28,r*.2,0,0,7);c.fill();circle(c,x,y+r*.1,r*.06,'#2a2140');
  c.fillStyle='rgba(76,201,240,.55)';c.strokeStyle='#2a2140';c.lineWidth=Math.max(1,r*.05);[-.22,.22].forEach(k=>{c.beginPath();c.arc(x+k*r,y-r*.1,r*.15,0,7);c.fill();c.stroke();});eyes(c,x,y-r*.1,r,.22,.06);
  c.fillStyle='#2a2140';c.fillRect(x-r*.07,y-r*.12,r*.14,r*.04);}
kit(VH,ftWrap({move:vhMove,tick:vhTick,hud:vhHud,draw:vhDraw,draw2:vhDraw2,action:vhAction}));
kit(['parking'],{hint:vhHint,undo:vhUndo,pointer:vhPointer});
