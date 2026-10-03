/* ================= outfits ================= */
const ANCH={kitten:{hy:-.55,ey:0,ed:.28},bunny:{hy:-.42,ey:.02,ed:.24},penguin:{hy:-.74,ey:-.3,ed:.19},puppy:{hy:-.6,ey:-.1,ed:.26},
  unicorn:{hy:-.5,ey:0,ed:.21},octopus:{hy:-.64,ey:.02,ed:.24},panda:{hy:-.58,ey:0,ed:.25},alien:{hy:-.56,ey:-.02,ed:.24},bear:{hy:-.56,ey:-.06,ed:.25},lamb:{hy:-.62,ey:.04,ed:.15},owl:{hy:-.62,ey:-.12,ed:.21},robot:{hy:-.5,ey:-.1,ed:.24},squirrel:{hy:-.5,ey:-.05,ed:.22},turtle:{hy:-.55,ey:.08,ed:.17},giraffe:{hy:-.6,ey:-.05,ed:.2},bat:{hy:-.5,ey:-.05,ed:.18},dino:{hy:-.62,ey:-.12,ed:.24},foxy:{hy:-.48,ey:-.08,ed:.2},bee:{hy:-.55,ey:-.12,ed:.2},hamster:{hy:-.55,ey:-.1,ed:.22},mouse:{hy:-.5,ey:-.02,ed:.22},snaky:{hy:-.6,ey:-.12,ed:.2},frog:{hy:-.66,ey:-.42,ed:.32},dragon:{hy:-.58,ey:-.12,ed:.22},koala:{hy:-.52,ey:-.08,ed:.25},mole:{hy:-.6,ey:-.12,ed:.2},seahorse:{hy:-.55,ey:-.1,ed:.2},hedgehog:{hy:-.6,ey:0,ed:.2},lion:{hy:-.55,ey:-.08,ed:.2},kangaroo:{hy:-.55,ey:-.12,ed:.2},polar:{hy:-.62,ey:-.08,ed:.22},duck:{hy:-.62,ey:-.32,ed:.16},raccoon:{hy:-.58,ey:-.08,ed:.2},cheetah:{hy:-.56,ey:-.05,ed:.2},piggy:{hy:-.56,ey:-.12,ed:.2},tiger:{hy:-.56,ey:-.08,ed:.2},seal:{hy:-.48,ey:-.1,ed:.24},chameleon:{hy:-.62,ey:-.12,ed:.32},beaver:{hy:-.75,ey:-.12,ed:.22},meerkat:{hy:-.6,ey:-.12,ed:.2},hippo:{hy:-.58,ey:-.2,ed:.2},cow:{hy:-.6,ey:-.12,ed:.2},otter:{hy:-.55,ey:-.12,ed:.22},elephant:{hy:-.56,ey:-.2,ed:.18},ladybug:{hy:-.58,ey:-.3,ed:.14},sloth:{hy:-.6,ey:-.02,ed:.2},snowfox:{hy:-.5,ey:-.05,ed:.22},zebra:{hy:-.62,ey:-.1,ed:.2},fishy:{hy:-.5,ey:-.08,ed:.2},spirit:{hy:-.62,ey:-.05,ed:.18},swan:{hy:-.72,ey:-.5,ed:.12},rockhorse:{hy:-.7,ey:-.35,ed:.12},deer:{hy:-.52,ey:-.08,ed:.2},robin:{hy:-.58,ey:-.2,ed:.2},llama:{hy:-.6,ey:-.05,ed:.18},goose:{hy:-.6,ey:-.35,ed:.1},butterfly:{hy:-.5,ey:-.32,ed:.08},gummy:{hy:-.6,ey:-.1,ed:.2},jelly:{hy:-.55,ey:-.15,ed:.2},phoenix:{hy:-.5,ey:-.1,ed:.15},wizcat:{hy:-.55,ey:-.05,ed:.22},toad:{hy:-.5,ey:-.32,ed:.3},raven:{hy:-.55,ey:-.12,ed:.2},pixie:{hy:-.5,ey:-.1,ed:.12},sprout:{hy:-.62,ey:-.08,ed:.15},gummy2:{hy:-.62,ey:-.1,ed:.2},cubie:{hy:-.58,ey:-.1,ed:.22},snail:{hy:-.3,ey:.05,ed:.12},firepup:{hy:-.62,ey:-.02,ed:.2},parrot:{hy:-.7,ey:-.12,ed:.25},walrus:{hy:-.8,ey:-.18,ed:.22},crab:{hy:-.62,ey:-.5,ed:.18},cone:{hy:-.8,ey:.22,ed:.15},pug:{hy:-.55,ey:-.1,ed:.22}};
function heart(c,x,y,s,f){c.fillStyle=f;c.beginPath();c.moveTo(x,y+s*.45);c.bezierCurveTo(x-s*1.1,y-s*.2,x-s*.45,y-s*.95,x,y-s*.3);c.bezierCurveTo(x+s*.45,y-s*.95,x+s*1.1,y-s*.2,x,y+s*.45);c.fill();}
const ITEMS=[
  {id:'bow',slot:'hat',name:'פפיון ורוד',price:2,draw(c,x,y,r,a){const bx=x+r*.3,by=y+a.hy*r+r*.1;c.fillStyle='#ff5d8f';
    c.beginPath();c.moveTo(bx,by);c.lineTo(bx-r*.26,by-r*.16);c.lineTo(bx-r*.26,by+r*.16);c.fill();
    c.beginPath();c.moveTo(bx,by);c.lineTo(bx+r*.26,by-r*.16);c.lineTo(bx+r*.26,by+r*.16);c.fill();circle(c,bx,by,r*.08,'#d63d6f');}},
  {id:'party',slot:'hat',name:'כובע מסיבה',price:3,draw(c,x,y,r,a){const y0=y+a.hy*r;c.fillStyle='#4cc9f0';
    c.beginPath();c.moveTo(x-r*.24,y0);c.lineTo(x+r*.24,y0);c.lineTo(x,y0-r*.62);c.fill();
    c.strokeStyle='#ffc23c';c.lineWidth=Math.max(1.5,r*.07);c.beginPath();c.moveTo(x-r*.16,y0-r*.18);c.lineTo(x+r*.16,y0-r*.18);c.moveTo(x-r*.09,y0-r*.38);c.lineTo(x+r*.09,y0-r*.38);c.stroke();
    circle(c,x,y0-r*.64,r*.09,'#ff5d8f');}},
  {id:'straw',slot:'hat',name:'כובע קש עם פרח',price:4,draw(c,x,y,r,a){const y0=y+a.hy*r;
    c.fillStyle='#e9c46a';c.beginPath();c.ellipse(x,y0,r*.55,r*.12,0,0,7);c.fill();c.beginPath();c.ellipse(x,y0-r*.08,r*.28,r*.22,0,Math.PI,0);c.fill();
    c.fillStyle='#ff5d8f';c.fillRect(x-r*.28,y0-r*.12,r*.56,r*.07);
    [[0,-1],[1,0],[0,1],[-1,0]].forEach(([dx,dy])=>circle(c,x+r*.26+dx*r*.07,y0-r*.12+dy*r*.07,r*.06,'#fff'));circle(c,x+r*.26,y0-r*.12,r*.05,'#ffc23c');}},
  {id:'crown',slot:'hat',name:'כתר זהב',price:5,draw(c,x,y,r,a){const y0=y+a.hy*r;c.fillStyle='#ffc23c';
    c.beginPath();c.moveTo(x-r*.3,y0);c.lineTo(x-r*.34,y0-r*.34);c.lineTo(x-r*.15,y0-r*.16);c.lineTo(x,y0-r*.4);c.lineTo(x+r*.15,y0-r*.16);c.lineTo(x+r*.34,y0-r*.34);c.lineTo(x+r*.3,y0);c.closePath();c.fill();
    c.strokeStyle='#d99a00';c.lineWidth=Math.max(1,r*.04);c.stroke();circle(c,x,y0-r*.1,r*.06,'#e63946');}},
  {id:'witch',slot:'hat',name:'כובע מכשפה',price:6,draw(c,x,y,r,a){const y0=y+a.hy*r;c.fillStyle='#5a189a';
    c.beginPath();c.ellipse(x,y0,r*.52,r*.11,0,0,7);c.fill();
    c.beginPath();c.moveTo(x-r*.26,y0);c.lineTo(x+r*.26,y0);c.lineTo(x+r*.16,y0-r*.82);c.fill();
    c.fillStyle='#ffc23c';c.fillRect(x-r*.25,y0-r*.13,r*.5,r*.08);star(c,x+r*.06,y0-r*.42,r*.09);}},
  {id:'round',slot:'face',name:'משקפיים עגולים',price:2,draw(c,x,y,r,a){const ey=y+a.ey*r;c.strokeStyle='#2a2140';c.lineWidth=Math.max(1.5,r*.05);
    c.beginPath();c.arc(x-a.ed*r,ey,r*.15,0,7);c.moveTo(x+a.ed*r+r*.15,ey);c.arc(x+a.ed*r,ey,r*.15,0,7);c.moveTo(x-a.ed*r+r*.15,ey);c.lineTo(x+a.ed*r-r*.15,ey);c.stroke();}},
  {id:'sun',slot:'face',name:'משקפי שמש',price:3,draw(c,x,y,r,a){const ey=y+a.ey*r;c.fillStyle='#1b1b2f';
    [-1,1].forEach(s=>{c.beginPath();c.ellipse(x+s*a.ed*r,ey,r*.17,r*.12,0,0,7);c.fill();});
    c.strokeStyle='#1b1b2f';c.lineWidth=Math.max(1.5,r*.05);c.beginPath();c.moveTo(x-a.ed*r,ey);c.lineTo(x+a.ed*r,ey);c.stroke();
    circle(c,x-a.ed*r-r*.06,ey-r*.04,r*.03,'#fff');circle(c,x+a.ed*r-r*.06,ey-r*.04,r*.03,'#fff');}},
  {id:'hearts',slot:'face',name:'משקפי לבבות',price:4,draw(c,x,y,r,a){const ey=y+a.ey*r;
    heart(c,x-a.ed*r,ey,r*.2,'#ff5d8f');heart(c,x+a.ed*r,ey,r*.2,'#ff5d8f');
    c.strokeStyle='#d63d6f';c.lineWidth=Math.max(1.5,r*.05);c.beginPath();c.moveTo(x-a.ed*r,ey-r*.05);c.lineTo(x+a.ed*r,ey-r*.05);c.stroke();}},
  {id:'cape',slot:'back',name:'גלימת גיבורה',price:5,draw(c,x,y,r){c.fillStyle='#e63946';
    c.beginPath();c.moveTo(x-r*.45,y);c.lineTo(x+r*.45,y);c.lineTo(x+r*.9,y+r*.98);c.quadraticCurveTo(x,y+r*.8,x-r*.9,y+r*.98);c.closePath();c.fill();}},
  {id:'butterfly',slot:'back',name:'כנפי פרפר',price:6,draw(c,x,y,r){
    [-1,1].forEach(s=>{c.fillStyle='#ffafcc';c.beginPath();c.ellipse(x+s*r*.75,y-r*.2,r*.36,r*.46,s*.5,0,7);c.fill();
      c.fillStyle='#a2d2ff';c.beginPath();c.ellipse(x+s*r*.68,y+r*.4,r*.26,r*.3,-s*.4,0,7);c.fill();
      circle(c,x+s*r*.82,y-r*.28,r*.1,'#fff');});}},
  {id:'angel',slot:'back',name:'כנפי מלאך',price:7,draw(c,x,y,r){
    [-1,1].forEach(s=>{for(let i=0;i<3;i++){c.fillStyle=i%2?'#f0f4ff':'#ffffff';c.strokeStyle='#c9d6ea';c.lineWidth=Math.max(1,r*.04);
      c.beginPath();c.ellipse(x+s*r*(.62+i*.14),y-r*(.1-i*.12),r*(.42-i*.08),r*.18,s*(-.5+i*.35),0,7);c.fill();c.stroke();}});}}
];
const SLOTS=[{id:'hat',name:'על הראש'},{id:'face',name:'משקפיים'},{id:'back',name:'על הגב'}];
let shop=load('journey_shop',{spent:0,owned:[],equip:{}});
function saveShop(){save('journey_shop',shop);}
function outfitOf(C){return shop.equip[C.id]||{};}
function coins(){return Math.max(0,totalStars()-shop.spent);}
let stickers=new Set(load('journey_stickers',[]));
const RARE=['💎','🌠','🎀','🍀','🦚','🪅','🎠','🏆'];
function regCount(){return [...stickers].filter(k=>!k.startsWith('r-')).length;}
let boxes=load('journey_boxes',{opened:0});
function giftsLeft(){return Math.floor(totalStars()/10)-boxes.opened;}
function saveStickers(){save('journey_stickers',[...stickers]);}
let stats=load('journey_stats',{chicks:0,portals:0,pushes:0,colors:0,fast:0,clean:0});
function bump(k,v){stats[k]=(stats[k]||0)+(v||1);save('journey_stats',stats);checkMedals();}
let medalsHave=new Set(load('journey_medals',[]));
let route=load('journey_route',{});   // "w-l" -> finished in the fewest moves
// worlds where the fewest moves is known exactly (or a fair target)
const PARW=new Set(['lagoon','carpet','ice','tilt','golf','soccer','gravity','floors','memory','sea','jungle','forest','beach','haunt','swim','dojo','sheep']);
function parOf(){return PARW.has(G.W.id)?(G.W.id==='golf'?G.lv.par:G.lv.best):null;}
function movesOf(){const id=G.W.id;return id==='golf'?G.strokes:id==='soccer'?G.kicks:id==='tilt'?G.tilts:(G.moves||0);}
const MEDALS=[
  {id:'first',icon:'👣',name:'צעד ראשון',desc:'לסיים שלב אחד',need:1,have:()=>Object.keys(prog).length},
  {id:'ten',icon:'🧭',name:'חוקרת',desc:'לסיים 10 שלבים',need:10,have:()=>Object.keys(prog).length},
  {id:'thirty',icon:'🗺️',name:'אלופת המבוכים',desc:'לסיים 30 שלבים',need:30,have:()=>Object.keys(prog).length},
  {id:'all',icon:'👑',name:'מלכת המסע',get desc(){return 'לסיים את כל '+levelCount()+' השלבים';},get need(){return levelCount();},have:()=>Object.keys(prog).length},
  {id:'world',icon:'🌍',name:'מטיילת',desc:'לסיים עולם שלם',need:1,have:()=>WORLDS.filter((_,w)=>worldDone(w)).length},
  {id:'stars30',icon:'⭐',name:'אוספת כוכבים',desc:'לאסוף 30 כוכבים',need:30,have:()=>totalStars()},
  {id:'stars100',icon:'🌟',name:'מלכת הכוכבים',desc:'לאסוף 100 כוכבים',need:100,have:()=>totalStars()},
  {id:'perfect',icon:'💯',name:'מושלמת',desc:'3 כוכבים ב־10 שלבים',need:10,have:()=>Object.values(prog).filter(v=>v===3).length},
  {id:'fast',icon:'⚡',name:'זריזה',desc:'לסיים שלב בפחות מ־20 שניות',need:1,have:()=>stats.fast||0},
  {id:'clean',icon:'🛡️',name:'בלי שריטה',desc:'לסיים שלב בים, בג׳ונגל או בחווה בלי להיתקל באף אחד',need:1,have:()=>stats.clean||0},
  {id:'chicks',icon:'🐣',name:'מצילת אפרוחים',desc:'להחזיר 20 אפרוחים לתרנגולת',need:20,have:()=>stats.chicks||0},
  {id:'portals',icon:'🌀',name:'נוסעת בפורטלים',desc:'לעבור 25 פעמים בפורטל',need:25,have:()=>stats.portals||0},
  {id:'pushes',icon:'📦',name:'חזקה',desc:'לדחוף ארגזים 50 פעמים',need:50,have:()=>stats.pushes||0},
  {id:'colors',icon:'🎨',name:'ציירת',desc:'להחליף צבע 20 פעמים',need:20,have:()=>stats.colors||0},
  {id:'stick10',icon:'📒',name:'אספנית מדבקות',desc:'למצוא 10 מדבקות',need:10,have:()=>stickers.size},
  {id:'stick54',icon:'🏆',name:'אלבום מלא',get desc(){return 'למצוא את כל '+levelCount()+' המדבקות';},get need(){return levelCount();},have:()=>regCount()},
  {id:'math',icon:'🎓',name:'אלופת החשבון',desc:'לענות נכון בפעם הראשונה על 25 שאלות',need:25,have:()=>stats.mathFirst||0},
  {id:'words',icon:'📝',name:'אלופת המילים',desc:'לענות נכון בפעם הראשונה על 25 שאלות באנגלית ובעברית',need:25,have:()=>stats.wordFirst||0},
  {id:'brain',icon:'🧠',name:'ראש גדול',desc:'לפתור נכון בפעם הראשונה 25 חידות',need:25,have:()=>stats.logicFirst||0},
  {id:'region',icon:'🗺️',name:'כובשת אזור',desc:'לסיים את כל השלבים באזור אחד',need:1,have:()=>REGIONS.filter(r=>r.worlds.every(w=>worldDone(w))).length},
  {id:'gift',icon:'🎁',name:'הפתעה!',desc:'לפתוח 3 תיבות הפתעה',need:3,have:()=>boxes.opened},
  {id:'fashion',icon:'👗',name:'פאשניסטה',desc:'לקנות 5 בגדים בחנות',need:5,have:()=>shop.owned.length},
  {id:'dots',icon:'🍒',name:'זללנית',desc:'לאכול 500 נקודות במבוך הנקודות',need:500,have:()=>stats.dots||0},
  {id:'boom',icon:'🎆',name:'מלכת הזיקוקים',desc:'לפוצץ 50 קירות סדוקים',need:50,have:()=>stats.boom||0},
  {id:'sport',icon:'🏆',name:'ספורטאית',desc:'לסיים עולם שלם בעולם הספורט',need:1,have:()=>regionWorlds('sport').filter(worldDone).length},
  {id:'brave',icon:'🧩',name:'אלופת האתגרים',desc:'לסיים עולם שלם בעולם האתגרים',need:1,have:()=>regionWorlds('challenge').filter(worldDone).length},
  {id:'fairy',icon:'🏰',name:'גיבורת אגדות',desc:'לסיים עולם שלם בעולם האגדות',need:1,have:()=>regionWorlds('fairy','story').filter(worldDone).length},
  {id:'wizard',icon:'🪄',name:'קוסמת אמיתית',desc:'לסיים עולם שלם בבית הספר לקוסמים',need:1,have:()=>regionWorlds('wizard').filter(worldDone).length},
  {id:'route',icon:'🏅',name:'הדרך הקצרה',desc:'לסיים 10 שלבים בדרך הכי קצרה',need:10,have:()=>Object.keys(route).length},
  {id:'friends',icon:'🤝',name:'הרבה חברות',desc:'לפתוח 3 דמויות חדשות',need:3,have:()=>CHARS.filter(c=>c.unlock!=null&&charOpen(c)).length}
];
const popQ=[];let popBusy=false;
function checkMedals(){
  let changed=false;
  MEDALS.forEach(m=>{if(!medalsHave.has(m.id)&&m.have()>=m.need){medalsHave.add(m.id);popQ.push(m);changed=true;}});
  if(changed){save('journey_medals',[...medalsHave]);showPop();}
}
function showPop(){
  if(popBusy||!popQ.length)return;
  if(typeof G!=='undefined'&&G&&G.duel)return; // wait until the two-player game ends
  popBusy=true;const list=popQ.splice(0);
  if(list.length===1){const m=list[0];document.getElementById('mpIcon').textContent=m.icon;document.getElementById('mpName').textContent='מדליה חדשה: '+m.name;document.getElementById('mpDesc').textContent=m.desc;setTimeout(()=>speak('מדליה חדשה: '+m.name),300);}
  else{document.getElementById('mpIcon').textContent=list.slice(0,3).map(m=>m.icon).join('');document.getElementById('mpName').textContent=list.length+' מדליות חדשות!';
    document.getElementById('mpDesc').textContent=list.map(m=>m.name).join(' · ');setTimeout(()=>speak(list.length+' מדליות חדשות'),300);}
  const el=document.getElementById('medalPop'),inGame=!document.getElementById('gameScreen').hidden,winUp=!document.getElementById('win').hidden||!document.getElementById('duelRes').hidden;
  el.classList.toggle('top',inGame&&!winUp);el.hidden=false;
  [784,988,1175,1568].forEach((f,i)=>setTimeout(()=>beep(f,.15),i*90));
  setTimeout(()=>{el.hidden=true;popBusy=false;setTimeout(showPop,250);},list.length>1?3400:2600);
}
function drawChar(c,C,x,y,r,outfit){
  const o=outfit||outfitOf(C),a=ANCH[C.id];
  const it=id=>ITEMS.find(i=>i.id===id);
  if(o.back&&it(o.back))it(o.back).draw(c,x,y,r,a);
  C.draw(c,x,y,r);
  if(o.face&&it(o.face))it(o.face).draw(c,x,y,r,a);
  if(o.hat&&it(o.hat))it(o.hat).draw(c,x,y,r,a);
}

function drawIgloo(c,x,y,r){
  c.fillStyle='#ffffff';c.beginPath();c.arc(x,y+r*.35,r*.8,Math.PI,0);c.closePath();c.fill();
  c.strokeStyle='#9ccfe6';c.lineWidth=Math.max(1,r*.06);c.stroke();
  c.beginPath();c.moveTo(x-r*.72,y);c.lineTo(x+r*.72,y);c.moveTo(x-r*.45,y-r*.3);c.lineTo(x+r*.45,y-r*.3);
  c.moveTo(x-r*.3,y+r*.35);c.lineTo(x-r*.3,y);c.moveTo(x+r*.3,y+r*.35);c.lineTo(x+r*.3,y);c.moveTo(x,y);c.lineTo(x,y-r*.3);c.stroke();
  c.fillStyle='#2f86b8';c.beginPath();c.arc(x,y+r*.35,r*.26,Math.PI,0);c.closePath();c.fill();
}
function drawCrown(c,x,y,r){
  c.fillStyle='#ff8fb8';c.beginPath();c.ellipse(x,y+r*.5,r*.8,r*.25,0,0,7);c.fill();
  c.fillStyle='#ffc23c';c.beginPath();
  c.moveTo(x-r*.62,y+r*.4);c.lineTo(x-r*.7,y-r*.35);c.lineTo(x-r*.32,y);c.lineTo(x,y-r*.6);c.lineTo(x+r*.32,y);c.lineTo(x+r*.7,y-r*.35);c.lineTo(x+r*.62,y+r*.4);c.closePath();c.fill();
  c.strokeStyle='#d99a00';c.lineWidth=Math.max(1,r*.06);c.stroke();
  circle(c,x,y+r*.18,r*.12,'#e63946');circle(c,x-r*.38,y+r*.22,r*.08,'#3a86ff');circle(c,x+r*.38,y+r*.22,r*.08,'#2a9d8f');
  circle(c,x,y-r*.6,r*.08,'#fff');circle(c,x-r*.7,y-r*.35,r*.07,'#fff');circle(c,x+r*.7,y-r*.35,r*.07,'#fff');
}
function drawChest(c,x,y,r){
  c.fillStyle='#9c5b2e';c.fillRect(x-r*.7,y-r*.05,r*1.4,r*.65);
  c.fillStyle='#b8733d';c.beginPath();c.moveTo(x-r*.7,y-r*.05);c.quadraticCurveTo(x,y-r*.75,x+r*.7,y-r*.05);c.closePath();c.fill();
  c.fillStyle='#ffc23c';c.fillRect(x-r*.7,y-r*.08,r*1.4,r*.1);c.fillRect(x-r*.1,y-r*.12,r*.2,r*.3);
  circle(c,x-r*.45,y-r*.25,r*.1,'#ffc23c');circle(c,x+r*.4,y-r*.3,r*.09,'#ffe08a');
}
function star(c,cx,cy,r){
  c.beginPath();
  for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;c.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}
  c.closePath();c.fillStyle='#ffc23c';c.fill();c.strokeStyle='#d99a00';c.lineWidth=Math.max(1,r*.12);c.stroke();
}
const KEYC=[{c:'#e63946',m:'אדום',f:'אדומה'},{c:'#3a86ff',m:'כחול',f:'כחולה'},{c:'#20a37a',m:'ירוק',f:'ירוקה'}];
function drawKey(c,x,y,r,col){
  c.strokeStyle='rgba(0,0,0,.35)';c.fillStyle=col;c.lineWidth=Math.max(1,r*.08);
  c.beginPath();c.arc(x-r*.35,y,r*.32,0,7);c.fill();c.stroke();
  circle(c,x-r*.35,y,r*.12,'#f6ecd6');
  c.fillStyle=col;c.fillRect(x-r*.05,y-r*.09,r*.85,r*.18);c.strokeRect(x-r*.05,y-r*.09,r*.85,r*.18);
  c.fillRect(x+r*.5,y,r*.14,r*.3);c.fillRect(x+r*.25,y,r*.14,r*.22);
}
function drawFishFoe(c,x,y,r,flip){
  c.save();c.translate(x,y);if(flip)c.scale(-1,1);
  c.fillStyle='#ff8c42';c.beginPath();c.ellipse(-r*.1,0,r*.55,r*.38,0,0,7);c.fill();
  c.beginPath();c.moveTo(r*.35,0);c.lineTo(r*.8,-r*.38);c.lineTo(r*.8,r*.38);c.fill();
  c.fillStyle='#fff';c.fillRect(-r*.2,-r*.36,r*.1,r*.72);
  circle(c,-r*.38,-r*.08,r*.11,'#fff');circle(c,-r*.4,-r*.08,r*.06,'#2a2140');
  c.restore();
}
function drawBubble(c,x,y,r,t){
  const w=Math.sin(t/300)*r*.06;
  c.strokeStyle='#ffffff';c.lineWidth=Math.max(1.5,r*.08);c.fillStyle='rgba(180,240,255,.7)';
  [[0,0,.42],[-.4,.3,.2],[.38,-.35,.16]].forEach(([dx,dy,rr])=>{c.beginPath();c.arc(x+dx*r,y+dy*r+w,rr*r,0,7);c.fill();c.stroke();});
  circle(c,x-r*.14,y-r*.14+w,r*.09,'#fff');
}

