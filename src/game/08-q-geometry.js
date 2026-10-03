/* ================= geometry land: questions with drawn shapes, by school grade (0 = כיתה א … 5 = כיתה ו) ================= */
var GEOM=(function(){
const pick=a=>a[Math.floor(Math.random()*a.length)];
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
function others(ans,pool){return shuf(pool.filter(v=>v!==ans)).filter((v,i,a)=>a.indexOf(v)===i).slice(0,2);}
function numWrong(ans,deltas){const out=[];for(const d of shuf(deltas)){const v=ans+d;if(v>0&&v!==ans&&!out.includes(v))out.push(v);if(out.length===2)break;}
  for(let k=1;out.length<2;k++){if(!out.includes(ans+k))out.push(ans+k);}return out;}
function Q(label,key,svg,say,ans,wrong){return {label,prompt:key,svg,dir:'rtl',say,ans,wrong};}
/* --- little SVG pictures --- */
const FILL=['#ffd6e8','#cfe8ff','#d9f7c8','#fff1b8','#e8dcff'],INK='#2a2140';
function svgWrap(inner,w,h){return '<svg viewBox="0 0 '+w+' '+h+'" width="'+Math.round(w*1.1)+'" height="'+Math.round(h*1.1)+'" style="vertical-align:middle;overflow:visible;margin:0 16px" aria-hidden="true">'+inner+'</svg>';}
function poly(pts,fill){return '<polygon points="'+pts.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ')+'" fill="'+fill+'" stroke="'+INK+'" stroke-width="3" stroke-linejoin="round"/>';}
function regPts(k,cx,cy,r,rot){return Array.from({length:k},(_,i)=>{const a=(rot||-Math.PI/2)+i*2*Math.PI/k;return [cx+r*Math.cos(a),cy+r*Math.sin(a)];});}
function label(x,y,t,size){return '<text x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" font-size="'+(size||17)+'" font-weight="bold" fill="'+INK+'" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" direction="ltr">'+t+'</text>';}
const SH={
  'משולש':f=>poly(regPts(3,50,44,36),f),
  'ריבוע':f=>poly([[20,14],[80,14],[80,74],[20,74]],f),
  'מלבן':f=>poly([[8,22],[92,22],[92,66],[8,66]],f),
  'עיגול':f=>'<circle cx="50" cy="44" r="32" fill="'+f+'" stroke="'+INK+'" stroke-width="3"/>',
  'מעוין':f=>poly([[50,6],[84,44],[50,82],[16,44]],f),
  'מחומש':f=>poly(regPts(5,50,46,36),f),
  'משושה':f=>poly(regPts(6,50,44,36,0),f),
  'מתומן':f=>poly(regPts(8,50,44,36,Math.PI/8),f),
  'טרפז':f=>poly([[30,18],[70,18],[92,70],[8,70]],f),
  'אליפסה':f=>'<ellipse cx="50" cy="44" rx="44" ry="26" fill="'+f+'" stroke="'+INK+'" stroke-width="3"/>'};
const SIDES={'משולש':3,'ריבוע':4,'מלבן':4,'מעוין':4,'טרפז':4,'מחומש':5,'משושה':6,'מתומן':8};
const shapeSvg=(name,f)=>svgWrap(SH[name](f||pick(FILL)),100,88);
/* --- questions --- */
function shapeName(g){
  const pool=g<=0?['משולש','ריבוע','מלבן','עיגול']:g<=1?['משולש','ריבוע','מלבן','עיגול','מעוין','משושה']:Object.keys(SH);
  const name=pick(pool);return Q('איך קוראים לצורה הזאת?','name '+name,shapeSvg(name),'איך קוראים לצורה הזאת?',name,others(name,pool));
}
function sides(g){
  const pool=g<=1?['משולש','ריבוע','מלבן','מחומש','משושה']:Object.keys(SIDES);
  const name=pick(pool),v=SIDES[name],corners=g<=0||Math.random()<.4;
  const lab=corners?'כמה פינות יש לצורה?':'כמה צלעות יש לצורה?';
  return Q(lab,(corners?'corners ':'sides ')+name,shapeSvg(name),lab,v,numWrong(v,[-1,1,2,-2]));
}
function count(g){
  const kinds=['משולש','ריבוע','עיגול'],want=pick(kinds),k=ri(g<=0?1:2,g<=0?4:6),other=ri(2,5),items=[];
  for(let i=0;i<k;i++)items.push(want);for(let i=0;i<other;i++)items.push(pick(kinds.filter(x=>x!==want)));
  const L=shuf(items),cols=Math.ceil(L.length/2),cell=34;let inner='';
  L.forEach((nm,i)=>{const cx=20+(i%cols)*cell,cy=18+Math.floor(i/cols)*34,f=FILL[i%FILL.length];
    inner+=nm==='משולש'?poly(regPts(3,cx,cy+2,14),f):nm==='ריבוע'?poly([[cx-11,cy-11],[cx+11,cy-11],[cx+11,cy+11],[cx-11,cy+11]],f):'<circle cx="'+cx+'" cy="'+cy+'" r="12" fill="'+f+'" stroke="'+INK+'" stroke-width="3"/>';});
  const plural={'משולש':'משולשים','ריבוע':'ריבועים','עיגול':'עיגולים'}[want];
  const lab='כמה '+plural+' יש בציור?';
  return Q(lab,'count '+want+' '+L.join(''),svgWrap(inner,cols*cell+6,70),lab,k,numWrong(k,[-1,1,2,-2]));
}
function rectSvg(a,b,sq){const W=sq?60:Math.min(90,30+a*6),H=sq?60:Math.min(60,20+b*5),x=50-W/2,y=40-H/2;
  return svgWrap(poly([[x,y],[x+W,y],[x+W,y+H],[x,y+H]],pick(FILL))+label(50,y-10,a)+(sq?'':label(x+W+14,40,b)),100,84);}
function perim(g){
  if(g>=4&&Math.random()<.4){const a=ri(3,12),b=ri(3,12),c=ri(Math.abs(a-b)+1,a+b-1),p=a+b+c;
    const pts=[[14,72],[86,72],[40,12]];const svg=svgWrap(poly(pts,pick(FILL))+label(50,84,a)+label(70,38,b)+label(20,40,c),100,92);
    return Q('מה ההיקף של המשולש?','tri '+[a,b,c].join(','),svg,'מה ההיקף של משולש שהצלעות שלו '+a+', '+b+' ו־'+c+'?',p,numWrong(p,[-a,-b,a,-1,1]));}
  const sq=Math.random()<.35,a=ri(2,g<=2?9:15),b=sq?a:ri(2,g<=2?8:12);if(!sq&&a===b)return perim(g);
  const ans=sq?4*a:2*(a+b),wrong=sq?numWrong(ans,[-2*a,-a,a*a-4*a].filter(d=>d!==0)):numWrong(ans,[-(a+b),a*b-ans,-2,2].filter(d=>d!==0));
  return Q(sq?'מה ההיקף של הריבוע?':'מה ההיקף של המלבן?',(sq?'sqp ':'rp ')+a+'x'+b,rectSvg(a,b,sq),sq?'מה ההיקף של ריבוע שהצלע שלו '+a+'?':'מה ההיקף של מלבן שהצלעות שלו '+a+' ו־'+b+'?',ans,wrong);
}
function area(g){
  if(g>=5&&Math.random()<.45){const b=2*ri(2,8),h=ri(2,9),ans=b*h/2;
    const svg=svgWrap(poly([[10,72],[90,72],[34,14]],pick(FILL))+'<line x1="34" y1="14" x2="34" y2="72" stroke="'+INK+'" stroke-width="2" stroke-dasharray="4 3"/>'+label(50,84,b)+label(24,44,h),100,92);
    return Q('מה השטח של המשולש?','tria '+b+'x'+h,svg,'מה השטח של משולש שהבסיס שלו '+b+' והגובה '+h+'?',ans,numWrong(ans,[ans,-1,1,2].filter(d=>d!==0)));}
  const sq=Math.random()<.35,a=ri(2,g<=3?9:13),b=sq?a:ri(2,g<=3?8:11);if(!sq&&a===b)return area(g);
  const ans=a*b,per=sq?4*a:2*(a+b);
  const wrong=numWrong(ans,[per-ans,a+b-ans,-a,b,1].filter(d=>d!==0&&ans+d>0));
  return Q(sq?'מה השטח של הריבוע?':'מה השטח של המלבן?',(sq?'sqa ':'ra ')+a+'x'+b,rectSvg(a,b,sq),sq?'מה השטח של ריבוע שהצלע שלו '+a+'?':'מה השטח של מלבן שהצלעות שלו '+a+' ו־'+b+'?',ans,wrong);
}
const SYM=[['ריבוע',4],['מלבן',2],['משולש',3],['משושה',6],['מעוין',2],['מחומש',5],['מתומן',8]];
function sym(g){const [name,v]=pick(g<=2?SYM.slice(0,4):SYM);
  return Q('כמה קווי סימטריה יש לצורה?','sym '+name,shapeSvg(name),'כמה קווי סימטריה יש ל'+name+'?',v,numWrong(v,[-1,1,2,-2]));}
function angle(g){
  const r=Math.random();
  if(g>=5&&r<.3){const a=ri(6,13)*10,b=ri(6,12)*10,c=ri(6,12)*10,d=360-a-b-c;if(d<40||d>170)return angle(g);
    const svg=svgWrap(poly([[12,74],[88,70],[78,16],[24,12]],pick(FILL))+label(24,64,a+'°',14)+label(76,62,b+'°',14)+label(70,24,c+'°',14)+label(32,22,'?',16),100,86);
    return Q('מה הזווית החסרה במרובע?','quad '+[a,b,c].join(','),svg,'במרובע יש זוויות של '+a+', '+b+' ו־'+c+' מעלות. מה הזווית הרביעית?',d,numWrong(d,[10,-10,180-d-d>0?180-2*d:20,-20].filter(x=>x!==0)));}
  if(r<.65){const a=ri(3,9)*10,b=ri(3,9)*10,c=180-a-b;if(c<20)return angle(g);
    const svg=svgWrap(poly([[10,72],[90,72],[40,12]],pick(FILL))+label(24,62,a+'°',14)+label(76,62,b+'°',14)+label(40,30,'?',16),100,86);
    return Q('מה הזווית החסרה במשולש?','tri '+a+','+b,svg,'במשולש יש זוויות של '+a+' ו־'+b+' מעלות. מה הזווית השלישית?',c,numWrong(c,[10,-10,20,-20].filter(x=>c+x>0)));}
  const deg=pick([30,45,60,80,90,90,100,120,135,150]),ans=deg<90?'חדה':deg===90?'ישרה':'קהה';
  const rad=deg*Math.PI/180,x2=20+70*Math.cos(-rad),y2=70+70*Math.sin(-rad);
  const svg=svgWrap('<path d="M90,70 L20,70 L'+x2.toFixed(1)+','+y2.toFixed(1)+'" fill="none" stroke="'+INK+'" stroke-width="4" stroke-linecap="round"/>'+
    (deg===90?'<rect x="20" y="56" width="14" height="14" fill="none" stroke="#e63946" stroke-width="2"/>':'<path d="M44,70 A24,24 0 0 0 '+(20+24*Math.cos(-rad)).toFixed(1)+','+(70+24*Math.sin(-rad)).toFixed(1)+'" fill="none" stroke="#e63946" stroke-width="2"/>')+label(58,52,deg+'°',14),100,80);
  return Q('איזו זווית זאת?','angtype '+deg,svg,'זווית של '+deg+' מעלות. האם היא חדה, ישרה או קהה?',ans,['חדה','ישרה','קהה'].filter(v=>v!==ans));
}
const KINDS={name:shapeName,sides,count,perim,area,sym,angle};
function kindFor(k,g){
  if(k==='measure')return g<=1?'count':g<=2?'perim':g<=3?pick(['perim','area']):pick(['area','angle']);
  if(k==='count'&&g>=3)return 'sym';
  if(k==='mix')return pick(g<=0?['name','sides','count']:g<=1?['name','sides','count','count']:g<=2?['name','sides','perim','sym']:g<=3?['sides','perim','area','sym']:g<=4?['perim','area','angle','sym']:['area','angle','perim','angle']);
  if(k==='name'&&g>=4)return pick(['name','sym']);
  if(k==='name'&&g<=0)return pick(['name','name','count']);  // only four shapes in grade 1, so mix in counting
  return k;
}
function questions(kind,g,count){
  const out=[],seen=new Set();
  for(let i=0,guard=0;i<count&&guard<200;guard++){const q=KINDS[kindFor(kind,g)](g);
    if(seen.has(q.prompt)&&guard<150)continue;seen.add(q.prompt);q.kind=kind;out.push(q);i++;}
  return out;
}
return {questions,KINDS,SIDES};
})();
const QUIZ=new Set(['numbers','english','hebrew','logic','geometry']);
const STATKEY={geometry:'mathFirst',numbers:'mathFirst',english:'wordFirst',hebrew:'wordFirst',logic:'logicFirst'};
const KEYS=[{c:'#ff595e',d:'#c9303b',s:'●'},{c:'#1982c4',d:'#0f5f91',s:'■'},{c:'#2a9d5c',d:'#1b7043',s:'▲'}];
// grey keys for colour questions, so the tile colour never hints at the answer
function keyStyle(k){return k>=10?{c:'#6d6384',d:'#4a4260',s:KEYS[k-10].s}:KEYS[k];}
function keyOf(q,i){return q.keys[i]+(q.neutral?10:0);}
function disp(v){return typeof v==='number'?MATH.fmt(v):String(v);}
function glyphs(t){try{return [...new Intl.Segmenter().segment(t)].length;}catch(e){return [...t].length;}}
function isEmoji(t){try{return /\p{Extended_Pictographic}/u.test(t);}catch(e){return false;}}
function isShort(v){const t=disp(v);return glyphs(t)<=4&&!/[A-Za-z\u0590-\u05FF]{2,}/.test(t);}
function prepQuiz(lv,cfg,wid){
  if(lv.qs||!lv.quiz)return;
  lv.grade=grade;
  if(cfg.kind==='wallet'){const w=MATH.wallet(grade,cfg.coins,lv.coins.length-cfg.coins);lv.target=w.target;lv.coins.forEach((c,i)=>c.v=w.values[i]);lv.qs=[];return;}
  const qs=wid==='numbers'?MATH.questions(cfg.kind,grade,lv.quiz.length).map(q=>({label:q.label,prompt:q.expr,dir:q.textExpr?'rtl':'ltr',say:q.say,ans:q.ans,wrong:q.wrong}))
    :wid==='geometry'?GEOM.questions(cfg.kind,grade,lv.quiz.length):WORDS.questions(wid,cfg.kind,grade,lv.quiz.length);
  qs.forEach((q,j)=>{q.wrong=q.wrong.slice(0,lv.quiz[j].wrong.length);const opts=[q.ans,...q.wrong];
    q.mode=opts.every(isShort)?'text':'key';
    if(q.mode==='key'){const k=[0,1,2];for(let i=2;i>0;i--){const r=Math.floor(Math.random()*(i+1));[k[i],k[r]]=[k[r],k[i]];}q.keys=k.slice(0,opts.length);}});
  lv.qs=qs;
}
function numTile(c,x,y,r,text,state,key){
  if(key!=null&&(state==='cur'||state==='wrong'||state==='glow')){
    const K=keyStyle(key);c.fillStyle=K.c;rrect(c,x-r*.44,y-r*.44,r*.88,r*.88,r*.16);c.fill();
    c.strokeStyle=state==='glow'?'#ffd23f':K.d;c.lineWidth=Math.max(1.5,r*(state==='glow'?.14:.08));c.stroke();
    c.fillStyle='#fff';c.font='bold '+Math.round(r*.46)+'px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(K.s,x,y+r*.03);return;}
  const col={cur:['#ffe8a3','#f3722c'],glow:['#c7f9cc','#2d9d5c'],done:['#b7efc5','#2d9d5c'],future:['#ece6f6','#b9b0d6'],wrong:['#ffe8a3','#f3722c'],old:['#f1ecf6','#d6cfe6']}[state];
  c.fillStyle=col[0];rrect(c,x-r*.44,y-r*.44,r*.88,r*.88,r*.16);c.fill();c.strokeStyle=col[1];c.lineWidth=Math.max(1.5,r*.08);c.stroke();
  if(key!=null&&state==='done')text='✓';
  if(key!=null&&state==='old')text='';
  c.fillStyle=state==='old'?'#b9b0d6':'#2a2140';const len=glyphs(String(text));
  const size=isEmoji(String(text))?.52:len<=2?.5:len===3?.4:len===4?.32:.26;
  c.save();c.direction='ltr';c.font='bold '+Math.round(r*size)+'px sans-serif';c.textAlign='center';c.textBaseline='middle';
  c.fillText(text,x,y+r*.03);c.restore();
  if(state==='done'&&key==null){c.font=Math.round(r*.26)+'px sans-serif';c.fillText('✓',x+r*.3,y-r*.3);}
}
function showQuiz(fresh){
  const el=document.getElementById('quiz'),O=document.getElementById('qOpts');
  if(!G||!QUIZ.has(G.W.id)){el.hidden=true;return;}
  el.hidden=false;el.classList.remove('done');O.innerHTML='';if(focusOn)requestAnimationFrame(resize);
  const L=document.getElementById('qLabel'),E=document.getElementById('qExpr');E.classList.remove('long');
  if(G.cfg.kind==='wallet'){
    L.textContent='💰 אספי בדיוק '+MATH.fmt(G.lv.target)+' ₪ · יש לך';E.dir='ltr';E.textContent=MATH.fmt(G.sum)+' ₪';
    if(Math.abs(G.sum-G.lv.target)<1e-9)el.classList.add('done');
    if(fresh)speak('אספי בדיוק '+MATH.fmt(G.lv.target)+' שקלים');return;
  }
  const q=G.lv.qs[G.qi];
  if(!q){L.textContent='✓ כל התשובות נכונות!';E.dir='ltr';E.textContent='🏆';el.classList.add('done');return;}
  L.textContent=q.label;E.dir=q.dir||'ltr';if(q.svg){E.innerHTML=q.svg;}else{E.textContent=q.prompt;E.classList.toggle('long',glyphs(q.prompt)>16);}
  if(q.mode==='key'){
    const opts=[q.ans,...q.wrong];const byKey=[];opts.forEach((v,i)=>byKey[q.keys[i]]=v);
    byKey.forEach((v,k)=>{if(v===undefined)return;const b=document.createElement('span');b.className='qopt';b.style.background=keyStyle(k+(q.neutral?10:0)).c;
      const sy=document.createElement('b');sy.textContent=KEYS[k].s;const t=document.createElement('bdi');t.textContent=disp(v);b.append(sy,t);O.appendChild(b);});
  }
  const sb=document.getElementById('qSay');sb.hidden=!q.en;
  if(fresh)setTimeout(()=>sayQ(q,false),350);
}
function sayQ(q,force){
  if(!q)return;speak(q.say,force);
  if(q.en&&!muted&&(force||voiceOn||grade<=1))speak(q.en,true,'en-US');
}
