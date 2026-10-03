(function(){
const DV=GEN.DV;
const DIRN={up:0,right:1,down:2,left:3};

/* emoji drawn on the canvas take their see-through-ness from the last fill colour; keep pictures solid unless globalAlpha says otherwise */
(function(){const P=CanvasRenderingContext2D.prototype,F=P.fillText,re=/\p{Extended_Pictographic}/u;
  // a shrinking sparkle can dip below zero for a frame; draw nothing instead of stopping with an error
  const A=P.arc,E=P.ellipse;P.arc=function(x,y,r,a0,a1,cc){return A.call(this,x,y,r>0?r:0,a0,a1,cc);};P.ellipse=function(x,y,rx,ry,rot,a0,a1,cc){return E.call(this,x,y,rx>0?rx:0,ry>0?ry:0,rot,a0,a1,cc);};
  P.fillText=function(t,x,y,m){if(typeof t==='string'&&re.test(t)&&!/^#[0-9a-f]{6}$/i.test(String(this.fillStyle))){const f=this.fillStyle;this.fillStyle='#000';F.call(this,t,x,y,m);this.fillStyle=f;return;}return m===undefined?F.call(this,t,x,y):F.call(this,t,x,y,m);};})();
/* each player keeps her own journey: her keys get a prefix, the first player keeps the plain ones */
const SHARED_KEYS=new Set(['journey_family','journey_profiles','journey_cur','journey_mute','journey_night','journey_voice']);
function rawGet(k){try{const v=localStorage.getItem(k);return v==null?null:JSON.parse(v);}catch(e){return null;}}
function rawSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
let profiles=rawGet('journey_profiles')||[{id:0,name:'אני'}];
let curProf=rawGet('journey_cur')||0;if(!profiles.some(p=>p.id===curProf))curProf=0;
function profKey(id,k){return id&&!SHARED_KEYS.has(k)?'p'+id+'_'+k:k;}
function load(k,d){const v=rawGet(profKey(curProf,k));return v==null?d:v;}
function save(k,v){rawSet(profKey(curProf,k),v);}
