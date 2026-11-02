/* Threshold v18.26 — optional doors, ambient mechanisms and riddle traps.
   Purely additive: a locked niche replaces an existing dead-end wall only after
   being unlocked. The five mandatory puzzle routes and ordinary corridors stay intact.
*/
(function(global){
 'use strict';
 const KEYS=new Set(['sarcophagus','cryptTombSlab','archiveBookshelf','archiveLectern','archiveScrollCabinet','votiveAltar','sanctuaryRuneStone','sanctuaryReliquary','storeCratePile','storeBarrelStack','treasuryGemChest']);
 const LEVERS=new Set(['workbench','archiveClock','sanctuaryBell','storeChainHoist','treasuryGoldSafe']);
 const keyFor=(run,prop)=>[run.floor,prop.type,prop.x,prop.y].join(':');
 const inside=(room,x,y)=>x>=room.x&&y>=room.y&&x<room.x+room.w&&y<room.y+room.h;
 function create(config){
  const getRun=config.getRun,getFurniture=config.getFurniture||(()=>[]),now=config.now||(()=>Date.now()),fx=config.effects||{};
  const emit=(kind,...args)=>typeof fx[kind]==='function'?fx[kind](...args):null;
  function state(){
   const run=getRun();
   if(!run)return null;
   if(!run._phaseBWorld)run._phaseBWorld={initialized:false,doors:[],used:new Set(),announced:new Set(),floor:run.floor};
   return run._phaseBWorld;
  }
  function setup(){
   const run=getRun(),st=state();if(!run||!st||st.initialized)return st;
   st.initialized=true;
   const placed=getFurniture();
   const eligible=placed.filter(p=>KEYS.has(p.type)&&p.room);
   eligible.sort((a,b)=>(a.x*29+a.y*17+run.floor*11)%101-(b.x*29+b.y*17+run.floor*11)%101);
   const usedRooms=new Set(),reserved=new Set();
   for(const prop of eligible){
    if(st.doors.length>=2)break;
    const room=prop.room,roomKey=room.x+','+room.y;
    if(usedRooms.has(roomKey))continue;
    const choices=[];
    for(const side of ['north','east','south','west']){
     const first=side==='north'||side==='south';
     const count=first?room.w-2:room.h-2;
     for(let i=1;i<=count;i++){
      const x=side==='west'?room.x-1:side==='east'?room.x+room.w:first?room.x+i:room.x;
      const y=side==='north'?room.y-1:side==='south'?room.y+room.h:first?room.y:room.y+i;
      if(x<=1||y<=1||x>=run.map[0].length-2||y>=run.map.length-2||run.map[y]?.[x]!=='#')continue;
      if(run.keyPuzzle?.door?.x===x&&run.keyPuzzle?.door?.y===y)continue;
      if((run.floor>=4)&&x===Math.floor(run.map[0].length/2))continue;
      if((run.secrets||[]).some(q=>q.x===x&&q.y===y||q.insideX===x&&q.insideY===y))continue;
      if((run.torches||[]).some(q=>q.x===x&&q.y===y))continue;
      if(reserved.has(x+','+y))continue;
      const neighbors=[[x+1,y],[x-1,y],[x,y+1],[x,y-1]];
      const open=neighbors.filter(([a,b])=>run.map[b]?.[a]!=='#');
      if(open.length!==1||!inside(room,...open[0]))continue;
      const [entryX,entryY]=open[0];
      if((run.keyPuzzle?.door?.x===entryX&&run.keyPuzzle.door.y===entryY)||
         (run.stairs.x===entryX&&run.stairs.y===entryY)||
         (run.startPos.x===entryX&&run.startPos.y===entryY))continue;
      if(Math.abs(entryX-prop.x)+Math.abs(entryY-prop.y)>7)continue;
      choices.push({x,y,entryX,entryY,score:Math.abs(entryX-prop.x)+Math.abs(entryY-prop.y)});
     }
    }
    if(!choices.length)continue;
    choices.sort((a,b)=>a.score-b.score||a.y-b.y||a.x-b.x);
    const choice=choices[0];
    st.doors.push({...choice,open:false,openingAt:null,trigger:keyFor(run,prop),roomKey,room:{...room},reward:18+8*run.floor});
    reserved.add(choice.x+','+choice.y);usedRooms.add(roomKey);
   }
   return st;
  }
  function doorAt(x,y){return setup()?.doors.find(d=>d.x===x&&d.y===y)||null}
  function bump(x,y){
   const run=getRun(),d=doorAt(x,y);
   if(!d||d.open||!run)return false;
   const st=state(),k=x+','+y;
   if(!st.announced.has(k)){st.announced.add(k);emit('toast','🔒 Nicchia sigillata: cerca una leva o interpreta un oggetto della stanza.')}
   else emit('toast','🔒 Nicchia ancora sigillata');
   return true;
  }
  function openDoor(door){
   const run=getRun();if(!door||door.open||!run)return false;
   door.open=true;door.openingAt=now();
   // We only carve a prevalidated single-wall dead end, never an existing route.
   if(run.map[door.y]?.[door.x]!=='#'){door.open=false;return false}
   run.map[door.y][door.x]='.';
   run.coins.push({x:door.x,y:door.y,value:door.reward,phaseB:true});
   emit('toast','🚪 Una nicchia laterale si apre! Esplorala per raccogliere il tesoro.');
   emit('visibility');
   emit('animate',door);
   return true;
  }
  function createTrap(prop){
   const run=getRun();if(!run||!prop?.room)return false;
   const room=prop.room,st=setup();
   const forbidden=(x,y)=>{
    if(run.map[y]?.[x]!=='.'||(x===run.player.x&&y===run.player.y))return true;
    if((run.keyPuzzle?.door?.x===x&&run.keyPuzzle?.door?.y===y)||
       (run.keyPuzzle?.shrine?.x===x&&run.keyPuzzle?.shrine?.y===y)||
       (run.keyPuzzle?.finalSeal?.x===x&&run.keyPuzzle?.finalSeal?.y===y))return true;
    if((run.keyPuzzle?.sigils||[]).some(o=>o.x===x&&o.y===y))return true;
    if((run.traps||[]).some(o=>!o.triggered&&o.x===x&&o.y===y))return true;
    if((run.enemies||[]).some(o=>o.hp>0&&o.x===x&&o.y===y))return true;
    if([...run.coins,...run.loot,...run.chests,...run.artifactDrops].some(o=>o.x===x&&o.y===y))return true;
    if((run.secrets||[]).some(o=>o.insideX===x&&o.insideY===y))return true;
    if((run.torches||[]).some(o=>o.x===x&&o.y===y))return true;
    if((run.keyPuzzle?.door?.x===x&&run.keyPuzzle?.door?.y===y)||
       (run.stairs.x===x&&run.stairs.y===y)||(run.startPos.x===x&&run.startPos.y===y))return true;
    if(getFurniture().some(o=>o.solid&&x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h))return true;
    if(st?.doors.some(d=>d.x===x&&d.y===y||d.entryX===x&&d.entryY===y))return true;
    return false;
   };
   const options=[];
   for(let y=room.y+1;y<room.y+room.h-1;y++)for(let x=room.x+1;x<room.x+room.w-1;x++){
    if(forbidden(x,y))continue;
    if(Math.abs(run.player.x-x)+Math.abs(run.player.y-y)<2)continue; // visible and avoidable
    if(Math.abs(x-(room.x+room.w/2))<1&&Math.abs(y-(room.y+room.h/2))<1)continue;
    options.push({x,y,score:Math.abs(prop.x-x)+Math.abs(prop.y-y)});
   }
   options.sort((a,b)=>a.score-b.score||a.y-b.y||a.x-b.x);
   if(!options.length)return false;
   const chosen=options[0];
   run.traps.push({x:chosen.x,y:chosen.y,triggered:false,revealed:true,phaseB:true,phaseBRoom:room.x+','+room.y});
   emit('toast','⚠️ Il sigillo attiva una trappola visibile in questa stanza!');
   return true;
  }
  function disarm(room){
   const run=getRun();if(!run||!room)return 0;
   const rid=room.x+','+room.y;
   const before=run.traps.length;
   run.traps=run.traps.filter(t=>!(t.phaseB&&!t.triggered&&t.phaseBRoom===rid));
   return before-run.traps.length;
  }
  function outcome(prop,decision){
   const run=getRun(),st=setup();
   if(!run||!st||!prop||!decision)return false;
   const k=keyFor(run,prop);
   if(st.used.has(k))return false;
   st.used.add(k);
   let changed=false;
   if(decision==='failed'){
    changed=createTrap(prop);
   }else{
    // A solved riddle opens its own side niche, when one exists.
    let door=st.doors.find(d=>!d.open&&d.trigger===k);
    // A lever can also operate a niche in the same room, without making it mandatory.
    if(!door&&decision==='lever')door=st.doors.find(d=>!d.open&&d.roomKey===prop.room?.x+','+prop.room?.y);
    if(door)changed=openDoor(door);
    if(decision==='lever'){
     const cleared=disarm(prop.room);
     emit('light',Math.min(16,Math.max(0,100-(run.torchLightLevel||0))));
     emit('log','⚙️ Un meccanismo modifica la stanza.'+(cleared?' Trappole neutralizzate: '+cleared+'.':''));
     changed=true;
    }
   }
   emit('render');
   return changed;
  }
  function draw(ctx,c,cell,stamp=now(),visibility=null){
   const run=getRun(),st=setup();if(!run||!st)return;
   for(const d of st.doors){
    const k=d.x+','+d.y;
    const seen=run.seen?.has(k),visible=run.visible?.has(k);
    if(!seen||!visibility&& !visible)continue;
    const vx=d.x-c.sx,vy=d.y-c.sy;
    if(vx<0||vy<0||(c.view&&vx>=c.view)||(c.view&&vy>=c.view))continue;
    const x=vx*cell,y=vy*cell;
    const progress=!d.open?0:Math.max(0,Math.min(1,(stamp-(d.openingAt||0))/640));
    ctx.save();ctx.globalAlpha=visible?0.94:0.35;
    ctx.strokeStyle='#c9b879';ctx.lineWidth=Math.max(1,cell*.07);
    ctx.strokeRect(x+cell*.12,y+cell*.08,cell*.76,cell*.84);
    const doorW=cell*.32*(1-progress);
    ctx.fillStyle=d.open?'#5a8d83':'#4d5d65';
    if(doorW>0.5){ctx.fillRect(x+cell*.17,y+cell*.15,doorW,cell*.7);ctx.fillRect(x+cell*.83-doorW,y+cell*.15,doorW,cell*.7)}
    ctx.fillStyle=d.open?'#b9f4da':'#ebd08b';
    ctx.font='bold '+Math.max(10,Math.round(cell*.29))+'px sans-serif';
    ctx.fillText(d.open?'✧':'◇',x+cell*.5,y+cell*.5);
    ctx.restore();
   }
  }
  return Object.freeze({setup,doorAt,bump,outcome,draw,types:[...LEVERS],allDoors:()=>setup()?.doors||[]});
 }
 global.ThresholdPhaseBWorld=Object.freeze({create,levers:[...LEVERS]});
})(typeof globalThis!=='undefined'?globalThis:this);
