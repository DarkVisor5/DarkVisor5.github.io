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
  return {finished:false,hp:s.hp,maxHp:s.maxHp,player:{x:s.player.x,y:s.player.y},boss:boss?{x:boss.x,y:boss.y,hp:boss.hp,telegraph:!!boss.telegraph,kind:boss.bossKind}:null,moves,potions:s.inventory.filter(i=>i.kind==='heal').map(i=>i.id),weapons:s.inventory.filter(i=>i.kind==='weapon').map(i=>({id:i.id,uid:i.uid,uses:i.uses})),equippedUid:s.equippedUid,alarm:s.alarm};
 }
};