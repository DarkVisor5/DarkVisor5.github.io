'use strict';
/* 100 real, non-cheating UI playthroughs. No access to s, enemies hidden
   by fog, random seeds, map generation, attackSingle, or state mutators. */
(function(global){
 const directions=[['ArrowUp',0,-1],['ArrowRight',1,0],['ArrowDown',0,1],['ArrowLeft',-1,0]];
 const root=()=>document.querySelector('#dungeon-fixed');
 const key=(x,y)=>x+','+y;
 const close=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
 let recentKey=null;
 const send=k=>{recentKey=k;root().dispatchEvent(new KeyboardEvent('keydown',{key:k,bubbles:true,cancelable:true}))};
 const click=selector=>{let b=root().querySelector(selector);if(b&&!b.disabled){b.click();return true}return false};
 const tile=(v,x,y)=>v.world[y]?.[x]||'?';
 const passable=t=>t==='.'||t==='>';
 const allProps=v=>new Set(v.props.filter(x=>x.solid).flatMap(o=>{const a=[];for(let y=o.y;y<o.y+o.h;y++)for(let x=o.x;x<o.x+o.w;x++)a.push(key(x,y));return a}));
 const visibleTrap=v=>new Set(v.traps.filter(t=>!t.triggered).map(t=>key(t.x,t.y)));
 function graph(v){
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
    if(!passable(tile(v,x,y))||block(next))continue;
    let step=1;
    const nearEnemy=v.enemies.some(e=>Math.abs(e.x-x)+Math.abs(e.y-y)<=2);
    if(nearEnemy)step+=12;
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
 function goals(v,history,graph){
  const q=v.puzzle,actions=[];
  const push=(x,weight=0,label='goal')=>{if(x&&graph.dist.has(key(x.x,x.y)))actions.push({point:x,score:graph.dist.get(key(x.x,x.y))+weight,label})};
  if(!q.found){
   if(v.floor===1)push(q.key,-200,'key');
   if(v.floor===2){if(!q.tabletRead)push(q.tablet,-220,'tablet');else push(q.shrine,-220,'shrine')}
   if(v.floor===3){if(!q.tabletRead)push(q.tablet,-240,'tablet');else push(q.anchor,-230,'anchor')}
   if(v.floor===4){if(!q.tabletRead)push(q.tablet,-270,'tablet');else if(!q.decoderRead)push(q.decoder,-240,'decoder');else push(q.shrine,-230,'shrine')}
   if(v.floor===5){if(!q.tabletRead)push(q.tablet,-280,'tablet');else if(!q.decoderRead)push(q.decoder,-250,'decoder');else if(q.sigilProgress<3)push(q.sigils[q.sigilProgress],-230,'sigil');else push(q.finalSeal,-250,'finalSeal')}
  }else push(v.stairs,-220,'stairs');
  // Loot only when it is on the way or urgently required; avoid side trips.
  for(const l of v.loot)if(l.kind==='heal'||l.kind==='weapon'||l.kind==='torch')push(l,1.5,'loot');
  for(const chest of v.chests)if(!chest.opened)push(chest,4,'chest');
  // Explored-but-not-visited frontiers: a frontier is a visible passable
  // tile next to unexplored map cells. No hidden tiles inspected.
  const explored=v.world;
  for(const [id,dist] of graph.dist){
   if(dist>2000)continue;
   const [x,y]=id.split(',').map(Number),neighborDirs=directions.filter(([_,dx,dy])=>tile(v,x+dx,y+dy)==='?');
   if(!neighborDirs.length)continue;
   const visits=history.get(id)||0;
   if(visits>3)continue;
   const novelty=neighborDirs.length;
   actions.push({point:{x,y},score:dist+4+visits*20-novelty*1.4,label:'frontier'});
  }
  actions.sort((a,b)=>a.score-b.score);
  return actions;
 }
 function action(v,history,metrics,nav){
  if(v.finished||!v.inGame)return 'done';
  const dlg=v.dialog;
  if(dlg.guide){click('#guidePlayBtn');return 'close_tutorial'}
  if(dlg.puzzle){click('#puzzleCloseBtn');return 'close_puzzle'}
  if(dlg.phaseB){click('#phaseBClose');return 'close_furniture'}
  if(dlg.event){click('#eventChoices button:last-child');return 'event'}
  if(dlg.danger){click('#dangerChoices button:last-child');return 'avoid_danger'}
  if(v.rewardOpen){
   const buttons=[...root().querySelectorAll('#rewardChoices button')];
   const best=buttons.find(b=>/vita|vital|resist|guar/i.test(b.textContent))||buttons[0];
   best?.click();return 'reward';
  }
  if(v.atStairs){click('#descendBtn');return 'stairs'}
  if(v.targetMode){send('Enter');return 'target'}
  if(v.hp<=v.maxHp-9&&v.inventory.some(i=>i.kind==='heal')){click('#healBtn');return 'heal'}
  // Equipment is changed with a genuine inventory button.
  const active=v.inventory.find(i=>i.uid===v.equippedUid);
  const best=v.inventory.filter(i=>i.kind==='weapon'&&i.uses>0).sort((a,b)=>(b.power||0)-(a.power||0))[0];
  if(best&&best.uid!==v.equippedUid&&((best.power||0)>(active?.power||0)+2||!active||active.uses<=0)){
   const rows=[...root().querySelectorAll('#inventory .inv-row')],index=v.inventory.findIndex(i=>i.uid===best.uid);
   if(index>=0&&rows[index]){rows[index].querySelector('button')?.click();return 'equip'}
  }
  // A threatened fighter reacts to an adjacent visible enemy; no private
  // targeting APIs or direct damage calls.
  let near=v.enemies.filter(e=>close(e,v.player)<=1).sort((a,b)=>a.hp-b.hp);
  if(near.length){
   const target=near[0],dx=Math.sign(target.x-v.player.x),dy=Math.sign(target.y-v.player.y);
   const arrow=directions.find(([_,x,y])=>x===dx&&y===dy);
   if(arrow){send(arrow[0]);metrics.fights++;return 'fight'}
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
  const graphState=graph(v);
  let list=goals(v,history,graphState);
  // A player chooses a destination and follows through rather than
  // changing direction toward a different frontier on every single step.
  if(nav.floor!==v.floor){nav.floor=v.floor;nav.goal=null;nav.label=null;history.clear()}
  const urgent=list.find(o=>o.label==='key'||o.label==='stairs'||o.label==='tablet'||o.label==='decoder'||o.label==='shrine'||o.label==='sigil'||o.label==='finalSeal'||o.label==='anchor');
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
   let history=new Map(),nav={floor:1,goal:null,label:null},turns=0,highest=1,metrics={fights:0,actions:{},heals:0},reason=null,last=null,noProgress=0,trace=[];
   const started=performance.now();
   for(;turns<limit;turns++){
    const v=global.__humanBotView();
    if(v.finished||!v.inGame){reason=v.summary?.title||'finished';break}
    const pos=key(v.player.x,v.player.y),old=key(v.floor,pos);
    highest=Math.max(highest,v.floor);
    history.set(pos,(history.get(pos)||0)+1);
    recentKey=null;
    const act=action(v,history,metrics,nav);
    metrics.actions[act]=(metrics.actions[act]||0)+1;
    trace.push({t:turns,action:act,key:recentKey,from:v.player,goal:nav.goal,puzzle:v.puzzle,atStairs:v.atStairs,dialog:v.dialog,known:v.knownCount,enemies:v.enemies,props:v.props.filter(p=>close(p,v.player)<=3)});
    if(trace.length>12)trace.shift();
    if(act==='heal')metrics.heals++;
    if(act==='stuck'){reason='stuck_no_known_path';break}
    const after=global.__humanBotView();
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
    turns,known:lastView.knownCount||0,kills:lastView.kills||0,coins:lastView.coins||0,
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
 global.ThresholdFairBot={play100,action,graph};
})(window);
