const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
const u='file://'+__dirname+'/../dist/page.html';await p.goto(u);await p.evaluate(()=>localStorage.setItem('journey_tut',JSON.stringify(window.__T.WORLDS.map(w=>w.id))));await p.goto(u);
const out=[],E=(f,a)=>p.evaluate(f,a);
// helper to set the maze under edit directly
const setEd=o=>E(o=>{const d=window.__B.ed;Object.assign(d,o);},o);
await p.click('#buildOpen');await p.click('#bNewBtn');await p.waitForTimeout(200);
// 1. bridge needed twice: the robot must say no
await setEd({n:6,blk:'000000'+'111110'+'000000'+'011111'+'000000'+'000000',fl:'0'.repeat(36),s:[0,0],g:[5,0],st:[[5,2],[0,4],[5,5]],th:1,br:[],wl:[]});
await E(()=>{const d=window.__B.ed;d.blk='0'.repeat(36);d.n=6;});
// corridor: start (0,0) -> goal needs to pass bridge at (2,0) then come back: build a dead-end pocket
await setEd({blk:'001111'+'101111'+'101111'+'100001'+'111101'+'000001',s:[0,0],g:[0,5],st:[[1,0],[4,4],[1,5]],br:[[0,2]]});
out.push('1 bridge twice: '+await E(()=>{const r=window.__B.bCheck(window.__B.ed);return r.msg+' | found '+r.found;}));
await setEd({br:[]});out.push('  without bridge: '+await E(()=>window.__B.bCheck(window.__B.ed).msg));
// 2. solver speed worst case: 13x13, 3 keys, 3 bridges, 3 stars
const t=await E(()=>{const d=window.__B.ed;const n=13;Object.assign(d,{n,th:0,blk:'0'.repeat(169),fl:'0'.repeat(169),wl:[],s:[0,0],g:[12,12],st:[[3,3],[9,2],[2,10]],keys:[{x:5,y:5,c:0},{x:6,y:1,c:1},{x:1,y:7,c:2}],doors:{'6,6,h':0,'10,10,v':1,'11,11,h':2},br:[],por:[],mush:[],cr:[],dec:[]});
  const t0=performance.now();const r=window.__B.bSolve(d);const t1=performance.now();d.th=1;d.br=[[4,4],[8,8],[10,3]];const t2=performance.now();const r2=window.__B.bSolve(d);return [Math.round(t1-t0),Math.round(performance.now()-t2),r.found,r2.found];});
out.push('2 solver ms (keys) '+t[0]+' (bridges) '+t[1]+' found '+t[2]+','+t[3]);
// 3. theme switch then undo restores keys
await setEd({th:0,br:[]});await E(()=>{});await p.click('#buildBack');await p.click('.bcard button:nth-child(2)');await p.waitForTimeout(200);
const k0=await E(()=>window.__B.ed.keys.length);await p.click('#bTheme button:nth-child(3)');const k1=await E(()=>window.__B.ed.keys.length);await p.click('#bUndoBtn');const k2=await E(()=>window.__B.ed.keys.length+' th '+window.__B.ed.th);
out.push('3 keys '+k0+' -> switch '+k1+' -> undo '+k2);
// 4. resize keeps valid pieces
await p.$eval('#bSzR',(e,v)=>{e.value=v;e.dispatchEvent(new Event('change'));},8);out.push('4 resize 13->8: keys '+await E(()=>JSON.stringify(window.__B.ed.keys))+' doors '+await E(()=>JSON.stringify(window.__B.ed.doors))+' | '+await p.textContent('#bMsg'));
// 5. a line drawn over a door removes the door
await setEd({doors:{'2,2,h':0}});const box=await E(()=>{const r=document.getElementById('bCv').getBoundingClientRect();return [r.left,r.top,r.width];});const cs=box[2]/8;
await p.click('#bTabs [data-tab="walls"]');await p.click('#bTools [data-t="line"]');const box2=await E(()=>{const r=document.getElementById('bCv').getBoundingClientRect();return [r.left,r.top,r.width];});
await p.mouse.click(box2[0]+3*cs,box2[1]+2.5*cs);out.push('5 line over door: doors '+await E(()=>JSON.stringify(window.__B.ed.doors))+' wl '+await E(()=>window.__B.ed.wl.join(' ')));
// 6. robot on a broken maze, then editing stops the robot
await setEd({blk:'0'.repeat(64),wl:[],st:[[1,1],[2,2]],keys:[],doors:{}});await p.click('#bRobotBtn');await p.waitForTimeout(2200);out.push('6 robot broken: '+await p.textContent('#bMsg'));
await p.click('#bRobotBtn');await p.waitForTimeout(300);await p.mouse.click(box2[0]+5.5*cs,box2[1]+5.2*cs);out.push('  edit during robot stops it: '+await E(()=>window.__B.ed&&1));
// 7. creature catches the player in a castle maze -> star goes back, no errors
await setEd({n:6,th:0,blk:'0'.repeat(36),fl:'0'.repeat(36),wl:[],s:[0,0],g:[5,5],st:[[1,0],[0,2],[5,3]],keys:[],doors:{},cr:[{cells:[[2,0],[3,0],[4,0]]}],br:[],por:[],mush:[],dec:[]});
await p.click('#bPlayBtn');await p.waitForTimeout(500);
await E(()=>{const G=window.__G();G.lv.monkeys[0].t=0;G.lv.monkeys[0].i=0;});await p.keyboard.press('ArrowRight');await p.waitForTimeout(100);await p.keyboard.press('ArrowRight');await p.waitForTimeout(300);
out.push('7 caught: hits '+await E(()=>window.__G().hits||0)+' got '+await E(()=>window.__G().got)+' msg '+await p.textContent('#msg'));
await p.waitForTimeout(1500);await p.screenshot({path:'qb3_creature.png'});await p.click('#fsExit');await p.waitForTimeout(300);
// 8. old saved maze without the new fields still opens and plays
await E(()=>{const k=Object.keys(localStorage).find(k=>k.endsWith('journey_mymazes'));const L=JSON.parse(localStorage.getItem(k));L.push({id:'old1',name:'ישן',n:6,th:2,blk:'0'.repeat(36),s:[0,0],g:[5,5],st:[[1,1],[2,2],[3,3]],best:null});localStorage.setItem(k,JSON.stringify(L));});
await p.goto(u);await p.click('#buildOpen');const nC=await p.locator('#bList .bcard').count();await p.locator('#bList .bcard').last().locator('.go').click();await p.waitForTimeout(500);
out.push('8 old maze: cards '+nC+' playing '+await p.isVisible('#gameScreen')+' world '+await E(()=>window.__G().W.id));await p.click('#fsExit');await p.waitForTimeout(300);
// 9. family: only the maker can delete; update resets the table
await p.click('#buildBack');await p.locator('#bList .bcard').first().locator('button:nth-child(2)').click();await setEd({th:0});
const ok9=await E(()=>window.__B.bCheck(window.__B.ed).ok);if(!ok9)await p.click('#bRand');await p.click('#bFamBtn');
await E(()=>{const f=JSON.parse(localStorage.getItem('journey_family'));f[0].lb=[{name:'סבתא',sec:9,stars:3}];localStorage.setItem('journey_family',JSON.stringify(f));});
await p.click('#bFamBtn');out.push('9 update: '+await p.textContent('#bMsg')+' lb '+await E(()=>JSON.parse(localStorage.getItem('journey_family'))[0].lb.length));
await p.click('#buildBack');out.push('  maker sees trash '+await p.locator('#bFamList .bcard .del').count());
await E(()=>{localStorage.setItem('journey_profiles',JSON.stringify([{id:0,name:'אמא'},{id:5,name:'נועה'}]));localStorage.setItem('journey_cur','5');});await p.goto(u);await p.click('#buildOpen');
out.push('  other player sees trash '+await p.locator('#bFamList .bcard .del').count()+' cards '+await p.locator('#bFamList .bcard').count());
// 10. layouts: small phone, landscape, night
for(const [w,h,nm] of [[320,640,'sm'],[844,390,'ld']]){await p.setViewportSize({width:w,height:h});await p.click('#bNewBtn');await p.waitForTimeout(200);
  out.push('10 '+nm+': overflowX '+await E(()=>document.documentElement.scrollWidth-innerWidth)+' tabs '+await E(()=>[...document.querySelectorAll('#bTabs button')].map(b=>b.scrollWidth<=b.clientWidth+1).join(',')));
  await p.click('#bTabs [data-tab="deco"]');await p.click('#bTools [data-t="deco"]');await p.screenshot({path:'qb3_'+nm+'.png'});await p.click('#buildBack');}
await p.setViewportSize({width:390,height:844});
await E(()=>localStorage.setItem('journey_night','true'));await p.goto(u);await p.click('#buildOpen');await p.locator('#bList .bcard').first().locator('button:nth-child(2)').click();await p.click('#bTabs [data-tab="special"]');await p.click('#bRobotBtn');await p.waitForTimeout(2500);await p.screenshot({path:'qb3_night.png'});
console.log(out.join('\n'));console.log('errors',[...new Set(errs)]);await b.close();})();
