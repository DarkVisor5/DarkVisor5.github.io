"""Visual-only v18.1 art pass. Runs after the modular preview builder."""
from pathlib import Path
p=Path("threshold-v18-preview/js/game.js")
js=p.read_text(encoding="utf-8")
anchor="function draw(){"
assert anchor in js
art=r"""
// v18.1 — Visual art pass: deterministic material, depth and architectural thresholds.
// Canvas decoration only: movement, collision, visibility, spawning and balance unchanged.
function v18Stone(x,y,px,py,room){
 const h=envHash(x,y,117),theme=(s.theme||dungeonThemeForFloor())?.id||'castle';
 ctx.save();
 if(room){
  // A restrained stone bevel, shared by neighboring tiles instead of random noise.
  ctx.fillStyle=theme==='temple'?'rgba(211,176,109,.08)':theme==='catacombs'?'rgba(164,138,166,.065)':'rgba(169,179,185,.075)';
  ctx.fillRect(px+2,py+2,CELL-4,2);
  ctx.fillStyle='rgba(0,0,0,.24)';ctx.fillRect(px+2,py+CELL-4,CELL-4,2);
  ctx.strokeStyle='rgba(0,0,0,.27)';ctx.lineWidth=1;
  if(((x+y)&1)===0){ctx.beginPath();ctx.moveTo(px+CELL*.10,py+CELL*.54);ctx.lineTo(px+CELL*.87,py+CELL*.54);ctx.stroke()}
  // Rare handmade motifs, no new interactive object.
  if(h%29===0){const cx=px+CELL/2,cy=py+CELL/2;ctx.strokeStyle=theme==='temple'?'rgba(212,187,120,.27)':'rgba(183,172,177,.19)';
   ctx.lineWidth=1.25;ctx.beginPath();ctx.arc(cx,cy,CELL*.23,0,Math.PI*2);ctx.moveTo(cx-CELL*.13,cy);ctx.lineTo(cx+CELL*.13,cy);ctx.moveTo(cx,cy-CELL*.13);ctx.lineTo(cx,cy+CELL*.13);ctx.stroke()}
 }else{
  // Corridors are worn, narrow and architectural rather than only darker tiles.
  ctx.fillStyle='rgba(0,0,0,.22)';ctx.fillRect(px+1,py+1,CELL-2,CELL-2);
  ctx.strokeStyle='rgba(12,14,16,.46)';ctx.lineWidth=2;ctx.strokeRect(px+2,py+2,CELL-4,CELL-4);
  if(((x+y)&1)===0){ctx.strokeStyle='rgba(180,172,155,.12)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px+CELL*.22,py+CELL*.53);ctx.lineTo(px+CELL*.78,py+CELL*.53);ctx.stroke()}
 }
 ctx.restore();
}
function v18ArchitecturalDoor(x,y,px,py){
 if(!s?.visible?.has(K(x,y)))return;
 // Paint threshold jambs on passable tiles that join corridor and room.
 const room=!!roomGeometryAt(x,y),neighbors=[[1,0],[-1,0],[0,1],[0,-1]];
 let threshold=false;
 for(const [dx,dy] of neighbors){
  const nx=x+dx,ny=y+dy;
  if(!inBounds(nx,ny)||s.map[ny]?.[nx]==='#')continue;
  if(!!roomGeometryAt(nx,ny)!==room){threshold=true;break}
 }
 if(!threshold)return;
 const theme=(s.theme||dungeonThemeForFloor())?.id||'castle';
 ctx.save();ctx.strokeStyle=theme==='temple'?'rgba(210,178,116,.49)':theme==='catacombs'?'rgba(169,139,187,.46)':'rgba(178,168,146,.48)';
 ctx.lineWidth=2.5;ctx.strokeRect(px+3,py+3,CELL-6,CELL-6);
 ctx.strokeStyle='rgba(5,6,9,.76)';ctx.lineWidth=1;ctx.strokeRect(px+5.5,py+5.5,CELL-11,CELL-11);
 ctx.fillStyle='rgba(220,192,137,.30)';
 for(let j=0;j<3;j++)ctx.fillRect(px+CELL*.40+j*CELL*.065,py+CELL*.45,Math.max(1,CELL*.026),CELL*.11);
 ctx.restore();
}
"""
js=js.replace(anchor,art+"\n"+anchor,1)
needle="drawFloorDecor(x,y,px,py,visible,sr);"
assert needle in js
js=js.replace(needle,"drawFloorDecor(x,y,px,py,visible,sr);\n        v18Stone(x,y,px,py,!!roomGeometryAt(x,y));\n        v18ArchitecturalDoor(x,y,px,py);",1)
# The wall silhouette receives a stronger edge, but only on already-known wall tiles.
needle="drawWallDecor(x,y,px,py,visible)}"
assert needle in js
js=js.replace(needle,"drawWallDecor(x,y,px,py,visible);if(visible){ctx.save();ctx.fillStyle='rgba(0,0,0,.24)';ctx.fillRect(px+1,py+CELL-5,CELL-2,4);ctx.fillStyle='rgba(235,224,204,.10)';ctx.fillRect(px+2,py+2,CELL-4,2);ctx.restore()}}",1)
p.write_text(js,encoding="utf-8")
print("v18.1 canvas art pass installed")
