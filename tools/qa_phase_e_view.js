
window.__humanBotView=()=>{
 if(!s){const summary=root.querySelector('#runSummary'),finished=!!summary&&!summary.classList.contains('hidden');return {inGame:false,finished,summary:finished?{title:root.querySelector('#summaryTitle')?.textContent||'Fine partita'}:null,log:[...root.querySelectorAll('#log .log-entry')].slice(0,8).map(e=>e.textContent)}}
 const visible=s.visible,seen=s.seen,key=o=>K(o.x,o.y),isKnown=o=>!!o&&seen.has(key(o)),isNow=o=>!!o&&visible.has(key(o));
 const puzzle=s.keyPuzzle||{},location=o=>isKnown(o)?{x:o.x,y:o.y,...(o.name?{name:o.name}:{})}:null;
 const q={
  key:location(puzzle.key),tablet:location(puzzle.tablet),decoder:location(puzzle.decoder),
  shrine:location(puzzle.shrine),anchor:location(puzzle.anchor),door:location(puzzle.door),
  sigils:(puzzle.sigils||[]).map(o=>location(o)),
  finalSeal:location(puzzle.finalSeal),
  open:!!puzzle.door?.open,found:!!puzzle.keyFound,
  tabletRead:!!puzzle.tabletRead,decoderRead:!!puzzle.decoderRead,
  type:puzzle.type,
  route:puzzle.tabletRead?(puzzle.route||[]):[],
  routeActive:!!puzzle.routeActive,routeProgress:puzzle.routeProgress||0,
  sigilProgress:puzzle.sigilProgress||0
 };
 const inv=s.inventory.map(i=>i.kind==='heal'?{kind:'heal',id:i.id}:{kind:i.kind,id:i.id,uses:i.uses,uid:i.uid,
  power:W[i.id]?((W[i.id].min+W[i.id].max)/2):0,family:W[i.id]?.family});
 return {
  inGame:!root.querySelector('#game').classList.contains('hidden'),
  finished:!root.querySelector('#runSummary').classList.contains('hidden'),
  summary:!root.querySelector('#runSummary').classList.contains('hidden')?{title:root.querySelector('#summaryTitle').textContent}:null,
  floor:s.floor,hp:s.hp,maxHp:s.maxHp,player:{x:s.player.x,y:s.player.y},
  torch:torchLight(),alarm:s.alarm,instability:s.instability,kills:s.kills,coins:s.runCoins,
  log:[...root.querySelectorAll('#log .log-entry')].slice(0,8).map(e=>e.textContent),
  artifacts:[...s.artifactBelt],artifactBuffs:{stone:!!s.artifactBuffs?.stone,blood:s.artifactBuffs?.blood||0,power:s.artifactBuffs?.power||0},
  stats:{...s.stats},steps:s.steps,atStairs:!!s.atStairs,eventOpen:!!s.eventOpen,rewardOpen:!!s.rewardOpen,
  targetMode:!!s.targetMode,inventory:inv,capacity:maxInv(),equippedUid:s.equippedUid,
  world:s.map.map((row,y)=>Array.from({length:row.length},(_,x)=>seen.has(K(x,y))?row[x]:'?').join('')),
  knownCount:seen.size,visibleCount:visible.size,
  stairs:location(s.stairs),puzzle:q,
  enemies:s.enemies.filter(o=>o.hp>0&&isNow(o)).map(o=>({x:o.x,y:o.y,hp:o.hp,family:o.family,boss:!!o.boss,bossKind:o.bossKind||null,state:o.state,tier:o.tier,telegraph:!!o.telegraph,armored:!!o.armored})),
  // Furniture that was visible earlier stays in the player's explored-map memory.
  props:v18RoomDecor().filter(o=>{for(let y=o.y;y<o.y+o.h;y++)for(let x=o.x;x<o.x+o.w;x++)if(seen.has(K(x,y)))return true;return false}).map(o=>({x:o.x,y:o.y,w:o.w,h:o.h,type:o.type,solid:o.solid})),
  traps:s.traps.filter(o=>o.revealed&&isKnown(o)).map(o=>({x:o.x,y:o.y,triggered:o.triggered})),
  loot:s.loot.filter(isKnown).map(o=>({x:o.x,y:o.y,kind:o.kind,id:o.id})),
  chests:s.chests.filter(isKnown).map(o=>({x:o.x,y:o.y,opened:o.opened})),
  rareEvent:location(s.rareEvent),dangerDoor:location(s.dangerDoor),
  dialog:{
   guide:!root.querySelector('#guideOverlay').classList.contains('hidden'),
   puzzle:!root.querySelector('#puzzlePanel').classList.contains('hidden'),
   event:!root.querySelector('#eventPanel').classList.contains('hidden'),
   danger:!root.querySelector('#dangerPanel').classList.contains('hidden'),
   phaseB:!!root.querySelector('#phaseBOverlay')&&!root.querySelector('#phaseBOverlay').hidden
  }
 };
};
