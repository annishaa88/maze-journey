// golden screens: with a fake clock and seeded randomness, start every world, play a few fixed moves,
// and fingerprint the board picture, the HUD and the buttons. Catches any change in drawing or controls.
// `node tests/screens.js --save` records; without it, compares. Optional arg: world indexes JSON.
const {chromium}=require('playwright'),fs=require('fs');
const FILE=__dirname+'/golden/screens.json',save=process.argv.includes('--save');
const only=process.argv.slice(2).find(a=>a.startsWith('['));
async function pass(){
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{let s=1;Math.random=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};window.__seed=v=>{s=v;};
    window.__snap=()=>{const h=t=>{let x=2166136261;for(let i=0;i<t.length;i++){x^=t.charCodeAt(i);x=Math.imul(x,16777619);}return (x>>>0).toString(36);};
      const v=id=>{const e=document.getElementById(id);return e&&!e.hidden&&getComputedStyle(e).display!=='none'?(e.textContent||'').trim()||'on':'-';};
      const G=window.__G();return {board:h(document.getElementById('c').toDataURL()),hud:(document.getElementById('hud')||{}).textContent||'',
        btn:['hintBtn','undoBtn','act'].map(v).join('|'),p:G&&G.p?G.p.x+','+G.p.y:'',done:!!(G&&G.done)};};});
  await p.clock.install({time:new Date('2026-01-01T10:00:00')});await p.clock.pauseAt(new Date('2026-01-01T10:00:01'));
  const u='file://'+__dirname+'/../dist/page.html';await p.goto(u);
  await p.evaluate(()=>{localStorage.clear();localStorage.setItem('journey_tut',JSON.stringify(window.__T.WORLDS.map(w=>w.id)));});await p.goto(u);
  await p.evaluate(()=>Promise.all([document.fonts.load('20px "Secular One"'),document.fonts.load('20px "Varela Round"'),document.fonts.load('bold 20px "Varela Round"')]));
  // draw frames ourselves with a frame clock that reads the same on every run
  await p.evaluate(()=>{window.requestAnimationFrame=()=>0;window.__T0=10000;});await p.clock.runFor(100);
  const tick=async ms=>{for(let d=0;d<ms;d+=100){await p.clock.runFor(100);await p.evaluate(()=>{for(let t=0;t<100;t+=20){window.__T0+=20;window.__frame(window.__T0);}});}};
  const N=await p.evaluate(()=>window.__T.WORLDS.length),out={};
  const list=only?JSON.parse(only):[...Array(N).keys()];
  for(const w of list){const key=w+':'+(await p.evaluate(w=>window.__T.WORLDS[w].id,w));
    await p.evaluate(w=>{window.__seed(7+w);window.__start(w,0);},w);await tick(900);
    const r=[await p.evaluate(()=>window.__snap())];
    for(const k of ['ArrowRight','ArrowDown','ArrowRight','ArrowDown','ArrowLeft']){await p.keyboard.press(k);await tick(350);}
    r.push(await p.evaluate(()=>window.__snap()));
    if(await p.isVisible('#act')){await p.evaluate(()=>document.getElementById('act').click());await tick(600);r.push(await p.evaluate(()=>window.__snap()));}
    if(await p.isVisible('#hintBtn')){await p.evaluate(()=>document.getElementById('hintBtn').click());await tick(300);r.push(await p.evaluate(()=>window.__snap()));}
    if(await p.isVisible('#undoBtn')){await p.evaluate(()=>document.getElementById('undoBtn').click());await tick(300);r.push(await p.evaluate(()=>window.__snap()));}
    out[key]=r.map(x=>[x.board,x.hud,x.btn,x.p,x.done].join(' ¦ '));
    if(errs.length){out[key].push('ERR '+errs.join(';'));errs.length=0;}
    await p.evaluate(()=>{for(const id of ['win','tut','medalPop'])document.getElementById(id)&&(document.getElementById(id).hidden=true);});
  }
  await b.close();return out;}
(async()=>{const a=await pass(),c=await pass();if(process.env.DBG)console.log(JSON.stringify(a,null,1),JSON.stringify(c,null,1));const cur={};
  for(const k in a)cur[k]=JSON.stringify(a[k])===JSON.stringify(c[k])?a[k]:a[k].map((x,i)=>x===c[k][i]?x:'unstable');
  const un=Object.keys(cur).filter(k=>cur[k].includes('unstable'));
  if(save){fs.writeFileSync(FILE,JSON.stringify(cur,null,1));console.log('saved',Object.keys(cur).length,'worlds; unstable:',un.join(' ')||'none');return;}
  const base=JSON.parse(fs.readFileSync(FILE,'utf8'));const bad=[];
  for(const k in cur){const B=base[k];if(!B){bad.push(k+' (new)');continue;}
    const n=Math.max(B.length,cur[k].length);for(let i=0;i<n;i++){if(B[i]==='unstable'||cur[k][i]==='unstable')continue;if(B[i]!==cur[k][i]){bad.push(k+'#'+i+'\n   was '+B[i]+'\n   now '+cur[k][i]);break;}}}
  console.log(bad.length?'SCREENS CHANGED:\n'+bad.join('\n'):'screens OK ('+Object.keys(cur).length+' worlds)');process.exitCode=bad.length?1:0;})();
