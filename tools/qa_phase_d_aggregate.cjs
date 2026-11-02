'use strict';
const fs=require('node:fs'),path=require('node:path');
const srcDir=process.argv[2]||'results/all',files=[];
function gather(dir){
 if(!fs.existsSync(dir))return;
 for(const e of fs.readdirSync(dir,{withFileTypes:true})){
  const p=path.join(dir,e.name);
  if(e.isDirectory())gather(p);else if(e.name==='results.json')files.push(p);
 }
}
gather(srcDir);
const sessions=files.map(f=>JSON.parse(fs.readFileSync(f,'utf8')));
const runs=sessions.flatMap(s=>s.results);
const sum=k=>runs.reduce((n,r)=>n+(Number(r[k])||0),0);
const group=(get)=>runs.reduce((a,r)=>{const key=get(r);a[key]=(a[key]||0)+1;return a},{});
function inferCause(r){
 if(!r.finished||!/terminata/i.test(r.result))return null;
 const sc=r.deathScene||{},lines=sc.log||[],last=lines[0]||'';
 if(/trappola|trap/i.test(last))return 'probable_trap';
 if(sc.visibleEnemies?.some(e=>e.boss&&Math.abs(e.x-sc.position.x)+Math.abs(e.y-sc.position.y)<=2))return 'probable_boss';
 if(sc.visibleEnemies?.some(e=>Math.abs(e.x-sc.position.x)+Math.abs(e.y-sc.position.y)<=2))return 'probable_enemy';
 if(/HP|colpo|attacc|ferito/i.test(last))return 'probably_combat_unconfirmed';
 return 'unclassified';
}
const causes=group(r=>inferCause(r)||'not_a_death');
const floorBreakdown={};
for(const r of runs){
 const f=String(r.floor||0),slot=floorBreakdown[f]||(floorBreakdown[f]={runs:0,deaths:0,abandoned:0,clears:0,extractions:0});
 slot.runs++;if(/terminata/i.test(r.result))slot.deaths++;
 else if(/completato/i.test(r.result))slot.clears++;
 else if(/estrazione/i.test(r.result))slot.extractions++;
 else slot.abandoned++;
}
const actions={};
for(const r of runs)for(const [k,v] of Object.entries(r.actions||{}))actions[k]=(actions[k]||0)+v;
const died=runs.filter(r=>r.finished&&/terminata/i.test(r.result));
const diagnosticCompleteness={deaths:died.length,with30TurnTrail:died.filter(r=>r.last30?.length>0).length,
 withDeathSnapshot:died.filter(r=>r.deathScene).length,withVisibleEnemies:died.filter(r=>(r.deathScene?.visibleEnemies||[]).length>0).length};
const summary={
 requested:100,played:runs.length,completed:runs.filter(r=>r.finished).length,
 deaths:died.length,abandoned:runs.filter(r=>!r.finished&&!r.error).length,
 clears:runs.filter(r=>/completato/i.test(r.result)).length,
 extractions:runs.filter(r=>/estrazione/i.test(r.result)).length,
 harnessErrors:runs.filter(r=>!!r.error).length,maxFloor:Math.max(0,...runs.map(r=>r.floor||0)),
 meanFloor:Number((sum('floor')/Math.max(1,runs.length)).toFixed(2)),
 averageDecisions:Math.round(sum('turns')/Math.max(1,runs.length)),
 totalDecisions:sum('turns'),totalReportedKills:sum('kills'),
 floorBreakdown,diagnosticCompleteness,probableCauses:causes,actions,sessions:files.length
};
fs.mkdirSync('results',{recursive:true});
fs.writeFileSync('results/threshold-phase-d-summary.json',JSON.stringify({summary,runs},null,2));
const md=[
 '# Threshold v18 — Fase D, 100 partite reali, diagnostica delle morti',
 '',
 'Controlli browser reali, risorse di avvio normali; nessuna lettura di mappa nascosta.',
 'Le cause sono stime da messaggi a schermo e nemici visibili; non etichette del motore.',
 '',
 '| Misura | Risultato |','|---|---:|',
 ...['played','deaths','abandoned','clears','extractions','harnessErrors','maxFloor','meanFloor','averageDecisions','totalDecisions','totalReportedKills'].map(k=>'| '+k+' | '+summary[k]+' |'),
 '',
 '## Diagnosi preliminare per piano',
 '| Piano massimo | Tentativi | Morti | Interrotti | Vittorie |',
 '|---|---:|---:|---:|---:|',
 ...Object.entries(floorBreakdown).sort((a,b)=>Number(a[0])-Number(b[0])).map(([floor,s])=>'| '+floor+' | '+s.runs+' | '+s.deaths+' | '+s.abandoned+' | '+s.clears+' |'),
 '',
 '## Potenziali cause del colpo finale (attribuzione non certa)',
 ...Object.entries(causes).map(([k,n])=>'- '+k+': '+n),
 '',
 'Diagnosi degli ultimi 30 turni conservata per '+diagnosticCompleteness.with30TurnTrail+'/'+diagnosticCompleteness.deaths+' morti.',
 '',
 'I registri completi sono salvati nell’artifact JSON per esaminare ogni sequenza.'
].join('\n');
fs.writeFileSync('results/threshold-phase-d-summary.md',md);
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,md+'\n');
console.log('PHASE_D_AGGREGATE '+JSON.stringify(summary));
if(files.length!==10||runs.length!==100)throw Error('Expected 10 sessions and 100 recorded gameplay attempts; got '+files.length+'/'+runs.length);
