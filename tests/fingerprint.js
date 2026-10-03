// golden fingerprints: every level generator, seeded, every world × level × difficulty.
// `node tests/fingerprint.js --save` records the baseline; without it, compares to the baseline.
const {chromium}=require('playwright'),fs=require('fs'),crypto=require('crypto');
const FILE=__dirname+'/golden/levels.json';
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{let s=1;Math.random=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};window.__seed=v=>{s=v;};});
await p.goto('file://'+__dirname+'/../dist/page.html');
const run=()=>p.evaluate(()=>{const T=window.__T,out={};
  // a fake clock that ticks per call, so time-limited generators behave the same on a busy machine
  const dn=Date.now,pn=performance.now;let clk=0;Date.now=()=>1e12+(clk+=0.05);performance.now=()=>(clk+=0.05);
  const ser=v=>JSON.stringify(v,(k,x)=>x instanceof Set?{S:[...x]}:x instanceof Map?{M:[...x]}:typeof x==='function'?'fn':x);
  T.WORLDS.forEach((W,w)=>{if(!T.GEN[W.id])return;for(let d=0;d<4;d++){T.setDiff(d);W.levels.forEach((base,l)=>{window.__seed(1000*w+10*l+d+1);
    let r;try{r=ser(T.GEN[W.id](T.tune(W.id,base)));}catch(e){r='ERR '+e.message;}out[W.id+'/'+l+'/'+d]=r;});}});T.setDiff(1);Date.now=dn;performance.now=pn;return out;});
const h=o=>{const r={};for(const k in o)r[k]=crypto.createHash('sha1').update(o[k]||'').digest('hex').slice(0,12);return r;};
const a=h(await run()),c=h(await run());
// generators with time limits can differ run to run; those are marked and skipped
const cur={};for(const k in a)cur[k]=a[k]===c[k]?a[k]:'unstable';
await b.close();if(errs.length)console.log('page errors',errs);
const n=Object.keys(cur).length,un=Object.keys(cur).filter(k=>cur[k]==='unstable');
if(process.argv.includes('--save')){fs.writeFileSync(FILE,JSON.stringify(cur,null,0).replace(/,"/g,',\n"'));console.log('saved',n,'levels;',un.length,'unstable:',[...new Set(un.map(k=>k.split('/')[0]))].join(' '));return;}
const base=JSON.parse(fs.readFileSync(FILE,'utf8'));let bad=[];
for(const k of new Set([...Object.keys(base),...Object.keys(cur)])){if(base[k]==='unstable'||cur[k]==='unstable')continue;if(base[k]!==cur[k])bad.push(k);}
console.log(bad.length?'FINGERPRINT CHANGED: '+bad.length+' e.g. '+bad.slice(0,8).join(' '):'fingerprints OK ('+n+' levels)');process.exitCode=bad.length?1:0;
})();
