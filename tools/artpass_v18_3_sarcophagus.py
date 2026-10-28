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
v18Sarcophagus.src='./assets/sprites/sarcophagus_closed.svg';
v18Sarcophagus.addEventListener('load',()=>{if(s)render()});
function drawV18Sarcophagi(c){
 if(!v18Sarcophagus.complete||!v18Sarcophagus.naturalWidth||!s?.rooms)return;
 const rooms=s.rooms;
 for(const r of rooms){
  if(!r||r.w<4||r.h<4||!Number.isFinite(r.x)||!Number.isFinite(r.y))continue;
  if(envHash(r.x,r.y,801)%8!==2)continue; // only crypt identity
  const x=r.x+Math.floor(r.w/2),y=r.y+Math.floor(r.h/2);
  if(!inc(x,y,c)||!s.visible.has(K(x,y)))continue;
  const pp=lp(x,y,c);
  ctx.save();
  ctx.globalAlpha=.95;
  // 1.65 tile wide, 2.5 tiles tall; artwork can be walked over, no collisions.
  const w=CELL*1.65,h=CELL*2.5;
  ctx.drawImage(v18Sarcophagus,pp.x+CELL/2-w/2,pp.y+CELL/2-h/2,w,h);
  ctx.restore();
 }
}
"""
js=js.replace(anchor,insert+"\n"+anchor,1)
needle="  drawDungeonAtmosphere(c);"
assert needle in js
js=js.replace(needle,"  drawV18Sarcophagi(c);\n"+needle,1)
p.write_text(js,encoding="utf8")
print("v18.3 crypt sarcophagus sprite wired")
