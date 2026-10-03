// faster offline search: states are numbers, the lot is a small typed grid
const N=6,ROW=2;const rnd=k=>Math.floor(Math.random()*k);
const old=JSON.parse(require('fs').readFileSync(__dirname+'/pk_bank.json','utf8'));const bank={};for(const k in old)bank[k]=old[k].slice();
const t0=Date.now(),LIMIT=+process.argv[2]||90000;let lots=0;
while(Date.now()-t0<LIMIT){lots++;
  const ncars=8+rnd(6),trucks=.15+Math.random()*.3;const H=[1],L=[2],F=[ROW],P0=[N-2];  // fixed coordinate (row for horizontal, column for vertical) and moving position
  const occ0=new Uint8Array(36);const put=(h,len,f,p,v)=>{for(let k=0;k<len;k++)occ0[h?f*6+p+k:(p+k)*6+f]=v;};put(1,2,ROW,N-2,1);
  for(let a=0;a<150&&H.length<ncars;a++){const h=Math.random()<.5?1:0,len=Math.random()<trucks?3:2,f=rnd(N),p=rnd(N-len+1);if(h&&f===ROW)continue;let ok=true;for(let k=0;k<len;k++)if(occ0[h?f*6+p+k:(p+k)*6+f]){ok=false;break;}if(!ok)continue;put(h,len,f,p,1);H.push(h);L.push(len);F.push(f);P0.push(p);}
  const C=H.length,B=5,enc=a=>{let v=0;for(let i=C-1;i>=0;i--)v=v*B+a[i];return v;},dec=(v,a)=>{for(let i=0;i<C;i++){a[i]=v%B;v=Math.floor(v/B);}};
  const occ=new Uint8Array(36),cur=new Int8Array(C);
  const fill=a=>{occ.fill(0);for(let i=0;i<C;i++)for(let k=0;k<L[i];k++)occ[H[i]?F[i]*6+a[i]+k:(a[i]+k)*6+F[i]]=1;};
  const nbrs=(a,cb)=>{fill(a);for(let i=0;i<C;i++){const p=a[i];for(let q=p-1;q>=0;q--){if(occ[H[i]?F[i]*6+q:q*6+F[i]])break;a[i]=q;cb(enc(a));}a[i]=p;
      for(let q=p+L[i];q<N;q++){if(occ[H[i]?F[i]*6+q:q*6+F[i]])break;a[i]=q-L[i]+1;cb(enc(a));}a[i]=p;}};
  const start=enc(Int8Array.from(P0)),seen=new Map([[start,-1]]),list=[start];
  for(let h=0;h<list.length&&list.length<200000;h++){dec(list[h],cur);nbrs(cur,k=>{if(!seen.has(k)){seen.set(k,-1);list.push(k);}});}
  const q=[];for(const s of list)if(s%B===N-2){seen.set(s,0);q.push(s);}
  for(let h=0;h<q.length;h++){const d=seen.get(q[h]);dec(q[h],cur);nbrs(cur,k=>{if(seen.get(k)===-1){seen.set(k,d+1);q.push(k);}});}
  let far=-1,fd=0;for(const s of list){const d=seen.get(s);if(d>fd&&s%B<N-2){fd=d;far=s;}}
  const pick=[];if(far>=0)pick.push([far,fd]);
  for(const off of [2,4,6]){const c=list.filter(s=>seen.get(s)===fd-off&&s%B<N-2);if(c.length)pick.push([c[rnd(c.length)],fd-off]);}
  for(const [s,d] of pick){if(d<1)continue;dec(s,cur);const g=new Array(36).fill('.');for(let i=0;i<C;i++)for(let k=0;k<L[i];k++)g[H[i]?F[i]*6+cur[i]+k:(cur[i]+k)*6+F[i]]=String.fromCharCode(65+i);
    const e=g.join('');(bank[d]=bank[d]||[]);if(bank[d].length<16&&!bank[d].includes(e))bank[d].push(e);}
}
const ks=Object.keys(bank).map(Number).sort((a,b)=>a-b);console.error('lots',lots,ks.map(k=>k+':'+bank[k].length).join(' '));
require('fs').writeFileSync(__dirname+'/pk_bank.json',JSON.stringify(bank));
