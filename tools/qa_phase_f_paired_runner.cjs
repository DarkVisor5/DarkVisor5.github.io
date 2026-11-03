'use strict';
// THRESHOLD_CHANGE_ID: THR-20261103-001 — honest paired-seed QA, no gameplay edits.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const base=path.resolve(__dirname,'..');
const count=Number(process.env.THRESHOLD_PAIR_COUNT||3);
const startSeed=Number(process.env.THRESHOLD_FIRST_SEED||20261103)>>>0;
const limit=Number(process.env.THRESHOLD_TURN_LIMIT||1800);
const out=process.env.THRESHOLD_RESULTS_DIR||'/tmp/threshold-phase-f-paired';
assert.ok(Number.isInteger(count)&&count>=1&&count<=200,'1–200 seed pairs');
assert.ok(Number.isInteger(limit)&&limit>=50&&limit<=10000,'turn limit must be finite');
fs.mkdirSync(out,{recursive:true});
const trials=[],errors=[];
const started=Date.now();
for(let i=0;i<count;i++){
 const seed=(startSeed+i)>>>0;
 const pair={seed};
 for(const profile of ['baseline','phase_f']){
  const dir=path.join(out,String(seed)+'-'+profile);
  const run=spawnSync(process.execPath,['tools/qa_phase_f_worker.cjs'],{
   cwd:base,encoding:'utf8',timeout:600000,maxBuffer:8*1024*1024,
   env:{...process.env,THRESHOLD_BOT_PROFILE:profile,THRESHOLD_SEED:String(seed),THRESHOLD_RUNS:'1',
    THRESHOLD_TURN_LIMIT:String(limit),THRESHOLD_RESULTS_DIR:dir}
  });
  const report=path.join(dir,'results.json');
  if(run.status!==0||run.error||!fs.existsSync(report)){
   const err={seed,profile,status:run.status,error:String(run.error||''),stderr:String(run.stderr||'').slice(-2500),stdout:String(run.stdout||'').slice(-2500)};
   errors.push(err);pair[profile]={error:err};continue;
  }
  const result=JSON.parse(fs.readFileSync(report,'utf8'));
  if(result.summary?.attempted!==1||result.summary?.harnessErrors!==0||result.results?.length!==1){
   const err={seed,profile,error:'Invalid worker result',summary:result.summary};
   errors.push(err);pair[profile]={error:err};continue;
  }
  const row=result.results[0],r=row.resourceTelemetry||{};
  pair[profile]={floor:row.floor||0,turns:row.turns||0,steps:row.steps||0,
   result:row.result,finished:!!row.finished,
   wins:/Dungeon completato/i.test(row.result||'')&&!!row.finished,
   deaths:/Run terminata/i.test(row.result||'')&&!!row.finished,
   abandoned:!row.finished,heals:row.heals||0,alarmAtBoss3:r.firstVisibleBossByFloor?.['3']?.alarm??null,
   potionsAtBoss3:r.firstVisibleBossByFloor?.['3']?.healsTotal??null,
   hpAtBoss3:r.firstVisibleBossByFloor?.['3']?.hp??null,
   entryFloor4:r.entryByFloor?.['4']||null,actions:row.actions||{}};
  console.log('PAIR_GAME '+JSON.stringify({seed,profile,...pair[profile]}));
 }
 if(pair.baseline&&!pair.baseline.error&&pair.phase_f&&!pair.phase_f.error){
  pair.floorDelta=pair.phase_f.floor-pair.baseline.floor;
  pair.turnDelta=pair.phase_f.turns-pair.baseline.turns;
 }
 trials.push(pair);
 fs.writeFileSync(path.join(out,'results-partial.json'),JSON.stringify({trials,errors},null,2));
}
const good=trials.filter(x=>Number.isFinite(x.floorDelta));
const summarize=profile=>({wins:good.filter(x=>x[profile].wins).length,
 deaths:good.filter(x=>x[profile].deaths).length,
 abandoned:good.filter(x=>x[profile].abandoned).length,
 maxFloor:good.length?Math.max(...good.map(x=>x[profile].floor)):null,
 averageFloor:good.length?Number((good.reduce((s,x)=>s+x[profile].floor,0)/good.length).toFixed(3)):null,
 averageTurns:good.length?Math.round(good.reduce((s,x)=>s+x[profile].turns,0)/good.length):null});
const summary={change_id:'THR-20261103-001',playable_version:'v18.26',seedStart:startSeed,
 requestedPairs:count,completedPairs:good.length,failedPairs:count-good.length,
 turnLimit:limit,baseline:summarize('baseline'),phase_f:summarize('phase_f'),
 phaseFBeterFloor:good.filter(x=>x.floorDelta>0).length,
 baselineBetterFloor:good.filter(x=>x.floorDelta<0).length,
 tiedFloor:good.filter(x=>x.floorDelta===0).length,
 elapsedMs:Date.now()-started,method:'Same seeded PRNG and identical initial QA shop profile; later RNG draws may diverge with decisions. Actual browser input, not human play.'};
fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({summary,trials,errors},null,2));
console.log('PHASE_F_PAIRED_FINAL '+JSON.stringify(summary));
if(errors.length||good.length!==count)process.exitCode=1;
