"""v18.3: integrate the independent sarcophagus sprite in crypt-style rooms.
Purely visual; no collision, items, room type or balance changes."""
from pathlib import Path
p=Path("threshold-v18-preview/js/game.js")
js=p.read_text(encoding="utf8")
anchor="function draw(){"
assert anchor in js
insert=r"""
// v18.3 independent environment sprite. The artwork loads from an actual asset file.
const v18Sarcophagus=new Image();
v18Sarcophagus.src='./assets/sprites/sarcophagus_closed.png';
v18Sarcophagus.addEventListener('load',()=>{if(s)render()});
function v18FirstRoomDecor(){
 if(!s||s.floor!==1)return [];
 // Create decorations once per run. Never recalculate their position as the player moves.
 if(s._v18Layer2Decor)return s._v18Layer2Decor;
 const p=s.player, r=roomGeometryAt(p.x,p.y);
 if(!r||!Number.isFinite(r.x)||!Number.isFinite(r.y)||r.w<3||r.h<4)return [];
 const candidates=[[2,0],[-2,0],[0,2],[0,-2],[2,1],[-2,1],[1,1],[-1,1],[1,-1],[-1,-1]];
 let chosen=null;
 for(const [dx,dy] of candidates){
  const x=p.x+dx,y=p.y+dy;
  // The entire 1.5 × 2.0 tile sprite must fit inside the room.
  if(x<r.x+1||x>r.x+r.w-2||y<r.y+1||y>r.y+r.h-2)continue;
  if(!inBounds(x,y)||s.map[y]?.[x]==='#')continue;
  const parent=roomGeometryAt(x,y);
  if(!parent||parent.x!==r.x||parent.y!==r.y)continue;
  if(x===p.x&&y===p.y)continue;
  chosen={x,y};break;
 }
 if(!chosen){
  const x=Math.floor(r.x+r.w/2),y=Math.floor(r.y+r.h/2);
  if(x!==p.x||y!==p.y)chosen={x,y};
 }
 if(!chosen)return [];
 s._v18Layer2Decor=[{type:'sarcophagus',x:chosen.x,y:chosen.y,room:{x:r.x,y:r.y,w:r.w,h:r.h}}];
 return s._v18Layer2Decor;
}
function drawV18Sarcophagi(c){
 if(!s||!v18Sarcophagus.complete||!v18Sarcophagus.naturalWidth)return;
 // Layer 2: one map-bound prop for the visual test. No extra auto-generated copies.
 for(const prop of v18FirstRoomDecor()){
  if(!inc(prop.x,prop.y,c)||!s.seen.has(K(prop.x,prop.y)))continue;
  const pp=lp(prop.x,prop.y,c),r=prop.room;
  const w=CELL*1.5,h=CELL*2;
  ctx.save();
  ctx.beginPath();
  // Hard clip to the actual room. Nothing can leak into walls or corridors.
  ctx.rect((r.x-c.sx)*CELL+1,(r.y-c.sy)*CELL+1,r.w*CELL-2,r.h*CELL-2);
  ctx.clip();
  ctx.globalAlpha=1;
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(v18Sarcophagus,pp.x+CELL/2-w/2,pp.y+CELL/2-h/2,w,h);
  ctx.restore();
 }
}
"""
js=js.replace(anchor,insert+"\n"+anchor,1)
needle="  drawDungeonAtmosphere(c);"
assert needle in js
# Layer 2 (map-bound decorations) is rendered after Layer 1 terrain and before lighting/interactive objects.
js=js.replace(needle,"  drawV18Sarcophagi(c); // LAYER 2: fixed world-space room decoration\n"+needle,1)
p.write_text(js,encoding="utf8")
print("v18.3 crypt sarcophagus sprite wired")
