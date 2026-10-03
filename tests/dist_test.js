const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const out=[];const errs=[];
for(const [vw,vh] of [[390,844],[844,390]]){const p=await b.newPage({viewport:{width:vw,height:vh}});p.on('pageerror',e=>errs.push(e.message));
const u='file://'+__dirname+'/../dist/game.html';await p.goto(u);await p.waitForTimeout(500);
await p.click('#contBtn');await p.waitForTimeout(800);
if(await p.isVisible('#tutGo'))await p.click('#tutGo');
const before=await p.evaluate(()=>document.getElementById('hud').textContent);
for(const k of ['ArrowRight','ArrowDown','ArrowRight','ArrowDown'])await p.keyboard.press(k),await p.waitForTimeout(120);
await p.click('#fsExit');await p.waitForTimeout(400);
// visit every region and open the first level of each world
const regions=await p.evaluate(()=>document.querySelectorAll('.region').length)||0;
await p.evaluate(()=>{const b=document.getElementById('regBack');if(b)b.click();});await p.waitForTimeout(200);
const nreg=await p.evaluate(()=>document.querySelectorAll('.region').length);let opened=0;
for(let r=0;r<nreg;r++){await p.evaluate(r=>document.getElementById('region-'+r).click(),r);await p.waitForTimeout(200);
  const ids=await p.evaluate(()=>[...document.querySelectorAll('.pb')].filter(b=>!b.disabled&&b.id.endsWith('-0')).map(b=>b.id));
  for(const id of ids){const goBtn=await p.$('#world-'+id.split('-')[1]+'.folded .fold.go');if(goBtn)await goBtn.click();else await p.click('#'+id);await p.waitForTimeout(450);if(await p.isVisible('#tutGo'))await p.click('#tutGo');await p.keyboard.press('ArrowRight');await p.waitForTimeout(80);await p.keyboard.press('ArrowDown');await p.waitForTimeout(80);opened++;
    await p.click('#fsExit');await p.waitForTimeout(250);await p.evaluate(r=>{const e=document.getElementById('region-'+r);if(e)e.click();},r);await p.waitForTimeout(150);}
  await p.evaluate(()=>{const b=document.getElementById('regBack');if(b)b.click();});await p.waitForTimeout(150);}
await p.click('#profBtn');await p.waitForTimeout(100);await p.click('#setBtn');await p.click('#collOpen').catch(()=>{});await p.waitForTimeout(300);
out.push(vw+'x'+vh+': regions '+nreg+', world level-1s opened '+opened);await p.close();}
console.log(out.join('\n'));console.log('errors',[...new Set(errs)]);await b.close();})();
