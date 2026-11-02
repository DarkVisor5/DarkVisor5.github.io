'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(base,p),'utf8');
const pathGame=path.join(base,'threshold-v18-preview/js/game.js');
const marker='loadMeta();syncSoundButtons();hydrateMatchupIcons();renderHub();\n})();';
const source=read('threshold-v18-preview/js/game.js'),hook=read('tools/qa_boss_arena_fixture.js');
assert.equal(source.split(marker).length,2);
const app=source.replace(marker,hook+'\n'+marker);
new Function(app);
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{try{let p=path.resolve(base,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!p.startsWith(base+path.sep)){res.writeHead(403);return res.end()}if(fs.existsSync(p)&&fs.statSync(p).isDirectory())p=path.join(p,'index.html');if(!fs.existsSync(p)){res.writeHead(404);return res.end('missing '+p)}res.setHeader('Content-Type',mime[path.extname(p)]||'application/octet-stream');if(p===pathGame)res.end(app);else fs.createReadStream(p).pipe(res)}catch(e){res.writeHead(500);res.end(String(e))}});
const dSword=n=>Array(n).fill('duelistSword'),large=n=>Array(n).fill('large');
const profiles=[
 {id:'scarce',maxHp:45,hp:25,weapons:['longSword','shortSword'],potions:['small']},
 {id:'typical',maxHp:45,hp:40,weapons:['longSword','longSword','duelistSword'],potions:['small','small','large']},
 {id:'prepared',maxHp:45,hp:45,weapons:dSword(4),potions:large(3)},
 {id:'veteran',maxHp:55,hp:55,weapons:dSword(5),potions:large(4)}
];
const runCount=Number(process.env.THRESHOLD_SCENARIOS||100);
const shard=Number(process.env.THRESHOLD_SHARD||0),numShards=Number(process.env.THRESHOLD_SHARDS||10);
const noDodge=process.env.THRESHOLD_NO_DODGE==='1';
const dir=process.env.THRESHOLD_RESULTS_DIR||'/tmp/boss-feasibility';
fs.mkdirSync(dir,{recursive:true});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'reduce'});
 // Rank IV veteran account carries five purchased/owned, preselected cards.
 // No damage, player HP, durability or boss stats are modified by account.
 await context.addInitScript({content:JSON.stringify({})+';'+
  "if(!localStorage.getItem('dungeonCrawlerMetaV5'))localStorage.setItem('dungeonCrawlerMetaV5',JSON.stringify({firstRun:false,bank:0,owned:['swordMaster','medic','bulwark','quartermaster','survivor'],deck:['swordMaster','medic','bulwark','quartermaster','survivor'],objectiveClaims:[],guideSeen:true,meta:{bestFloor:4}}));"});
 const page=await context.newPage(),exceptions=[];
 page.on('pageerror',e=>exceptions.push(String(e)));
 await page.goto('http://127.0.0.1:'+server.address().port+'/threshold-v18-preview/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('#dungeon-fixed')?.dataset.ready==='1');
 const testResult=[];
 for(const floor of [3,5])for(let i=0;i<runCount;i++){
  if(i%numShards!==shard)continue;
  const p=profiles[i%4];
  try{
   const result=await page.evaluate(({floor,profile,noDodge})=>{
    const app=document.querySelector('#dungeon-fixed'),qa=window.__feasibilityQA;
    const initial=qa.setup(floor,profile);let actions=0,attacks=0,heals=0,steps=0,waits=0,equips=0,bossHpBefore=initial.boss.hp;
    let reason='action_limit',survivorTriggered=false,reinforcements=0,lastHp=initial.hp;
    const send=k=>app.dispatchEvent(new KeyboardEvent('keydown',{key:k,bubbles:true,cancelable:true}));
    for(;actions<160;actions++){
      let v=qa.view(),b=v.boss;
      if(v.finished){reason='died';break}
      if(!b||b.hp<=0){reason='boss_defeated';break}
      survivorTriggered=survivorTriggered||v.log?.some(x=>x.includes('Ultima resistenza'))||false;
      // Health and game controls are read from the actual user interface.
      const missing=v.maxHp-v.hp;
      const nextPot=v.potions[0],healCapacity=nextPot==='large'?25:nextPot==='small'?12.5:0;
      if(nextPot&&missing>=Math.min(healCapacity,15)&&v.hp<=Math.max(18,v.maxHp*.65)){
        app.querySelector('#healBtn').click();heals++;continue;
      }
      const equipped=v.weapons.find(w=>w.uid===v.equippedUid);
      if(!equipped||equipped.uses<=0){
        const backup=v.weapons.find(w=>w.uses>0);
        if(backup){
          const rows=[...app.querySelectorAll('#inventory .inv-row')],idx=v.weapons.findIndex(w=>w.uid===backup.uid);
          // The inventory also contains healing items: here weapons are first in fixture.
          if(rows[idx]?.querySelector('button')){rows[idx].querySelector('button').click();equips++;continue}
        }
      }
      const dist=(x,y)=>Math.abs(x-b.x)+Math.abs(y-b.y),d=dist(v.player.x,v.player.y);
      const good=v.moves.map(m=>({...m,d:dist(m.x,m.y)}));
      if(b.telegraph&&!noDodge){
        if(d>1){send(' ');waits++;continue}
        const away=good.filter(x=>x.d>1).sort((a,c)=>c.d-a.d)[0];
        if(away){send(away.key);steps++;continue}
      }
      if(d===1){
        app.querySelector('#attackBtn').click();attacks++;
        const targets=[...app.querySelectorAll('#targetChoices .target-btn')];
        if(targets.length) {
          const target=targets.find(x=>/Custode|Signore del Profondo/.test(x.textContent));
          if(target)target.click();else targets[0].click();
        }
        continue;
      }
      if(v.pathStep){send(v.pathStep);steps++;continue}
      const towards=good.sort((a,c)=>a.d-c.d)[0];
      if(towards&&towards.d<d){send(towards.key);steps++;continue}
      send(' ');waits++;
    }
    const final=qa.view(),title=app.querySelector('#summaryTitle')?.textContent||'';
    if(final.finished)reason='died';
    else if(final.boss?.hp<=0)reason='boss_defeated';
    return {floor,profile:profile.id,hpStart:profile.hp,maxHp:profile.maxHp,
      swords:profile.weapons,potionsStart:profile.potions,initialBossHp:bossHpBefore,
      bossHpEnd:final.boss?.hp??null,reason,title,
      hpEnd:final.hp??0,remainingWeapons:final.weapons||[],
      remainingPotions:final.potions||[],alarm:final.alarm,
      actions,attacks,heals,steps,waits,equips,survivorTriggered,noDodge};
   },{floor,profile:p,noDodge});
   testResult.push(result);
   console.log('BOSS_SCENARIO '+JSON.stringify(result));
  }catch(e){const obj={floor,profile:p.id,error:String(e)};testResult.push(obj);console.error('BOSS_ERROR '+JSON.stringify(obj))}
 }
 const wins=testResult.filter(x=>x.reason==='boss_defeated').length;
 const summary={shard,numShards,scenarios:testResult.length,wins,deaths:testResult.filter(x=>x.reason==='died').length,
 limit:testResult.filter(x=>x.reason==='action_limit').length,errors:testResult.filter(x=>x.error).length,exceptions:exceptions.slice(0,6)};
 fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify({summary,results:testResult},null,2));
 console.log('BOSS_FEASIBILITY_SUMMARY '+JSON.stringify(summary));
 if(summary.errors||summary.exceptions.length)process.exitCode=1;
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve))}
})().catch(e=>{console.error('BOSS_FEASIBILITY_FATAL',e.stack||e);process.exitCode=1});
