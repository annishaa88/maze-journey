/* ================= drawing helpers ================= */
// an emoji (or any text) on the board, `px` tall; centre=1 also centres it on x,y
function glyph(t,x,y,px,centre){ctx.font=Math.round(px)+'px sans-serif';if(centre){ctx.textAlign='center';ctx.textBaseline='middle';}ctx.fillText(t,x,y);}
function circle(c,x,y,r,f){if(!(r>0))return;c.fillStyle=f;c.beginPath();c.arc(x,y,r,0,7);c.fill();}
function eyes(c,x,y,r,dx,sz){circle(c,x-dx*r,y,sz*r,'#2a2140');circle(c,x+dx*r,y,sz*r,'#2a2140');circle(c,x-dx*r+sz*r*.35,y-sz*r*.35,sz*r*.35,'#fff');circle(c,x+dx*r+sz*r*.35,y-sz*r*.35,sz*r*.35,'#fff');}

function drawKitten(c,x,y,r){
  c.fillStyle='#f4a340';
  c.beginPath();c.moveTo(x-r*.72,y-r*.25);c.lineTo(x-r*.55,y-r*.95);c.lineTo(x-r*.12,y-r*.55);c.fill();
  c.beginPath();c.moveTo(x+r*.72,y-r*.25);c.lineTo(x+r*.55,y-r*.95);c.lineTo(x+r*.12,y-r*.55);c.fill();
  c.beginPath();c.ellipse(x,y+r*.05,r*.78,r*.68,0,0,7);c.fill();
  c.fillStyle='#ffb3c1';
  c.beginPath();c.moveTo(x-r*.58,y-r*.4);c.lineTo(x-r*.52,y-r*.78);c.lineTo(x-r*.28,y-r*.52);c.fill();
  c.beginPath();c.moveTo(x+r*.58,y-r*.4);c.lineTo(x+r*.52,y-r*.78);c.lineTo(x+r*.28,y-r*.52);c.fill();
  c.fillStyle='#c46f16';[-.3,0,.3].forEach(d=>c.fillRect(x+d*r-r*.05,y-r*.6,r*.1,r*.22));
  eyes(c,x,y,r,.28,.12);
  c.fillStyle='#ff5d8f';c.beginPath();c.moveTo(x-r*.08,y+r*.2);c.lineTo(x+r*.08,y+r*.2);c.lineTo(x,y+r*.3);c.fill();
  c.strokeStyle='#2a2140';c.lineWidth=Math.max(1,r*.05);
  c.beginPath();[[-1,-.05],[-1,.1],[1,-.05],[1,.1]].forEach(([s,dy])=>{c.moveTo(x+s*r*.35,y+r*.28);c.lineTo(x+s*r*.85,y+r*(.22+dy));});c.stroke();
}
function drawBunny(c,x,y,r){
  c.fillStyle='#eae6f5';
  c.beginPath();c.ellipse(x-r*.28,y-r*.7,r*.17,r*.42,-.15,0,7);c.ellipse(x+r*.28,y-r*.7,r*.17,r*.42,.15,0,7);c.fill();
  c.fillStyle='#ffb3c1';
  c.beginPath();c.ellipse(x-r*.28,y-r*.7,r*.08,r*.3,-.15,0,7);c.ellipse(x+r*.28,y-r*.7,r*.08,r*.3,.15,0,7);c.fill();
  circle(c,x,y+r*.12,r*.66,'#eae6f5');c.strokeStyle='#b9b0d6';c.lineWidth=Math.max(1,r*.06);c.stroke();
  eyes(c,x,y+r*.02,r,.24,.1);
  circle(c,x-r*.42,y+r*.25,r*.1,'#ff9eb5');circle(c,x+r*.42,y+r*.25,r*.1,'#ff9eb5');
  circle(c,x,y+r*.24,r*.07,'#ff5d8f');
  c.fillStyle='#fff';c.fillRect(x-r*.09,y+r*.34,r*.08,r*.12);c.fillRect(x+r*.01,y+r*.34,r*.08,r*.12);
}
function drawPenguin(c,x,y,r){
  c.fillStyle='#24344d';c.beginPath();c.ellipse(x,y+r*.05,r*.66,r*.82,0,0,7);c.fill();
  c.fillStyle='#fff';c.beginPath();c.ellipse(x,y+r*.2,r*.46,r*.6,0,0,7);c.fill();
  circle(c,x-r*.2,y-r*.3,r*.2,'#fff');circle(c,x+r*.2,y-r*.3,r*.2,'#fff');
  circle(c,x-r*.18,y-r*.3,r*.09,'#2a2140');circle(c,x+r*.18,y-r*.3,r*.09,'#2a2140');
  c.fillStyle='#ff9f1c';c.beginPath();c.moveTo(x-r*.13,y-r*.12);c.lineTo(x+r*.13,y-r*.12);c.lineTo(x,y+r*.05);c.fill();
  c.beginPath();c.ellipse(x-r*.25,y+r*.85,r*.18,r*.08,0,0,7);c.ellipse(x+r*.25,y+r*.85,r*.18,r*.08,0,0,7);c.fill();
  circle(c,x-r*.36,y-r*.08,r*.07,'#ff9eb5');circle(c,x+r*.36,y-r*.08,r*.07,'#ff9eb5');
}
function drawPuppy(c,x,y,r){
  c.fillStyle='#8b5a2b';
  c.beginPath();c.ellipse(x-r*.62,y-r*.05,r*.2,r*.45,.35,0,7);c.ellipse(x+r*.62,y-r*.05,r*.2,r*.45,-.35,0,7);c.fill();
  circle(c,x,y,r*.64,'#d9a066');
  circle(c,x+r*.25,y-r*.25,r*.2,'#c08040');
  c.fillStyle='#f6dfb9';c.beginPath();c.ellipse(x,y+r*.28,r*.34,r*.26,0,0,7);c.fill();
  eyes(c,x,y-r*.1,r,.26,.11);
  c.fillStyle='#2a2140';c.beginPath();c.ellipse(x,y+r*.18,r*.11,r*.08,0,0,7);c.fill();
  c.fillStyle='#ff7a9c';c.beginPath();c.ellipse(x,y+r*.44,r*.08,r*.1,0,0,7);c.fill();
}
function drawUnicorn(c,x,y,r){
  c.fillStyle='#ffc23c';c.beginPath();c.moveTo(x-r*.13,y-r*.45);c.lineTo(x+r*.13,y-r*.45);c.lineTo(x,y-r*1.02);c.fill();
  c.strokeStyle='#e0a010';c.lineWidth=Math.max(1,r*.04);c.beginPath();c.moveTo(x-r*.08,y-r*.6);c.lineTo(x+r*.09,y-r*.66);c.moveTo(x-r*.05,y-r*.78);c.lineTo(x+r*.06,y-r*.82);c.stroke();
  c.fillStyle='#fff';c.beginPath();c.moveTo(x-r*.5,y-r*.3);c.lineTo(x-r*.42,y-r*.72);c.lineTo(x-r*.22,y-r*.42);c.fill();
  c.beginPath();c.moveTo(x+r*.5,y-r*.3);c.lineTo(x+r*.42,y-r*.72);c.lineTo(x+r*.22,y-r*.42);c.fill();
  circle(c,x,y+r*.05,r*.62,'#fff');c.strokeStyle='#d8c9f2';c.lineWidth=Math.max(1,r*.06);c.stroke();
  [['#b388eb',-.62,-.2],['#ff8fb8',-.66,.12],['#7fd3f0',-.56,.42],['#b388eb',-.3,-.52]].forEach(([f,dx,dy])=>circle(c,x+dx*r,y+dy*r,r*.2,f));
  c.strokeStyle='#2a2140';c.lineWidth=Math.max(1.5,r*.07);c.lineCap='round';
  c.beginPath();c.arc(x-r*.18,y,r*.1,Math.PI*.1,Math.PI*.9);c.moveTo(x+r*.34,y+r*.02);c.arc(x+r*.24,y,r*.1,Math.PI*.1,Math.PI*.9);c.stroke();
  circle(c,x-r*.34,y+r*.22,r*.09,'#ffb3c8');circle(c,x+r*.4,y+r*.22,r*.09,'#ffb3c8');
  c.beginPath();c.arc(x+r*.03,y+r*.28,r*.1,Math.PI*.15,Math.PI*.85);c.stroke();
}
function drawOctopus(c,x,y,r){
  c.fillStyle='#c77dff';
  for(let i=0;i<5;i++){const tx=x+(i-2)*r*.28;c.beginPath();c.ellipse(tx,y+r*.62,r*.12,r*.3,(i-2)*.25,0,7);c.fill();}
  c.beginPath();c.ellipse(x,y-r*.05,r*.68,r*.64,0,0,7);c.fill();
  circle(c,x-r*.3,y-r*.35,r*.1,'#dfb3ff');circle(c,x+r*.18,y-r*.45,r*.07,'#dfb3ff');
  circle(c,x-r*.24,y+r*.02,r*.17,'#fff');circle(c,x+r*.24,y+r*.02,r*.17,'#fff');
  circle(c,x-r*.21,y+r*.04,r*.09,'#2a2140');circle(c,x+r*.27,y+r*.04,r*.09,'#2a2140');
  circle(c,x-r*.44,y+r*.22,r*.08,'#ff9eb5');circle(c,x+r*.44,y+r*.22,r*.08,'#ff9eb5');
}
function drawPanda(c,x,y,r){
  circle(c,x-r*.5,y-r*.48,r*.22,'#2a2140');circle(c,x+r*.5,y-r*.48,r*.22,'#2a2140');
  circle(c,x,y+r*.05,r*.64,'#ffffff');c.strokeStyle='#d8d4e2';c.lineWidth=Math.max(1,r*.05);c.stroke();
  c.fillStyle='#2a2140';c.beginPath();c.ellipse(x-r*.25,y,r*.15,r*.21,.5,0,7);c.ellipse(x+r*.25,y,r*.15,r*.21,-.5,0,7);c.fill();
  circle(c,x-r*.24,y-r*.02,r*.06,'#fff');circle(c,x+r*.24,y-r*.02,r*.06,'#fff');
  c.fillStyle='#2a2140';c.beginPath();c.ellipse(x,y+r*.24,r*.1,r*.07,0,0,7);c.fill();
  circle(c,x-r*.42,y+r*.28,r*.08,'#ffb3c8');circle(c,x+r*.42,y+r*.28,r*.08,'#ffb3c8');
}
function drawAlien(c,x,y,r){
  c.strokeStyle='#4caf6a';c.lineWidth=Math.max(1.5,r*.07);c.beginPath();
  c.moveTo(x-r*.22,y-r*.45);c.lineTo(x-r*.38,y-r*.88);c.moveTo(x+r*.22,y-r*.45);c.lineTo(x+r*.38,y-r*.88);c.stroke();
  circle(c,x-r*.38,y-r*.9,r*.1,'#ff5d8f');circle(c,x+r*.38,y-r*.9,r*.1,'#ffc23c');
  c.fillStyle='#7ae582';c.beginPath();c.ellipse(x,y+r*.05,r*.62,r*.58,0,0,7);c.fill();
  c.fillStyle='#2a2140';c.beginPath();c.ellipse(x-r*.24,y-r*.02,r*.15,r*.2,-.3,0,7);c.ellipse(x+r*.24,y-r*.02,r*.15,r*.2,.3,0,7);c.fill();
  circle(c,x-r*.2,y-r*.1,r*.06,'#fff');circle(c,x+r*.28,y-r*.1,r*.06,'#fff');
  c.strokeStyle='#2a2140';c.lineWidth=Math.max(1,r*.05);c.beginPath();c.arc(x,y+r*.25,r*.13,Math.PI*.15,Math.PI*.85);c.stroke();
  circle(c,x-r*.42,y+r*.2,r*.07,'#ff9eb5');circle(c,x+r*.42,y+r*.2,r*.07,'#ff9eb5');
}
function drawMonkey(c,x,y,r){
  circle(c,x-r*.6,y-r*.05,r*.2,'#8d5524');circle(c,x+r*.6,y-r*.05,r*.2,'#8d5524');
  circle(c,x-r*.6,y-r*.05,r*.11,'#f1c27d');circle(c,x+r*.6,y-r*.05,r*.11,'#f1c27d');
  circle(c,x,y,r*.55,'#8d5524');
  circle(c,x-r*.17,y-r*.08,r*.18,'#f1c27d');circle(c,x+r*.17,y-r*.08,r*.18,'#f1c27d');
  c.fillStyle='#f1c27d';c.beginPath();c.ellipse(x,y+r*.2,r*.3,r*.22,0,0,7);c.fill();
  circle(c,x-r*.17,y-r*.08,r*.07,'#2a2140');circle(c,x+r*.17,y-r*.08,r*.07,'#2a2140');
  c.strokeStyle='#2a2140';c.lineWidth=Math.max(1,r*.05);c.beginPath();c.arc(x,y+r*.18,r*.12,Math.PI*.15,Math.PI*.85);c.stroke();
}
function drawBananas(c,x,y,r){
  c.strokeStyle='#6b4f1d';c.lineWidth=Math.max(2,r*.1);c.beginPath();c.moveTo(x,y-r*.35);c.lineTo(x,y-r*.7);c.stroke();
  [-.55,0,.55].forEach(a=>{c.save();c.translate(x,y-r*.35);c.rotate(a);
    c.fillStyle='#ffd23f';c.strokeStyle='#c99a00';c.lineWidth=Math.max(1,r*.05);
    c.beginPath();c.arc(-r*.28,r*.15,r*.55,-.35,1.2);c.arc(-r*.36,r*.05,r*.5,1.2,-.35,true);c.closePath();c.fill();c.stroke();c.restore();});
  c.fillStyle='#57cc99';c.beginPath();c.ellipse(x-r*.25,y-r*.72,r*.3,r*.1,-.4,0,7);c.ellipse(x+r*.25,y-r*.72,r*.3,r*.1,.4,0,7);c.fill();
}
function drawRocket(c,x,y,r){
  c.fillStyle='#ff9e00';c.beginPath();c.moveTo(x-r*.16,y+r*.55);c.lineTo(x,y+r*.95);c.lineTo(x+r*.16,y+r*.55);c.fill();
  c.fillStyle='#ff5d8f';c.beginPath();c.moveTo(x-r*.3,y+r*.2);c.lineTo(x-r*.5,y+r*.62);c.lineTo(x-r*.2,y+r*.5);c.fill();
  c.beginPath();c.moveTo(x+r*.3,y+r*.2);c.lineTo(x+r*.5,y+r*.62);c.lineTo(x+r*.2,y+r*.5);c.fill();
  c.fillStyle='#f4f4ff';c.beginPath();c.ellipse(x,y,r*.3,r*.62,0,0,7);c.fill();
  c.fillStyle='#ff5d8f';c.beginPath();c.ellipse(x,y-r*.42,r*.2,r*.22,0,Math.PI,0);c.fill();
  circle(c,x,y-r*.05,r*.14,'#4cc9f0');c.strokeStyle='#8d99ae';c.lineWidth=Math.max(1,r*.05);c.stroke();
}
function drawBear(c,x,y,r){
  circle(c,x-r*.5,y-r*.45,r*.22,'#a86b3c');circle(c,x+r*.5,y-r*.45,r*.22,'#a86b3c');
  circle(c,x-r*.5,y-r*.45,r*.11,'#f1c9a5');circle(c,x+r*.5,y-r*.45,r*.11,'#f1c9a5');
  circle(c,x,y+r*.05,r*.64,'#c68b59');
  c.fillStyle='#f1d3b3';c.beginPath();c.ellipse(x,y+r*.25,r*.3,r*.22,0,0,7);c.fill();
  eyes(c,x,y-r*.06,r,.25,.1);
  c.fillStyle='#2a2140';c.beginPath();c.ellipse(x,y+r*.16,r*.1,r*.07,0,0,7);c.fill();
  c.strokeStyle='#2a2140';c.lineWidth=Math.max(1,r*.05);c.beginPath();c.arc(x-r*.07,y+r*.26,r*.07,0,Math.PI*.9);c.moveTo(x+r*.14,y+r*.26);c.arc(x+r*.07,y+r*.26,r*.07,0,Math.PI*.9);c.stroke();
  circle(c,x-r*.42,y+r*.18,r*.08,'#ff9eb5');circle(c,x+r*.42,y+r*.18,r*.08,'#ff9eb5');
}
function drawCake(c,x,y,r){
  c.fillStyle='#ffb4a2';c.beginPath();c.moveTo(x-r*.55,y);c.lineTo(x+r*.55,y);c.lineTo(x+r*.42,y+r*.7);c.lineTo(x-r*.42,y+r*.7);c.closePath();c.fill();
  c.strokeStyle='#e5989b';c.lineWidth=Math.max(1,r*.05);c.beginPath();for(let i=-2;i<=2;i++){c.moveTo(x+i*r*.2,y+r*.05);c.lineTo(x+i*r*.16,y+r*.66);}c.stroke();
  [[-.35,-.05,.28],[.35,-.05,.28],[0,-.15,.34],[-.15,-.42,.24],[.15,-.42,.24]].forEach(([dx,dy,rr])=>circle(c,x+dx*r,y+dy*r,rr*r,'#ffc8dd'));
  circle(c,x,y-r*.66,r*.14,'#e63946');circle(c,x-r*.04,y-r*.7,r*.04,'#fff');
  [['#4cc9f0',-.3,-.2],['#ffd23f',.25,-.3],['#80ed99',.05,0],['#c77dff',-.1,-.4],['#4cc9f0',.38,-.02]].forEach(([f,dx,dy])=>{c.fillStyle=f;c.fillRect(x+dx*r,y+dy*r,r*.1,r*.04);});
}
function rrect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();}
function drawLamb(c,x,y,r){
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2;circle(c,x+Math.cos(a)*r*.52,y+Math.sin(a)*r*.5,r*.24,'#f7f5fb');}
  c.strokeStyle='#dcd6ea';c.lineWidth=Math.max(1,r*.03);
  c.fillStyle='#e8c4a8';c.beginPath();c.ellipse(x-r*.5,y+r*.02,r*.2,r*.1,.3,0,7);c.ellipse(x+r*.5,y+r*.02,r*.2,r*.1,-.3,0,7);c.fill();
  c.fillStyle='#fbe3d0';c.beginPath();c.ellipse(x,y+r*.1,r*.36,r*.42,0,0,7);c.fill();
  circle(c,x-r*.12,y-r*.35,r*.16,'#ffffff');circle(c,x+r*.12,y-r*.38,r*.16,'#ffffff');circle(c,x,y-r*.45,r*.16,'#ffffff');
  eyes(c,x,y+r*.04,r,.15,.08);
  c.fillStyle='#ff8fab';c.beginPath();c.ellipse(x,y+r*.26,r*.07,r*.05,0,0,7);c.fill();
  circle(c,x-r*.24,y+r*.24,r*.06,'#ffb3c8');circle(c,x+r*.24,y+r*.24,r*.06,'#ffb3c8');
}
function drawOwl(c,x,y,r){
  c.fillStyle='#a0714f';
  c.beginPath();c.moveTo(x-r*.5,y-r*.35);c.lineTo(x-r*.42,y-r*.82);c.lineTo(x-r*.18,y-r*.5);c.fill();
  c.beginPath();c.moveTo(x+r*.5,y-r*.35);c.lineTo(x+r*.42,y-r*.82);c.lineTo(x+r*.18,y-r*.5);c.fill();
  c.beginPath();c.ellipse(x,y+r*.05,r*.6,r*.68,0,0,7);c.fill();
  c.fillStyle='#e9c89f';c.beginPath();c.ellipse(x,y+r*.35,r*.34,r*.3,0,0,7);c.fill();
  [-1,1].forEach(sd=>{circle(c,x+sd*r*.21,y-r*.12,r*.21,'#ffb703');circle(c,x+sd*r*.21,y-r*.12,r*.16,'#fff');circle(c,x+sd*r*.2,y-r*.1,r*.09,'#2a2140');circle(c,x+sd*r*.17,y-r*.14,r*.035,'#fff');});
  c.fillStyle='#fb8500';c.beginPath();c.moveTo(x-r*.07,y+r*.04);c.lineTo(x+r*.07,y+r*.04);c.lineTo(x,y+r*.18);c.fill();
}
function drawRobot(c,x,y,r){
  c.strokeStyle='#8d99ae';c.lineWidth=Math.max(1.5,r*.06);c.beginPath();c.moveTo(x,y-r*.45);c.lineTo(x,y-r*.78);c.stroke();circle(c,x,y-r*.82,r*.1,'#ff5d8f');
  c.fillStyle='#c5ccd8';rrect(c,x-r*.58,y-r*.48,r*1.16,r*.98,r*.22);c.fill();c.strokeStyle='#8d99ae';c.lineWidth=Math.max(1,r*.05);c.stroke();
  circle(c,x-r*.62,y,r*.1,'#8d99ae');circle(c,x+r*.62,y,r*.1,'#8d99ae');
  circle(c,x-r*.24,y-r*.1,r*.15,'#2a2140');circle(c,x+r*.24,y-r*.1,r*.15,'#2a2140');circle(c,x-r*.24,y-r*.1,r*.09,'#4cc9f0');circle(c,x+r*.24,y-r*.1,r*.09,'#4cc9f0');
  c.fillStyle='#2a2140';rrect(c,x-r*.22,y+r*.16,r*.44,r*.16,r*.05);c.fill();
  c.fillStyle='#ffffff';for(let i=0;i<3;i++)c.fillRect(x-r*.17+i*r*.14,y+r*.19,r*.06,r*.1);
  circle(c,x-r*.42,y+r*.18,r*.07,'#ffb3c8');circle(c,x+r*.42,y+r*.18,r*.07,'#ffb3c8');
}
function drawHen(c,x,y,r){
  c.fillStyle='#b5835a';c.beginPath();c.ellipse(x,y+r*.55,r*.72,r*.2,0,0,7);c.fill();
  c.fillStyle='#ffffff';c.beginPath();c.ellipse(x+r*.1,y+r*.2,r*.55,r*.42,0,0,7);c.fill();c.strokeStyle='#ddd';c.lineWidth=Math.max(1,r*.04);c.stroke();
  c.beginPath();c.moveTo(x+r*.55,y+r*.05);c.lineTo(x+r*.8,y-r*.25);c.lineTo(x+r*.72,y+r*.2);c.fill();
  circle(c,x-r*.3,y-r*.25,r*.27,'#ffffff');
  circle(c,x-r*.38,y-r*.55,r*.09,'#e63946');circle(c,x-r*.26,y-r*.58,r*.1,'#e63946');circle(c,x-r*.15,y-r*.52,r*.08,'#e63946');
  c.fillStyle='#ff9f1c';c.beginPath();c.moveTo(x-r*.55,y-r*.28);c.lineTo(x-r*.75,y-r*.2);c.lineTo(x-r*.55,y-r*.14);c.fill();
  circle(c,x-r*.36,y-r*.3,r*.05,'#2a2140');
  c.fillStyle='#f0f0f0';c.beginPath();c.ellipse(x+r*.15,y+r*.22,r*.28,r*.18,-.3,0,7);c.fill();
}
function drawChick(c,x,y,r){
  circle(c,x,y+r*.08,r*.55,'#ffd23f');circle(c,x-r*.05,y-r*.28,r*.34,'#ffd23f');
  c.fillStyle='#ff9f1c';c.beginPath();c.moveTo(x-r*.3,y-r*.3);c.lineTo(x-r*.52,y-r*.22);c.lineTo(x-r*.3,y-r*.16);c.fill();
  circle(c,x-r*.14,y-r*.32,r*.06,'#2a2140');
  c.fillStyle='#f4b400';c.beginPath();c.ellipse(x+r*.2,y+r*.12,r*.2,r*.12,.5,0,7);c.fill();
}
function drawFox(c,x,y,r){
  c.fillStyle='#f08a24';
  c.beginPath();c.moveTo(x-r*.5,y-r*.2);c.lineTo(x-r*.45,y-r*.75);c.lineTo(x-r*.12,y-r*.4);c.fill();
  c.beginPath();c.moveTo(x+r*.5,y-r*.2);c.lineTo(x+r*.45,y-r*.75);c.lineTo(x+r*.12,y-r*.4);c.fill();
  circle(c,x,y,r*.52,'#f08a24');
  c.fillStyle='#fff';c.beginPath();c.moveTo(x-r*.5,y+r*.02);c.quadraticCurveTo(x,y+r*.7,x+r*.5,y+r*.02);c.quadraticCurveTo(x,y+r*.25,x-r*.5,y+r*.02);c.fill();
  circle(c,x-r*.2,y-r*.08,r*.07,'#2a2140');circle(c,x+r*.2,y-r*.08,r*.07,'#2a2140');circle(c,x,y+r*.2,r*.07,'#2a2140');
}
const RBC=[null,{c:'#ff595e',m:'אדום',f:'אדומה'},{c:'#ffca3a',m:'צהוב',f:'צהובה'},{c:'#1982c4',m:'כחול',f:'כחולה'},{c:'#8ac926',m:'ירוק',f:'ירוקה'}];
function drawBucket(c,x,y,r,col){
  c.strokeStyle='#8d99ae';c.lineWidth=Math.max(1.5,r*.06);c.beginPath();c.arc(x,y-r*.2,r*.42,Math.PI*1.1,Math.PI*1.9);c.stroke();
  c.fillStyle='#e9ecf2';c.beginPath();c.moveTo(x-r*.45,y-r*.2);c.lineTo(x+r*.45,y-r*.2);c.lineTo(x+r*.35,y+r*.55);c.lineTo(x-r*.35,y+r*.55);c.closePath();c.fill();c.stroke();
  c.fillStyle=col;c.beginPath();c.ellipse(x,y-r*.2,r*.45,r*.13,0,0,7);c.fill();
  c.beginPath();c.moveTo(x-r*.3,y-r*.2);c.lineTo(x-r*.3,y+r*.15);c.arc(x-r*.24,y+r*.15,r*.06,Math.PI,0,true);c.lineTo(x-r*.18,y-r*.2);c.fill();
}
function drawRainbowEnd(c,x,y,r){
  const cols=['#ff595e','#ffca3a','#8ac926','#1982c4','#6a4c93'];
  c.lineWidth=Math.max(2,r*.11);c.lineCap='butt';
  cols.forEach((col,i)=>{c.strokeStyle=col;c.beginPath();c.arc(x,y+r*.35,r*(.78-i*.11),Math.PI,0);c.stroke();});
  [[-.62,.4],[.62,.4]].forEach(([dx,dy])=>{circle(c,x+dx*r,y+dy*r,r*.2,'#ffffff');circle(c,x+dx*r-r*.15,y+dy*r+r*.06,r*.15,'#ffffff');circle(c,x+dx*r+r*.15,y+dy*r+r*.06,r*.15,'#ffffff');});
  circle(c,x,y+r*.42,r*.16,'#ffc23c');
}
function drawSquirrel(c,x,y,r){
  circle(c,x+r*.55,y-r*.15,r*.45,'#b8692f');circle(c,x+r*.58,y-r*.18,r*.28,'#d98c4a');
  c.fillStyle='#c47a3a';c.beginPath();c.moveTo(x-r*.5,y-r*.3);c.lineTo(x-r*.42,y-r*.8);c.lineTo(x-r*.15,y-r*.45);c.fill();
  c.beginPath();c.moveTo(x+r*.3,y-r*.4);c.lineTo(x+r*.35,y-r*.85);c.lineTo(x+r*.05,y-r*.5);c.fill();
  circle(c,x-r*.08,y+r*.05,r*.56,'#d98c4a');
  c.fillStyle='#f6dfc1';c.beginPath();c.ellipse(x-r*.08,y+r*.25,r*.3,r*.24,0,0,7);c.fill();
  eyes(c,x-r*.08,y-r*.05,r,.22,.1);circle(c,x-r*.08,y+r*.14,r*.07,'#2a2140');
  circle(c,x-r*.42,y+r*.18,r*.07,'#ff9eb5');circle(c,x+r*.26,y+r*.18,r*.07,'#ff9eb5');
}
function drawTurtle(c,x,y,r){
  circle(c,x,y+r*.05,r*.68,'#4f9d3a');
  [[0,-.35],[-.35,-.05],[.35,-.05],[-.2,.35],[.2,.35]].forEach(([dx,dy])=>circle(c,x+dx*r,y+dy*r,r*.16,'#7cc56a'));
  c.fillStyle='#a8e07a';c.beginPath();c.ellipse(x,y+r*.18,r*.4,r*.34,0,0,7);c.fill();
  eyes(c,x,y+r*.08,r,.17,.1);
  c.strokeStyle='#2a2140';c.lineWidth=Math.max(1,r*.05);c.beginPath();c.arc(x,y+r*.25,r*.12,Math.PI*.15,Math.PI*.85);c.stroke();
  circle(c,x-r*.28,y+r*.28,r*.06,'#ff9eb5');circle(c,x+r*.28,y+r*.28,r*.06,'#ff9eb5');
}
function drawGiraffe(c,x,y,r){
  c.strokeStyle='#a0703f';c.lineWidth=Math.max(2,r*.08);c.beginPath();c.moveTo(x-r*.18,y-r*.45);c.lineTo(x-r*.22,y-r*.82);c.moveTo(x+r*.18,y-r*.45);c.lineTo(x+r*.22,y-r*.82);c.stroke();
  circle(c,x-r*.22,y-r*.85,r*.09,'#a0703f');circle(c,x+r*.22,y-r*.85,r*.09,'#a0703f');
  c.fillStyle='#f4c95d';c.beginPath();c.ellipse(x-r*.55,y-r*.3,r*.2,r*.1,-.4,0,7);c.ellipse(x+r*.55,y-r*.3,r*.2,r*.1,.4,0,7);c.fill();
  c.beginPath();c.ellipse(x,y,r*.5,r*.6,0,0,7);c.fill();
  [[-.28,-.3,.1],[.3,-.18,.08],[-.1,-.45,.07],[.25,.1,.07]].forEach(([dx,dy,rr])=>circle(c,x+dx*r,y+dy*r,rr*r,'#d9973a'));
  c.fillStyle='#fbe3b5';c.beginPath();c.ellipse(x,y+r*.35,r*.34,r*.22,0,0,7);c.fill();
  circle(c,x-r*.1,y+r*.33,r*.04,'#8a5a2b');circle(c,x+r*.1,y+r*.33,r*.04,'#8a5a2b');
  eyes(c,x,y-r*.05,r,.2,.09);
}
function drawBat(c,x,y,r){
  c.fillStyle='#4a3b73';
  [-1,1].forEach(sd=>{c.beginPath();c.moveTo(x+sd*r*.35,y-r*.2);c.lineTo(x+sd*r*1.0,y-r*.35);c.lineTo(x+sd*r*.9,y+r*.1);c.lineTo(x+sd*r*.72,y);c.lineTo(x+sd*r*.62,y+r*.22);c.lineTo(x+sd*r*.4,y+r*.15);c.closePath();c.fill();});
  c.fillStyle='#5e4b8b';c.beginPath();c.moveTo(x-r*.42,y-r*.25);c.lineTo(x-r*.35,y-r*.78);c.lineTo(x-r*.12,y-r*.45);c.fill();
  c.beginPath();c.moveTo(x+r*.42,y-r*.25);c.lineTo(x+r*.35,y-r*.78);c.lineTo(x+r*.12,y-r*.45);c.fill();
  circle(c,x,y,r*.5,'#5e4b8b');
  circle(c,x-r*.18,y-r*.05,r*.15,'#fff');circle(c,x+r*.18,y-r*.05,r*.15,'#fff');circle(c,x-r*.16,y-r*.03,r*.08,'#2a2140');circle(c,x+r*.2,y-r*.03,r*.08,'#2a2140');
  c.fillStyle='#fff';c.beginPath();c.moveTo(x-r*.1,y+r*.2);c.lineTo(x-r*.05,y+r*.32);c.lineTo(x,y+r*.2);c.moveTo(x+r*.02,y+r*.2);c.lineTo(x+r*.07,y+r*.32);c.lineTo(x+r*.12,y+r*.2);c.fill();
  circle(c,x-r*.34,y+r*.15,r*.07,'#ff9eb5');circle(c,x+r*.34,y+r*.15,r*.07,'#ff9eb5');
}
function drawFairyHouse(c,x,y,r){
  c.fillStyle='#fff3d6';rrect(c,x-r*.4,y-r*.1,r*.8,r*.75,r*.12);c.fill();
  c.fillStyle='#8a5a2b';rrect(c,x-r*.12,y+r*.25,r*.24,r*.4,r*.1);c.fill();circle(c,x+r*.07,y+r*.45,r*.03,'#ffc23c');
  circle(c,x+r*.24,y+r*.1,r*.08,'#ffe28a');
  c.fillStyle='#e63946';c.beginPath();c.ellipse(x,y-r*.1,r*.72,r*.5,0,Math.PI,0);c.fill();
  [[-.4,-.3,.09],[0,-.45,.11],[.38,-.25,.08],[-.15,-.2,.06],[.2,-.12,.06]].forEach(([dx,dy,rr])=>circle(c,x+dx*r,y+dy*r,rr*r,'#fff'));
}
function drawSandcastle(c,x,y,r){
  c.fillStyle='#e9c46a';c.fillRect(x-r*.6,y,r*1.2,r*.6);c.fillRect(x-r*.6,y-r*.35,r*.35,r*.4);c.fillRect(x+r*.25,y-r*.35,r*.35,r*.4);c.fillRect(x-r*.2,y-r*.55,r*.4,r*.6);
  c.fillStyle='#d4a54a';[-.6,-.43,.25,.42].forEach(dx=>c.fillRect(x+dx*r,y-r*.45,r*.12,r*.12));c.fillRect(x-r*.2,y-r*.65,r*.12,r*.12);c.fillRect(x+r*.08,y-r*.65,r*.12,r*.12);
  c.fillStyle='#8a5a2b';c.beginPath();c.arc(x,y+r*.6,r*.14,Math.PI,0);c.fill();
  c.strokeStyle='#6d6384';c.lineWidth=Math.max(1,r*.04);c.beginPath();c.moveTo(x,y-r*.65);c.lineTo(x,y-r*.95);c.stroke();
  c.fillStyle='#ff5d8f';c.beginPath();c.moveTo(x,y-r*.95);c.lineTo(x+r*.25,y-r*.87);c.lineTo(x,y-r*.78);c.fill();
}
function drawMirrorGoal(c,x,y,r,col){
  col=col||'#ff5d8f';
  c.fillStyle=col;c.beginPath();c.ellipse(x,y,r*.5,r*.7,0,0,7);c.fill();
  c.fillStyle='#e6f4ff';c.beginPath();c.ellipse(x,y,r*.38,r*.57,0,0,7);c.fill();
  c.strokeStyle='rgba(255,255,255,.95)';c.lineWidth=Math.max(1,r*.06);c.beginPath();c.moveTo(x-r*.18,y-r*.25);c.lineTo(x-r*.02,y-r*.42);c.moveTo(x-r*.2,y-r*.05);c.lineTo(x+r*.1,y-r*.36);c.stroke();
  circle(c,x,y-r*.72,r*.08,'#ffc23c');
}
function drawPumpkin(c,x,y,r){
  c.fillStyle='#4f9d3a';c.fillRect(x-r*.05,y-r*.7,r*.1,r*.22);
  [[-.35,.38],[.35,.38],[0,.44]].forEach(([dx,rx])=>{c.fillStyle=dx?'#f08a24':'#f79d3a';c.beginPath();c.ellipse(x+dx*r,y,rx*r,r*.5,0,0,7);c.fill();});
  circle(c,x-r*.18,y-r*.08,r*.08,'#4a2a10');circle(c,x+r*.18,y-r*.08,r*.08,'#4a2a10');
  c.strokeStyle='#4a2a10';c.lineWidth=Math.max(1.5,r*.06);c.beginPath();c.arc(x,y+r*.08,r*.18,Math.PI*.15,Math.PI*.85);c.stroke();
  circle(c,x-r*.32,y+r*.1,r*.06,'#ff9eb5');circle(c,x+r*.32,y+r*.1,r*.06,'#ff9eb5');
}
function drawMushroom(c,x,y,r){
  c.fillStyle='#fff3d6';rrect(c,x-r*.16,y-r*.05,r*.32,r*.55,r*.1);c.fill();
  c.fillStyle='#9b5de5';c.beginPath();c.ellipse(x,y-r*.05,r*.55,r*.42,0,Math.PI,0);c.fill();
  [[-.28,-.2,.08],[.05,-.32,.09],[.3,-.15,.07]].forEach(([dx,dy,rr])=>circle(c,x+dx*r,y+dy*r,rr*r,'#fff'));
}
function drawGhost(c,x,y,r){
  c.fillStyle='#f4f1ff';c.beginPath();c.arc(x,y-r*.1,r*.45,Math.PI,0);c.lineTo(x+r*.45,y+r*.45);
  for(let i=0;i<4;i++){const x1=x+r*.45-(i+.5)*r*.225,x2=x+r*.45-(i+1)*r*.225;c.quadraticCurveTo(x1,y+r*(i%2?.55:.3),x2,y+r*.45);}
  c.closePath();c.fill();
  circle(c,x-r*.15,y-r*.12,r*.07,'#2a2140');circle(c,x+r*.15,y-r*.12,r*.07,'#2a2140');
  circle(c,x-r*.26,y+r*.02,r*.06,'#ffb3c8');circle(c,x+r*.26,y+r*.02,r*.06,'#ffb3c8');
  c.fillStyle='#2a2140';c.beginPath();c.ellipse(x,y+r*.05,r*.06,r*.08,0,0,7);c.fill();
}
function drawBattery(c,x,y,r){
  c.fillStyle='#6d6384';c.fillRect(x-r*.1,y-r*.5,r*.2,r*.1);
  c.fillStyle='#80ed99';rrect(c,x-r*.25,y-r*.42,r*.5,r*.82,r*.08);c.fill();c.strokeStyle='#2d6a4f';c.lineWidth=Math.max(1,r*.05);c.stroke();
  c.fillStyle='#ffd23f';c.beginPath();c.moveTo(x+r*.05,y-r*.3);c.lineTo(x-r*.12,y+r*.02);c.lineTo(x,y+r*.02);c.lineTo(x-r*.05,y+r*.28);c.lineTo(x+r*.12,y-r*.06);c.lineTo(x,y-r*.06);c.closePath();c.fill();
}
function drawTrophy(c,x,y,r){
  c.fillStyle='#ffc23c';c.beginPath();c.moveTo(x-r*.45,y-r*.55);c.lineTo(x+r*.45,y-r*.55);c.quadraticCurveTo(x+r*.42,y+r*.1,x,y+r*.15);c.quadraticCurveTo(x-r*.42,y+r*.1,x-r*.45,y-r*.55);c.fill();
  c.strokeStyle='#ffc23c';c.lineWidth=Math.max(2,r*.09);c.beginPath();c.arc(x-r*.45,y-r*.32,r*.17,Math.PI*.5,Math.PI*1.5);c.moveTo(x+r*.45,y-r*.49);c.arc(x+r*.45,y-r*.32,r*.17,-Math.PI*.5,Math.PI*.5);c.stroke();
  c.fillStyle='#e0a010';c.fillRect(x-r*.08,y+r*.12,r*.16,r*.28);c.fillStyle='#b5838d';c.fillRect(x-r*.32,y+r*.4,r*.64,r*.18);
  c.fillStyle='#fff';c.font='bold '+Math.round(r*.4)+'px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('1',x,y-r*.25);
}
function drawDino(c,x,y,r){
  c.fillStyle='#5fb85a';[[-.35,-.55],[-.05,-.68],[.28,-.58]].forEach(([dx,dy])=>{c.beginPath();c.moveTo(x+dx*r-r*.13,y+dy*r+r*.18);c.lineTo(x+dx*r,y+dy*r-r*.1);c.lineTo(x+dx*r+r*.13,y+dy*r+r*.18);c.fill();});
  c.fillStyle='#8bd17c';c.beginPath();c.ellipse(x,y+r*.02,r*.62,r*.55,0,0,7);c.fill();
  c.fillStyle='#b8e6a8';c.beginPath();c.ellipse(x,y+r*.28,r*.38,r*.24,0,0,7);c.fill();
  eyes(c,x,y-r*.12,r,.24,.1);
  circle(c,x-r*.1,y+r*.2,r*.04,'#2d6a4f');circle(c,x+r*.1,y+r*.2,r*.04,'#2d6a4f');
  c.strokeStyle='#2a2140';c.lineWidth=Math.max(1,r*.05);c.beginPath();c.arc(x,y+r*.28,r*.14,Math.PI*.15,Math.PI*.85);c.stroke();
  circle(c,x-r*.42,y+r*.14,r*.07,'#ff9eb5');circle(c,x+r*.42,y+r*.14,r*.07,'#ff9eb5');
}
function drawABC(c,x,y,r){
  [['A','#ff595e',-.42,.18],['B','#1982c4',.42,.18],['C','#ffca3a',0,-.35]].forEach(([t,col,dx,dy])=>{c.fillStyle=col;rrect(c,x+dx*r-r*.32,y+dy*r-r*.32,r*.64,r*.64,r*.1);c.fill();
    c.fillStyle='#fff';c.font='bold '+Math.round(r*.45)+'px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(t,x+dx*r,y+dy*r+r*.03);});
}
function drawBook(c,x,y,r){
  c.fillStyle='#a4161a';c.beginPath();c.moveTo(x,y-r*.35);c.lineTo(x-r*.72,y-r*.5);c.lineTo(x-r*.72,y+r*.4);c.lineTo(x,y+r*.55);c.lineTo(x+r*.72,y+r*.4);c.lineTo(x+r*.72,y-r*.5);c.closePath();c.fill();
  c.fillStyle='#fff8e7';c.beginPath();c.moveTo(x,y-r*.28);c.lineTo(x-r*.62,y-r*.42);c.lineTo(x-r*.62,y+r*.32);c.lineTo(x,y+r*.46);c.closePath();c.fill();
  c.beginPath();c.moveTo(x,y-r*.28);c.lineTo(x+r*.62,y-r*.42);c.lineTo(x+r*.62,y+r*.32);c.lineTo(x,y+r*.46);c.closePath();c.fill();
  c.strokeStyle='#d6cfe6';c.lineWidth=Math.max(1,r*.04);c.beginPath();for(let i=0;i<3;i++){c.moveTo(x-r*.5,y-r*.15+i*r*.18);c.lineTo(x-r*.12,y-r*.08+i*r*.18);c.moveTo(x+r*.12,y-r*.08+i*r*.18);c.lineTo(x+r*.5,y-r*.15+i*r*.18);}c.stroke();
  c.font=Math.round(r*.35)+'px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('✨',x+r*.55,y-r*.65);
}
function drawPuzzle(c,x,y,r){
  c.fillStyle='#8338ec';c.beginPath();c.moveTo(x-r*.5,y-r*.5);c.lineTo(x-r*.12,y-r*.5);c.arc(x,y-r*.5,r*.14,Math.PI,0,false);c.lineTo(x+r*.5,y-r*.5);c.lineTo(x+r*.5,y-r*.12);
  c.arc(x+r*.5,y,r*.14,-Math.PI/2,Math.PI/2,false);c.lineTo(x+r*.5,y+r*.5);c.lineTo(x-r*.5,y+r*.5);c.closePath();c.fill();
  circle(c,x-r*.15,y-r*.05,r*.07,'#fff');circle(c,x+r*.15,y-r*.05,r*.07,'#fff');
  c.strokeStyle='#fff';c.lineWidth=Math.max(1,r*.05);c.beginPath();c.arc(x,y+r*.08,r*.15,Math.PI*.15,Math.PI*.85);c.stroke();
}
function drawBee(c,x,y,r){
  c.fillStyle='rgba(190,230,255,.9)';c.beginPath();c.ellipse(x-r*.42,y-r*.45,r*.25,r*.18,-.5,0,7);c.ellipse(x+r*.42,y-r*.45,r*.25,r*.18,.5,0,7);c.fill();
  c.strokeStyle='#2a2140';c.lineWidth=Math.max(1,r*.05);c.beginPath();c.moveTo(x-r*.15,y-r*.5);c.lineTo(x-r*.3,y-r*.8);c.moveTo(x+r*.15,y-r*.5);c.lineTo(x+r*.3,y-r*.8);c.stroke();
  circle(c,x-r*.3,y-r*.82,r*.06,'#2a2140');circle(c,x+r*.3,y-r*.82,r*.06,'#2a2140');
  circle(c,x,y,r*.58,'#ffd23f');c.save();c.beginPath();c.arc(x,y,r*.58,0,7);c.clip();c.fillStyle='#2a2140';c.fillRect(x-r*.6,y+r*.18,r*1.2,r*.13);c.fillRect(x-r*.6,y+r*.4,r*1.2,r*.12);c.restore();
  eyes(c,x,y-r*.12,r,.2,.1);c.strokeStyle='#2a2140';c.lineWidth=Math.max(1,r*.05);c.beginPath();c.arc(x,y+r*.0,r*.1,Math.PI*.15,Math.PI*.85);c.stroke();
  circle(c,x-r*.36,y-r*.02,r*.07,'#ff9eb5');circle(c,x+r*.36,y-r*.02,r*.07,'#ff9eb5');
}
function drawHamster(c,x,y,r){
  circle(c,x-r*.42,y-r*.45,r*.17,'#d4a373');circle(c,x+r*.42,y-r*.45,r*.17,'#d4a373');circle(c,x-r*.42,y-r*.45,r*.09,'#ffb3c8');circle(c,x+r*.42,y-r*.45,r*.09,'#ffb3c8');
  c.fillStyle='#e9c49a';c.beginPath();c.ellipse(x,y+r*.05,r*.66,r*.56,0,0,7);c.fill();
  c.fillStyle='#fff3e0';c.beginPath();c.ellipse(x-r*.3,y+r*.2,r*.24,r*.2,0,0,7);c.ellipse(x+r*.3,y+r*.2,r*.24,r*.2,0,0,7);c.ellipse(x,y+r*.3,r*.22,r*.18,0,0,7);c.fill();
  eyes(c,x,y-r*.1,r,.22,.1);circle(c,x,y+r*.1,r*.06,'#ff7a9c');
  circle(c,x-r*.42,y+r*.08,r*.07,'#ff9eb5');circle(c,x+r*.42,y+r*.08,r*.07,'#ff9eb5');
}
function drawBall(c,x,y,r){
  const cols=['#ff595e','#ffca3a','#1982c4','#8ac926','#ff595e','#ffca3a'];
  cols.forEach((col,i)=>{c.fillStyle=col;c.beginPath();c.moveTo(x,y);c.arc(x,y,r*.62,i*Math.PI/3,(i+1)*Math.PI/3);c.closePath();c.fill();});
  circle(c,x,y,r*.14,'#ffffff');circle(c,x-r*.25,y-r*.28,r*.08,'rgba(255,255,255,.7)');
}
const PORTALC=['#c77dff','#4cc9f0','#ff9e00','#f15bb5','#80ed99','#ffd23f','#ff595e','#ffffff','#b5838d','#00bbf9'];
function drawPortal(c,x,y,r,col,t){
  circle(c,x,y,r*.7,'rgba(255,255,255,.08)');
  c.strokeStyle=col;c.lineCap='round';
  for(let i=0;i<3;i++){c.lineWidth=Math.max(1.5,r*(.14-i*.03));const a=t/400*(i%2?-1:1)+i*2;
    c.beginPath();c.arc(x,y,r*(.68-i*.2),a,a+Math.PI*1.3);c.stroke();}
  circle(c,x,y,r*.12,col);
}
/* ---------- arcade friends and goals ---------- */
function drawMouse(c,x,y,r){
  circle(c,x-r*.45,y-r*.42,r*.3,'#b3b3c6');circle(c,x+r*.45,y-r*.42,r*.3,'#b3b3c6');
  circle(c,x-r*.45,y-r*.42,r*.18,'#ffb3c8');circle(c,x+r*.45,y-r*.42,r*.18,'#ffb3c8');
  c.fillStyle='#cfcfdc';c.beginPath();c.ellipse(x,y+r*.08,r*.6,r*.54,0,0,7);c.fill();
  eyes(c,x,y-r*.02,r,.22,.1);circle(c,x,y+r*.2,r*.07,'#ff7a9c');
  circle(c,x-r*.38,y+r*.2,r*.07,'#ff9eb5');circle(c,x+r*.38,y+r*.2,r*.07,'#ff9eb5');
  c.strokeStyle='#8a8aa0';c.lineWidth=Math.max(1,r*.035);c.beginPath();
  [-1,1].forEach(s=>{c.moveTo(x+s*r*.12,y+r*.24);c.lineTo(x+s*r*.55,y+r*.18);c.moveTo(x+s*r*.12,y+r*.28);c.lineTo(x+s*r*.55,y+r*.34);});c.stroke();
}
function drawSnaky(c,x,y,r){
  c.fillStyle='#5aa83a';c.beginPath();c.ellipse(x,y+r*.52,r*.72,r*.26,0,0,7);c.fill();
  c.fillStyle='#7bc950';c.beginPath();c.ellipse(x,y+r*.46,r*.58,r*.18,0,0,7);c.fill();
  circle(c,x,y-r*.05,r*.55,'#8ad35c');
  c.fillStyle='#c9f2a6';c.beginPath();c.ellipse(x,y+r*.18,r*.3,r*.2,0,0,7);c.fill();
  circle(c,x-r*.22,y-r*.45,r*.06,'#5aa83a');circle(c,x+r*.05,y-r*.5,r*.05,'#5aa83a');circle(c,x+r*.28,y-r*.4,r*.06,'#5aa83a');
  eyes(c,x,y-r*.12,r,.2,.11);
  c.strokeStyle='#ff4d6d';c.lineWidth=Math.max(1.2,r*.05);c.lineCap='round';c.beginPath();c.moveTo(x,y+r*.3);c.lineTo(x,y+r*.45);c.lineTo(x-r*.07,y+r*.53);c.moveTo(x,y+r*.45);c.lineTo(x+r*.07,y+r*.53);c.stroke();
  circle(c,x-r*.34,y+r*.08,r*.07,'#ff9eb5');circle(c,x+r*.34,y+r*.08,r*.07,'#ff9eb5');
}
function drawFrog(c,x,y,r){
  circle(c,x-r*.32,y-r*.4,r*.25,'#5cc15c');circle(c,x+r*.32,y-r*.4,r*.25,'#5cc15c');
  c.fillStyle='#5cc15c';c.beginPath();c.ellipse(x,y+r*.12,r*.74,r*.54,0,0,7);c.fill();
  c.fillStyle='#b8ec9c';c.beginPath();c.ellipse(x,y+r*.32,r*.42,r*.26,0,0,7);c.fill();
  [-1,1].forEach(s=>{circle(c,x+s*r*.32,y-r*.42,r*.16,'#fff');circle(c,x+s*r*.32,y-r*.4,r*.09,'#2a2140');circle(c,x+s*r*.29,y-r*.44,r*.035,'#fff');});
  c.strokeStyle='#2a6b2a';c.lineWidth=Math.max(1.2,r*.05);c.beginPath();c.arc(x,y+r*.02,r*.28,Math.PI*.15,Math.PI*.85);c.stroke();
  circle(c,x-r*.48,y+r*.08,r*.08,'#ff9eb5');circle(c,x+r*.48,y+r*.08,r*.08,'#ff9eb5');
}
function drawDragon(c,x,y,r){
  c.fillStyle='#b48cf2';[-1,1].forEach(s=>{c.beginPath();c.moveTo(x+s*r*.4,y-r*.05);c.lineTo(x+s*r*.95,y-r*.45);c.lineTo(x+s*r*.85,y+r*.05);c.lineTo(x+s*r*.95,y+r*.3);c.closePath();c.fill();});
  c.fillStyle='#ffd23f';[-1,1].forEach(s=>{c.beginPath();c.moveTo(x+s*r*.18,y-r*.48);c.lineTo(x+s*r*.32,y-r*.82);c.lineTo(x+s*r*.4,y-r*.42);c.fill();});
  circle(c,x,y,r*.58,'#3ec1a8');
  c.fillStyle='#a6ecd9';c.beginPath();c.ellipse(x,y+r*.25,r*.36,r*.24,0,0,7);c.fill();
  circle(c,x-r*.1,y+r*.22,r*.04,'#2a7d6b');circle(c,x+r*.1,y+r*.22,r*.04,'#2a7d6b');
  eyes(c,x,y-r*.12,r,.22,.11);
  circle(c,x-r*.4,y+r*.05,r*.07,'#ff9eb5');circle(c,x+r*.4,y+r*.05,r*.07,'#ff9eb5');
}
function drawKoala(c,x,y,r){
  circle(c,x-r*.52,y-r*.32,r*.3,'#a7a9b8');circle(c,x+r*.52,y-r*.32,r*.3,'#a7a9b8');
  circle(c,x-r*.52,y-r*.32,r*.17,'#f4d6e0');circle(c,x+r*.52,y-r*.32,r*.17,'#f4d6e0');
  c.fillStyle='#bfc2d0';c.beginPath();c.ellipse(x,y+r*.06,r*.58,r*.54,0,0,7);c.fill();
  eyes(c,x,y-r*.08,r,.25,.09);
  c.fillStyle='#3d3550';c.beginPath();c.ellipse(x,y+r*.14,r*.14,r*.19,0,0,7);c.fill();circle(c,x-r*.04,y+r*.06,r*.04,'#8a809e');
  circle(c,x-r*.36,y+r*.2,r*.07,'#ff9eb5');circle(c,x+r*.36,y+r*.2,r*.07,'#ff9eb5');
}
function drawMole(c,x,y,r){
  circle(c,x,y+r*.02,r*.6,'#8d6e63');
  c.fillStyle='#bc9a8c';c.beginPath();c.ellipse(x,y+r*.22,r*.34,r*.26,0,0,7);c.fill();
  circle(c,x-r*.2,y-r*.12,r*.06,'#2a2140');circle(c,x+r*.2,y-r*.12,r*.06,'#2a2140');
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2-Math.PI/2;circle(c,x+Math.cos(a)*r*.08,y+r*.12+Math.sin(a)*r*.08,r*.06,'#ff7aa2');}circle(c,x,y+r*.12,r*.05,'#ff9eb5');
  [-1,1].forEach(s=>{circle(c,x+s*r*.45,y+r*.45,r*.13,'#ffb3c8');});
  circle(c,x-r*.4,y+r*.05,r*.06,'#ff9eb5');circle(c,x+r*.4,y+r*.05,r*.06,'#ff9eb5');
}
function drawCherry(c,x,y,r){
  c.strokeStyle='#3a7d2c';c.lineWidth=Math.max(1.5,r*.08);c.lineCap='round';c.beginPath();
  c.moveTo(x-r*.3,y+r*.15);c.quadraticCurveTo(x-r*.1,y-r*.3,x+r*.12,y-r*.6);c.moveTo(x+r*.28,y+r*.22);c.quadraticCurveTo(x+r*.25,y-r*.2,x+r*.12,y-r*.6);c.stroke();
  c.fillStyle='#5cb85c';c.beginPath();c.ellipse(x+r*.32,y-r*.58,r*.22,r*.1,-.4,0,7);c.fill();
  circle(c,x-r*.3,y+r*.3,r*.3,'#e63946');circle(c,x+r*.28,y+r*.36,r*.3,'#d62839');
  circle(c,x-r*.38,y+r*.2,r*.08,'#ffb3b8');circle(c,x+r*.2,y+r*.26,r*.08,'#ffb3b8');
}
function drawBerry(c,x,y,r){
  c.fillStyle='#ff4d6d';c.beginPath();c.moveTo(x-r*.6,y-r*.2);c.quadraticCurveTo(x-r*.55,y+r*.7,x,y+r*.8);c.quadraticCurveTo(x+r*.55,y+r*.7,x+r*.6,y-r*.2);c.quadraticCurveTo(x,y-r*.45,x-r*.6,y-r*.2);c.fill();
  c.fillStyle='#ffe066';[[-.25,.05],[.2,.0],[0,.3],[-.3,.4],[.28,.38],[0,.6]].forEach(([a,b])=>c.fillRect(x+a*r-r*.04,y+b*r-r*.04,r*.08,r*.08));
  c.fillStyle='#4caf50';c.beginPath();c.moveTo(x-r*.45,y-r*.3);c.lineTo(x,y-r*.6);c.lineTo(x+r*.45,y-r*.3);c.lineTo(x,y-r*.15);c.fill();
}
function drawNest(c,x,y,r){
  circle(c,x-r*.22,y-r*.02,r*.24,'#cfe8ff');circle(c,x+r*.2,y-r*.06,r*.24,'#fff6d8');circle(c,x,y-r*.22,r*.22,'#ffd6e8');
  c.fillStyle='#a47148';c.beginPath();c.ellipse(x,y+r*.25,r*.75,r*.36,0,0,Math.PI);c.lineTo(x-r*.75,y+r*.25);c.fill();
  c.strokeStyle='#7a4f2a';c.lineWidth=Math.max(1,r*.05);c.beginPath();
  for(let i=0;i<5;i++){c.moveTo(x-r*.7+i*r*.3,y+r*.25);c.lineTo(x-r*.5+i*r*.3,y+r*.52);}c.moveTo(x-r*.75,y+r*.25);c.lineTo(x+r*.75,y+r*.25);c.stroke();
}
function drawLily(c,x,y,r){
  c.fillStyle='#4caf50';c.beginPath();c.moveTo(x,y+r*.1);c.arc(x,y+r*.1,r*.72,-Math.PI*.38,Math.PI*1.38);c.closePath();c.fill();
  c.strokeStyle='#2e7d32';c.lineWidth=Math.max(1,r*.04);c.beginPath();for(let i=0;i<5;i++){const a=Math.PI*.6+i*.45;c.moveTo(x,y+r*.1);c.lineTo(x+Math.cos(a)*r*.6,y+r*.1+Math.sin(a)*r*.6);}c.stroke();
  c.fillStyle='#ff8fb8';for(let i=0;i<6;i++){const a=i/6*Math.PI*2;c.beginPath();c.ellipse(x+Math.cos(a)*r*.2,y-r*.12+Math.sin(a)*r*.2,r*.17,r*.09,a,0,7);c.fill();}
  circle(c,x,y-r*.12,r*.11,'#ffd23f');
}
function drawExitDoor(c,x,y,r){
  c.fillStyle='#8d99ae';c.beginPath();c.moveTo(x-r*.62,y+r*.75);c.lineTo(x-r*.62,y-r*.1);c.arc(x,y-r*.1,r*.62,Math.PI,0);c.lineTo(x+r*.62,y+r*.75);c.fill();
  c.fillStyle='#8b5a2b';c.beginPath();c.moveTo(x-r*.44,y+r*.75);c.lineTo(x-r*.44,y-r*.08);c.arc(x,y-r*.08,r*.44,Math.PI,0);c.lineTo(x+r*.44,y+r*.75);c.fill();
  c.strokeStyle='#6b4220';c.lineWidth=Math.max(1,r*.05);c.beginPath();c.moveTo(x,y-r*.5);c.lineTo(x,y+r*.75);c.moveTo(x-r*.44,y+r*.2);c.lineTo(x+r*.44,y+r*.2);c.stroke();
  circle(c,x+r*.25,y+r*.32,r*.07,'#ffd23f');
}
function drawFlag(c,x,y,r){
  c.fillStyle='#8d99ae';c.fillRect(x-r*.5,y-r*.8,r*.1,r*1.6);circle(c,x-r*.45,y-r*.82,r*.09,'#ffd23f');
  const w=r*.95,h=r*.6,x0=x-r*.4,y0=y-r*.75;
  for(let j=0;j<3;j++)for(let i=0;i<4;i++){c.fillStyle=(i+j)%2?'#2a2140':'#ffffff';c.fillRect(x0+i*w/4,y0+j*h/3+Math.sin(i*1.3)*r*.04,w/4+.5,h/3+.5);}
  c.fillStyle='#5d6d7e';c.fillRect(x-r*.62,y+r*.72,r*.34,r*.1);
}
function drawCarrot(c,x,y,r){
  c.fillStyle='#4caf50';[-.2,0,.2].forEach(a=>{c.beginPath();c.ellipse(x+a*r,y-r*.55,r*.09,r*.28,a*1.5,0,7);c.fill();});
  c.fillStyle='#ff8c1a';c.beginPath();c.moveTo(x-r*.3,y-r*.35);c.quadraticCurveTo(x,y-r*.45,x+r*.3,y-r*.35);c.lineTo(x+r*.04,y+r*.85);c.lineTo(x-r*.04,y+r*.85);c.closePath();c.fill();
  c.strokeStyle='#d9700f';c.lineWidth=Math.max(1,r*.05);c.beginPath();c.moveTo(x-r*.2,y-r*.05);c.lineTo(x-r*.05,y-r*.05);c.moveTo(x+r*.05,y+r*.25);c.lineTo(x+r*.16,y+r*.25);c.moveTo(x-r*.12,y+r*.5);c.lineTo(x,y+r*.5);c.stroke();
}
function drawSeahorse(c,x,y,r){
  c.fillStyle='#ffb347';c.beginPath();c.moveTo(x-r*.05,y+r*.2);c.quadraticCurveTo(x-r*.55,y+r*.55,x-r*.2,y+r*.85);c.quadraticCurveTo(x+r*.05,y+r*.95,x+r*.05,y+r*.7);c.quadraticCurveTo(x-r*.15,y+r*.65,x+r*.1,y+r*.5);c.fill();
  c.fillStyle='#ffd27f';c.beginPath();c.moveTo(x-r*.5,y-r*.2);c.lineTo(x-r*.75,y-r*.45);c.lineTo(x-r*.55,y-r*.05);c.fill();
  circle(c,x,y,r*.52,'#ffb347');
  c.fillStyle='#ffb347';c.beginPath();c.ellipse(x+r*.48,y+r*.06,r*.3,r*.15,.2,0,7);c.fill();circle(c,x+r*.75,y+r*.1,r*.06,'#e8892a');
  c.fillStyle='#ff8c42';[-.35,-.05,.25].forEach(a=>{c.beginPath();c.moveTo(x+a*r-r*.08,y-r*.45);c.lineTo(x+a*r,y-r*.72);c.lineTo(x+a*r+r*.08,y-r*.45);c.fill();});
  c.fillStyle='#ffe0b0';c.beginPath();c.ellipse(x-r*.05,y+r*.25,r*.25,r*.18,0,0,7);c.fill();
  eyes(c,x+r*.05,y-r*.1,r,.2,.1);circle(c,x-r*.3,y+r*.08,r*.07,'#ff9eb5');
}
function drawHedgehog(c,x,y,r){
  c.fillStyle='#7a5230';for(let i=0;i<9;i++){const a=Math.PI*(1.05+i*.11);c.beginPath();c.moveTo(x+Math.cos(a-.15)*r*.5,y+Math.sin(a-.15)*r*.5);c.lineTo(x+Math.cos(a)*r*.92,y+Math.sin(a)*r*.92);c.lineTo(x+Math.cos(a+.15)*r*.5,y+Math.sin(a+.15)*r*.5);c.fill();}
  circle(c,x,y,r*.6,'#9c6b43');
  c.fillStyle='#f3d9b8';c.beginPath();c.ellipse(x,y+r*.15,r*.45,r*.38,0,0,7);c.fill();
  eyes(c,x,y,r,.2,.09);circle(c,x,y+r*.2,r*.08,'#2a2140');
  circle(c,x-r*.32,y+r*.22,r*.07,'#ff9eb5');circle(c,x+r*.32,y+r*.22,r*.07,'#ff9eb5');
}
function drawPearl(c,x,y,r){
  c.fillStyle='#ff8fb8';c.beginPath();c.ellipse(x,y+r*.35,r*.82,r*.32,0,0,Math.PI);c.fill();
  c.fillStyle='#ffb3cf';c.beginPath();c.ellipse(x,y-r*.05,r*.82,r*.55,0,Math.PI,0);c.fill();
  c.strokeStyle='#e05a8a';c.lineWidth=Math.max(1,r*.05);c.beginPath();for(let i=-2;i<=2;i++){c.moveTo(x,y-r*.05);c.lineTo(x+i*r*.3,y-r*.5+Math.abs(i)*r*.12);}c.stroke();
  circle(c,x,y+r*.25,r*.27,'#f4f1ff');circle(c,x-r*.08,y+r*.17,r*.08,'#ffffff');
}
function drawSetSquare(c,x,y,r){
  c.fillStyle='rgba(76,201,240,.85)';c.beginPath();c.moveTo(x-r*.7,y+r*.6);c.lineTo(x+r*.7,y+r*.6);c.lineTo(x-r*.7,y-r*.75);c.closePath();c.fill();
  c.fillStyle='#fff';c.beginPath();c.moveTo(x-r*.48,y+r*.4);c.lineTo(x+r*.15,y+r*.4);c.lineTo(x-r*.48,y-r*.22);c.closePath();c.fill();
  c.strokeStyle='#1d6f8f';c.lineWidth=Math.max(1,r*.05);c.beginPath();for(let i=0;i<6;i++){c.moveTo(x-r*.6+i*r*.22,y+r*.6);c.lineTo(x-r*.6+i*r*.22,y+r*.5);}c.stroke();
  c.fillStyle='#ffd23f';c.beginPath();c.arc(x+r*.35,y-r*.2,r*.35,Math.PI,0);c.closePath();c.fill();c.strokeStyle='#b8860b';c.stroke();
}
/* ---------- sports friends and goals ---------- */
function drawLion(c,x,y,r){
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;circle(c,x+Math.cos(a)*r*.58,y+Math.sin(a)*r*.55,r*.24,i%2?'#e07a1f':'#c8621a');}
  circle(c,x,y,r*.55,'#f4b860');circle(c,x-r*.35,y-r*.4,r*.13,'#f4b860');circle(c,x+r*.35,y-r*.4,r*.13,'#f4b860');
  c.fillStyle='#fff3d6';c.beginPath();c.ellipse(x,y+r*.2,r*.28,r*.2,0,0,7);c.fill();
  eyes(c,x,y-r*.08,r,.2,.09);c.fillStyle='#5a2a00';c.beginPath();c.moveTo(x-r*.08,y+r*.1);c.lineTo(x+r*.08,y+r*.1);c.lineTo(x,y+r*.2);c.fill();
}
function drawKangaroo(c,x,y,r){
  c.fillStyle='#c68642';[-1,1].forEach(s=>{c.beginPath();c.ellipse(x+s*r*.28,y-r*.6,r*.12,r*.3,s*.2,0,7);c.fill();});
  c.fillStyle='#ffb3c8';[-1,1].forEach(s=>{c.beginPath();c.ellipse(x+s*r*.28,y-r*.6,r*.05,r*.18,s*.2,0,7);c.fill();});
  c.fillStyle='#d4955a';c.beginPath();c.ellipse(x,y+r*.05,r*.55,r*.6,0,0,7);c.fill();
  c.fillStyle='#f3d2a8';c.beginPath();c.ellipse(x,y+r*.25,r*.3,r*.24,0,0,7);c.fill();
  eyes(c,x,y-r*.12,r,.2,.09);circle(c,x,y+r*.12,r*.07,'#3d2b1f');
}
function drawPolar(c,x,y,r){
  circle(c,x-r*.42,y-r*.42,r*.18,'#f1f5f9');circle(c,x+r*.42,y-r*.42,r*.18,'#f1f5f9');
  circle(c,x,y+r*.02,r*.6,'#f8fafc');c.strokeStyle='#cbd5e1';c.lineWidth=Math.max(1,r*.04);c.beginPath();c.arc(x,y+r*.02,r*.6,0,7);c.stroke();
  c.fillStyle='#e2e8f0';c.beginPath();c.ellipse(x,y+r*.22,r*.26,r*.18,0,0,7);c.fill();
  eyes(c,x,y-r*.08,r,.22,.09);circle(c,x,y+r*.15,r*.08,'#2a2140');
  c.fillStyle='#e63946';c.fillRect(x-r*.6,y-r*.5,r*1.2,r*.14);circle(c,x,y-r*.62,r*.12,'#ffffff');
}
function drawDuck(c,x,y,r){
  c.fillStyle='#ffd23f';c.beginPath();c.ellipse(x,y+r*.25,r*.62,r*.45,0,0,7);c.fill();
  circle(c,x,y-r*.22,r*.42,'#ffd23f');
  c.fillStyle='#ff8c1a';c.beginPath();c.ellipse(x,y-r*.08,r*.24,r*.1,0,0,7);c.fill();
  eyes(c,x,y-r*.32,r,.16,.08);circle(c,x-r*.3,y-r*.12,r*.06,'#ff9eb5');circle(c,x+r*.3,y-r*.12,r*.06,'#ff9eb5');
  c.strokeStyle='#4cc9f0';c.lineWidth=Math.max(1.5,r*.1);c.beginPath();c.ellipse(x,y-r*.42,r*.36,r*.12,0,Math.PI,0);c.stroke();
}
function drawRaccoon(c,x,y,r){
  c.fillStyle='#8d99ae';[-1,1].forEach(s=>{c.beginPath();c.moveTo(x+s*r*.5,y-r*.15);c.lineTo(x+s*r*.45,y-r*.7);c.lineTo(x+s*r*.15,y-r*.45);c.fill();});
  circle(c,x,y,r*.58,'#a5b1c2');
  c.fillStyle='#2a2140';c.beginPath();c.ellipse(x,y-r*.08,r*.48,r*.17,0,0,7);c.fill();
  circle(c,x-r*.2,y-r*.08,r*.1,'#ffffff');circle(c,x+r*.2,y-r*.08,r*.1,'#ffffff');circle(c,x-r*.2,y-r*.08,r*.05,'#2a2140');circle(c,x+r*.2,y-r*.08,r*.05,'#2a2140');
  c.fillStyle='#f1f1f1';c.beginPath();c.ellipse(x,y+r*.25,r*.25,r*.18,0,0,7);c.fill();circle(c,x,y+r*.16,r*.07,'#2a2140');
}
function drawCheetah(c,x,y,r){
  circle(c,x-r*.4,y-r*.42,r*.14,'#f4a340');circle(c,x+r*.4,y-r*.42,r*.14,'#f4a340');
  circle(c,x,y,r*.58,'#f6c25b');
  [[-.3,-.3],[.3,-.3],[-.42,.05],[.42,.05],[0,-.42],[-.15,-.15],[.18,-.18]].forEach(([a,b])=>circle(c,x+a*r,y+b*r,r*.05,'#6b4423'));
  eyes(c,x,y-r*.05,r,.2,.09);
  c.strokeStyle='#6b4423';c.lineWidth=Math.max(1,r*.04);c.beginPath();c.moveTo(x-r*.22,y+r*.02);c.lineTo(x-r*.15,y+r*.3);c.moveTo(x+r*.22,y+r*.02);c.lineTo(x+r*.15,y+r*.3);c.stroke();
  circle(c,x,y+r*.2,r*.06,'#3d2b1f');
}
function drawPiggy(c,x,y,r){
  c.fillStyle='#ffafcc';[-1,1].forEach(s=>{c.beginPath();c.moveTo(x+s*r*.5,y-r*.25);c.lineTo(x+s*r*.45,y-r*.65);c.lineTo(x+s*r*.15,y-r*.45);c.fill();});
  circle(c,x,y,r*.58,'#ffc8dd');
  c.fillStyle='#ff8fab';c.beginPath();c.ellipse(x,y+r*.15,r*.2,r*.14,0,0,7);c.fill();circle(c,x-r*.07,y+r*.15,r*.04,'#c9184a');circle(c,x+r*.07,y+r*.15,r*.04,'#c9184a');
  eyes(c,x,y-r*.12,r,.2,.08);
}
function drawTiger(c,x,y,r){
  circle(c,x-r*.4,y-r*.42,r*.15,'#ff9f1c');circle(c,x+r*.4,y-r*.42,r*.15,'#ff9f1c');
  circle(c,x,y,r*.58,'#ffa94d');
  c.fillStyle='#2a2140';[[-.5,-.1],[.5,-.1],[0,-.5]].forEach(([a,b],i)=>{c.beginPath();c.ellipse(x+a*r,y+b*r,r*.05,r*.15,i===2?0:(a<0?.6:-.6),0,7);c.fill();});
  c.fillStyle='#fff3e0';c.beginPath();c.ellipse(x,y+r*.22,r*.28,r*.2,0,0,7);c.fill();
  eyes(c,x,y-r*.08,r,.2,.09);circle(c,x,y+r*.12,r*.06,'#ff7a9c');
  c.fillStyle='#ffffff';c.fillRect(x-r*.6,y+r*.45,r*1.2,r*.12);c.fillStyle='#2a2140';c.fillRect(x-r*.1,y+r*.42,r*.2,r*.18);
}
function drawNetGoal(c,x,y,r){
  c.fillStyle='#43a047';rrect(c,x-r*.95,y-r*.7,r*1.9,r*1.45,r*.2);c.fill();
  c.strokeStyle='#ffffff';c.lineWidth=Math.max(2,r*.12);c.beginPath();c.moveTo(x-r*.75,y+r*.55);c.lineTo(x-r*.75,y-r*.45);c.lineTo(x+r*.75,y-r*.45);c.lineTo(x+r*.75,y+r*.55);c.stroke();
  c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=1;c.beginPath();for(let i=1;i<5;i++){c.moveTo(x-r*.75+i*r*.3,y-r*.45);c.lineTo(x-r*.75+i*r*.3,y+r*.5);}for(let i=1;i<4;i++){c.moveTo(x-r*.75,y-r*.45+i*r*.25);c.lineTo(x+r*.75,y-r*.45+i*r*.25);}c.stroke();
  drawSoccerBall(c,x,y+r*.25,r*.25,0);
}
function drawHoopGoal(c,x,y,r){
  c.fillStyle='#f77f00';c.beginPath();c.moveTo(x-r*.35,y-r*.7);c.lineTo(x-r*.8,y-r*.4);c.lineTo(x-r*.6,y-r*.05);c.lineTo(x-r*.45,y-r*.15);c.lineTo(x-r*.45,y+r*.75);c.lineTo(x+r*.45,y+r*.75);c.lineTo(x+r*.45,y-r*.15);c.lineTo(x+r*.6,y-r*.05);c.lineTo(x+r*.8,y-r*.4);c.lineTo(x+r*.35,y-r*.7);c.quadraticCurveTo(x,y-r*.45,x-r*.35,y-r*.7);c.fill();
  c.fillStyle='#ffffff';c.font='bold '+Math.round(r*.6)+'px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('8',x,y+r*.2);}
function drawLodge(c,x,y,r){
  c.fillStyle='#8b5a2b';c.fillRect(x-r*.6,y-r*.1,r*1.2,r*.75);
  c.fillStyle='#ffffff';c.beginPath();c.moveTo(x-r*.8,y-r*.05);c.lineTo(x,y-r*.75);c.lineTo(x+r*.8,y-r*.05);c.fill();
  c.fillStyle='#ffd23f';c.fillRect(x-r*.38,y+r*.08,r*.24,r*.22);c.fillStyle='#5d3a1a';c.fillRect(x+r*.12,y+r*.18,r*.26,r*.47);
}
function drawMedal(c,x,y,r){
  c.fillStyle='#1982c4';c.beginPath();c.moveTo(x-r*.45,y-r*.8);c.lineTo(x-r*.1,y-r*.1);c.lineTo(x+r*.1,y-r*.1);c.lineTo(x+r*.45,y-r*.8);c.lineTo(x+r*.2,y-r*.8);c.lineTo(x,y-r*.35);c.lineTo(x-r*.2,y-r*.8);c.fill();
  circle(c,x,y+r*.25,r*.45,'#f4c430');circle(c,x,y+r*.25,r*.32,'#ffd76a');star(c,x,y+r*.25,r*.2);
}
function drawRacket(c,x,y,r){
  c.fillStyle='#6d4c41';c.save();c.translate(x,y);c.rotate(-.6);c.fillRect(-r*.08,r*.15,r*.16,r*.7);
  c.strokeStyle='#e63946';c.lineWidth=Math.max(2,r*.1);c.beginPath();c.ellipse(0,-r*.25,r*.38,r*.45,0,0,7);c.stroke();
  c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=1;c.beginPath();for(let i=-2;i<=2;i++){c.moveTo(i*r*.13,-r*.66);c.lineTo(i*r*.13,r*.16);c.moveTo(-r*.36,-r*.25+i*r*.16);c.lineTo(r*.36,-r*.25+i*r*.16);}c.stroke();c.restore();
  drawTennisBall(c,x+r*.45,y+r*.45,r*.18);
}
function drawStopwatch(c,x,y,r){
  c.fillStyle='#5d6d7e';c.fillRect(x-r*.1,y-r*.85,r*.2,r*.2);circle(c,x,y+r*.05,r*.62,'#5d6d7e');circle(c,x,y+r*.05,r*.5,'#ffffff');
  c.strokeStyle='#e63946';c.lineWidth=Math.max(1.5,r*.08);c.beginPath();c.moveTo(x,y+r*.05);c.lineTo(x+r*.25,y-r*.2);c.stroke();circle(c,x,y+r*.05,r*.06,'#2a2140');
}
function drawGolfFlag(c,x,y,r){
  c.fillStyle='#1b4332';c.beginPath();c.ellipse(x,y+r*.55,r*.35,r*.13,0,0,7);c.fill();
  c.fillStyle='#ffffff';c.fillRect(x-r*.04,y-r*.85,r*.08,r*1.4);
  c.fillStyle='#e63946';c.beginPath();c.moveTo(x+r*.04,y-r*.85);c.lineTo(x+r*.62,y-r*.65);c.lineTo(x+r*.04,y-r*.45);c.fill();
}
function drawBelt(c,x,y,r){
  c.fillStyle='#2a2140';c.fillRect(x-r*.8,y-r*.15,r*1.6,r*.3);
  c.beginPath();c.moveTo(x,y);c.lineTo(x-r*.35,y+r*.7);c.lineTo(x-r*.15,y+r*.75);c.lineTo(x,y+r*.15);c.lineTo(x+r*.15,y+r*.75);c.lineTo(x+r*.35,y+r*.7);c.fill();
  c.fillRect(x-r*.2,y-r*.22,r*.4,r*.44);c.fillStyle='#ffd23f';c.fillRect(x-r*.55,y-r*.05,r*.15,r*.1);
}
/* ---------- challenge friends ---------- */
function drawSeal(c,x,y,r){
  c.fillStyle='#9fb3c8';c.beginPath();c.ellipse(x,y+r*.12,r*.68,r*.56,0,0,7);c.fill();
  c.fillStyle='#c9d6e3';c.beginPath();c.ellipse(x,y+r*.25,r*.3,r*.2,0,0,7);c.fill();
  eyes(c,x,y-r*.1,r,.24,.12);circle(c,x,y+r*.13,r*.08,'#2a2140');
  c.strokeStyle='#5c6f82';c.lineWidth=Math.max(1,r*.035);c.beginPath();[-1,1].forEach(s=>{c.moveTo(x+s*r*.1,y+r*.24);c.lineTo(x+s*r*.5,y+r*.18);c.moveTo(x+s*r*.1,y+r*.28);c.lineTo(x+s*r*.5,y+r*.34);});c.stroke();
  circle(c,x-r*.42,y+r*.1,r*.07,'#ff9eb5');circle(c,x+r*.42,y+r*.1,r*.07,'#ff9eb5');
}
function drawChameleon(c,x,y,r){
  c.strokeStyle='#4caf50';c.lineWidth=Math.max(2,r*.16);c.beginPath();c.arc(x+r*.45,y+r*.35,r*.22,-Math.PI/2,Math.PI);c.stroke();
  c.fillStyle='#6fcf5f';c.beginPath();c.ellipse(x,y,r*.62,r*.52,0,0,7);c.fill();
  c.fillStyle='#4caf50';c.beginPath();c.moveTo(x-r*.5,y-r*.25);c.lineTo(x,y-r*.75);c.lineTo(x+r*.5,y-r*.25);c.fill();
  [[-.3,.15,'#ffd23f'],[.25,.25,'#ff8fab'],[0,-.25,'#4cc9f0']].forEach(([a,b,col])=>circle(c,x+a*r,y+b*r,r*.08,col));
  [-1,1].forEach(s=>{circle(c,x+s*r*.32,y-r*.12,r*.17,'#8fdc7f');circle(c,x+s*r*.32,y-r*.12,r*.08,'#2a2140');circle(c,x+s*r*.29,y-r*.15,r*.03,'#fff');});
  c.strokeStyle='#2a6b2a';c.lineWidth=Math.max(1,r*.05);c.beginPath();c.arc(x,y+r*.12,r*.18,Math.PI*.15,Math.PI*.85);c.stroke();
}
function drawBeaver(c,x,y,r){
  circle(c,x-r*.42,y-r*.42,r*.13,'#8b5a2b');circle(c,x+r*.42,y-r*.42,r*.13,'#8b5a2b');
  circle(c,x,y,r*.6,'#a0703f');
  c.fillStyle='#d9a36b';c.beginPath();c.ellipse(x,y+r*.2,r*.3,r*.22,0,0,7);c.fill();
  eyes(c,x,y-r*.12,r,.22,.09);circle(c,x,y+r*.08,r*.08,'#3d2b1f');
  c.fillStyle='#ffffff';c.fillRect(x-r*.1,y+r*.2,r*.09,r*.16);c.fillRect(x+r*.01,y+r*.2,r*.09,r*.16);
  c.fillStyle='#ffd23f';c.fillRect(x-r*.55,y-r*.75,r*1.1,r*.22);c.fillRect(x-r*.38,y-r*.88,r*.76,r*.16);
}
function drawMeerkat(c,x,y,r){
  c.fillStyle='#d4a373';c.beginPath();c.ellipse(x,y+r*.08,r*.5,r*.62,0,0,7);c.fill();
  c.fillStyle='#f1d6b0';c.beginPath();c.ellipse(x,y+r*.28,r*.25,r*.25,0,0,7);c.fill();
  c.fillStyle='#5d4037';c.beginPath();c.ellipse(x-r*.2,y-r*.12,r*.14,r*.12,-.3,0,7);c.ellipse(x+r*.2,y-r*.12,r*.14,r*.12,.3,0,7);c.fill();
  circle(c,x-r*.2,y-r*.12,r*.07,'#ffffff');circle(c,x+r*.2,y-r*.12,r*.07,'#ffffff');circle(c,x-r*.2,y-r*.11,r*.04,'#2a2140');circle(c,x+r*.2,y-r*.11,r*.04,'#2a2140');
  circle(c,x,y+r*.08,r*.06,'#3d2b1f');
  c.strokeStyle='#2a2140';c.lineWidth=Math.max(1,r*.05);c.beginPath();c.arc(x+r*.42,y-r*.55,r*.16,0,7);c.moveTo(x+r*.3,y-r*.44);c.lineTo(x+r*.15,y-r*.25);c.stroke();
}
/* ---------- newest friends ---------- */
function drawHippo(c,x,y,r){
  circle(c,x-r*.4,y-r*.5,r*.13,'#9d8ec7');circle(c,x+r*.4,y-r*.5,r*.13,'#9d8ec7');circle(c,x-r*.4,y-r*.5,r*.06,'#ff9eb5');circle(c,x+r*.4,y-r*.5,r*.06,'#ff9eb5');
  c.fillStyle='#b8a9e0';c.beginPath();c.ellipse(x,y-r*.1,r*.55,r*.5,0,0,7);c.fill();
  c.fillStyle='#cfc3f0';c.beginPath();c.ellipse(x,y+r*.3,r*.5,r*.32,0,0,7);c.fill();
  circle(c,x-r*.17,y+r*.25,r*.06,'#6c5b9e');circle(c,x+r*.17,y+r*.25,r*.06,'#6c5b9e');
  eyes(c,x,y-r*.2,r,.2,.1);circle(c,x-r*.38,y+r*.05,r*.07,'#ff9eb5');circle(c,x+r*.38,y+r*.05,r*.07,'#ff9eb5');
}
function drawOtter(c,x,y,r){
  circle(c,x-r*.42,y-r*.4,r*.12,'#7f5539');circle(c,x+r*.42,y-r*.4,r*.12,'#7f5539');
  circle(c,x,y,r*.6,'#9c6644');
  c.fillStyle='#ede0d4';c.beginPath();c.ellipse(x,y+r*.18,r*.38,r*.3,0,0,7);c.fill();
  eyes(c,x,y-r*.12,r,.22,.09);
  c.fillStyle='#3d2b1f';c.beginPath();c.ellipse(x,y+r*.08,r*.1,r*.07,0,0,7);c.fill();
  c.strokeStyle='#7f5539';c.lineWidth=Math.max(1,r*.03);c.beginPath();[-1,1].forEach(s=>{c.moveTo(x+s*r*.12,y+r*.15);c.lineTo(x+s*r*.45,y+r*.1);c.moveTo(x+s*r*.12,y+r*.2);c.lineTo(x+s*r*.45,y+r*.24);});c.stroke();
  c.strokeStyle='#3d2b1f';c.lineWidth=Math.max(1,r*.04);c.beginPath();c.arc(x,y+r*.18,r*.1,Math.PI*.15,Math.PI*.85);c.stroke();
}
function drawSloth(c,x,y,r){
  circle(c,x,y,r*.62,'#a68a64');
  c.fillStyle='#ede0c8';c.beginPath();c.ellipse(x,y+r*.05,r*.46,r*.4,0,0,7);c.fill();
  c.fillStyle='#6f4e37';c.beginPath();c.ellipse(x-r*.2,y-r*.02,r*.17,r*.1,-.35,0,7);c.ellipse(x+r*.2,y-r*.02,r*.17,r*.1,.35,0,7);c.fill();
  circle(c,x-r*.2,y-r*.02,r*.06,'#1d1530');circle(c,x+r*.2,y-r*.02,r*.06,'#1d1530');circle(c,x-r*.18,y-r*.04,r*.02,'#fff');circle(c,x+r*.22,y-r*.04,r*.02,'#fff');
  c.fillStyle='#3d2b1f';c.beginPath();c.ellipse(x,y+r*.15,r*.08,r*.05,0,0,7);c.fill();
  c.strokeStyle='#3d2b1f';c.lineWidth=Math.max(1,r*.04);c.beginPath();c.arc(x,y+r*.2,r*.13,Math.PI*.2,Math.PI*.8);c.stroke();
}
function drawElephant(c,x,y,r){
  c.fillStyle='#a3b4c8';c.beginPath();c.ellipse(x-r*.55,y-r*.05,r*.32,r*.4,-.2,0,7);c.ellipse(x+r*.55,y-r*.05,r*.32,r*.4,.2,0,7);c.fill();
  c.fillStyle='#ffc8dd';c.beginPath();c.ellipse(x-r*.55,y-r*.05,r*.18,r*.25,-.2,0,7);c.ellipse(x+r*.55,y-r*.05,r*.18,r*.25,.2,0,7);c.fill();
  circle(c,x,y-r*.1,r*.48,'#bccbdc');
  c.strokeStyle='#bccbdc';c.lineWidth=Math.max(3,r*.2);c.lineCap='round';c.beginPath();c.moveTo(x,y+r*.1);c.quadraticCurveTo(x,y+r*.5,x+r*.22,y+r*.55);c.stroke();
  eyes(c,x,y-r*.2,r,.18,.09);circle(c,x-r*.3,y+r*.02,r*.06,'#ff9eb5');circle(c,x+r*.3,y+r*.02,r*.06,'#ff9eb5');
}
function drawCow(c,x,y,r){
  c.fillStyle='#f6f1e9';c.beginPath();c.ellipse(x-r*.58,y-r*.25,r*.18,r*.09,-.4,0,7);c.ellipse(x+r*.58,y-r*.25,r*.18,r*.09,.4,0,7);c.fill();
  c.fillStyle='#e9c46a';c.beginPath();c.moveTo(x-r*.35,y-r*.45);c.lineTo(x-r*.45,y-r*.72);c.lineTo(x-r*.22,y-r*.5);c.moveTo(x+r*.35,y-r*.45);c.lineTo(x+r*.45,y-r*.72);c.lineTo(x+r*.22,y-r*.5);c.fill();
  circle(c,x,y-r*.1,r*.5,'#ffffff');
  c.fillStyle='#2b2d42';c.beginPath();c.ellipse(x-r*.28,y-r*.3,r*.16,r*.12,.3,0,7);c.ellipse(x+r*.3,y+r*.02,r*.1,r*.08,0,0,7);c.fill();
  c.fillStyle='#ffafcc';c.beginPath();c.ellipse(x,y+r*.25,r*.38,r*.24,0,0,7);c.fill();
  circle(c,x-r*.14,y+r*.25,r*.05,'#c9184a');circle(c,x+r*.14,y+r*.25,r*.05,'#c9184a');
  eyes(c,x,y-r*.12,r,.2,.09);
}
function drawLadybug(c,x,y,r){
  c.strokeStyle='#2b2d42';c.lineWidth=Math.max(1,r*.05);c.beginPath();c.moveTo(x-r*.15,y-r*.5);c.quadraticCurveTo(x-r*.3,y-r*.8,x-r*.4,y-r*.75);c.moveTo(x+r*.15,y-r*.5);c.quadraticCurveTo(x+r*.3,y-r*.8,x+r*.4,y-r*.75);c.stroke();
  circle(c,x-r*.4,y-r*.75,r*.06,'#2b2d42');circle(c,x+r*.4,y-r*.75,r*.06,'#2b2d42');
  circle(c,x,y+r*.12,r*.58,'#e63946');c.strokeStyle='#2b2d42';c.lineWidth=Math.max(1,r*.05);c.beginPath();c.moveTo(x,y-r*.05);c.lineTo(x,y+r*.7);c.stroke();
  [[-.3,.25],[.3,.25],[-.25,.5],[.25,.5],[-.42,.02],[.42,.02]].forEach(([a,b])=>circle(c,x+a*r,y+b*r,r*.09,'#2b2d42'));
  circle(c,x,y-r*.25,r*.34,'#2b2d42');circle(c,x-r*.14,y-r*.3,r*.12,'#fff');circle(c,x+r*.14,y-r*.3,r*.12,'#fff');eyes(c,x,y-r*.3,r,.14,.08);
  circle(c,x-r*.12,y-r*.3,r*.03,'#fff');circle(c,x-r*.2,y-r*.18,r*.05,'#ff9eb5');circle(c,x+r*.2,y-r*.18,r*.05,'#ff9eb5');
}
const CHARS=[
  {id:'kitten',name:'חתלתולה',draw:drawKitten},
  {id:'bunny',name:'ארנבונה',draw:drawBunny},
  {id:'penguin',name:'פינגווינה',draw:drawPenguin},
  {id:'puppy',name:'כלבלבה',draw:drawPuppy,unlock:'ice'},
  {id:'unicorn',name:'חד־קרנית',draw:drawUnicorn,unlock:'castle'},
  {id:'octopus',name:'תמנונית',draw:drawOctopus,unlock:'sea'},
  {id:'panda',name:'פנדונת',draw:drawPanda,unlock:'jungle'},
  {id:'alien',name:'חייזרית',draw:drawAlien,unlock:'space'},
  {id:'bear',name:'דובונת',draw:drawBear,unlock:'candy'},
  {id:'lamb',name:'כבשונת',draw:drawLamb,unlock:'farm'},
  {id:'owl',name:'ינשופונת',draw:drawOwl,unlock:'rainbow'},
  {id:'robot',name:'רובוטית',draw:drawRobot,unlock:'toys'},
  {id:'squirrel',name:'סנאית',draw:drawSquirrel,unlock:'forest'},
  {id:'turtle',name:'צבונת',draw:drawTurtle,unlock:'beach'},
  {id:'giraffe',name:'ג׳ירפונת',draw:drawGiraffe,unlock:'mirror'},
  {id:'bat',name:'עטלפונת',draw:drawBat,unlock:'haunt'},
  {id:'dino',name:'דינוזאורית',draw:drawDino,unlock:'numbers'},
  {id:'foxy',name:'שועלונת',draw:drawFox,unlock:'english'},
  {id:'bee',name:'דבורית',draw:drawBee,unlock:'hebrew'},
  {id:'hamster',name:'אוגרית',draw:drawHamster,unlock:'logic'},
  {id:'mouse',name:'עכברונת',draw:drawMouse,unlock:'munch'},
  {id:'snaky',name:'נחשונת',draw:drawSnaky,unlock:'snake'},
  {id:'frog',name:'צפרדעונת',draw:drawFrog,unlock:'road'},
  {id:'dragon',name:'דרקונית',draw:drawDragon,unlock:'bomb'},
  {id:'koala',name:'קואלונת',draw:drawKoala,unlock:'ladders'},
  {id:'mole',name:'חפרפרונת',draw:drawMole,unlock:'mines'},
  {id:'seahorse',name:'סוסונת ים',draw:drawSeahorse,unlock:'deep'},
  {id:'hedgehog',name:'קיפודה',draw:drawHedgehog,unlock:'geometry'},
  {id:'lion',name:'אריונת',draw:drawLion,unlock:'soccer'},
  {id:'kangaroo',name:'קנגורונת',draw:drawKangaroo,unlock:'hoops'},
  {id:'polar',name:'דובונת קוטב',draw:drawPolar,unlock:'ski'},
  {id:'duck',name:'ברווזונת',draw:drawDuck,unlock:'swim'},
  {id:'raccoon',name:'רקונית',draw:drawRaccoon,unlock:'tennis'},
  {id:'cheetah',name:'ברדלסונת',draw:drawCheetah,unlock:'hurdles'},
  {id:'piggy',name:'חזרזירונת',draw:drawPiggy,unlock:'golf'},
  {id:'tiger',name:'טיגריסונת',draw:drawTiger,unlock:'dojo'},
  {id:'seal',name:'כלבת ים',draw:drawSeal,unlock:'tilt'},
  {id:'chameleon',name:'זיקית',draw:drawChameleon,unlock:'shadow'},
  {id:'beaver',name:'בונה בנאית',draw:drawBeaver,unlock:'floors'},
  {id:'meerkat',name:'סוריקטה בלשית',draw:drawMeerkat,unlock:'escape'},
  {id:'hippo',name:'היפופוטמית',draw:drawHippo,unlock:'sheep'},
  {id:'cow',name:'פרונת',draw:drawCow,unlock:'chef'},
  {id:'otter',name:'לוטרית',draw:drawOtter,unlock:'memory'},
  {id:'elephant',name:'פילונת',draw:drawElephant,unlock:'spell'},
  {id:'ladybug',name:'פרת משה רבנו',draw:drawLadybug,unlock:'paint'},
  {id:'sloth',name:'עצלנית',draw:drawSloth,unlock:'gravity'},
  {id:'snowfox',name:'שועלת שלג',draw:drawSnowFox,unlock:'snow'},
  {id:'zebra',name:'זברונת',draw:drawZebra,unlock:'savanna'},
  {id:'fishy',name:'דגיגונת',draw:drawFishy,unlock:'lagoon'},
  {id:'spirit',name:'רוחית המנורה',draw:drawSpirit,unlock:'carpet'},
  {id:'swan',name:'ברבורית',draw:drawSwan,unlock:'ball'},
  {id:'rockhorse',name:'סוסת נדנדה',draw:drawRockHorse,unlock:'toyroom'},
  {id:'deer',name:'אילונת',draw:drawDeer,unlock:'redhood'},
  {id:'robin',name:'אדמונית',draw:drawRobin,unlock:'hansel'},
  {id:'llama',name:'לאמה',draw:drawLlama,unlock:'pigs'},
  {id:'goose',name:'אווזת הזהב',draw:drawGoose,unlock:'beanstalk'},
  {id:'butterfly',name:'פרפרית',draw:drawButterfly,unlock:'thorns'},
  {id:'gummy',name:'דובונת גומי',draw:drawGummy,unlock:'match3'},
  {id:'jelly',name:'מדוזונת',draw:drawJellyfish,unlock:'blocks'},
  {id:'phoenix',name:'ציפור האש',draw:drawPhoenix,unlock:'broom'},
  {id:'wizcat',name:'חתולת קוסמים',draw:drawWizCat,unlock:'stairs'},
  {id:'toad',name:'קרפדונת',draw:drawToad,unlock:'potion'},
  {id:'raven',name:'עורבונת',draw:drawRaven,unlock:'owlpost'},
  {id:'pixie',name:'פיונת',draw:drawPixie,unlock:'flykeys'},
  {id:'sprout',name:'נבטונת',draw:drawSprout,unlock:'wand'},
  {id:'gummy2',name:'סוכריית לקקן',draw:drawLolly,unlock:'match3b'},
  {id:'cubie',name:'קוביונת',draw:drawCubie,unlock:'blockscore'},
  {id:'snail',name:'שבלולונת',draw:drawSnail,unlock:'giant'},
  {id:'firepup',name:'כלבלבת כבאית',draw:drawFirePup,unlock:'firetruck'},
  {id:'parrot',name:'תוכית',draw:drawParrot,unlock:'schoolbus'},
  {id:'walrus',name:'ניבתנית',draw:drawWalrus,unlock:'train'},
  {id:'crab',name:'סרטנית',draw:drawCrab,unlock:'parking'},
  {id:'cone',name:'קונוסית',draw:drawCone,unlock:'lights'},
  {id:'pug',name:'פאגית',draw:drawPug,unlock:'race'},
  {id:'pelican',name:'שקנאית טייסת',draw:drawPelican,unlock:'plane'}
];

