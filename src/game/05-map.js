/* ================= map screen ================= */
// little pictures are painted right after the screen shows, so the map appears at once
const iconQ=[];let iconT=0;
function iconFlush(){iconT=0;const t0=performance.now();while(iconQ.length&&performance.now()-t0<12){const [cv,size,fn]=iconQ.shift();fn(cv.getContext('2d'),size,size*1.02,size*.72);}if(iconQ.length)iconT=requestAnimationFrame(iconFlush);}
function iconCanvas(size,fn){const cv=document.createElement('canvas');cv.width=size*2;cv.height=size*2;iconQ.push([cv,size,fn]);if(!iconT)iconT=requestAnimationFrame(iconFlush);return cv;}
const TAGS={ice:'מחליקים עד הסלע',castle:'מפתחות ודלתות צבעוניות',sea:'בועות אוויר ודגים ישנוניים',jungle:'גשרים שנופלים וקופים שובבים',space:'פורטלים בצבעים',candy:'מסועים ולחצנים',farm:'מצילים אפרוחים',rainbow:'דליי צבע ואריחים צבעוניים',toys:'דוחפים ארגזים',forest:'פטריות שהופכות חצים',beach:'גאות ושפל',mirror:'שתי דמויות בבת אחת',haunt:'פנס וסוללות',numbers:'חשבון במבוך',english:'מילים באנגלית',hebrew:'אותיות ומילים',logic:'דפוסים וחידות',soccer:'בעיטות לשער',tilt:'כל הלוח מתגלגל',shadow:'צל בעקבותייך',floors:'מדרגות בין קומות',escape:'רמזים וקוד סודי',hoops:'זורקים לסלים',ski:'מחליקים בין דגלים',swim:'מרוץ שחייה',tennis:'מחזירים את הכדור',hurdles:'מרוץ נגד השעון',golf:'כמה שפחות חבטות',dojo:'מזרנים מתחלפים',munch:'נקודות ובלובים',snake:'זנב שהולך ומתארך',road:'מכוניות ובולי עץ',bomb:'זיקוקים וקירות סדוקים',ladders:'סולמות וחביות',mines:'בורות נסתרים ומספרים',deep:'קוצים, מפלצות וצדפים קופצים',geometry:'צורות, היקף ושטח',sheep:'מכניסים כבשים לדיר',chef:'מבשלים לפי מתכון',memory:'הקירות נעלמים',spell:'אותיות באנגלית לפי הסדר',paint:'צובעים כל משבצת פעם אחת',gravity:'הופכים את כוח המשיכה',snow:'מקפיאים מים וממיסים קרח',savanna:'מאכילים חיות ובורחים מעדרים',lagoon:'רגליים ביבשה, זנב במים',carpet:'עפים על שטיח, ומשאלות מעלימות סלעים',ball:'נעל זכוכית לפני חצות',toyroom:'זזים רק כשלא מסתכלים',redhood:'פרחים ביער, זאב שרודף',hansel:'פירורים ביער חשוך',pigs:'בונים בית לפני שהזאב מגיע',beanstalk:'בשקט ליד הענק',thorns:'חותכים קוצים שצומחים שוב',match3:'3 סוכריות בשורה',blocks:'ממלאים שורות בצורות',match3b:'שוקולד, מנעולים ופיצוצים',blockscore:'נקודות, רצפים ושיאים',giant:'מבוך ענק שגולל עם המסך',firetruck:'מכבים שריפות וממלאים מים',schoolbus:'תחנות לפי הסדר ורחובות חד־סטריים',train:'הרכבת נוסעת לבד, את בוחרת פניות',parking:'מזיזים מכוניות כדי לצאת',lights:'עוברים רק בירוק',race:'מרוץ נגד המכונית הירוקה',broom:'טסים דרך טבעות',stairs:'מדרגות שמסתובבות',potion:'מבשלים שיקוי קסם',owlpost:'ינשוף מוסר מכתבים',flykeys:'תופסים מפתחות עם כנפיים',wand:'לחשים של חיצים'};
// where to go next: keep going in the world she last played, otherwise the first open level not done yet
function nextTarget(){
  const last=load('journey_last',null);
  if(last&&WORLDS[last[0]]){const w=last[0];for(let l=0;l<WORLDS[w].levels.length;l++)if(prog[w+'-'+l]==null&&levelOpen(w,l))return [w,l];}
  for(let w=0;w<WORLDS.length;w++)for(let l=0;l<WORLDS[w].levels.length;l++)if(prog[w+'-'+l]==null&&levelOpen(w,l))return [w,l];
  return null;
}
const unfolded=new Set();
const REGIONS=[
  {name:'עולם ההרפתקאות',icon:'🏝️',worlds:[0,1,2,3,4,23,64],bg:'linear-gradient(135deg,#2a9fd6,#1a9ba1)'},
  {name:'עולם ההפתעות',icon:'🎪',worlds:[5,6,7,8,37,38],bg:'linear-gradient(135deg,#e56b9f,#d9a441)'},
  {name:'עולם הקסם',icon:'🌙',worlds:[9,10,11,12,39],bg:'linear-gradient(135deg,#6a994e,#4a3b73)'},
  {name:'בית הספר',icon:'🎓',worlds:[13,14,15,16,24,40],bg:'linear-gradient(135deg,#f3722c,#8338ec)'},
  {name:'עולם הארקייד',icon:'🕹️',worlds:[17,18,19,20,21,22,54,62,55,63],bg:'linear-gradient(135deg,#2b2b8f,#c0392b 60%,#e07a1f)'},
  {name:'עולם הספורט',icon:'🏆',worlds:[25,26,27,28,29,30,31,32],bg:'linear-gradient(135deg,#2e7d32,#0096c7 55%,#d35400)'},
  {name:'עולם האתגרים',icon:'🧩',worlds:[33,34,35,36,41,42],bg:'linear-gradient(135deg,#4a4e69,#5a4b81 50%,#8d6e63)'},
  {name:'עולם האגדות',icon:'🏰',worlds:[43,44,45,46,47,48],bg:'linear-gradient(135deg,#7b2cbf,#f72585 55%,#ffb703)'},
  {name:'עולם הסיפורים',icon:'📖',worlds:[49,50,51,52,53],bg:'linear-gradient(135deg,#d62828,#f77f00 50%,#2d6a4f)'},
  {name:'בית הספר לקוסמים',icon:'🪄',worlds:[56,57,58,59,60,61],bg:'linear-gradient(135deg,#240046,#7b2cbf 50%,#ffb703)'},
  {name:'עולם כלי התחבורה',icon:'🚗',worlds:[65,66,67,68,69,70],bg:'linear-gradient(135deg,#e63946,#ffb703 50%,#219ebc)'}];
let region=load('journey_region',null);
function regionOf(w){return REGIONS.findIndex(r=>r.worlds.includes(w));}
function setRegion(i){region=i;save('journey_region',i);renderMap();window.scrollTo(0,document.getElementById('contBtn').offsetTop-12);}
const PATH=[[82,40],[50,40],[18,40],[18,150],[50,150],[82,150]];
function renderMap(){
  document.getElementById('totalStars').textContent='⭐ '+totalStars();
  const si=document.getElementById('shopIcon').getContext('2d');si.clearRect(0,0,108,108);drawChar(si,curChar(),54,60,34);
  document.getElementById('avName').textContent=curChar().name;
  document.getElementById('shopLine').textContent='להלביש ולקנות · '+coins()+' ⭐';
  document.getElementById('collBadge').textContent=stickers.size+medalsHave.size||'';
  document.getElementById('muteBtn').textContent=muted?'🔇 צלילים: כבויים':'🔊 צלילים: פועלים';
  document.getElementById('nightBtn').textContent=night?'☀️ מצב יום':'🌙 מצב לילה';
  document.getElementById('voiceBtn').textContent=voiceOn?'🗣️ הקראה בקול: פועלת':'🗣️ הקראה בקול: כבויה';
  [0,1,2,3,4,5].forEach(i=>document.getElementById('grade'+i).setAttribute('aria-pressed',grade===i));
  [0,1,2,3].forEach(i=>document.getElementById('diff'+i).setAttribute('aria-pressed',diff===i));
  document.getElementById('diffNote').textContent=DIFF[diff].note;
  const gifts=giftsLeft(),gb=document.getElementById('giftBtn');gb.hidden=gifts<=0;
  if(gifts>0)document.getElementById('giftSub').textContent=gifts===1?'יש לך תיבה אחת לפתוח':'יש לך '+gifts+' תיבות לפתוח';
  const nt=nextTarget();
  const cb=document.getElementById('contBtn');
  if(nt){document.getElementById('contTitle').textContent=Object.keys(prog).length?'להמשיך לשחק':'להתחיל לשחק';
    document.getElementById('contSub').textContent=WORLDS[nt[0]].name+' · שלב '+(nt[1]+1);cb.onclick=()=>startLevel(nt[0],nt[1]);}
  else{document.getElementById('contTitle').textContent='סיימת הכול! 🎉';document.getElementById('contSub').textContent='אפשר לחזור לכל שלב ולאסוף מדבקות';cb.onclick=()=>startLevel(0,0);}
  const ws=document.getElementById('worlds');ws.innerHTML='';ws.classList.toggle('reg',region!=null&&!!REGIONS[region]);
  const jp=document.getElementById('jump');jp.innerHTML='';
  if(region==null||!REGIONS[region]){
    jp.hidden=true;
    const grid=document.createElement('div');grid.className='regions';
    REGIONS.forEach((Rg,i)=>{const b=document.createElement('button');b.type='button';b.className='region'+(nt&&regionOf(nt[0])===i?' here':'');b.id='region-'+i;b.style.background=Rg.bg;
      const total=Rg.worlds.length*6,done=Rg.worlds.reduce((a,w)=>a+WORLDS[w].levels.filter((_,l)=>prog[w+'-'+l]!=null).length,0);
      const st=Rg.worlds.reduce((a,w)=>a+WORLDS[w].levels.reduce((x,_,l)=>x+(prog[w+'-'+l]||0),0),0);
      b.innerHTML='<span class="emo"></span><b></b><span class="sub"></span><div class="bar2"><i></i></div><div class="icons"></div>';
      b.querySelector('.emo').textContent=Rg.icon;b.querySelector('b').textContent=Rg.name;
      b.querySelector('.sub').textContent='🗺️ '+done+'/'+total+'   ⭐ '+st;b.querySelector('.sub').setAttribute('aria-label',done+' מתוך '+total+' שלבים, '+st+' כוכבים');
      b.querySelector('.bar2 i').style.width=(100*done/total)+'%';
      const icx=b.querySelector('.icons'),showN=Rg.worlds.length>5?4:Rg.worlds.length;Rg.worlds.slice(0,showN).forEach(w=>icx.appendChild(iconCanvas(24,WORLDS[w].goal)));
      if(Rg.worlds.length>showN){const m=document.createElement('em');m.textContent='+'+(Rg.worlds.length-showN);icx.appendChild(m);}
      if(done===total){const c=document.createElement('span');c.className='crown';c.textContent='👑';b.appendChild(c);}
      b.style.setProperty('--i',i);b.onclick=()=>setRegion(i);grid.appendChild(b);});
    ws.appendChild(grid);return;
  }
  jp.hidden=false;
  const Rg=REGIONS[region];
  const hd=document.createElement('div');hd.className='reg-head';
  const bk=document.createElement('button');bk.className='back';bk.id='regBack';bk.textContent='→ כל האזורים';bk.onclick=()=>setRegion(null);
  const h=document.createElement('h2');h.textContent=Rg.icon+' '+Rg.name;hd.append(bk,h);ws.appendChild(hd);
  WORLDS.forEach((W,w)=>{if(!Rg.worlds.includes(w))return;const b=document.createElement('button');b.type='button';b.id='jump-'+w;b.style.background=W.hex;
    b.appendChild(iconCanvas(30,W.goal));b.appendChild(document.createTextNode(W.short));
    if(worldDone(w)){const i=document.createElement('i');i.textContent='✅';b.appendChild(i);}
    else if(!W.levels.some((_,l)=>prog[w+'-'+l]!=null))b.classList.add('fresh');
    b.setAttribute('aria-label',W.name);
    b.onclick=()=>{const el=document.getElementById('world-'+w);unfolded.add(w);el.classList.remove('folded');const f=el.querySelector('.fold');if(f)f.textContent='▲ להסתיר את השלבים';
      el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});};
    jp.appendChild(b);});
  WORLDS.forEach((W,w)=>{if(!Rg.worlds.includes(w))return;
    const isl=document.createElement('section');isl.className='isl';isl.id='world-'+w;isl.style.setProperty('--i',Rg.worlds.indexOf(w));
    isl.style.background='linear-gradient(180deg,'+W.hex+'40,'+W.hex+'18)';
    const done=W.levels.filter((_,l)=>prog[w+'-'+l]!=null).length;
    const st=W.levels.reduce((a,_,l)=>a+(prog[w+'-'+l]||0),0);
    const head=document.createElement('div');head.className='isl-head';
    const ic=iconCanvas(48,W.goal);ic.className='ic';head.appendChild(ic);
    const t=document.createElement('div');t.innerHTML='<h2></h2><p></p>';
    t.querySelector('h2').textContent=W.name;if(done===0){const tg=document.createElement('span');tg.className='newtag';tg.textContent='✨ חדש';t.querySelector('h2').appendChild(tg);}t.querySelector('p').textContent=TAGS[W.id];const sp=document.createElement('span');sp.className='isl-st';sp.textContent='🗺️ '+done+'/6   ⭐ '+st;t.appendChild(sp);
    head.appendChild(t);
    const reward=CHARS.find(c=>c.unlock===w);const rw=document.createElement('div');rw.className='rw';
    rw.appendChild(iconCanvas(40,worldDone(w)?(c,x,y,r)=>drawChar(c,reward,x,y,r):(c,x,y,r)=>{c.globalAlpha=.3;reward.draw(c,x,y,r);c.globalAlpha=1;c.font=(r*.8)+'px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('🎁',x,y);}));
    rw.appendChild(document.createTextNode(worldDone(w)?reward.name:'פרס בסוף'));head.appendChild(rw);
    isl.appendChild(head);
    const path=document.createElement('div');path.className='path';
    path.innerHTML='<svg viewBox="0 0 100 210" preserveAspectRatio="none" aria-hidden="true"><path d="M82,66 L50,66 L18,66 C-2,66 -2,176 18,176 L50,176 L82,176" fill="none" stroke="'+W.deep+'" stroke-opacity=".45" stroke-width="3" stroke-dasharray="4 5" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>';
    W.levels.forEach((_,l)=>{
      const [px,py]=PATH[l];
      const b=document.createElement('button');b.className='pb';b.type='button';b.id='lv-'+w+'-'+l;
      b.style.left=px+'%';b.style.top=(py)+'px';
      const sc=prog[w+'-'+l];const lo=levelOpen(w,l);
      b.innerHTML='<b></b><small></small>';
      b.querySelector('b').textContent=lo?(l+1):'🔒';
      b.querySelector('b').style.background=sc!=null?W.deep:W.hex;
      b.querySelector('small').textContent=sc!=null?'★'.repeat(sc)+'☆'.repeat(3-sc):'';
      if(route[w+'-'+l]){const m=document.createElement('span');m.className='rmed';m.textContent='🏅';b.appendChild(m);}
      if(stickers.has(w+'-'+l)){const k=document.createElement('span');k.className='stk';k.textContent=STICKERS[w][l];b.appendChild(k);}
      b.setAttribute('aria-label',W.name+' שלב '+(l+1));
      if(!lo)b.disabled=true;
      if(nt&&nt[0]===w&&nt[1]===l){b.classList.add('next');const me=iconCanvas(46,(c,x,y,r)=>drawChar(c,curChar(),x,y,r));me.className='me';b.appendChild(me);
        // just won the level before this one? walk over from there
        if(walkFrom&&walkFrom.w===w&&walkFrom.l===l-1&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&me.animate){const from=PATH[l-1],to=PATH[l];walkFrom=null;
          requestAnimationFrame(()=>{const pw=path.clientWidth,dx=(from[0]-to[0])/100*pw,dy=from[1]-to[1];
            me.animate([0,.25,.5,.75,1].map((t,i)=>({transform:'translate('+(dx*(1-t)).toFixed(1)+'px,'+(dy*(1-t)-(i%2?16:0)).toFixed(1)+'px)'})),{duration:1300,easing:'ease-in-out'});});}}
      b.onclick=()=>startLevel(w,l);
      path.appendChild(b);
    });
    isl.appendChild(path);
    const fresh=done===0&&!(nt&&nt[0]===w);

    if(fresh&&!unfolded.has(w)){isl.classList.add('folded');
      const row=document.createElement('div');row.className='foldrow';
      const go=document.createElement('button');go.className='fold go';go.type='button';go.textContent='▶ להתחיל';go.onclick=()=>startLevel(w,0);
      const see=document.createElement('button');see.className='fold';see.type='button';see.textContent='▼ השלבים';see.onclick=()=>{unfolded.add(w);renderMap();document.getElementById('world-'+w).scrollIntoView({block:'start'});};
      row.append(go,see);isl.appendChild(row);}
    if(worldDone(w)){
      if(!unfolded.has(w))isl.classList.add('folded');
      const f=document.createElement('button');f.className='fold';f.type='button';f.id='fold-'+w;
      f.textContent=unfolded.has(w)?'▲ להסתיר את השלבים':'▼ לראות את השלבים ולשחק שוב';
      f.onclick=()=>{if(unfolded.has(w))unfolded.delete(w);else unfolded.add(w);isl.classList.toggle('folded',!unfolded.has(w));
        f.textContent=unfolded.has(w)?'▲ להסתיר את השלבים':'▼ לראות את השלבים ולשחק שוב';};
      isl.appendChild(f);
    }
    ws.appendChild(isl);
  });
}
document.getElementById('muteBtn').onclick=()=>{muted=!muted;save('journey_mute',muted);renderMap();beep(880,.1);};
/* ---------- surprise box: one for every 10 stars ---------- */
function openGiftModal(){
  if(giftsLeft()<=0)return;
  document.getElementById('gbox').hidden=false;document.getElementById('gbox').classList.remove('shake');
  document.getElementById('gPrize').hidden=true;document.getElementById('gHead').textContent='תיבת הפתעה';
  document.getElementById('gText').textContent='כל 10 כוכבים שווים תיבה אחת. מה יש בפנים?';
  document.getElementById('gOpen').hidden=false;document.getElementById('gClose').hidden=true;
  document.getElementById('giftModal').hidden=false;document.getElementById('gOpen').focus();
}
function rollPrize(){
  const unowned=ITEMS.filter(i=>!shop.owned.includes(i.id)),rare=RARE.map((_,i)=>i).filter(i=>!stickers.has('r-'+i));
  const opts=['stars'];if(unowned.length)opts.push('item','item');if(rare.length)opts.push('rare','rare');
  const kind=opts[Math.floor(Math.random()*opts.length)],pz=document.getElementById('gPrize');pz.innerHTML='';
  if(kind==='item'){const I=unowned[Math.floor(Math.random()*unowned.length)];shop.owned.push(I.id);
    (shop.equip[curChar().id]=shop.equip[curChar().id]||{})[I.slot]=I.id;saveShop();
    const c=document.createElement('canvas');c.width=260;c.height=260;drawChar(c.getContext('2d'),curChar(),130,140,80,{[I.slot]:I.id});pz.appendChild(c);
    return ['בגד חדש!',I.name+' במתנה, וכבר לבשתי אותו על '+curChar().name+'.'];}
  if(kind==='rare'){const i=rare[Math.floor(Math.random()*rare.length)];stickers.add('r-'+i);saveStickers();pz.textContent=RARE[i];
    return ['מדבקה נדירה!','היא כבר מחכה לך באלבום, בדף של המדבקות הנדירות.'];}
  const b=3+Math.floor(Math.random()*3);shop.spent-=b;saveShop();pz.textContent='⭐';
  return ['בונוס כוכבים!','קיבלת עוד '+b+' כוכבים לקניות בחנות.'];
}
document.getElementById('giftBtn').onclick=openGiftModal;
document.getElementById('gOpen').onclick=()=>{
  const bx=document.getElementById('gbox');bx.classList.add('shake');document.getElementById('gOpen').hidden=true;
  [523,587,659].forEach((f,i)=>setTimeout(()=>beep(f,.1),i*160));
  setTimeout(()=>{
    boxes.opened++;save('journey_boxes',boxes);
    const [h,t]=rollPrize();bx.hidden=true;document.getElementById('gPrize').hidden=false;
    document.getElementById('gHead').textContent=h;document.getElementById('gText').textContent=t;
    [784,988,1175,1568].forEach((f,i)=>setTimeout(()=>beep(f,.15),i*90));speak(h+' '+t);
    const cl=document.getElementById('gClose');cl.hidden=false;cl.textContent=giftsLeft()>0?'עוד תיבה! 🎁':'איזה כיף!';cl.focus();
  },matchMedia('(prefers-reduced-motion: reduce)').matches?100:1500);
};
document.getElementById('gClose').onclick=()=>{
  if(giftsLeft()>0){openGiftModal();return;}
  document.getElementById('giftModal').hidden=true;renderMap();setTimeout(checkMedals,300);
};
/* ---------- players ---------- */
function profStars(id){const pr=rawGet(profKey(id,'journey_prog'))||{};return Object.values(pr).reduce((a,b)=>a+b,0);}
function profChar(id){const cid=rawGet(profKey(id,'journey_char'))||'kitten';return CHARS.find(c=>c.id===cid)||CHARS[0];}
function switchProf(id){rawSet('journey_cur',id);location.reload();}
let delAsk=null;
function renderProfiles(){
  const me=profiles.find(p=>p.id===curProf);document.getElementById('profName').textContent=me.name;
  const L=document.getElementById('plist');L.innerHTML='';
  profiles.forEach(p=>{const b=document.createElement('div');b.className='prow'+(p.id===curProf?' cur':'');b.setAttribute('role','button');b.tabIndex=0;
    const C=p.id===curProf?curChar():profChar(p.id);b.appendChild(iconCanvas(20,(c,x,y,r)=>drawChar(c,C,x,y,r)));
    const n=document.createElement('b');n.textContent=p.name+(p.id===curProf?' ✓':'');b.appendChild(n);
    const st=document.createElement('small');st.textContent='⭐ '+(p.id===curProf?totalStars():profStars(p.id));b.appendChild(st);
    if(p.id!==0&&p.id!==curProf){const d=document.createElement('button');d.className='pdel';d.textContent=delAsk===p.id?'בטוח? 🗑️':'🗑️';d.setAttribute('aria-label','למחוק את '+p.name);
      d.onclick=e=>{e.stopPropagation();if(delAsk!==p.id){delAsk=p.id;renderProfiles();return;}
        const pre='p'+p.id+'_';try{Object.keys(localStorage).filter(k=>k.startsWith(pre)).forEach(k=>localStorage.removeItem(k));}catch(e){}
        profiles=profiles.filter(q=>q.id!==p.id);rawSet('journey_profiles',profiles);delAsk=null;renderProfiles();};b.appendChild(d);}
    const go=()=>{if(p.id!==curProf)switchProf(p.id);};b.onclick=go;b.onkeydown=e=>{if(e.key==='Enter')go();};L.appendChild(b);});
  document.getElementById('padd').disabled=profiles.length>=6;
}
document.getElementById('profBtn').onclick=()=>{const el=document.getElementById('profiles');el.hidden=!el.hidden;document.getElementById('profBtn').setAttribute('aria-expanded',!el.hidden);delAsk=null;renderProfiles();};
document.getElementById('padd').onclick=()=>{if(profiles.length>=6)return;const nm=document.getElementById('pname').value.trim()||('שחקן '+(profiles.length+1));
  const id=Math.max(...profiles.map(p=>p.id))+1;profiles.push({id,name:nm.slice(0,12)});rawSet('journey_profiles',profiles);switchProf(id);};
document.getElementById('pren').onclick=()=>{const nm=document.getElementById('pname').value.trim();if(!nm){document.getElementById('pname').focus();return;}
  profiles.find(p=>p.id===curProf).name=nm.slice(0,12);rawSet('journey_profiles',profiles);document.getElementById('pname').value='';renderProfiles();};
renderProfiles();
document.getElementById('setBtn').onclick=()=>{const st=document.getElementById('settings');st.hidden=!st.hidden;document.getElementById('setBtn').setAttribute('aria-expanded',!st.hidden);};
[0,1,2,3,4,5].forEach(i=>document.getElementById('grade'+i).onclick=()=>{grade=i;save('journey_grade',grade);renderMap();speak('כיתה '+MATH.GRADES[i]);});
[0,1,2,3].forEach(i=>document.getElementById('diff'+i).onclick=()=>{diff=i;save('journey_diff',diff);renderMap();speak('רמת קושי: '+DIFF[i].n);});
document.getElementById('voiceBtn').onclick=()=>{
  voiceOn=!voiceOn;save('journey_voice',voiceOn);renderMap();
  const note=document.getElementById('voiceNote');
  if(voiceOn&&!('speechSynthesis' in window)){note.hidden=false;note.textContent='בדפדפן הזה אין הקראה בקול.';return;}
  if(voiceOn){const vs=(()=>{try{return speechSynthesis.getVoices();}catch(e){return [];}})();
    note.hidden=!(vs.length&&!heVoice());note.textContent='לא מצאתי במכשיר הזה קול בעברית, אז ייתכן שההקראה תישמע במבטא זר. אפשר להוסיף קול עברי בהגדרות המכשיר.';
    speak('שלום! מעכשיו אקריא לך את ההודעות.');}
  else{note.hidden=true;try{speechSynthesis.cancel();}catch(e){}}
};

/* ---------- backup: every player's progress in one code or file ---------- */
function bkCollect(){const o={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(/^(p\d+_)?journey_/.test(k))o[k]=localStorage.getItem(k);}}catch(e){}return o;}
const b64=u8=>{let s='';for(let i=0;i<u8.length;i+=8192)s+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));return btoa(s);};
const unb64=t=>Uint8Array.from(atob(t),c=>c.charCodeAt(0));
async function bkMake(){const raw=new TextEncoder().encode(JSON.stringify({v:1,t:Date.now(),d:bkCollect()}));
  if(window.CompressionStream){try{const z=new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());return 'MJ2'+b64(z);}catch(e){}}
  return 'MJ1'+b64(raw);}
async function bkRead(t){t=(t||'').replace(/\s+/g,'');try{let raw;
  if(t.startsWith('MJ2')){raw=new Uint8Array(await new Response(new Blob([unb64(t.slice(3))]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());}
  else if(t.startsWith('MJ1'))raw=unb64(t.slice(3));else return null;
  const o=JSON.parse(new TextDecoder().decode(raw));return o&&o.d&&typeof o.d==='object'?o:null;}catch(e){return null;}}
function bkSay(t,ok){const m=document.getElementById('bkMsg');m.textContent=t;m.classList.toggle('ok',!!ok);}
let bkSure=false;
if(!window.__APP){document.getElementById('bkFile').hidden=true;}
document.getElementById('bkSave').onclick=async()=>{document.getElementById('bkIn').hidden=true;const code=await bkMake();const ta=document.getElementById('bkCode');ta.value=code;document.getElementById('bkOut').hidden=false;
  const n=Object.keys(bkCollect()).length;bkSay('✅ הגיבוי מוכן ('+Math.max(1,Math.round(code.length/1024))+' KB). אפשר להעתיק את הקוד או לשמור כקובץ.',true);beep(880,.08,'sine');};
document.getElementById('bkCopy').onclick=()=>{const ta=document.getElementById('bkCode');const done=()=>bkSay('📋 הקוד הועתק! מדביקים אותו ב"לטעון גיבוי" בטלפון השני.',true);
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(ta.value).then(done,()=>{ta.select();try{document.execCommand('copy');done();}catch(e){bkSay('סמני את הקוד והעתיקי אותו ידנית');}});else{ta.select();try{document.execCommand('copy');done();}catch(e){}}};
document.getElementById('bkFile').onclick=async()=>{const code=document.getElementById('bkCode').value,name='maze-journey-backup-'+new Date().toISOString().slice(0,10)+'.txt';
  try{const f=new File([code],name,{type:'text/plain'});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'גיבוי מסע המבוכים'});bkSay('✅ נשמר!',true);return;}}catch(e){if(e&&e.name==='AbortError')return;}
  try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([code],{type:'text/plain'}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);bkSay('📁 הקובץ ירד: '+name,true);}
  catch(e){bkSay('לא הצלחתי לשמור קובץ כאן. אפשר להעתיק את הקוד במקום 📋');}};
document.getElementById('bkLoad').onclick=()=>{document.getElementById('bkOut').hidden=true;document.getElementById('bkIn').hidden=false;bkSure=false;document.getElementById('bkApply').textContent='✅ לטעון';bkSay('');};
document.getElementById('bkPick').onclick=()=>document.getElementById('bkFileIn').click();
document.getElementById('bkFileIn').onchange=async e=>{const f=e.target.files[0];if(!f)return;document.getElementById('bkInText').value=(await f.text()).trim();bkSure=false;bkSay('הקובץ נקרא. לחצי "לטעון".',true);};
document.getElementById('bkApply').onclick=async()=>{const o=await bkRead(document.getElementById('bkInText').value);const b=document.getElementById('bkApply');
  if(!o){bkSay('😮 הקוד לא מתאים. בדקי שהעתקת את כולו (הוא מתחיל ב־MJ)');beep(200,.1,'triangle');return;}
  const keys=Object.keys(o.d);if(!bkSure){bkSure=true;b.textContent='בטוח? להחליף ✅';bkSay('⚠️ הגיבוי מ־'+new Date(o.t).toLocaleDateString('he-IL')+' יחליף את כל ההתקדמות בטלפון הזה. לחצי שוב כדי לאשר.');return;}
  try{const old=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(/^(p\d+_)?journey_/.test(k))old.push(k);}old.forEach(k=>localStorage.removeItem(k));keys.forEach(k=>localStorage.setItem(k,o.d[k]));}
  catch(e){bkSay('😮 לא הצלחתי לשמור כאן ('+e.name+')');return;}
  bkSay('🎉 ההתקדמות הועברה! טוענים מחדש…',true);[523,659,784].forEach((f,i)=>setTimeout(()=>beep(f,.1,'sine'),i*100));setTimeout(()=>location.reload(),900);};
document.getElementById('nightBtn').onclick=()=>{night=!night;save('journey_night',night);applyNight();renderMap();};

