'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const base='threshold-v18-preview/';
const bankSource=read(base+'js/riddles.js'),phaseSource=read(base+'js/phase-b.js'),game=read(base+'js/game.js'),index=read(base+'index.html');
const root={};
const bank=new Function('globalThis','module',bankSource+'\nreturn module.exports;')(root,{exports:{}});
const phase=new Function('globalThis',phaseSource+'\nreturn globalThis.ThresholdPhaseB;')(root);
new Function(game);
assert.equal(bank.questions.length,32);assert.equal(phase.types.length,11);
assert.equal(new Set(bank.questions.map(q=>q.id)).size,32);
for(const cat of bank.categories)assert.equal(bank.questions.filter(q=>q.category===cat).length,8);
for(const q of bank.questions){assert.equal(q.choices.length,4);assert.ok(q.answer>=0&&q.answer<4);assert.ok(q.prompt&&q.explanation&&q.id)}
const used=new Set();for(let n=0;n<32;n++){const q=bank.pick({category:'archive',floor:5,used,random:()=>.4});assert.ok(q&&!used.has(q.id));used.add(q.id)}
for(let floor=1;floor<=5;floor++)assert.ok(bank.pick({category:'sanctuary',floor}).tier<=1+Math.floor((floor-1)/2));
for(const name of phase.types)assert.ok(game.includes(name),'missing '+name);
assert.ok(game.includes('if(phaseBController?.open(solidProp))return'));
assert.ok(game.includes('function onPuzzleStep(dx,dy)')&&game.includes('function onPuzzleWait()'));
assert.ok(game.includes("keyPuzzle.type='runes'")&&game.includes("keyPuzzle.type='sequence'")&&game.includes("keyPuzzle.type='route'"));
assert.ok(index.indexOf('js/riddles.js')<index.indexOf('js/phase-b.js')&&index.indexOf('js/phase-b.js')<index.indexOf('js/game.js'));
class El {
 constructor(tag='div'){this.tag=tag;this.nodes=new Map();this.children=[];this.events={};this.hidden=false;this.disabled=false;this.textContent='';this._html=''}
 set innerHTML(v){this._html=v;if(v.includes('phaseBTitle'))for(const id of ['phaseBClose','phaseBTitle','phaseBText','phaseBLabel','phaseBNote','phaseBChoices'])this.nodes.set('#'+id,new El(id))}
 get innerHTML(){return this._html}
 addEventListener(t,fn){(this.events[t]??=[]).push(fn)}
 appendChild(x){this.children.push(x)}
 querySelector(s){return s==='#phaseBChoices button'?this.nodes.get('#phaseBChoices')?.children[0]:this.nodes.get(s)||null}
 replaceChildren(){this.children=[]}
 click(){if(!this.disabled)for(const f of this.events.click||[])f({target:this})}
 focus(){}
}
const document={createElement:t=>new El(t)},mount=new El('root');mount.ownerDocument=document;
const run={floor:2,runCoins:70,instability:0,alarm:0,eventOpen:false,hp:30,torchLightLevel:50};let gold=0,hints=0,spent=0;
const ctrl=phase.create({root:mount,getRun:()=>run,bank,random:()=>.99,effects:{
 render(){},visibility(){},play(){},toast(){},log(){},hint(){hints++;return 'sigillo'},
 gold(n){run.runCoins+=n;gold+=n;return n},stability(n){run.instability+=n},
 alarm(n){run.alarm+=n},noise(){},heal(n){run.hp+=n;return n},light(n){run.torchLightLevel+=n;return n},
 spend(n){spent+=n;run.runCoins-=n},damage(n){run.hp-=n}
}});
const options=()=>mount.children[0].querySelector('#phaseBChoices').children,close=()=>mount.children[0].querySelector('#phaseBClose').click();
const shelf={type:'archiveBookshelf',x:6,y:8};assert.ok(ctrl.open(shelf));options()[1].click();assert.equal(hints,1);options()[0].click();
const q=bank.get(run._phaseBQuestions.get('2:archiveBookshelf:6:8'));options()[q.answer].click();
const once=gold;assert.ok(once>0);close();assert.equal(ctrl.open(shelf),false);assert.equal(gold,once);
const altar={type:'votiveAltar',x:9,y:9};assert.ok(ctrl.open(altar));options()[1].click();assert.equal(spent,18);options()[0].click();assert.equal(ctrl.canInteract(altar),false);
const crate={type:'storeCratePile',x:10,y:10};assert.ok(ctrl.open(crate));options()[1].click();assert.equal(run.alarm,5);options()[0].click();
const wrong={type:'archiveLectern',x:11,y:11};assert.ok(ctrl.open(wrong));options()[0].click();const r=bank.get(run._phaseBQuestions.get('2:archiveLectern:11:11'));options()[(r.answer+1)%4].click();assert.equal(run.instability,6);close();assert.equal(ctrl.canInteract(wrong),false);
console.log('PASS: 32 riddles, 11 objects, optional decisions, mandatory puzzle hooks, one-time rewards, clues and penalties.');
