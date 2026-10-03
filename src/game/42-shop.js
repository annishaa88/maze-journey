/* ================= shop ================= */
function openChars(){return CHARS.filter(charOpen);}
function renderShop(){
  const C=curChar(),o=outfitOf(C),have=coins();
  document.getElementById('wallet').textContent='⭐ '+have;
  const bc=document.getElementById('bigChar').getContext('2d');bc.clearRect(0,0,340,340);drawChar(bc,C,170,185,110);
  document.getElementById('charName').textContent=C.name;
  const lr=document.getElementById('lockedChars');lr.innerHTML='';
  // the next friends to meet, then the rest as mystery shadows
  const order=REGIONS.flatMap(r=>r.worlds),locked=CHARS.filter(c=>!charOpen(c)).sort((a,b)=>order.indexOf(a.unlock)-order.indexOf(b.unlock));
  const shadow=ch=>(c,x,y,r)=>{ch.draw(c,x,y,r);c.globalCompositeOperation='source-atop';c.fillStyle=night?'#6c6390':'#b9b0d4';c.fillRect(0,0,9999,9999);c.globalCompositeOperation='source-over';};
  const nf=document.getElementById('nextFriends');nf.innerHTML='';nf.hidden=!locked.length;
  if(locked.length){const h=document.createElement('h3');h.textContent='🔒 החברים הבאים';nf.appendChild(h);const row=document.createElement('div');row.className='nf-row';
    locked.slice(0,3).forEach(c=>{const d=document.createElement('div');d.className='nf';d.appendChild(iconCanvas(52,shadow(c)));const q=document.createElement('b');q.textContent='?';d.appendChild(q);
      const t=document.createElement('span');t.textContent='מסיימים את '+WORLDS[c.unlock].name;d.appendChild(t);row.appendChild(d);});nf.appendChild(row);}
  const rest=locked.slice(3);document.querySelector('.locked-box').hidden=!rest.length;document.getElementById('lockedSum').textContent='✨ עוד '+rest.length+' חברים מחכים לך במסע';
  rest.forEach(c=>{const d=document.createElement('div');d.appendChild(iconCanvas(34,shadow(c)));d.title='מסיימים את '+WORLDS[c.unlock].name;d.appendChild(document.createTextNode(WORLDS[c.unlock].short));lr.appendChild(d);});
  const slots=document.getElementById('slots');slots.innerHTML='';
  SLOTS.forEach(S=>{
    const sec=document.createElement('section');sec.className='slot';sec.innerHTML='<h3></h3><div class="items"></div>';
    sec.querySelector('h3').textContent=S.name;const grid=sec.querySelector('.items');
    ITEMS.filter(i=>i.slot===S.id).forEach(I=>{
      const owned=shop.owned.includes(I.id),on=o[S.id]===I.id;
      const card=document.createElement('div');card.className='item'+(on?' on':'');
      const cv2=document.createElement('canvas');cv2.width=128;cv2.height=128;drawChar(cv2.getContext('2d'),C,64,70,40,{[S.id]:I.id});
      const nm=document.createElement('span');nm.textContent=I.name;
      const b=document.createElement('button');b.type='button';b.id='item-'+I.id;
      if(!owned){
        if(have>=I.price){b.className='buy';b.textContent='⭐ '+I.price+' · לקנות';
          b.onclick=()=>{shop.spent+=I.price;shop.owned.push(I.id);(shop.equip[C.id]=shop.equip[C.id]||{})[S.id]=I.id;saveShop();setTimeout(checkMedals,400);
            [660,880,1100].forEach((f,i)=>setTimeout(()=>beep(f,.12),i*90));renderShop();};}
        else{b.textContent='חסרים '+(I.price-have)+' ⭐';b.disabled=true;}
      }else if(on){b.textContent='להוריד';b.onclick=()=>{delete shop.equip[C.id][S.id];saveShop();renderShop();};}
      else{b.textContent='ללבוש';b.onclick=()=>{(shop.equip[C.id]=shop.equip[C.id]||{})[S.id]=I.id;saveShop();beep(880,.1);renderShop();};}
      card.append(cv2,nm,b);grid.appendChild(card);
    });
    slots.appendChild(sec);
  });
}
function cycleChar(step){const list=openChars();let i=list.findIndex(c=>c.id===curChar().id);i=(i+step+list.length)%list.length;charId=list[i].id;save('journey_char',charId);renderShop();}
document.getElementById('prevChar').onclick=()=>cycleChar(-1);
document.getElementById('nextChar').onclick=()=>cycleChar(1);
document.getElementById('shopOpen').onclick=()=>{document.getElementById('mapScreen').hidden=true;document.getElementById('shopScreen').hidden=false;renderShop();window.scrollTo(0,0);};
document.getElementById('shopBack').onclick=()=>{document.getElementById('shopScreen').hidden=true;document.getElementById('mapScreen').hidden=false;renderMap();window.scrollTo(0,0);};
