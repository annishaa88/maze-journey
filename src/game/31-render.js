/* ================= render loop ================= */
function drawWalls(g,n,s,col){
  if(G&&G.lv&&G.lv.fl&&G.lv.g===g){ctx.save();for(let y=0;y<n;y++)for(let x=0;x<n;x++){const f=+G.lv.fl[y*n+x];if(f){ctx.globalAlpha=.6;ctx.fillStyle=BFLOOR[f];ctx.fillRect(x*s,y*s,s+.5,s+.5);}}
    ctx.globalAlpha=.95;ctx.font=Math.round(s*.5)+'px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#000';(G.lv.dec||[]).forEach(([x,y,i])=>ctx.fillText(BDECO[i]||'🌸',(x+.5)*s,(y+.55)*s));ctx.restore();}
  if(G&&G.lv&&G.lv.blk&&G.lv.g===g){ctx.save();const B=new Set(G.lv.blk.map(c=>c+''));ctx.globalAlpha=.9;ctx.fillStyle=col;G.lv.blk.forEach(([x,y])=>ctx.fillRect(x*s-.5,y*s-.5,s+1,s+1));ctx.globalAlpha=.25;ctx.fillStyle='#ffffff';G.lv.blk.forEach(([x,y])=>{if(!B.has(x+','+(y-1)))ctx.fillRect(x*s,y*s,s,s*.14);});ctx.restore();}
  const path=()=>{ctx.beginPath();
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){const w=g[y][x],X=x*s,Y=y*s;
      if(w[0]){ctx.moveTo(X,Y);ctx.lineTo(X+s,Y);}
      if(w[3]){ctx.moveTo(X,Y);ctx.lineTo(X,Y+s);}
      if(y===n-1&&w[2]){ctx.moveTo(X,Y+s);ctx.lineTo(X+s,Y+s);}
      if(x===n-1&&w[1]){ctx.moveTo(X+s,Y);ctx.lineTo(X+s,Y+s);}}};
  // a soft shadow and a light edge make the walls stand up from the floor
  ctx.lineCap='round';const w=Math.max(2,s*.14);
  ctx.save();ctx.translate(s*.035,s*.065);ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=w;path();ctx.stroke();ctx.restore();
  ctx.strokeStyle=col;ctx.lineWidth=w;path();ctx.stroke();
  ctx.save();ctx.translate(-w*.18,-w*.22);ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=Math.max(1,w*.3);path();ctx.stroke();ctx.restore();
}
function drawTrail(s,col){ctx.fillStyle=col;G.trail.forEach(k=>{const [x,y]=k.split(',').map(Number);ctx.beginPath();ctx.arc((x+.5)*s,(y+.5)*s,s*.13,0,7);ctx.fill();});}

// the little map in the corner: where she has been, the stars, the fountain and what the screen shows
function giantMini(W,now){
  const n=G.lv.n,V=G.lv.view,m=Math.round(W*.3),ms=m/n,px=(G.vis.x+.5-G.cam.x)/V*W,py=(G.vis.y+.5-G.cam.y)/V*W;
  let ox=8,oy=8;if(px<m+W*.12&&py<m+W*.12)ox=W-m-8;
  ctx.save();ctx.globalAlpha=.9;ctx.fillStyle='#f1faee';rrect(ctx,ox-4,oy-4,m+8,m+8,Math.max(4,m*.06));ctx.fill();ctx.globalAlpha=1;
  ctx.fillStyle='#2d6a4f';ctx.globalAlpha=.25;ctx.fillRect(ox,oy,m,m);ctx.globalAlpha=1;
  ctx.fillStyle='#95d5b2';G.trail.forEach(k=>{const [x,y]=k.split(',').map(Number);ctx.fillRect(ox+x*ms,oy+y*ms,Math.ceil(ms),Math.ceil(ms));});
  ctx.strokeStyle='#ff5d8f';ctx.lineWidth=Math.max(1.5,W*.004);ctx.strokeRect(ox+G.cam.x*ms,oy+G.cam.y*ms,V*ms,V*ms);
  G.stars.forEach(k=>{const [x,y]=k.split(',').map(Number);circle(ctx,ox+(x+.5)*ms,oy+(y+.5)*ms,Math.max(3,ms*.75),'#ffb703');});
  circle(ctx,ox+(G.lv.goal.x+.5)*ms,oy+(G.lv.goal.y+.5)*ms,Math.max(3.5,ms*.9)*(1+.2*Math.sin(now/250)),'#e63946');
  circle(ctx,ox+(G.vis.x+.5)*ms,oy+(G.vis.y+.5)*ms,Math.max(3.5,ms*.85),'#7209b7');
  ctx.restore();
}
function frame(now){
  requestAnimationFrame(frame);
  if(!G||document.getElementById('gameScreen').hidden||pausedAt)return;
  let W=cv.width;if(!W)return;
  const n=G.lv.n,C=G.duelChar||curChar();let s=W/(G.lv.view&&n>G.lv.view?G.lv.view:n);
  if(G.duel&&G.started&&!G.done){const t=Math.floor((Date.now()-G.t0)/1000);if(t!==G.shownT){G.shownT=t;const el=document.getElementById('duelTimer');if(el)el.textContent='⏱️ '+t+' שניות';}}
  // the character glides toward its cell with a little hop; big jumps (portals, restarts) snap
  if(!G.vis)G.vis={x:G.p.x,y:G.p.y};
  const dt=Math.min(50,now-(G.lastNow||now));G.lastNow=now;G.dt=dt;
  // a puff of dust behind each step
  if(G.lastP&&(G.lastP.x!==G.p.x||G.lastP.y!==G.p.y)&&Math.abs(G.lastP.x-G.p.x)+Math.abs(G.lastP.y-G.p.y)<=2){for(let i=0;i<3;i++)fxAdd({k:'dust',x:G.lastP.x+.5+(Math.random()-.5)*.3,y:G.lastP.y+.8,vx:(Math.random()-.5)*.6,vy:-.3-Math.random()*.3,life:420});}
  G.lastP={x:G.p.x,y:G.p.y};
  let gdx=G.p.x-G.vis.x,gdy=G.p.y-G.vis.y,dist=Math.hypot(gdx,gdy);
  if(dist>2.2||matchMedia('(prefers-reduced-motion: reduce)').matches){G.vis={x:G.p.x,y:G.p.y};dist=0;}
  else{const k=Math.min(1,dt/60);G.vis.x+=gdx*k;G.vis.y+=gdy*k;if(dist<.01){G.vis.x=G.p.x;G.vis.y=G.p.y;}}
  const hop=Math.sin(Math.min(1,dist)*Math.PI)*s*.14;
  let bx=0,by=0;
  if(G.bump){const e=(now-G.bump.t)/200;if(e>=1||matchMedia('(prefers-reduced-motion: reduce)').matches)G.bump=null;
    else{const a=Math.sin(e*Math.PI*3)*(1-e)*s*.12;bx=DV[G.bump.d][0]*a;by=DV[G.bump.d][1]*a;}}

  // ice slide animation
  if(G.anim){
    if(!G.anim.t)G.anim.t=now;
    const step=Math.floor((now-G.anim.t)/(G.anim.ms||55));
    while(G.anim&&G.anim.i<=step&&G.anim.i<G.anim.cells.length){const c=G.anim.cells[G.anim.i++];G.p={x:c[0],y:c[1]};
      if(c.length>2&&c[2]!==G.tog){G.tog=c[2];beep(700,.08);beep(1000,.12);toast('קליק! השערים התחלפו');updateHud();}
      enter(c[0],c[1]);}
    if(G.anim&&G.anim.i>=G.anim.cells.length){G.anim=null;if(atGoal())win();}
  }
  // fish
  // tides
  if(G.W.id==='beach'&&!G.done&&now-G.tideAt>G.cfg.speed){G.tideAt=now;G.tideT++;
    const t=G.lv.tides.find(q=>q.x===G.p.x&&q.y===G.p.y);
    if(t&&tideWet(t.grp)){G.p={x:G.lastDry.x,y:G.lastDry.y};beep(300,.2,'sine');toast('גל! 🌊 הגל החזיר אותך לחוף');}}
  if((['sea','jungle','farm','haunt'].includes(G.W.id)||(G.custom&&movers().length))&&!G.done&&now-G.fishT>G.cfg.speed){G.fishT=now;
    movers().forEach(f=>{f.t=((f.t||0)+1)%CYCLE;if(!awake(f))return;
      if(f.i+f.dir<0||f.i+f.dir>=f.cells.length)f.dir*=-1;
      const [nx,ny]=f.cells[f.i+f.dir];if(nx===G.p.x&&ny===G.p.y){f.dir*=-1;return;}
      f.i+=f.dir;});fishHit();}
  if(isArc(G.W.id)&&!G.done)arcTick(now);
  // a maze bigger than the screen: the view follows her
  let cam=null;if(G.lv.view&&n>G.lv.view){const V=G.lv.view,cl=v=>Math.max(0,Math.min(n-V,v)),tx=cl(G.vis.x+.5-V/2),ty=cl(G.vis.y+.5-V/2);
    if(!G.cam)G.cam={x:tx,y:ty};else{const k=calmFx()?1:Math.min(1,dt/110);G.cam.x+=(tx-G.cam.x)*k;G.cam.y+=(ty-G.cam.y)*k;}
    cam=G.cam;ctx.save();ctx.translate(-cam.x*s,-cam.y*s);W=n*s;}

  if(G.W.id==='ice'){
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){
      ctx.fillStyle=(x+y)%2?'#e4f5fd':'#d6effb';ctx.fillRect(x*s,y*s,s+1,s+1);
      ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=Math.max(1,s*.04);ctx.beginPath();ctx.moveTo(x*s+s*.2,y*s+s*.35);ctx.lineTo(x*s+s*.4,y*s+s*.2);ctx.stroke();}
    drawTrail(s,'rgba(91,184,232,.45)');
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(G.lv.t[y][x]){
      const cx=(x+.5)*s,cy=(y+.5)*s;
      ctx.fillStyle='#7d8fa8';ctx.beginPath();ctx.ellipse(cx,cy+s*.06,s*.42,s*.36,0,0,7);ctx.fill();
      ctx.fillStyle='#96a8c0';ctx.beginPath();ctx.ellipse(cx-s*.06,cy,s*.3,s*.24,0,0,7);ctx.fill();
      ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(cx,cy-s*.2,s*.3,s*.12,0,0,7);ctx.fill();}
  }else if(G.W.id==='castle'){
    ctx.fillStyle='#f6ecd6';ctx.fillRect(0,0,W,W);
    ctx.strokeStyle='rgba(123,94,167,.12)';ctx.lineWidth=1;ctx.beginPath();
    for(let i=1;i<n;i++){ctx.moveTo(i*s,0);ctx.lineTo(i*s,W);ctx.moveTo(0,i*s);ctx.lineTo(W,i*s);}ctx.stroke();
    drawTrail(s,'rgba(255,93,143,.3)');
    drawWalls(G.lv.g,n,s,'#563e7e');
    Object.keys(G.doors).forEach(k=>{const [a,b,o]=k.split(',');const x=+a,y=+b,c=KEYC[G.doors[k]].c;
      ctx.strokeStyle=c;ctx.lineWidth=Math.max(4,s*.24);ctx.lineCap='butt';ctx.beginPath();
      if(o==='h'){ctx.moveTo((x+1)*s,y*s+s*.08);ctx.lineTo((x+1)*s,(y+1)*s-s*.08);}else{ctx.moveTo(x*s+s*.08,(y+1)*s);ctx.lineTo((x+1)*s-s*.08,(y+1)*s);}
      ctx.stroke();ctx.lineCap='round';
      const kx=o==='h'?(x+1)*s:(x+.5)*s,ky=o==='h'?(y+.5)*s:(y+1)*s;circle(ctx,kx,ky,s*.07,'#2a2140');});
    G.keysLeft.forEach(k=>drawKey(ctx,(k.x+.5)*s,(k.y+.5)*s,s*.4,KEYC[k.c].c));
  }else if(G.W.id==='jungle'){
    ctx.fillStyle='#e6f5cf';ctx.fillRect(0,0,W,W);
    ctx.strokeStyle='rgba(58,157,93,.25)';ctx.lineWidth=Math.max(1,s*.04);ctx.beginPath();
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if((x*7+y*3)%4===0){const gx=x*s+s*.3,gy=y*s+s*.75;ctx.moveTo(gx,gy);ctx.lineTo(gx+s*.05,gy-s*.15);ctx.moveTo(gx+s*.1,gy);ctx.lineTo(gx+s*.12,gy-s*.12);}ctx.stroke();
    G.lv.bridges.forEach(b=>{const X=b.x*s,Y=b.y*s,down=G.collapsed.has(b.x+','+b.y);
      ctx.fillStyle='#5fb8e6';ctx.fillRect(X,Y,s,s);
      ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=Math.max(1,s*.04);ctx.beginPath();
      for(let i=0;i<2;i++){const yy=Y+s*(.3+i*.4)+Math.sin(now/300+i)*s*.03;ctx.moveTo(X+s*.15,yy);ctx.quadraticCurveTo(X+s*.3,yy-s*.08,X+s*.45,yy);ctx.quadraticCurveTo(X+s*.6,yy+s*.08,X+s*.8,yy);}ctx.stroke();
      const w=G.lv.g[b.y][b.x],cx=X+s/2,cy=Y+s/2,hw=s*.2;
      if(!down){
        // walkway arms toward each open side, so it reads as a path that continues
        const arms=[0,1,2,3].filter(d=>!w[d]);
        ctx.fillStyle='#c8914f';
        arms.forEach(d=>{if(d===0)ctx.fillRect(cx-hw,Y,hw*2,s/2+hw);if(d===2)ctx.fillRect(cx-hw,cy-hw,hw*2,s/2+hw);
          if(d===3)ctx.fillRect(X,cy-hw,s/2+hw,hw*2);if(d===1)ctx.fillRect(cx-hw,cy-hw,s/2+hw,hw*2);});
        ctx.strokeStyle='#7a5226';ctx.lineWidth=Math.max(1,s*.035);ctx.beginPath();
        arms.forEach(d=>{for(let i=1;i<4;i++){const t=i/4*(s/2+hw);
          if(d===0){ctx.moveTo(cx-hw,Y+t);ctx.lineTo(cx+hw,Y+t);}if(d===2){ctx.moveTo(cx-hw,cy-hw+t);ctx.lineTo(cx+hw,cy-hw+t);}
          if(d===3){ctx.moveTo(X+t,cy-hw);ctx.lineTo(X+t,cy+hw);}if(d===1){ctx.moveTo(cx-hw+t,cy-hw);ctx.lineTo(cx-hw+t,cy+hw);}}});
        ctx.stroke();
      }else{
        ctx.fillStyle='#8a6034';ctx.save();ctx.translate(cx,cy+Math.sin(now/400)*s*.04);ctx.rotate(.4);ctx.fillRect(-s*.2,-s*.05,s*.4,s*.1);ctx.restore();
      }});
    drawTrail(s,'rgba(255,93,143,.3)');
    drawWalls(G.lv.g,n,s,'#276e40');
  }else if(G.W.id==='farm'){
    ctx.fillStyle='#f6efd2';ctx.fillRect(0,0,W,W);
    ctx.strokeStyle='rgba(217,164,65,.35)';ctx.lineWidth=Math.max(1,s*.04);ctx.beginPath();
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if((x*5+y*7)%3===0){const hx=x*s+s*.25,hy=y*s+s*.7;ctx.moveTo(hx,hy);ctx.lineTo(hx+s*.2,hy-s*.06);ctx.moveTo(hx+s*.1,hy+s*.1);ctx.lineTo(hx+s*.32,hy+s*.06);}ctx.stroke();
    drawTrail(s,'rgba(255,210,63,.45)');
    drawWalls(G.lv.g,n,s,'#8a5a2b');
    G.chicksLeft.forEach(c=>drawChick(ctx,(c.x+.5)*s,(c.y+.5)*s+Math.sin(now/200+c.x)*s*.04,s*.38));
  }else if(G.W.id==='rainbow'){
    ctx.fillStyle='#fbfaff';ctx.fillRect(0,0,W,W);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){const tc=G.lv.col[y][x];if(!tc)continue;
      ctx.fillStyle=RBC[tc].c;ctx.globalAlpha=tc===G.color?.95:.7;ctx.fillRect(x*s,y*s,s+1,s+1);ctx.globalAlpha=1;
      ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=Math.max(1,s*.05);ctx.beginPath();ctx.moveTo(x*s+s*.15,y*s+s*.85);ctx.lineTo(x*s+s*.85,y*s+s*.15);ctx.stroke();}
    drawTrail(s,'rgba(106,76,147,.25)');
    drawWalls(G.lv.g,n,s,'#4b3569');
    Object.keys(G.lv.buckets).forEach(k=>{const [x,y]=k.split(',').map(Number);drawBucket(ctx,(x+.5)*s,(y+.5)*s,s*.42,RBC[G.lv.buckets[k]].c);});
  }else if(G.W.id==='toys'){
    ctx.fillStyle='#f6e7cf';ctx.fillRect(0,0,W,W);
    ctx.strokeStyle='rgba(143,90,49,.18)';ctx.lineWidth=1;ctx.beginPath();for(let y=1;y<n*2;y++){ctx.moveTo(0,y*s/2);ctx.lineTo(W,y*s/2);}ctx.stroke();
    drawTrail(s,'rgba(192,127,76,.3)');
    const toyC=['#ff595e','#ffca3a','#1982c4','#8ac926'];
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(G.lv.t[y][x]){const X=x*s,Y=y*s;
      ctx.fillStyle='#8f5a31';ctx.fillRect(X,Y,s+1,s+1);ctx.fillStyle='#a86d3e';ctx.fillRect(X,Y+s*.45,s+1,s*.1);
      ctx.fillStyle=toyC[(x+y)%4];ctx.fillRect(X+s*.15,Y+s*.18,s*.25,s*.25);circle(ctx,X+s*.68,Y+s*.3,s*.13,toyC[(x+y+1)%4]);
      ctx.fillStyle=toyC[(x+y+2)%4];ctx.fillRect(X+s*.2,Y+s*.63,s*.6,s*.2);}
    G.boxes.forEach(k=>{const [x,y]=k.split(',').map(Number),X=x*s,Y=y*s;
      ctx.fillStyle='#d4a373';rrect(ctx,X+s*.07,Y+s*.07,s*.86,s*.86,s*.08);ctx.fill();ctx.strokeStyle='#9c6b3f';ctx.lineWidth=Math.max(1,s*.05);ctx.stroke();
      ctx.fillStyle='#e9c46a';ctx.fillRect(X+s*.43,Y+s*.07,s*.14,s*.86);
      ctx.strokeStyle='#9c6b3f';ctx.lineWidth=Math.max(1,s*.03);ctx.beginPath();ctx.moveTo(X+s*.15,Y+s*.3);ctx.lineTo(X+s*.35,Y+s*.3);ctx.stroke();});
  }else if(G.W.id==='forest'){
    ctx.fillStyle='#e7f2d8';ctx.fillRect(0,0,W,W);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if((x*7+y*11)%5===0){ctx.fillStyle='rgba(106,153,78,.25)';ctx.beginPath();ctx.ellipse(x*s+s*.3,y*s+s*.7,s*.1,s*.05,.6,0,7);ctx.fill();}
    if(G.flip){ctx.fillStyle='rgba(155,93,229,.13)';ctx.fillRect(0,0,W,W);}
    drawTrail(s,'rgba(155,93,229,.3)');
    drawWalls(G.lv.g,n,s,'#3d5a3a');
    G.lv.mush.forEach(m=>drawMushroom(ctx,(m.x+.5)*s,(m.y+.5)*s+Math.sin(now/300+m.x)*s*.03,s*.58));
  }else if(G.W.id==='beach'){
    ctx.fillStyle='#f7e4b5';ctx.fillRect(0,0,W,W);
    G.lv.tides.forEach(t=>{const X=t.x*s,Y=t.y*s;
      if(tideWet(t.grp)){ctx.fillStyle='#4fb3e8';ctx.fillRect(X,Y,s+1,s+1);ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=Math.max(1,s*.05);ctx.beginPath();
        for(let i=0;i<2;i++){const yy=Y+s*(.35+i*.35)+Math.sin(now/250+i+t.x)*s*.04;ctx.moveTo(X+s*.1,yy);ctx.quadraticCurveTo(X+s*.3,yy-s*.1,X+s*.5,yy);ctx.quadraticCurveTo(X+s*.7,yy+s*.1,X+s*.9,yy);}ctx.stroke();}
      else{ctx.fillStyle='#e6cc8e';ctx.fillRect(X,Y,s+1,s+1);
        if(tideWarn(t.grp)){ctx.globalAlpha=.4+.4*Math.sin(now/90);ctx.fillStyle='#4fb3e8';ctx.fillRect(X,Y,s+1,s*.35);ctx.globalAlpha=1;}}});
    drawTrail(s,'rgba(255,93,143,.3)');
    drawWalls(G.lv.g,n,s,'#a47148');
  }else if(G.W.id==='mirror'){
    ctx.fillStyle='#f3eefc';ctx.fillRect(0,0,W,W);
    ctx.strokeStyle='rgba(157,142,196,.35)';ctx.setLineDash([s*.2,s*.2]);ctx.lineWidth=Math.max(1,s*.04);ctx.beginPath();ctx.moveTo(W/2,0);ctx.lineTo(W/2,W);ctx.stroke();ctx.setLineDash([]);
    drawTrail(s,'rgba(255,93,143,.3)');
    ctx.fillStyle='rgba(76,201,240,.4)';G.ttrail.forEach(k=>{const [x,y]=k.split(',').map(Number);ctx.beginPath();ctx.arc((x+.5)*s,(y+.5)*s,s*.13,0,7);ctx.fill();});
    drawWalls(G.lv.g,n,s,'#6f5fa0');
    drawMirrorGoal(ctx,(G.lv.twinGoal.x+.5)*s,(G.lv.twinGoal.y+.5)*s,s*.42,'#4cc9f0');
  }else if(isArc(G.W.id)){arcDraw(s,n,W,now);
  }else if(QUIZ.has(G.W.id)){
    const paper={numbers:'#fffdf6',english:'#f6f9ff',hebrew:'#fffaf0',logic:'#f8f5ff',geometry:'#f3fffd'}[G.W.id];
    ctx.fillStyle=paper;ctx.fillRect(0,0,W,W);
    ctx.strokeStyle=G.W.id==='numbers'?'rgba(76,201,240,.25)':'rgba(120,120,160,.12)';ctx.lineWidth=1;ctx.beginPath();
    if(G.W.id==='numbers'){for(let i=1;i<n*2;i++){ctx.moveTo(i*s/2,0);ctx.lineTo(i*s/2,W);ctx.moveTo(0,i*s/2);ctx.lineTo(W,i*s/2);}}
    else for(let i=1;i<n*2;i++){ctx.moveTo(0,i*s/2);ctx.lineTo(W,i*s/2);}
    ctx.stroke();
    drawTrail(s,G.W.hex+'4d');
    drawWalls(G.lv.g,n,s,G.W.deep);
    G.lv.quiz.forEach((q,j)=>{const qs=G.lv.qs[j];if(!qs)return;
      const st=j<G.qi?'done':j===G.qi?'cur':'future',key=qs.mode==='key';
      q.wrong.forEach((w,k)=>{if(k>=qs.wrong.length){numTile(ctx,(w.x+.5)*s,(w.y+.5)*s,s,'','old');return;}
        numTile(ctx,(w.x+.5)*s,(w.y+.5)*s,s,st==='future'?'?':key?'':disp(qs.wrong[k]),st==='done'?'old':st==='future'?'future':'wrong',key&&st!=='future'?keyOf(qs,k+1):null);});
      let pst=st;if(st==='cur'&&G.qGlow&&Math.floor(now/300)%2)pst='glow';
      numTile(ctx,(q.x+.5)*s,(q.y+.5)*s,s,st==='future'?'?':key?'':disp(qs.ans),pst,key&&st!=='future'?keyOf(qs,0):null);});
    G.coinsLeft.forEach(c=>{const cx=(c.x+.5)*s,cy=(c.y+.5)*s;circle(ctx,cx,cy+s*.04,s*.36,'#d99a00');circle(ctx,cx,cy,s*.36,'#ffc23c');circle(ctx,cx,cy,s*.28,'#ffd76a');
      ctx.fillStyle='#6b4a00';ctx.direction='ltr';const t=MATH.fmt(c.v);ctx.font='bold '+Math.round(s*(t.length<=2?.34:.26))+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,cx,cy+s*.02);});
  }else if(G.W.id==='haunt'){
    ctx.fillStyle='#3a3055';ctx.fillRect(0,0,W,W);
    ctx.strokeStyle='rgba(255,255,255,.05)';ctx.lineWidth=1;ctx.beginPath();for(let y=1;y<n*2;y++){ctx.moveTo(0,y*s/2);ctx.lineTo(W,y*s/2);}ctx.stroke();
    drawTrail(s,'rgba(255,210,63,.25)');
    drawWalls(G.lv.g,n,s,'#1a1428');
  }else if(G.W.id==='candy'){
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){ctx.fillStyle=(x+y)%2?'#fff4f8':'#ffe8f1';ctx.fillRect(x*s,y*s,s+1,s+1);}
    // belts
    Object.keys(G.lv.conv).forEach(k=>{const [x,y]=k.split(',').map(Number),d=G.lv.conv[k],X=x*s,Y=y*s;
      ctx.fillStyle='#8d99ae';ctx.fillRect(X,Y,s,s);ctx.fillStyle='#adb5c4';ctx.fillRect(X+s*.08,Y+s*.08,s*.84,s*.84);
      const off=((now/600)%1)*s*.5;
      ctx.save();ctx.beginPath();ctx.rect(X,Y,s,s);ctx.clip();ctx.translate(X+s/2,Y+s/2);ctx.rotate([-Math.PI/2,0,Math.PI/2,Math.PI][d]);
      ctx.strokeStyle='#ffffff';ctx.lineWidth=Math.max(2,s*.09);ctx.lineCap='round';ctx.lineJoin='round';
      for(let i=-2;i<=1;i++){const cx=i*s*.5+off;ctx.beginPath();ctx.moveTo(cx-s*.12,-s*.2);ctx.lineTo(cx+s*.08,0);ctx.lineTo(cx-s*.12,s*.2);ctx.stroke();}
      ctx.restore();});
    drawTrail(s,'rgba(229,107,159,.35)');
    drawWalls(G.lv.g,n,s,'#8e3563');
    // buttons
    G.lv.sw.forEach(k=>{const [x,y]=k.split(',').map(Number),cx=(x+.5)*s,cy=(y+.5)*s;
      circle(ctx,cx,cy+s*.05,s*.34,'#6d6384');
      ctx.fillStyle='#ff4d9d';ctx.beginPath();ctx.arc(cx,cy,s*.3,Math.PI/2,Math.PI*1.5);ctx.fill();
      ctx.fillStyle='#4cc9f0';ctx.beginPath();ctx.arc(cx,cy,s*.3,-Math.PI/2,Math.PI/2);ctx.fill();
      circle(ctx,cx,cy,s*.12,'#ffffff');});
    // gates: closed = thick striped candy bar, open = faint dashes
    Object.keys(G.lv.gates).forEach(k=>{const [a,b,o]=k.split(','),x=+a,y=+b,grp=G.lv.gates[k];
      const closed=grp===0?G.tog===0:G.tog===1,col=grp===0?'#ff4d9d':'#4cc9f0';
      const x1=o==='h'?(x+1)*s:x*s+s*.06,y1=o==='h'?y*s+s*.06:(y+1)*s,x2=o==='h'?(x+1)*s:(x+1)*s-s*.06,y2=o==='h'?(y+1)*s-s*.06:(y+1)*s;
      ctx.lineCap='round';
      if(closed){ctx.strokeStyle=col;ctx.lineWidth=Math.max(5,s*.26);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
        ctx.strokeStyle='#ffffff';ctx.lineWidth=Math.max(2,s*.08);ctx.setLineDash([s*.1,s*.12]);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.setLineDash([]);}
      else{ctx.strokeStyle=col;ctx.globalAlpha=.45;ctx.lineWidth=Math.max(2,s*.06);ctx.setLineDash([s*.06,s*.1]);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;}
    });
  }else if(G.W.id==='giant'){
    ctx.fillStyle='#b7e4c7';ctx.fillRect(0,0,W,W);const V=G.lv.view||n,x0=Math.max(0,Math.floor(cam?cam.x:0)),y0=Math.max(0,Math.floor(cam?cam.y:0));
    ctx.font=Math.round(s*.3)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    for(let y=y0;y<Math.min(n,y0+V+2);y++)for(let x=x0;x<Math.min(n,x0+V+2);x++){if((x+y)%2){ctx.fillStyle='#a9dcbc';ctx.fillRect(x*s,y*s,s+.5,s+.5);}
      const h=((x*7919+y*104729)^(x*y*31))%41;if(h<5){ctx.globalAlpha=.85;ctx.fillText(['🌼','🌷','🍄','🌻','🦋'][h],(x+.28)*s,(y+.3)*s);ctx.globalAlpha=1;}}
    drawTrail(s,'rgba(255,255,255,.5)');
    drawWalls(G.lv.g,n,s,'#1b4332');
  }else if(G.W.id==='space'){
    ctx.fillStyle='#1b1640';ctx.fillRect(0,0,W,W);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){const h=(x*73+y*151)%17;if(h<5){ctx.globalAlpha=.4+.3*Math.sin(now/500+h);circle(ctx,x*s+s*(.2+h*.13),y*s+s*(.8-h*.1),Math.max(1,s*.03),'#ffffff');ctx.globalAlpha=1;}}
    drawTrail(s,'rgba(199,125,255,.35)');
    drawWalls(G.lv.g,n,s,'#a78bfa');
    G.lv.portals.forEach(pt=>{const col=PORTALC[pt.c%PORTALC.length];drawPortal(ctx,(pt.a.x+.5)*s,(pt.a.y+.5)*s,s*.46,col,now);drawPortal(ctx,(pt.b.x+.5)*s,(pt.b.y+.5)*s,s*.46,col,now+700);});
  }else{
    const grd=ctx.createLinearGradient(0,0,0,W);grd.addColorStop(0,'#d4f3f7');grd.addColorStop(1,'#a9e2ea');ctx.fillStyle=grd;ctx.fillRect(0,0,W,W);
    drawTrail(s,'rgba(255,255,255,.55)');
    drawWalls(G.lv.g,n,s,'#0f6f74');
    G.lv.bubbles.forEach(b=>drawBubble(ctx,(b.x+.5)*s,(b.y+.5)*s,s*.42,now));
  }
  ambient(G.W.id,s,n,W,now);
  G.stars.forEach(k=>{const [x,y]=k.split(',').map(Number),tw=1+.08*Math.sin(now/260+x*2+y);star(ctx,(x+.5)*s,(y+.5)*s,s*.28*tw);});
  const stk=G.lv.sticker;
  if(stk&&stk!=='end'&&!stickers.has(G.w+'-'+G.l)&&!(G.W.id==='toys'&&G.boxes.has(stk[0]+','+stk[1]))){
    const cx=(stk[0]+.5)*s,cy=(stk[1]+.5)*s+Math.sin(now/260)*s*.05;
    ctx.save();ctx.translate(cx,cy);ctx.rotate(Math.sin(now/500)*.15);
    ctx.fillStyle='#ffffff';rrect(ctx,-s*.36,-s*.36,s*.72,s*.72,s*.12);ctx.fill();ctx.strokeStyle='#ffc23c';ctx.lineWidth=Math.max(1.5,s*.06);ctx.stroke();
    ctx.font=Math.round(s*.5)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(WORLDS[G.w].stickers[G.l],0,s*.03);ctx.restore();
    const tw=(now/180)%6.28;circle(ctx,cx+Math.cos(tw)*s*.42,cy+Math.sin(tw)*s*.42,Math.max(1,s*.05),'#ffc23c');
  }
  if(G.W.id==='haunt'){
    const R=1.3+2.4*G.bat/G.lv.batMax;
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){const dd=Math.hypot(x-G.vis.x,y-G.vis.y);
      if(dd<=R)G.seen.add(x+','+y);
      const a=dd<R-.7?0:dd<=R?(dd-(R-.7))/.7*.85:G.seen.has(x+','+y)?.62:.94;
      if(a>0){ctx.fillStyle='rgba(12,8,24,'+a+')';ctx.fillRect(x*s-.5,y*s-.5,s+1,s+1);}}
    G.lv.batteries.forEach(b=>{ctx.globalAlpha=.25+.2*Math.sin(now/300);circle(ctx,(b.x+.5)*s,(b.y+.5)*s,s*.45,'#ffd23f');ctx.globalAlpha=1;drawBattery(ctx,(b.x+.5)*s,(b.y+.5)*s,s*.42);});
    ctx.globalAlpha=.3+.2*Math.sin(now/400);circle(ctx,(G.lv.goal.x+.5)*s,(G.lv.goal.y+.5)*s,s*.55,'#f79d3a');ctx.globalAlpha=1;
  }
  if(!(G.W.id==='munch'&&G.dots.size)&&!(G.W.id==='snake'&&G.fruitsLeft.size))goalGlow(s,now);
  G.W.goal(ctx,(G.lv.goal.x+.5)*s,(G.lv.goal.y+.5)*s,s*.42);
  if(isArc(G.W.id))arcDraw2(s,n,W,now);
  movers().forEach(f=>{const [x,y]=glide(f,...f.cells[f.i]),cx=(x+.5)*s,cy=(y+.5)*s,up=awake(f);
    if(['jungle','sea','farm','haunt'].includes(G.W.id)||G.custom){
      if(up&&(f.t||0)>=AWAKE-1){ctx.globalAlpha=.55+.45*Math.sin(now/80);} // about to nap: flicker
      if(!up)ctx.globalAlpha=.35;
      if(G.custom&&G.W.id!=='jungle')BCRE[G.w].f(ctx,cx,cy,s*.42);else if(G.W.id==='haunt')drawGhost(ctx,cx,cy,s*.44);else if(G.W.id==='jungle')drawMonkey(ctx,cx,cy,s*.42);else if(G.W.id==='farm')drawFox(ctx,cx,cy,s*.44);else drawFishFoe(ctx,cx,cy,s*.4,f.dir>0&&f.cells[0][0]!==f.cells[1][0]);
      ctx.globalAlpha=1;
      if(!up){ctx.fillStyle='#2a2140';ctx.font='bold '+Math.round(s*.34)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
        const b=Math.sin(now/300)*s*.05;ctx.fillText('z',cx+s*.25,cy-s*.28+b);ctx.font='bold '+Math.round(s*.24)+'px sans-serif';ctx.fillText('z',cx+s*.4,cy-s*.45+b);}
    }});
  if(G.W.id==='farm')G.followers.forEach((c,i)=>{const h=G.hist[i]||G.p;drawChick(ctx,(h.x+.5)*s,(h.y+.5)*s+Math.sin(now/150+i)*s*.04,s*.34);});
  if(G.W.id==='rainbow'&&G.color){ctx.globalAlpha=.8;circle(ctx,(G.vis.x+.5)*s,(G.vis.y+.5)*s,s*.48,RBC[G.color].c);ctx.globalAlpha=1;}
  if(G.W.id==='mirror'){
    if(!G.tvis)G.tvis={x:G.tw.x,y:G.tw.y};
    const tdx=G.tw.x-G.tvis.x,tdy=G.tw.y-G.tvis.y,td=Math.hypot(tdx,tdy);
    if(td>2.2){G.tvis={x:G.tw.x,y:G.tw.y};}else{const k=Math.min(1,dt/60);G.tvis.x+=tdx*k;G.tvis.y+=tdy*k;}
    const th=Math.sin(Math.min(1,td)*Math.PI)*s*.14,cx=(G.tvis.x+.5)*s,cy=(G.tvis.y+.5)*s-th;
    ctx.globalAlpha=.35;circle(ctx,cx,cy,s*.46,'#4cc9f0');ctx.globalAlpha=.8;
    ctx.save();ctx.translate(cx,cy);ctx.scale(-1,1);drawChar(ctx,C,0,0,s*.4);ctx.restore();ctx.globalAlpha=1;
    if(G.parkB){ctx.font=Math.round(s*.35)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('✨',cx+s*.3,cy-s*.35);}
    if(G.parkA){ctx.font=Math.round(s*.35)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('✨',(G.vis.x+.5)*s+s*.3,(G.vis.y+.5)*s-s*.35);}
    ctx.globalAlpha=.3;circle(ctx,(G.vis.x+.5)*s,(G.vis.y+.5)*s,s*.46,'#ff5d8f');ctx.globalAlpha=1;
  }
  fxDraw(s,now);
  const blink=(G.W.ui&&G.W.ui.still)||now<G.hurtUntil&&Math.floor(now/120)%2;
  if(!blink){
    // alive: a little breathing bob when standing, a lean and a stretch while hopping
    const calm=calmFx(),still=dist<.02&&!G.jump,bob=calm||!still?0:Math.sin(now/420)*s*.025,lean=calm?0:Math.max(-.22,Math.min(.22,(G.p.x-G.vis.x)*.6)),st=calm?0:Math.sin(Math.min(1,dist)*Math.PI)*.1;
    const cx=(G.vis.x+.5)*s+bx,cy=(G.vis.y+.5)*s-hop+by+bob;
    if(G.W.id!=='ladders'||!G.jump){ctx.fillStyle='rgba(0,0,0,.13)';ctx.beginPath();ctx.ellipse((G.vis.x+.5)*s,(G.vis.y+.5)*s+s*.36,s*.26*(1-hop/s),s*.07,0,0,7);ctx.fill();}
    ctx.save();ctx.translate(cx,cy+s*.35);ctx.rotate(lean);ctx.scale(1-st*.5+(still?Math.sin(now/420)*.015:0),1+st-(still?Math.sin(now/420)*.015:0));drawChar(ctx,C,0,-s*.35,s*.4);ctx.restore();}
  if(G.W.id==='deep')deepDraw3(s,n,W,now);

  if(G.hint&&now<G.hint.until){
    const d=G.hint.d,cx=(G.p.x+.5)*s,cy=(G.p.y+.5)*s,L=s*.95,a=[Math.PI*1.5,0,Math.PI*.5,Math.PI][d];
    ctx.save();ctx.translate(cx,cy);ctx.rotate(a);ctx.globalAlpha=.6+.4*Math.sin(now/150);
    ctx.fillStyle='#ff5d8f';ctx.beginPath();ctx.moveTo(L,0);ctx.lineTo(L-s*.35,-s*.28);ctx.lineTo(L-s*.35,s*.28);ctx.fill();
    ctx.fillRect(s*.45,-s*.1,L-s*.8,s*.2);ctx.restore();
  }
  if(cam){ctx.restore();W=cv.width;giantMini(W,now);}
  if(confetti&&G.done){
    let alive=false;const dpr=window.devicePixelRatio||1;
    confetti.forEach(p=>{p.y+=p.v;if(p.y<1.1)alive=true;ctx.fillStyle=p.c;ctx.fillRect(p.x*W,p.y*W,p.r*W,p.r*W);});
    if(!alive||matchMedia('(prefers-reduced-motion: reduce)').matches)confetti=null;
  }
}
requestAnimationFrame(frame);

