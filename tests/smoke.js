const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const u='file://'+__dirname+'/../dist/page.html';await p.goto(u);
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('journey_tut',JSON.stringify(window.__T.WORLDS.map(w=>w.id)));});await p.goto(u);
const K=['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'];
for(let w=0;w<37;w++)for(const l of [0,5]){await p.evaluate(([w,l])=>window.__start(w,l),[w,l]);await p.waitForTimeout(500);
  for(let i=0;i<12;i++){await p.keyboard.press(K[i%4===3?2:i%4]);await p.waitForTimeout(40);}}
// star chip in full screen
await p.evaluate(()=>window.__start(17,0));await p.waitForTimeout(600);
await p.evaluate(()=>{const G=window.__G();const k=[...G.stars][0];const [x,y]=k.split(',').map(Number);G.p={x,y};});
await p.evaluate(()=>{const G=window.__G();G.blobs=[];});
const info=await p.evaluate(()=>{const G=window.__G();const s=document.getElementById('hudStars');return {chip:s&&s.textContent,shown:s&&s.offsetWidth>0};});
console.log('star chip',JSON.stringify(info));
console.log('errors',errs.slice(0,5));await b.close();})();
