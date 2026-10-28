// Regression suite: layered world props, collision and first-room connectivity.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('threshold-v18-preview/js/game.js','utf8');
const i=source.indexOf('const v18Sarcophagus=new Image();'),j=source.indexOf('function draw(){',i);
assert(i>=0&&j>i,'Layer 2 module is missing');
const code=source.slice(i,j);
const moveStart=source.indexOf('function move(dx,dy){'),moveEnd=source.indexOf('function useHealItem(',moveStart);
assert(moveStart>=0&&moveEnd>moveStart,'Player move function missing');
assert(source.includes("Object.assign(s,generateFloor(1));v18FirstRoomDecor();initAmbientRoutines();"),'Prop placement must happen when the floor starts');
assert(source.includes('||!!v18SolidDecorationAt(x,y)||!bossArenaContains(e,x,y)'),'Enemy movement must block solid props');
assert(source.includes('function occupiedForSpawn(x,y){if(v18SolidDecorationAt(x,y))return true;'),'Spawn must avoid decor');
assert(source.includes("if(v18SolidDecorationAt(nx,ny)){"),'Player movement must check decor');
const roomSamples=[
 {x:10,y:12,w:8,h:7,doors:[[17,15]]},
 {x:10,y:12,w:5,h:4,doors:[[14,14]]},
 {x:10,y:12,w:6,h:5,doors:[[10,14],[15,14]]},
 {x:10,y:12,w:10,h:9,doors:[[10,16],[19,16],[14,12]]},
 {x:10,y:12,w:7,h:4,doors:[[10,14],[16,14]]}
];
let validated=0;
for(const room of roomSamples){
 const map=Array.from({length:40},()=>Array(40).fill('#'));
 for(let y=room.y;y<room.y+room.h;y++)for(let x=room.x;x<room.x+room.w;x++)map[y][x]='.';
 for(const [x,y] of room.doors){
  // Carve one outward corridor tile at each door.
  const edge=x===room.x?[x-1,y]:x===room.x+room.w-1?[x+1,y]:y===room.y?[x,y-1]:[x,y+1];
  map[edge[1]][edge[0]]='.';
 }
 const p={x:room.x+Math.floor(room.w/2),y:room.y+Math.floor(room.h/2)};
 const seen=new Set();
 for(let y=0;y<40;y++)for(let x=0;x<40;x++)seen.add(x+','+y);
 const s={floor:1,player:{...p},startPos:{...p},seen,map,enemies:[],loot:[],coins:[],artifactDrops:[],chests:[],traps:[],torches:[],secrets:[],steps:0};
 const calls=[],toasts=[];
 const ctx={save(){},restore(){},beginPath(){},rect(...v){calls.push(['rect',...v])},
  clip(){},drawImage(...v){calls.push(['image',...v])}};
 class Image{constructor(){this.complete=true;this.naturalWidth=128;}addEventListener(){}}
 const context={Image,ctx,CELL:34,WORLD:40,console,s,showToast:x=>toasts.push(x),render(){},
  K:(x,y)=>x+','+y,inBounds:(x,y)=>x>=0&&y>=0&&x<40&&y<40,
  roomGeometryAt:(x,y)=>x>=room.x&&y>=room.y&&x<room.x+room.w&&y<room.y+room.h?room:null,
  inc:(x,y,c)=>x>=c.sx&&x<c.sx+15&&y>=c.sy&&y<c.sy+15,
  lp:(x,y,c)=>({x:(x-c.sx)*34,y:(y-c.sy)*34})
 };
 vm.createContext(context);
 vm.runInContext(code+ '\\nglobalThis.qaDraw=drawV18Sarcophagi;globalThis.qaProps=v18FirstRoomDecor;globalThis.qaSolid=v18SolidDecorationAt;',context);
 const props=context.qaProps();
 assert.equal(props.length,1,'A visible 2x2 sarcophagus should fit the starting room '+JSON.stringify(room));
 const o=props[0];
 assert.equal(o.solid,true);
 assert.equal(o.w,2);assert.equal(o.h,2);
 assert(!(p.x>=o.x&&p.x<o.x+2&&p.y>=o.y&&p.y<o.y+2),'Player spawned on the sarcophagus');
 for(let y=o.y;y<o.y+2;y++)for(let x=o.x;x<o.x+2;x++)assert(context.qaSolid(x,y),'All four tiles are blocked');
 assert.equal(context.qaSolid(p.x,p.y),null,'Starting tile must stay passable');
 // Check every other room tile remains reachable without crossing footprint.
 const queue=[[p.x,p.y]],reached=new Set([context.K(p.x,p.y)]);
 for(let n=0;n<queue.length;n++)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const [x,y]=queue[n],nx=x+dx,ny=y+dy,k=context.K(nx,ny);
  if(nx<room.x||nx>=room.x+room.w||ny<room.y||ny>=room.y+room.h||context.qaSolid(nx,ny)||reached.has(k))continue;
  reached.add(k);queue.push([nx,ny]);
 }
 for(let y=room.y;y<room.y+room.h;y++)for(let x=room.x;x<room.x+room.w;x++)
  if(!context.qaSolid(x,y))assert(reached.has(context.K(x,y)),'Obstacle must not cut room in two');
 for(const [x,y] of room.doors)assert(reached.has(context.K(x,y)),'Door must remain reachable');
 function drawn(c){calls.length=0;context.qaDraw(c);return calls.filter(v=>v[0]==='image')}
 const frame=drawn({sx:8,sy:10});
 assert.equal(frame.length,1,'Exactly one image rendered');
 const px=frame[0][2],py=frame[0][3];
 assert.equal(frame[0][4],34*1.65);assert.equal(frame[0][5],34*2);
 context.s.player={x:p.x+1,y:p.y+1}; // movement doesn't move the decoration
 const moved=drawn({sx:8,sy:10});
 assert.deepEqual(moved[0].slice(2,4),[px,py]);
 assert.deepEqual(drawn({sx:9,sy:11})[0].slice(2,4),[px-34,py-34]);
 context.s.player={...p};
 // Real movement handler: walking onto any occupied tile does not advance a turn.
 context.s.eventOpen=false;context.s.rewardOpen=false;context.s.atStairs=false;context.s.targetMode=false;
 context.s.secrets=[];context.s.ambushId=null;
 vm.runInContext(source.slice(moveStart,moveEnd)+'\\nglobalThis.qaMove=move;',context);
 const adjacent=queue.find(([x,y])=>Math.abs(x-o.x)+Math.abs(y-o.y)<=3&&[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>context.qaSolid(x+dx,y+dy)));
 assert(adjacent,'Expected accessible adjacent cell');
 const [ax,ay]=adjacent;
 const dir=[[1,0],[-1,0],[0,1],[0,-1]].find(([dx,dy])=>context.qaSolid(ax+dx,ay+dy));
 context.s.player={x:ax,y:ay,facing:'up'};
 context.qaMove(...dir);
 assert.equal(context.s.player.x,ax,'Blocked move must preserve X');
 assert.equal(context.s.player.y,ay,'Blocked move must preserve Y');
 assert.equal(context.s.steps,0,'Bumping into prop does not consume a turn');
 assert(toasts.length>0,'Blocked move gives player feedback');
 context.s.floor=2;
 assert.equal(drawn({sx:8,sy:10}).length,0,'Showcase only appears on floor 1');
 validated++;
}
console.log('PASS Layer 2: '+validated+' room layouts, 2x2 collision, no duplicate, no blocked exit, world anchor, player bump');
