window.__feasibilityQA={
 setup(floor,profile){
  startRun();s.floor=floor;Object.assign(s,generateFloor(floor));v18RoomDecor();phaseBWorld?.setup();
  const boss=s.enemies.find(e=>e.boss);
  if(!boss)throw Error('Missing boss');
  s.enemies=[boss];s.traps=[];
  s.inventory=[...profile.weapons.map(id=>weaponItem(id)),...profile.potions.map(id=>({kind:'heal',id}))];
  s.equippedUid=s.inventory[0]?.uid||null;s.maxHp=profile.maxHp;s.hp=profile.hp;
  s.alarm=0;s.instability=0;s.alarmStage=0;s.instStage=0;
  const legal=p=>s.map[p.y]?.[p.x]!==undefined&&s.map[p.y][p.x]!=='#'&&!v18SolidDecorationAt(p.x,p.y);
  const tile=[[0,-1],[1,0],[0,1],[-1,0]].map(([dx,dy])=>({x:boss.x+dx,y:boss.y+dy})).find(legal);
  if(!tile)throw Error('No start tile');
  s.player={...tile,facing:'up'};updateVisibility();render();
  return this.view();
 },
 view(){
  if(!s)return {finished:true};
  const boss=s.enemies.find(e=>e.boss);
  const moves=Object.entries({ArrowUp:[0,-1],ArrowRight:[1,0],ArrowDown:[0,1],ArrowLeft:[-1,0]})
   .map(([key,[dx,dy]])=>({key,x:s.player.x+dx,y:s.player.y+dy}))
   .filter(p=>s.visible.has(K(p.x,p.y))&&s.map[p.y]?.[p.x]!==undefined&&s.map[p.y][p.x]!=='#'&&!v18SolidDecorationAt(p.x,p.y)&&!(boss?.hp>0&&boss.x===p.x&&boss.y===p.y));
  const delta=[[0,-1,'ArrowUp'],[1,0,'ArrowRight'],[0,1,'ArrowDown'],[-1,0,'ArrowLeft']];
  const door=s.keyPuzzle?.door;
  const pass=(x,y)=>s.seen.has(K(x,y))&&s.map[y]?.[x]!==undefined&&s.map[y][x]!=='#'&&
    !v18SolidDecorationAt(x,y)&&!(door&&!door.open&&door.x===x&&door.y===y);
  const goals=new Set(boss&&boss.hp>0?delta.map(([dx,dy])=>K(boss.x+dx,boss.y+dy))
       .filter(k=>{const [x,y]=k.split(',').map(Number);return pass(x,y)}):[]);
  const queue=[{x:s.player.x,y:s.player.y,first:null}],visited=new Set([K(s.player.x,s.player.y)]);
  let pathStep=null;
  for(let q=0;q<queue.length;q++){
    const at=queue[q],k=K(at.x,at.y);
    if(goals.has(k)){pathStep=at.first;break}
    for(const [dx,dy,key] of delta){
      const x=at.x+dx,y=at.y+dy,n=K(x,y);
      if(visited.has(n)||!pass(x,y)||(boss&&boss.hp>0&&boss.x===x&&boss.y===y))continue;
      visited.add(n);queue.push({x,y,first:at.first||key});
    }
  }
  return {finished:false,pathStep,hp:s.hp,maxHp:s.maxHp,player:{x:s.player.x,y:s.player.y},boss:boss?{x:boss.x,y:boss.y,hp:boss.hp,telegraph:!!boss.telegraph,kind:boss.bossKind}:null,moves,potions:s.inventory.filter(i=>i.kind==='heal').map(i=>i.id),weapons:s.inventory.filter(i=>i.kind==='weapon').map(i=>({id:i.id,uid:i.uid,uses:i.uses})),equippedUid:s.equippedUid,alarm:s.alarm};
 }
};