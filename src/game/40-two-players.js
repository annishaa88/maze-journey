/* ================= two players, taking turns on one phone ================= */
let D=null;
const duelSet=Object.assign({p1:'',p2:'',c1:null,c2:null,world:'rand',size:3,rounds:3},load('journey_duel',{}));
function saveDuel(){save('journey_duel',duelSet);}
function openList(){return CHARS.filter(charOpen);}
function pickChar(id,fallbackIdx){const L=openList();return L.find(c=>c.id===id)||L[Math.min(fallbackIdx,L.length-1)];}
function renderDuel(){
  const L=openList();
  const c1=pickChar(duelSet.c1||curChar().id,0),c2=pickChar(duelSet.c2,L.length>1?1:0);duelSet.c1=c1.id;duelSet.c2=c2.id;
  [[1,c1],[2,c2]].forEach(([i,C])=>{const cx=document.getElementById('p'+i+'c').getContext('2d');cx.clearRect(0,0,168,168);drawChar(cx,C,84,92,56);
    document.getElementById('p'+i+'cn').textContent=C.name;const inp=document.getElementById('p'+i+'name');inp.value=duelSet['p'+i];inp.placeholder='שחקנית '+i;});
  const wc=document.getElementById('wchips');wc.innerHTML='';
  const mk=(id,label,bg,draw)=>{const b=document.createElement('button');b.type='button';b.id='wc-'+id;b.style.background=bg;
    if(draw)b.appendChild(iconCanvas(34,draw));else{const e=document.createElement('span');e.style.fontSize='1.6rem';e.textContent='🎲';b.appendChild(e);}
    b.appendChild(document.createTextNode(label));b.setAttribute('aria-pressed',String(duelSet.world)===String(id));
    b.onclick=()=>{duelSet.world=id;saveDuel();renderDuel();};wc.appendChild(b);};
  mk('rand','הפתעה','#6d6384',null);
  WORLDS.forEach((W,w)=>mk(w,W.short,W.hex,W.goal));
  [1,3,5].forEach(v=>{document.getElementById('sz'+v).setAttribute('aria-pressed',duelSet.size===v);document.getElementById('rd'+v).setAttribute('aria-pressed',duelSet.rounds===v);});
}
function cycleDuel(i,step){const L=openList();const key='c'+i;let k=L.findIndex(c=>c.id===duelSet[key]);k=(k+step+L.length)%L.length;duelSet[key]=L[k].id;saveDuel();renderDuel();}
[1,2].forEach(i=>{document.getElementById('p'+i+'prev').onclick=()=>cycleDuel(i,-1);document.getElementById('p'+i+'next').onclick=()=>cycleDuel(i,1);
  document.getElementById('p'+i+'name').addEventListener('input',e=>{duelSet['p'+i]=e.target.value.trim();saveDuel();});});
[1,3,5].forEach(v=>{document.getElementById('sz'+v).onclick=()=>{duelSet.size=v;saveDuel();renderDuel();};document.getElementById('rd'+v).onclick=()=>{duelSet.rounds=v;saveDuel();renderDuel();};});
document.getElementById('duelOpen').onclick=()=>{document.getElementById('mapScreen').hidden=true;document.getElementById('duelScreen').hidden=false;renderDuel();window.scrollTo(0,0);};
document.getElementById('duelBack').onclick=()=>{document.getElementById('duelScreen').hidden=true;document.getElementById('mapScreen').hidden=false;renderMap();window.scrollTo(0,0);};
