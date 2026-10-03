/* ================= world kits: what each kind of world does ================= */
// Each world family registers its handlers once, at the end of its own file:
//   kit(ids, {move(d), tick(now), hud(add), draw(s,n,W,now), draw2(s,n,W,now), action(), hint(), undo(), pointer(type,e)})
// The engine asks the kit of the world being played; a missing hook falls back to the shared code.
const KITS={};
function kit(ids,hooks){for(const id of ids)KITS[id]=Object.assign({},KITS[id],hooks);}
function kitHook(name){const k=G&&G.W&&KITS[G.W.id];return k&&k[name]||null;}
