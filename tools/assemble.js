// the game ships as one HTML file; for now the source is one file too (split comes next)
const fs=require('fs'),path=require('path');
function assemble(){return fs.readFileSync(path.join(__dirname,'../src/journey.src.html'),'utf8');}
module.exports={assemble};
