"""v18.2 — deterministic room identities and environmental props; art only."""
from pathlib import Path
p=Path("threshold-v18-preview/js/game.js")
js=p.read_text(encoding="utf-8")
anchor="function draw(){"
assert anchor in js
art=r"""
// v18.2 — room identities: decoration follows room geometry, not random tile noise.
// Props occupy existing walkable tiles only as artwork; they never change collision.
function v18RoomProps(x,y,px,py,room){
 if(!room||!Number.isFinite(room.x)||!Number.isFinite(room.y)||!Number.isFinite(room.w)||!Number.isFinite(room.h))return;
 if(room.w<4||room.h<4)return;
 const rx=x-room.x,ry=y-room.y,seed=envHash(room.x,room.y,801),style=seed%8;
 const cx=Math.floor(room.w/2),cy=Math.floor(room.h/2);
 // Reserve both the edge-door tiles and central movement lanes.
 const atCenter=(rx===cx&&ry===cy), atLeft=(rx===1&&ry===1),
 atRight=(rx===room.w-2&&ry===1),atBottom=(rx===room.w-2&&ry===room.h-2);
 let variant=-1;
 if(atCenter)variant=0;
 else if(atLeft && room.w>=6&&room.h>=6)variant=1;
 else if(atRight && room.w>=7&&room.h>=6)variant=2;
 else if(atBottom && room.w>=7&&room.h>=7&&seed%3===0)variant=3;
 if(variant<0)return;
 const theme=(s.theme||dungeonThemeForFloor())?.id||'castle';
 const warm=theme==='temple'?'#9b8761':theme==='catacombs'?'#746577':'#756756';
 const accent=theme==='temple'?'#bca36d':theme==='catacombs'?'#b093aa':'#ae9e83';
 const fx=px+CELL/2,fy=py+CELL/2;
 const a=CELL/32;
 ctx.save();ctx.translate(fx,fy);ctx.scale(a,a);ctx.lineJoin='round';ctx.lineCap='round';
 const slab=(w,h,fill=warm)=>{ctx.fillStyle='rgba(0,0,0,.42)';ctx.beginPath();ctx.ellipse(1,9,w*.55,h*.31,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=fill;ctx.fillRect(-w/2,-h/2,w,h);ctx.fillStyle='rgba(236,218,180,.16)';ctx.fillRect(-w/2+1,-h/2+1,w-2,2);ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(-w/2+1,h/2-3,w-2,2)};
 const stroke=(col=accent,w=1.6)=>{ctx.strokeStyle=col;ctx.lineWidth=w};
 const barrel=(xx,yy)=>{ctx.save();ctx.translate(xx,yy);ctx.fillStyle='#4f3525';ctx.beginPath();ctx.ellipse(0,0,6,7,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#b09a7b';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,-2,5,3,0,0,Math.PI*2);ctx.moveTo(-5,3);ctx.lineTo(5,3);ctx.stroke();ctx.restore()};
 // A distinct room centerpiece. Each room chooses one recognizable function.
 if(variant===0){
  if(style===0){ // abandoned guard room — weapon display
    slab(23,19,'#4c413a');stroke();ctx.beginPath();ctx.moveTo(-9,-7);ctx.lineTo(9,7);ctx.moveTo(9,-7);ctx.lineTo(-9,7);ctx.stroke();
    stroke('#bdb7a6',2);ctx.beginPath();ctx.moveTo(-8,-9);ctx.lineTo(8,8);ctx.moveTo(8,-9);ctx.lineTo(-8,8);ctx.stroke();
  }else if(style===1){ // archive — books and shelves
    slab(25,21,'#493b32');for(let i=0;i<5;i++){ctx.fillStyle=['#79634e','#5f544c','#50495c'][i%3];ctx.fillRect(-11+i*5,-8,4,16);ctx.fillStyle='#c2a97b';ctx.fillRect(-11+i*5,-7,1,13)}
  }else if(style===2){ // crypt — sarcophagus
    slab(20,26,theme==='temple'?'#857963':'#5d5960');stroke('#c7b29a',1.5);ctx.strokeRect(-8,-11,16,22);ctx.beginPath();ctx.moveTo(0,-7);ctx.lineTo(0,6);ctx.moveTo(-4,-1);ctx.lineTo(4,-1);ctx.stroke()
  }else if(style===3){ // ritual ring
    stroke(theme==='temple'?'#d5b879':'#9c769f',2);ctx.beginPath();ctx.arc(0,0,12,0,Math.PI*2);ctx.moveTo(-10,0);ctx.lineTo(10,0);ctx.moveTo(0,-10);ctx.lineTo(0,10);ctx.stroke();
    ctx.fillStyle='rgba(166,84,104,.33)';ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill()
  }else if(style===4){ // provisions and barrels
    slab(23,18,'#594738');barrel(-6,-3);barrel(6,2);barrel(4,-6)
  }else if(style===5){ // rubble
    for(let i=0;i<7;i++){const h=envHash(room.x+i,room.y,819);ctx.save();ctx.translate((h%19)-9,((h>>>5)%17)-8);ctx.rotate((h%13)*.16);ctx.fillStyle=i%2?'#5a5b61':'#777069';ctx.fillRect(-3,-2,6,5);ctx.restore()}
  }else if(style===6){ // feasting room
    slab(25,14,'#604535');stroke('#b39b79',1.2);ctx.beginPath();ctx.moveTo(-9,0);ctx.lineTo(9,0);ctx.stroke();for(let i=-1;i<=1;i++){ctx.fillStyle='#91816d';ctx.beginPath();ctx.arc(i*8,-2,2.3,0,Math.PI*2);ctx.fill()}
  }else{ // roots and overgrowth
    ctx.fillStyle='rgba(66,79,51,.55)';ctx.beginPath();ctx.ellipse(0,0,13,9,.2,0,Math.PI*2);ctx.fill();stroke('#81916a',2);for(let i=0;i<5;i++){const xx=-10+i*5;ctx.beginPath();ctx.moveTo(xx,10);ctx.quadraticCurveTo(xx+9,-2,xx+2,-12);ctx.stroke()}
  }
 }else if(variant===1){
  // Left corner: secondary environmental clue.
  if(style===1||style===6){slab(19,9,'#514139');for(let i=0;i<4;i++){ctx.fillStyle=i%2?'#7c5e49':'#857664';ctx.fillRect(-8+i*4,-7,3,6)}}
  else if(style===2){slab(19,10,'#666069');stroke('#9e929b');ctx.strokeRect(-7,-3,14,7)}
  else if(style===4){barrel(-4,0);barrel(6,3)}
  else if(style===7){stroke('#657b54',2);for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-8+i*8,9);ctx.quadraticCurveTo(-10+i*8,-6,-3+i*8,-10);ctx.stroke()}}
  else {slab(16,11,'#5c544d')}
 }else if(variant===2){
  if(style===3){stroke('#b49a72',1.4);ctx.beginPath();ctx.arc(0,0,9,0,Math.PI*2);ctx.moveTo(-6,-6);ctx.lineTo(6,6);ctx.stroke()}
  else if(style===5){slab(12,10,'#605f61');ctx.save();ctx.rotate(.45);slab(9,11,'#77736f');ctx.restore()}
  else if(style===0){stroke('#a99a89',2);ctx.beginPath();ctx.moveTo(-9,7);ctx.lineTo(7,-8);ctx.moveTo(8,7);ctx.lineTo(-7,-8);ctx.stroke()}
  else{slab(13,11)}
 }else if(variant===3){
  if(style===4){barrel(-4,0);barrel(5,-3)}
  else if(style===7){stroke('#798966',2.3);ctx.beginPath();ctx.moveTo(-10,8);ctx.quadraticCurveTo(0,-15,10,8);ctx.stroke()}
  else{slab(16,10,style===2?'#716872':'#61584d')}
 }
 ctx.restore();
}
"""
js=js.replace(anchor,art+"\n"+anchor,1)
needle="v18ArchitecturalDoor(x,y,px,py);"
assert needle in js
js=js.replace(needle,needle+"\n        v18RoomProps(x,y,px,py,roomGeometryAt(x,y));",1)
p.write_text(js,encoding="utf-8")
print("v18.2 thematic rooms installed")
