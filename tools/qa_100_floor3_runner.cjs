'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(base,p),'utf8');
const gamePath=path.join(base,'threshold-v18-preview/js/game.js');
const marker='loadMeta();syncSoundButtons();hydrateMatchupIcons();renderHub();\n})();';
const original=read('threshold-v18-preview/js/game.js'),view=read('tools/qa_100_player_view.js'),agent=read('tools/qa_100_player_bot.js');
assert.equal(original.split(marker).length,2,'Game code injection anchor changed');
const floor3Hook="\n(function setupFloorThreeOnlyForQA(){\n const openAtThirdFloor=()=>{\n  if(!s||s.floor!==1)throw new Error('Test floor-3 setup requires a fresh, normal game');\n  // The harness skips only two initial levels. NO health, items, upgrades, gold,\n  // torches, monsters or boss are modified. Subsequent actions are UI-driven.\n  s.floor=3;\n  Object.assign(s,generateFloor(3));\n  v18RoomDecor();\n  phaseBWorld?.setup();\n  initAmbientRoutines();\n  applyCartographer();\n  applyPathfinder();\n  updateVisibility();\n  log('🧪 QA: ingresso al piano 3 con equipaggiamento iniziale standard.');\n  render();\n };\n for(const id of ['enterBtn','summaryRunBtn']){\n  const button=root.querySelector('#'+id),originalClick=button?.onclick;\n  if(!button||typeof originalClick!=='function')throw Error('Missing original start UI '+id);\n  button.onclick=function(){originalClick.call(this);openAtThirdFloor()};\n }\n})();\n";
const instrumented=original.replace(marker,view+'\n'+floor3Hook+'\n'+marker);
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
 const dir=process.env.THRESHOLD_RESULTS_DIR||'/tmp/threshold-bot-floor3';
 fs.mkdirSync(dir,{recursive:true});
 const results=[],errors=[],started=Date.now();
 try{
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  let context=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'reduce'});
  let page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.text().startsWith('PLAY100_PROGRESS')||m.text().startsWith('PLAY100_ABORTED'))process.stdout.write(m.text()+'\n')});
  const url='http://127.0.0.1:'+server.address().port+'/threshold-v18-preview/';
  const load=async()=>{
   await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>document.querySelector('#dungeon-fixed')?.dataset.ready==='1',{timeout:20000});
   await page.addScriptTag({content:agent});
   assert.ok(await page.evaluate(()=>!!window.__humanBotView&&!!window.ThresholdFairBot),'Bot injected');
  };
  await load();
  for(let i=1;i<=runCount;i++){
   try{
    const batch=await page.evaluate(lim=>window.ThresholdFairBot.play100({count:1,limit:lim}),limit);
    const row={...batch.results[0],run:i,startFloor:3};
    if(row.floor<3)throw Error('Floor 3 scenario did not start on floor 3: '+row.floor);
    results.push(row);
    process.stdout.write('GAME '+i+'/'+runCount+' '+JSON.stringify({result:row.result,finished:row.finished,floor:row.floor,steps:row.steps,turns:row.turns,kills:row.kills,heals:row.heals,actions:row.actions,finalPosition:row.finalPosition,finalPuzzle:row.finalPuzzle,trace:row.trace})+'\n');
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
  console.log('FLOOR3_100_FINAL '+JSON.stringify({startFloor:3,startingKit:'default-first-floor-kit-no-buffs',...summary}));
  if(results.length!==runCount)throw Error('Did not start '+runCount+' intended browser games');
 }finally{
  await browser?.close();await new Promise(resolve=>server.close(resolve));
 }
})().catch(error=>{console.error('PLAY100_FATAL',error.stack||error);process.exitCode=1});
