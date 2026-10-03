// first draw, and keep the board sized to the screen
window.addEventListener('resize',()=>{resize();if(G)fitHud();});
renderMap();
setTimeout(checkMedals,600);
})();
