/* ================= game ================= */
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
let G=null; // current level state

// show a short "building the maze" screen while a new maze is generated
let navId=0;
function withBuilding(fn){
  const id=navId;
  const el=document.getElementById('building');
  const c=document.getElementById('buildChar').getContext('2d');c.clearRect(0,0,220,220);drawChar(c,(G&&G.duelChar)||curChar(),110,120,70);
  el.hidden=false;const t0=Date.now();
  setTimeout(()=>{if(id!==navId){el.hidden=true;return;}try{fn();}finally{setTimeout(()=>{el.hidden=true;},Math.max(0,150-(Date.now()-t0)));}},20);
}
function startLevel(w,l,opt){
  if(opt&&opt.lv)return startLevelNow(w,l,opt);
  withBuilding(()=>startLevelNow(w,l,opt));
}
// make a few mazes when it is quick and keep the middle one, so a level is never much easier or harder than its neighbours
function steadyLevel(id,cfg){
  const t0=performance.now(),a=GEN[id](cfg);if(!a||QUIZ.has(id)||performance.now()-t0>40||a.best==null)return a;
  const all=[a,GEN[id](cfg),GEN[id](cfg)].filter(Boolean).sort((p,q)=>p.best-q.best);return all[Math.floor((all.length-1)/2)];
}
function startLevelNow(w,l,opt){
  opt=opt||{};
  const W=WORLDS[w],cfg=opt.cfg||tune(W.id,W.levels[l]);
  let lv;
  lv=opt.lv||steadyLevel(W.id,cfg);
  if(QUIZ.has(W.id))prepQuiz(lv,cfg,W.id);
  const rest=(lv.stars&&lv.stars.rest)||[];
  lv.sticker=(opt.duel||opt.custom)?null:stickers.has(w+'-'+l)?null:(rest.find(c=>!(c[0]===lv.start.x&&c[1]===lv.start.y)&&!(c[0]===lv.goal.x&&c[1]===lv.goal.y))||'end');
  G={w,l,W,cfg,lv,p:{x:lv.start.x,y:lv.start.y},stars:new Set(lv.stars.map(c=>c[0]+','+c[1])),got:0,
     keys:new Set(),doors:Object.assign({},lv.doors||{}),keysLeft:(lv.keys||[]).map(k=>Object.assign({},k)),
     air:cfg.air||0,check:{x:lv.start.x,y:lv.start.y},hurtUntil:0,anim:null,done:false,t0:Date.now(),
     trail:new Set([lv.start.x+','+lv.start.y]),hint:null,fishT:0,collapsed:new Set(),stack:[],warped:false,tog:0,hits:0,gotSticker:false,...fresh(lv),
     duel:!!opt.duel,duelChar:opt.char||null,custom:!!opt.custom,cname:opt.name||''};
  ['mapScreen','duelScreen','shopScreen','collScreen','buildScreen'].forEach(id=>document.getElementById(id).hidden=true);
  ['turn','duelRes'].forEach(id=>document.getElementById(id).hidden=true);
  document.getElementById('mapScreen').hidden=true;
  document.getElementById('gameScreen').hidden=false;
  document.getElementById('win').hidden=true;
  if(!opt.duel&&!opt.custom)save('journey_last',[w,l]);
  document.getElementById('gTitle').textContent='שלב '+(l+1)+'/6';
  const gi=document.getElementById('gIcon').getContext('2d');gi.clearRect(0,0,68,68);W.goal(gi,34,36,26);
  document.getElementById('gIcon').setAttribute('aria-label',W.name);
  document.getElementById('board').style.background=W.hex;
  document.getElementById('board').style.boxShadow='0 6px 0 '+W.deep;
  document.getElementById('medalPop').classList.add('top');
  document.querySelector('#gameScreen .bar').style.background='linear-gradient(100deg,'+W.hex+','+W.deep+')';
  {const U=W.ui||{},a=document.getElementById('act');
    document.getElementById('hintBtn').hidden=!U.hint;document.getElementById('undoBtn').hidden=!U.undo;
    a.hidden=!U.act;a.textContent=U.act?U.act[0]:'🎆';a.setAttribute('aria-label',U.act?U.act[1]:'לשים זיקוק');}
  const C=curChar();
  const hints={
    ice:'עזרי ל'+C.name+' להחליק אל בית הקרח. בכל לחיצה מחליקים עד הסוף! נתקעת? יש כפתור רמז.',
    castle:'עזרי ל'+C.name+' להגיע אל הכתר. כל מפתח פותח את הדלת בצבע שלו.',
    sea:'עזרי ל'+C.name+' לשחות אל תיבת האוצר. כשדג נרדם 💤 אפשר לשחות לידו. כשהאוויר נגמר חוזרים לבועה האחרונה.',
    jungle:'עזרי ל'+C.name+' להגיע אל אשכול הבננות. על הגשרים 🌉 עוברים, והם נופלים אחרייך, אז קודם אוספים כוכבים. כשקוף נרדם 💤 אפשר לעבור לידו.',
    space:'עזרי ל'+C.name+' להגיע אל החללית. כל פורטל מעביר אותך לפורטל באותו צבע.',
    farm:'אספי את כל האפרוחים 🐣 והביאי אותם אל התרנגולת. כשהשועל ישן 💤 אפשר לעבור לידו.',
    rainbow:'דלי צבע צובע את '+C.name+'. על רצפה צבעונית עוברים רק באותו צבע. הגיעי אל סוף הקשת!',
    toys:'דחפי את ארגזי הצעצועים 📦 כדי לפנות דרך אל הכדור. נתקעת? לחצי "צעד אחורה".',
    candy:'עזרי ל'+C.name+' להגיע אל העוגה. המסועים מסיעים אותך לכיוון החץ, ולחצן 🔘 מחליף בין השערים הוורודים לתכולים.'
  };
  tip=opt.custom?'המבוך "'+opt.name+'": אספי 3 כוכבים והגיעי אל '+W.goalName+'!':TIPS[W.id];setMsg(tip,false);
  const tipSeen=opt.custom||load('journey_tut',[]).includes(W.id);if(tipSeen)setTimeout(()=>speak(tip),300);
  document.getElementById('gTitle').textContent=(opt.duel||opt.custom)?opt.name:'שלב '+(l+1)+'/6'+(diff!==1?' '+DIFF[diff].i:'');
  document.getElementById('gName').textContent=(opt.duel||opt.custom)?(opt.custom?'🧱 ':'👭 ')+opt.name:W.name+' · שלב '+(l+1)+'/6'+(diff!==1?' '+DIFF[diff].i:'');
  {const gc=document.getElementById('gNameIcon').getContext('2d');gc.clearRect(0,0,56,56);W.goal(gc,28,30,22);}
  document.getElementById('win').style.setProperty('--wc',W.hex);
  document.getElementById('newMaze').hidden=!!opt.duel||!!opt.custom;document.getElementById('retry').hidden=!!opt.duel;document.getElementById('giveUp').hidden=!opt.duel;
  document.getElementById('pad').classList.toggle('off',!padOn);
  document.getElementById('padBtn').textContent=padOn?'🎮 בלי חצים':'🎮 עם חצים';
  document.getElementById('coinsBtn').hidden=!(W.id==='numbers'&&cfg.kind==='wallet');
  clearInterval(winTimer);pausedAt=0;document.getElementById('pause').hidden=true;document.getElementById('keypad').hidden=true;
  if(!focusOn)setFocus(true,false);  // the game always uses the big screen
  updateHud();showQuiz(true);resize();window.scrollTo(0,0);
  const seen=load('journey_tut',[]);
  if(opt.duel||opt.custom)document.getElementById('tut').hidden=true;
  else if(!seen.includes(W.id))showTut();else document.getElementById('tut').hidden=true;
}
function fresh(lv){return {chicksLeft:(lv.chicks||[]).map(c=>Object.assign({},c)),followers:[],hist:[],color:0,boxes:new Set(lv.boxes||[]),undo:[],
  flip:false,tw:lv.twinStart?{x:lv.twinStart.x,y:lv.twinStart.y}:null,tvis:null,parkA:false,parkB:false,ttrail:new Set(lv.twinStart?[lv.twinStart.x+','+lv.twinStart.y]:[]),
  bat:lv.batMax||0,seen:new Set(),tideT:0,tideAt:0,lastDry:{x:lv.start.x,y:lv.start.y},
  qi:0,qTries:0,qGlow:false,sum:0,coinsLeft:(lv.coins||[]).map(c=>Object.assign({},c)),...arcFresh(lv)};}
// the notes stay on one line: first smaller letters, then shorter words, and only then a little sideways scroll
function fitHud(){const h=document.getElementById('hud');if(!h||!focusOn)return;let f=.9;h.style.setProperty('--hudf',f+'rem');h.classList.remove('scroll');
  const over=()=>h.scrollWidth>h.clientWidth+1;
  while(over()&&f>.75){f=Math.round((f-.05)*100)/100;h.style.setProperty('--hudf',f+'rem');}
  if(over())h.querySelectorAll('.chip').forEach(c=>{if(c.children.length&&c.querySelector('b,span:not(.dot)'))return;const walk=n=>{if(n.nodeType===3){n.textContent=n.textContent.replace(/ מתוך /g,'/').replace(/^(\S+) [^\d:·]*: /,'$1 ');}else n.childNodes.forEach(walk);};walk(c);});
  while(over()&&f>.6){f=Math.round((f-.05)*100)/100;h.style.setProperty('--hudf',f+'rem');}
  if(over())h.classList.add('scroll');}
function updateHud(){
  const hud=document.getElementById('hud');hud.innerHTML='';
  if(G.duel){const t=document.createElement('span');t.className='chip';t.id='duelTimer';t.textContent='⏱️ '+(G.started?Math.floor((Date.now()-G.t0)/1000):0)+' שניות';hud.appendChild(t);}
  document.getElementById('gStars').textContent='★'.repeat(G.got)+'☆'.repeat(3-G.got);
  {const c=document.createElement('span');c.className='chip';c.id='hudStars';c.textContent='★'.repeat(G.got)+'☆'.repeat(3-G.got);c.style.color='#d99a00';c.style.display=focusOn?'':'none';hud.appendChild(c);}
  if(G.W.id==='castle'){
    G.lv.keys.forEach(k=>{const s=document.createElement('span');s.className='chip';
      const d=document.createElement('span');d.className='dot';d.style.background=G.keys.has(k.c)?KEYC[k.c].c:'transparent';d.style.borderColor=KEYC[k.c].c;
      s.appendChild(d);s.appendChild(document.createTextNode(G.keys.has(k.c)?'🗝️✓':'🗝️'));hud.appendChild(s);});
  }
  if(G.W.id==='sea'){
    const a=document.createElement('div');a.className='air'+(G.air<=6?' low':'');
    a.innerHTML='<i></i><span></span>';a.querySelector('i').style.width=(100*G.air/G.cfg.air)+'%';
    a.querySelector('span').textContent='אוויר '+G.air;hud.appendChild(a);
  }
  if(G.W.id==='ice'){
    const s=document.createElement('span');s.className='chip';s.textContent='⛸️ אפשר ב־'+G.lv.best;hud.appendChild(s);
  }
  if(G.W.id==='jungle'&&!G.custom){
    const s=document.createElement('span');s.className='chip';s.textContent='🌉 גשרים שנשארו: '+(G.lv.bridges.length-G.collapsed.size);hud.appendChild(s);
  }
  if(G.W.id==='space'&&!G.custom){
    const s=document.createElement('span');s.className='chip';s.textContent='🌀 זוגות פורטלים: '+G.lv.portals.length;hud.appendChild(s);
  }
  if(G.W.id==='farm'){
    const s=document.createElement('span');s.className='chip';s.textContent='🐣 אפרוחים: '+G.followers.length+' מתוך '+G.lv.chicks.length;hud.appendChild(s);
  }
  if(G.W.id==='rainbow'){
    const s=document.createElement('span');s.className='chip';const d=document.createElement('span');d.className='dot';
    d.style.background=G.color?RBC[G.color].c:'#ffffff';s.append(d,document.createTextNode(G.color?'עכשיו את '+RBC[G.color].f:'עוד אין לך צבע'));hud.appendChild(s);
  }
  if(G.W.id==='forest'&&!G.custom){const s=document.createElement('span');s.className='chip';s.textContent=G.flip?'🙃 החצים הפוכים!':'🙂 החצים רגילים';if(G.flip){s.style.background='#e9d8fd';s.style.color='#2a2140';}hud.appendChild(s);}
  if(G.W.id==='beach'){const s=document.createElement('span');s.className='chip';s.textContent='🌊 מחכים לשפל ורצים';hud.appendChild(s);}
  if(G.W.id==='mirror'){const s=document.createElement('span');s.className='chip';s.textContent='🩷 את: '+(G.parkA?'הגעת ✓':'בדרך')+' · 🩵 בבואה: '+(G.parkB?'הגיעה ✓':'בדרך');hud.appendChild(s);}
  if(QUIZ.has(G.W.id)){
    if(!G.duel){const b=document.createElement('button');b.className='chip btn';b.id='gradeChip';b.textContent='🎓 '+MATH.GRADES[G.lv.grade];b.title='להחליף כיתה';
      b.onclick=()=>{grade=(G.lv.grade+1)%6;save('journey_grade',grade);G.lv.qs=null;prepQuiz(G.lv,G.cfg,G.W.id);document.getElementById('retry').click();toast('עכשיו שאלות של כיתה '+MATH.GRADES[grade]);showQuiz(true);};hud.appendChild(b);}
    const s=document.createElement('span');s.className='chip';
    s.textContent=G.cfg.kind==='wallet'?'🪙 '+(G.lv.coins.length-G.coinsLeft.length):'❓ '+Math.min(G.qi+1,G.lv.qs.length)+'/'+G.lv.qs.length;hud.appendChild(s);
  }
  if(G.W.id==='haunt'){const a=document.createElement('div');a.className='air'+(G.bat<=4?' low':'');a.innerHTML='<i></i><span></span>';
    a.querySelector('i').style.width=(100*G.bat/G.lv.batMax)+'%';a.querySelector('i').style.background=G.bat<=4?'':'linear-gradient(90deg,#fff3a3,#ffd23f)';
    a.querySelector('span').textContent='🔦 פנס '+G.bat;hud.appendChild(a);}
  if(G.W.id==='toys'){
    const s=document.createElement('span');s.className='chip';s.textContent='📦 ארגזים: '+G.boxes.size;hud.appendChild(s);
  }
  if(G.W.id==='candy'){
    const s=document.createElement('span');s.className='chip';
    const d=document.createElement('span');d.className='dot';d.style.background=G.tog?'#ff4d9d':'#4cc9f0';
    s.append(d,document.createTextNode(G.tog?'השערים הוורודים פתוחים':'השערים התכולים פתוחים'));hud.appendChild(s);
  }
  if(isArc(G.W.id))arcHud(hud);
  if(!G.duel&&prog[G.w+'-'+G.l]!=null&&parOf()!=null){const s=document.createElement('span');s.className='chip';s.textContent=route[G.w+'-'+G.l]?'🏅 ✓':'🏅 '+parOf()+' 👣';s.title='הדרך הכי קצרה: '+parOf()+' מהלכים';hud.appendChild(s);}
  fitHud();
}
function fitBoard(){
  const b=document.getElementById('board'),gs=document.getElementById('gameScreen'),pad=document.getElementById('pad'),st=document.documentElement.style;
  ['--pw','--ph','--pg','--pf'].forEach(k=>pad.style.removeProperty(k));
  if(!focusOn){b.style.maxWidth='';document.body.classList.remove('land');return;}
  const vh=window.visualViewport?visualViewport.height:innerHeight,vw=window.visualViewport?visualViewport.width:innerWidth;
  st.setProperty('--vh',vh+'px');
  const land=vw>vh*1.15&&vw>=560;document.body.classList.toggle('land',land);
  if(land){
    // maze on one side, arrows on the other
    const top=gs.querySelector('.toprow').offsetHeight,q=document.getElementById('quiz'),qh=q.hidden?0:q.offsetHeight+6;
    const ph=Math.round(Math.min(64,Math.max(44,(vh-top-qh-60)/3.6)));pad.style.setProperty('--ph',ph+'px');pad.style.setProperty('--pw',Math.round(ph*1.15)+'px');pad.style.setProperty('--pf',(2+(ph-56)/40).toFixed(2)+'rem');
    const lw=Math.max(Math.max(230,pad.offsetWidth+16),Math.min(380,vw-(vh-14)-30));st.setProperty('--lw',Math.round(lw)+'px');
    const side=Math.max(220,Math.min(vh-14,vw-lw-30));
    st.setProperty('--bw',Math.floor(side)+'px');b.style.maxWidth='none';return;}
  let used=0;for(const el of gs.children){if(el===b||!el.offsetHeight)continue;used+=el.offsetHeight+8;}
  b.style.maxWidth=Math.max(240,Math.floor(vh-used-24))+'px';
  // a phone held upright has room left under the maze: use it for bigger arrows near the thumbs
  if(!pad.classList.contains('off')){
    let content=0;for(const el of gs.children)if(el.offsetHeight)content+=el.offsetHeight+6;
    const spare=vh-36-content;
    // the same comfortable size in every world; smaller only when the screen is short
    if(spare>40){const ph=Math.max(46,Math.min(58,50+(spare-60)*.25)),pw=Math.min(68,ph*1.17,(vw-40)/3);
      pad.style.setProperty('--ph',Math.round(ph)+'px');pad.style.setProperty('--pw',Math.round(pw)+'px');pad.style.setProperty('--pg',Math.round(6+(ph-50)*.1)+'px');pad.style.setProperty('--pf',(1.9+(ph-50)/60).toFixed(2)+'rem');}}
}
let focusOn=false,wasFs=false;
function fsEl(){return document.fullscreenElement||document.webkitFullscreenElement;}
function setFocus(on,persist){
  focusOn=on;document.body.classList.toggle('focus',on);
  {const hs=document.getElementById('hudStars');if(hs)hs.style.display=on?'':'none';}
if(persist!==false)save('journey_focus',on);
  const m=document.getElementById('msg');
  if(on)document.getElementById('gInfo').appendChild(m);else document.getElementById('pad').before(m);
  // in full screen only the arrows stay under the maze; the other buttons go up top
  const sb=document.querySelector('#gameScreen .small-btns');if(on)document.querySelector('.toprow').appendChild(sb);else document.getElementById('pad').after(sb);
  try{
    if(on&&!fsEl()){const el=document.documentElement,rq=el.requestFullscreen||el.webkitRequestFullscreen;if(rq){const pr=rq.call(el);if(pr&&pr.catch)pr.catch(()=>{});}}
    if(!on&&fsEl()){const ex=document.exitFullscreen||document.webkitExitFullscreen;if(ex){const pr=ex.call(document);if(pr&&pr.catch)pr.catch(()=>{});}}
  }catch(e){}
  resize();setTimeout(resize,120);setTimeout(resize,500);
}
['fullscreenchange','webkitfullscreenchange'].forEach(ev=>document.addEventListener(ev,()=>{
  
  setTimeout(resize,60);}));

if(window.visualViewport)visualViewport.addEventListener('resize',()=>resize());
function resize(){
  fitBoard();
  if(!G)return;const r=cv.getBoundingClientRect(),d=window.devicePixelRatio||1;
  cv.width=Math.round(r.width*d);cv.height=Math.round(r.height*d);
}

let audio;
function beep(f,d,type){if(muted)return;try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=f;o.type=type||'triangle';g.gain.setValueAtTime(.14,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+d);}catch(e){}}
let toastT,tip='';
const TIPS={ice:'בכל לחיצה מחליקים עד שנתקעים. אפשר להקיש על המבוך או להחליק באצבע.',castle:'כל מפתח פותח את הדלת בצבע שלו.',sea:'בועה ממלאת אוויר. דג ישן 💤 לא מפריע.',jungle:'גשר נופל אחרייך. קוף ישן 💤 לא מפריע.',space:'פורטל מעביר לפורטל באותו צבע.',candy:'לחצן 🔘 מחליף בין השערים הוורודים לתכולים.',farm:'אספי את כל האפרוחים והביאי אותם לתרנגולת.',rainbow:'עוברים רק על רצפה בצבע שלך.',toys:'דוחפים ארגז אחד בכל פעם. אפשר לחזור צעד אחורה.',forest:'פטרייה סגולה 🍄 הופכת את החצים. עוד פטרייה מחזירה אותם.',beach:'גל מכסה חלק מהחול. מחכים שהמים יירדו ורצים!',mirror:'הבבואה זזה הפוך ימינה-שמאלה. מי שמגיעה למראה שלה מחכה שם.',haunt:'הפנס נחלש עם כל צעד. סוללה 🔋 ממלאת אותו. רוח ישנה 💤 לא מפריעה.',numbers:'עולים על התשובה הנכונה כדי לעבור. טעית? לא נורא, נסי שוב.',english:'עונים על השאלה ועולים על התשובה הנכונה. כשהתשובות ארוכות, הן מופיעות למעלה בצבעים.',hebrew:'עונים על השאלה ועולים על התשובה הנכונה. כשהתשובות ארוכות, הן מופיעות למעלה בצבעים.',logic:'חושבים רגע, ואז עולים על המשבצת של התשובה הנכונה.',
  tilt:'כל לחיצה מטה את הלוח והכול מתגלגל. סלע יכול לעצור אותך! 💡 ↩',shadow:'אל תחזרי בעקבות שלך, שם הצל! 👣',floors:'▲ עולה לאותו מקום בקומה שמעל. ▼ יורדת.',escape:'אספי רמזים 📜, פתרי, והקלידי את הקוד בדלת 🔐',
  soccer:'עומדים ליד הכדור ורואים לאן יתגלגל. ⭐ צהוב = גוֹל! צריך עזרה? רמז 💡',hoops:'עומדים בקו ישר מול סל. חץ ירוק? זורקים בכפתור 🏀!',
  ski:'ימינה ושמאלה בין הדגלים. המדרון מושך למטה!',swim:'עוברים חבל רק ברווח. מהר, לקיר הכחול!',tennis:'עומדים איפה שהכדור יגיע כדי להחזיר אותו.',
  hurdles:'רצים אל המשוכה וקופצים מעליה. בוץ? עוד לחיצה. מהר!',golf:'כל לחיצה היא חבטה. תכנני לפני שחובטים! צריך עזרה? רמז 💡',dojo:'בכל צעד הצבע הפתוח מתחלף. לבן תמיד בסדר. רמז? 💡',
  munch:'אוכלים את כל הנקודות. תות כוח 🍓 מבריח את הבלובים.',snake:'כל פרי מאריך את הזנב, ואי אפשר לעבור דרכו. נתקעת? צעד אחורה ↩',
  road:'מחכים לרווח בין המכוניות. במים עולים רק על בולי עץ.',bomb:'שמים זיקוק בכפתור 🎆 או בהקשה על הדמות, ומתרחקים!',
  ladders:'חץ למעלה ליד סולם: מטפסים 🪜. בלי סולם: קפיצה 🦘 מעל החביות. תזמני טוב!',mines:'המספר אומר כמה בורות יש ליד המשבצת: למעלה, למטה, ימינה ושמאלה.',
  deep:'צדף 🐚 מעיף מעל הקיר. קוצים? מחכים. מפלצת ישנה 💤 לא בולעת. ⚡ = שוחים מהר!',geometry:'מסתכלים על הציור, חושבים, ועולים על התשובה הנכונה.',
  sheep:'כבשה בורחת ממך בקו ישר. היכנסי מאחוריה! ↩ 💡',chef:'אוספים לפי הסדר במתכון. 🔥 = מחכים',memory:'תסתכלי טוב! כשתזוזי, הקירות ייעלמו. 👁️ = הצצה',
  spell:'אוספים את האותיות לפי הסדר. 🔊 אומר את המילה',paint:'צובעים הכול, כל משבצת פעם אחת. ↩ 💡',gravity:'⬆️ ⬇️ הופכים את כוח המשיכה, ⬅️ ➡️ הולכים. 💡',
  snow:'❄️ מקפיא מים, 🔥 ממיס קרח. אספי אותם בדרך!',savanna:'כל חיה רוצה אוכל אחר 💭 כשעולה אבק »» זזים מהשורה!',lagoon:'בין יבשה למים עוברים רק דרך צדף 🐚',
  carpet:'השטיח עף עד הסוף. 🪔 = משאלה שמעלימה סלע. 💡',ball:'קודם נעל הזכוכית 👠, אחר כך לארמון. ✨ = עוד זמן',toyroom:'🙈 זזים. 👀 קופאים! 🧺 = מחבוא',redhood:'על השביל בטוח 🛤️ ביער הזאב רודף 🐺 קטפי מהר וחזרי!',
  hansel:'הפירורים מראים את הדרך, אבל הציפורים אוכלות אותם 🐦',pigs:'לבנים 🧱 לבית, מהר לפני הזאב 🐺',beanstalk:'עוקפים קרשים חורקים 🪵 כדי לא להעיר את הענק',thorns:'נכנסים לקוץ = חותכים 🗡️ אחר כך רצים לאחו 🌼',
  match3:'מחליקים סוכרייה לשכנה כדי לסדר 3 בשורה 🍬 צריך עזרה? 💡',blocks:'גוררים צורה ללוח. נגיעה בצורה = סיבוב 🔄 שורה מלאה נעלמת!',match3b:'🔒 שורה דרך המנעול פותחת אותו. 🍫 שורה ליד השוקולד ממיסה אותו',blockscore:'כמה שורות ביחד = בונוס! 🔥 נסי לשבור את השיא',firetruck:'🔥 מכבים עם מים 💧 ממלאים בברז או בתחנה, ובסוף חוזרים לתחנה',schoolbus:'תחנות לפי המספרים 🚏 ⛔ חץ = רחוב חד־סטרי',train:'החצים בוחרים את הפנייה הבאה 🛤️ בצומת הרכבת מחכה',parking:'גוררים מכונית באצבע, או 🔄 ואז חצים. 💡 רמז, ↩ צעד אחורה',lights:'🔴 עוצרים · 🟡 מתכוננים · 🟢 עוברים',race:'⚡ טורבו · 🛢️ שמן מסובב · מהר אל הדגל 🏁',giant:'המסך זז איתך. במפה הקטנה רואים את הכוכבים 🟡 ואת המזרקה 🔴. נגיעה במבוך = ריצה עד הפנייה הבאה.',
  broom:'⬆️⬇️ עוברים בטבעות 💫 ➡️ = מהר יותר',stairs:'עולים על המדרגות רק כשהן בכיוון שלך 🪜',potion:'מתכון ➜ קדרה 🧪 ➜ דרך הווילון 🔮',owlpost:'כל מכתב למגדל בצבע שלו. 🌳 = מנוחה לינשוף',flykeys:'תופסים את המפתח בצבע שהדלת מבקשת 🗝️',wand:'ליד הדלת: 🪄 ואז לוחצים על החיצים לפי הסדר'};
function setMsg(t,hot){const el=document.getElementById('msg');el.textContent=t;el.classList.toggle('hot',!!hot);}
function toast(t){setMsg(t,true);speak(t);clearTimeout(toastT);toastT=setTimeout(()=>setMsg(tip,false),2200);}
/* ---------- how-to-play cards ---------- */
function miniArrow(c,x,y,r,a){c.save();c.translate(x,y);c.rotate(a||0);c.fillStyle='#ff5d8f';c.fillRect(-r*.6,-r*.12,r*.8,r*.24);c.beginPath();c.moveTo(r*.7,0);c.lineTo(r*.2,-r*.35);c.lineTo(r*.2,r*.35);c.fill();c.restore();}
function miniRock(c,x,y,r){c.fillStyle='#7d8fa8';c.beginPath();c.ellipse(x,y+r*.1,r*.7,r*.55,0,0,7);c.fill();c.fillStyle='#fff';c.beginPath();c.ellipse(x,y-r*.25,r*.5,r*.18,0,0,7);c.fill();}
const TUT={
  firetruck:[[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('🔥',x,y);},'נוסעים אל השריפה ומכבים'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('💧',x,y);},'כל שריפה לוקחת מים מהמיכל'],[(c,x,y,r)=>drawFireStation(c,x,y,r*.7),'בסוף חוזרים לתחנה']],
  schoolbus:[[(c,x,y,r)=>{c.font=(r*.7)+'px sans-serif';c.fillText('🚏1',x,y);},'אוספים לפי המספרים'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('⛔',x,y);},'בחץ נוסעים רק לכיוון שלו'],[(c,x,y,r)=>drawSchool(c,x,y,r*.7),'ובסוף לבית הספר']],
  train:[[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('🚂',x,y);},'הרכבת נוסעת לבד'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('⬅️',x,y);},'חץ = הפנייה בצומת הבא'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('📦',x,y);},'אוספים מטען ונוסעים לתחנה']],
  parking:[[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('🚗',x,y);},'המכונית האדומה רוצה לצאת'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('↔️',x,y);},'כל מכונית זזה רק בכיוון שלה'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('👆',x,y);},'גוררים באצבע']],
  lights:[[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('🔴',x,y);},'באדום עוצרים'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('🟢',x,y);},'בירוק עוברים'],[(c,x,y,r)=>drawPlayground(c,x,y,r*.7),'עד גן השעשועים']],
  race:[[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('🏁',x,y);},'מגיעים ראשונים לדגל'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('⚡',x,y);},'טורבו = מהר כפול'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('🛢️',x,y);},'שמן מסובב את המכונית']],
  giant:[[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('🗺️',x,y);},'המבוך גדול מהמסך, והמסך זז איתך'],[(c,x,y,r)=>{circle(c,x-r*.3,y,r*.18,'#ffb703');circle(c,x+r*.3,y,r*.22,'#e63946');},'במפה הקטנה: 🟡 כוכבים, 🔴 המזרקה'],[(c,x,y,r)=>drawFountain(c,x,y,r*.7),'אוספים כוכבים ומגיעים למזרקה']],
  match3b:[[(c,x,y,r)=>{drawCandy(c,x,y,r*.5,1,0,0);c.font=(r*.5)+'px sans-serif';c.fillText('🔒',x+r*.35,y-r*.35);},'שורה דרכה = המנעול נפתח'],[(c,x,y,r)=>drawCandy(c,x,y,r*.6,-5,0,0),'שורה ליד השוקולד ממיסה אותו'],[(c,x,y,r)=>drawCandy(c,x,y,r*.55,3,4,0),'צורת L = סוכרייה עטופה'],[(c,x,y,r)=>{drawCandy(c,x-r*.35,y,r*.35,0,1,0);drawCandy(c,x+r*.35,y,r*.35,4,4,0);},'שתי מיוחדות ביחד = בּוּם!']],
  blockscore:[[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('⭐',x,y);},'כל שורה = נקודות'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('🔥',x,y);},'כמה ביחד או ברצף = בונוס'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('🏆',x,y);},'שוברים את השיא']],
  broom:[[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('🧹',x,y);},'המטאטא טס לבד'],[(c,x,y,r)=>{c.strokeStyle='#ffd23f';c.lineWidth=r*.15;c.beginPath();c.ellipse(x,y,r*.25,r*.5,0,0,7);c.stroke();},'עוברים בכל הטבעות'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('☁️',x,y);},'לא נכנסים בעננים']],
  stairs:[[(c,x,y,r)=>{c.fillStyle='#bc8a5f';c.fillRect(x-r*.6,y-r*.3,r*1.2,r*.6);},'מדרגות לרוחב'],[(c,x,y,r)=>{c.fillStyle='#bc8a5f';c.fillRect(x-r*.3,y-r*.6,r*.6,r*1.2);},'ועכשיו לאורך!'],[(c,x,y,r)=>{c.fillStyle='#ffd166';c.fillRect(x-r*.6,y-r*.3,r*1.2,r*.6);c.font=(r*.5)+'px sans-serif';c.fillText('⚠️',x,y);},'מהבהבות = עוד רגע מסתובבות']],
  potion:[[(c,x,y,r)=>{c.font=(r*.5)+'px sans-serif';c.fillText('🍄🌿🦎',x,y);},'אוספים לפי המתכון'],[(c,x,y,r)=>drawCauldron(c,x,y,r*.7,0),'מבשלים בקדרה'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('🔮',x,y);},'עוברים דרך וילון הקסם']],
  owlpost:[[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('✉️',x,y);},'מכתב למגדל בצבע שלו'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('🦉',x,y);},'כל צעד מעייף את הינשוף'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('🌳',x,y);},'בעץ הוא נח']],
  flykeys:[[(c,x,y,r)=>drawKey(c,x,y,r*.6,'#e63946'),'מפתחות עפים בחדר'],[(c,x,y,r)=>drawMagicDoor(c,x,y,r*.7),'הדלת מראה איזה צבע'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('💨',x,y);},'מפתח לא נכון בורח']],
  wand:[[(c,x,y,r)=>drawMagicDoor(c,x,y,r*.7),'עומדים ליד דלת קסומה'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('🪄',x,y);},'לוחצים על השרביט'],[(c,x,y,r)=>{c.font=(r*.4)+'px sans-serif';c.fillText('⬆️➡️⬇️',x,y);},'לוחצים על החיצים לפי הסדר']],
  match3:[[(c,x,y,r)=>{drawCandy(c,x-r*.55,y,r*.3,0,0,0);drawCandy(c,x,y,r*.3,0,0,0);drawCandy(c,x+r*.55,y,r*.3,1,0,0);miniArrow(c,x+r*.3,y+r*.45,r*.3,Math.PI);},'מחליפים שכנות'],[(c,x,y,r)=>{[-1,0,1].forEach(i=>drawCandy(c,x+i*r*.55,y,r*.3,2,0,0));},'3 באותו צבע נעלמות'],[(c,x,y,r)=>drawCandy(c,x,y,r*.6,4,1,0),'4 בשורה = פסים'],[(c,x,y,r)=>drawCandy(c,x,y,r*.6,0,3,0),'5 = פצצת שוקולד']],
  blocks:[[(c,x,y,r)=>{c.fillStyle='#ffca3a';[[0,0],[1,0],[0,1]].forEach(([a,b])=>{c.fillRect(x-r*.5+a*r*.5,y-r*.5+b*r*.5,r*.46,r*.46);});},'גוררים צורה ללוח'],[(c,x,y,r)=>{for(let i=0;i<5;i++){c.fillStyle=['#ff595e','#ffca3a','#8ac926','#1982c4','#6a4c93'][i];c.fillRect(x-r*.9+i*r*.37,y-r*.18,r*.34,r*.34);}},'שורה מלאה נעלמת!'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('🔄',x,y);},'נגיעה בצורה מסובבת אותה'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('🧹',x,y);},'נתקעת? מטאטא קסם']],
  hansel:[[(c,x,y,r)=>{for(let i=0;i<4;i++)circle(c,x-r*.6+i*r*.4,y+(i%2?r*.1:-r*.1),r*.1,'#e9c46a');},'פירורים מראים את הדרך'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('🐦',x,y);},'הציפורים אוכלות אותם'],[(c,x,y,r)=>drawCandyHouse(c,x,y,r*.7),'קודם לבית הממתקים'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('🏠',x,y);},'ואז חוזרים הביתה']],
  pigs:[[(c,x,y,r)=>{c.fillStyle='#bc4749';c.fillRect(x-r*.4,y-r*.25,r*.8,r*.5);},'אוספים לבנים'],[(c,x,y,r)=>drawPigHouse(c,x,y,r*.7),'בונים את הבית'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('🐺',x,y);},'לפני שהזאב מגיע!']],
  beanstalk:[[(c,x,y,r)=>{c.fillStyle='#ffc300';c.beginPath();c.ellipse(x,y,r*.35,r*.45,0,0,7);c.fill();},'לוקחים את ביצת הזהב'],[(c,x,y,r)=>{c.fillStyle='#b08968';c.fillRect(x-r*.6,y-r*.6,r*1.2,r*1.2);c.font=(r*.5)+'px sans-serif';c.fillText('🔔',x,y);},'קרש חורק = רעש'],[(c,x,y,r)=>drawGiant(c,x,y,r*.7,0),'יותר מדי רעש? הענק קם!'],[(c,x,y,r)=>drawBeanTop(c,x,y,r*.7),'חוזרים לפול']],
  thorns:[[(c,x,y,r)=>{c.save();c.translate(x-r*.6,y-r*.6);const ss=r*1.2;c.fillStyle='#1b4332';c.fillRect(0,0,ss,ss);c.restore();c.font=(r*.6)+'px sans-serif';c.fillText('🗡️',x,y);},'נכנסים לקוץ וחותכים'],[(c,x,y,r)=>{c.fillStyle='#b7e4c7';c.fillRect(x-r*.6,y-r*.6,r*1.2,r*1.2);c.font=(r*.6)+'px sans-serif';c.fillText('🌼',x,y);},'באחו בטוח'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('🌹',x,y);},'הקוצים צומחים שוב!'],[(c,x,y,r)=>drawCastleTower(c,x,y,r*.75),'מגיעים למגדל']],
  redhood:[[(c,x,y,r)=>{c.font=(r*.9)+'px sans-serif';c.fillText('🌷',x,y);},'קוטפים פרחים לסבתא'],[(c,x,y,r)=>{c.fillStyle='#e3bd8c';c.fillRect(x-r*.8,y-r*.3,r*1.6,r*.6);c.font=(r*.5)+'px sans-serif';c.fillText('🛤️',x,y);},'על השביל בטוח'],[(c,x,y,r)=>drawWolf(c,x,y,r*.7,true),'ביער הזאב רודף!'],[(c,x,y,r)=>drawGrandma(c,x,y,r*.75),'מביאים לסבתא']],
  snow:[[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('❄️',x-r*.35,y);c.fillStyle='#4895ef';c.fillRect(x+r*.05,y-r*.35,r*.7,r*.7);},'פתית שלג מקפיא מים'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('🔥',x-r*.35,y);c.fillStyle='#90e0ef';c.fillRect(x+r*.05,y-r*.35,r*.7,r*.7);},'להבה ממיסה קיר קרח'],[(c,x,y,r)=>drawSnowPalace(c,x,y,r*.7),'מגיעים לארמון']],
  savanna:[[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('🦒',x-r*.25,y+r*.1);c.font=(r*.45)+'px sans-serif';c.fillText('💭',x+r*.4,y-r*.45);c.font=(r*.25)+'px sans-serif';c.fillText('🍃',x+r*.4,y-r*.47);},'כל חיה רוצה אוכל'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('🍃',x,y);},'אוספים ומביאים לה'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('🐃',x,y);},'עדר! זזים מהשורה'],[(c,x,y,r)=>drawSunRock(c,x,y,r*.75),'עולים לסלע']],
  lagoon:[[(c,x,y,r)=>{c.fillStyle='#f6e7b4';c.fillRect(x-r*.8,y-r*.4,r*.8,r*.8);c.fillStyle='#4cc9f0';c.fillRect(x,y-r*.4,r*.8,r*.8);c.font=(r*.5)+'px sans-serif';c.fillText('🦶',x-r*.4,y);c.fillText('🧜‍♀️',x+r*.4,y);},'רגליים ביבשה, זנב במים'],[(c,x,y,r)=>{c.font=(r*.9)+'px sans-serif';c.fillText('🐚',x,y);},'עוברים רק דרך צדף'],[(c,x,y,r)=>drawGrotto(c,x,y,r*.75),'שוחים אל המערה']],
  carpet:[[(c,x,y,r)=>{c.fillStyle='#9d4edd';c.fillRect(x-r*.7,y+r*.1,r*.9,r*.2);miniArrow(c,x+r*.45,y+r*.2,r*.4);},'השטיח עף עד הסוף'],[(c,x,y,r)=>{c.font=(r*.9)+'px sans-serif';c.fillText('🪔',x,y);},'מנורה = משאלה'],[(c,x,y,r)=>{c.fillStyle='#bc6c25';c.fillRect(x-r*.35,y-r*.35,r*.7,r*.7);c.font=(r*.6)+'px sans-serif';c.fillText('✨',x+r*.3,y-r*.3);},'הסלע הראשון נעלם'],[(c,x,y,r)=>drawPalace(c,x,y,r*.75),'טסים לארמון']],
  ball:[[(c,x,y,r)=>{c.font=(r*.9)+'px sans-serif';c.fillText('👠',x,y);},'מוצאים את הנעל'],[(c,x,y,r)=>{c.font=(r*.9)+'px sans-serif';c.fillText('🕛',x,y);},'כל צעד הוא דקה'],[(c,x,y,r)=>{c.font=(r*.9)+'px sans-serif';c.fillText('✨',x,y);},'שרביט נותן עוד זמן'],[(c,x,y,r)=>drawBallCastle(c,x,y,r*.75),'לארמון לפני 12']],
  toyroom:[[(c,x,y,r)=>{c.font=(r*.9)+'px sans-serif';c.fillText('🙈',x,y);},'היא משחקת: זזים'],[(c,x,y,r)=>{c.font=(r*.9)+'px sans-serif';c.fillText('👀',x,y);},'היא מסתכלת: קופאים!'],[(c,x,y,r)=>{c.fillStyle='#9d4edd';c.fillRect(x-r*.5,y-r*.4,r,r*.8);c.font=(r*.5)+'px sans-serif';c.fillText('🧺',x,y);},'מתחת לשמיכה מותר'],[(c,x,y,r)=>drawToyChest(c,x,y,r*.75),'מגיעים לתיבה']],
  sheep:[[(c,x,y,r)=>drawSheep(c,x,y,r*.75),'כבשה בורחת צעד ממך'],[(c,x,y,r)=>{drawChar(c,curChar(),x-r*.5,y,r*.38);miniArrow(c,x,y,r*.35);drawSheep(c,x+r*.5,y,r*.36);},'נכנסים מאחוריה ודוחפים'],[(c,x,y,r)=>drawPen(c,x,y,r*.75),'כולן לדיר, ואז גם את']],
  chef:[[(c,x,y,r)=>{c.font=(r*.45)+'px sans-serif';c.fillText('🥚 🥛 🍫',x,y);},'המתכון למעלה'],[(c,x,y,r)=>{circle(c,x,y,r*.6,'#ffffff');c.font=(r*.7)+'px sans-serif';c.fillText('🥚',x,y);},'אוספים לפי הסדר'],[(c,x,y,r)=>{c.fillStyle='#343a40';c.fillRect(x-r*.6,y-r*.6,r*1.2,r*1.2);c.font=(r*.7)+'px sans-serif';c.fillText('🔥',x,y);},'כיריים חמות? מחכים'],[(c,x,y,r)=>drawPot(c,x,y,r*.75),'מבשלים בסיר']],
  memory:[[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('👀',x,y);},'מסתכלים טוב על המבוך'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('🪄',x,y);},'כשזזים, הקירות נעלמים'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('👁️',x,y);},'הצצה מחזירה אותם לרגע']],
  spell:[[(c,x,y,r)=>{c.font=(r*.9)+'px sans-serif';c.fillText('🐱',x,y);},'מה בתמונה?'],[(c,x,y,r)=>{['C','A','T'].forEach((ch,i)=>{c.fillStyle=['#ff595e','#8ac926','#1982c4'][i];c.fillRect(x-r*.85+i*r*.6,y-r*.25,r*.5,r*.5);c.fillStyle='#fff';c.font='bold '+(r*.4)+'px sans-serif';c.fillText(ch,x-r*.6+i*r*.6,y);});},'אוספים אותיות לפי הסדר'],[(c,x,y,r)=>{c.font=(r*.8)+'px sans-serif';c.fillText('🔊',x,y);},'הכפתור אומר את המילה']],
  paint:[[(c,x,y,r)=>{['#ff595e','#ffca3a','#8ac926'].forEach((col,i)=>{c.fillStyle=col;c.fillRect(x-r*.75+i*r*.5,y-r*.22,r*.45,r*.45);});},'כל צעד צובע משבצת'],[(c,x,y,r)=>{c.fillStyle='#ff595e';c.fillRect(x-r*.4,y-r*.4,r*.8,r*.8);c.strokeStyle='#2a2140';c.lineWidth=r*.12;c.beginPath();c.moveTo(x-r*.3,y-r*.3);c.lineTo(x+r*.3,y+r*.3);c.moveTo(x+r*.3,y-r*.3);c.lineTo(x-r*.3,y+r*.3);c.stroke();},'על צבע רטוב לא דורכים'],[(c,x,y,r)=>drawPalette(c,x,y,r*.75),'צובעים את כל הרצפה']],
  gravity:[[(c,x,y,r)=>{drawChar(c,curChar(),x,y+r*.15,r*.4);c.font=(r*.5)+'px sans-serif';c.fillText('⬆️',x,y-r*.6);},'⬆️ נופלים לתקרה'],[(c,x,y,r)=>{drawChar(c,curChar(),x,y-r*.15,r*.4);c.font=(r*.5)+'px sans-serif';c.fillText('⬇️',x,y+r*.6);},'⬇️ חוזרים לרצפה'],[(c,x,y,r)=>drawMine(c,x,y,r*.6,0),'זהירות ממוקשים'],[(c,x,y,r)=>drawRocket(c,x,y,r*.75,0),'מגיעים לחללית']],
  ice:[[(c,x,y,r)=>{drawChar(c,curChar(),x-r*.45,y,r*.5);miniArrow(c,x+r*.35,y,r*.6);},'בכל לחיצה מחליקים עד הסוף'],[(c,x,y,r)=>{miniRock(c,x+r*.35,y,r*.55);drawChar(c,curChar(),x-r*.35,y,r*.5);},'סלע או קצה עוצרים אותך'],[(c,x,y,r)=>drawIgloo(c,x,y,r*.9),'מגיעים לבית הקרח. נתקעת? יש רמז 💡']],
  castle:[[(c,x,y,r)=>drawKey(c,x,y,r*.8,KEYC[0].c),'מוצאים מפתח'],[(c,x,y,r)=>{c.fillStyle=KEYC[0].c;c.fillRect(x-r*.12,y-r*.7,r*.24,r*1.4);circle(c,x,y,r*.08,'#2a2140');},'הוא פותח דלת באותו צבע'],[(c,x,y,r)=>drawCrown(c,x,y,r*.9),'מגיעים אל הכתר']],
  sea:[[(c,x,y,r)=>drawBubble(c,x,y,r,0),'בועה ממלאת את האוויר'],[(c,x,y,r)=>{c.globalAlpha=.4;drawFishFoe(c,x,y,r*.8);c.globalAlpha=1;c.fillStyle='#2a2140';c.font='bold '+(r*.5)+'px sans-serif';c.fillText('z',x+r*.4,y-r*.4);},'דג ישן 💤 לא מפריע לעבור'],[(c,x,y,r)=>drawChest(c,x,y,r*.9),'מגיעים לתיבת האוצר']],
  jungle:[[(c,x,y,r)=>{c.fillStyle='#5fb8e6';c.fillRect(x-r*.8,y-r*.8,r*1.6,r*1.6);c.fillStyle='#c8914f';c.fillRect(x-r*.8,y-r*.3,r*1.6,r*.6);},'על הגשר עוברים פעם אחת'],[(c,x,y,r)=>{c.globalAlpha=.4;drawMonkey(c,x,y,r*.8);c.globalAlpha=1;},'קוף ישן 💤 לא מפריע'],[(c,x,y,r)=>drawBananas(c,x,y+r*.2,r*.8),'מגיעים לבננות']],
  space:[[(c,x,y,r)=>{drawPortal(c,x-r*.45,y,r*.45,PORTALC[0],0);drawPortal(c,x+r*.45,y,r*.45,PORTALC[0],500);},'נכנסים לפורטל'],[(c,x,y,r)=>{drawPortal(c,x,y,r*.6,PORTALC[0],0);drawChar(c,curChar(),x,y,r*.4);},'ויוצאים מהפורטל באותו צבע'],[(c,x,y,r)=>drawRocket(c,x,y,r*.85),'מגיעים לחללית']],
  candy:[[(c,x,y,r)=>{c.fillStyle='#adb5c4';c.fillRect(x-r*.8,y-r*.5,r*1.6,r);miniArrow(c,x,y,r*.6);},'המסוע מסיע לכיוון החץ'],[(c,x,y,r)=>{circle(c,x,y,r*.6,'#6d6384');c.fillStyle='#ff4d9d';c.beginPath();c.arc(x,y-r*.05,r*.52,Math.PI/2,Math.PI*1.5);c.fill();c.fillStyle='#4cc9f0';c.beginPath();c.arc(x,y-r*.05,r*.52,-Math.PI/2,Math.PI/2);c.fill();},'לחצן מחליף את השערים'],[(c,x,y,r)=>drawCake(c,x,y,r*.85),'מגיעים לעוגה']],
  farm:[[(c,x,y,r)=>{drawChar(c,curChar(),x+r*.45,y,r*.45);drawChick(c,x-r*.1,y+r*.15,r*.3);drawChick(c,x-r*.55,y+r*.15,r*.3);},'אפרוחים הולכים אחרייך'],[(c,x,y,r)=>{c.globalAlpha=.4;drawFox(c,x,y,r*.8);c.globalAlpha=1;},'שועל ישן 💤 לא מפריע'],[(c,x,y,r)=>drawHen(c,x,y,r*.85),'מביאים את כולם לתרנגולת']],
  rainbow:[[(c,x,y,r)=>drawBucket(c,x,y,r*.8,RBC[1].c),'דלי צובע אותך'],[(c,x,y,r)=>{c.fillStyle=RBC[1].c;c.fillRect(x-r*.7,y-r*.7,r*1.4,r*1.4);circle(c,x,y,r*.5,RBC[1].c);drawChar(c,curChar(),x,y,r*.45);},'עוברים על רצפה בצבע שלך'],[(c,x,y,r)=>drawRainbowEnd(c,x,y,r*.85),'מגיעים לסוף הקשת']],
  toys:[[(c,x,y,r)=>{c.fillStyle='#d4a373';c.fillRect(x-r*.05,y-r*.4,r*.8,r*.8);drawChar(c,curChar(),x-r*.5,y,r*.4);},'נכנסים בארגז כדי לדחוף'],[(c,x,y,r)=>{c.font=(r*1.1)+'px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('↩',x,y);},'נתקעת? צעד אחורה'],[(c,x,y,r)=>drawBall(c,x,y,r*.9),'מגיעים לכדור']],
  forest:[[(c,x,y,r)=>drawMushroom(c,x,y+r*.1,r*.9),'פטרייה סגולה הופכת את החצים'],[(c,x,y,r)=>{miniArrow(c,x,y-r*.3,r*.5,-Math.PI/2);miniArrow(c,x,y+r*.35,r*.5,Math.PI/2);},'למעלה נהיה למטה'],[(c,x,y,r)=>drawFairyHouse(c,x,y,r*.85),'מגיעים לבית הפיות']],
  beach:[[(c,x,y,r)=>{c.fillStyle='#f7e4b5';c.fillRect(x-r*.8,y-r*.8,r*1.6,r*1.6);c.fillStyle='#4fb3e8';c.fillRect(x-r*.8,y-r*.1,r*1.6,r*.9);},'גל מכסה את החול'],[(c,x,y,r)=>{drawChar(c,curChar(),x,y,r*.5);c.font=(r*.5)+'px sans-serif';c.fillText('⏳',x+r*.55,y-r*.5);},'מחכים שהמים יירדו'],[(c,x,y,r)=>drawSandcastle(c,x,y,r*.85),'מגיעים לארמון החול']],
  mirror:[[(c,x,y,r)=>{drawChar(c,curChar(),x-r*.4,y,r*.4);c.save();c.globalAlpha=.55;c.translate(x+r*.4,y);c.scale(-1,1);drawChar(c,curChar(),0,0,r*.4);c.restore();},'הבבואה זזה הפוך ימינה-שמאלה'],[(c,x,y,r)=>{drawMirrorGoal(c,x-r*.4,y,r*.6,'#ff5d8f');drawMirrorGoal(c,x+r*.4,y,r*.6,'#4cc9f0');},'לכל אחת יש מראה משלה'],[(c,x,y,r)=>{drawMirrorGoal(c,x,y,r*.8,'#ff5d8f');drawChar(c,curChar(),x,y+r*.1,r*.35);},'מי שהגיעה מחכה שם']],
  haunt:[[(c,x,y,r)=>{c.fillStyle='#1a1428';c.fillRect(x-r*.8,y-r*.8,r*1.6,r*1.6);c.fillStyle='rgba(255,236,150,.35)';c.beginPath();c.arc(x,y,r*.6,0,7);c.fill();drawChar(c,curChar(),x,y,r*.4);},'הפנס מאיר קרוב אלייך'],[(c,x,y,r)=>drawBattery(c,x,y,r),'סוללה ממלאת את הפנס'],[(c,x,y,r)=>{c.globalAlpha=.5;drawGhost(c,x,y,r*.9);c.globalAlpha=1;},'רוח ישנה 💤 לא מפריעה']],
  numbers:[[(c,x,y,r)=>numTile(c,x,y,r*1.1,'?','future'),'קוראים את השאלה למעלה'],[(c,x,y,r)=>numTile(c,x,y,r*1.1,'15','done'),'עולים על התשובה הנכונה'],[(c,x,y,r)=>drawTrophy(c,x,y+r*.1,r*.9),'מגיעים לגביע']],
  english:[[(c,x,y,r)=>{numTile(c,x-r*.42,y,r*.75,'','cur',0);numTile(c,x+r*.42,y,r*.75,'','cur',1);},'כל תשובה בצבע משלה'],[(c,x,y,r)=>numTile(c,x,y,r*1.1,'','cur',2),'עולים על הצבע של התשובה הנכונה'],[(c,x,y,r)=>drawABC(c,x,y,r*.9),'מגיעים לקוביות']],
  hebrew:[[(c,x,y,r)=>numTile(c,x,y,r*1.1,'כ','cur'),'אותיות, מילים והפכים'],[(c,x,y,r)=>numTile(c,x,y,r*1.1,'','cur',1),'תשובה ארוכה? לפי הצבע'],[(c,x,y,r)=>drawBook(c,x,y,r*.9),'מגיעים לספר הקסמים']],
  logic:[[(c,x,y,r)=>numTile(c,x,y,r*1.1,'🔵','cur'),'מה ממשיך את הדפוס?'],[(c,x,y,r)=>numTile(c,x,y,r*1.1,'','cur',2),'חידה? עונים לפי הצבע'],[(c,x,y,r)=>drawPuzzle(c,x,y,r*.9),'מגיעים לפאזל']],
  munch:[[(c,x,y,r)=>{c.fillStyle='#0b0b2a';c.fillRect(x-r*.8,y-r*.8,r*1.6,r*1.6);c.fillStyle='#ffd7a8';[-.5,0,.5].forEach(a=>c.fillRect(x+a*r-r*.08,y-r*.08,r*.16,r*.16));},'אוכלים את כל הנקודות'],[(c,x,y,r)=>{c.fillStyle='#0b0b2a';c.fillRect(x-r*.8,y-r*.8,r*1.6,r*1.6);drawBlob(c,x,y,r*.6,BLOBC[0],false,false,0);},'בלוב תופס? חוזרים להתחלה'],[(c,x,y,r)=>drawBerry(c,x,y,r*.7),'תות כוח: עכשיו את תופסת אותם!']],
  snake:[[(c,x,y,r)=>{circle(c,x,y,r*.38,'#e63946');circle(c,x-r*.12,y-r*.08,r*.1,'#ffb3b8');},'כל פרי מאריך את הזנב'],[(c,x,y,r)=>{c.strokeStyle='#43a047';c.lineWidth=r*.5;c.lineCap='round';c.beginPath();c.moveTo(x-r*.6,y+r*.4);c.lineTo(x-r*.6,y-r*.3);c.lineTo(x+r*.5,y-r*.3);c.stroke();drawChar(c,curChar(),x+r*.5,y-r*.3,r*.38);},'אי אפשר לעבור דרך הזנב'],[(c,x,y,r)=>drawNest(c,x,y,r*.9),'אחרי כל הפירות, אל הקן']],
  road:[[(c,x,y,r)=>{c.fillStyle='#3d3d4f';c.fillRect(x-r*.8,y-r*.5,r*1.6,r);drawCar(c,x-r*.5,y-r*.5,r,'#ff595e',1);},'מחכים לרווח בין המכוניות'],[(c,x,y,r)=>{c.fillStyle='#2b7de9';c.fillRect(x-r*.8,y-r*.5,r*1.6,r);c.fillStyle='#8b5a2b';c.fillRect(x-r*.6,y-r*.3,r*1.2,r*.6);drawChar(c,curChar(),x,y,r*.35);},'בנהר עומדים רק על בול עץ'],[(c,x,y,r)=>drawLily(c,x,y,r*.85),'מגיעים לעלה הלוטוס']],
  bomb:[[(c,x,y,r)=>{circle(c,x,y+r*.1,r*.45,'#2a2140');circle(c,x+r*.35,y-r*.45,r*.12,'#ffd23f');},'שמים זיקוק 🎆 ליד קיר סדוק'],[(c,x,y,r)=>{circle(c,x,y,r*.6,'#ffb703');circle(c,x,y,r*.35,'#fff3b0');},'מתרחקים! הוא מפוצץ לכל הכיוונים'],[(c,x,y,r)=>drawExitDoor(c,x,y,r*.85),'מאחורי הקירות: כוכבים והדלת']],
  ladders:[[(c,x,y,r)=>{c.strokeStyle='#4cc9f0';c.lineWidth=r*.12;c.beginPath();c.moveTo(x-r*.3,y-r*.8);c.lineTo(x-r*.3,y+r*.8);c.moveTo(x+r*.3,y-r*.8);c.lineTo(x+r*.3,y+r*.8);for(let i=0;i<4;i++){c.moveTo(x-r*.3,y-r*.6+i*r*.4);c.lineTo(x+r*.3,y-r*.6+i*r*.4);}c.stroke();},'מטפסים רק בסולם'],[(c,x,y,r)=>{drawBarrel(c,x,y+r*.4,r*.35,.5);drawChar(c,curChar(),x,y-r*.35,r*.35);},'קופצים מעל חבית: חץ למעלה או 🦘'],[(c,x,y,r)=>drawFlag(c,x,y,r*.85),'מגיעים לדגל למעלה']],
  deep:[[(c,x,y,r)=>{c.fillStyle='#14507a';c.fillRect(x-r*.8,y-r*.8,r*1.6,r*1.6);drawClam(c,x,y+r*.1,r*.7,1,0);},'צדף קפיצי מעיף אותך מעל קיר'],[(c,x,y,r)=>{c.fillStyle='#14507a';c.fillRect(x-r*.8,y-r*.8,r*1.6,r*1.6);drawUrchin(c,x-r*.35,y,r*.4,true,false,0);drawSeaMonster(c,x+r*.4,y,r*.32,true);},'קוצים ומפלצת ער: מערבולת!'],[(c,x,y,r)=>{c.fillStyle='#14507a';c.fillRect(x-r*.8,y-r*.8,r*1.6,r*1.6);drawSpeedShell(c,x,y,r*.55,0);},'צדף מהירות: שוחים מהר']],
  geometry:[[(c,x,y,r)=>{c.fillStyle='#ffd6e8';c.strokeStyle='#2a2140';c.lineWidth=3;c.beginPath();c.moveTo(x,y-r*.6);c.lineTo(x+r*.65,y+r*.5);c.lineTo(x-r*.65,y+r*.5);c.closePath();c.fill();c.stroke();},'מסתכלים על הציור למעלה'],[(c,x,y,r)=>numTile(c,x,y,r*1.1,'12','done'),'עולים על התשובה הנכונה'],[(c,x,y,r)=>drawSetSquare(c,x,y,r*.9),'מגיעים לסרגל']],
  mines:[[(c,x,y,r)=>{c.fillStyle='#e6cfa4';c.fillRect(x-r*.7,y-r*.7,r*1.4,r*1.4);c.fillStyle='#1982c4';c.font='bold '+(r*.9)+'px monospace';c.fillText('1',x,y+r*.05);},'המספר: כמה בורות ממש ליד'],[(c,x,y,r)=>{c.fillStyle='#3b2a1f';c.beginPath();c.ellipse(x,y+r*.25,r*.65,r*.35,0,0,7);c.fill();drawMole(c,x,y,r*.45);},'נפלת לבור? חוזרים להתחלה'],[(c,x,y,r)=>drawCarrot(c,x,y,r*.85),'מגיעים לגזר']],
  soccer:[[(c,x,y,r)=>{drawChar(c,curChar(),x-r*.45,y,r*.4);drawSoccerBall(c,x+r*.2,y+r*.2,r*.25,0);miniArrow(c,x+r*.6,y+r*.2,r*.35);},'נכנסים בכדור כדי לבעוט'],[(c,x,y,r)=>{c.fillStyle='#ff7b00';c.beginPath();c.moveTo(x,y-r*.5);c.lineTo(x-r*.4,y+r*.4);c.lineTo(x+r*.4,y+r*.4);c.fill();},'הכדור נעצר ליד קונוס או קיר'],[(c,x,y,r)=>drawNetGoal(c,x,y,r*.85),'בועטים אותו לשער!']],
  hoops:[[(c,x,y,r)=>drawBasketball(c,x,y,r*.45),'עומדים בקו ישר מול סל'],[(c,x,y,r)=>{drawHoop(c,x,y,r*.8,false);miniArrow(c,x-r*.55,y+r*.5,r*.35);},'חץ ירוק? לוחצים על הכפתור הכתום'],[(c,x,y,r)=>{drawBasketball(c,x+r*.3,y+r*.35,r*.25);drawChar(c,curChar(),x-r*.3,y,r*.4);},'הולכים להרים את הכדור']],
  ski:[[(c,x,y,r)=>{drawChar(c,curChar(),x,y-r*.2,r*.4);miniArrow(c,x,y+r*.45,r*.4,Math.PI/2);},'המדרון מושך למטה'],[(c,x,y,r)=>{drawFlagPole(c,x-r*.45,y,r*.5,'#e63946');drawFlagPole(c,x+r*.45,y,r*.5,'#e63946');},'עוברים בין הדגלים'],[(c,x,y,r)=>drawTree(c,x,y,r*.7),'נזהרים מהעצים']],
  swim:[[(c,x,y,r)=>{for(let k=0;k<5;k++)circle(c,x-r*.7+k*r*.35,y,r*.12,k%2?'#ffffff':'#e63946');},'עוברים חבל רק ברווח'],[(c,x,y,r)=>{c.globalAlpha=.55;drawDuck(c,x,y,r*.5);c.globalAlpha=1;},'מתחרות בשחיינית אחרת'],[(c,x,y,r)=>drawMedal(c,x,y,r*.85),'הראשונה בקיר מנצחת']],
  tennis:[[(c,x,y,r)=>{drawTennisBall(c,x-r*.3,y-r*.3,r*.25);miniArrow(c,x+r*.2,y+r*.2,r*.35,Math.PI/4);},'הכדור קופץ באלכסון'],[(c,x,y,r)=>{drawChar(c,curChar(),x,y,r*.4);drawTennisBall(c,x+r*.45,y-r*.3,r*.18);},'עומדים בדרך שלו כדי להחזיר'],[(c,x,y,r)=>drawRacket(c,x,y,r*.85),'מספיק חבטות פותחות את היציאה']],
  hurdles:[[(c,x,y,r)=>drawHurdle(c,x,y,r*.7),'משוכה: קופצים בכפתור 🦘'],[(c,x,y,r)=>{c.fillStyle='#5d4037';c.beginPath();c.ellipse(x,y,r*.6,r*.45,0,0,7);c.fill();},'בוץ תוקע ללחיצה אחת'],[(c,x,y,r)=>drawStopwatch(c,x,y,r*.85),'מגיעים לפני שהזמן נגמר']],
  golf:[[(c,x,y,r)=>{circle(c,x-r*.3,y,r*.18,'#ffffff');miniArrow(c,x+r*.25,y,r*.4);},'כל לחיצה היא חבטה'],[(c,x,y,r)=>{c.fillStyle='#f2d49b';c.beginPath();c.ellipse(x-r*.35,y,r*.35,r*.3,0,0,7);c.fill();c.fillStyle='#3a86ff';c.beginPath();c.ellipse(x+r*.4,y,r*.35,r*.3,0,0,7);c.fill();},'חול עוצר, מים מחזירים'],[(c,x,y,r)=>drawGolfFlag(c,x,y,r*.85),'מעט חבטות = הרבה כוכבים']],
  dojo:[[(c,x,y,r)=>{c.fillStyle='#3a86ff';c.fillRect(x-r*.75,y-r*.35,r*.7,r*.7);c.fillStyle='#ef476f';c.fillRect(x+r*.05,y-r*.35,r*.7,r*.7);},'כחול ואדום מתחלפים בכל צעד'],[(c,x,y,r)=>{c.fillStyle='#f6efe0';c.fillRect(x-r*.6,y-r*.6,r*1.2,r*1.2);drawChar(c,curChar(),x,y,r*.4);},'על לבן אפשר תמיד'],[(c,x,y,r)=>drawJudoka(c,x,y,r*.7,false),'נכנסים ביריבה כדי להפיל אותה']],
  tilt:[[(c,x,y,r)=>{drawChar(c,curChar(),x-r*.4,y,r*.38);miniArrow(c,x+r*.35,y,r*.4);},'לחיצה מטה את כל הלוח'],[(c,x,y,r)=>{drawBoulder(c,x,y,r*.5);},'גם הסלעים מתגלגלים ועוצרים אותך'],[(c,x,y,r)=>drawHoleGoal(c,x,y,r*.8),'מגיעים אל החור הזוהר']],
  shadow:[[(c,x,y,r)=>drawShadowGhost(c,x,y,r*.7,0),'צל הולך בעקבות שלך'],[(c,x,y,r)=>{for(let i=0;i<4;i++)circle(c,x-r*.6+i*r*.4,y+(i%2?r*.1:-r*.1),r*.1,'#2b2140');},'אל תחזרי על העקבות'],[(c,x,y,r)=>drawLantern(c,x,y,r*.8),'אוספים פנסים ויוצאים']],
  floors:[[(c,x,y,r)=>{c.fillStyle='#fff1e6';c.fillRect(x-r*.8,y-r*.35,r*.75,r*.75);c.fillStyle='#e2ece9';c.fillRect(x+r*.05,y-r*.35,r*.75,r*.75);c.fillStyle='#2a2140';c.font='bold '+(r*.4)+'px sans-serif';c.fillText('1',x-r*.42,y);c.fillText('2',x+r*.42,y);},'כל הקומות זו לצד זו'],[(c,x,y,r)=>{c.fillStyle='#06d6a0';c.fillRect(x-r*.4,y-r*.4,r*.8,r*.8);c.fillStyle='#2a2140';c.font='bold '+(r*.5)+'px sans-serif';c.fillText('▲',x,y);},'מדרגות: לאותו מקום בקומה הבאה'],[(c,x,y,r)=>drawRoof(c,x,y,r*.85),'היציאה בקומה העליונה']],
  escape:[[(c,x,y,r)=>{c.font=(r*.9)+'px sans-serif';c.fillText('📜',x,y);},'אוספים רמזים'],[(c,x,y,r)=>{c.fillStyle='#2a2140';c.font='bold '+(r*.35)+'px sans-serif';c.fillText('🔴 = 3 + 4',x,y);},'פותרים כל תרגיל'],[(c,x,y,r)=>drawCodeDoor(c,x,y,r*.8,false),'מקלידים את הקוד בדלת']]
};
function showTut(){
  if(!G)return;const W=G.W;
  document.getElementById('tutTitle').textContent=W.name;
  const box=document.getElementById('tutSteps');box.innerHTML='';
  TUT[W.id].forEach(([fn,txt])=>{const d=document.createElement('div');const c=document.createElement('canvas');c.width=128;c.height=128;
    const cx=c.getContext('2d');cx.textAlign='center';cx.textBaseline='middle';fn(cx,64,64,52);d.append(c,document.createTextNode(txt));box.appendChild(d);});
  document.getElementById('tut').hidden=false;document.getElementById('tutGo').focus();
  speak(W.name+'. '+TUT[W.id].map(x=>x[1]).join('. '));
}
document.getElementById('tutGo').onclick=()=>{document.getElementById('tut').hidden=true;
  const seen=load('journey_tut',[]);if(G&&!seen.includes(G.W.id)){seen.push(G.W.id);save('journey_tut',seen);}};
document.getElementById('helpBtn').onclick=showTut;

function enter(x,y){
  const k=x+','+y;G.trail.add(k);
  if(G.stars.has(k)){G.stars.delete(k);G.got++;G.stack.push(k);beep(880,.15);buzz(15);flyStar(x,y);sparkle(x,y,['#ffd23f'],10);}
  const st=G.lv.sticker;
  if(st&&st!=='end'&&st[0]===x&&st[1]===y&&!stickers.has(G.w+'-'+G.l)){
    stickers.add(G.w+'-'+G.l);saveStickers();G.gotSticker=true;
    [988,1319,1568].forEach((f,i)=>setTimeout(()=>beep(f,.12,'sine'),i*80));toast('מצאת מדבקה '+WORLDS[G.w].stickers[G.l]+'! היא כבר באלבום.');checkMedals();
  }
}
function buzz(ms){try{if(navigator.vibrate)navigator.vibrate(ms);}catch(e){}}
function flyStar(x,y){
  const cm=G.lv.view&&G.cam?G.cam:null,r=cv.getBoundingClientRect(),cs=r.width/(cm?G.lv.view:G.lv.n),chip=document.getElementById(focusOn?'hudStars':'gStars')||document.getElementById('gStars'),t=chip.getBoundingClientRect();
  const f=document.createElement('span');f.className='fly';f.textContent='⭐';
  const sx=r.left+(x+.5-(cm?cm.x:0))*cs-14,sy=r.top+(y+.5-(cm?cm.y:0))*cs-14;f.style.left=sx+'px';f.style.top=sy+'px';document.body.appendChild(f);
  const calm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{f.style.transform='translate('+(t.left+t.width/2-14-sx)+'px,'+(t.top+t.height/2-14-sy)+'px) scale(.6)';f.style.opacity='.4';}));
  setTimeout(()=>{f.remove();if(G)updateHud();chip.classList.remove('bump');void chip.offsetWidth;chip.classList.add('bump');},calm?0:600);
}
function bumpWall(d){beep(140,.08);buzz(25);if(G)G.bump={t:performance.now(),d};}
function atGoal(){return G.p.x===G.lv.goal.x&&G.p.y===G.lv.goal.y;}

function move(dir){
  if(!G||!PARW.has(G.W.id))return move0(dir);
  const a=G.p.x+','+G.p.y,an=G.anim,gv=G.grav;move0(dir);
  if(G&&(G.p.x+','+G.p.y!==a||(G.anim&&G.anim!==an)||G.grav!==gv))G.moves=(G.moves||0)+1;
}
function move0(dir){
  if(!G||G.done||G.anim||pausedAt||!document.getElementById('keypad').hidden||!document.getElementById('tut').hidden||!document.getElementById('turn').hidden||!document.getElementById('duelRes').hidden||!document.getElementById('building').hidden)return;
  let d=DIRN[dir];
  if(G.W.id==='forest'){if(performance.now()<(G.flipLock||0))return;if(G.flip)d=(d+2)%4;}
  if(isArc(G.W.id)){arcMove(d);return;}
  if(G.W.id==='mirror'){
    const g=G.lv.g,md=d===1?3:d===3?1:d;let moved=false;
    if(!G.parkA&&!g[G.p.y][G.p.x][d]){G.p={x:G.p.x+DV[d][0],y:G.p.y+DV[d][1]};enter(G.p.x,G.p.y);moved=true;}
    if(!G.parkB&&!g[G.tw.y][G.tw.x][md]){G.tw={x:G.tw.x+DV[md][0],y:G.tw.y+DV[md][1]};const pt=G.trail;G.trail=G.ttrail;enter(G.tw.x,G.tw.y);G.trail=pt;moved=true;}
    if(!moved){if(G.parkA){beep(140,.08);buzz(25);}else bumpWall(d);return;}
    if(!G.parkA&&G.p.x===G.lv.goal.x&&G.p.y===G.lv.goal.y){G.parkA=true;beep(880,.12);beep(1175,.15);toast(G.parkB?'שתיכן הגעתן!':'הגעת למראה! 🩷 עכשיו רק הבבואה זזה');updateHud();}
    if(!G.parkB&&G.tw.x===G.lv.twinGoal.x&&G.tw.y===G.lv.twinGoal.y){G.parkB=true;beep(880,.12);beep(1175,.15);toast(G.parkA?'שתיכן הגעתן!':'הבבואה הגיעה למראה! 🩵 עכשיו רק את זזה');updateHud();}
    if(G.parkA&&G.parkB)win();
    return;
  }
  if(G.W.id==='ice'){
    const r=GEN.slide(G.lv.t,G.lv.n,G.p.x,G.p.y,d,G.lv.goal);
    if(!r.cells.length){bumpWall(d);return;}
    G.hint=null;G.anim={cells:r.cells,i:0,t:0};beep(520,.12,'sine');return;
  }
  if(G.W.id==='candy'){
    const r=GEN.candyStep(G.lv,G.p.x,G.p.y,G.tog,d);
    if(!r.cells.length){if(r.why!=='gate')bumpWall(d);else beep(200,.1);if(r.why==='gate')toast('השער '+(r.gate===0?'הוורוד':'התכול')+' סגור. חפשי לחצן 🔘');return;}
    if(r.cells.length>1)beep(420,.15,'sine');
    G.anim={cells:r.cells,i:0,t:0,ms:110};return;
  }
  if(G.W.id==='toys'){
    const r=GEN.toysStep(G.lv,G.p.x,G.p.y,G.boxes,d);
    if(!r){bumpWall(d);return;}
    if(r.stuck){beep(200,.15);toast('הארגז לא זז לשם');return;}
    G.undo.push({p:{x:G.p.x,y:G.p.y},boxes:G.boxes});
    G.boxes=r.boxes;G.p={x:r.x,y:r.y};enter(r.x,r.y);
    if(r.pushed){beep(260,.12,'square');bump('pushes');}
    if(atGoal())win();return;
  }
  const g=G.lv.g,cell=g[G.p.y][G.p.x];
  if(cell[d]){bumpWall(d);return;}
  const nx=G.p.x+DV[d][0],ny=G.p.y+DV[d][1];
  if(QUIZ.has(G.W.id)){
    const qz=G.lv.quiz,here=q=>q.x===nx&&q.y===ny;
    const wi=qz.findIndex(q=>q.wrong.some(here));
    if(wi>=0){bumpWall(d);
      if(wi===G.qi){G.qTries++;if(G.qTries>=2)G.qGlow=true;toast(G.qTries>=2?'כמעט! התשובה הנכונה זוהרת עכשיו ✨':'לא בדיוק 🙂 נסי תשובה אחרת');}
      else toast(wi<G.qi?'את השאלה הזאת כבר פתרת 🙂':'קודם עני על השאלה שלמעלה');
      return;}
    const pi=qz.findIndex(here);
    if(pi>G.qi){bumpWall(d);toast('קודם עני על השאלה שלמעלה');return;}
    if(pi>=0&&pi===G.qi){
      const q=G.lv.qs[pi];if(G.qTries===0&&!G.duel){const sk=STATKEY[G.W.id];stats[sk]=(stats[sk]||0)+1;save('journey_stats',stats);}
      G.qi++;G.qTries=0;G.qGlow=false;[660,880,1175].forEach((f,i)=>setTimeout(()=>beep(f,.12),i*80));buzz(15);
      toast(G.qi>=G.lv.qs.length?'✓ נכון! \u2066'+disp(q.ans)+'\u2069 · כל הכבוד, עכשיו אל '+G.W.goalName+' 🏆':'✓ נכון! \u2066'+disp(q.ans)+'\u2069');
      showQuiz(true);updateHud();setTimeout(checkMedals,500);}
    if(G.cfg.kind==='wallet'&&nx===G.lv.goal.x&&ny===G.lv.goal.y&&Math.abs(G.sum-G.lv.target)>1e-9){
      bumpWall(d);const diff=Math.round((G.lv.target-G.sum)*100)/100;
      toast(diff>0?'חסרים עוד '+MATH.fmt(diff)+' ₪':'יש לך '+MATH.fmt(-diff)+' ₪ יותר מדי. לחצי 🔄 כדי להחזיר את המטבעות');return;}
  }
  if(G.W.id==='beach'){
    const t=G.lv.tides.find(q=>q.x===nx&&q.y===ny);
    if(t&&tideWet(t.grp)){bumpWall(d);toast('גל! 🌊 חכי שהמים יירדו');return;}
  }
  if(G.W.id==='rainbow'){
    const tc=G.lv.col[ny][nx];
    if(tc&&tc!==G.color){beep(200,.15);toast('כאן עוברים רק כשאת '+RBC[tc].f+'. חפשי דלי '+RBC[tc].m);return;}
  }
  if(G.W.id==='farm'){G.hist.unshift({x:G.p.x,y:G.p.y});G.hist.length=Math.min(G.hist.length,G.followers.length);}
  if(G.W.id==='jungle'){
    if(G.collapsed.has(nx+','+ny)){beep(200,.18);toast('הגשר נפל, אי אפשר לעבור כאן 🌊');return;}
    const here=G.p.x+','+G.p.y;
    if(G.lv.bridges.some(b=>b.x===G.p.x&&b.y===G.p.y)&&!G.collapsed.has(here)&&G.onBridge&&G.onBridge.k===here&&G.onBridge.d===d){
      G.collapsed.add(here);setTimeout(()=>{beep(300,.12,'sine');beep(180,.3,'sine');},60);toast('הגשר נפל מאחורייך!');updateHud();}
  }
  if(G.W.id==='castle'){
    const ek=GEN.edgeKey(G.p.x,G.p.y,d),c=G.doors[ek];
    if(c!==undefined){
      if(G.keys.has(c)){delete G.doors[ek];beep(700,.12);beep(900,.2);toast('הדלת ה'+KEYC[c].f+' נפתחה!');}
      else{beep(200,.18);toast('דלת '+KEYC[c].f+'! צריך את המפתח ה'+KEYC[c].m);return;}
    }
  }
  G.p.x=nx;G.p.y=ny;enter(nx,ny);
  if(G.W.id==='castle'){
    const ki=G.keysLeft.findIndex(k=>k.x===nx&&k.y===ny);
    if(ki>=0){const k=G.keysLeft.splice(ki,1)[0];G.keys.add(k.c);[660,990].forEach((f,i)=>setTimeout(()=>beep(f,.15),i*110));toast('מצאת את המפתח ה'+KEYC[k.c].m+'!');updateHud();}
  }
  if(G.W.id==='sea'){
    G.air--;
    if(G.lv.bubbles.some(b=>b.x===nx&&b.y===ny)){G.air=G.cfg.air;G.check={x:nx,y:ny};beep(990,.1,'sine');beep(1200,.15,'sine');toast('אוויר מלא! 🫧');}
    fishHit();
    if(G.air<=0&&!atGoal())outOfAir();
    updateHud();
  }
  if(G.W.id==='numbers'&&G.cfg.kind==='wallet'){
    const ci=G.coinsLeft.findIndex(c=>c.x===nx&&c.y===ny);
    if(ci>=0){const c=G.coinsLeft.splice(ci,1)[0];G.sum=Math.round((G.sum+c.v)*100)/100;beep(1046,.1,'sine');beep(1318,.12,'sine');
      const over=G.sum>G.lv.target+1e-9,exact=Math.abs(G.sum-G.lv.target)<1e-9;
      toast(exact?'בדיוק '+MATH.fmt(G.lv.target)+' ₪! עכשיו לגביע 🏆':over?'אופס, עברת את הסכום. לחצי 🔄 כדי להחזיר את המטבעות':'+'+MATH.fmt(c.v)+' ₪ · יש לך '+MATH.fmt(G.sum)+' ₪');
      showQuiz(false);updateHud();}
  }
  if(G.W.id==='forest'&&G.lv.mush.some(m=>m.x===nx&&m.y===ny)){
    G.flip=!G.flip;G.flipLock=performance.now()+450;stopRun();stopHolding();[523,392,659].forEach((f,i)=>setTimeout(()=>beep(f,.1,'sine'),i*70));buzz(20);
    toast(G.flip?'🍄 הופ! החצים התהפכו':'🍄 פיו, החצים חזרו לרגיל');updateHud();
  }
  if(G.W.id==='beach'&&!G.lv.tides.some(q=>q.x===nx&&q.y===ny))G.lastDry={x:nx,y:ny};
  if(G.W.id==='haunt'){
    G.bat=Math.max(0,G.bat-1);
    if(G.lv.batteries.some(b=>b.x===nx&&b.y===ny)&&G.bat<G.lv.batMax){G.bat=G.lv.batMax;beep(990,.1,'sine');beep(1320,.15,'sine');toast('🔋 הפנס מלא!');}
    else if(G.bat===4)toast('הפנס נחלש… חפשי סוללה 🔋');
    fishHit();updateHud();
  }
  if(G.W.id==='rainbow'){
    const b=G.lv.buckets[nx+','+ny];
    if(b&&b!==G.color){bump('colors');G.color=b;beep(620,.1,'sine');beep(930,.15,'sine');toast('שלוּפּ! עכשיו את '+RBC[b].f+' 🎨');updateHud();}
  }
  if(G.W.id==='farm'){
    const ci=G.chicksLeft.findIndex(c=>c.x===nx&&c.y===ny);
    if(ci>=0){const c=G.chicksLeft.splice(ci,1)[0];G.followers.push(c);G.hist.push({x:nx,y:ny});
      [1200,1500].forEach((f,i)=>setTimeout(()=>beep(f,.08,'sine'),i*90));toast('ציף ציף! אפרוח הצטרף 🐣');updateHud();}
    fishHit();
    if(atGoal()&&G.chicksLeft.length){beep(300,.15);toast('התרנגולת מחכה לעוד '+G.chicksLeft.length+' אפרוחים');return;}
  }
  if(G.W.id==='jungle'){
    if(G.lv.bridges.some(b=>b.x===nx&&b.y===ny))G.onBridge={k:nx+','+ny,d};else G.onBridge=null;
    if(!G.bridgeTold&&G.lv.bridges.some(b=>b.x===nx&&b.y===ny)){G.bridgeTold=true;toast('את על הגשר! 🌉 ממשיכים הלאה, והוא ייפול מאחורייך');}
    fishHit();}
  if(G.W.id==='space'){
    for(const pt of G.lv.portals){
      let to=null;if(pt.a.x===nx&&pt.a.y===ny)to=pt.b;else if(pt.b.x===nx&&pt.b.y===ny)to=pt.a;
      if(to){G.p={x:to.x,y:to.y};G.trail.add(to.x+','+to.y);[500,800,1100].forEach((f,i)=>setTimeout(()=>beep(f,.1,'sine'),i*60));
        bump('portals');if(!G.warped){toast('וווש! עברת בפורטל 🌀');G.warped=true;}break;}
    }
  }
  if(G.custom&&G.W.id!=='jungle'&&movers().length)fishHit();
  if(atGoal())win();
}
function outOfAir(){
  toast('נגמר האוויר! חוזרים לבועה האחרונה');beep(180,.3,'sine');
  G.p={x:G.check.x,y:G.check.y};G.air=G.cfg.air;updateHud();
}
function movers(){return G?(G.lv.fish||G.lv.monkeys||G.lv.fox||G.lv.ghosts||[]):[];}
function tideWet(grp){return ((G.tideT+grp*5)%10)>=6;}
function tideWarn(grp){return ((G.tideT+grp*5)%10)===5;}
const AWAKE=6,CYCLE=11;function awake(f){return (f.t||0)<AWAKE;}
function fishHit(){
  if(!G||G.done||!(['sea','jungle','farm','haunt'].includes(G.W.id)||G.custom))return;
  const now=performance.now();if(now<G.hurtUntil)return;
  for(const f of movers()){const [fx,fy]=f.cells[f.i];
    if(fx!==G.p.x||fy!==G.p.y||!awake(f))continue;
    G.hurtUntil=now+2200;G.hits=(G.hits||0)+1;beep(160,.2,'square');
    if(G.W.id==='sea'){G.air=Math.max(0,G.air-3);toast('אאוץ׳! הדג לקח 3 אוויר');if(G.air<=0)outOfAir();}
    else if(G.W.id==='farm'){if(G.followers.length){const c=G.followers.pop();G.chicksLeft.push(c);G.hist.length=Math.min(G.hist.length,G.followers.length);toast('השועל הבהיל אפרוח, והוא רץ חזרה למקום שלו');}else toast('השועל רק רצה להגיד שלום 🦊');}
    else if(G.custom){const e=(BCRE[G.w]||BCRE[3]).e;if(G.stack.length){const k=G.stack.pop();G.stars.add(k);G.got--;toast('אופס! '+e+' לקח כוכב והחזיר אותו למקום');}else toast(e+' רק רצה לשחק 😄');}
    else if(G.W.id==='jungle'&&G.stack.length){const k=G.stack.pop();G.stars.add(k);G.got--;toast('הקוף חטף כוכב והחזיר אותו למקום! 🐒');}
    else if(G.W.id==='haunt'){G.bat=Math.max(0,G.bat-6);toast('בּוּ! 👻 הרוח הבהילה את הפנס');}
    else toast('קוף שובב! 🐒 אין לך כוכבים, אז הוא הלך');
    updateHud();return;
  }
}

function win(){
  if(G.duel){G.done=true;duelTurnEnd(false);return;}
  if(G.custom){G.done=true;bWin();return;}
  G.done=true;
  fxAdd({k:'ring',x:G.lv.goal.x,y:G.lv.goal.y,col:'#ffd23f',life:900});fxAdd({k:'ring',x:G.lv.goal.x,y:G.lv.goal.y,col:'#ff5d8f',life:1200,t0:performance.now()+150});sparkle(G.lv.goal.x,G.lv.goal.y,['#ffd23f'],16);
  walkFrom={w:G.w,l:G.l};
  const key=G.w+'-'+G.l,wasDone=worldDone(G.w);
  prog[key]=Math.max(prog[key]??0,G.got);save('journey_prog',prog);
  const nowDone=worldDone(G.w);
  const sec=Math.round((Date.now()-G.t0)/1000);
  let stickerNote='';
  if(!stickers.has(key)&&G.lv.sticker==='end'){stickers.add(key);saveStickers();G.gotSticker=true;}
  if(G.gotSticker)stickerNote=' ומצאת את המדבקה '+WORLDS[G.w].stickers[G.l]+'!';
  else if(!stickers.has(key))stickerNote=' המדבקה של השלב עוד מחכה במבוך.';
  if(sec<20)stats.fast=1;
  if(['sea','jungle','farm'].includes(G.W.id)&&!G.hits)stats.clean=1;
  if(G.W.id==='farm')stats.chicks=(stats.chicks||0)+G.lv.chicks.length;
  if(G.dotsEaten)stats.dots=(stats.dots||0)+G.dotsEaten;
  if(G.boomed)stats.boom=(stats.boom||0)+G.boomed;
  save('journey_stats',stats);
  const lastLevel=G.l===G.W.levels.length-1;
  const wc=document.getElementById('winChar');
  const wsEl=document.getElementById('winStars');wsEl.innerHTML='';const gotNow=G.got;
  for(let i=0;i<3;i++){const sp=document.createElement('span');sp.className='ws';sp.textContent=i<gotNow?'★':'☆';wsEl.appendChild(sp);
    setTimeout(()=>{sp.classList.add('pop');if(i<gotNow)beep(900+i*220,.15);},450+i*320);}
  let title='כל הכבוד!',text=(PZ.has(G.W.id)||G.W.id==='paint'?'סיימת את המשימה ב־':'הגעת אל '+G.W.goalName+' ב־')+sec+' שניות.'+(G.got<3?' אפשר לחזור לשלב ולאסוף את כל הכוכבים.':' אספת את כל הכוכבים!');
  dancer=curChar();
  if(nowDone&&!wasDone){
    const R=CHARS.find(c=>c.unlock===G.w);
    title='סיימת את '+G.W.name+'!';
    const ord=REGIONS.flatMap(r=>r.worlds),left=ord.filter(i=>!worldDone(i)),nw=left.find(i=>ord.indexOf(i)>ord.indexOf(G.w))??left[0];
    text='פתחת דמות חדשה: '+R.name+'.'+(nw!=null?' ועכשיו מחכה לך '+WORLDS[nw].name+'.':' עברת את כל העולמות. את אלופת המסע!');
    dancer=R;
  }
  document.getElementById('winTitle').textContent=title;
  document.getElementById('winText').textContent=text+stickerNote;
  setTimeout(()=>speak(title+' '+text+stickerNote),500);
  setTimeout(checkMedals,700);
  {const par=parOf();if(par!=null&&!G.duel){const mv=movesOf(),rt=document.createElement('p');rt.className='route';
    if(mv<=par){const first=!route[key];route[key]=1;save('journey_route',route);rt.textContent='🏅 הדרך הכי קצרה! '+mv+' מהלכים'+(first?'':' (שוב!)');rt.classList.add('got');setTimeout(()=>[1047,1319,1568].forEach((f,i)=>setTimeout(()=>beep(f,.1,'sine'),i*90)),1500);}
    else rt.textContent='👣 סיימת ב־'+mv+' מהלכים. אפשר גם ב־'+par+' ולקבל 🏅';
    const old=document.querySelector('#win .route');if(old)old.remove();document.getElementById('winText').after(rt);}
   else{const old=document.querySelector('#win .route');if(old)old.remove();}}
  const nb=document.getElementById('winNext');
  let next=null;
  if(!lastLevel)next=[G.w,G.l+1];else{const ord=REGIONS.flatMap(r=>r.worlds),i=ord.indexOf(G.w);if(i>=0&&i<ord.length-1)next=[ord[i+1],0];}
  nb.hidden=!next;
  clearInterval(winTimer);
  if(next){const label=lastLevel?'אל '+WORLDS[next[0]].name:'לשלב הבא';nb.textContent=label;nb.onclick=()=>{clearInterval(winTimer);startLevel(next[0],next[1]);};
    // a quick countdown, unless she just finished a whole world and should enjoy the new friend
    if(!(nowDone&&!wasDone)){let left=7;const myG=G;nb.textContent=label+' ▸ '+left;
      winTimer=setInterval(()=>{if(G!==myG||document.getElementById('win').hidden||pausedAt){clearInterval(winTimer);nb.textContent=label;return;}
        left--;if(left<=0){clearInterval(winTimer);startLevel(next[0],next[1]);}else nb.textContent=label+' ▸ '+left;},1000);}}
  document.getElementById('win').hidden=false;winConfetti();
  [523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,.2),i*120));
  confetti=Array.from({length:70},(_,i)=>({x:Math.random(),y:-Math.random()*.5,v:.004+Math.random()*.006,c:['#ff5d8f','#ffc23c','#5bb8e8','#7b5ea7','#1a9ba1'][i%5],r:.012+Math.random()*.012}));
  (next?nb:document.getElementById('winMap')).focus();
}
let confetti=null,dancer=null,winTimer=null,walkFrom=null;
// paper confetti over the whole celebration card
function winConfetti(){const ov=document.getElementById('win');ov.querySelectorAll('.cf').forEach(e=>e.remove());if(calmFx())return;
  const cols=['#ff5d8f','#ffc23c','#5bb8e8','#7b5ea7','#52b788','#ff924c'];
  for(let i=0;i<46;i++){const e=document.createElement('i');e.className='cf';e.style.left=(Math.random()*100)+'%';e.style.background=cols[i%cols.length];
    e.style.animationDelay=(Math.random()*1.4)+'s';e.style.animationDuration=(2.4+Math.random()*2)+'s';e.style.setProperty('--r',(Math.random()*720-360)+'deg');e.style.width=e.style.height=(6+Math.random()*7)+'px';if(i%3===0)e.style.borderRadius='50%';ov.appendChild(e);}}
// victory dance on the win card
(function dance(now){requestAnimationFrame(dance);
  const ov=document.getElementById('win');if(ov.hidden||!dancer)return;
  const c=document.getElementById('winChar').getContext('2d');c.clearRect(0,0,180,180);
  const calm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hop=calm?0:Math.abs(Math.sin(now/220))*26,tilt=calm?0:Math.sin(now/300)*.28;
  c.fillStyle='rgba(42,33,64,.15)';c.beginPath();c.ellipse(90,160,40-hop*.5,8,0,0,7);c.fill();
  c.save();c.translate(90,112-hop);c.rotate(tilt);drawChar(c,dancer,0,0,54);c.restore();
})(0);

