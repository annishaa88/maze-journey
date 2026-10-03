/* ================= collection ================= */
let collTab='stick',medalSel=null;
function renderColl(){
  document.getElementById('stickSec').hidden=collTab!=='stick';document.getElementById('medalSec').hidden=collTab!=='medal';
  document.getElementById('tabStick').setAttribute('aria-pressed',collTab==='stick');document.getElementById('tabMedal').setAttribute('aria-pressed',collTab==='medal');
  document.getElementById('medalCount').textContent=medalsHave.size+'/'+MEDALS.length;
  document.getElementById('stickerCount').textContent=regCount()+'/'+WORLDS.length*6;
  // medals: small tiles, the ones she has first; a tap explains the rest
  const mw=document.getElementById('medals');mw.innerHTML='';
  MEDALS.slice().sort((a,b)=>(medalsHave.has(b.id)?1:0)-(medalsHave.has(a.id)?1:0)).forEach(m=>{const on=medalsHave.has(m.id);const el=document.createElement('button');el.type='button';el.className='medal'+(on?'':' off')+(medalSel===m.id?' sel':'');
    el.innerHTML='<i></i><b></b><small></small>';el.querySelector('i').textContent=m.icon;el.querySelector('b').textContent=m.name;
    el.querySelector('small').textContent=on?'✓':Math.min(m.have(),m.need)+'/'+m.need;
    el.onclick=()=>{medalSel=m.id;renderColl();};mw.appendChild(el);});
  const info=document.getElementById('medalInfo'),ms=MEDALS.find(m=>m.id===medalSel);info.hidden=!ms;
  if(ms)info.textContent=ms.icon+' '+ms.name+': '+ms.desc+(medalsHave.has(ms.id)?' · ✓ יש לך!':' · עד עכשיו '+Math.min(ms.have(),ms.need)+' מתוך '+ms.need);
  // stickers: one folding album per region, a short row per world
  document.getElementById('stickerBar').style.width=(100*regCount()/(WORLDS.length*6))+'%';
  const al=document.getElementById('albums');al.innerHTML='';const last=load('journey_last',null),lastReg=last?regionOf(last[0]):0;
  REGIONS.forEach((Rg,ri)=>{const d=document.createElement('details');d.className='reg-album';if(ri===lastReg)d.open=true;
    const got=Rg.worlds.reduce((a,w)=>a+WORLDS[w].stickers.filter((_,l)=>stickers.has(w+'-'+l)).length,0);
    const sm=document.createElement('summary');sm.style.background=Rg.bg;sm.append(Rg.icon+' '+Rg.name+' ');const c=document.createElement('small');c.textContent=got+'/'+Rg.worlds.length*6+(got===Rg.worlds.length*6?' 👑':'');sm.appendChild(c);d.appendChild(sm);
    Rg.worlds.forEach(w=>{const W=WORLDS[w],row=document.createElement('div');row.className='srow';row.appendChild(iconCanvas(15,W.goal));
      const nm=document.createElement('div');nm.className='sname';nm.textContent=W.name;row.appendChild(nm);
      const grid=document.createElement('div');grid.className='stickers';
      WORLDS[w].stickers.forEach((e,l)=>{const c=document.createElement('div');const have=stickers.has(w+'-'+l);c.className='sticker '+(have?'have':'miss ghost');c.textContent=e;c.title=have?'':'המדבקה מוחבאת בשלב '+(l+1);if(!have){const n=document.createElement('small');n.textContent=l+1;c.appendChild(n);}grid.appendChild(c);});
      row.appendChild(grid);d.appendChild(row);});
    al.appendChild(d);});
  const rs=document.createElement('details');rs.className='reg-album';
  const sm=document.createElement('summary');sm.style.background='linear-gradient(100deg,#ffd166,#f4a261,#e76f51)';sm.textContent='🎁 מדבקות נדירות · '+RARE.filter((_,i)=>stickers.has('r-'+i)).length+'/8';rs.appendChild(sm);
  const rg=document.createElement('div');rg.className='stickers';rg.style.gridTemplateColumns='repeat(8,minmax(0,1fr))';
  RARE.forEach((e,i)=>{const c=document.createElement('div');const have=stickers.has('r-'+i);c.className='sticker '+(have?'have':'miss');c.textContent=have?e:'🎁';rg.appendChild(c);});
  rs.appendChild(rg);al.appendChild(rs);
}
document.getElementById('tabStick').onclick=()=>{collTab='stick';renderColl();};
document.getElementById('tabMedal').onclick=()=>{collTab='medal';renderColl();};
document.getElementById('collOpen').onclick=()=>{document.getElementById('mapScreen').hidden=true;document.getElementById('collScreen').hidden=false;renderColl();window.scrollTo(0,0);};
document.getElementById('collBack').onclick=()=>{document.getElementById('collScreen').hidden=true;document.getElementById('mapScreen').hidden=false;renderMap();window.scrollTo(0,0);};
