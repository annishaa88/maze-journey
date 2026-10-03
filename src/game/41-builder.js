/* ================= build your own maze ================= */
const BTH=[1,3,4,9],BSZ=[5,6,7,8,9,10,11,12,13,14,15],BMAX=12,FMAX=12;
const BDECO=['🌸','🌳','🪨','🌻','🍀','🐚','💎','🎈'],BFLOOR=['','#ffadad','#ffd6a5','#fdffb6','#caffbf','#9bf6ff','#bdb2ff'];
const BCRE={1:{e:'👻',f:(c,x,y,r)=>drawGhost(c,x,y,r)},3:{e:'🐒',f:(c,x,y,r)=>drawMonkey(c,x,y,r)},4:{e:'👽',f:(c,x,y,r)=>drawAlien(c,x,y,r)},9:{e:'🦊',f:(c,x,y,r)=>drawFox(c,x,y,r)}};
const BTOOLS={
  wall:['🧱','בלוק','מציירים קירות עבים. אפשר לגרור את האצבע'],line:['✏️','קו דק','מציירים קו דק בין שני ריבועים, כמו במבוכים של המשחק'],erase:['🧽','מחק','מוחקים קירות וחפצים'],
  start:[null,'התחלה','איפה מתחילים?'],goal:[null,'יעד','לאן צריך להגיע?'],star:['⭐','כוכב','שמים שלושה כוכבים'],
  key:['🗝️','מפתח','מפתח פותח את הדלת בצבע שלו'],door:['🚪','דלת','דלת שמים על קו בין שני ריבועים פתוחים'],portal:['🌀','פורטל','נוגעים בשני מקומות: הכניסה והיציאה של הפורטל'],
  mush:['🍄','פטרייה','פטרייה הופכת את החצים'],bridge:['🌉','גשר','גשר נופל אחרי שעוברים עליו'],creature:[null,'יצור','נוגעים ביצור וגוררים כדי לסמן את הדרך שלו'],
  paint:['🖌️','צבע','צובעים את הרצפה'],deco:['🌸','קישוט','שמים קישוטים'],unpaint:['🧽','מחק צבע','מוחקים צבע וקישוטים']};
const BTABS={walls:['wall','line','erase'],places:['start','goal','star'],deco:['paint','deco','unpaint']};
const BSPEC={1:['key','door'],3:['bridge'],4:['portal'],9:['mush']};
let bTargetFor=null,myMazes=[],bEd=null,bTab='walls',bTool='wall',bCol=0,bUndo=[],bDel=null,bStroke=null,bPlaying=null,bPlayFam=null,bNote=null,bPend=null,bRobot=null,bTarget=0;
const bK=(x,y)=>x+','+y,bSame=(a,x,y)=>a&&a[0]===x&&a[1]===y;
function bSave(){save('journey_mymazes',myMazes);}
function famLoad(){return load('journey_family',[]);}function famSave(f){save('journey_family',f);}
function profName(){const p=profiles.find(q=>q.id===curProf);return p?p.name:'';}
function bNorm(d){const n=d.n;return Object.assign(d,{wl:d.wl||[],keys:d.keys||[],doors:d.doors||{},por:d.por||[],mush:d.mush||[],br:d.br||[],cr:d.cr||[],
  fl:d.fl&&d.fl.length===n*n?d.fl:'0'.repeat(n*n),dec:d.dec||[],msg:d.msg||'',st:d.st||[],best:d.best??null});}
function bNew(n){n=n||8;let k=myMazes.length+1;while(myMazes.some(m=>m.name==='המבוך שלי '+k))k++;
  return bNorm({id:Date.now().toString(36)+Math.floor(Math.random()*1e4),name:'המבוך שלי '+k,n,th:0,blk:'0'.repeat(n*n),s:[0,0],g:[n-1,n-1],st:[]});}
const bAt=(d,x,y)=>d.blk[y*d.n+x]==='1';
function bSet(d,x,y,v){const i=y*d.n+x;d.blk=d.blk.slice(0,i)+(v?'1':'0')+d.blk.slice(i+1);}
function bSetFl(d,x,y,v){const i=y*d.n+x;d.fl=d.fl.slice(0,i)+v+d.fl.slice(i+1);}
const bThId=d=>BTH[d.th]||1;
// the special pieces that belong to the chosen world
function bItems(d){const t=bThId(d);return {keys:t===1?d.keys:[],doors:t===1?d.doors:{},por:t===4?d.por:[],mush:t===9?d.mush:[],br:t===3?d.br:[]};}
function bItemAt(d,x,y){
  if(bSame(d.s,x,y))return 'start';if(bSame(d.g,x,y))return 'goal';if(d.st.some(c=>bSame(c,x,y)))return 'star';const I=bItems(d);
  if(I.keys.some(k=>k.x===x&&k.y===y))return 'key';if(I.por.some(p=>bSame(p.a,x,y)||bSame(p.b,x,y)))return 'portal';
  if(I.mush.some(c=>bSame(c,x,y)))return 'mush';if(I.br.some(c=>bSame(c,x,y)))return 'bridge';if(d.cr.some(c=>c.cells.some(q=>bSame(q,x,y))))return 'creature';return null;}
// walls of the finished level: blocks are closed squares, thin lines close one side
function bG(d){const n=d.n,W=new Set(d.wl),g=[];
  for(let y=0;y<n;y++){g.push([]);for(let x=0;x<n;x++){const me=bAt(d,x,y);
    g[y].push(DV.map(([dx,dy],k)=>{const a=x+dx,b=y+dy;if(a<0||b<0||a>=n||b>=n)return 1;if(me!==bAt(d,a,b))return 1;return W.has(GEN.edgeKey(x,y,k))?1:0;}));}}
  return g;}
function bDist(d){const n=d.n,g=bG(d),dist=Array.from({length:n},()=>Array(n).fill(-1)),q=[d.s];dist[d.s[1]][d.s[0]]=0;
  for(let h=0;h<q.length;h++){const [x,y]=q[h];for(let k=0;k<4;k++){if(g[y][x][k])continue;const a=x+DV[k][0],b=y+DV[k][1];if(dist[b][a]>=0)continue;dist[b][a]=dist[y][x]+1;q.push([a,b]);}}return dist;}
// the robot: searches every way to walk, with the keys it holds, the stars it has and the bridges that fell
function bSolve(d){
  const n=d.n,g=bG(d),I=bItems(d),keyAt=new Map(I.keys.map(k=>[bK(k.x,k.y),k.c])),door=I.doors,starAt=new Map(d.st.map((c,i)=>[bK(...c),i])),brAt=new Map(I.br.map((c,i)=>[bK(...c),i]));
  const tele=new Map();I.por.forEach(p=>{tele.set(bK(...p.a),p.b);tele.set(bK(...p.b),p.a);});
  const RK=1<<Math.max(0,...I.keys.map(k=>k.c+1),0),RS=1<<d.st.length,RB=1<<I.br.length,RE=I.br.length?5:1,ALL=RS-1;
  const enc=(x,y,K,S,B,e)=>((((y*n+x)*RK+K)*RS+S)*RB+B)*RE+(RE>1?e:0);
  const N=n*n*RK*RS*RB*RE,prev=new Int32Array(N).fill(-2),q=new Int32Array(N);let h=0,t=0;
  const s0=enc(d.s[0],d.s[1],0,0,0,4);prev[s0]=-1;q[t++]=s0;
  const order=[d.s.slice()],seen=new Uint8Array(n*n);seen[d.s[1]*n+d.s[0]]=1;let starSeen=0,goalAny=false,found=-1;
  const dec=v=>{const e=RE>1?v%RE:4;v=Math.floor(v/RE);const B=v%RB;v=Math.floor(v/RB);const S=v%RS;v=Math.floor(v/RS);const K=v%RK;v=Math.floor(v/RK);return [v%n,Math.floor(v/n),K,S,B,e];};
  while(h<t){const st=q[h++],[x,y,K,S,B,e]=dec(st);
    if(x===d.g[0]&&y===d.g[1]){goalAny=true;if(S===ALL&&d.st.length===3){found=st;break;}continue;}
    for(let k=0;k<4;k++){if(g[y][x][k])continue;const ek=GEN.edgeKey(x,y,k);if(door[ek]!==undefined&&!((K>>door[ek])&1))continue;
      let nx=x+DV[k][0],ny=y+DV[k][1],B2=B;const bi=brAt.get(bK(x,y));if(bi!==undefined&&e===k)B2|=1<<bi;
      const nbi=brAt.get(bK(nx,ny));if(nbi!==undefined&&((B2>>nbi)&1))continue;
      let K2=K,S2=S;const kc=keyAt.get(bK(nx,ny));if(kc!==undefined)K2|=1<<kc;const si=starAt.get(bK(nx,ny));if(si!==undefined)S2|=1<<si;
      let e2=nbi!==undefined?k:4;const tp=tele.get(bK(nx,ny));if(tp){nx=tp[0];ny=tp[1];e2=4;}
      if(!seen[ny*n+nx]){seen[ny*n+nx]=1;order.push([nx,ny]);}starSeen|=S2;
      const ns=enc(nx,ny,K2,S2,B2,e2);if(prev[ns]!==-2)continue;prev[ns]=st;q[t++]=ns;}}
  const path=[];if(found>=0){let v=found;while(v>=0){const [x,y]=dec(v);path.unshift([x,y]);v=prev[v];}}
  return {found:found>=0,goalAny,path,order,steps:path.length-1,lost:d.st.filter((c,i)=>!((starSeen>>i)&1)),g};
}
const bMemo=new Map();
function bCheck(d){
  const sig=JSON.stringify([d.n,d.th,d.blk,d.wl,d.s,d.g,d.st,d.keys,d.doors,d.por,d.br]);if(bMemo.has(sig))return bMemo.get(sig);
  const out=bCheck0(d);bMemo.set(sig,out);if(bMemo.size>30)bMemo.delete(bMemo.keys().next().value);return out;
}
function bCheck0(d){
  const r=bSolve(d);let msg,ok=false;const hasDoor=Object.keys(bItems(d).doors).length>0;
  if(!r.goalAny)msg=hasDoor?'😮 אי אפשר להגיע אל היעד. אולי חסר מפתח 🗝️ או שהקירות סוגרים':'😮 אין דרך מההתחלה אל היעד. מחקי קצת קירות 🧽';
  else if(r.lost.length)msg='😮 יש כוכב שאי אפשר להגיע אליו';
  else if(d.st.length<3)msg=(3-d.st.length===1?'חסר עוד כוכב אחד':'חסרים עוד '+(3-d.st.length)+' כוכבים')+' ⭐ שימי אותם במבוך';
  else if(!r.found)msg='🤔 אי אפשר לאסוף את כל הכוכבים ואז להגיע ליעד';
  else{ok=true;msg='✅ המבוך מוכן! הדרך הכי קצרה: '+r.steps+' צעדים';}
  return Object.assign(r,{ok,msg,goalOk:r.goalAny});
}
// how hard is it? long roads, dead ends and special pieces all count
function bDiff(d,r){
  if(!r.ok)return null;const n=d.n,g=r.g,I=bItems(d);let dead=0;
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){if(bAt(d,x,y)||bSame(d.s,x,y)||bSame(d.g,x,y))continue;if(g[y][x].filter(w=>!w).length===1)dead++;}
  const v=r.steps/(n*1.6)+dead/(n*.9)+I.keys.length*.5+Object.keys(I.doors).length*.3+I.por.length*.4+I.mush.length*.25+I.br.length*.4+d.cr.length*.45;
  const lv=v<1.3?0:v<2.5?1:2;
  return {v,lv,label:['😊 קל','🤔 בינוני','😈 קשה'][lv],pct:Math.min(100,Math.round(v/3.5*100)),
    tip:lv===0?'רוצה שיהיה קשה יותר? עוד פניות ומבויים סתומים, כוכבים בפינות רחוקות, או חפצים מיוחדים ✨':lv===1?'כמעט קשה! עוד כמה מבויים סתומים או יצור 🐾 יעשו את זה':'וואו, מבוך מאתגר! 💪'};
}
function bLevel(d){
  const n=d.n,blk=[],I=bItems(d),r=bCheck(d);for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(bAt(d,x,y))blk.push([x,y]);
  const stars=d.st.map(c=>c.slice());stars.rest=[];
  return {g:r.g.map(row=>row.map(w=>w.slice())),n,start:{x:d.s[0],y:d.s[1]},goal:{x:d.g[0],y:d.g[1]},stars,best:r.steps,blk,fl:d.fl,dec:d.dec.map(q=>q.slice()),
    doors:Object.assign({},I.doors),keys:I.keys.map(k=>({x:k.x,y:k.y,c:k.c})),bridges:I.br.map(([x,y])=>({x,y})),
    monkeys:d.cr.map(c=>({cells:c.cells.map(q=>q.slice()),i:0,dir:1,t:Math.floor(Math.random()*11)})),
    portals:I.por.map((p,i)=>({a:{x:p.a[0],y:p.a[1]},b:{x:p.b[0],y:p.b[1]},c:i})),mush:I.mush.map(([x,y])=>({x,y}))};
}
/* ---------- drawing the editor board ---------- */
function bEdgeLine(c,key,s){const [a,b,o]=key.split(',');const x=+a,y=+b;c.beginPath();if(o==='h'){c.moveTo((x+1)*s,y*s);c.lineTo((x+1)*s,(y+1)*s);}else{c.moveTo(x*s,(y+1)*s);c.lineTo((x+1)*s,(y+1)*s);}c.stroke();}
function bPaint(c,d,px,marks,now){
  const n=d.n,s=px/n,W=WORLDS[bThId(d)],I=bItems(d);c.clearRect(0,0,px,px);c.fillStyle=W.hex;c.fillRect(0,0,px,px);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const f=+d.fl[y*n+x];if(f){c.globalAlpha=.75;c.fillStyle=BFLOOR[f];c.fillRect(x*s,y*s,s+.5,s+.5);c.globalAlpha=1;}}
  c.strokeStyle='rgba(255,255,255,.22)';c.lineWidth=Math.max(1,px/300);c.beginPath();for(let i=1;i<n;i++){c.moveTo(i*s,0);c.lineTo(i*s,px);c.moveTo(0,i*s);c.lineTo(px,i*s);}c.stroke();
  c.textAlign='center';c.textBaseline='middle';
  c.font=Math.round(s*.5)+'px serif';d.dec.forEach(([x,y,i])=>{c.fillStyle='#000';c.fillText(BDECO[i]||'🌸',(x+.5)*s,(y+.55)*s);});
  for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(bAt(d,x,y)){const m=s*.05;c.fillStyle=W.deep;c.fillRect(x*s+m,y*s+m,s-2*m,s-2*m);c.fillStyle='rgba(255,255,255,.22)';c.fillRect(x*s+m,y*s+m,s-2*m,s*.16);
    c.fillStyle='rgba(0,0,0,.18)';c.fillRect(x*s+m,y*s+s-m-s*.12,s-2*m,s*.12);}
  c.lineCap='round';c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=Math.max(5,s*.24);d.wl.forEach(k=>bEdgeLine(c,k,s));c.strokeStyle='#241a3a';c.lineWidth=Math.max(3,s*.15);d.wl.forEach(k=>bEdgeLine(c,k,s));
  c.lineCap='butt';Object.keys(I.doors).forEach(k=>{c.strokeStyle=KEYC[I.doors[k]].c;c.lineWidth=Math.max(5,s*.26);bEdgeLine(c,k,s);});c.lineCap='round';
  I.br.forEach(([x,y])=>{c.fillStyle='#8a6034';for(let i=0;i<4;i++)c.fillRect(x*s+s*.1,y*s+s*(.14+i*.2),s*.8,s*.13);});
  I.mush.forEach(([x,y])=>drawMushroom(c,(x+.5)*s,(y+.55)*s,s*.36));
  I.por.forEach((p,i)=>{drawPortal(c,(p.a[0]+.5)*s,(p.a[1]+.5)*s,s*.42,PORTALC[i],now||0);drawPortal(c,(p.b[0]+.5)*s,(p.b[1]+.5)*s,s*.42,PORTALC[i],(now||0)+700);});
  if(bPend&&marks){c.strokeStyle=PORTALC[d.por.length%PORTALC.length];c.setLineDash([s*.12,s*.1]);c.lineWidth=Math.max(2,s*.08);c.beginPath();c.arc((bPend[0]+.5)*s,(bPend[1]+.5)*s,s*.42,0,7);c.stroke();c.setLineDash([]);}
  I.keys.forEach(k=>drawKey(c,(k.x+.5)*s,(k.y+.5)*s,s*.6,KEYC[k.c].c));
  const CR=BCRE[bThId(d)];d.cr.forEach(cr=>{c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=Math.max(2,s*.08);c.setLineDash([s*.1,s*.12]);c.beginPath();
    cr.cells.forEach(([x,y],i)=>i?c.lineTo((x+.5)*s,(y+.5)*s):c.moveTo((x+.5)*s,(y+.5)*s));c.stroke();c.setLineDash([]);
    const [ex,ey]=cr.cells[cr.cells.length-1];if(cr.cells.length>1)circle(c,(ex+.5)*s,(ey+.5)*s,s*.1,'#ffffff');CR.f(c,(cr.cells[0][0]+.5)*s,(cr.cells[0][1]+.5)*s,s*.4);});
  const chk=marks?bCheck(d):null,bad=(x,y)=>{c.strokeStyle='#e63946';c.lineWidth=Math.max(2,s*.09);c.beginPath();c.arc((x+.5)*s,(y+.5)*s,s*.44,0,7);c.stroke();};
  c.font=Math.round(s*.6)+'px serif';
  d.st.forEach(([x,y])=>{c.fillStyle='#000';c.fillText('⭐',(x+.5)*s,(y+.55)*s);if(chk&&chk.lost.some(q=>q[0]===x&&q[1]===y))bad(x,y);});
  W.goal(c,(d.g[0]+.5)*s,(d.g[1]+.55)*s,s*.36);if(chk&&!chk.goalOk)bad(d.g[0],d.g[1]);
  drawChar(c,curChar(),(d.s[0]+.5)*s,(d.s[1]+.58)*s,s*.34);
  return chk;
}
// the robot's search: a wave spreads over the maze, then the robot walks the best road
function bRobotDraw(c,s,now){
  const R=bRobot,e=now-R.t0,fl=Math.min(1600,R.order.length*28),k=Math.min(R.order.length,Math.floor(e/fl*R.order.length));
  c.fillStyle='rgba(76,201,240,.38)';for(let i=0;i<k;i++){const [x,y]=R.order[i];c.fillRect(x*s+1,y*s+1,s-2,s-2);}
  if(e<fl||!R.path.length)return e<fl+2200;
  const pd=Math.min(3000,R.path.length*110),pk=Math.min(R.path.length-1,(e-fl)/pd*(R.path.length-1));
  c.strokeStyle='#ff5d8f';c.lineWidth=Math.max(3,s*.16);c.lineCap='round';c.beginPath();
  for(let i=0;i<=Math.floor(pk);i++){const [x,y]=R.path[i],jump=i&&Math.abs(x-R.path[i-1][0])+Math.abs(y-R.path[i-1][1])>1;(i&&!jump)?c.lineTo((x+.5)*s,(y+.5)*s):c.moveTo((x+.5)*s,(y+.5)*s);}c.stroke();
  const i=Math.floor(pk),f=pk-i,[ax,ay]=R.path[i],[bx,by]=R.path[Math.min(i+1,R.path.length-1)],far=Math.abs(bx-ax)+Math.abs(by-ay)>1;
  c.font=Math.round(s*.7)+'px serif';c.fillStyle='#000';c.fillText('🤖',(ax+(far?0:(bx-ax)*f)+.5)*s,(ay+(far?0:(by-ay)*f)+.5)*s);
  if(!R.said&&pk>=R.path.length-1){R.said=true;bNote={t:'🤖 הרובוט הצליח! '+R.steps+' צעדים, עם כל הכוכבים',until:Date.now()+3500};speak(bNote.t);[784,988,1175].forEach((q,j)=>setTimeout(()=>beep(q,.1,'sine'),j*90));}
  return e<fl+pd+2600;
}
function bDraw(){
  if(!bEd)return;const cv=document.getElementById('bCv'),w=cv.getBoundingClientRect().width||340,px=Math.round(w*Math.min(2,window.devicePixelRatio||1));
  if(cv.width!==px){cv.width=px;cv.height=px;}const now=performance.now(),c=cv.getContext('2d');
  const chk=bPaint(c,bEd,px,true,now),m=document.getElementById('bMsg');
  let anim=!!bPend||bItems(bEd).por.length>0;
  if(bRobot){if(bRobotDraw(c,px/bEd.n,now))anim=true;else bRobot=null;}
  if(bNote&&Date.now()<bNote.until){m.textContent=bNote.t;m.className='bmsg '+(bNote.ok?'ok':'bad');}else{m.textContent=chk.msg;m.className='bmsg '+(chk.ok?'ok':'bad');}
  document.getElementById('bPlayBtn').classList.toggle('dim',!chk.ok);document.getElementById('bUndoBtn').disabled=!bUndo.length;
  const df=bDiff(bEd,chk),dv=document.getElementById('bDiff');dv.hidden=!df;
  if(df){document.getElementById('bDiffBar').style.width=df.pct+'%';document.getElementById('bDiffBar').style.background=['#52b788','#ffb703','#e63946'][df.lv];document.getElementById('bDiffT').textContent=df.label;document.getElementById('bDiffTip').textContent=df.tip;}
  document.getElementById('bDiffTip').hidden=!df;
  if(anim&&!bDraw.raf)bDraw.raf=requestAnimationFrame(()=>{bDraw.raf=0;if(!document.getElementById('buildScreen').hidden)bDraw();});
}
function bHint(t,ok){bNote={t,until:Date.now()+2400,ok};speak(t);if(!ok)beep(200,.08,'triangle');bDraw();setTimeout(bDraw,2500);}
function bPush(){bUndo.push(JSON.stringify(bEd));if(bUndo.length>40)bUndo.shift();}
// which line between two squares is the finger on?
function bEdgeAt(d,fx,fy){const n=d.n,X=Math.round(fx),Y=Math.round(fy),dx=Math.abs(fx-X),dy=Math.abs(fy-Y);
  if(dx<dy){const y=Math.floor(fy);if(X<=0||X>=n||y<0||y>=n)return null;return (X-1)+','+y+',h';}
  const x=Math.floor(fx);if(Y<=0||Y>=n||x<0||x>=n)return null;return x+','+(Y-1)+',v';}
function bEdgeCells(k){const [a,b,o]=k.split(',');const x=+a,y=+b;return o==='h'?[[x,y],[x+1,y]]:[[x,y],[x,y+1]];}
function bClearCell(d,x,y){
  d.st=d.st.filter(c=>!bSame(c,x,y));d.keys=d.keys.filter(k=>!(k.x===x&&k.y===y));d.mush=d.mush.filter(c=>!bSame(c,x,y));d.br=d.br.filter(c=>!bSame(c,x,y));
  d.por=d.por.filter(p=>!bSame(p.a,x,y)&&!bSame(p.b,x,y));d.cr=d.cr.filter(c=>!c.cells.some(q=>bSame(q,x,y)));d.dec=d.dec.filter(q=>!(q[0]===x&&q[1]===y));if(bSame(bPend,x,y))bPend=null;}
function bApply(p){
  const d=bEd,{x,y,fx,fy,first}=p,it=bItemAt(d,x,y),before=JSON.stringify(d),T=bTool,free=!it&&!bAt(d,x,y);
  if(T==='wall'){if(first)bStroke.paint=!bAt(d,x,y);
    if(it){if(first)bHint('כאן כבר יש משהו. קיר שמים במקום ריק 🙂');return;}
    bSet(d,x,y,bStroke.paint);if(bStroke.paint)d.dec=d.dec.filter(q=>!(q[0]===x&&q[1]===y));}
  else if(T==='line'){const e=bEdgeAt(d,fx,fy);if(!e)return;const W=new Set(d.wl);if(first)bStroke.paint=!W.has(e);
    if(bStroke.paint){W.add(e);delete d.doors[e];}else W.delete(e);d.wl=[...W];}
  else if(T==='erase'){if(bAt(d,x,y))bSet(d,x,y,false);bClearCell(d,x,y);}
  else if(T==='start'){if(it==='goal')return;bSet(d,x,y,false);bClearCell(d,x,y);d.s=[x,y];bCoachFlag('start');}
  else if(T==='goal'){if(it==='start')return;bSet(d,x,y,false);bClearCell(d,x,y);d.g=[x,y];bCoachFlag('goal');}
  else if(T==='star'){if(!first||it==='start'||it==='goal')return;
    if(it==='star')d.st=d.st.filter(c=>!bSame(c,x,y));else if(d.st.length>=3){bHint('יש כבר 3 כוכבים. נגיעה בכוכב מורידה אותו');return;}else{bSet(d,x,y,false);bClearCell(d,x,y);d.st.push([x,y]);}}
  else if(T==='key'){if(!first)return;const k=d.keys.find(q=>q.x===x&&q.y===y);
    if(k){d.keys=d.keys.filter(q=>q!==k);}else{if(it||bAt(d,x,y)){bHint('מפתח שמים במקום ריק 🙂');return;}d.keys=d.keys.filter(q=>q.c!==bCol);d.keys.push({x,y,c:bCol});}}
  else if(T==='door'){if(!first)return;const e=bEdgeAt(d,fx,fy);if(!e)return;const [[ax,ay],[cx,cy]]=bEdgeCells(e);
    if(d.doors[e]===bCol){delete d.doors[e];}
    else{if(bAt(d,ax,ay)||bAt(d,cx,cy)||d.wl.includes(e)){bHint('דלת שמים על קו בין שני ריבועים פתוחים 🚪');return;}
      if(Object.keys(d.doors).length>=6&&d.doors[e]===undefined){bHint('אפשר עד 6 דלתות');return;}d.doors[e]=bCol;
      if(!d.keys.some(k=>k.c===bCol))setTimeout(()=>bHint('אל תשכחי מפתח '+KEYC[bCol].m+' 🗝️'),300);}}
  else if(T==='portal'){if(!first)return;
    if(it==='portal'){d.por=d.por.filter(q=>!bSame(q.a,x,y)&&!bSame(q.b,x,y));}
    else if(bSame(bPend,x,y)){bPend=null;}
    else if(!free){bHint('פורטל שמים במקום ריק 🙂');return;}
    else if(bPend){d.por.push({a:bPend,b:[x,y]});bPend=null;beep(900,.08,'sine');}
    else if(d.por.length>=3){bHint('אפשר עד 3 זוגות פורטלים');return;}
    else{bPend=[x,y];bHint('יופי! עכשיו נוגעים במקום שבו הפורטל יוצא 🌀',true);}}
  else if(T==='mush'||T==='bridge'){if(!first)return;const L=T==='mush'?'mush':'br',max=T==='mush'?6:3;
    if(d[L].some(c=>bSame(c,x,y)))d[L]=d[L].filter(c=>!bSame(c,x,y));
    else{if(!free){bHint((T==='mush'?'פטרייה':'גשר')+' שמים במקום ריק 🙂');return;}if(d[L].length>=max){bHint('אפשר עד '+max);return;}d[L].push([x,y]);}}
  else if(T==='creature'){
    if(first){const c=d.cr.find(c=>c.cells.some(q=>bSame(q,x,y)));if(c){d.cr=d.cr.filter(q=>q!==c);bStroke.cr=null;}
      else if(!free){bHint('יצור שמים במקום ריק 🙂');return;}else if(d.cr.length>=4){bHint('אפשר עד 4 יצורים');return;}
      else{bStroke.cr={cells:[[x,y]]};d.cr.push(bStroke.cr);}}
    else if(bStroke.cr){const cs=bStroke.cr.cells,[lx,ly]=cs[cs.length-1];if(bSame(cs[cs.length-1],x,y))return;
      const dx=x-lx,dy=y-ly;if(Math.abs(dx)+Math.abs(dy)!==1||cs.length>=6)return;
      if(cs.length>1){const [px2,py2]=cs[cs.length-2];if(x-lx!==lx-px2||y-ly!==ly-py2)return;}
      const k=DV.findIndex(v=>v[0]===dx&&v[1]===dy);if(bG(d)[ly][lx][k]||bItemAt(d,x,y))return;cs.push([x,y]);}}
  else if(T==='paint'){if(bAt(d,x,y))return;bSetFl(d,x,y,String(bCol+1));}
  else if(T==='unpaint'){bSetFl(d,x,y,'0');d.dec=d.dec.filter(q=>!(q[0]===x&&q[1]===y));}
  else if(T==='deco'){if(!first)return;const q=d.dec.find(q=>q[0]===x&&q[1]===y);
    if(q)d.dec=d.dec.filter(z=>z!==q);else{if(it||bAt(d,x,y)){bHint('קישוט שמים במקום ריק 🙂');return;}if(d.dec.length>=40){bHint('יש כבר הרבה קישוטים 🙂');return;}d.dec.push([x,y,bCol]);}}
  if(JSON.stringify(d)!==before){bRobot=null;beep({erase:380,unpaint:380,wall:300,line:330,paint:520}[T]||700,.03,'sine');bDraw();}
}
function bCommit(){bSave();bDraw();bCoachCheck();}
/* ---------- the builder coach: one small step at a time ---------- */
const BCOACH=[
  {t:'מציירים קירות! גררי את האצבע על הלוח 🧱 כשסיימת, לחצי "סיימתי"',tab:'walls',tool:'wall',hl:'#bCv',done:(d,f)=>f.walls},
  {t:'איפה מתחילים? געי בריבוע שבו הדמות שלך תעמוד 📍',tab:'places',tool:'start',hl:'#bCv',done:(d,f)=>f.start},
  {t:'לאן צריך להגיע? געי בריבוע של היעד 🏁',tab:'places',tool:'goal',hl:'#bCv',done:(d,f)=>f.goal},
  {t:'עכשיו שלושה כוכבים ⭐ שימי אותם במקומות שקשה להגיע אליהם',tab:'places',tool:'star',hl:'#bCv',done:d=>d.st.length>=3},
  {t:'בואי נבדוק שאפשר לעבור: לחצי על "🤖 הרובוט פותר"',hl:'#bRobotBtn',done:(d,f)=>f.robot&&bCheck(d).ok},
  {t:'המבוך מוכן! לחצי "▶ לשחק במבוך" ונסי אותו 🎉',hl:'#bPlayBtn',done:(d,f)=>f.play}];
const BTIPS={1:'🏰 בטירה: שמים 🚪 דלת על הקו בין שני ריבועים, ו🗝️ מפתח באותו צבע במקום אחר במבוך. בלי המפתח אי אפשר לעבור!',
  3:'🌴 בג׳ונגל: 🌉 גשר נופל אחרי שעוברים עליו, אז אי אפשר לחזור באותה דרך. תכנני טוב!',
  4:'🚀 בחלל: 🌀 פורטל. נוגעים בכניסה ואחר כך ביציאה. מי שנכנס קופץ לצד השני!',
  9:'🍄 ביער: מי שעולה על פטרייה, החצים שלה מתהפכים. למעלה נהיה למטה!',
  deco:'🎨 כאן מקשטים: צובעים את הרצפה 🖌️ ושמים פרחים ואבנים 🌸. זה רק ליופי, לא מפריע ללכת.'};
let bCo=null,bTipNow=null;
function bCoachStart(){bCo={i:0,f:{}};bTipNow=null;while(bCo.i<BCOACH.length&&BCOACH[bCo.i].done(bEd,bCo.f))bCo.i++;bCoachEnter();}
function bCoachEnter(){
  if(bCo.i>=BCOACH.length){bCo.final=true;const t='כל הכבוד! 🎉 בנית מבוך! רוצה עוד? ב"✨ מיוחדים" יש מפתחות, פורטלים ויצורים, וב"🎨 קישוט" צבעים ופרחים.';speak(t);chime([523,659,784,1047],100,.1,'sine');return;}
  const st=BCOACH[bCo.i];if(st.tab){bTab=st.tab;bTool=st.tool;bPend=null;}speak(st.t);
}
function bCoachCheck(){
  if(!bCo||bCo.final||!bEd)return;let moved=false;
  while(bCo.i<BCOACH.length&&BCOACH[bCo.i].done(bEd,bCo.f)){bCo.i++;moved=true;}
  if(moved){chime([784,988],90,.08,'sine');bCoachEnter();renderBuild();}
}
function bCoachFlag(k){if(bCo&&!bCo.final){bCo.f[k]=true;}}
function bShowTip(key){if(bCo&&!bCo.final)return;const seen=load('journey_btips',{});if(seen[key]||!BTIPS[key])return;bTipNow=key;speak(BTIPS[key]);}
function bCoachRender(){
  const el=document.getElementById('bCoach');document.querySelectorAll('.coach-hl').forEach(e=>e.classList.remove('coach-hl'));
  const nx=document.getElementById('bCoachNext'),xx=document.getElementById('bCoachX'),dots=document.getElementById('bCoachDots');
  if(bCo){el.hidden=false;dots.innerHTML='';
    if(bCo.final){document.getElementById('bCoachT').textContent='כל הכבוד! 🎉 בנית מבוך! רוצה עוד? ב"✨ מיוחדים" יש מפתחות, פורטלים ויצורים, וב"🎨 קישוט" צבעים ופרחים.';nx.textContent='סיום 👍';xx.hidden=true;}
    else{const st=BCOACH[bCo.i];let t=st.t;if(bCo.i===4&&bCo.f.robot&&!bCheck(bEd).ok)t='הרובוט לא מצא דרך 🤔 תקני לפי ההודעה האדומה מתחת ללוח, ואז נסי שוב';
      document.getElementById('bCoachT').textContent=t;nx.textContent=bCo.i===0?'סיימתי ✓':'דלגי ◀';xx.hidden=false;
      BCOACH.forEach((q,i)=>{const d=document.createElement('i');d.className=i<bCo.i?'on':i===bCo.i?'cur':'';dots.appendChild(d);});
      let tg=null;if(st.tab&&bTab!==st.tab)tg=document.querySelector('#bTabs [data-tab="'+st.tab+'"]');else if(st.tool&&bTool!==st.tool)tg=document.querySelector('#bTools [data-t="'+st.tool+'"]');else tg=document.querySelector(st.hl);
      if(tg){tg.classList.add('coach-hl');if(bCo.shown!==bCo.i){bCo.shown=bCo.i;const r=tg.getBoundingClientRect();if(r.bottom>innerHeight||r.top<0)setTimeout(()=>tg.scrollIntoView({block:'center',behavior:calmFx()?'auto':'smooth'}),250);}}}
  }else if(bTipNow){el.hidden=false;dots.innerHTML='';document.getElementById('bCoachT').textContent=BTIPS[bTipNow];nx.textContent='הבנתי 👍';xx.hidden=true;}
  else el.hidden=true;
  if(!el.hidden){const c=document.getElementById('bCoachC').getContext('2d');c.clearRect(0,0,88,88);drawChar(c,curChar(),44,50,30);}
}

function bResize(d,n){
  const o=JSON.parse(JSON.stringify(d)),inb=([x,y])=>x<n&&y<n;d.n=n;d.blk='0'.repeat(n*n);d.fl='0'.repeat(n*n);
  for(let y=0;y<Math.min(n,o.n);y++)for(let x=0;x<Math.min(n,o.n);x++){if(bAt(o,x,y))bSet(d,x,y,true);bSetFl(d,x,y,o.fl[y*o.n+x]);}
  const cl=v=>Math.min(n-1,v);d.s=[cl(o.s[0]),cl(o.s[1])];d.g=inb(o.g)?o.g.slice():[n-1,n-1];if(bSame(d.g,...d.s))d.g=bSame(d.s,n-1,n-1)?[0,n-1]:[n-1,n-1];
  bSet(d,...d.s,false);bSet(d,...d.g,false);
  const okC=c=>inb(c)&&!bSame(d.s,...c)&&!bSame(d.g,...c);
  d.st=o.st.filter(okC);d.keys=o.keys.filter(k=>okC([k.x,k.y]));d.mush=o.mush.filter(okC);d.br=o.br.filter(okC);d.dec=o.dec.filter(okC);
  d.por=o.por.filter(p=>okC(p.a)&&okC(p.b));d.cr=o.cr.filter(c=>c.cells.every(okC));
  const okE=k=>bEdgeCells(k).every(inb);d.wl=o.wl.filter(okE);d.doors={};Object.keys(o.doors).filter(okE).forEach(k=>d.doors[k]=o.doors[k]);bPend=null;
}
// a surprise maze to start from: a real labyrinth with thin walls, like the mazes in the game, with a few extra openings
function bRandom(d){
  const n=d.n,W=new Set();for(let y=0;y<n;y++)for(let x=0;x<n;x++){if(x<n-1)W.add(x+','+y+',h');if(y<n-1)W.add(x+','+y+',v');}
  const vis=new Set(['0,0']),stack=[[0,0]];
  while(stack.length){const [x,y]=stack[stack.length-1];
    const nb=pzShuffle([0,1,2,3]).map(k=>[x+DV[k][0],y+DV[k][1],k]).filter(([a,b])=>a>=0&&b>=0&&a<n&&b<n&&!vis.has(a+','+b));
    if(!nb.length){stack.pop();continue;}const [a,b,k]=nb[0];W.delete(GEN.edgeKey(x,y,k));vis.add(a+','+b);stack.push([a,b]);}
  const all=[...W];pzShuffle(all).slice(0,Math.floor(n*.6)).forEach(k=>W.delete(k));
  Object.assign(d,{blk:'0'.repeat(n*n),wl:[...W],s:[0,0],st:[],g:[n-1,n-1],keys:[],doors:{},por:[],mush:[],br:[],cr:[]});bPend=null;
  const dist=bDist(d);let far=[0,0];for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(dist[y][x]>dist[far[1]][far[0]])far=[x,y];d.g=far;
  const cells=[];for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(dist[y][x]>=2&&!bSame(far,x,y))cells.push([x,y]);
  // stars go into far corners and dead ends when possible
  const g=bG(d),score=([x,y])=>dist[y][x]+(g[y][x].filter(w=>!w).length===1?n:0)+Math.random()*n;
  const pick=[];cells.sort((a,b)=>score(b)-score(a)).forEach(c=>{if(pick.length<3&&pick.every(q=>Math.abs(q[0]-c[0])+Math.abs(q[1]-c[1])>=Math.max(2,n/3)))pick.push(c);});
  d.st=pick.length===3?pick:pzShuffle(cells).slice(0,3);
}
/* ---------- share codes: every piece packed into a short line of letters ---------- */
function bEncode(d){
  const out=[];let acc=0,nb=0;const put=(v,b)=>{for(let i=b-1;i>=0;i--){acc=(acc<<1)|((v>>i)&1);if(++nb===8){out.push(acc);acc=0;nb=0;}}},P=([x,y])=>{put(x,4);put(y,4);};
  put(d.n,4);put(d.th,2);P(d.s);P(d.g);put(d.st.length,2);d.st.forEach(P);
  put(d.keys.length,2);d.keys.forEach(k=>{P([k.x,k.y]);put(k.c,2);});const D=Object.keys(d.doors);put(D.length,3);D.forEach(k=>{const [a,b,o]=k.split(',');P([+a,+b]);put(o==='h'?1:0,1);put(d.doors[k],2);});
  put(d.por.length,2);d.por.forEach(p=>{P(p.a);P(p.b);});put(d.mush.length,3);d.mush.forEach(P);put(d.br.length,2);d.br.forEach(P);
  put(d.cr.length,3);d.cr.forEach(c=>{put(c.cells.length,3);c.cells.forEach(P);});put(Math.min(63,d.dec.length),6);d.dec.slice(0,63).forEach(q=>{P(q);put(q[2],3);});
  const u=new TextEncoder().encode(d.msg||'').slice(0,127);put(u.length,7);u.forEach(b=>put(b,8));
  const W=new Set(d.wl);for(let i=0;i<d.n*d.n;i++){const x=i%d.n,y=Math.floor(i/d.n);put(bAt(d,x,y)?1:0,1);put(W.has(x+','+y+',h')?1:0,1);put(W.has(x+','+y+',v')?1:0,1);put(+d.fl[i],3);}
  if(nb)put(0,8-nb);
  return 'M2'+btoa(String.fromCharCode(...out)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function bDecode(code){
  code=code.trim();
  try{if(code.startsWith('M2')){const s=atob(code.slice(2).replace(/-/g,'+').replace(/_/g,'/')),b=[...s].map(c=>c.charCodeAt(0));let pos=0;
      const get=k=>{let v=0;for(let i=0;i<k;i++){const byte=b[pos>>3];if(byte==null)throw 0;v=(v<<1)|((byte>>(7-(pos&7)))&1);pos++;}return v;},P=()=>[get(4),get(4)];
      const n=get(4);if(!BSZ.includes(n))return null;const d=bNew(n);d.th=get(2);d.s=P();d.g=P();d.st=Array.from({length:get(2)},P);
      d.keys=Array.from({length:get(2)},()=>{const [x,y]=P();return {x,y,c:Math.min(2,get(2))};});const nd=get(3);for(let i=0;i<nd;i++){const [x,y]=P(),o=get(1)?'h':'v';d.doors[x+','+y+','+o]=Math.min(2,get(2));}
      d.por=Array.from({length:get(2)},()=>({a:P(),b:P()}));d.mush=Array.from({length:get(3)},P);d.br=Array.from({length:get(2)},P);
      d.cr=Array.from({length:get(3)},()=>({cells:Array.from({length:get(3)},P)}));d.dec=Array.from({length:get(6)},()=>{const [x,y]=P();return [x,y,get(3)];});
      const ml=get(7),mb=new Uint8Array(ml);for(let i=0;i<ml;i++)mb[i]=get(8);d.msg=new TextDecoder().decode(mb);
      let blk='',fl='';const wl=[];for(let i=0;i<n*n;i++){const x=i%n,y=Math.floor(i/n);blk+=get(1)?'1':'0';if(get(1))wl.push(x+','+y+',h');if(get(1))wl.push(x+','+y+',v');fl+=Math.min(6,get(3));}
      Object.assign(d,{blk,fl,wl,name:'מבוך במתנה 🎁'});
      const inb=([x,y])=>x<n&&y<n;if(![d.s,d.g,...d.st,...d.mush,...d.br,...d.keys.map(k=>[k.x,k.y]),...d.por.flatMap(p=>[p.a,p.b]),...d.cr.flatMap(c=>c.cells)].every(inb)||bSame(d.s,...d.g))return null;
      d.th=Math.min(BTH.length-1,d.th);return d;}
    // the first, simpler codes
    const s=atob(code.replace(/-/g,'+').replace(/_/g,'/')),b=[...s].map(c=>c.charCodeAt(0)),n=b[0],k=b[6];
    if(!BSZ.includes(n)||k>3)return null;const st=[];for(let i=0;i<k;i++)st.push([b[7+2*i],b[8+2*i]]);
    let blk='';const off=7+2*k;for(let i=0;i<n*n;i++){const byte=b[off+(i>>3)];if(byte==null)return null;blk+=(byte>>(7-(i&7)))&1?'1':'0';}
    const d=Object.assign(bNew(n),{th:Math.min(BTH.length-1,b[1]),blk,s:[b[2],b[3]],g:[b[4],b[5]],st,name:'מבוך במתנה 🎁'});
    if([d.s,d.g,...st].some(([x,y])=>!(x<n&&y<n))||bSame(d.s,...d.g))return null;return d;}catch(e){return null;}
}
/* ---------- screens ---------- */
function bOpen(edit){
  myMazes=load('journey_mymazes',[]).map(bNorm);bEd=edit?myMazes.find(m=>m.id===edit)||null:null;bUndo=[];bDel=null;bPend=null;bRobot=null;
  ['mapScreen','gameScreen'].forEach(id=>document.getElementById(id).hidden=true);document.getElementById('buildScreen').hidden=false;renderBuild();window.scrollTo(0,0);
}
function bCard(d,opts){
  const card=document.createElement('div');card.className='bcard';
  const cv=document.createElement('canvas');cv.width=cv.height=240;bPaint(cv.getContext('2d'),d,240,false,0);
  const t=document.createElement('b');t.textContent=d.name;const chk=bCheck(d),df=bDiff(d,chk);
  const r=document.createElement('span');r.className='note';r.textContent=opts.sub||((df?df.label+' · ':'')+(d.best!=null?'🏆 '+fmt(d.best):chk.ok?'עוד לא שיחקו בו':'✏️ עוד לא גמור'));
  card.append(cv,t,r);if(opts.extra)card.appendChild(opts.extra);
  const bb=document.createElement('div');bb.className='bb';
  const go=document.createElement('button');go.className='go';go.textContent='▶';go.setAttribute('aria-label','לשחק ב'+d.name);go.onclick=opts.play;bb.appendChild(go);
  if(opts.edit){const e=document.createElement('button');e.textContent='✏️';e.setAttribute('aria-label','לערוך את '+d.name);e.onclick=opts.edit;bb.appendChild(e);}
  if(opts.del){const key=opts.delKey,del=document.createElement('button');del.className='del'+(bDel===key?' ask':'');del.textContent=bDel===key?'בטוח?':'🗑️';del.setAttribute('aria-label','למחוק את '+d.name);
    del.onclick=()=>{if(bDel===key){opts.del();bDel=null;beep(200,.12,'triangle');}else{bDel=key;setTimeout(()=>{if(bDel===key){bDel=null;renderBuild();}},3000);}renderBuild();};bb.appendChild(del);}
  card.appendChild(bb);return card;
}
function renderBuild(){
  const ed=!!bEd;document.getElementById('bGallery').hidden=ed;document.getElementById('bEditor').hidden=!ed;
  document.getElementById('buildBack').textContent=ed?'→ למבוכים שלי':'→ למפה';
  if(!ed){
    const L=document.getElementById('bList');L.innerHTML='';
    const full=myMazes.length>=BMAX,nb=document.getElementById('bNewBtn');nb.disabled=full;nb.classList.toggle('dim',full);
    document.getElementById('bFull').hidden=!full;document.getElementById('bEmpty').hidden=myMazes.length>0;
    myMazes.forEach(d=>L.appendChild(bCard(d,{play:()=>bPlay(d),edit:()=>{bEd=d;bUndo=[];bPend=null;bRobot=null;renderBuild();window.scrollTo(0,0);},delKey:'m'+d.id,
      del:()=>{myMazes=myMazes.filter(m=>m.id!==d.id);bSave();}})));
    const fam=famLoad(),F=document.getElementById('bFamList');F.innerHTML='';document.getElementById('bFamBox').hidden=!fam.length;
    fam.forEach(f=>{const m=bNorm(f.m),ex=document.createElement('div');ex.className='blb';
      const top=f.lb.slice(0,3).map((q,i)=>['🥇','🥈','🥉'][i]+' '+q.name+' '+fmt(q.sec)+(q.stars<3?' ('+q.stars+'⭐)':'')).join('\n');ex.textContent=top||'עוד אין תוצאות. תהיי הראשונה!';
      F.appendChild(bCard(m,{sub:'של '+f.by+(f.target?' · ⏱️ מטרה: '+f.target+' שניות':''),extra:ex,play:()=>bPlay(m,f),delKey:'f'+f.id,del:f.byId===curProf?()=>{famSave(famLoad().filter(q=>q.id!==f.id));}:null}));});
    return;}
  if(bCo&&!bCo.final){let mv=false;while(bCo.i<BCOACH.length&&BCOACH[bCo.i].done(bEd,bCo.f)){bCo.i++;mv=true;}if(mv)bCoachEnter();}
  if(bTargetFor!==bEd.id){bTargetFor=bEd.id;const f0=famLoad().find(q=>q.id===bEd.id);bTarget=f0&&f0.target||0;}
  document.getElementById('bName').value=bEd.name;document.getElementById('bNoteIn').value=bEd.msg||'';
  // tabs and tools
  document.querySelectorAll('#bTabs button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.tab===bTab));
  const th=bThId(bEd),tools=bTab==='special'?[...(BSPEC[th]||[]),'creature','erase']:BTABS[bTab],tb=document.getElementById('bTools');tb.innerHTML='';
  if(!tools.includes(bTool))bTool=tools[0];
  const W=WORLDS[th];
  tools.forEach(t=>{const b=document.createElement('button');b.type='button';b.dataset.t=t;b.setAttribute('aria-pressed',t===bTool);const [e,l]=BTOOLS[t];
    if(e){const sp=document.createElement('span');sp.textContent=t==='creature'?BCRE[th].e:e;b.appendChild(sp);}
    else{const cv=document.createElement('canvas');cv.width=cv.height=56;const c=cv.getContext('2d');if(t==='start')drawChar(c,curChar(),28,32,23);else if(t==='goal')W.goal(c,28,30,25);else BCRE[th].f(c,28,30,22);b.appendChild(cv);}
    b.appendChild(document.createTextNode(l));b.onclick=()=>{bTool=t;bPend=null;beep(700,.04,'sine');speak(BTOOLS[t][2]);renderBuild();};tb.appendChild(b);});
  tb.style.gridTemplateColumns='repeat('+Math.max(3,tools.length)+',minmax(0,1fr))';
  const cr=document.getElementById('bCols');cr.innerHTML='';const cols=bTool==='key'||bTool==='door'?KEYC.map(k=>k.c):bTool==='paint'?BFLOOR.slice(1):bTool==='deco'?BDECO:null;cr.hidden=false;
  if(!cols){const t=document.createElement('span');t.className='note';t.textContent=BTOOLS[bTool][2];cr.appendChild(t);}
  if(cols){if(bCol>=cols.length)bCol=0;cols.forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-pressed',i===bCol);
    if(bTool==='deco')b.textContent=c;else{b.style.background=c;b.setAttribute('aria-label',bTool==='paint'?'צבע '+(i+1):KEYC[i].m);}
    b.onclick=()=>{bCol=i;beep(800,.03,'sine');renderBuild();};cr.appendChild(b);});}
  const tz=document.getElementById('bTheme');tz.innerHTML='';
  BTH.forEach((w,i)=>{const b=document.createElement('button');b.type='button';b.style.background=WORLDS[w].hex;b.appendChild(iconCanvas(34,WORLDS[w].goal));b.appendChild(document.createTextNode(WORLDS[w].short));
    b.setAttribute('aria-pressed',bEd.th===i);b.onclick=()=>{if(bEd.th===i)return;bPush();const had=bEd.keys.length+Object.keys(bEd.doors).length+bEd.por.length+bEd.mush.length+bEd.br.length;
      bEd.th=i;const t=BTH[i];if(t!==1){bEd.keys=[];bEd.doors={};}if(t!==4)bEd.por=[];if(t!==9)bEd.mush=[];if(t!==3)bEd.br=[];bPend=null;
      const now=bEd.keys.length+Object.keys(bEd.doors).length+bEd.por.length+bEd.mush.length+bEd.br.length;bCommit();renderBuild();
      if(now<had)bHint('החפצים המיוחדים של העולם הקודם הוסרו (אפשר ↩ בטל)');if(bTab==='special'){bShowTip(t);renderBuild();}};tz.appendChild(b);});
  document.getElementById('bSzR').value=bEd.n;document.getElementById('bSzT').textContent=bEd.n+'×'+bEd.n+' '+(bEd.n<=6?'🐣':bEd.n<=9?'🙂':bEd.n<=12?'💪':'🏔️');
  document.getElementById('bSzMinus').disabled=bEd.n<=5;document.getElementById('bSzPlus').disabled=bEd.n>=15;
  document.getElementById('bCodeOut').value=bEncode(bEd);
  const f=famLoad().find(q=>q.id===bEd.id);document.getElementById('bFamBtn').textContent=f?'👪 לעדכן את האתגר':'👪 לשלוח למשפחה';
  document.querySelectorAll('#bTarget button').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.v===bTarget));
  bCoachRender();
  bDraw();
}
function bPlay(d,fam){
  const c=bCheck(d);if(!c.ok){if(fam){toast(c.msg);return;}bEd=d;bUndo=[];renderBuild();bHint(c.msg);return;}
  const w=bThId(d),W=WORLDS[w];bPlaying=d.id;bPlayFam=fam?fam.id:null;
  const cfg=Object.assign({},tune(W.id,W.levels[0]));if(!cfg.speed)cfg.speed=800;
  startLevel(w,0,{custom:true,lv:bLevel(d),cfg,name:d.name});
}
function bWin(){
  const fam=bPlayFam?famLoad().find(f=>f.id===bPlayFam):null,d=fam?bNorm(fam.m):myMazes.find(m=>m.id===bPlaying),sec=Math.round((Date.now()-G.t0)/100)/10;let rec='';
  sparkle(G.lv.goal.x,G.lv.goal.y,['#ffd23f','#ff5d8f'],18);chime([523,659,784,1047],110,.12,'sine');
  if(!fam&&d&&G.got===3&&(d.best==null||sec<d.best)){rec=d.best!=null?' 🏆 שיא חדש!':'';d.best=sec;bSave();}
  document.getElementById('drTitle').textContent=fam&&fam.target?(sec<=fam.target&&G.got===3?'עמדת באתגר! 🏆':'כמעט! 💪'):'עברת את המבוך! 🎉';
  const rows=document.getElementById('drRows');rows.innerHTML='';rows.style.gridTemplateColumns='1fr';
  const div=document.createElement('div');div.className='bres1';
  const b=document.createElement('b');b.textContent=G.cname||'';const s1=document.createElement('span');s1.textContent='★'.repeat(G.got)+'☆'.repeat(3-G.got);const s2=document.createElement('span');s2.textContent='⏱️ '+fmt(sec);
  div.append(b,s1,s2);rows.appendChild(div);
  let text=(G.got<3?'אספת '+G.got+' כוכבים מתוך 3.':'אספת את כל הכוכבים!')+rec;
  if(fam&&fam.target)text+=sec<=fam.target&&G.got===3?' הצלחת בפחות מ־'+fam.target+' שניות!':' המטרה: 3 כוכבים בפחות מ־'+fam.target+' שניות. עוד ניסיון?';
  else if(!fam&&d&&d.best!=null)text+=' השיא: '+fmt(d.best)+'.';
  document.getElementById('drText').textContent=text;
  const note=document.getElementById('drNote');note.hidden=!(d&&d.msg);if(d&&d.msg)note.textContent='💌 '+d.msg;
  const lb=document.getElementById('drLb');lb.hidden=!fam;
  if(fam){const inp=document.getElementById('drName');inp.value=profName();const sv=document.getElementById('drSave');sv.disabled=false;sv.textContent='🏆 לרשום';
    const showTop=list=>{const ol=document.getElementById('drTop');ol.innerHTML='';list.slice(0,5).forEach(q=>{const li=document.createElement('li');li.textContent=q.name+' · '+fmt(q.sec)+' · '+'★'.repeat(q.stars);ol.appendChild(li);});};
    showTop(fam.lb);const got=G.got;
    sv.onclick=()=>{const all=famLoad(),f=all.find(q=>q.id===fam.id);if(!f)return;const name=(inp.value.trim()||profName()||'שחקנית').slice(0,12);
      f.lb.push({name,sec,stars:got});f.lb.sort((a,b)=>b.stars-a.stars||a.sec-b.sec);f.lb=f.lb.slice(0,10);famSave(all);showTop(f.lb);
      const place=f.lb.findIndex(q=>q.name===name&&q.sec===sec);sv.disabled=true;sv.textContent=place===0?'🥇 מקום ראשון!':place>=0?'✅ מקום '+(place+1):'✅ נרשם';beep(988,.1,'sine');};}
  const nb=document.getElementById('drNext');nb.textContent='🔁 עוד פעם';nb.onclick=()=>{document.getElementById('duelRes').hidden=true;document.getElementById('retry').click();};
  document.getElementById('drMap').textContent='🧱 חזרה לבנייה';
  document.getElementById('duelRes').hidden=false;nb.focus();speak((fam&&fam.target&&sec<=fam.target&&G.got===3?'עמדת באתגר! ':'עברת את המבוך! ')+text+(d&&d.msg?' '+d.msg:''));
}
(()=>{
  const cv=document.getElementById('bCv');
  const at=e=>{const r=cv.getBoundingClientRect(),n=bEd.n,fx=(e.clientX-r.left)/r.width*n,fy=(e.clientY-r.top)/r.height*n,x=Math.floor(fx),y=Math.floor(fy);return x>=0&&y>=0&&x<n&&y<n?{x,y,fx,fy}:null;};
  cv.addEventListener('pointerdown',e=>{if(!bEd)return;e.preventDefault();try{cv.setPointerCapture(e.pointerId);}catch(_){}const c=at(e);if(!c)return;bPush();bStroke={paint:null};bApply(Object.assign(c,{first:true}));});
  cv.addEventListener('pointermove',e=>{if(!bStroke||!bEd)return;const c=at(e);if(c)bApply(Object.assign(c,{first:false}));});
  ['pointerup','pointercancel','lostpointercapture'].forEach(t=>cv.addEventListener(t,()=>{if(!bStroke)return;
    if(bStroke.cr&&bStroke.cr.cells.length<2&&bEd){bEd.cr=bEd.cr.filter(c=>c!==bStroke.cr);bHint('גררי את האצבע מהיצור כדי לסמן את הדרך שלו 🐾');}
    bStroke=null;if(bUndo.length&&bUndo[bUndo.length-1]===JSON.stringify(bEd))bUndo.pop();bCommit();}));
  document.querySelectorAll('#bTabs button').forEach(b=>b.onclick=()=>{bTab=b.dataset.tab;bPend=null;beep(650,.04,'sine');if(bTab==='special')bShowTip(bThId(bEd));if(bTab==='deco')bShowTip('deco');renderBuild();});
  const bSizeTo=v=>{v=Math.max(5,Math.min(15,v));if(!bEd||v===bEd.n)return;bPush();bResize(bEd,v);bRobot=null;beep(400+v*30,.04,'sine');bCommit();renderBuild();};
  document.getElementById('bSzMinus').onclick=()=>bSizeTo(bEd.n-1);document.getElementById('bSzPlus').onclick=()=>bSizeTo(bEd.n+1);
  document.getElementById('bSzR').addEventListener('input',e=>{document.getElementById('bSzT').textContent=e.target.value+'×'+e.target.value;});
  document.getElementById('bSzR').addEventListener('change',e=>bSizeTo(+e.target.value));
  document.getElementById('bName').addEventListener('input',e=>{if(!bEd)return;bEd.name=e.target.value.trim().slice(0,16)||'המבוך שלי';bSave();});
  document.getElementById('bNoteIn').addEventListener('input',e=>{if(!bEd)return;bEd.msg=e.target.value.slice(0,60);bSave();document.getElementById('bCodeOut').value=bEncode(bEd);});
  document.getElementById('bUndoBtn').onclick=()=>{const u=bUndo.pop();if(!u||!bEd)return;const o=JSON.parse(u);Object.keys(bEd).forEach(k=>delete bEd[k]);Object.assign(bEd,o);bPend=null;bRobot=null;beep(500,.06,'sine');bCommit();renderBuild();};
  document.getElementById('bRand').onclick=()=>{if(!bEd)return;bPush();bRandom(bEd);bRobot=null;beep(880,.08,'sine');bCommit();renderBuild();};
  document.getElementById('bClear').onclick=()=>{if(!bEd)return;bPush();const n=bEd.n;Object.assign(bEd,{blk:'0'.repeat(n*n),fl:'0'.repeat(n*n),st:[],s:[0,0],g:[n-1,n-1],wl:[],keys:[],doors:{},por:[],mush:[],br:[],cr:[],dec:[]});bPend=null;bRobot=null;beep(300,.08,'triangle');bCommit();renderBuild();};
  document.getElementById('bRobotBtn').onclick=()=>{if(!bEd)return;bCoachFlag('robot');setTimeout(()=>{bCoachCheck();if(bCo)renderBuild();},Math.min(1600,bCheck(bEd).order.length*28)+400);const r=bCheck(bEd);bRobot={t0:performance.now(),order:r.order,path:r.ok?r.path:[],steps:r.steps};
    if(!r.ok)setTimeout(()=>{if(bRobot)bHint('🤖 הרובוט חיפש בכל המבוך… '+(r.goalAny?'אבל לא מצא דרך עם כל הכוכבים':'ולא מצא דרך אל היעד'));},Math.min(1600,r.order.length*28)+200);
    else{bNote={t:'🤖 הרובוט מחפש…',until:Date.now()+1800,ok:true};speak('הרובוט מחפש');}beep(600,.06,'square');bDraw();};
  document.getElementById('bPlayBtn').onclick=()=>{if(!bEd)return;if(bCheck(bEd).ok)bCoachFlag('play');bPlay(bEd);};
  document.getElementById('bNewBtn').onclick=()=>{if(myMazes.length>=BMAX)return;const d=bNew(8);myMazes.push(d);bSave();bEd=d;bUndo=[];bTab='walls';bTool='wall';bPend=null;bRobot=null;beep(700,.06,'sine');if(!load('journey_bcoach',{}).done)bCoachStart();renderBuild();window.scrollTo(0,0);};
  document.querySelectorAll('#bTarget button').forEach(b=>b.onclick=()=>{bTarget=+b.dataset.v;beep(700,.04,'sine');renderBuild();});
  document.getElementById('bFamBtn').onclick=()=>{if(!bEd)return;const c=bCheck(bEd);if(!c.ok){bHint('קודם צריך לגמור את המבוך: '+c.msg);return;}
    const all=famLoad(),old=all.find(q=>q.id===bEd.id);if(!old&&all.length>=FMAX){bHint('יש כבר 12 אתגרים. מחקי אחד מהאתגרים שלך');return;}
    const entry={id:bEd.id,by:profName()||'אני',byId:curProf,m:JSON.parse(JSON.stringify(bEd)),target:bTarget||null,lb:[]};
    if(old)Object.assign(old,entry);else all.push(entry);famSave(all);beep(988,.1,'sine');
    bHint(old?'👪 האתגר עודכן! הטבלה התחילה מחדש':'👪 נשלח! האתגר מחכה ב"בונים מבוך" לכל המשפחה',true);renderBuild();};
  document.getElementById('bCopy').onclick=()=>{const inp=document.getElementById('bCodeOut'),done=()=>bHint('📋 הקוד הועתק! אפשר לשלוח אותו',true);
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(inp.value).then(done,()=>{inp.select();});else{inp.select();try{document.execCommand('copy');done();}catch(_){}}};
  document.getElementById('bCodeGo').onclick=()=>{const inp=document.getElementById('bCodeIn'),d=bDecode(inp.value),m=document.getElementById('bImpMsg');
    if(!d){m.textContent='הקוד לא מתאים 🤔 בדקי שהעתקת את כולו';beep(200,.1,'triangle');return;}
    if(myMazes.length>=BMAX){m.textContent='יש כבר 12 מבוכים. מחקי אחד קודם';return;}
    myMazes.push(d);bSave();inp.value='';m.textContent='';bEd=d;bUndo=[];bPend=null;bRobot=null;renderBuild();window.scrollTo(0,0);beep(880,.1,'sine');};
  document.getElementById('buildOpen').onclick=()=>bOpen(null);
  document.getElementById('bCoachNext').onclick=()=>{if(bTipNow&&!bCo){const s2=load('journey_btips',{});s2[bTipNow]=1;save('journey_btips',s2);bTipNow=null;renderBuild();return;}
    if(!bCo)return;if(bCo.final){bCo=null;const c=load('journey_bcoach',{});c.done=1;save('journey_bcoach',c);renderBuild();return;}bCo.i++;bCoachEnter();renderBuild();};
  document.getElementById('bCoachX').onclick=()=>{bCo=null;const c=load('journey_bcoach',{});c.done=1;save('journey_bcoach',c);beep(500,.05,'sine');renderBuild();};
  document.getElementById('bHelpBtn').onclick=()=>{if(!bEd)return;bCoachStart();beep(700,.05,'sine');renderBuild();window.scrollTo(0,0);};
  document.getElementById('buildBack').onclick=()=>{if(bEd){if(bCo&&bCo.final){bCo=null;const c=load('journey_bcoach',{});c.done=1;save('journey_bcoach',c);}bTipNow=null;bEd=null;bDel=null;bPend=null;bRobot=null;renderBuild();window.scrollTo(0,0);return;}
    document.getElementById('buildScreen').hidden=true;document.getElementById('mapScreen').hidden=false;renderMap();window.scrollTo(0,0);};
  window.addEventListener('resize',()=>{if(bEd&&!document.getElementById('buildScreen').hidden)bDraw();});
})();

function pname(i){return duelSet['p'+(i+1)]||('שחקנית '+(i+1));}
function startDuel(){
  D={players:[{name:pname(0),char:pickChar(duelSet.c1,0)},{name:pname(1),char:pickChar(duelSet.c2,1)}],rounds:duelSet.rounds,round:0,wins:[0,0],stars:[0,0],time:[0,0],fin:[0,0],turn:0,res:[]};
  nextRound();
}
document.getElementById('duelStart').onclick=startDuel;
function nextRound(){withBuilding(nextRoundNow);}
function nextRoundNow(){
  if(!D)return;
  const w=duelSet.world==='rand'?Math.floor(Math.random()*WORLDS.length):+duelSet.world,l=duelSet.size;
  const W=WORLDS[w],cfg=tune(W.id,W.levels[l]);const lv=GEN[W.id](cfg);if(QUIZ.has(W.id))prepQuiz(lv,cfg,W.id);
  D.w=w;D.l=l;D.cfg=cfg;D.lv0=structuredClone(lv);D.turn=0;D.res=[];
  beginTurn();
}
function beginTurn(){
  const P=D.players[D.turn];
  startLevel(D.w,D.l,{duel:true,lv:structuredClone(D.lv0),cfg:D.cfg,char:P.char,name:P.name});
  G.started=false;
  const tc=document.getElementById('turnChar').getContext('2d');tc.clearRect(0,0,180,180);drawChar(tc,P.char,90,100,58);
  document.getElementById('turnTitle').textContent='התור של '+P.name+'!';
  document.getElementById('turnText').textContent='סיבוב '+(D.round+1)+' מתוך '+D.rounds+' · '+WORLDS[D.w].name+'. '+TIPS[WORLDS[D.w].id]+(D.turn===1?' '+D.players[0].name+', תני לה את הטלפון 😉':'');
  document.getElementById('turn').hidden=false;document.getElementById('turnGo').focus();
  speak('התור של '+P.name);
}
document.getElementById('turnGo').onclick=()=>{document.getElementById('turn').hidden=true;G.t0=Date.now();G.started=true;updateHud();beep(660,.1);beep(990,.15);};
document.getElementById('giveUp').onclick=()=>{if(G&&G.duel&&G.started&&!G.done){G.done=true;duelTurnEnd(true);}};
function duelTurnEnd(gave){
  const sec=Math.round((Date.now()-G.t0)/10)/100;
  D.res[D.turn]={stars:gave?0:G.got,sec,gave};
  chime([523,659,784],110,.15);
  if(D.turn===0){
    const r=D.res[0];
    showRes(D.players[0].name+(r.gave?' ויתרה':' סיימה!'),[0],r.gave?'עכשיו התור של '+D.players[1].name+'.':'היא אספה '+r.stars+' כוכבים ב־'+fmt(r.sec)+'. עכשיו התור של '+D.players[1].name+'!','לתור של '+D.players[1].name+' ▶',()=>{D.turn=1;beginTurn();});
    return;
  }
  const a=D.res[0],b=D.res[1];let win=-1;
  if(a.gave&&b.gave)win=-2;else if(a.gave&&!b.gave)win=1;else if(b.gave&&!a.gave)win=0;
  else if(a.stars!==b.stars)win=a.stars>b.stars?0:1;
  else if(a.sec!==b.sec)win=a.sec<b.sec?0:1;
  if(win===-2)win=-1;else if(win>=0)D.wins[win]++;
  D.stars[0]+=a.stars;D.stars[1]+=b.stars;if(!a.gave){D.time[0]+=a.sec;D.fin[0]++;}if(!b.gave){D.time[1]+=b.sec;D.fin[1]++;}D.round++;
  const last=D.round>=D.rounds;
  const why=win<0?'תיקו מושלם!':(a.gave||b.gave)?'':(a.stars!==b.stars?'היא אספה יותר כוכבים.':'אותו מספר כוכבים, אבל היא הייתה מהירה יותר.');
  const title=win<0?'תיקו!':D.players[win].name+' ניצחה בסיבוב!';
  const score=D.players[0].name+' '+D.wins[0]+' · '+D.players[1].name+' '+D.wins[1];
  showRes(title,[0,1],why+' התוצאה: '+score+'.',last?'לתוצאה הסופית 🏆':'לסיבוב הבא ▶',last?finalRes:nextRound,win);
}
function fmt(sec){return (Math.round(sec*10)/10)+' שניות';}
function showRes(title,who,text,btn,fn,win){
  document.getElementById('drTitle').textContent=title;
  const rows=document.getElementById('drRows');rows.innerHTML='';
  who.forEach(i=>{const r=D.res[i],P=D.players[i];const d=document.createElement('div');if(win===i)d.className='win';
    const c=document.createElement('canvas');c.width=112;c.height=112;drawChar(c.getContext('2d'),P.char,56,62,38);
    const b=document.createElement('b');b.textContent=(win===i?'👑 ':'')+P.name;
    const s1=document.createElement('span');s1.textContent=r.gave?'ויתרה':'★'.repeat(r.stars)+'☆'.repeat(3-r.stars);
    const s2=document.createElement('span');s2.textContent=r.gave?'':'⏱️ '+fmt(r.sec);
    d.append(c,b,s1,s2);rows.appendChild(d);});
  rows.style.gridTemplateColumns=who.length>1?'1fr 1fr':'1fr';
  document.getElementById('drText').textContent=text;document.getElementById('drMap').textContent='למפה';document.getElementById('drNote').hidden=true;document.getElementById('drLb').hidden=true;
  const nb=document.getElementById('drNext');nb.textContent=btn;nb.onclick=fn;
  document.getElementById('duelRes').hidden=false;nb.focus();speak(title+' '+text);
}
function finalRes(){
  let win=-1;
  if(D.wins[0]!==D.wins[1])win=D.wins[0]>D.wins[1]?0:1;
  else if(D.stars[0]!==D.stars[1])win=D.stars[0]>D.stars[1]?0:1;
  else if(D.fin[0]!==D.fin[1])win=D.fin[0]>D.fin[1]?0:1; // the one who finished more rounds
  else if(D.fin[0]>0&&D.time[0]!==D.time[1])win=D.time[0]<D.time[1]?0:1;
  D.res=[{stars:Math.min(3,D.wins[0]),sec:D.time[0]},{stars:Math.min(3,D.wins[1]),sec:D.time[1]}];
  const title=win<0?'תיקו! שתיכן אלופות 🏆':'🏆 '+D.players[win].name+' האלופה!';
  showRes(title,[0,1],'ניצחונות בסיבובים: '+D.players[0].name+' '+D.wins[0]+', '+D.players[1].name+' '+D.wins[1]+'. כוכבים בסך הכול: '+D.stars[0]+' מול '+D.stars[1]+'.','משחק חוזר 🔄',startDuel,win);
  document.querySelectorAll('#drRows span').forEach((el,i)=>{if(i%2===0)el.textContent='🏅 '+D.wins[i/2]+' סיבובים';});
  if(win>=0){dancer=D.players[win].char;}
  confetti=Array.from({length:70},(_,i)=>({x:Math.random(),y:-Math.random()*.5,v:.004+Math.random()*.006,c:['#ff5d8f','#ffc23c','#5bb8e8','#7b5ea7','#1a9ba1'][i%5],r:.012+Math.random()*.012}));
  chime([523,659,784,1047,1319],130,.2);
}
document.getElementById('drMap').onclick=toMap;

