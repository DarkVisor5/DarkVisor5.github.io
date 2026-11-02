'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(base,p),'utf8');
const gamePath=path.join(base,'threshold-v18-preview/js/game.js');
const marker='loadMeta();syncSoundButtons();hydrateMatchupIcons();renderHub();\n})();';
const original=read('threshold-v18-preview/js/game.js'),view=read('tools/qa_phase_c_view.js'),agent=read('tools/qa_optimal_sword_build_bot.js');
assert.equal(original.split(marker).length,2,'Game code injection anchor changed');
const instrumented=original.replace(marker,view+'\n'+marker);
new Function(instrumented);new Function(agent);
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
 const runCount=Number(process.env.THRESHOLD_RUNS||10),limit=Number(process.env.THRESHOLD_TURN_LIMIT||2200);
 const dir=process.env.THRESHOLD_RESULTS_DIR||'/tmp/threshold-optimal-sword-build';
 fs.mkdirSync(dir,{recursive:true});
 const results=[],errors=[],started=Date.now();
 try{
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  let context=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'reduce'});
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
   assert.ok(await page.evaluate(()=>!!window.__humanBotView&&!!window.ThresholdOptimalDeckBot),'Bot injected');
   await configureCards();
  };
  await load();
  for(let i=1;i<=runCount;i++){
   try{
    const batch=await page.evaluate(lim=>window.ThresholdOptimalDeckBot.play100({count:1,limit:lim}),limit);
    const row={...batch.results[0],run:i,startFloor:1,deck:['swordMaster','medic','bulwark','quartermaster','survivor']};
    if(row.floor<1)throw Error('Full-run scenario failed to enter floor 1: '+row.floor);
    results.push(row);
    process.stdout.write('GAME '+i+'/'+runCount+' '+JSON.stringify({result:row.result,finished:row.finished,floor:row.floor,steps:row.steps,turns:row.turns,kills:row.kills,heals:row.heals,deathHp:row.deathHp,deathScene:row.deathScene,actions:row.actions,finalPosition:row.finalPosition,finalPuzzle:row.finalPuzzle,trace:row.trace})+'\n');
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
  console.log('OPTIMAL_SWORD_BUILD_FINAL '+JSON.stringify({startFloor:1,startingKit:'default-first-floor-kit',deck:['swordMaster','medic','bulwark','quartermaster','survivor'],cardBudget:1930,rank:2,...summary}));
  if(results.length!==runCount)throw Error('Did not start '+runCount+' intended browser games');
 }finally{
  await browser?.close();await new Promise(resolve=>server.close(resolve));
 }
})().catch(error=>{console.error('PLAY100_FATAL',error.stack||error);process.exitCode=1});
