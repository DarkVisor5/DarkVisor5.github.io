'use strict';
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
check('visible torch when dim',view({hp:45,torch:10,loot:[{x:2,y:1,kind:'torch',id:'torch'}]}),{},'supply_torch','ArrowRight');
check('short sword stock prioritizes visible weapon',view({hp:45,inventory:[{kind:'weapon',id:'shortSword',family:'sword',uses:1,power:6,uid:1}],loot:[{x:2,y:1,kind:'weapon',id:'longSword'}]}),{},'supply_weapon','ArrowRight');
check('high alarm ignores optional chest',view({hp:45,loot:[],alarm:89,chests:[{x:2,y:1,opened:false}]}),{},'stairs','ArrowRight');
check('elite detour uses safe nearby corridor',view({hp:45,loot:[],enemies:[{x:3,y:1,family:'sword',hp:18,tier:'elite',boss:false,state:'alerted'}]}),{},'stairs','ArrowDown');
console.log('PHASE_F_UNIT_DONE 7 checks');
