'use strict';
// THRESHOLD_CHANGE_ID: THR-20261103-005 — event, artefact and P5 quake tests.
// THRESHOLD_CHANGE_ID: THR-20261103-004 — inventory/lighting resource policy regression.
// THRESHOLD_CHANGE_ID: THR-20261103-002 — expanded navigation/resources regression, QA only.
// THRESHOLD_CHANGE_ID: THR-20261103-001 — Fase F QA-only policy regression.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'qa_phase_f_bot.js'),'utf8');
const keys=[],inventoryRows=[],artifactRows=[],eventOptions=[];
const ui={dispatchEvent:event=>keys.push(event.key),querySelector:()=>null,querySelectorAll:selector=>selector==='#inventory .inv-row'?inventoryRows:
 selector==='#artifactBelt .artifact-row'?artifactRows:
 selector==='#eventChoices button'?eventOptions:[]};
const sandbox={window:{},document:{querySelector:()=>ui},
 KeyboardEvent:class KeyboardEvent{constructor(type,opts){this.key=opts.key}}};
vm.runInNewContext(src,sandbox,{filename:'qa_phase_f_bot.js'});
const agent=sandbox.window.ThresholdPhaseFBot;
assert.equal(typeof agent?.action,'function');
assert.equal(typeof agent?.graph,'function');
function view(rest={}){
 return {inGame:true,finished:false,dialog:{guide:false,puzzle:false,phaseB:false,event:false,danger:false},
 rewardOpen:false,atStairs:false,targetMode:false,wallTorches:[],
 artifacts:[],artifactUsedThisTurn:false,artifactBuffs:{stone:false,power:0},steps:0,knownCount:95,
 player:{x:1,y:1},hp:24,maxHp:45,torch:70,alarm:15,instability:0,
 inventory:[{kind:'weapon',id:'longSword',family:'sword',uses:4,power:7,uid:1}],
 equippedUid:1,capacity:10,enemies:[],traps:[],props:[],
 loot:[{x:2,y:1,kind:'heal',id:'small'}],chests:[],
 stairs:{x:5,y:1},world:['#######','#.....#','#.....#','#.....#','#######'],floor:1,
 puzzle:{found:false,open:false},...rest};
}
function nav(rest={}){return {floor:1,turn:0,visit:new Map(),banned:new Map(),recent:[],retreatCooldown:0,equipCooldown:0,stairsBlocked:false,...rest}}
function check(label,state,navOpts,expected,expectedKey){
 keys.length=0;const before=JSON.stringify(state);const got=agent.action(state,new Map(),{},nav(navOpts));
 assert.equal(got,expected,label);assert.equal(JSON.stringify(state),before,'Must not mutate game view: '+label);
 if(expectedKey)assert.equal(keys.at(-1),expectedKey,label+' movement');
 console.log('PHASE_F_UNIT_OK '+label+' '+got+(expectedKey?' '+keys.at(-1):''));
}
check('low-HP visible potion beats stairs',view(),{},'supply_heal','ArrowRight');
check('P3 blocked gate still recovers supplies',view(),{stairsBlocked:true},'supply_heal','ArrowRight');
check('healthy runner leaves without detour',view({hp:45,loot:[],alarm:76}),{},'stairs','ArrowRight');
check('low torch does not override known stairs',view({hp:45,torch:10,loot:[{x:2,y:1,kind:'torch',id:'torch'}]}),{},'stairs','ArrowRight');
check('weapon does not force a side trip before stairs',view({hp:45,inventory:[{kind:'weapon',id:'shortSword',family:'sword',uses:1,power:6,uid:1}],loot:[{x:2,y:1,kind:'weapon',id:'longSword'}]}),{},'stairs','ArrowRight');
check('high alarm ignores optional chest',view({hp:45,loot:[],alarm:89,chests:[{x:2,y:1,opened:false}]}),{},'stairs','ArrowRight');
check('elite detour uses safe nearby corridor',view({hp:45,loot:[],enemies:[{x:3,y:1,family:'sword',hp:18,tier:'elite',boss:false,state:'alerted'}]}),{},'stairs','ArrowDown');
check('no unnecessary heal detour at 67 percent',view({hp:30}),{},'stairs','ArrowRight');
check('P3 boss gate preps short-range heal before boss',view({floor:3,hp:28,enemies:[{x:5,y:1,hp:78,boss:true,family:'sword',tier:'boss',state:'alerted'}]}),{floor:3,stairsBlocked:true},'supply_heal','ArrowRight');
check('carried potion avoids optional refill tour',view({hp:30,inventory:[{kind:'weapon',id:'longSword',family:'sword',uses:4,power:7,uid:1},{kind:'heal',id:'small'}]}),{},'stairs','ArrowRight');
check('floor transition clears stale gate and stale goal',view({hp:45,loot:[]}),{floor:2,stairsBlocked:true,goal:{x:3,y:2},label:'frontier'},'stairs','ArrowRight');
const eliteView=view({loot:[],enemies:[{x:3,y:1,hp:20,family:'sword',boss:false,tier:'elite',state:'alerted'}]});
const commonView=view({loot:[],enemies:[{x:3,y:1,hp:20,family:'sword',boss:false,tier:'normal',state:'alerted'}]});
assert.ok(agent.graph(eliteView,nav()).dist.get('2,1')>agent.graph(commonView,nav()).dist.get('2,1'),'Path cost must penalize a visible elite');
console.log('PHASE_F_UNIT_OK visible elite path penalty');
const frontierView=view({hp:45,loot:[],stairs:null,world:['#######','#....?#','#.....#','#.....#','#######']});
const frontierGraph=agent.graph(frontierView,nav());
const freshGoal=agent.goals(frontierView,new Map(),frontierGraph,nav())[0];
const revisitedGoal=agent.goals(frontierView,new Map([['4,1',3]]),frontierGraph,nav())[0];
assert.equal(freshGoal.label,'frontier');
assert.equal(revisitedGoal.label,'frontier');
assert.equal(freshGoal.point.x,4);
assert.equal(freshGoal.point.y,1);
assert.equal(revisitedGoal.point.x,5);
assert.equal(revisitedGoal.point.y,2);
console.log('PHASE_F_UNIT_OK revisits are penalized but legal');
const blockedView=view({hp:40,maxHp:45,loot:[],chests:[],
 inventory:[{kind:'weapon',id:'longSword',family:'sword',uses:4,power:7,uid:1},{kind:'heal',id:'small'}],
 stairs:{x:5,y:1},world:['#######','#.....#','#######'],
 enemies:[{x:3,y:1,hp:16,boss:false,tier:'blue',family:'axe',state:'alerted'}]});
check('observed ordinary blocker ahead of known stairs',blockedView,{},'blocker','ArrowRight');
const eliteBlockView={...blockedView,enemies:[{x:3,y:1,hp:22,boss:false,tier:'elite',family:'axe',state:'alerted'}]};
assert.ok(!agent.goals(eliteBlockView,new Map(),agent.graph(eliteBlockView,nav()),nav()).some(x=>x.label==='blocker'),
 'Do not force an observed elite encounter merely to clear stairs');
console.log('PHASE_F_UNIT_OK no forced elite blocker pursuit');
const cyclePositions=['1,1','2,1','2,2','1,2'];
const cycleHistory=Array.from({length:12},(_,i)=>({id:cyclePositions[i%4],known:70,turn:i}));
const cycleBans=new Map();
const broken=agent.breakShortCycle(cycleHistory,cycleBans,100);
assert.equal(broken.period,4);
assert.equal(cycleBans.get('1,2>1,1'),260);
assert.equal(agent.breakShortCycle(cycleHistory.map((o,i)=>({...o,known:70+i})),new Map(),100),null,
 'Do not cut a loop if discovery is progressing');
console.log('PHASE_F_UNIT_OK detected repeated four-cell loop');
check('harvest known wall torch by legal bump',view({hp:45,torch:0,loot:[],wallTorches:[{x:1,y:0}]}),{},'wall_torch','ArrowUp');
check('do not detour for torch at healthy light',view({hp:45,torch:55,loot:[],wallTorches:[{x:1,y:0}]}),{},'stairs','ArrowRight');
const healingView=view({floor:4,hp:32,maxHp:51,torch:55,stairs:{x:5,y:1},
 loot:[{x:2,y:1,kind:'heal',id:'large'}],inventory:[{kind:'weapon',id:'longSword',family:'sword',uses:3,power:7,uid:1}]});
const hGoals=agent.goals(healingView,new Map(),agent.graph(healingView,nav()),nav());
assert.equal(hGoals[0].label,'supply_heal','Prioritize observed cure over exit with no potions on P4');
console.log('PHASE_F_UNIT_OK visible scarce healing');
const inv=Array.from({length:8},(_,i)=>({kind:'weapon',id:'weapon'+i,family:i<2?'sword':'axe',uid:10+i,uses:2+i,power:3+i*.2}));
inv[0].id='shortSword';inv[1].id='longSword';
const discardView=view({floor:4,hp:45,maxHp:51,torch:50,inventory:inv,capacity:8,
 loot:[{x:2,y:1,kind:'heal',id:'large'}],equippedUid:11});
let discarded=-1;
inventoryRows.splice(0,inventoryRows.length,...inv.map((o,i)=>({querySelectorAll:()=>[
  {textContent:'Equipaggia',disabled:false,click(){}},
  {textContent:'Lascia',disabled:false,click(){discarded=i}}
]})));
const dn=nav({floor:4});
const beforeDiscard=JSON.stringify(discardView);
const discardAct=agent.action(discardView,new Map(),{},dn);
assert.equal(discardAct,'drop_weapon','Free backpack space using ordinary UI');
assert.ok(discarded>=0&&discarded!==1,'Do not throw away equipped sword');
assert.ok(dn.ignoredLoot.has('1,1:'+inv[discarded].id),'Dropped weapon marked as avoidable loot');
assert.equal(JSON.stringify(discardView),beforeDiscard,'Bot must not mutate the observed view');
inventoryRows.length=0;
console.log('PHASE_F_UNIT_OK real inventory discard');
const ignoredView=view({hp:45,loot:[{x:2,y:1,kind:'weapon',id:'shortSword'}],stairs:null});
const ignoredNav=nav({ignoredLoot:new Set(['2,1:shortSword'])});
assert.ok(!agent.goals(ignoredView,new Map(),agent.graph(ignoredView,ignoredNav),ignoredNav).some(o=>o.label==='loot'),'Do not chase discarded weapon');
console.log('PHASE_F_UNIT_OK discarded loot is not pursued');

const option=text=>({textContent:text,disabled:false,clicked:false,click(){this.clicked=true}});
function eventCase(override,labels,expected){
 eventOptions.splice(0,eventOptions.length,...labels.map(option));
 const v=view({...override,dialog:{guide:false,puzzle:false,event:true,danger:false,phaseB:false}});
 assert.equal(agent.action(v,new Map(),{},nav()),'event');
 assert.equal(eventOptions.find(b=>b.clicked)?.textContent,expected);
 eventOptions.length=0;
}
eventCase({hp:44,maxHp:45,alarm:77},['❤️ Recupera 18 HP','🔕 -18 Allarme'],'🔕 -18 Allarme');
eventCase({hp:9,maxHp:45,alarm:27},['❤️ Recupera 18 HP','🔕 -18 Allarme'],'❤️ Recupera 18 HP');
eventCase({hp:45,maxHp:45,alarm:0},['⚔️ Recupera un’arma','🧰 Recupera scorte · pozione + 20 oro'],'🧰 Recupera scorte · pozione + 20 oro');
eventCase({hp:51,maxHp:51,alarm:95},['🤫 -25 Allarme · +10 Instabilità','❤️ Riposa · +10 HP'],'🤫 -25 Allarme · +10 Instabilità');
eventCase({hp:51,maxHp:51,instability:0},['❤️ Cura completa · +15 Instabilità','🧪 Cura 12 HP'],'🧪 Cura 12 HP');
eventCase({hp:10,maxHp:45,instability:0},['❤️ Cura completa · +15 Instabilità','🧪 Cura 12 HP'],'❤️ Cura completa · +15 Instabilità');
eventCase({hp:44,maxHp:45,alarm:10},['❤️ +5 HP massimi e cura 5','🔕 -10 Allarme e -6 Instabilità'],'❤️ +5 HP massimi e cura 5');
eventCase({hp:45,maxHp:45,alarm:10},['🔓 Liberalo','🪙 Prendi le sue scorte · +40 oro'],'🔓 Liberalo');
console.log('PHASE_F_UNIT_OK eight event choices');
const artifactCase=(state,id,expected)=>assert.equal(agent.chooseArtifact(view({...state,artifacts:[id]})),expected);
artifactCase({alarm:70},'silence','silence');
artifactCase({alarm:70,artifactUsedThisTurn:true},'silence',null);
artifactCase({enemies:[{x:2,y:1,boss:false,state:'alerted',hp:13,family:'axe'}]},'stone','stone');
artifactCase({floor:5,enemies:[{x:2,y:1,boss:true,bossKind:'final',state:'alerted',hp:90,family:'hammer'}]},'heart','heart');
artifactCase({floor:4,knownCount:300,stairs:null},'eye','eye');
console.log('PHASE_F_UNIT_OK five artefact decisions');
let artifactClicks=0;
artifactRows.push({querySelector:()=>({disabled:false,click(){artifactClicks++}})});
check('activate silence from real artifact UI',view({hp:45,alarm:80,loot:[],artifacts:['silence']}),{},'artifact_silence');
assert.equal(artifactClicks,1);
artifactRows.length=0;
check('dodge telegraphed final boss quake',view({
 floor:5,hp:45,maxHp:51,loot:[],
 enemies:[{x:2,y:1,boss:true,bossKind:'final',telegraph:true,hp:125,family:'hammer',state:'alerted',tier:'purple'}]
}),{},'dodge_quake','ArrowDown');
assert.equal(agent.dodgeVisibleQuake(view({enemies:[]}),nav()),null);

// THR-20261103-005 — drops must not turn into a gear-repickup patrol.
const droppedNav=nav({floor:4});
const firstDrop=agent.action(discardView,new Map(),{},droppedNav);
assert.equal(firstDrop,'drop_weapon');
assert.ok(droppedNav.droppedTiles.has('1,1'),'Track the one drop tile');
assert.notEqual(agent.action(discardView,new Map(),{},droppedNav),'drop_weapon',
 'Do not drop on the same tile twice without moving');
const ordinaryInv=view({floor:4,hp:45,maxHp:51,inventory:inv,
 capacity:10,loot:[],equippedUid:11,torch:70});
const safeNav=nav({floor:4});
assert.notEqual(agent.action(ordinaryInv,new Map(),{},safeNav),'drop_weapon',
 'Do not discard gear in a normal corridor without full bag and visible heal');
const tileView=view({floor:4,hp:45,loot:[{x:2,y:1,kind:'weapon',id:'shortSword'}]});
const highCost=agent.graph(tileView,nav({ignoredLoot:new Set(['2,1:shortSword'])})).dist.get('2,1');
const lowCost=agent.graph(tileView,nav()).dist.get('2,1');
assert.ok(highCost>lowCost+100,'Avoid auto-collecting dropped weapon during route');
console.log('PHASE_F_UNIT_OK dropped gear repickup avoidance and safe discard');
console.log('PHASE_F_UNIT_DONE 39 checks');

