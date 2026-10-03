/* ================= English, Hebrew and logic questions by school grade (0 = כיתה א … 5 = כיתה ו) ================= */
var WORDS=(function(){
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
// two wrong options from a pool, never equal to the answer or each other
function others(ans,pool){return shuf(pool.filter(v=>v!==ans)).filter((v,i,a)=>a.indexOf(v)===i).slice(0,2);}
function Q(label,prompt,dir,say,ans,wrong){return {label,prompt,dir,say,ans,wrong};}

/* ---------- English ---------- */
const EN1=[['🐱','cat'],['🐶','dog'],['☀️','sun'],['🍎','apple'],['🐟','fish'],['🏠','house'],['🚗','car'],['🌳','tree'],['⭐','star'],['🐄','cow'],['🥚','egg'],['🐝','bee'],['⚽','ball'],['🍌','banana'],['🐷','pig'],['📖','book'],['🌙','moon'],['🐸','frog'],['🦁','lion'],['🐭','mouse'],['🍰','cake'],['👶','baby'],['🐔','hen'],['🎩','hat']];
const EN2=[['🐘','elephant'],['🌈','rainbow'],['🍕','pizza'],['🚲','bike'],['✈️','plane'],['🐢','turtle'],['🌸','flower'],['🐰','rabbit'],['🐴','horse'],['🍋','lemon'],['🧀','cheese'],['🕐','clock'],['🐍','snake'],['🦆','duck'],['🥕','carrot'],['🐒','monkey'],['🍉','watermelon'],['🦋','butterfly'],['🏫','school'],['🚌','bus'],['🧦','socks'],['👑','crown'],['🦒','giraffe'],['🐧','penguin'],['🍞','bread']];
const COLORS=[['🔴','red'],['🔵','blue'],['🟢','green'],['🟡','yellow'],['🟣','purple'],['🟠','orange'],['⚫','black'],['⚪','white'],['🟤','brown']];
const NUMW=['zero','one','two','three','four','five','six','seven','eight','nine','ten'];
const OPP_EN=[['big','small'],['hot','cold'],['up','down'],['happy','sad'],['fast','slow'],['old','new'],['day','night'],['open','closed'],['tall','short'],['wet','dry'],['full','empty'],['in','out'],['good','bad'],['light','dark'],['long','short'],['first','last'],['early','late']];
const GRAM1=[['I ___ happy.','am',['is','are']],['She ___ my friend.','is',['am','are']],['They ___ at school.','are',['is','am']],['The cat ___ black.','is',['are','am']],['We ___ in the park.','are',['is','am']],['He ___ a dog.','has',['have','are']],['I ___ two cats.','have',['has','is']],['one mouse, two ___','mice',['mouses','mouse']],['one child, two ___','children',['childs','child']],['one box, two ___','boxes',['boxs','box']],['one foot, two ___','feet',['foots','feets']]];
const GRAM2=[['Yesterday I ___ to the park.','went',['go','goes']],['Last night she ___ a book.','read',['reads','reading']],['He ___ pizza yesterday.','ate',['eat','eats']],['We ___ a movie last week.','saw',['see','sees']],['big, bigger, ___','biggest',['bigest','more big']],['good, better, ___','best',['goodest','gooder']],['___ is your name?','What',['Where','When']],['___ do you live?','Where',['What','Who']],['___ is your birthday?','When',['Who','Where']],['I can ___ fast.','run',['runs','running']],['She is ___ than me.','taller',['tall','tallest']],['There ___ three apples.','are',['is','am']]];
const enWords=g=>g<=1?EN1:g<=3?EN1.concat(EN2):EN2;
function enPic(g){const L=enWords(g),[e,w]=pick(L);return Q('מה המילה באנגלית?',e,'ltr','איך אומרים את זה באנגלית?',w,others(w,L.map(x=>x[1])));}
function enWord2Pic(g){const L=enWords(g),[e,w]=pick(L);const q=Q('איזו תמונה מתאימה למילה?',w,'ltr','איזו תמונה מתאימה למילה?',e,others(e,L.map(x=>x[0])));q.en=w;return q;}
// for grades א–ב: hear/see the English word and pick the picture, colour or number (no English reading needed)
function enColorPick(){const [e,w]=pick(COLORS);const q=Q('איזה צבע זה?',w,'ltr','איזה צבע זה?',e,others(e,COLORS.map(x=>x[0])));q.en=w;return q;}
function enNumPick(g){const v=ri(1,10);const q=Q('איזה מספר זה?',NUMW[v],'ltr','איזה מספר זה?',String(v),others(String(v),[1,2,3,4,5,6,7,8,9,10].map(String).filter(x=>Math.abs(+x-v)<=3)));q.en=NUMW[v];return q;}
function enSpell(g){
  const L=enWords(g).filter(x=>/^[a-z]+$/.test(x[1])&&x[1].length>=3&&x[1].length<=(g<=1?4:7));const [e,w]=pick(L);
  const i=ri(g<=1?1:0,w.length-1),c=w[i];const vow='aeiou',cons='bcdfghklmnprstvwy';
  const pool=(vow.includes(c)?vow:cons).split('').filter(x=>x!==c);
  const q=Q('איזו אות חסרה?',e+'  '+w.slice(0,i)+'_'+w.slice(i+1),'ltr','איזו אות חסרה במילה?',c,others(c,pool));q.en=w;return q;}
function enColor(){const [e,w]=pick(COLORS);const q=Q('איזה צבע זה באנגלית?',e,'ltr','איזה צבע זה באנגלית?',w,others(w,COLORS.map(x=>x[1])));q.neutral=true;return q;}
function enNumber(g){const v=ri(g===0?1:0,10);return Q('איך כותבים את המספר באנגלית?',String(v),'ltr','איך כותבים '+v+' באנגלית?',NUMW[v],others(NUMW[v],NUMW.filter((_,i)=>Math.abs(i-v)<=3)));}
function oppOf(L,x){return L.filter(p=>p.includes(x)).map(p=>p[0]===x?p[1]:p[0]);}
const ALSO_OPP={dark:['day'],light:['night'],night:['light'],day:['dark']};
function enOpp(){const [a,b]=pick(OPP_EN),[x,y]=Math.random()<.5?[a,b]:[b,a];const no=new Set([x,...oppOf(OPP_EN,x),...(ALSO_OPP[x]||[])]);return Q('מה ההפך?',x+'  ↔  ?','ltr','מה ההפך של '+x,y,others(y,OPP_EN.flat().filter(v=>!no.has(v))));}
function enGram(g){const [s,a,w]=pick(g>=5?GRAM2.concat(GRAM1):GRAM1);return Q('מה משלים את המשפט?',s,'ltr','מה משלים את המשפט?',a,w.slice());}
const EN_KINDS={pic:enPic,word2pic:enWord2Pic,spell:enSpell,color:enColor,number:enNumber,opp:enOpp,gram:enGram,colorPick:enColorPick,numPick:enNumPick};
function enMix(g){return g<=1?['word2pic','colorPick','numPick','word2pic','colorPick']:g<=3?['pic','spell','opp','word2pic','gram']:['gram','opp','spell','pic','gram'];}

/* ---------- Hebrew ---------- */
const HE_FIRST=[['🐶','כלב','קח'],['🌞','שמש','סצ'],['🐱','חתול','כה'],['🍎','תפוח','טד'],['🏠','בית','ופ'],['🌳','עץ','אה'],['🐟','דג','גר'],['⭐','כוכב','קח'],['🐄','פרה','בו'],['🍌','בננה','פו'],['🦁','אריה','עה'],['📖','ספר','שצ'],['🎂','עוגה','אה'],['🐍','נחש','מל'],['🥕','גזר','כק'],['🐢','צב','סז'],['🌷','פרח','בכ'],['🍞','לחם','נר'],['🦊','שועל','סצ'],['🐑','כבשה','קח'],['🚂','רכבת','דו'],['🧸','דובי','בר'],['🐝','דבורה','רט'],['🍉','אבטיח','עה']];
const HE_MISS=[['🐶','כלב',0,'ק','ח'],['🍎','תפוח',0,'ט','ד'],['🌞','שמש',0,'ס','צ'],['🐱','חתול',1,'ט','ד'],['🎂','עוגה',0,'א','ח'],['🍉','אבטיח',2,'ת','ד'],['🐔','תרנגולת',0,'ט','ד'],['🥕','גזר',1,'צ','ס'],['🐫','גמל',2,'נ','ק'],['🧀','גבינה',1,'ו','פ'],['🐍','נחש',1,'כ','ה'],['🚂','רכבת',1,'ק','ח'],['🐑','כבשה',1,'ו','פ'],['🧦','גרב',2,'פ','ק'],['🦓','זברה',0,'ס','צ'],['🍓','תות',2,'ט','ד']];
const HE_PLURAL=[['ילד','ילדים',['ילדות','ילדה']],['שולחן','שולחנות',['שולחנים','שולחנה']],['ספר','ספרים',['ספרה','ספרון']],['כיסא','כיסאות',['כיסאים','כיסות']],['חלון','חלונות',['חלונים','חלונה']],['עיפרון','עפרונות',['עיפרונים','עיפרוני']],['ציפור','ציפורים',['ציפורות','ציפורה']],['שיר','שירים',['שירות','שירה']],['עץ','עצים',['עצות','עצה']],['פרח','פרחים',['פרחות','פרחה']],['מחברת','מחברות',['מחברתים','מחברים']],['בית','בתים',['ביתים','ביתות']],['איש','אנשים',['אישות','איישים']],['אישה','נשים',['אישות','אישים']],['עיר','ערים',['עירות','עירים']],['יום','ימים',['יומות','יומימים']]];
const HE_OPP=[['גדול','קטן'],['חם','קר'],['שמח','עצוב'],['מהר','לאט'],['למעלה','למטה'],['יום','לילה'],['פתוח','סגור'],['ארוך','קצר'],['מלא','ריק'],['חדש','ישן'],['רטוב','יבש'],['כבד','קל'],['רחוק','קרוב'],['חזק','חלש'],['גבוה','נמוך'],['ראשון','אחרון'],['לבן','שחור'],['חכם','טיפש']];
const HE_SYN=[['שמח','עליז'],['עצוב','עגום'],['מהיר','זריז'],['חכם','נבון'],['פחד','חשש'],['להסתכל','להביט'],['יפה','נאה'],['ענק','עצום'],['קטן','זעיר'],['לדבר','לשוחח'],['חבר','ידיד'],['שקט','דממה'],['לצעוק','לזעוק'],['אמיץ','נועז'],['לסיים','לגמור'],['מתנה','שי']];
const HE_SPELL=[['🍎','תפוח',['טפוח','תפוך']],['🐱','חתול',['כתול','חטול']],['📓','מחברת',['מכברת','מחבעת']],['🍉','אבטיח',['אבתיח','עבטיח']],['⚽','כדורגל',['קדורגל','כדורקל']],['🐰','ארנב',['ארנו','ערנב']],['⏰','שעון',['שעונ','סעון']],['🎨','צבעים',['צבעיים','סבעים']],['⭐','כוכב',['קוכב','כוחב']],['🎂','עוגה',['אוגה','עוגע']],['🦋','פרפר',['פרפאר','פרפער']],['🌈','קשת',['כשת','קשתת']],['🐘','פיל',['פילל','פיעל']],['🍫','שוקולד',['סוקולד','שוקולת']]];
const HE_ROOT=[['כתבתי','כ־ת־ב',['כ־ב־ת','ת־ב־י']],['שמרנו','ש־מ־ר',['מ־ר־נ','ש־ר־ו']],['לומדים','ל־מ־ד',['ל־ו־מ','מ־ד־י']],['סיפרה','ס־פ־ר',['ס־י־פ','פ־ר־ה']],['משחקת','ש־ח־ק',['מ־ש־ח','ח־ק־ת']],['נכנסנו','כ־נ־ס',['נ־כ־נ','נ־ס־נ']],['אכלו','א־כ־ל',['כ־ל־ו','א־ל־ו']],['רקדתם','ר־ק־ד',['ק־ד־ת','ר־ד־ם']],['שומרת','ש־מ־ר',['ש־ו־מ','מ־ר־ת']],['מדברים','ד־ב־ר',['מ־ד־ב','ב־ר־י']],['התלבשה','ל־ב־ש',['ה־ת־ל','ת־ל־ב']],['פתחנו','פ־ת־ח',['ת־ח־נ','פ־ח־ו']]];
const HE_TYPE={'פועל':['קופצת','כותבים','שוחה','צוחקת','אוכלים','חושבת','משחקת','רוקדים'],'שם עצם':['שולחן','כלב','עיר','ספר','ים','מחברת','עננים','גשר'],'שם תואר':['יפה','גבוה','מהיר','אדום','חכם','קטנה','עגול','חמים']};
function heFirst(){const [e,w,wr]=pick(HE_FIRST);return Q('באיזו אות מתחילה המילה?',e,'rtl','באיזו אות מתחילה המילה '+w+'?',w[0],wr.split(''));}
function heMissing(){const [e,w,i,a,b]=pick(HE_MISS);return Q('איזו אות חסרה?',e+'  '+w.slice(0,i)+'_'+w.slice(i+1),'rtl','איזו אות חסרה במילה '+w+'?',w[i],[a,b]);}
function hePlural(){const [s,p,w]=pick(HE_PLURAL);return Q('איך אומרים ברבים?',s,'rtl','איך אומרים '+s+' ברבים?',p,w.slice());}
function heOpp(){const [a,b]=pick(HE_OPP),[x,y]=Math.random()<.5?[a,b]:[b,a];const no=new Set([x,...oppOf(HE_OPP,x)]);return Q('מה ההפך?',x+'  ↔  ?','rtl','מה ההפך של '+x+'?',y,others(y,HE_OPP.flat().filter(v=>!no.has(v))));}
function heSyn(){const [a,b]=pick(HE_SYN);const no=new Set([a,...oppOf(HE_SYN,a)]);return Q('איזו מילה אומרת אותו דבר?',a,'rtl','איזו מילה אומרת אותו דבר כמו '+a+'?',b,others(b,HE_SYN.flat().filter(v=>!no.has(v))));}
function heSpell(){const [e,c,w]=pick(HE_SPELL);return Q('איך כותבים נכון?',e,'rtl','איך כותבים נכון את המילה '+c+'?',c,w.slice());}
function heRoot(){const [w,r,wr]=pick(HE_ROOT);return Q('מה השורש?',w,'rtl','מה השורש של המילה '+w+'?',r,wr.slice());}
function heType(){const t=pick(Object.keys(HE_TYPE)),ans=pick(HE_TYPE[t]);const rest=Object.keys(HE_TYPE).filter(k=>k!==t).map(k=>pick(HE_TYPE[k]));
  return Q('איזו מילה היא '+t+'?','🔎','rtl','איזו מילה היא '+t+'?',ans,rest);}
const HE_KINDS={first:heFirst,missing:heMissing,plural:hePlural,opp:heOpp,syn:heSyn,spell:heSpell,root:heRoot,type:heType};
function heMix(g){return g<=1?['first','missing','opp','first','missing']:g<=3?['missing','plural','opp','syn','spell']:['root','syn','type','spell','plural'];}
function heKind(k,g){if(k==='first'&&g>=2)return 'spell';if(k==='plural'&&g===0)return 'first';if(g>=4){if(k==='missing')return 'root';if(k==='opp')return 'syn';}return k;}

/* ---------- logic ---------- */
const SETS=[['🔴','🔵','🟡','🟢'],['🐶','🐱','🐰','🐸'],['⭐','🌙','☀️','☁️'],['🍎','🍌','🍇','🍓'],['🔺','🟦','⚪','🔶']];
function lgPattern(g){
  if(g>=3&&Math.random()<.6){ // number patterns
    let seq,ans,wr,say;const t=g===3?pick(['alt','dbl']):g===4?pick(['dbl','sq','grow']):pick(['fib','sq','grow','dbl']);
    if(t==='alt'){const a=ri(1,5),b=ri(2,4);seq=[a,a+b,a+1,a+1+b,a+2];ans=a+2+b;wr=[ans+1,a+3];}
    else if(t==='dbl'){const a=ri(2,5);seq=[a,a*2,a*4,a*8];ans=a*16;wr=[a*12,a*10];}
    else if(t==='sq'){const a=ri(1,3);seq=[a,a+1,a+2,a+3].map(v=>v*v);ans=(a+4)*(a+4);wr=[ans-1,(a+3)*(a+3)+(a+3)];}
    else if(t==='grow'){const a=ri(1,6);seq=[a,a+1,a+3,a+6];ans=a+10;wr=[a+9,a+12];}
    else{seq=[1,1,2,3,5];ans=8;wr=[7,9];}
    wr=wr.filter((v,i,x)=>v!==ans&&x.indexOf(v)===i);
    return Q('מה ממשיך את הדפוס?',seq.join(', ')+', ?','ltr','מה ממשיך את הדפוס? '+seq.join(', '),ans,wr);}
  const S=shuf(pick(SETS));const pat=g===0?[0,1]:g===1?pick([[0,1,2],[0,0,1]]):pick([[0,1,1],[0,1,2,1],[0,0,1,1],[0,1,2,3]]);
  const len=pat.length*2+ri(0,pat.length-1),seq=[];for(let i=0;i<len;i++)seq.push(S[pat[i%pat.length]]);
  const ans=S[pat[len%pat.length]];const used=[...new Set(pat)].map(i=>S[i]);
  return Q('מה ממשיך את הדפוס?',seq.join(' ')+' ?','ltr','מה ממשיך את הדפוס?',ans,others(ans,used.concat(S)));}
const ODD=[
  [['🍎','🍌','🍇','🍓','🍐','🍊'],['🚗','🐶','⚽','🎈']],
  [['🐶','🐱','🐭','🐰','🦊','🐻'],['🚲','🍎','🌳','📖']],
  [['🚗','🚌','🚲','✈️','🚂','🚀'],['🐟','🍌','🏠','🌙']],
  [['🐟','🐙','🦀','🐬','🐳','🦈'],['🐄','🐔','🦒','🐒']],
  [['☀️','🌧️','❄️','⛅','🌈','⚡'],['🍕','🎸','👟','📚']],
  [['🎸','🥁','🎺','🎻','🎹'],['🍔','🐸','🌻','🧦']]];
const ODD_HARD=[[['🐦','🦆','🦉','🐧','🦜'],['🦇']],[['🐄','🐖','🐑','🐐'],['🐟']],[['⚽','🏀','🏈','🎾'],['🎲']]];
function lgOdd(g){
  if(g>=4&&Math.random()<.5){const nums=g===4?[[2,4,8,10,12],[7]]:[[3,5,7,11,13],[9]];const four=shuf(nums[0]).slice(0,3).concat(nums[1]);const ans=nums[1][0];
    return Q('מי לא שייך?',shuf(four).join('  '),'ltr','איזה מספר לא שייך לשאר?',ans,others(ans,four));}
  const [grp,out]=g>=3&&Math.random()<.5?pick(ODD_HARD):pick(ODD);const three=shuf(grp).slice(0,3),ans=pick(out);
  const shown=shuf(three.concat(ans));return Q('מי לא שייך?',shown.join(' '),'ltr','מי לא שייך לשאר?',ans,others(ans,three));}
const ANA_E=[['🐶','🦴','🐰','🥕'],['🐝','🍯','🐄','🥛'],['☀️','🕶️','🌧️','☂️'],['✏️','📝','🖌️','🎨'],['🐟','🌊','🐦','☁️'],['👟','🦶','🧤','✋']];
const ANA_T=[['כלב','גור','חתול','חתלתול'],['פרה','עגל','סוס','סייח'],['תרנגולת','אפרוח','ברווזה','ברווזון'],['יד','כפפה','רגל','גרב'],['ציפור','קן','דבורה','כוורת'],['עין','לראות','אוזן','לשמוע'],['יום','שמש','לילה','ירח'],['חורף','קר','קיץ','חם'],['דג','מים','ציפור','אוויר'],['עט','לכתוב','מספריים','לגזור'],['רופא','בית חולים','מורה','בית ספר'],['אופה','לחם','נגר','שולחן']];
function lgAnalogy(g){
  if(g<=1){const [a,b,c,d]=pick(ANA_E);return Q('מה מתאים?',a+' → '+b+'   '+c+' → ?','ltr','מה מתאים?',d,others(d,ANA_E.map(x=>x[3])));}
  const [a,b,c,d]=pick(ANA_T);return Q('מה מתאים?',a+' ← '+b+' , '+c+' ← ?','rtl','כמו ש'+a+' הולך עם '+b+', '+c+' הולך עם…?',d,others(d,ANA_T.map(x=>x[3])));}
const MOST=[['מה הכי כבד?','🐘',['🐭','🐱']],['מה הכי מהיר?','✈️',['🐢','🚲']],['מה הכי גבוה?','🦒',['🐶','🐱']],['מה הכי קטן?','🐜',['🐘','🐶']],['מה הכי קר?','🧊',['🔥','☀️']],['מה הכי חם?','🔥',['🧊','⛄']],['מי הכי צעיר?','👶',['👩','👴']],['מה הכי רחוק?','🌙',['🏠','🌳']]];
function lgMost(){const [q,a,w]=pick(MOST);return Q(q,'🤔','ltr',q,a,w.slice());}
const RIDDLES=[['יש לי רגליים, אבל אני לא הולך. מה אני?','שולחן',['כלב','ילד']],['מה אפשר לתפוס, אבל אי אפשר לזרוק?','צינון',['כדור','דג']],['ככל שלוקחים ממני יותר, אני נעשה גדול יותר. מה אני?','בור',['עוגה','ספר']],['יש לי שיניים, אבל אני לא נושך. מה אני?','מסרק',['כלב','כריש']],['אני מלא חורים, ובכל זאת מחזיק מים. מה אני?','ספוג',['דלי','כוס']],['מה נעשה רטוב יותר ככל שהוא מייבש?','מגבת',['שמש','רוח']],['יש לי צוואר, אבל אין לי ראש. מה אני?','בקבוק',['כובע','נעל']],['מה עולה ואף פעם לא יורד?','הגיל',['מעלית','כדור']],['יש לי עמודים, אבל אני לא בניין. מה אני?','ספר',['כיסא','עט']]];
function lgRiddle(){const [q,a,w]=pick(RIDDLES);return Q('חידה',q,'rtl',q,a,w.slice());}
const LG_KINDS={pattern:lgPattern,odd:lgOdd,analogy:lgAnalogy,most:lgMost,riddle:lgRiddle};
function lgMix(g){return g<=1?['pattern','odd','most','analogy','pattern']:g<=3?['pattern','odd','analogy','riddle','most']:['pattern','riddle','odd','analogy','pattern'];}

function questions(world,kind,g,count){
  const out=[],seen=new Set();
  for(let i=0;i<count;i++){let k=kind;
    if(world==='english'){if(kind==='mix')k=enMix(g)[i%5];
      if(g<=1)k={pic:'word2pic',spell:'colorPick',color:'colorPick',number:'numPick',opp:'colorPick',gram:'word2pic'}[k]||k;
      if(k==='word2pic'&&g>=4)k='gram';}
    else if(world==='hebrew'){if(kind==='mix')k=heMix(g)[i%5];k=heKind(k,g);}
    else{if(kind==='mix')k=lgMix(g)[i%5];if(k==='most'&&g>=3)k='riddle';}
    const make=world==='english'?EN_KINDS[k]:world==='hebrew'?HE_KINDS[k]:LG_KINDS[k];
    // never the same question twice in one level
    let q,tries=0;do{q=make(g);}while(seen.has(q.prompt+'|'+q.ans)&&++tries<40);
    seen.add(q.prompt+'|'+q.ans);q.kind=k;out.push(q);}
  return out;
}
return {questions,HE_PLURAL,HE_SPELL,HE_ROOT,HE_TYPE,EN_KINDS,HE_KINDS,LG_KINDS};
})();

