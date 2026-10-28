"""v18.3: integrate the independent sarcophagus sprite in crypt-style rooms.
Layer 2 world props gain explicit non-interactive collision; loot, combat and room generation remain unchanged."""
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
// A Layer-2 decoration has a footprint independent from its sprite artwork.
// Interactable (Layer-3) objects use a separate interaction system.
function v18SolidDecorationAt(x,y){
 if(!s||s.floor!==1)return null;
 return v18FirstRoomDecor().find(p=>p.solid&&x>=p.x&&x<p.x+p.w&&y>=p.y&&y<p.y+p.h)||null;
}
function v18FirstRoomDecor(){
 if(!s||s.floor!==1)return [];
 if(Array.isArray(s._v18Layer2Decor))return s._v18Layer2Decor;
 const start=s.startPos||s.player,r=roomGeometryAt(start.x,start.y);
 s._v18Layer2Decor=[]; // cache even when no safe placement is possible
 if(!r||r.w<5||r.h<4)return s._v18Layer2Decor;
 const inRoom=(x,y)=>x>=r.x&&y>=r.y&&x<r.x+r.w&&y<r.y+r.h;
 const same=(o,x,y)=>o&&o.x===x&&o.y===y;
 const exists=(list,x,y)=>Array.isArray(list)&&list.some(o=>same(o,x,y));
 const hasObject=(x,y)=>{
  if(same(start,x,y)||same(s.stairs,x,y)||exists(s.enemies,x,y)||exists(s.loot,x,y)||
     exists(s.coins,x,y)||exists(s.artifactDrops,x,y)||exists(s.chests,x,y)||
     exists(s.traps,x,y)||exists(s.torches,x,y)||exists(s.secrets,x,y)||
     same(s.mechanism?.switch,x,y)||same(s.mechanism?.cache,x,y)||
     same(s.rareEvent,x,y)||same(s.dangerDoor,x,y)||
     same(s.keyPuzzle?.door,x,y))return true;
  return false;
 };
 const passableRoom=(x,y,blocked)=>{
  return inRoom(x,y)&&s.map[y]?.[x]!== '#'&&!blocked.has(K(x,y));
 };
 const leavesPathsOpen=(blocked)=>{
  // Start room must keep all existing floor tiles connected, including doors.
  const seen=new Set([K(start.x,start.y)]),q=[[start.x,start.y]];
  for(let i=0;i<q.length;i++){
   const [x,y]=q[i];
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const nx=x+dx,ny=y+dy,k=K(nx,ny);
    if(!seen.has(k)&&passableRoom(nx,ny,blocked)){seen.add(k);q.push([nx,ny]);}
   }
  }
  for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){
   const k=K(x,y);
   if(s.map[y]?.[x]!=='#'&&!blocked.has(k)&&!seen.has(k))return false;
  }
  return true;
 };
 let best=null,bestScore=Infinity;
 for(let y=r.y;y<=r.y+r.h-2;y++)for(let x=r.x;x<=r.x+r.w-2;x++){
  const occupied=new Set();let valid=true;
  for(let yy=y;yy<y+2;yy++)for(let xx=x;xx<x+2;xx++){
   if(s.map[yy]?.[xx]!=='.'||hasObject(xx,yy)){valid=false;break}
   // Do not cover an entrance from corridor to the room.
   if(xx===r.x||yy===r.y||xx===r.x+r.w-1||yy===r.y+r.h-1){
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
     const nx=xx+dx,ny=yy+dy;
     if(!inRoom(nx,ny)&&s.map[ny]?.[nx]==='.'){valid=false;break}
    }
   }
   occupied.add(K(xx,yy));
  }
  if(!valid||!leavesPathsOpen(occupied))continue;
  // Keep the showcase close enough to be seen immediately, but to one side.
  const distance=Math.abs(x+.5-start.x)+Math.abs(y+.5-start.y);
  const score=distance*10 + Math.abs(y+.5-start.y)*2 + (x<start.x?1:0);
  if(score<bestScore){bestScore=score;best={x,y}}
 }
 if(best)s._v18Layer2Decor.push({
  type:'sarcophagus',x:best.x,y:best.y,w:2,h:2,solid:true,interactive:false,
  room:{x:r.x,y:r.y,w:r.w,h:r.h}
 });
 return s._v18Layer2Decor;
}
function drawV18Sarcophagi(c){
 if(!s||!v18Sarcophagus.complete||!v18Sarcophagus.naturalWidth)return;
 for(const prop of v18FirstRoomDecor()){
  if(!inc(prop.x,prop.y,c)&&!inc(prop.x+1,prop.y+1,c))continue;
  if(!s.seen.has(K(prop.x,prop.y))&&!s.seen.has(K(prop.x+1,prop.y+1)))continue;
  const r=prop.room;
  // Artwork lies *within* the same 2×2 grid footprint used for collision.
  const px=(prop.x-c.sx)*CELL+CELL*.175,py=(prop.y-c.sy)*CELL;
  ctx.save();ctx.beginPath();
  ctx.rect((r.x-c.sx)*CELL+1,(r.y-c.sy)*CELL+1,r.w*CELL-2,r.h*CELL-2);
  ctx.clip();ctx.globalAlpha=1;ctx.imageSmoothingEnabled=false;
  ctx.drawImage(v18Sarcophagus,px,py,CELL*1.65,CELL*2);
  ctx.restore();
 }
}
"""
js=js.replace(anchor,insert+"\n"+anchor,1)
needle="  drawDungeonAtmosphere(c);"
assert needle in js
# Layer 2 (map-bound decorations) is rendered after Layer 1 terrain and before lighting/interactive objects.
js=js.replace(needle,"  drawV18Sarcophagi(c); // LAYER 2: fixed world-space room decoration\n"+needle,1)

# Reserve decoration cells *before* gameplay begins, independently of PNG load.
needle="Object.assign(s,generateFloor(1));initAmbientRoutines();"
assert needle in js
js=js.replace(needle,"Object.assign(s,generateFloor(1));v18FirstRoomDecor();initAmbientRoutines();",1)
# The obstacle is solid for the player, enemies, pathfinding and spawn selection.
needle="if(s.map[ny][nx]==='#'){if(collectWallTorchAt(nx,ny))return;return}"
assert needle in js
js=js.replace(needle,needle+"if(v18SolidDecorationAt(nx,ny)){if(!s._v18DecorBlockedHint){s._v18DecorBlockedHint=true;showToast('⛔ SARCOFAGO · PASSAGGIO BLOCCATO')}return}",1)
needle="function enemyTileBlocked(e,x,y){const pd=s?.keyPuzzle?.door;"
assert needle in js
js=js.replace(needle,needle+"",1) # use targeted body replacement below
needle="||!bossArenaContains(e,x,y)||!!enemyAt(x,y,e.id)"
assert needle in js
js=js.replace(needle,"||!!v18SolidDecorationAt(x,y)"+needle,1)
needle="function occupiedForSpawn(x,y){"
assert needle in js
js=js.replace(needle,needle+"if(v18SolidDecorationAt(x,y))return true;",1)
needle="function isWall(x,y){const pd=s?.keyPuzzle?.door;"
assert needle in js
js=js.replace("||!!(pd&&!pd.open&&x===pd.x&&y===pd.y)}","||!!(pd&&!pd.open&&x===pd.x&&y===pd.y)||!!v18SolidDecorationAt(x,y)}",1)
needle="if(s.map[yy]?.[xx]!=='.')continue;if(kind"
assert needle in js
js=js.replace(needle,"if(s.map[yy]?.[xx]!=='.'||v18SolidDecorationAt(xx,yy))continue;if(kind",1)
needle="if((x===e.x&&y===e.y)||s.map[y]?.[x]==='#'||enemyAt(x,y,e.id)"
assert needle in js
js=js.replace(needle,"if((x===e.x&&y===e.y)||s.map[y]?.[x]==='#'||v18SolidDecorationAt(x,y)||enemyAt(x,y,e.id)",1)
needle="s.map[p.y]?.[p.x]!=='#'&&!enemyAt(p.x,p.y,e.id)"
assert needle in js
js=js.replace(needle,"s.map[p.y]?.[p.x]!=='#'&&!v18SolidDecorationAt(p.x,p.y)&&!enemyAt(p.x,p.y,e.id)",1)
p.write_text(js,encoding="utf8")
print("v18.3 crypt sarcophagus sprite wired")
