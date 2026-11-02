'use strict';
const fs=require('node:fs'),path=require('node:path');
const dataDir=process.argv[2]||'results/all';
const files=[];
function walk(p){if(!fs.existsSync(p))return;for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,e.name);if(e.isDirectory())walk(f);else if(e.name==='results.json')files.push(f)}}
walk(dataDir);
const cohorts={nocards:[],sword:[]},errors=[];
for(const f of files){
 const data=JSON.parse(fs.readFileSync(f,'utf8'));const rows=data.results||[];
 const profile=f.includes('nocards')?'nocards':f.includes('sword')?'sword':null;
 if(!profile)throw Error('Unknown cohort for '+f);
 for(const r of rows){
  if(r.error||!r.resourceTelemetry)errors.push({file:f,run:r.run,error:r.error||'No resource telemetry'});
  else cohorts[profile].push({...r,cohort:profile});
 }
}
const avg=(rows,key)=>rows.length?Math.round(rows.reduce((sum,row)=>sum+(row[key]||0),0)/rows.length*10)/10:null;
const median=(a)=>{if(!a.length)return null;const n=a.slice().sort((x,y)=>x-y);return Math.round((n[Math.floor((n.length-1)/2)]+n[Math.floor(n.length/2)])/2*10)/10};
const pct=(n,d)=>d?Math.round(n/d*1000)/10:null;
const checkpoint=(rows,at,floor)=>{
 const snapshots=rows.map(r=>r.resourceTelemetry[at][floor]).filter(Boolean);
 const count=snapshots.length;
 return {observed:count,denominator:rows.length,reachPct:pct(count,rows.length),
 hpAvg:avg(snapshots,'hp'),hpMedian:median(snapshots.map(s=>s.hp)),hpMin:count?Math.min(...snapshots.map(s=>s.hp)):null,
 potionAvg:avg(snapshots,'healsTotal'),smallAvg:avg(snapshots,'smallPotions'),largeAvg:avg(snapshots,'largePotions'),
 swordAvg:avg(snapshots,'swordCount'),swordDurabilityAvg:avg(snapshots,'swordDurability'),alarmAvg:avg(snapshots,'alarm'),
 hp40:snapshots.filter(s=>s.hpAtLeast40).length,
 threePotions:snapshots.filter(s=>s.hasThreePotions).length,
 threeSwords:snapshots.filter(s=>s.hasThreeSwords).length,
 allThree:snapshots.filter(s=>s.hpAtLeast40&&s.hasThreePotions&&s.hasThreeSwords).length,
 exactIntermediate:snapshots.filter(s=>s.meetsIntermediateResourceThreshold).length,
 records:snapshots
 };
};
const summary={runs:0,errors,shards:files.length,cohorts:{}};
for(const name of ['nocards','sword']){
 const rows=cohorts[name];
 const o={runs:rows.length,deaths:rows.filter(r=>r.finished&&/Run terminata/i.test(r.result)).length,
 completed:rows.filter(r=>r.finished&&/Dungeon completato/i.test(r.result)).length,
 unfinished:rows.filter(r=>!r.finished).length,maxFloor:Math.max(0,...rows.map(r=>r.floor||0)),
 entry:{},firstBoss:{},stairs:{}};
 for(const floor of [1,2,3,4,5]){
  for(const [property,key] of [['entry','entryByFloor'],['firstBoss','firstVisibleBossByFloor'],['stairs','stairsByFloor']]){
   const c=checkpoint(rows,key,String(floor));
   delete c.records;o[property][floor]=c;
  }
 }
 summary.cohorts[name]=o;summary.runs+=rows.length;
}
const p=n=>n==null?'—':String(n);
const lines=[
 '# Threshold v18.26 — Risorse reali a ingresso dei piani e prima dei boss',
 '',
 'Telemetria passiva durante partite Chromium dal piano 1. Non vengono alterati HP, armi, equipaggiamento, loot, drop o avversari. La telemetria osserva soltanto l’inventario che il bot vede. Il profilo sword usa le cinque carte di rango IV acquistate in precedenza; quello senza carte non ha mazzo.',
 '',
 'Le soglie testate sono indicative: HP ≥40, almeno tre pozioni, almeno tre spade. La soglia rigorosa «intermedio» richiede HP ≥40, almeno due pozioni piccole e una grande, almeno tre spade di tipo lunga/duellante.',
 '',
 '| Mazzo | Checkpoint | Run osservate | HP media | Pozioni medie | Spade medie | HP≥40 | 3 pozioni | 3 spade | Tutte e tre | Intermedio rigoroso |',
 '|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|'
];
for(const name of ['nocards','sword'])for(const [label,property,floor] of [
 ['Ingresso P3','entry',3],['Primo contatto Custode P3','firstBoss',3],
 ['Ingresso P5','entry',5],['Primo contatto boss finale P5','firstBoss',5]
]){
 const x=summary.cohorts[name][property][floor];
 lines.push('| '+name+' | '+label+' | '+x.observed+'/'+summary.cohorts[name].runs+' | '+p(x.hpAvg)+' | '+p(x.potionAvg)+' | '+p(x.swordAvg)+' | '+x.hp40+' | '+x.threePotions+' | '+x.threeSwords+' | '+x.allThree+' | '+x.exactIntermediate+' |');
}
lines.push('', '## Vincoli e interpretazione',
 'I test isolati del boss vinti al profilo intermedio usavano anche un inventario di tre spade di qualità nota. Le soglie riassunte non sono una previsione certa di vittoria. Il primo contatto è la prima volta che il boss compare nel campo visivo; non è necessariamente il momento in cui si inizia il duello. I mancati avvistamenti non vengono trattati come morti.',
 'Le partite che si fermano a 1.800 decisioni sono conteggiate come incompiute, non come sconfitte. Le due coorti non usano seed appaiati e il meta-account evolve durante la serie; nessun risultato è una probabilità di vittoria di un giocatore umano.',
 'Il file JSON contiene tutte le istantanee per singola run, compresi checkpoint dei piani 1–5.');
fs.mkdirSync('results',{recursive:true});
fs.writeFileSync('results/qa_resource_feasibility_200.json',JSON.stringify({summary,rows:cohorts},null,2));
fs.writeFileSync('results/qa_resource_feasibility_200.md',lines.join('\n'));
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,lines.join('\n')+'\n');
console.log('RESOURCE_FEASIBILITY_200 '+JSON.stringify(summary));
if(files.length!==20||cohorts.nocards.length!==100||cohorts.sword.length!==100||errors.length)
 throw Error('Expected 20 cohorts of 10 fully observed runs: '+files.length+'/'+cohorts.nocards.length+'/'+cohorts.sword.length+'/'+errors.length);
