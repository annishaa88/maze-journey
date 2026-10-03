/* ================= little effects: dust, sparkles, glides, ambient life ================= */
const calmFx=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function fxAdd(o){if(!G||calmFx())return;(G.fx=G.fx||[]).push(Object.assign({t0:performance.now(),life:500},o));if(G.fx.length>120)G.fx.splice(0,G.fx.length-120);}
function sparkle(x,y,cols,count){for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,v=1.2+Math.random()*1.8;fxAdd({k:'spark',x:x+.5,y:y+.5,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1,col:cols[i%cols.length],life:650+Math.random()*300});}}
function fxDraw(s,now){
  if(!G.fx||!G.fx.length)return;
  G.fx=G.fx.filter(f=>now-f.t0<f.life);
  for(const f of G.fx){const t=(now-f.t0)/1000,e=(now-f.t0)/f.life;
    if(f.k==='dust'){ctx.globalAlpha=.35*(1-e);circle(ctx,(f.x+f.vx*t)*s,(f.y+f.vy*t)*s,s*(.06+.08*e),f.col||'#9c8fb3');}
    else if(f.k==='spark'){ctx.globalAlpha=1-e;star(ctx,(f.x+f.vx*t)*s,(f.y+f.vy*t+2.2*t*t)*s,s*.1*(1-e*.5));}
    else if(f.k==='ring'){ctx.globalAlpha=.8*(1-e);ctx.strokeStyle=f.col;ctx.lineWidth=Math.max(2,s*.1*(1-e));ctx.beginPath();ctx.arc((f.x+.5)*s,(f.y+.5)*s,s*(.3+1.6*e),0,7);ctx.stroke();}
    else if(f.k==='dot'){ctx.globalAlpha=1-e;circle(ctx,(f.x+f.vx*t)*s,(f.y+f.vy*t+1.5*t*t)*s,s*.06,f.col);}
  }
  ctx.globalAlpha=1;
}
// enemies glide between squares instead of jumping
function glide(o,x,y){
  if(o.gx==null||Math.abs(o.gx-x)+Math.abs(o.gy-y)>2.2||calmFx()){o.gx=x;o.gy=y;}
  else{const k=Math.min(1,(G.dt||16)/110);o.gx+=(x-o.gx)*k;o.gy+=(y-o.gy)*k;}
  return [o.gx,o.gy];
}
// a soft glow and a circling sparkle tell her where the goal is
function goalGlow(s,now){
  const gx=(G.lv.goal.x+.5)*s,gy=(G.lv.goal.y+.5)*s,p=.5+.5*Math.sin(now/500);
  const r=ctx.createRadialGradient(gx,gy,s*.1,gx,gy,s*(.75+.15*p));r.addColorStop(0,'rgba(255,240,170,.75)');r.addColorStop(1,'rgba(255,240,170,0)');
  ctx.fillStyle=r;ctx.beginPath();ctx.arc(gx,gy,s*(.75+.15*p),0,7);ctx.fill();
  if(!calmFx()){const a=now/600;star(ctx,gx+Math.cos(a)*s*.55,gy+Math.sin(a)*s*.55,s*.08);}
}
/* each world has a little life of its own in the background */
function ambient(id,s,n,W,now){
  if(calmFx())return;
  const H=(i,m)=>((i*9301+49297)%233280)/233280*m;   // fixed pseudo-random per item
  ctx.save();
  if(id==='ice'||id==='snow'){ctx.fillStyle='rgba(255,255,255,.9)';for(let i=0;i<20;i++){const sp=.018+H(i,1)*.02,y=((now*sp+H(i+7,W))%(W+20))-10,x=H(i,W)+Math.sin(now/1400+i)*s*.35;circle(ctx,x,y,Math.max(1,s*(.035+H(i+3,1)*.04)),'rgba(255,255,255,.95)');}}
  else if(id==='castle'||id==='mirror'||id==='rainbow'||id==='memory'||id==='ball'||id==='carpet'||id==='wand'||id==='potion'||id==='flykeys'){const cols=id==='rainbow'?RBC.slice(1).map(c=>c.c):['#ffd23f','#ffffff','#ffb3c8'];
    for(let i=0;i<12;i++){const a=Math.max(0,Math.sin(now/700+i*1.7));if(a<.2)continue;ctx.globalAlpha=a*.8;star(ctx,H(i,W),(H(i+11,W)-now*.004*(id==='rainbow'?1:0)%W+W)%W,s*.07*a);ctx.fillStyle=cols[i%cols.length];}
    if(id==='mirror'){const t=(now%6000)/6000;if(t<.35){const x=(t/.35)*W*1.6-W*.3;ctx.globalAlpha=.25;ctx.fillStyle='#ffffff';ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+s*.8,0);ctx.lineTo(x+s*.8-W*.4,W);ctx.lineTo(x-W*.4,W);ctx.fill();}}}
  else if(id==='sea'||id==='beach'||id==='lagoon'){
    for(let i=0;i<10;i++){const y=W-((now*(.015+H(i,1)*.015)+H(i+5,W))%(W+20)),x=H(i,W)+Math.sin(now/600+i)*s*.15;ctx.globalAlpha=.5;ctx.strokeStyle='#ffffff';ctx.lineWidth=Math.max(1,s*.025);ctx.beginPath();ctx.arc(x,y,s*(.04+H(i+2,1)*.05),0,7);ctx.stroke();}
    const t=(now%14000)/14000,fy=H(Math.floor(now/14000),W*.8)+W*.1;ctx.globalAlpha=.22;ctx.fillStyle='#0f4c5c';const fx=t*(W+s*2)-s;
    ctx.beginPath();ctx.ellipse(fx,fy,s*.35,s*.16,0,0,7);ctx.fill();ctx.beginPath();ctx.moveTo(fx-s*.3,fy);ctx.lineTo(fx-s*.55,fy-s*.15);ctx.lineTo(fx-s*.55,fy+s*.15);ctx.fill();}
  else if(id==='jungle'||id==='forest'&&false){for(let i=0;i<9;i++){const y=((now*(.02+H(i,1)*.015)+H(i+3,W))%(W+30))-15,x=H(i,W)+Math.sin(now/900+i)*s*.6;
    ctx.globalAlpha=.55;ctx.fillStyle=i%2?'#5cb85c':'#8ac926';ctx.save();ctx.translate(x,y);ctx.rotate(now/700+i);ctx.beginPath();ctx.ellipse(0,0,s*.13,s*.06,0,0,7);ctx.fill();ctx.restore();}}
  else if(id==='forest'||id==='haunt'||id==='ladders'||id==='hansel'){for(let i=0;i<10;i++){const x=H(i,W)+Math.sin(now/1300+i*2)*s*.8,y=H(i+9,W)+Math.cos(now/1700+i)*s*.6,a=.4+.6*Math.max(0,Math.sin(now/400+i*1.3));
    ctx.globalAlpha=a*.35;circle(ctx,x,y,s*.14,id==='ladders'?'#ffffff':'#fff59d');ctx.globalAlpha=a;circle(ctx,x,y,s*.045,id==='ladders'?'#ffffff':'#fff176');}}
  else if(id==='space'||id==='gravity'){const t=(now%7000)/7000;if(t<.15){const e=t/.15,x0=H(Math.floor(now/7000),W),y0=H(Math.floor(now/7000)+4,W*.5);
    ctx.strokeStyle='rgba(255,255,255,'+(1-e)+')';ctx.lineWidth=Math.max(1,s*.05);ctx.beginPath();ctx.moveTo(x0+e*W*.4,y0+e*W*.25);ctx.lineTo(x0+e*W*.4-s*1.2,y0+e*W*.25-s*.75);ctx.stroke();}}
  else if(id==='candy'||id==='paint'){const cols=['#ff5d8f','#4cc9f0','#ffd23f','#8ac926'];for(let i=0;i<16;i++){const y=((now*(.012+H(i,1)*.01)+H(i+2,W))%(W+20))-10,x=H(i,W);
    ctx.globalAlpha=.6;ctx.fillStyle=cols[i%4];ctx.save();ctx.translate(x,y);ctx.rotate(now/800+i);ctx.fillRect(-s*.07,-s*.025,s*.14,s*.05);ctx.restore();}}
  else if(id==='farm'||id==='mines'||id==='sheep'||id==='savanna'||id==='redhood'){for(let i=0;i<3;i++){const x=(H(i,W)+now*.03*(i%2?1:-1)%W+W)%W,y=H(i+4,W*.8)+Math.sin(now/500+i)*s*.5,f=Math.abs(Math.sin(now/90+i));
    ctx.globalAlpha=.85;ctx.fillStyle=['#ffafcc','#a2d2ff','#ffd23f'][i];ctx.beginPath();ctx.ellipse(x-s*.08,y,s*.1*f+.5,s*.13,0,0,7);ctx.ellipse(x+s*.08,y,s*.1*f+.5,s*.13,0,0,7);ctx.fill();circle(ctx,x,y,s*.03,'#2a2140');}}
  else if(id==='toys'||id==='toyroom'){for(let i=0;i<8;i++){const x=H(i,W)+Math.sin(now/2000+i)*s,y=H(i+6,W)+Math.cos(now/2300+i)*s*.6;ctx.globalAlpha=.35;circle(ctx,x,y,Math.max(1,s*.035),'#ffffff');}}
  ctx.restore();ctx.globalAlpha=1;
}

