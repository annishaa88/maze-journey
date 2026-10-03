/* ================= story land: playing ================= */
const ST=new Set(['hansel','pigs','beanstalk','thorns']);
function stFresh(lv){
  return {crumbs:[{x:lv.start.x,y:lv.start.y}],hgBack:false,hgSeen:new Set(),birds:[],
    carry:0,built:0,bricksLeft:(lv.bricks||[]).map(b=>Object.assign({},b)),wolfUsed:0,
    noise:0,hasEgg:false,creakSet:new Set(lv.creak||[]),snoreT:0,
    cuts:{},lastSafe:{x:lv.start.x,y:lv.start.y},prevP:{x:lv.start.x,y:lv.start.y}};
}
function thornAt(x,y){const lv=G.lv;return lv.t[y][x]===1&&!(G.cuts[x+','+y]);}
function stMove(d){
  const id=G.W.id,lv=G.lv,n=lv.n,x=G.p.x,y=G.p.y,nx=x+DV[d][0],ny=y+DV[d][1];
  if(id==='hansel'){
    if(lv.g[y][x][d]){bumpWall(d);return;}
    G.p={x:nx,y:ny};enter(nx,ny);
    G.crumbs.push({x:nx,y:ny});if(G.crumbs.length>G.cfg.keep){const c=G.crumbs.shift();G.birds.push({x:c.x,y:c.y,t0:performance.now()});}
    beep(520,.03,'sine');
    if(!G.hgBack&&nx===lv.goal.x&&ny===lv.goal.y){G.hgBack=true;G.hgSeen=new Set();chime([784,988,1175],80,.1,'sine');sparkle(nx,ny,['#ff8fab','#ffd23f','#ffffff'],16);
      toast('בית הממתקים! 🍭 עכשיו הביתה. הציפורים אכלו חלק מהפירורים, אז תיזכרי בדרך!');updateHud();}
    if(G.hgBack&&nx===lv.start.x&&ny===lv.start.y){win();}
    return;
  }
  if(id==='pigs'){
    if(lv.g[y][x][d]){bumpWall(d);return;}
    G.p={x:nx,y:ny};G.wolfUsed++;enter(nx,ny);beep(520,.03,'sine');
    const bi=G.bricksLeft.findIndex(b=>b.x===nx&&b.y===ny);
    if(bi>=0){if(G.carry<G.cfg.carry){G.bricksLeft.splice(bi,1);G.carry++;beep(300,.1,'square');toast(G.carry<G.cfg.carry?'לבנה! 🧱 אפשר לקחת עוד '+(G.cfg.carry-G.carry):'הידיים מלאות 🧱 לבית!');}
      else arcSay('הידיים מלאות 🧱 קודם לבית');}
    if(nx===lv.goal.x&&ny===lv.goal.y&&G.carry){G.built+=G.carry;G.carry=0;chime([400,500,600],70,.08,'square');sparkle(nx,ny,['#e76f51','#ffd23f'],12);
      if(G.built>=lv.bricks.length){toast('הבית מוכן! 🏠 הזאב נשף ונשף... ולא הצליח! 🐺💨');win();return;}
      toast('בנית! 🧱 עוד '+(lv.bricks.length-G.built)+' לבנים');}
    if(G.wolfUsed>=lv.wolfSteps){chime([300,250,200],150,.2,'sawtooth');
      Object.assign(G,{carry:0,built:0,bricksLeft:lv.bricks.map(b=>Object.assign({},b)),wolfUsed:0,p:{x:lv.start.x,y:lv.start.y}});G.hits=(G.hits||0)+1;G.hurtUntil=performance.now()+1500;
      toast('הזאב הגיע! 🐺💨 הוא נשף ונשף, והלבנים התפזרו. מתחילים שוב');}
    updateHud();return;
  }
  if(id==='beanstalk'){
    if(lv.g[y][x][d]){bumpWall(d);return;}
    if(nx===lv.giant.x&&ny===lv.giant.y){bumpWall(d);arcSay('ששש... הענק ישן כאן 😴');return;}
    G.p={x:nx,y:ny};enter(nx,ny);
    if(G.creakSet.has(nx+','+ny)){G.noise++;beep(160+G.noise*30,.18,'sawtooth');
      if(G.noise>=lv.limit){chime([200,150,100],200,.25,'sawtooth');
        G.noise=0;G.hasEgg=false;G.hits=(G.hits||0)+1;arcHurt('הענק התעורר! 👹 "פי-פיי-פו-פאם!" ברחת חזרה לשעועית, והביצה חזרה למקום',lv.start,false);return;}
      arcSay('קריייק! 🪵 רעש '+G.noise+' מתוך '+lv.limit);}
    else beep(520,.03,'sine');
    if(!G.hasEgg&&nx===lv.egg.x&&ny===lv.egg.y){G.hasEgg=true;sparkle(nx,ny,['#ffd23f','#ffffff'],16);chime([988,1175,1568],80,.1,'sine');toast('ביצת הזהב! 🥚✨ עכשיו בשקט בחזרה לשעועית');}
    if(G.hasEgg&&nx===lv.start.x&&ny===lv.start.y)win();
    updateHud();return;
  }
  if(id==='thorns'){
    if(!nwIn(n,nx,ny)||lv.t[ny][nx]===2){bumpWall(d);return;}
    if(thornAt(nx,ny)){G.cuts[nx+','+ny]=performance.now();beep(900,.05,'square');setTimeout(()=>beep(700,.05,'square'),50);sparkle(nx,ny,['#2d6a4f','#95d5b2'],6);return;}
    G.prevP={x,y};G.p={x:nx,y:ny};enter(nx,ny);beep(520,.03,'sine');
    if(lv.t[ny][nx]===0)G.lastSafe={x:nx,y:ny};
    if(atGoal())win();return;
  }
}
function stTick(now){
  const id=G.W.id,lv=G.lv;
  if(id==='thorns'){const R=G.cfg.regrow;
    for(const k in G.cuts)if(now-G.cuts[k]>R){delete G.cuts[k];const [x,y]=k.split(',').map(Number);
      if(G.p.x===x&&G.p.y===y)arcHurt('הקוצים צמחו שוב! 🌹 חזרת לאחו האחרון',G.lastSafe,false);}}
  if(id==='hansel')G.birds=G.birds.filter(b=>now-b.t0<900);
}
function stHud(add){
  const id=G.W.id,lv=G.lv;
  if(id==='hansel')add(G.hgBack?'🏠 עכשיו הביתה!':'🍭 אל בית הממתקים');
  if(id==='pigs'){add('🧱 '+G.built+' מתוך '+lv.bricks.length+(G.carry?' · בידיים '+G.carry:''));const left=lv.wolfSteps-G.wolfUsed,s=add('🐺 עוד '+left+' צעדים');if(left<=8){s.style.background='#ffd6d6';s.style.color='#2a2140';}}
  if(id==='beanstalk'){add((G.hasEgg?'🥚 ✓':'🥚 ?')+' · '+'🔔'.repeat(G.noise)+'○'.repeat(Math.max(0,lv.limit-G.noise)));}
  if(id==='thorns')add('🗡️ נכנסים לקוץ כדי לחתוך אותו');
}
/* goals and friends */
function drawCandyHouse(c,x,y,r){
  c.fillStyle='#d4a373';c.fillRect(x-r*.6,y-r*.15,r*1.2,r*.8);c.fillStyle='#fff';c.beginPath();c.moveTo(x-r*.8,y-r*.1);c.lineTo(x,y-r*.8);c.lineTo(x+r*.8,y-r*.1);c.fill();
  c.fillStyle='#ff8fab';[[-.4,-.25],[0,-.55],[.4,-.25]].forEach(([a,b])=>circle(c,x+a*r,y+b*r,r*.1,'#ff8fab'));
  [['#4cc9f0',-.4,.1],['#ffd23f',.4,.1],['#8ac926',-.4,.45],['#ff595e',.4,.45]].forEach(([col,a,b])=>circle(c,x+a*r,y+b*r,r*.09,col));
  c.fillStyle='#7f5539';rrect(c,x-r*.14,y+r*.22,r*.28,r*.43,r*.12);c.fill();
}
function drawPigHouse(c,x,y,r,k){
  c.fillStyle='#bc4749';for(let i=0;i<4;i++)for(let j=0;j<3;j++)c.fillRect(x-r*.6+j*r*.4+(i%2)*r*.1,y+r*.45-i*r*.2,r*.36,r*.17);
  c.fillStyle='#6a040f';c.beginPath();c.moveTo(x-r*.75,y-r*.32);c.lineTo(x,y-r*.85);c.lineTo(x+r*.75,y-r*.32);c.fill();
  c.fillStyle='#7f5539';rrect(c,x-r*.13,y+r*.25,r*.26,r*.38,r*.1);c.fill();
}
function drawBeanTop(c,x,y,r){
  c.strokeStyle='#2d6a4f';c.lineWidth=Math.max(3,r*.18);c.beginPath();c.moveTo(x,y+r*.8);c.bezierCurveTo(x-r*.5,y+r*.3,x+r*.5,y-r*.1,x,y-r*.6);c.stroke();
  c.fillStyle='#52b788';[[-.3,.4,-.6],[.3,0,.6],[-.25,-.35,-.5]].forEach(([a,b,rt])=>{c.beginPath();c.ellipse(x+a*r,y+b*r,r*.22,r*.11,rt,0,7);c.fill();});
  circle(c,x+r*.35,y-r*.6,r*.18,'#ffffff');circle(c,x+r*.55,y-r*.55,r*.14,'#ffffff');
}
function drawCastleTower(c,x,y,r){
  c.fillStyle='#ced4da';c.fillRect(x-r*.35,y-r*.5,r*.7,r*1.15);c.fillStyle='#adb5bd';for(let i=0;i<3;i++)c.fillRect(x-r*.35+i*r*.27,y-r*.65,r*.16,r*.16);
  c.fillStyle='#ff8fab';c.beginPath();c.moveTo(x-r*.45,y-r*.5);c.lineTo(x,y-r*.95);c.lineTo(x+r*.45,y-r*.5);c.fill();
  c.fillStyle='#ffd23f';c.fillRect(x-r*.1,y-r*.2,r*.2,r*.25);c.fillStyle='#6c757d';rrect(c,x-r*.14,y+r*.25,r*.28,r*.4,r*.12);c.fill();
  circle(c,x+r*.4,y+r*.4,r*.12,'#e63946');
}
function drawGiant(c,x,y,r,now){
  c.fillStyle='#8d99ae';c.beginPath();c.ellipse(x,y+r*.15,r*.75,r*.5,0,0,7);c.fill();circle(c,x,y-r*.25,r*.45,'#f4a261');
  c.fillStyle='#6f4518';c.beginPath();c.arc(x,y-r*.35,r*.45,Math.PI,0);c.fill();
  c.strokeStyle='#2a2140';c.lineWidth=Math.max(1,r*.05);c.beginPath();c.arc(x-r*.15,y-r*.25,r*.08,0,Math.PI);c.arc(x+r*.15,y-r*.25,r*.08,0,Math.PI);c.stroke();
  circle(c,x,y-r*.05,r*.07,'#9d0208');
}
function drawRobin(c,x,y,r){
  circle(c,x,y,r*.6,'#8d5524');c.fillStyle='#e85d04';c.beginPath();c.ellipse(x,y+r*.18,r*.4,r*.33,0,0,7);c.fill();
  c.fillStyle='#6f4518';c.beginPath();c.ellipse(x-r*.55,y+r*.05,r*.18,r*.32,.5,0,7);c.ellipse(x+r*.55,y+r*.05,r*.18,r*.32,-.5,0,7);c.fill();
  eyes(c,x,y-r*.2,r,.2,.09);c.fillStyle='#ffd23f';c.beginPath();c.moveTo(x-r*.1,y-r*.05);c.lineTo(x+r*.1,y-r*.05);c.lineTo(x,y+r*.1);c.fill();
}
function drawLlama(c,x,y,r){
  c.fillStyle='#f1e3d3';c.beginPath();c.ellipse(x-r*.3,y-r*.6,r*.1,r*.22,-.2,0,7);c.ellipse(x+r*.3,y-r*.6,r*.1,r*.22,.2,0,7);c.fill();
  [[-.3,-.3],[0,-.42],[.3,-.3]].forEach(([a,b])=>circle(c,x+a*r,y+b*r,r*.2,'#ffffff'));
  c.fillStyle='#f1e3d3';c.beginPath();c.ellipse(x,y,r*.45,r*.5,0,0,7);c.fill();
  c.fillStyle='#e9c46a';c.beginPath();c.ellipse(x,y+r*.25,r*.25,r*.2,0,0,7);c.fill();circle(c,x-r*.08,y+r*.22,r*.04,'#6c584c');circle(c,x+r*.08,y+r*.22,r*.04,'#6c584c');
  eyes(c,x,y-r*.05,r,.18,.09);c.fillStyle='#ff8fab';c.fillRect(x-r*.45,y+r*.45,r*.9,r*.1);
}
function drawGoose(c,x,y,r){
  c.fillStyle='#ffffff';c.beginPath();c.ellipse(x,y+r*.25,r*.6,r*.38,0,0,7);c.fill();c.strokeStyle='#e9ecef';c.lineWidth=Math.max(1,r*.04);c.stroke();
  circle(c,x-r*.1,y-r*.3,r*.3,'#ffffff');c.fillStyle='#ff9f1c';c.beginPath();c.moveTo(x+r*.15,y-r*.32);c.lineTo(x+r*.42,y-r*.25);c.lineTo(x+r*.15,y-r*.18);c.fill();
  circle(c,x-r*.05,y-r*.35,r*.05,'#2a2140');circle(c,x-r*.2,y-r*.22,r*.05,'#ffc8dd');circle(c,x+r*.35,y+r*.45,r*.15,'#ffd23f');
}
function drawButterfly(c,x,y,r){
  [[-1,'#ff8fab'],[1,'#c77dff']].forEach(([s,col])=>{c.fillStyle=col;c.beginPath();c.ellipse(x+s*r*.38,y-r*.18,r*.32,r*.36,s*.4,0,7);c.fill();c.beginPath();c.ellipse(x+s*r*.32,y+r*.35,r*.22,r*.25,-s*.4,0,7);c.fill();
    circle(c,x+s*r*.4,y-r*.2,r*.1,'#ffffff');});
  c.fillStyle='#3c096c';c.beginPath();c.ellipse(x,y+r*.05,r*.12,r*.45,0,0,7);c.fill();circle(c,x,y-r*.3,r*.18,'#3c096c');
  circle(c,x-r*.06,y-r*.32,r*.05,'#ffffff');circle(c,x+r*.06,y-r*.32,r*.05,'#ffffff');
  c.strokeStyle='#3c096c';c.lineWidth=Math.max(1,r*.04);c.beginPath();c.moveTo(x-r*.05,y-r*.45);c.lineTo(x-r*.2,y-r*.7);c.moveTo(x+r*.05,y-r*.45);c.lineTo(x+r*.2,y-r*.7);c.stroke();
}
/* boards */
function stDraw(s,n,W,now){
  const id=G.W.id,lv=G.lv;ctx.textAlign='center';ctx.textBaseline='middle';
  if(id==='hansel'){
    ctx.fillStyle='#2d6a4f';ctx.fillRect(0,0,W,W);for(let y=0;y<n;y++)for(let x=0;x<n;x++)if((x*5+y*3)%4===0)circle(ctx,(x+.3)*s,(y+.7)*s,s*.08,'#40916c');
    drawWalls(lv.g,n,s,'#081c15');
    G.crumbs.forEach((c,i)=>{const a=.5+.5*i/G.crumbs.length;ctx.globalAlpha=a;circle(ctx,(c.x+.4)*s,(c.y+.55)*s,s*.07,'#f4d58d');circle(ctx,(c.x+.62)*s,(c.y+.42)*s,s*.06,'#e9c46a');ctx.globalAlpha=1;});
    G.birds.forEach(b=>{const e=(now-b.t0)/900;ctx.globalAlpha=1-e;glyph('🐦',(b.x+.5+e)*s,(b.y+.5-e*1.5)*s,s*.45);ctx.globalAlpha=1;});
  }else if(id==='pigs'){
    ctx.fillStyle='#b7e4c7';ctx.fillRect(0,0,W,W);for(let y=0;y<n;y++)for(let x=0;x<n;x++)if((x*7+y*3)%5===0){circle(ctx,(x+.3)*s,(y+.3)*s,s*.05,'#ffffff');circle(ctx,(x+.3)*s,(y+.3)*s,s*.025,'#ffd23f');}
    drawTrail(s,'rgba(255,255,255,.4)');drawWalls(lv.g,n,s,'#a47148');
    G.bricksLeft.forEach(b=>{const X=b.x*s,Y=b.y*s;ctx.fillStyle='#bc4749';ctx.fillRect(X+s*.2,Y+s*.32,s*.6,s*.36);ctx.strokeStyle='#ffffff';ctx.lineWidth=Math.max(1,s*.03);ctx.strokeRect(X+s*.2,Y+s*.32,s*.6,s*.36);ctx.beginPath();ctx.moveTo(X+s*.2,Y+s*.5);ctx.lineTo(X+s*.8,Y+s*.5);ctx.moveTo(X+s*.5,Y+s*.32);ctx.lineTo(X+s*.5,Y+s*.5);ctx.stroke();});
  }else if(id==='beanstalk'){
    const gr=ctx.createLinearGradient(0,0,0,W);gr.addColorStop(0,'#e0e1dd');gr.addColorStop(1,'#cbc0d3');ctx.fillStyle=gr;ctx.fillRect(0,0,W,W);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){const k=x+','+y;if(G.creakSet.has(k)){const X=x*s,Y=y*s;ctx.fillStyle='#b08968';ctx.fillRect(X+s*.05,Y+s*.05,s*.9,s*.9);ctx.strokeStyle='#7f5539';ctx.lineWidth=Math.max(1,s*.04);
      ctx.beginPath();ctx.moveTo(X+s*.05,Y+s*.36);ctx.lineTo(X+s*.95,Y+s*.36);ctx.moveTo(X+s*.05,Y+s*.66);ctx.lineTo(X+s*.95,Y+s*.66);ctx.stroke();circle(ctx,X+s*.15,Y+s*.2,s*.03,'#5e3b1f');circle(ctx,X+s*.85,Y+s*.8,s*.03,'#5e3b1f');}}
    drawTrail(s,'rgba(106,76,147,.2)');drawWalls(lv.g,n,s,'#5c4d7d');
    const gx=(lv.giant.x+.5)*s,gy=(lv.giant.y+.5)*s;drawGiant(ctx,gx,gy,s*.45,now);ctx.fillStyle='#2a2140';ctx.font='bold '+Math.round(s*.3)+'px sans-serif';ctx.fillText('Z',gx+s*.35,gy-s*.4+Math.sin(now/400)*s*.05);
    if(!G.hasEgg){const ex=(lv.egg.x+.5)*s,ey=(lv.egg.y+.5)*s;ctx.globalAlpha=.35+.2*Math.sin(now/250);circle(ctx,ex,ey,s*.42,'#ffd23f');ctx.globalAlpha=1;ctx.fillStyle='#ffc300';ctx.beginPath();ctx.ellipse(ex,ey,s*.2,s*.26,0,0,7);ctx.fill();ctx.fillStyle='#fff3b0';ctx.beginPath();ctx.ellipse(ex-s*.06,ey-s*.08,s*.06,s*.09,0,0,7);ctx.fill();}
  }else if(id==='thorns'){
    ctx.fillStyle='#d8f3dc';ctx.fillRect(0,0,W,W);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){const v=lv.t[y][x],X=x*s,Y=y*s,k=x+','+y;
      if(v===0){ctx.fillStyle='#b7e4c7';ctx.fillRect(X,Y,s+.5,s+.5);circle(ctx,X+s*.3,Y+s*.3,s*.05,'#ff8fab');circle(ctx,X+s*.7,Y+s*.65,s*.05,'#ffd23f');}
      else if(v===2){ctx.fillStyle='#adb5bd';rrect(ctx,X+s*.08,Y+s*.12,s*.84,s*.8,s*.18);ctx.fill();ctx.fillStyle='#ced4da';rrect(ctx,X+s*.16,Y+s*.16,s*.5,s*.3,s*.12);ctx.fill();}
      else{const cut=G.cuts[k];if(cut){const e=Math.min(1,(now-cut)/G.cfg.regrow);ctx.fillStyle='#95d5b2';ctx.fillRect(X,Y,s+.5,s+.5);
          ctx.globalAlpha=e*.85;drawThorn(X,Y,s);ctx.globalAlpha=1;if(e>.75){ctx.globalAlpha=.4+.4*Math.sin(now/80);ctx.strokeStyle='#d00000';ctx.lineWidth=Math.max(1,s*.05);ctx.strokeRect(X+2,Y+2,s-4,s-4);ctx.globalAlpha=1;}}
        else drawThorn(X,Y,s);}}
    drawTrail(s,'rgba(255,255,255,.35)');
  }
}
function drawThorn(X,Y,s){ctx.fillStyle='#1b4332';ctx.fillRect(X,Y,s+.5,s+.5);ctx.strokeStyle='#40916c';ctx.lineWidth=Math.max(1,s*.06);ctx.beginPath();
  ctx.moveTo(X+s*.1,Y+s*.8);ctx.quadraticCurveTo(X+s*.5,Y+s*.2,X+s*.9,Y+s*.7);ctx.moveTo(X+s*.2,Y+s*.2);ctx.quadraticCurveTo(X+s*.5,Y+s*.7,X+s*.85,Y+s*.15);ctx.stroke();
  ctx.fillStyle='#95d5b2';[[.3,.5],[.7,.45],[.5,.3]].forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(X+a*s,Y+b*s-s*.08);ctx.lineTo(X+a*s+s*.05,Y+b*s+s*.04);ctx.lineTo(X+a*s-s*.05,Y+b*s+s*.04);ctx.fill();});
  circle(ctx,X+s*.75,Y+s*.75,s*.08,'#e63946');}
function stDraw2(s,n,W,now){
  const id=G.W.id,lv=G.lv;
  if(id==='hansel'){
    // the dark forest: only near her can she see; on the way home the forest forgets
    const R=G.cfg.light;
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){const dd=Math.hypot(x-G.vis.x,y-G.vis.y);if(dd<=R)G.hgSeen.add(x+','+y);
      const crumb=G.crumbs.some(c=>c.x===x&&c.y===y);const a=dd<R-.6?0:dd<=R?(dd-(R-.6))/.6*.8:G.hgSeen.has(x+','+y)?.55:crumb?.6:.9;
      if(a>0){ctx.fillStyle='rgba(8,20,16,'+a+')';ctx.fillRect(x*s-.5,y*s-.5,s+1,s+1);}}
    G.crumbs.forEach(c=>{if(Math.hypot(c.x-G.vis.x,c.y-G.vis.y)>R){ctx.globalAlpha=.8;circle(ctx,(c.x+.5)*s,(c.y+.5)*s,s*.08,'#f4d58d');ctx.globalAlpha=1;}});
    if(!G.hgBack){ctx.globalAlpha=.5+.3*Math.sin(now/300);circle(ctx,(lv.goal.x+.5)*s,(lv.goal.y+.5)*s,s*.55,'#ff8fab');ctx.globalAlpha=1;drawCandyHouse(ctx,(lv.goal.x+.5)*s,(lv.goal.y+.5)*s,s*.42);}
    else{ctx.globalAlpha=.5+.3*Math.sin(now/300);circle(ctx,(lv.start.x+.5)*s,(lv.start.y+.5)*s,s*.55,'#ffd23f');ctx.globalAlpha=1;glyph('🏠',(lv.start.x+.5)*s,(lv.start.y+.5)*s,s*.6,1);}
  }
  if(id==='pigs'){ctx.fillStyle='rgba(255,255,255,.75)';const X=lv.goal.x*s,Y=lv.goal.y*s;rrect(ctx,X+s*.05,Y-s*.25,s*.9,s*.24,s*.1);ctx.fill();
    ctx.fillStyle='#bc4749';ctx.fillRect(X+s*.1,Y-s*.2,s*.8*G.built/lv.bricks.length,s*.14);
    if(G.carry){glyph('🧱'.repeat(G.carry),(G.vis.x+.5)*s,(G.vis.y-.05)*s,s*.32,1);}}
}

function drawGummy(c,x,y,r){
  circle(c,x-r*.38,y-r*.45,r*.17,'#ff5d8f');circle(c,x+r*.38,y-r*.45,r*.17,'#ff5d8f');
  c.fillStyle='#ff5d8f';c.beginPath();c.ellipse(x,y-r*.1,r*.48,r*.42,0,0,7);c.fill();c.beginPath();c.ellipse(x,y+r*.42,r*.38,r*.3,0,0,7);c.fill();
  c.fillStyle='rgba(255,255,255,.4)';c.beginPath();c.ellipse(x-r*.18,y-r*.28,r*.14,r*.08,-.5,0,7);c.fill();
  circle(c,x,y+r*.02,r*.07,'#9d0208');eyes(c,x,y-r*.15,r,.17,.08);
}
function drawJellyfish(c,x,y,r){
  c.strokeStyle='#c77dff';c.lineWidth=Math.max(2,r*.08);c.lineCap='round';for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(x+i*r*.18,y+r*.15);c.quadraticCurveTo(x+i*r*.18+r*.1,y+r*.45,x+i*r*.2,y+r*.75);c.stroke();}
  c.fillStyle='#e0aaff';c.beginPath();c.arc(x,y+r*.15,r*.6,Math.PI,0);c.quadraticCurveTo(x,y+r*.35,x-r*.6,y+r*.15);c.fill();
  circle(c,x-r*.25,y-r*.25,r*.08,'#ffffff');eyes(c,x,y-r*.05,r,.2,.08);circle(c,x-r*.36,y+r*.06,r*.06,'#ff8fab');circle(c,x+r*.36,y+r*.06,r*.06,'#ff8fab');
}
kit(ST,ftWrap({move:stMove,tick:stTick,hud:stHud,draw:stDraw,draw2:stDraw2}));
