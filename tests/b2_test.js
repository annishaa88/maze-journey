const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
const u='file://'+__dirname+'/../dist/page.html';await p.goto(u);await p.evaluate(()=>localStorage.setItem('journey_tut',JSON.stringify(window.__T.WORLDS.map(w=>w.id))));await p.goto(u);
const out=[],E=(f,a)=>p.evaluate(f,a),K=['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'];
let box,cs;const geo=async()=>{box=await E(()=>{const r=document.getElementById('bCv').getBoundingClientRect();return [r.left,r.top,r.width];});cs=box[2]/(await E(()=>window.__B.ed.n));};
const C=(x,y)=>[box[0]+(x+.5)*cs,box[1]+(y+.5)*cs],EH=(x,y)=>[box[0]+(x+1)*cs,box[1]+(y+.5)*cs];
const tap=async xy=>{await p.mouse.click(...xy);await p.waitForTimeout(40);};
const tool=async(tab,t)=>{await p.click('#bTabs [data-tab="'+tab+'"]');await p.click('#bTools [data-t="'+t+'"]');await geo();};
const msg=()=>p.textContent('#bMsg');
async function solveAndPlay(){const route=await E(()=>{const d=window.__B.ed,r=window.__B.bCheck(d);return {path:r.path,por:(d.th===2?d.por:[]),mush:(d.th===3?d.mush:[])};});
  await p.click('#bPlayBtn');await p.waitForTimeout(600);let flip=false;const P=route.path;
  for(let i=1;i<P.length;i++){let [ax,ay]=P[i-1],[bx,by]=P[i];if(Math.abs(bx-ax)+Math.abs(by-ay)>1){const pr=route.por.find(q=>(q.b[0]===bx&&q.b[1]===by&&Math.abs(q.a[0]-ax)+Math.abs(q.a[1]-ay)===1)||(q.a[0]===bx&&q.a[1]===by&&Math.abs(q.b[0]-ax)+Math.abs(q.b[1]-ay)===1));
      const en=pr.a[0]===bx&&pr.a[1]===by?pr.b:pr.a;bx=en[0];by=en[1];}
    let d=[[0,-1],[1,0],[0,1],[-1,0]].findIndex(v=>v[0]===bx-ax&&v[1]===by-ay);if(flip)d=(d+2)%4;await p.keyboard.press(K[d]);await p.waitForTimeout(70);
    if(route.mush.some(m=>m[0]===bx&&m[1]===by)){flip=!flip;await p.waitForTimeout(500);}}
  await p.waitForTimeout(700);return await p.isVisible('#duelRes');}
await p.click('#buildOpen');await p.click('#bNewBtn');await p.waitForTimeout(200);await geo();
// A. castle: thin line wall with a door, key
await tool('walls','line');await p.mouse.move(...EH(3,0));await p.mouse.down();for(let y=1;y<=4;y++)await p.mouse.move(...EH(3,y),{steps:3});await p.mouse.up();
await p.mouse.move(...EH(3,6));await p.mouse.down();await p.mouse.move(...EH(3,7),{steps:3});await p.mouse.up();
out.push('A lines: '+await E(()=>window.__B.ed.wl.join(' ')));
await tool('places','star');for(const c of [[1,6],[6,1],[6,6]])await tap(C(...c));
out.push('A no door: '+await msg());
await tool('special','door');await tap(EH(3,5));out.push('A door no key: '+await msg());
await tool('special','key');await tap(C(1,1));out.push('A key: '+await msg()+' | diff '+await p.textContent('#bDiffT'));
await p.click('#bRobotBtn');await p.waitForTimeout(1200);await p.screenshot({path:'b2_robot.png'});await p.waitForTimeout(4500);out.push('A robot: '+await msg());
await p.fill('#bNoteIn','כל הכבוד אמא!');
await tool('deco','paint');await p.mouse.move(...C(0,0));await p.mouse.down();for(let x=1;x<3;x++)await p.mouse.move(...C(x,0),{steps:2});await p.mouse.up();
await tool('deco','deco');await tap(C(2,2));await tap(C(5,3));
await p.screenshot({path:'b2_castle.png'});
out.push('A play won: '+await solveAndPlay()+' | note '+await p.textContent('#drNote')+' | stars '+await E(()=>window.__G().got));await p.screenshot({path:'b2_castle_win.png'});
await p.click('#drMap');await p.waitForTimeout(300);await geo();
// B. space: theme switch purges, portals
await p.click('#bTheme button:nth-child(3)');await p.waitForTimeout(200);out.push('B switch: '+await msg()+' | keys '+await E(()=>window.__B.ed.keys.length));
await tool('walls','line');await tap(EH(3,5));// close the gap
out.push('B closed: '+await msg());
await tool('special','portal');await tap(C(2,5));out.push('B half: '+await msg());await tap(C(5,2));out.push('B portal: '+await msg());
out.push('B play won: '+await solveAndPlay()+' stars '+await E(()=>window.__G().got));await p.click('#drMap');await p.waitForTimeout(300);await geo();
// C. jungle: bridge + creature
await p.click('#bTheme button:nth-child(2)');await tool('walls','erase');
await tool('walls','line');await tap(EH(3,5));// reopen gap
await tool('special','bridge');await tap(C(4,5));
await tool('special','creature');await p.mouse.move(...C(5,4));await p.mouse.down();await p.mouse.move(...C(6,4),{steps:3});await p.mouse.move(...C(7,4),{steps:3});await p.mouse.up();
out.push('C creature cells '+await E(()=>JSON.stringify(window.__B.ed.cr))+' msg '+await msg());
await tool('special','creature');await tap(C(2,3));await p.waitForTimeout(100);out.push('C tap only: '+await msg()+' count '+await E(()=>window.__B.ed.cr.length));
await p.screenshot({path:'b2_jungle.png'});
out.push('C play won: '+await solveAndPlay());await p.screenshot({path:'b2_jungle_play.png'});await p.click('#drMap').catch(()=>{});await p.waitForTimeout(300);await geo();
// D. forest: mushroom flips arrows
await p.click('#bTheme button:nth-child(4)');await tool('special','mush');await tap(C(2,6));await tap(C(5,6));
out.push('D play won: '+await solveAndPlay());await p.click('#drMap').catch(()=>{});await p.waitForTimeout(300);
// E. size 13 + random
await p.$eval('#bSzR',(e,v)=>{e.value=v;e.dispatchEvent(new Event('change'));},13);await p.click('#bRand');await geo();out.push('E 13 random: '+await msg()+' | '+await p.textContent('#bDiffT'));await p.screenshot({path:'b2_13.png'});
// F. share code v2 round trip, and an old code
const rt=await E(()=>{const d=window.__B.ed,c=window.__B.bEncode(d),d2=window.__B.bDecode(c);const f=['n','th','blk','fl','s','g','st','wl','keys','doors','por','mush','br','cr','dec','msg'];return c.length+' chars, same: '+f.every(k=>JSON.stringify(d[k])===JSON.stringify(d2[k]))+' '+f.filter(k=>JSON.stringify(d[k])!==JSON.stringify(d2[k])).join(',');});
out.push('F code '+rt);
const old=await E(()=>{const b=[6,1,0,0,5,5,3,1,1,2,2,3,3];for(let i=0;i<5;i++)b.push(0);return btoa(String.fromCharCode(...b));});
await p.click('#buildBack');await p.fill('#bCodeIn',old);await p.click('#bCodeGo');out.push('F old code: editor '+await p.isVisible('#bEditor')+' '+await msg());
// G. family challenge
await p.click('#buildBack');await p.click('.bcard:nth-child(1) button:nth-child(2)');await p.click('#bTarget [data-v="60"]');await p.click('#bFamBtn');out.push('G sent: '+await msg());
await E(()=>{localStorage.setItem('journey_profiles',JSON.stringify([{id:0,name:'אמא'},{id:5,name:'נועה'}]));localStorage.setItem('journey_cur','5');});
await p.goto(u);await p.click('#buildOpen');await p.waitForTimeout(200);out.push('G other player: famBox '+await p.isVisible('#bFamBox')+' cards '+await p.locator('#bFamList .bcard').count()+' own '+await p.locator('#bList .bcard').count()+' sub '+await p.textContent('#bFamList .bcard .note'));
await p.click('#bFamList .bcard .go');await p.waitForTimeout(600);
const fr=await E(()=>{const f=JSON.parse(localStorage.getItem('journey_family'))[0];const r=window.__B.bCheck(f.m);return {path:r.path,por:[],mush:[]};});
for(let i=1;i<fr.path.length;i++){const [ax,ay]=fr.path[i-1],[bx,by]=fr.path[i];const d=[[0,-1],[1,0],[0,1],[-1,0]].findIndex(v=>v[0]===bx-ax&&v[1]===by-ay);await p.keyboard.press(K[d]);await p.waitForTimeout(60);}
await p.waitForTimeout(700);out.push('G win '+await p.isVisible('#duelRes')+' title '+await p.textContent('#drTitle')+' lb '+await p.isVisible('#drLb')+' name '+await p.inputValue('#drName'));
await p.click('#drSave');await p.waitForTimeout(200);out.push('G saved: '+await p.textContent('#drSave')+' top '+await p.textContent('#drTop'));await p.screenshot({path:'b2_famwin.png'});
await p.click('#drMap');await p.waitForTimeout(300);out.push('G back: gallery '+await p.isVisible('#bGallery')+' board '+await p.textContent('#bFamList .blb'));
await p.screenshot({path:'b2_gallery.png',fullPage:true});
console.log(out.join('\n'));console.log('errors',[...new Set(errs)]);await b.close();})();
