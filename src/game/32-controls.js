/* ================= controls ================= */
let padRep=null;
// after the arrows flip in the forest, whatever she is holding stops until she lets go and presses again
function stopHolding(){clearInterval(padRep);padRep=null;if(G)G.flipHold=true;sx=null;}
['up','down','left','right'].forEach(d=>{
  const b=document.getElementById(d);
  b.addEventListener('pointerdown',e=>{e.preventDefault();stopRun();if(G)G.flipHold=false;move(d);clearInterval(padRep);padRep=null;
    if(G&&G.W.id!=='ice'&&!G.flipHold&&!(G&&G.wz&&G.wz.casting))padRep=setInterval(()=>move(d),170);});
  ['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>{clearInterval(padRep);padRep=null;}));
  b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();move(d);}});
});
document.addEventListener('keydown',e=>{
  const m={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[e.key];
  if((e.key==='r'||e.key==='R'||e.key==='ר')&&G&&isBK()&&!document.getElementById('gameScreen').hidden){bkRotate();return;}
  if((e.key===' '||e.key==='b'||e.key==='Enter')&&G&&G.W.ui&&G.W.ui.key&&!document.getElementById('gameScreen').hidden){e.preventDefault();arcAction();return;}
  if(m&&!document.getElementById('gameScreen').hidden){e.preventDefault();if(e.repeat&&(G&&G.wz&&G.wz.casting))return;if(e.repeat&&G&&G.flipHold)return;if(!e.repeat&&G)G.flipHold=false;stopRun();move(m);}
});
document.addEventListener('keyup',()=>{if(G)G.flipHold=false;});
let sx=null,sy,swiped=false,runT=null;
function stopRun(){clearTimeout(runT);runT=null;}
// tap on the board: walk that way along the corridor until a turn, a wall or something to pick up
function run(dir){
  stopRun();if(!G)return;
  if(!G.lv.g||(G.W.ui&&G.W.ui.step)){move(dir);return;}
  const lvl=G;let steps=0;
  const step=()=>{
    if(G!==lvl||G.done){stopRun();return;}
    const before=G.p.x+','+G.p.y,got=G.got,d=DIRN[dir];
    move(dir);
    if(G!==lvl||G.done||G.p.x+','+G.p.y===before||G.got!==got||++steps>=G.lv.n){stopRun();return;}
    const cell=G.lv.g[G.p.y][G.p.x],back=(d+2)%4;
    const sides=[0,1,2,3].filter(k=>k!==d&&k!==back&&!cell[k]).length;
    if(sides>0||cell[d]){stopRun();return;}
    runT=setTimeout(step,125);
  };
  step();
}
cv.addEventListener('pointerdown',e=>{{const P=kitHook('pointer');if(P&&!G.done){P('down',e);return;}}sx=e.clientX;sy=e.clientY;swiped=false;stopRun();if(G)G.flipHold=false;});
cv.addEventListener('pointermove',e=>{
  {const P=kitHook('pointer');if(P&&!G.done){P('move',e);return;}}
  if(sx==null||!G)return;const dx=e.clientX-sx,dy=e.clientY-sy,th=Math.max(24,cv.getBoundingClientRect().width/(G.lv.view||G.lv.n)*.6);
  if(Math.abs(dx)>th||Math.abs(dy)>th){swiped=true;move(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));
    if(G.W.id==='ice'||(G&&G.wz&&G.wz.casting))sx=null;else{sx=e.clientX;sy=e.clientY;}}
});
cv.addEventListener('pointerup',e=>{
  {const P=kitHook('pointer');if(P&&!G.done){P('up',e);return;}}
  if(sx!=null&&!swiped&&G&&!G.done){
    const cm=G.lv.view&&G.cam?G.cam:null,r=cv.getBoundingClientRect(),cs=r.width/(cm?G.lv.view:G.lv.n);
    const tx=(e.clientX-r.left)/cs-.5+(cm?cm.x:0),ty=(e.clientY-r.top)/cs-.5+(cm?cm.y:0),dx=tx-G.p.x,dy=ty-G.p.y;
    if(Math.max(Math.abs(dx),Math.abs(dy))<.5&&G.W.ui&&G.W.ui.tapMe)arcAction();
    else if(Math.max(Math.abs(dx),Math.abs(dy))>=.5&&!(G&&G.wz&&G.wz.casting))run(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));
  }
  sx=null;
});
['pointercancel','pointerleave'].forEach(ev=>cv.addEventListener(ev,()=>{sx=null;}));
document.getElementById('act').addEventListener('pointerdown',e=>{e.preventDefault();arcAction();});
document.getElementById('act').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();arcAction();}});
document.querySelectorAll('#keypad .kpg button').forEach(b=>b.addEventListener('click',()=>kpPress(b.dataset.k)));
document.getElementById('fsBtn').onclick=()=>setFocus(!focusOn);
document.getElementById('fsExit').onclick=toMap;
document.getElementById('pauseBtn').onclick=()=>pauseGame();
document.getElementById('pauseGo').onclick=()=>resumeGame();
function menuLabels(){document.getElementById('mSound').textContent=muted?'🔇 צלילים: כבויים':'🔊 צלילים: פועלים';document.getElementById('mVoice').textContent=voiceOn?'🗣️ הקראה: פועלת':'🗣️ הקראה: כבויה';}
document.getElementById('mSound').onclick=()=>{muted=!muted;save('journey_mute',muted);menuLabels();beep(880,.1);};
document.getElementById('mVoice').onclick=()=>{voiceOn=!voiceOn;save('journey_voice',voiceOn);menuLabels();if(voiceOn)speak('ההקראה פועלת',true);};
document.getElementById('helpMenu').onclick=()=>document.getElementById('helpBtn').click();
document.getElementById('qSay').onclick=()=>{if(G&&G.lv.qs)sayQ(G.lv.qs[G.qi],true);};
document.getElementById('padBtn').onclick=()=>{padOn=!padOn;save('journey_pad',padOn);
  document.getElementById('pad').classList.toggle('off',!padOn);
  document.getElementById('padBtn').textContent=padOn?'🎮 בלי חצים':'🎮 עם חצים';
  if(!padOn)toast('משחקים בהקשה על המבוך או בהחלקה עם האצבע');resize();};

function toMap(){const fromB=G&&G.custom;toMapRaw();if(fromB)bOpen(bPlaying);}
function toMapRaw(){navId++;stopRun();clearInterval(winTimer);pausedAt=0;document.getElementById('pause').hidden=true;document.getElementById('keypad').hidden=true;if(focusOn)setFocus(false,false);if(G&&!G.duel&&!G.custom){region=regionOf(G.w);save('journey_region',region);}G=null;D=null;setTimeout(showPop,400);['turn','duelRes'].forEach(id=>document.getElementById(id).hidden=true);document.getElementById('gameScreen').hidden=true;document.getElementById('mapScreen').hidden=false;renderMap();window.scrollTo(0,0);}
document.getElementById('back').onclick=toMap;
document.getElementById('winMap').onclick=()=>{clearInterval(winTimer);toMap();};
document.getElementById('retry').onclick=()=>{if(!G)return;stopRun();document.getElementById('keypad').hidden=true;
  // same maze, fresh start
  const lv=G.lv;Object.assign(G,{hurtUntil:0,bump:null,onBridge:null,p:{x:lv.start.x,y:lv.start.y},stars:new Set(lv.stars.map(c=>c[0]+','+c[1])),got:0,keys:new Set(),
    doors:Object.assign({},lv.doors||{}),keysLeft:(lv.keys||[]).map(k=>Object.assign({},k)),air:G.cfg.air||0,check:{x:lv.start.x,y:lv.start.y},
    anim:null,cam:null,done:false,t0:G.duel?G.t0:Date.now(),trail:new Set([lv.start.x+','+lv.start.y]),hint:null,collapsed:new Set(),stack:[],warped:false,tog:0,hits:0,gotSticker:false,vis:null,...fresh(lv)});
  document.getElementById('win').hidden=true;updateHud();showQuiz(false);};
document.getElementById('moreBtn').onclick=e=>{menuLabels();const m=document.getElementById('moreMenu');m.hidden=!m.hidden;document.getElementById('moreBtn').setAttribute('aria-expanded',!m.hidden);e.stopPropagation();};
document.getElementById('moreMenu').addEventListener('click',()=>{setTimeout(()=>{document.getElementById('moreMenu').hidden=true;document.getElementById('moreBtn').setAttribute('aria-expanded','false');},0);});
document.addEventListener('click',e=>{if(!e.target.closest('.more')){document.getElementById('moreMenu').hidden=true;document.getElementById('moreBtn').setAttribute('aria-expanded','false');}});
document.getElementById('coinsBtn').onclick=()=>{
  if(!G||G.W.id!=='numbers'||G.done)return;
  G.coinsLeft=G.lv.coins.map(c=>Object.assign({},c));G.sum=0;beep(500,.08,'sine');toast('המטבעות חזרו למקום. אפשר לנסות שוב 🙂');showQuiz(false);updateHud();
};
document.getElementById('undoBtn').onclick=()=>{
  {const U=kitHook('undo');if(U&&U())return;}
  if(G&&G.W.id==='tilt'&&!G.done&&!G.anim){const u=G.tiltUndo.pop();if(!u)return;G.p=u.p;G.bpos=u.bs;G.tiltA=null;G.tilts=Math.max(0,G.tilts-1);beep(500,.08,'sine');updateHud();return;}
  if(G&&G.W.id==='soccer'&&!G.done&&!G.roll){const u=G.spUndo.pop();if(!u)return;G.p=u.p;G.ball=u.ball;G.kicks=Math.max(0,G.kicks-1);beep(500,.08,'sine');updateHud();return;}
  if(G&&G.W.id==='snake'&&!G.done){const u=G.snUndo.pop();if(!u)return;G.p=u.p;G.body=u.body;G.fruitsLeft=u.fruits;G.stars=u.stars;G.got=u.got;beep(500,.08,'sine');updateHud();return;}
  if(!G||G.W.id!=='toys'||G.done||!G.undo.length)return;
  const u=G.undo.pop();G.p=u.p;G.boxes=u.boxes;beep(500,.08,'sine');updateHud();
};
document.getElementById('hintBtn').onclick=()=>{
  {const H=kitHook('hint');if(H&&H())return;}
  if(G&&G.W.id==='tilt'&&!G.done&&!G.anim){const lv=G.lv,R=GEN.tiltSolve(lv.t,lv.n,G.p,G.bpos,lv.goal,60000);
    if(!R.won){toast('מכאן אי אפשר להגיע. לחצי ↩ צעד אחורה');return;}G.hint={d:R.sol[0],until:performance.now()+1800};return;}
  if(G&&(G.W.id==='golf'||G.W.id==='dojo')&&!G.done&&!G.roll){const lv=G.lv,n=lv.n,golfy=G.W.id==='golf';
    // shortest way from here, then show the first move
    const start=golfy?G.p.x+','+G.p.y:G.p.x+','+G.p.y+','+G.phase,prev={[start]:null},q=[start];let first=null;
    for(let h=0;h<q.length&&first==null;h++){const k=q[h],[x,y,ph]=k.split(',').map(Number);
      if(x===lv.goal.x&&y===lv.goal.y){let c=k;while(prev[c]&&prev[c][0]!==start)c=prev[c][0];first=prev[c]?prev[c][1]:null;break;}
      for(let d=0;d<4;d++){let nk;
        if(golfy){const r=GEN.golfRoll(lv.t,n,x,y,d,lv.goal);if(!r.path.length||r.water)continue;nk=r.x+','+r.y;}
        else{const a=x+DV[d][0],b=y+DV[d][1];if(a<0||b<0||a>=n||b>=n||lv.t[b][a]===3||!GEN.dojoOpen(lv.t,a,b,ph))continue;nk=a+','+b+','+(1-ph);}
        if(nk in prev)continue;prev[nk]=[k,d];q.push(nk);}}
    if(first==null){toast('מכאן אי אפשר להגיע. נסי להתחיל מחדש');return;}
    G.hint={d:first,until:performance.now()+1800};return;}
  if(G&&G.W.id==='soccer'&&!G.done&&!G.roll){const lv=G.lv,R=GEN.soccerSolve(lv.t,lv.n,G.p,G.ball,lv.goal);
    if(!R){toast('מכאן כבר אי אפשר להבקיע. לחצי ↩ צעד אחורה');return;}
    G.kickHint=Object.assign({until:performance.now()+3500},R.sol[0]);toast('עמדי על העיגול הזוהר ובעטי לכיוון החץ ⚽');return;}
  if(!G||G.W.id!=='ice'||G.anim||G.done)return;
  const sol=GEN.solveIce(G.lv.t,G.lv.n,G.p,G.lv.goal);
  if(!sol){toast('מכאן אי אפשר להגיע. נסי להתחיל מחדש');return;}
  G.hint={d:sol[0],until:performance.now()+1800};
};
document.getElementById('newMaze').onclick=()=>{if(G)startLevel(G.w,G.l);};
const ask=document.getElementById('resetAsk'),conf=document.getElementById('resetConfirm');
ask.onclick=()=>{conf.hidden=false;ask.hidden=true;document.getElementById('resetNo').focus();};
document.getElementById('resetNo').onclick=()=>{conf.hidden=true;ask.hidden=false;};
document.getElementById('resetYes').onclick=()=>{
  prog={};charId='kitten';shop={spent:0,owned:[],equip:{}};save('journey_prog',prog);save('journey_char',charId);saveShop();
  stickers=new Set();saveStickers();stats={chicks:0,portals:0,pushes:0,colors:0,fast:0,clean:0};save('journey_stats',stats);medalsHave=new Set();save('journey_medals',[]);boxes={opened:0};save('journey_boxes',boxes);
  save('journey_last',null);save('journey_region',null);region=null;
  conf.hidden=true;ask.hidden=false;renderMap();window.scrollTo(0,0);
};
