// the game ships as one HTML file: src/index.html with each "@include part" line replaced by that part
const fs=require('fs'),path=require('path');const SRC=path.join(__dirname,'../src');
function assemble(){
  return fs.readFileSync(path.join(SRC,'index.html'),'utf8').replace(/^@include (\S+)\n/gm,(_,f)=>fs.readFileSync(path.join(SRC,f),'utf8'));}
module.exports={assemble};
if(require.main===module)process.stdout.write(assemble());
