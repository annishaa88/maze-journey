const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+__dirname+'/../dist/game.html');await p.click('#buildOpen');await p.click('#bNewBtn');await p.click('#bRand');
for(const t of ['walls','places','special','deco'])await p.click('#bTabs [data-tab="'+t+'"]');
await p.click('#bTheme button:nth-child(3)');await p.click('#bTabs [data-tab="special"]');await p.click('#bRobotBtn');await p.waitForTimeout(2500);
const m=await p.textContent('#bMsg');await p.click('#bTarget [data-v="30"]');await p.click('#bFamBtn');await p.click('#bPlayBtn');await p.waitForTimeout(600);
const playing=await p.isVisible('#gameScreen');await p.click('#fsExit');await p.waitForTimeout(300);await p.click('#buildBack');
console.log('msg',m,'| playing',playing,'| fam cards',await p.locator('#bFamList .bcard').count(),'| code',(await p.evaluate(()=>1)));console.log('errors',errs);await b.close();})();
