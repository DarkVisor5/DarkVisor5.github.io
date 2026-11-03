'use strict';
/* THRESHOLD_CHANGE_ID: THR-20261103-005 — QA visible event/artifact strategy and quake dodge; no gameplay edits. */
/* THRESHOLD_CHANGE_ID: THR-20261103-004 — real UI resource management and seen wall torches, QA only. */
/* THRESHOLD_CHANGE_ID: THR-20261103-002 — safer observed-resource/navigation policy and honest terminal telemetry.
   QA bot only; no v18.26 gameplay or v17 stable changes. */
/* THRESHOLD_CHANGE_ID: THR-20261103-001 — conservative Phase F QA bot.
   Narrow changes to observed supplies and noisy chests. Gameplay v18.26 unchanged. */
(function(global){
 const directions=[['ArrowUp',0,-1],['ArrowRight',1,0],['ArrowDown',0,1],['ArrowLeft',-1,0]];
 const root=()=>document.querySelector('#dungeon-fixed');
 const key=(x,y)=>x+','+y;
 const close=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
 const strengths={spear:['sword','dagger'],sword:['dagger','axe'],dagger:['axe','hammer'],axe:['hammer','spear'],hammer:['spear','sword']};
 const matchup=(weapon,enemy)=>weapon==='unarmed'||weapon===enemy?1:(strengths[weapon]?.includes(enemy)?1.35:.65);
 const healAmount=i=>i.id==='large'?20:10;
 const basicWeaponScore=(i)=>i.power*(1+(i.family==='axe'?-.12:0))+(i.uses||0)*.22;
 function enemyWeaponScore(i,e,group){
  if(!i||i.kind!=='weapon'||i.uses<=0)return -Infinity;
  const near=close(e,group.player);
  let score=basicWeaponScore(i)*matchup(i.family,e.family);
  if(i.family==='sword'&&near===1)score+=8.5; // sword+master+bulwark means Guard after attacking
  if(i.family==='spear'&&near===2)score+=5.5; // free reach before retaliation
  if(i.family==='axe'&&group.enemies.filter(o=>Math.max(Math.abs(o.x-group.player.x),Math.abs(o.y-group.player.y))===1).length>1)score+=4;
  if(i.family==='hammer'&&e.boss)score-=1.5; // boss immunity to stun
  return score;
 }
 function threatening(v){return v.enemies.filter(e=>close(e,v.player)<=3);}
 function bestWeapon(v){
   const weapons=v.inventory.filter(i=>i.kind==='weapon'&&i.uses>0);
   const near=threatening(v).sort((a,b)=>close(a,v.player)-close(b,v.player))[0];
   return weapons.sort((a,b)=>{
      const aScore=near?enemyWeaponScore(a,near,v):basicWeaponScore(a)+(a.family==='sword'?4.5:0);
      const bScore=near?enemyWeaponScore(b,near,v):basicWeaponScore(b)+(b.family==='sword'?4.5:0);
      return bScore-aScore;
   })[0]||null;
 }
 function attackable(v,e,weapon){
  const d=close(e,v.player),dx=e.x-v.player.x,dy=e.y-v.player.y;
  if(weapon?.family==='axe')return Math.max(Math.abs(dx),Math.abs(dy))===1;
  if(weapon?.family==='spear'){
    if(dx&&dy)return false;
    if(d===1)return true;
    if(d===2){
     const m={x:v.player.x+Math.sign(dx),y:v.player.y+Math.sign(dy)};
     const k=key(m.x,m.y);
     return passable(tile(v,m.x,m.y))&&!allProps(v).has(k)&&
       !v.enemies.some(o=>o.x===m.x&&o.y===m.y);
    }
   }
  return d===1;
 }
 function retreat(v,nav){
  const e=threatening(v).filter(e=>e.state==='alerted'||e.boss);
  if(!e.length||nav.retreatCooldown>(nav.turn||0))return null;
  const solids=allProps(v),traps=visibleTrap(v);
  const risk=at=>e.reduce((total,foe)=>{
   const distance=close(foe,at);
   return total+(distance===0?100:distance===1?30:distance===2?9:distance===3?3:0)+(foe.boss?4:0);
  },0);
  const current=risk(v.player),choices=[];
  for(const [dir,dx,dy] of directions){
   const target={x:v.player.x+dx,y:v.player.y+dy},id=key(target.x,target.y);
   if(!passable(tile(v,target.x,target.y))||solids.has(id)||traps.has(id)||
      v.enemies.some(e=>e.x===target.x&&e.y===target.y)||
      (v.puzzle.door&&!v.puzzle.open&&key(v.puzzle.door.x,v.puzzle.door.y)===id))continue;
   const score=risk(target)+Math.min(18,(nav.visit?.get(id)||0)*3)+
     (nav.lastRetreat===id?22:0)+(v.stairs?close(target,v.stairs)*.01:0);
   choices.push({dir,point:target,score});
  }
  choices.sort((a,b)=>a.score-b.score);
  const best=choices[0];
  // Retreat only when it measurably reduces the immediate danger.
  if(best&&best.score<current-7){
   nav.retreatCooldown=(nav.turn||0)+4;
   nav.lastRetreat=key(v.player.x,v.player.y);
   return best.dir;
  }
  return null;
 }
 let recentKey=null;
 const send=k=>{recentKey=k;root().dispatchEvent(new KeyboardEvent('keydown',{key:k,bubbles:true,cancelable:true}))};
 const click=selector=>{let b=root().querySelector(selector);if(b&&!b.disabled){b.click();return true}return false};
 const tile=(v,x,y)=>v.world[y]?.[x]||'?';
 const passable=t=>t==='.'||t==='>';
 const allProps=v=>new Set(v.props.filter(x=>x.solid).flatMap(o=>{const a=[];for(let y=o.y;y<o.y+o.h;y++)for(let x=o.x;x<o.x+o.w;x++)a.push(key(x,y));return a}));
 const visibleTrap=v=>new Set(v.traps.filter(t=>!t.triggered).map(t=>key(t.x,t.y)));
 function graph(v,nav={}){
  const solids=allProps(v),trap=visibleTrap(v),enemies=new Set(v.enemies.map(e=>key(e.x,e.y))),p=v.puzzle,d=p.door;
  const block=k=>solids.has(k)||trap.has(k)||enemies.has(k)||(!p.open&&d&&key(d.x,d.y)===k);
  const start=v.player,dist=new Map([[key(start.x,start.y),0]]),prev=new Map,queue=[start],visited=new Set();
  // Dijkstra, tracks risk and revisits. Enemy positions cannot be traversed.
  while(queue.length){
   queue.sort((a,b)=>dist.get(key(b.x,b.y))-dist.get(key(a.x,a.y)));
   const here=queue.pop(),id=key(here.x,here.y);
   if(visited.has(id))continue;
   visited.add(id);
   for(const [k,dx,dy] of directions){
    const x=here.x+dx,y=here.y+dy,next=key(x,y);
    if(!passable(tile(v,x,y))||block(next)||((nav.banned?.get(id+'>'+next)||0)>(nav.turn||0)))continue;
    let step=1;
    const nearEnemy=v.enemies.some(e=>Math.abs(e.x-x)+Math.abs(e.y-y)<=2);
    if(nearEnemy)step+=18;
    // Only a modest extra cost near visible higher-tier enemies.
    if(v.enemies.some(e=>/elite|champion|rare|red|purple/i.test(String(e.tier||''))&&
      Math.abs(e.x-x)+Math.abs(e.y-y)<=2))step+=7;
    const candidate=dist.get(id)+step;
    if(candidate<(dist.get(next)??Infinity)){dist.set(next,candidate);prev.set(next,{from:id,dir:k});queue.push({x,y})}
   }
  }
  return {dist,prev,solids,trap,enemies};
 }
 function nextStep(g,goal,player){
  if(!goal)return null;const end=key(goal.x,goal.y),from=key(player.x,player.y);
  if(end===from)return null;
  if(!g.dist.has(end))return null;
  let cur=end,iterations=0;
  while(g.prev.get(cur)&&g.prev.get(cur).from!==from&&iterations++<4000)cur=g.prev.get(cur).from;
  return g.prev.get(cur)?.dir||null;
 }

 // THR-20261103-004 — rank only player-visible equipment.
 function expendableWeapon(v){
  const w=v.inventory.filter(i=>i.kind==='weapon'&&i.uses>0);
  if(w.length<=3)return null;
  const ranked=[...w].sort((a,b)=>basicWeaponScore(b)-basicWeaponScore(a));
  const keep=new Set(ranked.slice(0,2).map(i=>i.uid));
  w.filter(i=>i.family==='sword').sort((a,b)=>basicWeaponScore(b)-basicWeaponScore(a)).slice(0,2).forEach(i=>keep.add(i.uid));
  const other=w.filter(i=>i.uid!==v.equippedUid&&!keep.has(i.uid));
  const fallback=w.filter(i=>i.uid!==v.equippedUid);
  return (other.length?other:fallback).sort((a,b)=>basicWeaponScore(a)-basicWeaponScore(b))[0]||null;
 }
 function discardWeakWeapon(v,nav,metrics,threats){
  const w=v.inventory.filter(i=>i.kind==='weapon'&&i.uses>0),cap=v.capacity||10;
  const healNearby=v.loot.some(l=>l.kind==='heal'&&close(l,v.player)<=5);
  if(w.length<=(v.floor>=3?4:5)||threats.some(e=>close(e,v.player)<=2))return false;
  if(v.inventory.length<cap-2&&!healNearby)return false;
  const worst=expendableWeapon(v);
  if(!worst)return false;
  const idx=v.inventory.findIndex(i=>i.uid===worst.uid);
  const row=[...root().querySelectorAll('#inventory .inv-row')][idx];
  const btn=[...(row?.querySelectorAll('button')||[])].find(el=>/Lascia/i.test(el.textContent||''));
  if(!btn||btn.disabled)return false;
  btn.click(); // Actual inventory discard button; no mutation of game state.
  (nav.ignoredLoot??=new Set()).add(key(v.player.x,v.player.y)+':'+worst.id);
  metrics.weaponDrops=(metrics.weaponDrops||0)+1;
  return true;
 }
 function useChosenHeal(v,heal){
  const first=v.inventory.findIndex(i=>i.kind==='heal'),idx=v.inventory.indexOf(heal);
  if(idx===first)return click('#healBtn');
  const row=[...root().querySelectorAll('#inventory .inv-row')][idx];
  const btn=[...(row?.querySelectorAll('button')||[])].find(el=>/^Usa$/i.test((el.textContent||'').trim()));
  if(btn&&!btn.disabled){btn.click();return true}
  return click('#healBtn');
 }

 // THRESHOLD_CHANGE_ID: THR-20261103-005 — visible game-choice decisions.
 function chooseEvent(v,opts){
  const find=re=>opts.find(x=>!x.disabled&&re.test(x.textContent||''));
  const loss=Math.max(0,v.maxHp-v.hp),critical=v.hp<v.maxHp*.48;
  const pots=v.inventory.filter(i=>i.kind==='heal').length;
  const swords=v.inventory.filter(i=>i.kind==='weapon'&&i.uses>0).length;
  const alarm=find(/-\s*(?:10|18|20|25)\s*Allarme/i);
  const instant=find(/Recupera\s+18\s*HP|Cura\s+12\s*HP|Riposa.*\+10\s*HP|Guardia immediata.*12\s*HP/i);
  const full=find(/Cura completa/i),supply=find(/Pozione grande|Recupera scorte|Arma avanzata \+ pozione/i);
  if(find(/HP massimi/i))return find(/HP massimi/i);
  if(find(/Liberalo/i))return find(/Liberalo/i);
  if(full&&loss>=22&&v.instability<60)return full;
  if(instant&&critical&&loss>=7)return instant;
  if(alarm&&v.alarm>=55&&!(critical&&loss>=12&&instant))return alarm;
  if(supply&&(pots<2||swords<2))return supply;
  if(instant&&loss>=6)return instant;
  if(full&&loss>=13&&v.instability<65)return full;
  if(full&&instant)return instant; // avoid needless instability.
  if(alarm&&v.alarm>=22)return alarm;
  const artifact=find(/Artefatto raro/i);
  if(artifact&&(v.artifacts||[]).length<3&&swords>=2)return artifact;
  if(supply)return supply;
  const route=find(/Rivela scale e stanze speciali/i);
  if(route&&!v.stairs)return route;
  return find(/Lascialo stare|Non toccarlo|Ignoralo|\+2 KO all.arma|-12 Instabilità/i)||
   opts.find(x=>!x.disabled)||null;
 }
 function chooseArtifact(v){
  if(v.artifactUsedThisTurn)return null;
  const a=v.artifacts||[],near=v.enemies.filter(e=>close(e,v.player)<=3);
  if(a.includes('silence')&&v.alarm>=62)return 'silence';
  if(a.includes('stone')&&!v.artifactBuffs?.stone&&near.some(e=>(e.state==='alerted'||e.boss)&&close(e,v.player)<=2))return 'stone';
  if(a.includes('heart')&&!(v.artifactBuffs?.power>0)&&near.some(e=>e.boss&&close(e,v.player)<=2))return 'heart';
  if(a.includes('eye')&&!near.length&&!v.stairs&&v.knownCount>=100&&(v.floor>=3||(v.steps||0)>=120))return 'eye';
  return null;
 }
 function useArtifact(v,metrics){
  const id=chooseArtifact(v);if(!id)return null;
  const index=v.artifacts.indexOf(id);
  const btn=[...root().querySelectorAll('#artifactBelt .artifact-row')][index]?.querySelector('button');
  if(btn&&!btn.disabled){btn.click();metrics.artifactUses=(metrics.artifactUses||0)+1;return 'artifact_'+id}
  return null;
 }
 function dodgeVisibleQuake(v,nav){
  const boss=v.enemies.find(e=>e.bossKind==='final'&&e.telegraph&&close(e,v.player)<=1);
  if(!boss)return null;
  const props=allProps(v),traps=visibleTrap(v),candidates=[];
  for(const [dir,dx,dy] of directions){
   const cell={x:v.player.x+dx,y:v.player.y+dy},id=key(cell.x,cell.y),from=key(v.player.x,v.player.y);
   if(!passable(tile(v,cell.x,cell.y))||props.has(id)||traps.has(id)||
     v.enemies.some(e=>e.x===cell.x&&e.y===cell.y)||
     (v.puzzle.door&&!v.puzzle.open&&key(v.puzzle.door.x,v.puzzle.door.y)===id)||
     (nav.banned?.get(from+'>'+id)||0)>(nav.turn||0)||close(boss,cell)<=1)continue;
   candidates.push({dir,score:v.enemies.filter(e=>e!==boss&&close(e,cell)<=2).length*12+(nav.visit?.get(id)||0)*1.5});
  }
  candidates.sort((a,b)=>a.score-b.score);return candidates[0]?.dir||null;
 }
 function goals(v,history,graph,nav){
  const q=v.puzzle,actions=[];
  // THR-20261103-001: avoid the long supply tours that hurt paired-run results.
  const medicines=v.inventory.filter(i=>i.kind==='heal');
  const seenThreat=v.enemies.some(e=>close(e,v.player)<=3);
  const immediateThreat=v.enemies.some(e=>close(e,v.player)<=2);
  const push=(x,weight=0,label='goal')=>{if(x&&graph.dist.has(key(x.x,x.y)))actions.push({point:x,score:graph.dist.get(key(x.x,x.y))+weight,label})};
  // Floors 1–3 contain an optional threshold chamber. The route to the
  // staircase is NOT gated by the optional chamber; floor 3 IS boss-gated.
  if(v.floor<=3){
    if(!nav.stairsBlocked)push(v.stairs,-440,'stairs');
  }else if(!q.found){
    if(v.floor===4){if(!q.tabletRead)push(q.tablet,-520,'tablet');else if(!q.decoderRead)push(q.decoder,-520,'decoder');else push(q.shrine,-500,'shrine')}
    if(v.floor===5){if(!q.tabletRead)push(q.tablet,-520,'tablet');else if(!q.decoderRead)push(q.decoder,-520,'decoder');else if(q.sigilProgress<3)push(q.sigils[q.sigilProgress],-510,'sigil');else push(q.finalSeal,-520,'finalSeal')}
  }else push(v.stairs,-450,'stairs');
  // THRESHOLD_CHANGE_ID: THR-20261103-003 — observed ordinary foe blocking
  // the only discovered route to the stairs. Prefer a legal adjacent approach
  // only with enough HP and a real potion; do not inspect unseen enemies.
  const stairKnown=!!v.stairs&&!nav.stairsBlocked&&v.floor<=3;
  const stairUnreachable=stairKnown&&!graph.dist.has(key(v.stairs.x,v.stairs.y));
  if(stairUnreachable&&v.hp>=v.maxHp*.65&&medicines.length>0){
    const blockers=v.enemies.filter(e=>!e.boss&&!/elite|champion|red|purple/i.test(String(e.tier||''))&&close(e,v.player)<=5);
    blockers.sort((a,b)=>close(a,v.player)-close(b,v.player));
    const e=blockers[0];
    if(e)for(const [,dx,dy] of directions){
      const spot={x:e.x+dx,y:e.y+dy};
      if(key(spot.x,spot.y)!==key(v.player.x,v.player.y))push(spot,-710,'blocker');
    }
  }
  // The boss is a known required obstacle once it is actually seen. Approach
  // any reachable free orthogonal neighbor, no hidden coordinates.
  for(const boss of v.enemies.filter(e=>e.boss)){
    for(const [,dx,dy] of directions){
      const spot={x:boss.x+dx,y:boss.y+dy};
      push(spot,-850,'boss');
    }
  }
  // Loot only when it is on the way or urgently required; avoid side trips.
  for(const l of v.loot){
   const id=key(l.x,l.y),distance=graph.dist.get(id);
   if(distance===undefined||(history.get(id)||0)>=3)continue;
   if(nav.ignoredLoot?.has(id+':'+l.id))continue;
   if(!(l.kind==='torch'||v.inventory.length<(v.capacity||10)))continue;
   if(l.kind==='weapon'&&v.inventory.filter(i=>i.kind==='weapon'&&i.uses>0).length>=5)continue;
   // Prioritize only a very nearby known heal when genuinely critical.
   // Keep the conservative rule except for a tiny, safe observed detour while
   // the P3 boss gate is known blocked. No speculative supply tours.
   const bossPrep=v.floor===3&&nav.stairsBlocked&&v.hp<v.maxHp*.65&&distance<=4&&!immediateThreat;
   const critical=v.hp<v.maxHp*.55&&distance<=6&&!seenThreat;
   const scarce=v.floor>=2&&medicines.length<2&&distance<=5&&!seenThreat&&v.hp<v.maxHp*.88;
   const deep=v.floor>=4&&medicines.length<2&&distance<=6&&!seenThreat;
   if(l.kind==='heal'&&(bossPrep||critical||scarce||deep))
     push(l,bossPrep?-930:-530,'supply_heal');
   else if(nav.stairsBlocked&&distance<=6&&!seenThreat)push(l,1.5,'loot');
   else if(!nav.stairsBlocked)push(l,1.5,'loot');
  }
  // Known harvestable wall torches: only the adjacent standing tile is a goal.
  // THR-20261103-005 — light detours capped by progress, risk and alarm.
  if(v.torch<=22&&!seenThreat&&v.hp>=v.maxHp*.50&&
    (nav.torchTravelSteps||0)<16&&!(v.floor>=3&&v.alarm>=68))for(const t of v.wallTorches||[]){
   if(nav.failedTorches?.has(key(t.x,t.y)))continue;
   for(const [,dx,dy] of directions){
    const at={x:t.x+dx,y:t.y+dy},distance=graph.dist.get(key(at.x,at.y));
    if(distance!==undefined&&distance<=8)push(at,-540,'wall_torch');
   }
  }
  // Skip optional noisy chests if alarm is high or visible foes are close.
  if(v.alarm<55&&!seenThreat)
   for(const chest of v.chests)if(!nav.stairsBlocked&&!chest.opened&&
     (history.get(key(chest.x,chest.y))||0)<3)push(chest,4,'chest');
  // Explored-but-not-visited frontiers: a frontier is a visible passable
  // tile next to unexplored map cells. No hidden tiles inspected.
  const explored=v.world;
  for(const [id,dist] of graph.dist){
   if(dist>2000)continue;
   const [x,y]=id.split(',').map(Number),neighborDirs=directions.filter(([_,dx,dy])=>tile(v,x+dx,y+dy)==='?');
   if(!neighborDirs.length)continue;
   const visits=history.get(id)||0;
   // Prefer fresh observed frontiers while preserving backtracking routes.
   // Permanently excluding a reached frontier caused stuck_no_known_path.
   if(visits>5)continue;
   const novelty=neighborDirs.length;
   actions.push({point:{x,y},score:dist+4+visits*18-novelty*1.4,label:'frontier'});
  }
  actions.sort((a,b)=>a.score-b.score);
  return actions;
 }
 function kindHintStairs(act,nav,v){return act==='stairs'||(v.stairs&&close(v.stairs,v.player)<=1)}
 function action(v,history,metrics,nav){
  if(v.finished||!v.inGame)return 'done';
  const dlg=v.dialog;
  if(dlg.guide){click('#guidePlayBtn');return 'close_tutorial'}
  if(dlg.puzzle){click('#puzzleCloseBtn');return 'close_puzzle'}
  if(dlg.phaseB){click('#phaseBClose');return 'close_furniture'}
  if(dlg.event){chooseEvent(v,[...root().querySelectorAll('#eventChoices button')])?.click();return 'event'}
  if(dlg.danger){click('#dangerChoices button:last-child');return 'avoid_danger'}
  if(v.rewardOpen){
   const buttons=[...root().querySelectorAll('#rewardChoices button')];
   const best=buttons.find(b=>/vigore|vital|vita/i.test(b.textContent))
          ||buttons.find(b=>/distillazione|cura|guar/i.test(b.textContent))
          ||buttons.find(b=>/furia affilata|poten|dann/i.test(b.textContent))
          ||buttons[0];
   best?.click();return 'reward';
  }
  if(v.atStairs){click('#descendBtn');return 'stairs'}
  if(v.targetMode){
    const buttons=[...root().querySelectorAll('#targetChoices .target-btn')];
    const weak=buttons.find(b=>/custode|signore del profondo/i.test(b.textContent))
      ||buttons.sort((a,b)=>{
        const parse=b=>{const m=b.textContent.match(/(\d+)\s*\/\s*(\d+)\s*HP/);return m?Number(m[1]):999};
        return parse(a)-parse(b);
      })[0];
    if(weak&&!weak.disabled){weak.click();return 'target'}
    send('Enter');return 'target';
  }
  const danger=threatening(v),near=danger.filter(e=>close(e,v.player)<=1),
        meds=v.inventory.filter(i=>i.kind==='heal');
  // THR-20261103-004 — use small first for modest damage; use large if badly hurt.
  const missing=v.maxHp-v.hp;
  const incoming=near.length*9+danger.filter(e=>close(e,v.player)===2).length*4;
  const preferLarge=missing>=17&&(v.hp<v.maxHp*.55||incoming>=9);
  const heal=(preferLarge?meds.find(i=>i.id==='large'):meds.find(i=>i.id==='small'))||meds[0];
  const expected=heal?healAmount(heal)*1.25:0;
  if(heal&&v.hp<v.maxHp&&(
     (near.length&&v.hp<=Math.max(expected+5,incoming+9))||
     (danger.length&&missing>=Math.max(8,expected-1)&&v.hp<=v.maxHp*.82)||
     (!danger.length&&missing>=expected&&v.hp<=v.maxHp*.5)
  )){
   if(useChosenHeal(v,heal))return 'heal';
  }
  const dodge=dodgeVisibleQuake(v,nav);
  if(dodge){send(dodge);metrics.quakeDodges=(metrics.quakeDodges||0)+1;return 'dodge_quake'}
  const artifact=useArtifact(v,metrics);
  if(artifact)return artifact;
  // Free capacity BEFORE a potion pickup; do not discard in immediate contact.
  if(discardWeakWeapon(v,nav,metrics,danger))return 'drop_weapon';
  // Bumping a previously seen harvestable torch is a normal player movement.
  if(v.torch<=22&&!danger.length){
   const t=(v.wallTorches||[]).find(o=>close(o,v.player)===1&&!nav.failedTorches?.has(key(o.x,o.y)));
   if(t){
    const dir=directions.find(([,dx,dy])=>v.player.x+dx===t.x&&v.player.y+dy===t.y);
    if(dir){nav.torchAttempt=key(t.x,t.y);send(dir[0]);return 'wall_torch'}
   }
  }
  // Match visible enemies against the real five-weapon-family advantage
  // chart and equip using the normal inventory UI, with no durability edits.
  const active=v.inventory.find(i=>i.uid===v.equippedUid);
  const best=bestWeapon(v),closest=danger.sort((a,b)=>close(a,v.player)-close(b,v.player))[0];
  const oldScore=closest?enemyWeaponScore(active,closest,v):active?basicWeaponScore(active):-Infinity;
  const newScore=closest?enemyWeaponScore(best,closest,v):best?basicWeaponScore(best):-Infinity;
  if(best&&best.uid!==v.equippedUid&&(!active||active.uses<=0||((nav.turn||0)>=(nav.equipCooldown||0)&&newScore>oldScore+2.75))){
   const rows=[...root().querySelectorAll('#inventory .inv-row')],index=v.inventory.findIndex(i=>i.uid===best.uid);
   if(index>=0&&rows[index]&&rows[index].querySelector('button')){
    rows[index].querySelector('button').click();nav.equipCooldown=(nav.turn||0)+15;return 'equip';
   }
  }
  const weapon=active?.uses>0?active:best;
  // When surrounded or one hit from dying, seek an explored safe tile. Do
  // not repeat retreats indefinitely (which would only worsen the alarm).
  if(near.length>1||(
     near.length&&v.hp<Math.min(v.maxHp*.52,20)&&
     near[0].hp>Math.max(6,(weapon?.power||2)*1.5))){
    const k=retreat(v,nav);
    if(k){send(k);metrics.retreats=(metrics.retreats||0)+1;return 'retreat'}
  }
  // Spears can attack from 2 squares and axes can hit diagonally. Combat
  // buttons apply the genuine weapon rules. Prefer weak hostile targets.
  const can=v.enemies.filter(e=>attackable(v,e,weapon));
  if(can.length){
   if(weapon?.family==='axe'){
    if(click('#attackBtn')){metrics.fights++;return 'axe_attack'}
   }
   can.sort((a,b)=>{
     const score=e=>(e.boss?-100:0)+(e.hp<=Math.max(3,(weapon?.power||2)*matchup(weapon?.family,e.family))?-35:0)+e.hp*.1+close(e,v.player);
     return score(a)-score(b)
   });
   const target=can[0],dx=Math.sign(target.x-v.player.x),dy=Math.sign(target.y-v.player.y);
   const arrow=directions.find(([_,x,y])=>x===dx&&y===dy);
   if(arrow){
    if(close(target,v.player)===2&&weapon?.family==='spear'){
     send(arrow[0]);metrics.fights++;return 'spear_reach';
    }
    if(close(target,v.player)===1){
     send(arrow[0]);metrics.fights++;return target.boss?'boss_fight':'fight'
    }
   }
  }
  const p=v.puzzle;
  // The route is only available after reading the in-world tablet.
  if(v.floor===3&&!p.found&&p.tabletRead&&p.route?.length===5&&p.routeActive){
   let expected={...p.anchor};
   for(let j=0;j<p.routeProgress;j++){const d={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[p.route[j]];expected.x+=d[0];expected.y+=d[1]}
   if(expected.x===v.player.x&&expected.y===v.player.y&&p.routeProgress<5){
    const dir={up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'}[p.route[p.routeProgress]];
    if(dir){send(dir);return 'route_step'}
   }
  }
  if(v.floor===2&&!p.found&&p.tabletRead&&p.shrine&&close(p.shrine,v.player)===0){send(' ');return 'wait_shrine'}
  if(v.floor===4&&!p.found&&p.decoderRead&&p.shrine&&close(p.shrine,v.player)===0){send(' ');return 'wait_runes'}
  if(v.floor===5&&!p.found&&p.sigilProgress===3&&p.finalSeal&&close(p.finalSeal,v.player)===0){send(' ');return 'wait_seal'}
  // Collect loot by walking onto the visible tile. If a boss is nearby,
  // approach it for a real melee confrontation.
  if(nav.stairsBlocked&&nav.turn-(nav.stairsBlockedAt||0)>240){nav.stairsBlocked=false;nav.goal=null;nav.label=null}
  // Reset per-floor navigation BEFORE planning; never apply the last floor's
  // boss-gate/visited-tile state to this floor's graph and objectives.
  if(nav.floor!==v.floor){nav.floor=v.floor;nav.goal=null;nav.label=null;nav.stairsBlocked=false;nav.banned=new Map();nav.recent=[];nav.visit=new Map();nav.ignoredLoot=new Set();nav.failedTorches=new Set();nav.torchTravelSteps=0;nav.equipCooldown=0;history.clear()}
  const graphState=graph(v,nav);
  let list=goals(v,history,graphState,nav);
  // Hold a selected destination unless it is gone or a higher-priority need appears.
  const urgent=list.find(o=>['stairs','boss','blocker','tablet','decoder','shrine','sigil','finalSeal','supply_heal','wall_torch'].includes(o.label));
  if(urgent&&nav.label!==urgent.label){nav.goal={...urgent.point};nav.label=urgent.label}
  if(nav.goal){
    const stillListed=list.some(o=>o.point.x===nav.goal.x&&o.point.y===nav.goal.y);
    if(close(nav.goal,v.player)===0||!stillListed||!graphState.dist.has(key(nav.goal.x,nav.goal.y))){
      nav.goal=null;nav.label=null;
    }
  }

  // Step away from a visible boss, if its proximity is fatal and a heal is available.
  const chosen=list[0];
  if(chosen&&close(chosen.point,v.player)===0){
   // On the destination already: avoid repeated waiting; goal may need an
   // adjacent path to approach a new frontier.
   list=list.filter(x=>close(x.point,v.player)>0);
  }
  let next=null,kind=null;
  if(nav.goal){
    const dir=nextStep(graphState,nav.goal,v.player);
    if(dir){next=dir;kind=nav.label}
  }
  if(!next)for(const candidate of list){
   const dir=nextStep(graphState,candidate.point,v.player);
   if(dir){
    next=dir;kind=candidate.label;
    nav.goal={...candidate.point};nav.label=candidate.label;
    break;
   }
  }
  // If an enemy is not adjacent but blocks the player's only known route,
  // move toward it and engage via actual player movement.
  if(!next&&v.enemies.length){
   const e=v.enemies.sort((a,b)=>close(a,v.player)-close(b,v.player))[0];
   const around=directions.map(([dir,dx,dy])=>({dir,x:v.player.x+dx,y:v.player.y+dy,d:Math.abs(v.player.x+dx-e.x)+Math.abs(v.player.y+dy-e.y)})).filter(o=>{
    const at=key(o.x,o.y),from=key(v.player.x,v.player.y);
    return passable(tile(v,o.x,o.y))&&!graphState.solids.has(at)&&!graphState.trap.has(at)&&
      !graphState.enemies.has(at)&&!(!p.open&&p.door&&key(p.door.x,p.door.y)===at)&&
      ((nav.banned?.get(from+'>'+at)||0)<=(nav.turn||0));
   });
   around.sort((a,b)=>a.d-b.d);
   if(around[0])next=around[0].dir,kind='pursuit';
  }
  if(!next)return 'stuck';
  if(kind==='wall_torch')nav.torchTravelSteps=(nav.torchTravelSteps||0)+1;
  send(next);
  return kind||'move';
 }
 // THRESHOLD_CHANGE_ID: THR-20261103-003 — 5,000 QA actions per full P1→P5 attempt.
 // THRESHOLD_CHANGE_ID: THR-20261103-003 — detect genuine 2–4 tile cycles
 // only when explored-map knowledge has not changed. Ban the next loop edge
 // temporarily; preserve paths for legitimate backtracking afterward.
 function breakShortCycle(recent,banned,turn){
  for(const period of [2,3,4]){
   if(recent.length<period*3)continue;
   const cycle=recent.slice(-period*3);
   if(cycle[0].known!==cycle[cycle.length-1].known)continue;
   if(new Set(cycle.slice(0,period).map(o=>o.id)).size!==period)continue;
   if(!cycle.every((o,i)=>o.id===cycle[i%period].id))continue;
   const from=cycle[cycle.length-1].id,to=cycle[0].id;
   banned.set(from+'>'+to,turn+160);
   return {period,from,to};
  }
  return null;
 }
 async function play100({count=100,limit=5000}={}){
  const results=[],t0=performance.now();
  const R=root();
  for(let game=1;game<=count;game++){
   const prior=results.length;
   const summary=R.querySelector('#runSummary');
   if(summary&&!summary.classList.contains('hidden'))click('#summaryRunBtn');
   else {if(!R.querySelector('#welcome')?.classList.contains('hidden'))click('#welcomeStartBtn');click('#enterBtn')}
   let history=new Map(),nav={floor:1,goal:null,label:null,stairsBlocked:false,stairsBlockedAt:0,banned:new Map(),recent:[],visit:new Map(),ignoredLoot:new Set(),failedTorches:new Set(),torchTravelSteps:0,retreatCooldown:0,equipCooldown:0,turn:0},turns=0,highest=1,metrics={fights:0,actions:{},heals:0},reason=null,last=null,noProgress=0,trace=[],last30=[],bestKills=0,deathScene=null,observedMoves=0,lastAlive=null;
   const started=performance.now();
   for(;turns<limit;turns++){
    const v=global.__humanBotView();
    if(v.finished||!v.inGame){reason=v.summary?.title||'finished';break}
    // Last genuine player-visible state is retained even when the game clears
    // the run before its summary screen (where s.steps may become zero).
    lastAlive={floor:v.floor,hp:v.hp,maxHp:v.maxHp,alarm:v.alarm,instability:v.instability,
      torch:v.torch,gameReportedSteps:v.steps,position:{...v.player},
      potions:v.inventory.filter(i=>i.kind==='heal').length};
    const pos=key(v.player.x,v.player.y),old=key(v.floor,pos);
    highest=Math.max(highest,v.floor);
    if(nav.lastPosition!==pos||nav.lastFloor!==v.floor){
      history.set(pos,(history.get(pos)||0)+1);
      nav.visit.set(pos,(nav.visit.get(pos)||0)+1);
      nav.lastPosition=pos;nav.lastFloor=v.floor;
    }
    nav.turn=turns;
    bestKills=Math.max(bestKills,v.kills||0);
    const recent=nav.recent;
    recent.push({id:pos,known:v.knownCount,turn:turns});
    if(recent.length>12)recent.shift();
    const cycle=breakShortCycle(recent,nav.banned,turns);
    if(cycle){
      nav.goal=null;nav.label=null;
      metrics.loopBreaks=(metrics.loopBreaks||0)+1;
    }
    recentKey=null;
    const act=action(v,history,metrics,nav);
    metrics.actions[act]=(metrics.actions[act]||0)+1;
    trace.push({t:turns,action:act,key:recentKey,from:v.player,goal:nav.goal,puzzle:v.puzzle,atStairs:v.atStairs,dialog:v.dialog,known:v.knownCount,enemies:v.enemies,props:v.props.filter(p=>close(p,v.player)<=3)});
    if(trace.length>12)trace.shift();
    if(act==='heal')metrics.heals++;
    if(act==='stuck'){reason='stuck_no_known_path';break}
    const after=global.__humanBotView();
    if(after.inGame&&!after.finished&&after.floor===v.floor&&after.player&&
       close(after.player,v.player)===1)observedMoves++;
    // THR-20261103-005 — actual restored wall torches, not path steps.
    if(v.wallTorches&&after.wallTorches&&after.floor===v.floor&&Number.isFinite(after.torch)){
      const available=new Set(after.wallTorches.map(t=>key(t.x,t.y)));
      const harvested=v.wallTorches.filter(t=>!available.has(key(t.x,t.y)));
      if(harvested.length&&after.torch>v.torch)
        metrics.wallTorchHarvests=(metrics.wallTorchHarvests||0)+harvested.length;
    }
    if(after.inGame&&after.floor===v.floor&&after.player){
      const at=key(after.player.x,after.player.y);
      const repicked=(v.loot||[]).filter(l=>l.kind==='weapon'&&key(l.x,l.y)===at&&
        nav.ignoredLoot?.has(at+':'+l.id));
      for(const item of repicked){
        const prev=v.inventory.filter(i=>i.kind==='weapon'&&i.id===item.id).length;
        const current=after.inventory.filter(i=>i.kind==='weapon'&&i.id===item.id).length;
        if(current>prev)metrics.weaponRepickups=(metrics.weaponRepickups||0)+1;
      }
    }
    if(act==='wall_torch'&&nav.torchAttempt){
      if(!(after.torch>v.torch))nav.failedTorches.add(nav.torchAttempt);
      nav.torchAttempt=null;
    }
    const postLog=after.log||[];
    // Learn public collision outcomes. A movement that does not change the
    // position and does not trigger combat/dialogue was blocked. Avoid this
    // edge for a while rather than issuing the same key for hundreds of turns.
    if(after.inGame&&recentKey&&/^(frontier|loot|chest|stairs|boss|pursuit|move|supply_heal)$/.test(act)&&
       after.floor===v.floor&&after.player?.x===v.player.x&&after.player?.y===v.player.y&&
       !after.dialog?.puzzle&&!after.dialog?.event&&!after.atStairs){
      const dir=directions.find(([code])=>code===recentKey);
      if(dir){
       nav.banned.set(pos+'>'+key(v.player.x+dir[1],v.player.y+dir[2]),turns+120);
       nav.goal=null;nav.label=null;
      }
    }
    if(postLog.some(msg=>/scale sono sigillate|SCONFIGGI IL BOSS|Scale sigillate/i.test(msg))&&
       v.floor===3&&kindHintStairs(act,nav,v)){nav.stairsBlocked=true;nav.stairsBlockedAt=turns;nav.goal=null;nav.label=null}
    const transition={
      turn:turns,floor:v.floor,command:recentKey,action:act,
      hpBefore:v.hp,hpAfter:Number.isFinite(after.hp)?after.hp:null,
      hpLost:Number.isFinite(after.hp)?Math.max(0,v.hp-after.hp):null,
      alarm:v.alarm,instability:v.instability,torch:v.torch,
      position:v.player,goal:nav.goal,visibleEnemies:v.enemies.map(e=>({x:e.x,y:e.y,hp:e.hp,tier:e.tier,boss:e.boss,family:e.family})),
      inventory:v.inventory.map(i=>({kind:i.kind,id:i.id,uses:i.uses,power:i.power})),
      seenTiles:v.knownCount,puzzle:{type:v.puzzle.type,found:v.puzzle.found},
      log:postLog.slice(0,5)
    };
    last30.push(transition);if(last30.length>30)last30.shift();
    if(after.finished)deathScene={...transition,summary:after.summary?.title,atEndOfRun:true};
    if(!after.finished){
      const mark=after.floor+':'+key(after.player.x,after.player.y)+':'+after.puzzle.found+':'+after.knownCount;
      if(last===mark)noProgress++;else noProgress=0;
      last=mark;
      if(noProgress>35){reason='no_progress';break}
    }
    if(turns%35===0)await new Promise(resolve=>setTimeout(resolve,0));
   }
   const lastView=global.__humanBotView();
   if(!reason)reason=lastView.finished?lastView.summary?.title:'action_limit';
   results.push({run:game,result:reason,finished:!!lastView.finished,floor:highest,
    hp:lastAlive?.hp??null,steps:observedMoves,stepsSource:'observed_adjacent_player_moves',
    gameStepsFinalView:lastView.steps??null,lastAlive,
    turns,known:lastView.knownCount||0,kills:bestKills,coins:lastView.coins||0,
    last30,deathScene,deathHp:deathScene?.hpBefore??null,
    finalPosition:lastView.player,finalPuzzle:{type:lastView.puzzle?.type,found:lastView.puzzle?.found,door:lastView.puzzle?.door,key:lastView.puzzle?.key},trace,
    fights:metrics.fights,heals:metrics.heals,weaponDrops:metrics.weaponDrops||0,weaponRepickups:metrics.weaponRepickups||0,
    wallTorchHarvests:metrics.wallTorchHarvests||0,quakeDodges:metrics.quakeDodges||0,
    artifactUses:metrics.artifactUses||0,loopBreaks:metrics.loopBreaks||0,
    actions:metrics.actions,durationMs:Math.round(performance.now()-started)});
   if(game%10===0)console.log('PLAY100_PROGRESS '+game+'/'+count+' completed='+results.filter(x=>x.finished).length+' reached5='+results.filter(x=>x.floor===5).length);
   if(game<count&&!(lastView.finished)){
     // A separate game is started from the menu. We never force a death or
     // extract an unfinished character: count it as a stopped attempt.
     click('#summaryCampBtn');
   }
   // Reset current run UI safely between attempts by reloading the page is
   // intentionally not used, to preserve real meta progression.
   if(game<count&&!(lastView.finished)){
     console.warn('PLAY100_ABORTED_ATTEMPT '+game+' '+reason);
     // Incomplete run cannot legitimately be restarted via enter while in-game.
     // End the batch instead of cheating by mutating state.
     break;
   }
   if(game%10===0)await new Promise(resolve=>setTimeout(resolve,0));
  }
  return {attempted:results.length,finished:results.filter(x=>x.finished).length,elapsedMs:Math.round(performance.now()-t0),results};
 }
 global.ThresholdPhaseFBot={play100,action,graph,goals,expendableWeapon,chooseEvent,chooseArtifact,dodgeVisibleQuake,attackable,enemyWeaponScore,retreat,breakShortCycle};
})(window);
