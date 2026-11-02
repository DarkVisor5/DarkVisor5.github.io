'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(base,'threshold-v18-preview/js/game.js'),'utf8');
const marker='loadMeta();syncSoundButtons();hydrateMatchupIcons();renderHub();\n})();';
const hook="\nwindow.__deep={\n generate(floor,seed){\n  const prev=Math.random;let v=(seed*17333+floor*971+12345)>>>0;\n  Math.random=()=>{v=(v+0x6D2B79F5)>>>0;let t=v;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296};\n  try{Object.assign(s,generateFloor(floor));s.floor=floor;v18RoomDecor();phaseBWorld?.setup()}finally{Math.random=prev}\n  return this.snapshot();\n },\n snapshot(){\n  const p=s.keyPuzzle;\n  return {floor:s.floor,map:s.map.map(r=>r.join('')),start:{...s.startPos},stairs:{...s.stairs},\n   puzzle:p?JSON.parse(JSON.stringify(p)):null,\n   furniture:v18RoomDecor().map(o=>({x:o.x,y:o.y,w:o.w,h:o.h,type:o.type,room:o.room,solid:o.solid})),\n   doors:phaseBWorld?.allDoors().map(d=>({x:d.x,y:d.y,trigger:d.trigger,open:d.open,entryX:d.entryX,entryY:d.entryY}))||[],\n   bosses:s.enemies.filter(e=>e.boss).map(e=>({x:e.x,y:e.y,hp:e.hp}))};\n },\n solve(){\n  const p=s.keyPuzzle;if(!p)throw Error('Missing puzzle '+s.floor);\n  const go=o=>{if(!o)throw Error('Missing objective on '+s.floor);s.player.x=o.x;s.player.y=o.y};\n  if(s.floor===1){go(p.key);interactPuzzle()}\n  if(s.floor===2){go(p.tablet);interactPuzzle();go(p.shrine);onPuzzleWait()}\n  if(s.floor===3){go(p.anchor);interactPuzzle();for(const n of p.route){const d=DIR[n];s.player.x+=d.x;s.player.y+=d.y;onPuzzleStep(d.x,d.y)}}\n  if(s.floor===4){go(p.tablet);interactPuzzle();go(p.decoder);interactPuzzle();go(p.shrine);for(let i=0;i<3;i++)onPuzzleWait()}\n  if(s.floor===5){go(p.tablet);interactPuzzle();go(p.decoder);interactPuzzle();for(const sg of p.sigils){go(sg);onPuzzleStep(1,0)}go(p.finalSeal);onPuzzleWait()}\n  return {opened:p.door.open,found:p.keyFound,floor:s.floor};\n },\n bossGate(){\n  const boss=s.enemies.find(e=>e.boss&&e.hp>0);if(!boss)return null;\n  const before=bossAlive();boss.hp=0;return {before,after:bossAlive()};\n },\n down(){descend();return s.floor},\n finish(){finishRun('qa_scripted',true);return !root.querySelector('#runSummary').classList.contains('hidden')}\n};\n";
assert.equal(source.split(marker).length,2,'Missing private API instrumentation anchor');
const replacement=source.replace(marker,hook+'\n'+marker);
new Function(replacement);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json','.ico':'image/x-icon'};
const server=http.createServer((req,res)=>{
 try{
  const url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file=path.resolve(base,'.'+url);
  if(!file.startsWith(base+path.sep)){res.writeHead(403);return res.end()}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)){res.writeHead(404);return res.end('not found')}
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
  if(file===path.join(base,'threshold-v18-preview/js/game.js'))res.end(replacement);
  else fs.createReadStream(file).pipe(res);
 }catch(e){res.writeHead(500);res.end(String(e))}
});
const id=(p)=>p.x+','+p.y;
function bfs(d,unlocked){
 const map=d.map,blocked=new Set(),start=d.start;
 for(const a of d.furniture)if(a.solid)for(let y=a.y;y<a.y+a.h;y++)for(let x=a.x;x<a.x+a.w;x++)blocked.add(x+','+y);
 const explored=new Set([id(start)]),queue=[start],gate=d.puzzle?.door;
 for(let i=0;i<queue.length;i++){
  const q=queue[i];
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const x=q.x+dx,y=q.y+dy,k=x+','+y;
   if(y<0||x<0||y>=map.length||x>=map[0].length||map[y][x]==='#'||blocked.has(k)||explored.has(k))continue;
   if(!unlocked&&gate&&!gate.open&&gate.x===x&&gate.y===y)continue;
   explored.add(k);queue.push({x,y});
  }
 }
 return explored;
}
function validate(d,seed){
 const closed=bfs(d,false),opened=bfs(d,true),p=d.puzzle;
 const issue=message=>{throw Error('seed '+seed+' floor '+d.floor+': '+message)};
 if(!p)issue('missing mandatory puzzle');
 if(!opened.has(id(d.stairs)))issue('stairs unreachable with unlocked gate');
 if(d.floor>=4&&closed.has(id(d.stairs)))issue('locked central gate bypassed');
 const targets=d.floor===1?[p.key]:d.floor===2?[p.tablet,p.shrine]:d.floor===3?[p.anchor]:d.floor===4?[p.tablet,p.decoder,p.shrine]:[p.tablet,p.decoder,...p.sigils,p.finalSeal];
 if(d.floor===5&&p.sigils.length!==3)issue('wrong sigil count '+p.sigils.length);
 for(const [i,obj] of targets.entries())if(!obj||!closed.has(id(obj)))issue('mandatory objective '+i+' unreachable '+JSON.stringify(obj));
 if(d.floor===3){
  if(!p.route||p.route.length!==5)issue('missing route of five steps');
  let cursor={...p.anchor};
  for(const [i,name] of p.route.entries()){
   const diff={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[name];
   if(!diff)issue('bad route direction');
   cursor={x:cursor.x+diff[0],y:cursor.y+diff[1]};
   if(!closed.has(id(cursor)))issue('route step '+i+' blocked');
  }
 }
 for(const door of d.doors){
  if(d.map[door.y][door.x]!=='#')issue('niche already passable before unlock');
  if(!opened.has(door.entryX+','+door.entryY))issue('niche entry unreachable even after central gate opens');
  if(door.x===p.door.x&&door.y===p.door.y)issue('niche overlaps mandatory gate');
 }
 if((d.floor===3||d.floor===5)&&d.bosses.length===0)issue('missing boss');
 return {furniture:d.furniture.length,doors:d.doors.length,objectives:targets.length};
}
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/threshold-v18-preview/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#dungeon-fixed')?.dataset.ready==='1');
  await page.evaluate(()=>document.querySelector('#enterBtn').click());
  const total={floors:0,solved:0,niches:0,props:0};
  const layouts=Number(process.env.THRESHOLD_QA_LAYOUTS||100);
  for(let seed=1;seed<=layouts;seed++){
   const generated=await page.evaluate(seed=>{
    const out=[];for(let floor=1;floor<=5;floor++){const d=window.__deep;const state=d.generate(floor,seed);const solved=d.solve();out.push({state,solved})}
    return out;
   },seed);
   for(const v of generated){
    const n=validate(v.state,seed);
    if(!v.solved.opened||!v.solved.found)throw Error('Failed puzzle seed '+seed+' floor '+v.state.floor);
    total.floors++;total.solved++;total.niches+=n.doors;total.props+=n.furniture;
   }
   if(seed%25===0)console.log('PROGRESS '+seed+' seeds / '+total.floors+' genuine game floors');
  }
  const five=await page.evaluate(()=>{
   const a=window.__deep,out=[];
   document.querySelector('#enterBtn').click();
   for(let floor=1;floor<=5;floor++){
    if(a.snapshot().floor!==floor)throw Error('Floor mismatch '+floor);
    const solved=a.solve();
    if(!solved.opened)throw Error('Puzzle failed '+floor);
    const boss=a.bossGate();
    if(boss&&(!boss.before||boss.after))throw Error('Boss gate check failed '+floor);
    out.push({floor,puzzle:true,bossGate:!!boss});
    if(floor<5&&a.down()!==floor+1)throw Error('Failed descend from '+floor);
   }
   return {out,summary:a.finish()};
  });
  assert.equal(five.out.length,5);
  assert.equal(five.summary,true);
  if(errors.length)throw Error('Browser exceptions: '+errors.join(' | '));
  console.log('PASS: '+JSON.stringify(total));
  console.log('PASS: scripted five-floor progression and mandatory puzzles; boss HP forced to zero for gate assertion (NOT real combat)');
 }finally{await browser?.close();await new Promise(ok=>server.close(ok))}
})().catch(e=>{console.error('DEEP QA FAILURE',e.stack||e);process.exitCode=1});
