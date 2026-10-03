const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.grantPermissions(['clipboard-read','clipboard-write']);const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const u='file://'+__dirname+'/../dist/page.html';await p.goto(u);
await p.evaluate(()=>{localStorage.setItem('journey_prog',JSON.stringify({'0-0':3,'1-2':2}));localStorage.setItem('p5_journey_prog',JSON.stringify({'3-1':1}));localStorage.setItem('journey_profiles',JSON.stringify([{id:0,name:'אמא'},{id:5,name:'נועה'}]));localStorage.setItem('journey_mymazes',JSON.stringify([{id:'x',name:'שלי',n:6,th:0,blk:'0'.repeat(36),s:[0,0],g:[5,5],st:[[1,1],[2,2],[3,3]]}]));localStorage.setItem('other_key','keep');});
await p.goto(u);await p.click('#setBtn');await p.click('#bkSave');await p.waitForTimeout(300);
const code=await p.inputValue('#bkCode');console.log('code',code.slice(0,6),code.length,'|',await p.textContent('#bkMsg'));
await p.click('#bkCopy');await p.waitForTimeout(200);console.log('copy:',await p.textContent('#bkMsg'));await p.screenshot({path:'bk_set.png',fullPage:true});
// wipe and restore
await p.evaluate(()=>{Object.keys(localStorage).filter(k=>k.includes('journey_')).forEach(k=>localStorage.removeItem(k));localStorage.setItem('journey_prog','{}');});
await p.goto(u);await p.click('#setBtn');await p.click('#bkLoad');await p.fill('#bkInText','garbage');await p.click('#bkApply');console.log('bad:',await p.textContent('#bkMsg'));
await p.fill('#bkInText',code);await p.click('#bkApply');console.log('ask:',await p.textContent('#bkMsg'));await p.click('#bkApply');await p.waitForTimeout(1500);
console.log('restored:',await p.evaluate(()=>[localStorage.getItem('journey_prog'),localStorage.getItem('p5_journey_prog'),JSON.parse(localStorage.getItem('journey_mymazes')).length,localStorage.getItem('other_key'),document.getElementById('totalStars').textContent]));
console.log(errs);await b.close();})();
