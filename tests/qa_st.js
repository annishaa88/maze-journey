const {chromium}=require('playwright');const K=['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>{errs.push(e.message);console.log('PE',e.message,(e.stack||'').split('\n').slice(0,3).join(' | '));});
const u='file://'+__dirname+'/../dist/page.html';await p.goto(u);
await p.evaluate(()=>{localStorage.setItem('journey_tut',JSON.stringify(window.__T.WORLDS.map(w=>w.id)));});await p.goto(u);
const worlds=JSON.parse(process.argv[2]||'[50,51,52,53]'),diffs=JSON.parse(process.argv[3]||'[1]'),levels=JSON.parse(process.argv[4]||'[0,3,5]');
const press=async(dirs,ms)=>{for(const d of dirs){await p.keyboard.press(K[d]);await p.waitForTimeout(ms||30);}};
// weighted route: walls from lv.g or tiles from lv.t; cost function chosen by mode
const route=(to,mode)=>p.evaluate(([to,mode])=>{const G=window.__G(),lv=G.lv,n=lv.n,DV=[[0,-1],[1,0],[0,1],[-1,0]];const s0=G.p.x+','+G.p.y,dist={[s0]:0},prev={},Q=[[0,G.p.x,G.p.y]];
  while(Q.length){Q.sort((a,b)=>a[0]-b[0]);const [c,x,y]=Q.shift(),k=x+','+y;if(c>dist[k])continue;if(x===to[0]&&y===to[1]){const o=[];let z=k;while(z!==s0){o.unshift(prev[z][1]);z=prev[z][0];}return o;}
    for(let d=0;d<4;d++){const a=x+DV[d][0],bb=y+DV[d][1],nk=a+','+bb;if(a<0||bb<0||a>=n||bb>=n)continue;
      if(lv.g&&lv.g[y][x][d])continue;if(lv.t&&lv.t[bb][a]===2)continue;if(mode==='bean'&&a===lv.giant.x&&bb===lv.giant.y)continue;
      const w=mode==='bean'?(G.creakSet.has(nk)?100:1):1;const nc=c+w;if(dist[nk]!=null&&dist[nk]<=nc)continue;dist[nk]=nc;prev[nk]=[k,d];Q.push([nc,a,bb]);}}return null;},[to,mode]);
const report=[];
for(const dv of diffs){await p.evaluate(v=>window.__T.setDiff(v),dv);
for(const w of worlds)for(const l of levels){await p.evaluate(([w,l])=>window.__start(w,l),[w,l]);await p.waitForTimeout(500);await p.waitForFunction(w=>window.__G()&&window.__G().w===w,w);
  const id=await p.evaluate(()=>window.__G().W.id);const t0=Date.now();let note='';
  const goal=await p.evaluate(()=>[window.__G().lv.goal.x,window.__G().lv.goal.y]);
  if(id==='hansel'){await press(await route(goal),30);note='back='+await p.evaluate(()=>window.__G().hgBack);await press(await route([0,0]),30);}
  if(id==='pigs'){for(let g=0;g<20&&!(await p.isVisible('#win'));g++){const tgt=await p.evaluate(()=>{const G=window.__G();if(G.carry>=G.cfg.carry||!G.bricksLeft.length)return [G.lv.goal.x,G.lv.goal.y];
      const s=G.bricksLeft.slice().sort((a,b)=>Math.abs(a.x-G.p.x)+Math.abs(a.y-G.p.y)-Math.abs(b.x-G.p.x)-Math.abs(b.y-G.p.y));return [s[0].x,s[0].y];});await press(await route(tgt),25);}
    note='hits '+await p.evaluate(()=>window.__G().hits||0)+' wolf '+await p.evaluate(()=>window.__G().wolfUsed+'/'+window.__G().lv.wolfSteps);}
  if(id==='beanstalk'){const egg=await p.evaluate(()=>[window.__G().lv.egg.x,window.__G().lv.egg.y]);await press(await route(egg,'bean'),30);await press(await route([0,0],'bean'),30);
    note='noise '+await p.evaluate(()=>window.__G().noise+'/'+window.__G().lv.limit)+' hits '+await p.evaluate(()=>window.__G().hits||0);}
  if(id==='thorns'){const r=await route(goal);for(const d of r){for(let k=0;k<2;k++){const cut=await p.evaluate(d=>{const G=window.__G(),DV=[[0,-1],[1,0],[0,1],[-1,0]],x=G.p.x+DV[d][0],y=G.p.y+DV[d][1];return G.lv.t[y][x]===1&&!G.cuts[x+','+y];},d);
        await p.keyboard.press(K[d]);await p.waitForTimeout(110);if(!cut)break;}}
    note='hits '+await p.evaluate(()=>window.__G().hits||0);}
  await p.waitForTimeout(500);const won=await p.isVisible('#win');
  report.push(`${id} d${dv} L${l+1} n=${await p.evaluate(()=>window.__G().lv.n)}: ${won?'WON':'NOT WON'} ${note} ${((Date.now()-t0)/1000).toFixed(1)}s`);
  if(won)await p.click('#winMap');else await p.evaluate(()=>document.getElementById('fsExit').click());await p.waitForTimeout(150);}}
console.log(report.join('\n'));console.log('errors',errs);await b.close();})();
