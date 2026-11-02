'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const source=read('threshold-v18-preview/js/phase-b-world.js');
const game=read('threshold-v18-preview/js/game.js');
const root={};new Function('globalThis',source)(root);
const factory=root.ThresholdPhaseBWorld;
assert.equal(factory.levers.length,5);
for(const token of ['phaseBWorld?.setup()','phaseBWorld?.bump(nx,ny)','phaseBWorld?.draw(ctx','phaseBWorld?.outcome(prop,outcome)'])assert.ok(game.includes(token),token);
function fixture(seed){
 const width=30,height=26,map=Array.from({length:height},()=>Array(width).fill('#'));
 const r1={x:3+seed%2,y:4+seed%3,w:7,h:7},r2={x:19-seed%2,y:7+seed%2,w:7,h:7};
 for(const room of [r1,r2])for(let y=room.y;y<room.y+room.h;y++)for(let x=room.x;x<room.x+room.w;x++)map[y][x]='.';
 for(let x=r1.x+r1.w;x<=r2.x;x++)map[r2.y+2][x]='.';
 const furniture=[
  {type:'archiveBookshelf',x:r1.x+1,y:r1.y+1,w:2,h:1,solid:true,room:r1},
  {type:'archiveLectern',x:r1.x+3,y:r1.y+3,w:1,h:1,solid:true,room:r1},
  {type:'workbench',x:r1.x+1,y:r1.y+5,w:2,h:1,solid:true,room:r1},
  {type:'votiveAltar',x:r2.x+1,y:r2.y+1,w:2,h:1,solid:true,room:r2},
  {type:'sanctuaryBell',x:r2.x+1,y:r2.y+5,w:1,h:1,solid:true,room:r2}
 ];
 const run={floor:1+seed%5,map,startPos:{x:r1.x+3,y:r1.y+2},player:{x:r1.x+3,y:r1.y+2},stairs:{x:r2.x+3,y:r2.y+3},keyPuzzle:{door:{x:r1.x+r1.w+2,y:r2.y+2},sigils:[]},seen:new Set(),visible:new Set(),traps:[],coins:[],loot:[],chests:[],artifactDrops:[],enemies:[],secrets:[],torches:[]};
 return {run,furniture,r1,r2};
}
let totalDoors=0;
for(let seed=0;seed<100;seed++){
 const {run,furniture}=fixture(seed);
 const original=run.map.map(row=>row.join(''));
 const world=factory.create({getRun:()=>run,getFurniture:()=>furniture,now:()=>1000,effects:{render(){},visibility(){},animate(){},light(){},toast(){},log(){}}});
 const doors=world.setup().doors;
 assert.ok(doors.length<=2);
 for(const door of doors){
  assert.equal(original[door.y][door.x],'#');
  const trigger=furniture.find(p=>door.trigger===[run.floor,p.type,p.x,p.y].join(':'));
  assert.ok(trigger);
  assert.equal(world.bump(door.x,door.y),true);
  assert.equal(world.outcome(trigger,'solved'),true);
  assert.equal(world.outcome(trigger,'solved'),false);
  assert.equal(run.map[door.y][door.x],'.');
  assert.equal(world.bump(door.x,door.y),false);
  assert.ok(run.coins.some(c=>c.x===door.x&&c.y===door.y));
  totalDoors++;
 }
 for(let y=0;y<run.map.length;y++)for(let x=0;x<run.map[0].length;x++)if(original[y][x]==='.')assert.equal(run.map[y][x],'.','preexisting floor must never be blocked');
}
const {run,furniture,r1}=fixture(8);
let illumination=0,animations=0;
const world=factory.create({getRun:()=>run,getFurniture:()=>furniture,now:()=>1000,effects:{render(){},visibility(){},toast(){},log(){},animate(){animations++},light:n=>illumination+=n}});
world.setup();
const target=furniture[1];
assert.equal(world.outcome(target,'failed'),true);
assert.equal(run.traps.length,1);
assert.equal(run.traps[0].revealed,true);
assert.notDeepEqual([run.traps[0].x,run.traps[0].y],[run.player.x,run.player.y]);
assert.equal(world.outcome(target,'failed'),false);
assert.equal(world.outcome(furniture[2],'lever'),true);
assert.equal(run.traps.length,0);
assert.equal(illumination,16);
assert.equal(world.outcome(furniture[2],'lever'),false);
const door=world.allDoors().find(d=>d.roomKey===r1.x+','+r1.y);
assert.ok(door&&door.open);
assert.ok(animations>0);
const strokes=[],ctx={save(){},restore(){},strokeRect(...a){strokes.push(a)},fillRect(){},fillText(){}};
run.seen.add(door.x+','+door.y);run.visible.add(door.x+','+door.y);
world.draw(ctx,{sx:0,sy:0,view:30},34,1450);
assert.ok(strokes.length);
const other=fixture(11);const second=factory.create({getRun:()=>other.run,getFurniture:()=>other.furniture,now:()=>1000,effects:{}});
assert.ok(second.setup().doors.every(d=>!d.open));
console.log('PASS: 100 synthetic layouts, '+totalDoors+' optional doors, one-time rewards, traps, levers, drawing and per-floor reset.');
