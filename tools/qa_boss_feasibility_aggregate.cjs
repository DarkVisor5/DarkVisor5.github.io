'use strict';
const fs=require('node:fs'),path=require('node:path');
const dir=process.argv[2]||'results/all',files=[];
function scan(p){if(!fs.existsSync(p))return;for(const entry of fs.readdirSync(p,{withFileTypes:true})){
 const full=path.join(p,entry.name);if(entry.isDirectory())scan(full);else if(entry.name==='results.json')files.push(full);
}}scan(dir);
const runs=files.flatMap(f=>JSON.parse(fs.readFileSync(f,'utf8')).results);
const byFloor={};
const score=p=>{
 const n=p.length,w=p.filter(x=>x.reason==='boss_defeated').length,
 d=p.filter(x=>x.reason==='died').length,t=p.filter(x=>x.reason==='action_limit').length;
 const z=1.96,center=(w+z*z/2)/(n+z*z),half=n?z*Math.sqrt(w*(n-w)/n+z*z/4)/(n+z*z):0;
 return {battles:n,wins:w,deaths:d,limits:t,winRate:n?w/n:0,wilson95:n?[Math.max(0,center-half),Math.min(1,center+half)]:[0,0],
 avgAttacks:Math.round(p.reduce((a,x)=>a+(x.attacks||0),0)/Math.max(n,1)),
 avgHeals:Number((p.reduce((a,x)=>a+(x.heals||0),0)/Math.max(n,1)).toFixed(2)),
 avgHpAfterWin:w?Number((p.filter(x=>x.reason==='boss_defeated').reduce((a,x)=>a+x.hpEnd,0)/w).toFixed(1)):null};
};
for(const floor of [3,5]){
 const matches=runs.filter(r=>r.floor===floor);byFloor[floor]={...score(matches),profiles:{}};
 for(const name of ['scarce','typical','prepared','veteran'])
  byFloor[floor].profiles[name]=score(matches.filter(r=>r.profile===name));
}
const summary={planned:200,played:runs.length,shards:files.length,
 wins:runs.filter(r=>r.reason==='boss_defeated').length,
 deaths:runs.filter(r=>r.reason==='died').length,
 actionLimits:runs.filter(r=>r.reason==='action_limit').length,
 errors:runs.filter(r=>!!r.error).length,byFloor};
fs.mkdirSync('results',{recursive:true});
fs.writeFileSync('results/threshold-boss-feasibility-200.json',JSON.stringify({summary,results:runs},null,2));
const percent=x=>(x*100).toFixed(1)+'%';
const md=[
 '# Threshold v18.26 — 200 confronti diretti con i boss, HP normali','',
 'Scenari isolati: partenza accanto al boss, equipaggiamento prefissato ma ottenibile, cinque carte Spada/Guardia, nemici comuni e trappole iniziali assenti. Attacchi, mosse, cure, IA, danni, allarme e durata armi sono quelli veri del motore.',
 '',
 '| Boss | Profilo | Scontri | Vittorie | Morti | Non conclusi | Vittorie % | Intervallo Wilson 95% | HP rimasti medi alle vittorie |',
 '|---|---|---:|---:|---:|---:|---:|---|---:|',
 ...[3,5].flatMap(f=>['scarce','typical','prepared','veteran'].map(name=>{
  const r=byFloor[f].profiles[name];
  return '| Piano '+f+' | '+name+' | '+r.battles+' | '+r.wins+' | '+r.deaths+' | '+r.limits+' | '+percent(r.winRate)+' | '+r.wilson95.map(percent).join('–')+' | '+(r.avgHpAfterWin??'—')+' |';
 })),
 '',
 'Nota: questi intervalli misurano esclusivamente il tasso di vittoria nelle arene di prova, non la probabilità di completare il dungeon dal primo piano.',
 'Le armi dei profili mantengono la durabilità standard; le pozioni sono reali e consumate attraverso la UI. Nessun personaggio ha 10.000 HP. Il profilo veterano a 55 HP rappresenta un massimo raggiungibile tramite obiettivi persistenti, non un nuovo account.',
 'Il bot in questa prova punta su attacchi ravvicinati di spada e sulla Guardia, senza kiting; non è necessariamente la strategia umana ottimale.',
 '',
 'Risultati completi in JSON allegato.'
 ].join('\n');
fs.writeFileSync('results/threshold-boss-feasibility-200.md',md);
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,md+'\n');
console.log('BOSS_FEASIBILITY_200_AGGREGATE '+JSON.stringify(summary));
if(files.length!==10||runs.length!==200||summary.errors||summary.actionLimits)throw Error('Fixture did not complete 200 conclusive battles without technical errors');
