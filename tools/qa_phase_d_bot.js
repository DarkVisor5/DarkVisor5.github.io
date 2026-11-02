'use strict';
/* Phase D — tactical player-like QA. Only visible/explored tile info,
   on-screen enemy stats and real UI actions. Never mutate gameplay state. */
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
  if(i.family==='sword'&&near===1)score+=2.3; // a real sword attack grants Guard
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
      const aScore=near?enemyWeaponScore(a,near,v):basicWeaponScore(a)+(a.family==='sword'?.7:0);
      const bScore=near?enemyWeaponScore(b,near,v):basicWeaponScore(b)+(b.family==='sword'?.7:0);
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
 function goals(v,history,graph,nav){
  const q=v.puzzle,actions=[];
  const push=(x,weight=0,label='goal')=>{if(x&&graph.dist.has(key(x.x,x.y)))actions.push({point:x,score:graph.dist.get(key(x.x,x.y))+weight,label})};
  // Floors 1–3 contain an optional threshold chamber. The route to the
  // staircase is NOT gated by the optional chamber; floor 3 IS boss-gated.
  if(v.floor<=3){
    if(!nav.stairsBlocked)push(v.stairs,-440,'stairs');
  }else if(!q.found){
    if(v.floor===4){if(!q.tabletRead)push(q.tablet,-520,'tablet');else if(!q.decoderRead)push(q.decoder,-520,'decoder');else push(q.shrine,-500,'shrine')}
    if(v.floor===5){if(!q.tabletRead)push(q.tablet,-520,'tablet');else if(!q.decoderRead)push(q.decoder,-520,'decoder');else if(q.sigilProgress<3)push(q.sigils[q.sigilProgress],-510,'sigil');else push(q.finalSeal,-520,'finalSeal')}
  }else push(v.stairs,-450,'stairs');
  // The boss is a known required obstacle once it is actually seen. Approach
  // any reachable free orthogonal neighbor, no hidden coordinates.
  for(const boss of v.enemies.filter(e=>e.boss)){
    for(const [,dx,dy] of directions){
      const spot={x:boss.x+dx,y:boss.y+dy};
      push(spot,-850,'boss');
    }
  }
  // Loot only when it is on the way or urgently required; avoid side trips.
  for(const l of v.loot)if(!nav.stairsBlocked&&(l.kind==='torch'||v.inventory.length<(v.capacity||10))&&
     (history.get(key(l.x,l.y))||0)<3)push(l,1.5,'loot');
  for(const chest of v.chests)if(!nav.stairsBlocked&&!chest.opened&&(history.get(key(chest.x,chest.y))||0)<3)push(chest,4,'chest');
  // Explored-but-not-visited frontiers: a frontier is a visible passable
  // tile next to unexplored map cells. No hidden tiles inspected.
  const explored=v.world;
  for(const [id,dist] of graph.dist){
   if(dist>2000)continue;
   const [x,y]=id.split(',').map(Number),neighborDirs=directions.filter(([_,dx,dy])=>tile(v,x+dx,y+dy)==='?');
   if(!neighborDirs.length)continue;
   const visits=history.get(id)||0;
   if(visits>5)continue;
   const novelty=neighborDirs.length;
   actions.push({point:{x,y},score:dist+4+visits*8-novelty*1.4,label:'frontier'});
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
  if(dlg.event){
   const opts=[...root().querySelectorAll('#eventChoices button')];
   const healing=opts.find(b=>/cura|recupera.+HP|pozione/i.test(b.textContent));
   const weapon=opts.find(b=>/arma avanzata|recupera un.arma/i.test(b.textContent));
   const good=v.hp<v.maxHp*.66&&healing?healing:(weapon||healing||opts[opts.length-1]);
   if(good&&!good.disabled)good.click();
   return 'event';
  }
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
  // Potions do not consume a monster turn. Use the default first potion only
  // when healing is substantial, unless a visible enemy could kill next turn.
  const heal=meds[0],missing=v.maxHp-v.hp,expected=heal?healAmount(heal):0;
  const incoming=near.length*9+danger.filter(e=>close(e,v.player)===2).length*4;
  if(heal&&v.hp<v.maxHp&&(
     (near.length&&v.hp<=Math.max(expected+5,incoming+6))||
     (danger.length&&missing>=Math.max(8,expected-1)&&v.hp<=v.maxHp*.75)||
     (!danger.length&&missing>=expected&&v.hp<=v.maxHp*.5)
  )){
   if(click('#healBtn'))return 'heal';
  }
  // Match visible enemies against the real five-weapon-family advantage
  // chart and equip using the normal inventory UI, with no durability edits.
  const active=v.inventory.find(i=>i.uid===v.equippedUid);
  const best=bestWeapon(v),closest=danger.sort((a,b)=>close(a,v.player)-close(b,v.player))[0];
  const oldScore=closest?enemyWeaponScore(active,closest,v):active?basicWeaponScore(active):-Infinity;
  const newScore=closest?enemyWeaponScore(best,closest,v):best?basicWeaponScore(best):-Infinity;
  if(best&&best.uid!==v.equippedUid&&(!active||active.uses<=0||newScore>oldScore+1.25)){
   const rows=[...root().querySelectorAll('#inventory .inv-row')],index=v.inventory.findIndex(i=>i.uid===best.uid);
   if(index>=0&&rows[index]&&rows[index].querySelector('button')){
    rows[index].querySelector('button').click();return 'equip';
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
  const graphState=graph(v,nav);
  let list=goals(v,history,graphState,nav);
  // A player chooses a destination and follows through rather than
  // changing direction toward a different frontier on every single step.
  if(nav.floor!==v.floor){nav.floor=v.floor;nav.goal=null;nav.label=null;nav.stairsBlocked=false;nav.banned=new Map();nav.recent=[];nav.visit=new Map();history.clear()}
  const urgent=list.find(o=>['stairs','boss','tablet','decoder','shrine','sigil','finalSeal'].includes(o.label));
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
   const around=directions.map(([dir,dx,dy])=>({dir,x:v.player.x+dx,y:v.player.y+dy,d:Math.abs(v.player.x+dx-e.x)+Math.abs(v.player.y+dy-e.y)})).filter(o=>passable(tile(v,o.x,o.y))&&!graphState.solids.has(key(o.x,o.y)));
   around.sort((a,b)=>a.d-b.d);
   if(around[0])next=around[0].dir,kind='pursuit';
  }
  if(!next)return 'stuck';
  send(next);
  return kind||'move';
 }
 async function play100({count=100,limit=1800}={}){
  const results=[],t0=performance.now();
  const R=root();
  for(let game=1;game<=count;game++){
   const prior=results.length;
   const summary=R.querySelector('#runSummary');
   if(summary&&!summary.classList.contains('hidden'))click('#summaryRunBtn');
   else {if(!R.querySelector('#welcome')?.classList.contains('hidden'))click('#welcomeStartBtn');click('#enterBtn')}
   let history=new Map(),nav={floor:1,goal:null,label:null,stairsBlocked:false,stairsBlockedAt:0,banned:new Map(),recent:[],visit:new Map(),retreatCooldown:0,turn:0},turns=0,highest=1,metrics={fights:0,actions:{},heals:0},reason=null,last=null,noProgress=0,trace=[],last30=[],bestKills=0,deathScene=null;
   const started=performance.now();
   for(;turns<limit;turns++){
    const v=global.__humanBotView();
    if(v.finished||!v.inGame){reason=v.summary?.title||'finished';break}
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
    if(recent.length>7)recent.shift();
    if(recent.length>=5){
     const q=recent.slice(-5);
     if(q[0].id===q[2].id&&q[2].id===q[4].id&&
        q[1].id===q[3].id&&q[0].id!==q[1].id&&q[0].known===q[4].known){
       nav.banned.set(q[4].id+'>'+q[3].id,turns+85);
       nav.goal=null;nav.label=null;
     }
    }
    recentKey=null;
    const act=action(v,history,metrics,nav);
    metrics.actions[act]=(metrics.actions[act]||0)+1;
    trace.push({t:turns,action:act,key:recentKey,from:v.player,goal:nav.goal,puzzle:v.puzzle,atStairs:v.atStairs,dialog:v.dialog,known:v.knownCount,enemies:v.enemies,props:v.props.filter(p=>close(p,v.player)<=3)});
    if(trace.length>12)trace.shift();
    if(act==='heal')metrics.heals++;
    if(act==='stuck'){reason='stuck_no_known_path';break}
    const after=global.__humanBotView();
    const postLog=after.log||[];
    // Learn public collision outcomes. A movement that does not change the
    // position and does not trigger combat/dialogue was blocked. Avoid this
    // edge for a while rather than issuing the same key for hundreds of turns.
    if(after.inGame&&recentKey&&/^(frontier|loot|chest|stairs|boss|pursuit|move)$/.test(act)&&
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
   results.push({run:game,result:reason,finished:!!lastView.finished,floor:highest,hp:lastView.hp,steps:lastView.steps||0,
    turns,known:lastView.knownCount||0,kills:bestKills,coins:lastView.coins||0,
    last30,deathScene,deathHp:deathScene?.hpBefore??null,
    finalPosition:lastView.player,finalPuzzle:{type:lastView.puzzle?.type,found:lastView.puzzle?.found,door:lastView.puzzle?.door,key:lastView.puzzle?.key},trace,
    fights:metrics.fights,heals:metrics.heals,actions:metrics.actions,durationMs:Math.round(performance.now()-started)});
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
 global.ThresholdPhaseDBot={play100,action,graph,attackable,enemyWeaponScore,retreat};
})(window);
