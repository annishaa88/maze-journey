// every world is fully registered: map tag, tip, tutorial, stickers, region, level maker, character, kit sanity
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+__dirname+'/../dist/page.html');
const bad=await p.evaluate(()=>{const {TAGS,TIPS,TUT,KITS,REGIONS,CHARS,MEDALS}=window.__R,{WORLDS,GEN}=window.__T,out=[];
  const ids=WORLDS.map(W=>W.id);
  WORLDS.forEach((W,w)=>{const id=W.id,miss=[];
    if(!TAGS[id])miss.push('TAGS');if(!TIPS[id])miss.push('TIPS');if(!TUT[id])miss.push('TUT');if(!GEN[id])miss.push('GEN');
    if(!W.stickers||W.stickers.length!==W.levels.length)miss.push('stickers');
    const r=REGIONS.filter(R=>R.worlds.includes(w)).length;if(r!==1)miss.push('regions='+r);
    if(CHARS.filter(c=>c.unlock===w).length>1)miss.push('two characters');
    if(W.ui&&W.ui.act&&W.ui.act.length!==2)miss.push('ui.act');
    if(miss.length)out.push(id+': '+miss.join(','));});
  for(const id in KITS)if(!ids.includes(id))out.push('kit for unknown world '+id);
  if(new Set(ids).size!==ids.length)out.push('duplicate world ids');
  MEDALS.forEach(m=>{if(!(m.need>0)||!m.desc)out.push('medal '+m.id);});
  return out;});
console.log(bad.length?'REGISTRY PROBLEMS:\n'+bad.join('\n'):'registry OK',errs);process.exitCode=bad.length||errs.length?1:0;await b.close();})();
