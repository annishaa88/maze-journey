const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];
for(const [vw,vh,tag] of [[390,844,'ph'],[844,390,'land'],[360,640,'sm'],[1280,720,'dt']]){
 const p=await b.newPage({viewport:{width:vw,height:vh}});p.on('pageerror',e=>errs.push(e.message));
 const u='file://'+__dirname+'/../dist/page.html';await p.goto(u);
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('journey_tut',JSON.stringify(window.__T.WORLDS.map(w=>w.id)));});await p.goto(u);
 await p.evaluate(()=>window.__start(2,2));await p.waitForTimeout(800);
 const info=await p.evaluate(()=>{const r=document.getElementById('board').getBoundingClientRect(),pd=document.getElementById('up').getBoundingClientRect();return {board:Math.round(r.width),btn:Math.round(pd.width)+'x'+Math.round(pd.height),padBottom:Math.round(pd.bottom),overflowY:document.documentElement.scrollHeight-innerHeight,overflowX:document.documentElement.scrollWidth-innerWidth};});
 console.log(tag,JSON.stringify(info));await p.screenshot({path:'ux-'+tag+'.png'});
 if(tag==='ph'){await p.evaluate(()=>window.__start(13,3));await p.waitForTimeout(700);await p.screenshot({path:'ux-ph-quiz.png'});
   await p.click('#pauseBtn');await p.waitForTimeout(200);await p.screenshot({path:'ux-pause.png'});
   const t=await p.evaluate(()=>window.__G().fishT);await p.waitForTimeout(1500);await p.click('#pauseGo');
   await p.click('#moreBtn');await p.waitForTimeout(150);await p.screenshot({path:'ux-menu.png'});await p.click('#mSound');console.log('muted now',await p.evaluate(()=>localStorage.getItem('journey_mute')));await p.click('#moreBtn');await p.click('#mSound');
   await p.evaluate(()=>window.__start(0,0));await p.waitForTimeout(600);await p.evaluate(()=>window.__win());await p.waitForTimeout(1200);
   console.log('countdown',await p.textContent('#winNext'));await p.waitForTimeout(7000);console.log('auto next started level',await p.evaluate(()=>window.__G().l),'win hidden',await p.isHidden('#win'));}
 await p.close();}
console.log('errors',errs);await b.close();})();
