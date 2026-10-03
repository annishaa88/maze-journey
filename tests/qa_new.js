const {chromium}=require('playwright');
const K=['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'];
(async()=>{const b=await chromium.launch();const out=[];const errs=[];
const u='file://'+__dirname+'/../dist/page.html';
const mk=async(vw,vh)=>{const p=await b.newPage({viewport:{width:vw,height:vh}});p.on('pageerror',e=>errs.push(e.message));await p.goto(u);
  await p.evaluate(()=>{localStorage.clear();localStorage.setItem('journey_tut',JSON.stringify(window.__T.WORLDS.map(w=>w.id)));});await p.goto(u);await p.waitForTimeout(300);return p;};
// 1. every world, every difficulty, every level: generates, and how long
{const p=await mk(390,844);
 const r=await p.evaluate(()=>{const T=window.__T,bad=[],slow=[];let cnt=0;
  for(const dv of [0,1,2,3]){T.setDiff(dv);T.WORLDS.forEach((W,w)=>W.levels.forEach((base,l)=>{const cfg=T.tune(W.id,base);const t0=performance.now();let lv=null,e='';
    try{lv=T.GEN[W.id](cfg);}catch(x){e=x.message;}const ms=performance.now()-t0;cnt++;
    if(!lv||e)bad.push(W.id+' d'+dv+' L'+(l+1)+' '+e);else if(!lv.stars||lv.stars.length<3)bad.push(W.id+' d'+dv+' L'+(l+1)+' stars '+(lv.stars&&lv.stars.length));
    if(ms>900)slow.push(W.id+' d'+dv+' L'+(l+1)+' '+Math.round(ms)+'ms');}));}
  T.setDiff(1);return {cnt,bad,slow};});
 out.push('1. generated '+r.cnt+' levels. problems: '+JSON.stringify(r.bad)+' slow: '+JSON.stringify(r.slow));
 // 2. pause freezes the new timers
 for(const [w,k] of [[48,'rlT0'],[44,'stT0']]){await p.evaluate(w=>window.__start(w,2),w);await p.waitForTimeout(400);
   const a=await p.evaluate(k=>window.__G()[k],k);await p.click('#pauseBtn').catch(()=>p.evaluate(()=>document.querySelector('[aria-label*="הפסק"],#pauseBtn')?.click()));
   await p.waitForTimeout(1500);const vis=await p.isVisible('#pause');await p.evaluate(()=>{const el=document.querySelector('#pause button');if(el)el.click();});await p.waitForTimeout(100);
   const bb=await p.evaluate(k=>window.__G()[k],k);out.push('2. pause '+k+' paused='+vis+' shifted by '+Math.round(bb-a)+'ms (expect ~1500)');
   await p.evaluate(()=>document.getElementById('fsExit').click());await p.waitForTimeout(150);}
 // 3. duel in each new world
 for(const w of [49,50,51,52,53,54,55,56,57,58,59,60,61]){
   const ok=await p.evaluate(async w=>{document.getElementById('duelOpen').click();await new Promise(r=>setTimeout(r,100));document.getElementById('wc-'+w).click();await new Promise(r=>setTimeout(r,50));
     document.getElementById('duelStart').click();await new Promise(r=>setTimeout(r,700));const t=document.getElementById('turn');if(t&&!t.hidden){const bt=t.querySelector('button');if(bt)bt.click();}
     await new Promise(r=>setTimeout(r,300));const G=window.__G();return G&&G.duel&&G.W.id;},w);
   for(let i=0;i<4;i++){await p.keyboard.press(K[i]);await p.waitForTimeout(80);}
   const g=await p.evaluate(()=>{const G=window.__G();return G.W.id+'@'+G.p.x+','+G.p.y;});out.push('3. duel '+w+' → '+ok+' '+g);
   await p.evaluate(()=>{const gu=document.getElementById('giveUp');if(gu&&!gu.hidden)gu.click();});await p.waitForTimeout(300);
   await p.goto(u);await p.waitForTimeout(300);}
 await p.close();}
// 4. profiles edge cases
{const p=await mk(390,844);
 await p.click('#profBtn');for(let i=0;i<6;i++){await p.evaluate(()=>{document.getElementById('profiles').hidden=false;});await p.fill('#pname','P'+i);await p.evaluate(()=>document.getElementById('padd').click());await p.waitForTimeout(500);}
 const n=await p.evaluate(()=>JSON.parse(localStorage.getItem('journey_profiles')).length);
 out.push('4. after 6 adds: '+n+' profiles (max 6), add disabled='+await p.evaluate(()=>{document.getElementById('profBtn').click();return document.getElementById('padd').disabled;}));
 await p.evaluate(()=>{localStorage.setItem('journey_cur','99');});await p.goto(u);await p.waitForTimeout(300);
 out.push('4. bad current player → falls back to: '+await p.textContent('#profName'));
 await p.click('#profBtn');await p.fill('#pname','');await p.click('#pren');out.push('4. empty rename keeps name: '+await p.textContent('#profName'));
 await p.close();}
// 5. layouts of the new worlds: phone, small phone, landscape — nothing off screen, no overlaps with the arrows
for(const [vw,vh,tag] of [[390,844,'ph'],[360,640,'sm'],[844,390,'ld']]){const p=await mk(vw,vh);const issues=[];
 for(let w=49;w<=61;w++){await p.evaluate(w=>window.__start(w,3),w);await p.waitForTimeout(350);
   const r=await p.evaluate(()=>{const R=id=>{const e=document.getElementById(id);if(!e||e.offsetParent===null)return null;return e.getBoundingClientRect();};
     const bd=R('board'),dn=R('down'),up=R('up'),ac=R('act'),tr=document.querySelector('.toprow').getBoundingClientRect(),W=innerWidth,H=innerHeight;const o=[];
     if(bd.right>W+1||bd.left<-1)o.push('board off-screen x');if(dn&&dn.bottom>H+1)o.push('arrows below screen');if(tr.bottom>bd.top+2&&innerWidth<innerHeight)o.push('top row overlaps board');
     if(up&&bd&&up.top<bd.bottom-2&&innerWidth<innerHeight)o.push('arrows overlap board');if(ac&&(ac.right>W||ac.bottom>H))o.push('action off screen');
     if(document.documentElement.scrollWidth>W+1)o.push('page scrolls sideways');return o;});
   if(r.length)issues.push(w+': '+r.join(', '));
   if(w===56||w===60||w===54)await p.screenshot({path:'qn-'+tag+'-'+w+'.png'});}
 out.push('5. layout '+tag+': '+(issues.length?issues.join(' | '):'ok'));await p.close();}
// 6. night mode look
{const p=await mk(390,844);await p.evaluate(()=>{localStorage.setItem('journey_night','true');});await p.goto(u);await p.waitForTimeout(300);
 for(const w of [55,58]){await p.evaluate(w=>window.__start(w,1),w);await p.waitForTimeout(400);await p.screenshot({path:'qn-night-'+w+'.png'});}await p.close();}
console.log(out.join('\n'));console.log('errors',[...new Set(errs)]);await b.close();})();
