// Regression check for Threshold v18 Layer 2 decorations.
// Tests 1 prop, placement inside a room, stable world coordinates,
// camera scrolling and removal on other floors. No game state mutation.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('threshold-v18-preview/js/game.js','utf8');
const i=source.indexOf('const v18Sarcophagus=new Image();');
const j=source.indexOf('function draw(){',i);
assert(i>=0&&j>i,'Expected sarcophagus rendering functions');
const moduleCode=source.slice(i,j);
const room={x:10,y:12,w:8,h:7};
let player={x:12,y:14};
const marks=[];
const ctx={
 save(){},restore(){},beginPath(){},rect(...args){marks.push(['cliprect',...args])},
 clip(){},drawImage(...args){marks.push(['image',...args])}
};
class Image{constructor(){this.complete=true;this.naturalWidth=128;}addEventListener(){}}
const context={Image,ctx,CELL:34,console,render(){},
 s:{floor:1,player,seen:new Set(),map:Array.from({length:40},()=>Array(40).fill('.'))},
 K(x,y){return x+','+y;},
 roomGeometryAt(x,y){return x>=room.x&&x<room.x+room.w&&y>=room.y&&y<room.y+room.h?room:null},
 inBounds(x,y){return x>=0&&y>=0&&x<40&&y<40},
 inc(x,y,c){return x>=c.sx&&x<c.sx+15&&y>=c.sy&&y<c.sy+15},
 lp(x,y,c){return {x:(x-c.sx)*34,y:(y-c.sy)*34}}
};
context.s.seen=new Set(Array.from({length:40},(_,y)=>Array.from({length:40},(_,x)=>x+','+y)).flat());
vm.createContext(context);
vm.runInContext(moduleCode+'\nglobalThis.qaDraw=drawV18Sarcophagi; globalThis.qaDecor=v18FirstRoomDecor;',context);
function drawn(camera){marks.length=0;context.qaDraw(camera);return marks.filter(x=>x[0]==='image')}
let renders=drawn({sx:8,sy:10});
assert.equal(renders.length,1,'Exactly one sarcophagus must render');
let saved=context.qaDecor()[0],first={x:saved.x,y:saved.y};
assert(saved.x>=room.x+1&&saved.x<=room.x+room.w-2,'Sarcophagus X inside room');
assert(saved.y>=room.y+1&&saved.y<=room.y+room.h-2,'Sarcophagus Y inside room');
const firstPixel=renders[0].slice(2,4);
const clip=marks.find(x=>x[0]==='cliprect');
assert(clip&&clip[3]===room.w*34-2&&clip[4]===room.h*34-2,'Clips to actual room');
context.s.player={x:14,y:15};
renders=drawn({sx:8,sy:10});
assert.equal(renders.length,1,'Moving player must not spawn duplicate');
assert.equal(context.qaDecor()[0].x,first.x);assert.equal(context.qaDecor()[0].y,first.y);
assert.deepEqual(renders[0].slice(2,4),firstPixel,'Prop stays in world-space when player moves');
renders=drawn({sx:9,sy:10});
assert.equal(renders.length,1);
assert.equal(renders[0][2],firstPixel[0]-34,'Camera shifts prop by one tile');
context.s.floor=2;
renders=drawn({sx:8,sy:10});
assert.equal(renders.length,0,'Test sarcophagus only on floor one');
console.log('PASS Layer 2: one prop; inside room; clipped; map-bound; no gameplay change');
