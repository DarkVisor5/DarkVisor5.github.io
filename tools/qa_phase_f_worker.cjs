'use strict';
// THRESHOLD_CHANGE_ID: THR-20261103-004 — compare current policy to frozen THR-003 controller.
// THRESHOLD_CHANGE_ID: THR-20261103-002 — passive terminal movement and resource telemetry for BOTH policies.
// THRESHOLD_CHANGE_ID: THR-20261103-001 — paired-seed browser worker, QA only.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(base,p),'utf8');
const gamePath=path.join(base,'threshold-v18-preview/js/game.js');
const marker='loadMeta();syncSoundButtons();hydrateMatchupIcons();renderHub();\n})();';
const profile=['baseline','prior','phase_f'].includes(process.env.THRESHOLD_BOT_PROFILE)?process.env.THRESHOLD_BOT_PROFILE:'phase_f';
const botKey=profile==='baseline'?'ThresholdOptimalDeckBot':'ThresholdPhaseFBot';
const original=read('threshold-v18-preview/js/game.js'),view=read('tools/qa_phase_c_view.js'),agent=read(profile==='baseline'?'tools/qa_optimal_sword_build_bot.js':profile==='prior'?'tools/qa_phase_f_previous_bot.js':'tools/qa_phase_f_bot.js');
const monitor=read('tools/qa_resource_checkpoints.js');
assert.equal(original.split(marker).length,2,'Game code injection anchor changed');
const instrumented=original.replace(marker,view+'\n'+marker);
new Function(instrumented);new Function(agent);new Function(monitor);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json','.ico':'image/x-icon'};
const server=http.createServer((req,res)=>{
 try{
  let p=path.resolve(base,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!p.startsWith(base+path.sep)){res.writeHead(403);return res.end()}
  if(fs.existsSync(p)&&fs.statSync(p).isDirectory())p=path.join(p,'index.html');
  if(!fs.existsSync(p)){res.writeHead(404);return res.end('not found '+p)}
  res.setHeader('Content-Type',mime[path.extname(p)]||'application/octet-stream');
  if(p===gamePath)res.end(instrumented);else fs.createReadStream(p).pipe(res);
 }catch(e){res.writeHead(500);res.end(String(e))}
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 // THRESHOLD_CHANGE_ID: THR-20261103-003 — default 5,000 genuine browser actions, not per-floor.
 const runCount=Number(process.env.THRESHOLD_RUNS||1),limit=Number(process.env.THRESHOLD_TURN_LIMIT||5000),seed=Number(process.env.THRESHOLD_SEED||1103)>>>0;
 assert.ok(Number.isSafeInteger(limit)&&limit>=50&&limit<=10000,'QA action cap must be 50–10000');
 const dir=process.env.THRESHOLD_RESULTS_DIR||'/tmp/threshold-phase-f-'+profile+'-'+seed;
 fs.mkdirSync(dir,{recursive:true});
 const results=[],errors=[],started=Date.now();
 try{
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  let context=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'reduce'});
   // Deterministic PRNG before loading the unmodified engine, same seed in both policies.
   // The streams may diverge after player actions diverge: paired INITIAL maps, not paired combat rolls.
   await context.addInitScript({content:`(()=>{let s=${seed}>>>0;Math.random=()=>{s=(s+0x6d2b79f5)|0;let z=Math.imul(s^(s>>>15),1|s);z=(z+Math.imul(z^(z>>>7),61|z))^z;return ((z^(z>>>14))>>>0)/4294967296;};})();`});
  await context.addInitScript({content:"(()=>{\ntry {\n const storage='dungeonCrawlerMetaV5';\n if(localStorage.getItem(storage)===null){\n  // QA account history: reached floor 4 in earlier runs, saved enough gold\n  // to purchase five legally unlocked rank-1/3/4 cards at the actual shop.\n  // No personal stats, starting HP or enemy settings are upgraded.\n  localStorage.setItem(storage,JSON.stringify({\n   firstRun:false,bank:3280,owned:[],deck:[],objectiveClaims:[],\n   guideSeen:true,meta:{bestFloor:4}\n  }));\n }\n}catch(e){console.warn('QA card profile startup',e)}\n})();"});
  let page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.text().startsWith('PLAY100_PROGRESS')||m.text().startsWith('PLAY100_ABORTED'))process.stdout.write(m.text()+'\n')});
  const url='http://127.0.0.1:'+server.address().port+'/threshold-v18-preview/';

  // Verified v18 build from October 29: 10,541/11,000 simulation wins.
  // Rank IV required for survivor; purchases total 3280 coins.
  const cards=[
   {cat:'Armi',name:'Maestro di spada',id:'swordMaster'},
   {cat:'Combatti',name:'Erborista',id:'medic'},
   {cat:'Combatti',name:'Bastione',id:'bulwark'},
   {cat:'Oro',name:'Quartiermastro',id:'quartermaster'},
   {cat:'Combatti',name:'Ultima resistenza',id:'survivor'}
  ];
  const configureCards=async()=>{
   await page.locator('#welcomeStartBtn').click();
   const existing=await page.locator('#deckSlots .deck-name').allTextContents();
   if(existing.length===5){
    assert.deepEqual([...existing].sort(),cards.map(c=>c.name).sort(),'Persisted card deck');
    return;
   }
   for(const card of cards){
    if((await page.locator('#ownedCards .owned-card').allTextContents()).some(t=>t.includes(card.name)))continue;
    await page.locator('#shopTabs .shop-tab').filter({hasText:card.cat}).click();
    const item=page.locator('#shop .shop-item').filter({has:page.locator('.shop-title',{hasText:card.name})});
    assert.equal(await item.count(),1,'Shop item '+card.name);
    await item.locator('.shop-action').click();
   }
   for(const card of cards){
    const b=page.locator('#ownedCards .owned-card').filter({hasText:card.name});
    assert.equal(await b.count(),1,'Owned card '+card.name);
    if(!(await b.getAttribute('class')).includes('selected-card'))await b.click();
   }
   const deck=await page.locator('#deckSlots .deck-name').allTextContents();
   assert.deepEqual([...deck].sort(),cards.map(c=>c.name).sort(),'Exactly five legitimately selected cards');
   console.log('CARD_DECK_SELECTED '+JSON.stringify({ids:cards.map(c=>c.id),cost:3280,rank:4,
    bank:await page.locator('#bank').textContent(),cards:deck}));
  };
  const load=async()=>{
   await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>document.querySelector('#dungeon-fixed')?.dataset.ready==='1',{timeout:20000});
   await page.addScriptTag({content:agent});
   await page.addScriptTag({content:monitor});
   assert.ok(await page.evaluate(()=>!!window.__qaResourceTelemetry),'Resource observation installed');
   assert.ok(await page.evaluate(name=>!!window.__humanBotView&&!!window[name],botKey),'Bot injected '+botKey);
   await configureCards();
  };
  await load();
  for(let i=1;i<=runCount;i++){
   try{
    await page.evaluate(()=>window.__qaResourceTelemetry.reset());
    // THR-20261103-001: seed immediately BEFORE starting a real run, not at page load.
    await page.evaluate(startSeed=>{
     let n=startSeed>>>0;
     Math.random=()=>{n=(n+0x6d2b79f5)|0;let z=Math.imul(n^(n>>>15),1|n);z=(z+Math.imul(z^(z>>>7),61|z))^z;return ((z^(z>>>14))>>>0)/4294967296;};
     window.__phaseFInitial=null;
     // Passive observer works identically for baseline and Fase F. It uses
     // ONLY the bot's player-visible view, never private game state.
     window.__phaseFPassive={movementTiles:0,floorTransitions:0,lastAlive:null,terminal:null};
     const orig=window.__humanBotView;
     window.__humanBotView=(...args)=>{
      const v=orig(...args),t=window.__phaseFPassive;
      if(v.inGame&&!v.finished&&Number.isInteger(v.floor)&&v.player){
       const prev=t.lastAlive;
       if(prev&&prev.floor===v.floor&&
          Math.abs(prev.position.x-v.player.x)+Math.abs(prev.position.y-v.player.y)===1)t.movementTiles++;
       if(prev&&v.floor>prev.floor)t.floorTransitions+=v.floor-prev.floor;
       t.lastAlive={floor:v.floor,position:{x:v.player.x,y:v.player.y},
         hp:v.hp,maxHp:v.maxHp,alarm:v.alarm,instability:v.instability,
         torch:v.torch,gameReportedSteps:v.steps,knownCount:v.knownCount,
         potions:v.inventory.filter(i=>i.kind==='heal').length};
      }else if(v.finished&&!t.terminal){
       t.terminal={lastAlive:t.lastAlive,summaryTitle:v.summary?.title??null};
      }
      if(v.inGame&&!v.finished&&v.floor===1&&!window.__phaseFInitial){
       const masked=v.world.join('|');let hash=2166136261;
       for(let k=0;k<masked.length;k++)hash=Math.imul(hash^masked.charCodeAt(k),16777619)>>>0;
       window.__phaseFInitial={player:v.player,hp:v.hp,known:v.knownCount,mapHash:hash};
      }
      return v;
     };
    },seed);
    const batch=await page.evaluate(({lim,name})=>window[name].play100({count:1,limit:lim}),{lim:limit,name:botKey});
    const resourceTelemetry=await page.evaluate(()=>window.__qaResourceTelemetry.report());
    const initial=await page.evaluate(()=>window.__phaseFInitial);
    const passive=await page.evaluate(()=>window.__phaseFPassive);
    const raw=batch.results[0];
    const row={...raw,steps:passive.movementTiles,
      stepsSource:'observed_adjacent_player_moves',rawBotSteps:raw.steps??null,
      terminalSnapshot:passive.terminal,lastAlive:passive.lastAlive,
      floorTransitionsObserved:passive.floorTransitions,
      run:i,seed,profile,initial,startFloor:1,
      deck:['swordMaster','medic','bulwark','quartermaster','survivor'],resourceTelemetry};
    if(row.floor<1)throw Error('Full-run scenario failed to enter floor 1: '+row.floor);
    results.push(row);
    process.stdout.write('GAME '+i+'/'+runCount+' '+JSON.stringify({result:row.result,finished:row.finished,floor:row.floor,steps:row.steps,turns:row.turns,kills:row.kills,heals:row.heals,deathHp:row.deathHp,deathScene:row.deathScene,actions:row.actions,finalPosition:row.finalPosition,finalPuzzle:row.finalPuzzle,resources:{entry:resourceTelemetry.entryByFloor,firstBoss:resourceTelemetry.firstVisibleBossByFloor}})+'\n');
    if(i===1)await page.screenshot({path:path.join(dir,'screenshot-first-run.png')});
    if(!row.finished){
      // Closing a browser tab is a real abandonment; do NOT fake death or mutate run state.
      await page.close();page=await context.newPage();
      page.on('pageerror',e=>errors.push(e.message));
      await load();
    }
   }catch(error){
    results.push({run:i,result:'test_harness_error',finished:false,error:String(error)});
    errors.push('run '+i+': '+String(error));
    await page.close().catch(()=>{});
    page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    await load();
   }
   if(i%10===0)process.stdout.write('BATCH '+i+'/'+runCount+' elapsed '+Math.round((Date.now()-started)/1000)+'s\n');
   fs.writeFileSync(path.join(dir,'results-partial.json'),JSON.stringify({requested:runCount,attempted:results.length,results,errors},null,2));
  }
  const count=pred=>results.filter(pred).length;
  const summary={requested:runCount,attempted:results.length,completed:count(x=>x.finished),
   wins:count(x=>x.finished&&/Dungeon completato/i.test(x.result)),
   deaths:count(x=>x.finished&&/Run terminata/i.test(x.result)),
   extracts:count(x=>x.finished&&/Estrazione/i.test(x.result)),
   abandoned:count(x=>!x.finished&&!x.error),
   harnessErrors:count(x=>!!x.error),maxFloor:Math.max(...results.map(x=>x.floor||0)),
   averageFloor:Number((results.reduce((a,x)=>a+(x.floor||0),0)/results.length).toFixed(2)),
   averageTurns:Math.round(results.reduce((a,x)=>a+(x.turns||0),0)/results.length),
   elapsedMs:Date.now()-started,errors:errors.slice(0,15)};
  const complete={summary,results};
  fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(complete,null,2));
  console.log('PHASE_F_WORKER_FINAL '+JSON.stringify({startFloor:1,startingKit:'default-first-floor-kit',deck:['swordMaster','medic','bulwark','quartermaster','survivor'],cardBudget:3280,rank:4,seed,profile,...summary}));
  if(results.length!==runCount)throw Error('Did not start '+runCount+' intended browser games');
 }finally{
  await browser?.close();await new Promise(resolve=>server.close(resolve));
 }
})().catch(error=>{console.error('PLAY100_FATAL',error.stack||error);process.exitCode=1});
