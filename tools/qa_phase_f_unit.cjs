'use strict';
// THRESHOLD_CHANGE_ID: THR-20261103-002 — expanded navigation/resources regression, QA only.
// THRESHOLD_CHANGE_ID: THR-20261103-001 — Fase F QA-only policy regression.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'qa_phase_f_bot.js'),'utf8');
const keys=[];
const ui={dispatchEvent:event=>keys.push(event.key),querySelector:()=>null,querySelectorAll:()=>[]};
const sandbox={window:{},document:{querySelector:()=>ui},
 KeyboardEvent:class KeyboardEvent{constructor(type,opts){this.key=opts.key}}};
vm.runInNewContext(src,sandbox,{filename:'qa_phase_f_bot.js'});
const agent=sandbox.window.ThresholdPhaseFBot;
assert.equal(typeof agent?.action,'function');
assert.equal(typeof agent?.graph,'function');
function view(rest={}){
 return {inGame:true,finished:false,dialog:{guide:false,puzzle:false,phaseB:false,event:false,danger:false},
 rewardOpen:false,atStairs:false,targetMode:false,
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
console.log('PHASE_F_UNIT_DONE 13 checks');
