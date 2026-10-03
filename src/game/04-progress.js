/* ================= saved progress (this device only) ================= */
let muted=load('journey_mute',false),night=load('journey_night',false),padOn=load('journey_pad',true);
let diff=load('journey_diff',1),voiceOn=load('journey_voice',false);
/* ---------- read aloud (Hebrew voice when the device has one) ---------- */
function heVoice(){try{return speechSynthesis.getVoices().find(v=>/^(he|iw)/i.test(v.lang));}catch(e){return null;}}
function enVoice(){try{return speechSynthesis.getVoices().find(v=>/^en[-_]US/i.test(v.lang))||speechSynthesis.getVoices().find(v=>/^en/i.test(v.lang));}catch(e){return null;}}
function speak(t,force,lang){
  if((!voiceOn&&!force)||!('speechSynthesis' in window)||!t)return;
  if(lang){try{const u=new SpeechSynthesisUtterance(String(t));u.lang=lang;const v=enVoice();if(v)u.voice=v;u.rate=.85;speechSynthesis.speak(u);}catch(e){}return;}
  try{speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(String(t).replace(/[\u{1F000}-\u{1FFFF}\u2600-\u27BF\u2B00-\u2BFF\uFE0F\u200D★☆]/gu,'').replace(/\s+/g,' ').trim());
    u.lang='he-IL';const v=heVoice();if(v)u.voice=v;u.rate=.95;u.pitch=1.1;speechSynthesis.speak(u);}catch(e){}
}
try{if('speechSynthesis' in window)speechSynthesis.getVoices();}catch(e){}
/* ---------- difficulty: tunes each level's recipe ---------- */
const DIFF=[{n:'רגוע',i:'🐢',note:'מבוכים קטנים יותר, פחות קופים, דגים ושועלים, והם איטיים יותר. יותר אוויר בים.'},
            {n:'רגיל',i:'🙂',note:'המשחק כמו שהוא נבנה.'},
            {n:'אתגר',i:'🔥',note:'מבוכים גדולים יותר, יותר הפתעות בדרך, ויצורים זריזים יותר.'},
            {n:'מבוגרים',i:'🧠',note:'למבוגרים שרוצים אתגר אמיתי: מבוכים ענקיים, הרבה יותר מכשולים, ויצורים מהירים.'}];
const SPEEDK=(c,up,k)=>{if(c.speed)c.speed=Math.round(c.speed*(up?(k===2?.72:.86):1.35));};
const ARC_TUNE={
  tilt:(c,up,k,sg)=>{c.n=Math.max(5,c.n+(up&&k===2?1:0)-(up?0:1));c.min=Math.max(2,c.min+sg);if(k===2)c.boulders=Math.min(3,c.boulders+1);if(!up)c.boulders=Math.max(0,c.boulders-1);return c;},
  shadow:(c,up,k,sg)=>{c.n=Math.max(6,c.n+sg);c.loops=c.loops+(up?3*k:0);c.lights=Math.max(1,c.lights+sg);c.delay=Math.max(3,c.delay-sg);c.speed=Math.round(c.speed*(up?(k===2?.72:.86):1.4));return c;},
  floors:(c,up,k,sg)=>{c.m=Math.max(3,Math.min(8,c.m+sg));c.holes=Math.max(0,c.holes+sg);if(k===2)c.floors=Math.min(4,c.floors+1);return c;},
  match3b:(c,up,k,sg)=>{c.moves=up?Math.max(12,c.moves-3*k):c.moves+6;if(k===2)c.colors=Math.min(6,c.colors+1);if(!up)c.spread=0;return c;},
  blockscore:(c,up,k,sg)=>{c.target=Math.round(c.target*(up?(k===2?1.6:1.25):.7)/50)*50;if(!up&&c.pool==='huge')c.pool='big';return c;},
  broom:(c,up,k,sg)=>{c.n=Math.max(6,c.n+sg);c.clouds=Math.max(.05,c.clouds+(up?.03*k:-.04));c.birds=Math.max(0,c.birds+sg);SPEEDK(c,up,k);if(!up)c.rings=Math.max(1,c.rings-1);return c;},
  stairs:(c,up,k,sg)=>{c.n=Math.max(5,c.n+sg);c.stairs=Math.max(1,c.stairs+sg);c.period=Math.round(c.period*(up?(k===2?.8:.9):1.3));return c;},
  potion:(c,up,k,sg)=>{c.n=Math.max(5,c.n+sg);c.ings=Math.max(2,Math.min(6,c.ings+sg));c.decoys=Math.max(0,c.decoys+sg);return c;},
  owlpost:(c,up,k,sg)=>{c.n=Math.max(6,c.n+sg);c.letters=Math.max(1,Math.min(5,c.letters+sg));c.slack=up?Math.max(1,c.slack-k):c.slack+6;return c;},
  flykeys:(c,up,k,sg)=>{c.n=Math.max(5,c.n+sg);c.keys=Math.max(2,Math.min(5,c.keys+sg));c.need=Math.max(1,Math.min(c.keys,c.need+(up?k-1:-1)));if(k===2)c.shy=1;if(!up)c.shy=0;SPEEDK(c,up,k);return c;},
  wand:(c,up,k,sg)=>{c.n=Math.max(5,c.n+sg);c.len=Math.max(2,Math.min(6,c.len+(up?k-1:-1)));return c;},
  firetruck:(c,up,k,sg)=>{c.n=Math.max(5,c.n+sg);c.fires=Math.max(1,c.fires+sg);if(!up)c.cap+=1;return c;},
  schoolbus:(c,up,k,sg)=>{c.n=Math.max(5,c.n+sg);c.stops=Math.max(1,c.stops+sg);c.oneway=Math.max(0,c.oneway+(up?3*k:-2));return c;},
  train:(c,up,k,sg)=>{c.n=Math.max(5,c.n+sg);c.cargo=Math.max(1,c.cargo+sg);c.speed=Math.round(c.speed*(up?(k===2?.75:.88):1.25));return c;},
  parking:(c,up,k,sg)=>{c.lo=Math.max(1,c.lo+2*sg);c.hi=Math.max(c.lo+1,c.hi+2*sg);c.cars=Math.max(3,Math.min(12,c.cars+sg));return c;},
  lights:(c,up,k,sg)=>{c.n=Math.max(5,c.n+sg);c.lights=Math.max(1,c.lights+sg);c.period=Math.round(c.period*(up?(k===2?.8:.9):1.2));return c;},
  race:(c,up,k,sg)=>{c.n=Math.max(5,c.n+sg);c.speed=Math.round(c.speed*(up?(k===2?.78:.88):1.3));return c;},
  match3:(c,up,k,sg)=>{c.moves=up?Math.max(10,c.moves-3*k):c.moves+6;if(!up)c.colors=Math.max(4,c.colors-1);if(k===2)c.colors=Math.min(6,c.colors+1);return c;},
  blocks:(c,up,k,sg)=>{c.lines=Math.max(2,c.lines+2*sg);if(!up)c.pool=c.pool==='huge'?'big':'small';return c;},
  hansel:(c,up,k,sg)=>{c.n=Math.max(5,c.n+sg);c.keep=up?Math.max(4,c.keep-2*k):c.keep+8;c.light=Math.max(1.5,c.light-(up?.2*k:-.4));return c;},
  pigs:(c,up,k,sg)=>{c.n=Math.max(5,c.n+sg);c.bricks=Math.max(2,c.bricks+sg);c.slack=up?Math.max(1.1,c.slack-.08*k):c.slack+.3;return c;},
  beanstalk:(c,up,k,sg)=>{c.n=Math.max(5,c.n+sg);c.creak=Math.max(.08,c.creak+(up?.04*k:-.06));if(!up){c.limit+=1;c.trap=0;}return c;},
  thorns:(c,up,k,sg)=>{c.n=Math.max(5,c.n+sg);c.regrow=Math.round(c.regrow*(up?(k===2?.8:.9):1.4));if(k===2)c.gap+=1;if(!up)c.gap=Math.max(1,c.gap-1);return c;},
  redhood:(c,up,k,sg)=>{c.n=Math.max(5,c.n+2*sg);c.flowers=Math.max(1,c.flowers+sg);c.wolves=Math.max(0,Math.min(3,c.wolves+(up?k-1:-1)));c.deep=Math.max(1,c.deep+(up?k-1:-1));SPEEDK(c,up,k);return c;},
  snow:(c,up,k,sg)=>{c.n=Math.max(5,c.n+sg);c.gates=Math.max(1,Math.min(5,c.gates+sg));return c;},
  savanna:(c,up,k,sg)=>{c.n=Math.max(5,c.n+sg);c.gates=Math.max(1,Math.min(4,c.gates+sg));c.herds=Math.max(0,Math.min(3,c.herds+sg));c.period=Math.round(c.period*(up?(k===2?.8:.9):1.3));return c;},
  lagoon:(c,up,k,sg)=>{c.n=Math.max(5,c.n+sg);c.min=Math.max(4,c.min+2*sg);c.rock=Math.max(.02,c.rock+(up?.02*k:-.03));return c;},
  carpet:(c,up,k,sg)=>{c.n=Math.max(5,c.n+sg);c.min=Math.max(2,c.min+sg);if(k===2)c.wishes=Math.min(3,c.wishes+1);return c;},
  ball:(c,up,k,sg)=>{c.n=Math.max(5,c.n+sg);c.slack=up?Math.max(2,c.slack-2*k):c.slack+8;c.wands=Math.max(0,c.wands+(up?0:1));return c;},
  toyroom:(c,up,k,sg)=>{c.n=Math.max(5,c.n+sg);c.green=Math.round(c.green*(up?(k===2?.75:.88):1.3));c.red=Math.round(c.red*(up?(k===2?1.25:1.1):.8));c.hides=Math.max(1,c.hides-(up?k-1:-1));return c;},
  sheep:(c,up,k,sg)=>{c.n=Math.max(5,Math.min(9,c.n+(up?(k===2?1:0):-1)));c.min=Math.max(2,c.min+2*sg);if(k===2)c.sheep=Math.min(3,c.sheep+1);if(!up)c.sheep=Math.max(1,c.sheep-1);return c;},
  chef:(c,up,k,sg)=>{c.n=Math.max(5,c.n+sg);c.stoves=Math.max(0,c.stoves+sg);c.decoys=Math.max(0,c.decoys+sg);if(k===2)c.ing=Math.min(5,c.ing+1);SPEEDK(c,up,k);return c;},
  memory:(c,up,k,sg)=>{c.n=Math.max(4,c.n+sg);c.peeks=Math.max(0,c.peeks-sg);if(!up)c.near=1;return c;},
  spell:(c,up,k,sg)=>{c.n=Math.max(5,c.n+sg);c.decoys=Math.max(0,c.decoys+sg);if(!up){c.show=1;c.len=Math.max(3,c.len-1);}if(k===2){c.show=0;c.len=Math.min(5,c.len+1);}return c;},
  paint:(c,up,k,sg)=>{c.n=Math.max(4,Math.min(8,c.n+sg));return c;},
  gravity:(c,up,k,sg)=>{c.n=Math.max(5,c.n+sg);c.spikes=Math.max(0,c.spikes+sg);c.min=Math.max(2,c.min+sg);return c;},
  escape:(c,up,k,sg)=>{c.n=Math.max(6,c.n+sg);c.digits=Math.max(1,Math.min(4,c.digits+(k===2?1:up?0:-1)));return c;},
  soccer:(c,up,k,sg)=>{c.n=Math.max(6,c.n+sg);c.cones=Math.max(.04,c.cones+(up?.03*k:-.04));c.defs=Math.max(0,c.defs+sg);c.min=Math.max(1,c.min+sg);SPEEDK(c,up,k);return c;},
  hoops:(c,up,k,sg)=>{c.n=Math.max(6,c.n+sg);c.baskets=Math.max(1,c.baskets+sg);c.defs=Math.max(0,c.defs+sg);SPEEDK(c,up,k);return c;},
  ski:(c,up,k,sg)=>{c.n=Math.max(7,c.n+sg);c.trees=Math.max(.04,c.trees+(up?.03*k:-.04));c.gates=Math.max(1,c.gates+sg);if(!up){c.gw+=1;c.lat+=1;}else if(k===2){c.gw=Math.max(1,c.gw-1);}SPEEDK(c,up,k);return c;},
  swim:(c,up,k,sg)=>{c.n=Math.max(6,c.n+sg);c.dividers=Math.max(0,c.dividers+sg);c.rival=Math.round(c.rival*(up?(k===2?.78:.88):1.45));return c;},
  tennis:(c,up,k,sg)=>{c.n=Math.max(6,c.n+sg);c.hits=Math.max(2,c.hits+sg);c.cones=Math.max(0,c.cones+(up?.03*k:-.03));SPEEDK(c,up,k);return c;},
  hurdles:(c,up,k,sg)=>{c.n=Math.max(6,c.n+sg);c.hurdles=Math.max(1,c.hurdles+sg);c.mud=Math.max(0,c.mud+sg);c.msPer=Math.round(c.msPer*(up?(k===2?.8:.9):1.45));return c;},
  golf:(c,up,k,sg)=>{c.n=Math.max(5,c.n+sg);c.min=Math.max(1,c.min+sg);c.water=Math.max(0,c.water+(up?.02*k:-.03));return c;},
  dojo:(c,up,k,sg)=>{c.n=Math.max(5,c.n+sg);c.color=Math.min(.8,Math.max(.15,c.color+(up?.08*k:-.12)));c.opp=Math.max(0,c.opp+sg);c.min=Math.max(4,c.min+2*sg);SPEEDK(c,up,k);return c;},
  munch:(c,up,k,sg)=>{c.n=Math.max(5,c.n+sg);c.blobs=Math.max(up?1:0,c.blobs+(up?k:-1));c.speed=Math.round(c.speed*(up?(k===2?.65:.85):1.35));c.chase=up?c.chase+.15*k:0;return c;},
  snake:(c,up,k,sg)=>{c.n=Math.max(5,c.n+(up?k:-1));c.fruits=Math.max(2,c.fruits+sg);c.steps=Math.round(c.steps*(up?1+.35*k:.7));c.rock=Math.max(0,c.rock+(up?.03*k:-.03));return c;},
  road:(c,up,k,sg)=>{c.speed=Math.round(c.speed*(up?(k===2?.7:.85):1.35));c.dens=Math.min(.55,Math.max(.15,c.dens+(up?.06*k:-.1)));
    if(k===2){c.road+=1;c.river=Math.min(4,c.river+1);c.n+=2;}if(!up&&c.river>1)c.river--;return c;},
  bomb:(c,up,k,sg)=>{c.n=Math.max(5,c.n+2*sg);c.crack=Math.min(.7,Math.max(.2,c.crack+(up?.07*k:-.1)));c.foes=Math.max(0,c.foes+sg);c.speed=Math.round(c.speed*(up?(k===2?.7:.85):1.3));if(!up)c.fuse+=400;return c;},
  ladders:(c,up,k,sg)=>{c.n=Math.max(7,Math.min(16,c.n+3*sg));c.barrels=Math.max(0,c.barrels+sg);c.gaps=Math.max(0,c.gaps+sg);c.speed=Math.round(c.speed*(up?(k===2?.7:.85):1.3));return c;},
  deep:(c,up,k,sg)=>{c.n=Math.max(6,Math.min(15,c.n+(up?2*k:-1)));c.monsters=Math.max(0,c.monsters+sg);c.spikes=Math.max(0,c.spikes+sg);if(k===2)c.pads+=1;c.speed=Math.round(c.speed*(up?(k===2?.75:.88):1.3));return c;},
  mines:(c,up,k,sg)=>{c.n=Math.max(5,c.n+sg);c.holes=Math.min(.24,Math.max(.06,c.holes+(up?.03*k:-.04)));return c;}};
function tune(id,base){
  const c=Object.assign({},base);if(diff===1)return c;
  const up=diff>=2,k=diff===3?2:1,sg=up?k:-1;
  if(ARC_TUNE[id])return ARC_TUNE[id](c,up,k,sg);
  if(id==='ice'){c.n=Math.max(5,c.n+sg);c.min=Math.max(2,c.min+sg);return c;}
  if(id==='giant'){c.n=Math.max(10,c.n+3*sg);c.loops=Math.max(2,c.loops+(up?-k:2));return c;}
  if(['numbers','english','hebrew','logic','geometry'].includes(id)){c.n=Math.max(6,Math.min(15,c.n+2*sg));if(c.q)c.q=Math.max(2,c.q+sg);if(c.coins)c.coins=Math.max(3,c.coins+(up?1:-1));return c;}
  if(id==='mirror'){c.n=Math.max(5,Math.min(15,c.n+(up?2*k:-1)));if(up)c.loops=Math.max(1,c.loops-k);else c.loops+=1;return c;}
  if(id==='toys'){c.extra=Math.max(0,c.extra+(k===2?1:sg));c.min=Math.max(4,c.min+2*sg);c.rock=Math.max(.04,c.rock+(up?.03*k:-.04));
    if(k===2){c.shelves+=1;c.n=Math.max(c.n+1,3*c.shelves+2);if(c.shelves>=4)c.gaps=1;}return c;}
  c.n=Math.max(6,Math.min(k===2?17:15,c.n+2*sg));
  if(c.speed)c.speed=Math.round(c.speed*(up?(k===2?.7:.85):1.3));
  if('fish' in c)c.fish=Math.max(up?1:0,c.fish+sg);
  if('monkeys' in c)c.monkeys=Math.max(0,c.monkeys+sg);
  if('fox' in c)c.fox=Math.max(0,c.fox+sg);
  if('ghosts' in c)c.ghosts=Math.max(0,c.ghosts+sg);
  if('air' in c)c.air+=up?-3*k:6;
  if('bat' in c)c.bat=up?Math.max(8,c.bat-3*k):c.bat+6;
  if('conv' in c)c.conv=Math.max(1,c.conv+sg);
  if('extra' in c)c.extra=Math.max(0,c.extra+sg);
  if('onPath' in c)c.onPath=Math.max(1,c.onPath+sg);
  if('bands' in c)c.bands=Math.max(1,c.bands+sg);
  if('loops' in c&&!up)c.loops+=2;
  if('chicks' in c)c.chicks=Math.max(1,c.chicks+sg);
  if('bridges' in c&&up)c.bridges+=k;
  if('decoys' in c)c.decoys=Math.max(0,Math.min(10-(c.pairs||0),c.decoys+sg));
  if('gates' in c&&k===2)c.gates=Math.min(c.gates+1,5);
  if('sw' in c&&k===2)c.sw+=1;
  return c;
}
function applyNight(){if(night)document.documentElement.setAttribute('data-night','');else document.documentElement.removeAttribute('data-night');}
applyNight();
let prog=load('journey_prog',{});           // "w-l" -> best stars
let charId=load('journey_char','kitten');
function worldDone(w){return WORLDS[w].levels.every((_,l)=>prog[w+'-'+l]!=null);}
function worldOpen(w){return true;}
function levelOpen(w,l){return worldOpen(w)&&(l===0||prog[w+'-'+(l-1)]!=null);}
function charOpen(C){return C.unlock==null||worldDone(C.unlock);}
function totalStars(){return Object.values(prog).reduce((a,b)=>a+b,0);}
function curChar(){return CHARS.find(c=>c.id===charId&&charOpen(c))||CHARS[0];}

