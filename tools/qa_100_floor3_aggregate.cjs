'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=process.argv[2]||'results/all';
function files(dir){
 let res=[];
 if(!fs.existsSync(dir))return [];
 for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
  const full=path.join(dir,ent.name);
  if(ent.isDirectory())res=res.concat(files(full));
  else if(ent.name==='results.json')res.push(full);
 }
 return res;
}
const paths=files(root),reports=paths.map(p=>JSON.parse(fs.readFileSync(p,'utf8')));
const rows=reports.flatMap(r=>r.results);
if(rows.some(r=>r.startFloor!==3))throw Error('Some games did not start at floor 3');
const sum=key=>rows.reduce((n,r)=>n+(r[key]||0),0);
const byResult={};
for(const r of rows)byResult[r.result]=(byResult[r.result]||0)+1;
const summary={
 requested:100,
 startFloor:3,
 startingKit:'starter: rustySword + small potion; no extra HP/upgrades',
 played:rows.length,
 finished:rows.filter(r=>r.finished).length,
 wins:rows.filter(r=>r.finished&&/Dungeon completato/i.test(r.result)).length,
 deaths:rows.filter(r=>r.finished&&/Run terminata/i.test(r.result)).length,
 extracts:rows.filter(r=>r.finished&&/Estrazione/i.test(r.result)).length,
 abandoned:rows.filter(r=>!r.finished&&!r.error).length,
 harnessErrors:rows.filter(r=>r.error).length,
 maxFloor:Math.max(0,...rows.map(r=>r.floor||0)),
 averageFloor:Math.round(100*sum('floor')/Math.max(1,rows.length))/100,
 averageTurns:Math.round(sum('turns')/Math.max(1,rows.length)),
 totalActions:sum('turns'),totalKills:sum('kills'),
 totalHeals:sum('heals'),totalMeleeEncounters:sum('fights'),
 byResult,artifactFiles:paths.length
};
const out={summary,reports:reports.map(r=>r.summary),allRuns:rows};
fs.writeFileSync('results/threshold-floor3-100-summary.json',JSON.stringify(out,null,2));
console.log('FLOOR3_100_AGGREGATE '+JSON.stringify(summary));
const markdown=[
 '# Threshold — 100 run reali dal piano 3 tramite browser',
 '',
 'Il bot usa soltanto la mappa vista/esplorata e interagisce con i pulsanti e i tasti reali.',
 'L’harness avvia ogni dungeon direttamente al piano 3, saltando il percorso dei piani 1 e 2; NON modifica HP, arma, pozioni, buff o boss. Il giocatore usa il kit standard di avvio, non ricompense da livelli precedenti.',
 '',
 '| Metrica | Risultato |','|---|---:|',
 ...Object.entries(summary).filter(([k,v])=>typeof v!=='object').map(([k,v])=>'| '+k+' | '+v+' |'),
 '',
 'Le partite abbandonate per limite di turni sono riportate separatamente da sconfitte e vittorie.',
 '',
 'I 100 tentativi sono suddivisi in 10 sessioni browser indipendenti da 10 run ciascuna.'
].join('\n');
fs.writeFileSync('results/threshold-floor3-100-summary.md',markdown);
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,markdown+'\n');
if(rows.length!==100||reports.length!==10)throw Error('Expected exactly 100 attempts across 10 shards');
