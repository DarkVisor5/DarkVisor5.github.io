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
function drawV18Sarcophagi(c){
 if(!s)return;
 if(!v18Sarcophagus.complete||!v18Sarcophagus.naturalWidth)return;
 // Fixed world-space placement: selected once per run; camera moves around the prop.
 if(s.floor===1){
  if(!s._sarcophagusShowcase){
   const p=s.player, origin=roomGeometryAt(p.x,p.y);
   const offsets=[[2,0],[1,1],[0,2],[-2,0],[0,-2],[-1,1],[1,-1],[-1,-1],[1,0]];
   for(const [dx,dy] of offsets){
    const x=p.x+dx,y=p.y+dy,r=roomGeometryAt(x,y);
    if(!inBounds(x,y)||s.map[y]?.[x]==='#'||!r||!origin||r.x!==origin.x||r.y!==origin.y)continue;
    s._sarcophagusShowcase={x,y};break;
   }
   if(!s._sarcophagusShowcase)s._sarcophagusShowcase={x:p.x,y:p.y};
  }
  const {x,y}=s._sarcophagusShowcase;
  if(inc(x,y,c)){
   const pp=lp(x,y,c),w=CELL*1.65,h=CELL*2.5;
   ctx.save();ctx.globalAlpha=1;ctx.drawImage(v18Sarcophagus,pp.x+CELL/2-w/2,pp.y+CELL/2-h/2,w,h);ctx.restore();
  }
 }
 const rooms=s.rooms||[];
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
# Layer 2 (map-bound decorations) is rendered after Layer 1 terrain and before lighting/interactive objects.
js=js.replace(needle,"  drawV18Sarcophagi(c); // LAYER 2: fixed world-space room decoration\n"+needle,1)
p.write_text(js,encoding="utf8")
print("v18.3 crypt sarcophagus sprite wired")
