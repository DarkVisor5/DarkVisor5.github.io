/* QA-only, passive inventory/HP observer. Does not inspect hidden world state,
 * mutate game data, choose actions, change controls, or grant resources. */
(()=>{
 const original=window.__humanBotView;
 if(typeof original!=='function')throw new Error('Missing player-visible observation');
 let runs=0,entries={},firstBoss={},atStairs={},worst={},newFloor={};
 const snapshot=v=>{
  const weapons=v.inventory.filter(i=>i.kind==='weapon');
  const swords=weapons.filter(i=>i.family==='sword'&&i.uses>0);
  const heals=v.inventory.filter(i=>i.kind==='heal');
  const small=heals.filter(i=>i.id==='small').length,large=heals.filter(i=>i.id==='large').length;
  const equipped=v.inventory.find(i=>i.uid===v.equippedUid);
  return {
   floor:v.floor,hp:v.hp,maxHp:v.maxHp,healthPercent:v.maxHp?Number((v.hp/v.maxHp).toFixed(3)):null,
   smallPotions:small,largePotions:large,healsTotal:small+large,healingPotentialBase:10*small+20*large,
   inventorySlots:v.inventory.length,capacity:v.capacity,
   weaponCount:weapons.length,swordCount:swords.length,
   swordDurability:swords.reduce((a,w)=>a+(w.uses||0),0),
   swords:swords.map(w=>({id:w.id,uses:w.uses,power:w.power})),
   otherWeapons:weapons.filter(w=>w.family!=='sword').map(w=>({id:w.id,family:w.family,uses:w.uses,power:w.power})),
   equipped:equipped?{id:equipped.id,uses:equipped.uses,family:equipped.family}:null,
   alarm:v.alarm,instability:v.instability,torch:v.torch,kills:v.kills,
   knownCount:v.knownCount,steps:v.steps,
   atStairs:v.atStairs,
   // More stringent than simply having "3 potions". Matches the isolated
   // intermediate fixture (40/45 HP, 2x short+one large, 3 good swords).
   meetsIntermediateResourceThreshold:v.hp>=40&&small>=2&&large>=1&&
    swords.filter(w=>['longSword','duelistSword'].includes(w.id)).length>=3,
   hpAtLeast40:v.hp>=40,
   hasThreePotions:heals.length>=3,
   hasThreeSwords:swords.length>=3
  };
 };
 const record=v=>{
  if(!v?.inGame||v.finished||!Number.isInteger(v.floor))return v;
  const k=String(v.floor);
  const snap=snapshot(v);
  if(!entries[k])entries[k]=snap;
  if(!worst[k]||snap.hp<worst[k].hp)worst[k]=snap;
  if(v.atStairs&&!atStairs[k])atStairs[k]=snap;
  if(!firstBoss[k]&&v.enemies?.some(e=>e.boss))firstBoss[k]=snap;
  return v;
 };
 window.__humanBotView=(...args)=>record(original(...args));
 window.__qaResourceTelemetry={
  reset(){runs++;entries={};firstBoss={};atStairs={};worst={};newFloor={};},
  report(){return JSON.parse(JSON.stringify({
   version:1,source:'observations_only',runSerial:runs,
   entryByFloor:entries,firstVisibleBossByFloor:firstBoss,
   stairsByFloor:atStairs,lowestHpByFloor:worst
  }))}
 };
})();