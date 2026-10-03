// compares the text of the map, collection and shop screens between two builds, at three progress states
// usage: node tests/screens_text.js old.html new.html
const {chromium}=require('playwright');
const states={
  none:{},
  some:(()=>{const p={},s=[];for(let w=0;w<71;w+=3)for(let l=0;l<6;l++){if((w+l)%4)p[w+'-'+l]=1+(w+l)%3;if(l%2)s.push(w+'-'+l);}return {journey_prog:p,journey_stickers:s};})(),
  all:(()=>{const p={},s=[];for(let w=0;w<71;w++)for(let l=0;l<6;l++){p[w+'-'+l]=3;s.push(w+'-'+l);}return {journey_prog:p,journey_stickers:s};})()};
async function grab(file){const b=await chromium.launch();const out={};
  for(const k in states){const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
    await p.goto('file://'+file);await p.evaluate(st=>{localStorage.clear();localStorage.setItem('journey_tut','[]');for(const q in st)localStorage.setItem(q,JSON.stringify(st[q]));localStorage.setItem('journey_medals','[]');},states[k]);await p.goto('file://'+file);await p.waitForTimeout(900);
    await p.evaluate(()=>{const m=document.getElementById('medalPop');if(m)m.hidden=true;});
    const txt=async sel=>(await p.evaluate(s=>{const e=document.querySelector(s);return e?e.innerText:'(none)';},sel)).replace(/\s+/g,' ');
    out[k+' map']=await txt('#mapScreen');
    const regs=await p.$$('.region');for(let i=0;i<regs.length;i++){await p.evaluate(i=>document.querySelectorAll('.region')[i].click(),i);await p.waitForTimeout(120);out[k+' region'+i]=await txt('#mapScreen');await p.evaluate(()=>{const b=document.getElementById('regBack');if(b)b.click();});await p.waitForTimeout(100);}
    await p.evaluate(()=>document.getElementById('collOpen').click());await p.waitForTimeout(300);out[k+' medals']=await txt('#collScreen');
    for(const t of await p.$$eval('#collScreen [id^=tab]',e=>e.map(x=>x.id))){await p.evaluate(t=>document.getElementById(t).click(),t);await p.waitForTimeout(150);out[k+' '+t]=await txt('#collScreen');}
    await p.evaluate(()=>document.getElementById('collBack').click());await p.waitForTimeout(150);
    await p.evaluate(()=>document.getElementById('shopOpen').click());await p.waitForTimeout(300);out[k+' shop']=await txt('body');
    out[k+' errors']=errs.join(';');await p.close();}
  await b.close();return out;}
(async()=>{const [a,c]=[await grab(process.argv[2]),await grab(process.argv[3])];let bad=0;
  for(const k in a)if(a[k]!==c[k]){bad++;let i=0;while(a[k][i]===c[k][i])i++;console.log('DIFF',k,'\n  old …'+a[k].slice(Math.max(0,i-60),i+80)+'\n  new …'+(c[k]||'').slice(Math.max(0,i-60),i+80));}
  console.log(bad?bad+' screens differ':'all '+Object.keys(a).length+' screens the same ('+Object.values(a).join('').length+' chars)');})();
