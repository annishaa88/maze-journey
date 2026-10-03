/* ================= numbers land: questions by school grade (0 = כיתה א … 5 = כיתה ו) ================= */
var MATH=(function(){
const GRADES=['א','ב','ג','ד','ה','ו'];
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const round2=v=>Math.round(v*100)/100;
function fmt(v){v=round2(v);return (v<0?'-':'')+String(Math.abs(v));}
function isPrime(v){if(v<2||!Number.isInteger(v))return false;for(let i=2;i*i<=v;i++)if(v%i===0)return false;return true;}
// two wrong answers close to the right one (and never equal to it or to what is already on screen)
function wrongs(ans,deltas,opt){
  opt=opt||{};const out=[];
  for(const d of deltas){const v=round2(ans+d);if(v===ans||out.includes(v))continue;if(!opt.neg&&v<0)continue;if(opt.avoid&&opt.avoid.includes(v))continue;out.push(v);}
  // keep the two most tempting, in random order
  const two=out.slice(0,4).sort(()=>Math.random()-.5).slice(0,2);
  while(two.length<2){const v=round2(ans+ri(2,9)*(Math.random()<.5?-1:1));if(v!==ans&&!two.includes(v)&&(opt.neg||v>=0))two.push(v);}
  return two;
}
const SAY={'+':' ועוד ','-':' פחות ','×':' כפול ','÷':' חלקי ','²':' בריבוע','³':' בשלישית','%':' אחוז'};
function say(expr){return expr.replace(/[+\-×÷²³%]/g,m=>SAY[m]).replace(/\(([^)]+)\)/g,'$1').replace(/= \?/,'').replace(/\s+/g,' ').trim();}

/* --- counting on: "9, 12, 15, ?" --- */
function seqStart(g){
  if(g===0){const st=pick([1,2]);return {step:st,list:[ri(0,6)].map(v=>v*st)};}
  if(g===1){const st=pick([2,5,10]);return {step:st,list:[st*ri(0,5)]};}
  if(g===2){const st=pick([3,4,25,50]);return {step:st,list:[st*ri(1,6)]};}
  if(g===3){const st=pick([6,7,8,9,25,-4]);return {step:st,list:[st<0?ri(60,90):st*ri(2,8)]};}
  if(g===4){const st=pick([0.5,0.25,1.5,12,-7]);return {step:st,list:[st<0?ri(60,99):st===12?12*ri(2,6):ri(0,5)]};}
  const st=pick([15,25,75,0.2,-25]);return {step:st,list:[st===-25?25*ri(10,16):st<1?ri(0,3):st*ri(2,6)]};
}
function seqQ(g,S){
  // a counting-down run starts over high up before it would reach below zero
  if(S.step<0&&S.list[S.list.length-1]+3*S.step-10<0)S.list=[round2(-S.step*ri(10,14))];
  while(S.list.length<3)S.list.push(round2(S.list[S.list.length-1]+S.step));
  const shown=S.list.slice(-3),ans=round2(shown[2]+S.step);
  const small=Math.abs(S.step)<1?0.5:1;
  const w=wrongs(ans,Math.abs(S.step)<1?[small,-small,S.step,2*S.step,-2*S.step,1,-1]:[small,-small,S.step,2*S.step,-2*S.step,10,-10],{avoid:shown});
  S.list.push(ans);
  return {kind:'seq',label:'מה המספר הבא?',expr:shown.map(fmt).join(', ')+', ?',say:'מה המספר הבא? '+shown.map(fmt).join(', '),ans,wrong:w};
}
/* --- exercises --- */
function exQ(g){
  let expr,ans,deltas,neg=false;
  const t=Math.random();
  if(g===0){
    if(t<.6){const a=ri(1,9),b=ri(1,9);expr=a+' + '+b;ans=a+b;}
    else{const a=ri(5,18),b=ri(1,Math.min(9,a-1));expr=a+' - '+b;ans=a-b;}
    deltas=[1,-1,2,-2];
  }else if(g===1){
    if(t<.4){const a=ri(12,59),b=ri(5,Math.min(39,99-a));expr=a+' + '+b;ans=a+b;}
    else if(t<.75){const a=ri(30,99),b=ri(5,a-5);expr=a+' - '+b;ans=a-b;}
    else{const a=pick([2,5,10]),b=ri(1,10);expr=b+' × '+a;ans=a*b;}
    deltas=[1,-1,10,-10,2];
  }else if(g===2){
    if(t<.45){const a=ri(2,10),b=ri(2,10);expr=a+' × '+b;ans=a*b;deltas=[a,-a,b,1,-1];}
    else if(t<.75){const b=ri(2,10),q=ri(2,10);expr=(b*q)+' ÷ '+b;ans=q;deltas=[1,-1,2,-2,b];}
    else{const a=10*ri(10,60),b=10*ri(5,39);if(Math.random()<.5){expr=a+' + '+b;ans=a+b;}else{const hi=Math.max(a,b),lo=Math.min(a,b);expr=hi+' - '+lo;ans=hi-lo;}deltas=[10,-10,100,-100];}
  }else if(g===3){
    if(t<.35){const a=ri(11,49),b=ri(3,9);expr=a+' × '+b;ans=a*b;deltas=[b,-b,10,-10,a];}
    else if(t<.65){const b=ri(3,9),q=ri(12,60);expr=(b*q)+' ÷ '+b;ans=q;deltas=[1,-1,2,-2,10];}
    else if(t<.85){const a=ri(120,780),b=ri(100,999-a>100?999-a:100);expr=a+' + '+b;ans=a+b;deltas=[10,-10,100,-100,1];}
    else{const a=ri(300,999),b=ri(100,a-50);expr=a+' - '+b;ans=a-b;deltas=[10,-10,100,-100,1];}
  }else if(g===4){
    if(t<.35){const a=ri(2,20),b=ri(2,9),c=ri(2,9);expr=a+' + '+b+' × '+c;ans=a+b*c;deltas=[(a+b)*c-ans,1,-1,b,-b];}
    else if(t<.65){const a=ri(1,9)+pick([.5,.25,.75]),b=pick([.5,.25,1.5,2.25]);if(Math.random()<.5){expr=fmt(a)+' + '+fmt(b);ans=round2(a+b);}else{const hi=Math.max(a,b),lo=Math.min(a,b);expr=fmt(hi)+' - '+fmt(lo);ans=round2(hi-lo);}deltas=[.5,-.5,.25,-.25,1];}
    else{const a=ri(11,19),b=ri(11,15);expr=a+' × '+b;ans=a*b;deltas=[10,-10,a,b,1];}
  }else{
    if(t<.3){const a=ri(2,12),b=ri(2,9),c=ri(2,9);expr='('+a+' + '+b+') × '+c;ans=(a+b)*c;deltas=[a+b*c-ans,c,-c,1,-1];}
    else if(t<.55){const p=pick([10,20,25,50,75]),base=pick([40,60,80,120,200,400]);ans=p*base/100;
      return {kind:'ex',label:'כמה זה?',expr:p+'% מ־'+base,textExpr:true,say:'כמה זה '+p+' אחוז מ־'+base+'?',ans,wrong:wrongs(ans,[p,-5,5,10,-10])};}
    else if(t<.8){const a=ri(1,9)+pick([.5,.25]),b=ri(2,8);expr=fmt(a)+' × '+b;ans=round2(a*b);deltas=[.5,-.5,1,-1,b];}
    else{const a=ri(101,399),b=ri(3,9);expr=a+' × '+b;ans=a*b;deltas=[10,-10,b,-b,100];}
  }
  return {kind:'ex',label:'כמה זה?',expr:expr+' = ?',say:'כמה זה '+say(expr)+'?',ans:round2(ans),wrong:wrongs(round2(ans),deltas,{neg})};
}
/* --- number rules: step only on the number that fits --- */
const RULES=[
  [['מספר זוגי',v=>v%2===0,[1,20]],['מספר אי־זוגי',v=>v%2===1,[1,20]]],
  [['מספר זוגי',v=>v%2===0,[10,99]],['מספר אי־זוגי',v=>v%2===1,[10,99]]],
  [['כפולה של 3',v=>v%3===0,[10,60]],['כפולה של 4',v=>v%4===0,[10,60]],['כפולה של 5',v=>v%5===0,[10,80]]],
  [['מספר שמתחלק ב־3',v=>v%3===0,[20,120]],['כפולה של 7',v=>v%7===0,[20,100]],['כפולה של 8',v=>v%8===0,[20,100]],['מספר שמתחלק ב־9',v=>v%9===0,[20,150]]],
  [['מספר שמתחלק ב־4',v=>v%4===0,[40,400]],['מספר שמתחלק ב־9',v=>v%9===0,[40,400]],['מספר שמתחלק ב־6',v=>v%6===0,[40,300]]],
  [['מספר ראשוני',isPrime,[10,60]],['מספר שמתחלק ב־12',v=>v%12===0,[40,200]],['מספר שמתחלק ב־8',v=>v%8===0,[40,200]]]
];
function propQ(g){
  const [name,ok,[lo,hi]]=pick(RULES[g]);
  let ans;do{ans=ri(lo,hi);}while(!ok(ans));
  const w=[];let guard=0;while(w.length<2&&guard++<500){const v=ri(Math.max(lo,ans-15),Math.min(hi,ans+15));if(!ok(v)&&!w.includes(v))w.push(v);}
  return {kind:'prop',label:'עולים רק על',expr:name,rule:name,say:'עולים רק על '+name,ans,wrong:w,textExpr:true};
}
/* --- exact wallet --- */
const COINS=[[1,2,5],[1,2,5,10],[5,10,20],[10,20,50,100],[0.5,1,2,5],[5,10,20,50,100,200]];
function wallet(g,count,extra){
  const den=COINS[g];const need=Array.from({length:count},()=>pick(den));
  const target=round2(need.reduce((a,b)=>a+b,0));
  const more=Array.from({length:extra},()=>pick(den));
  return {target,values:[...need,...more].sort(()=>Math.random()-.5)};
}
function questions(kind,g,count){
  const out=[],S=seqStart(g);
  const kinds=kind==='mix'?['seq','ex','prop','ex','seq','prop','ex','ex','seq','prop']:Array(count).fill(kind);
  const seen=new Set();
  for(let i=0;i<count;i++){const k=kinds[i%kinds.length];let q,tries=0;
    do{q=k==='seq'?seqQ(g,S):k==='ex'?exQ(g):propQ(g);}while(k!=='seq'&&seen.has(q.expr+'|'+q.ans)&&++tries<30);
    seen.add(q.expr+'|'+q.ans);out.push(q);}
  return out;
}
return {GRADES,questions,wallet,fmt,isPrime,RULES};
})();

let grade=load('journey_grade',3);
