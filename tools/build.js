// build: src → dist/game.html (minified, published), dist/page.html (readable + test hooks), dist/app/ (offline app)
const fs=require('fs'),path=require('path'),{minify}=require('terser');
const ROOT=path.join(__dirname,'..'),DIST=path.join(ROOT,'dist');
const {assemble}=require('./assemble');
// test hooks: expose internals to the test page only
function testPage(s){
  const hook=(a,b)=>{if(!s.includes(a))throw new Error('hook point missing: '+a);s=s.replace(a,b);};
  hook('function win(){','window.__win=()=>win();window.__start=(w,l)=>startLevel(w,l);window.__G=()=>G;window.__D={drawChar,CHARS,drawCrown};window.__T={WORLDS,GEN,tune,setDiff:v=>{diff=v;},place:()=>placeBomb(),clue:(v,g)=>clueExpr(v,g)};function win(){');
  hook('function bWin(){','window.__B={bCheck,bSolve,bLevel,bEncode,bDecode,get ed(){return bEd;}};function bWin(){');
  return s;}
async function shrink(s){
  const re=/<script>([\s\S]*?)<\/script>/g;let m,out='',last=0;
  while((m=re.exec(s))){out+=s.slice(last,m.index);const r=await minify(m[1],{compress:{passes:2},mangle:true,format:{comments:false,ascii_only:false}});out+='<script>'+r.code+'</script>';last=re.lastIndex;}
  out+=s.slice(last);
  out=out.replace(/<style>([\s\S]*?)<\/style>/g,(_,css)=>'<style>'+css.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s*\n\s*/g,'').replace(/\s*([{};:,>])\s*/g,'$1').replace(/;}/g,'}')+'</style>');
  return out.replace(/<!--[\s\S]*?-->/g,'').replace(/>\s*\n\s*</g,'><');}
(async()=>{
  fs.mkdirSync(DIST,{recursive:true});
  const s=assemble();
  fs.writeFileSync(path.join(DIST,'journey.src.html'),s);
  fs.writeFileSync(path.join(DIST,'page.html'),testPage(s));
  const out=await shrink(s);fs.writeFileSync(path.join(DIST,'game.html'),out);
  console.log('game',s.length,'→',out.length,'bytes');
  if(process.argv.includes('--app'))require('./pwa').buildApp(out,path.join(DIST,'app'),path.join(ROOT,'assets/app'));
})().catch(e=>{console.error(e);process.exit(1);});
