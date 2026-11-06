'use strict';
// THRESHOLD_CHANGE_ID: THR-20261106-001 — guided visual fixture in REAL Chromium,
// not a full P1-P5 playthrough or evidence of game win.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {execFileSync}=require('node:child_process');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),file='threshold-v18-preview/js/game.js';
const old=execFileSync('git',['show','3a3e64aefbc1a09e2994b7def977de66de075885:'+file],{cwd:root,encoding:'utf8',maxBuffer:4*1024*1024});
const now=fs.readFileSync(path.join(root,file),'utf8');
const anchor='loadMeta();syncSoundButtons();hydrateMatchupIcons();renderHub();\n})();';
const hook="window.__qaLightingFixture={\n start(seed){\n  let n=seed>>>0;\n  Math.random=()=>{n=(n+0x6d2b79f5)|0;let z=Math.imul(n^(n>>>15),1|n);z=(z+Math.imul(z^(z>>>7),61|z))^z;\n   return ((z^(z>>>14))>>>0)/4294967296};\n  startRun(); // Genuine floor generation; relocation below is visual fixture ONLY.\n  const props=v18RoomDecor();\n  const rooms=s.rooms.filter(r=>props.some(p=>p.room.x===r.x&&p.room.y===r.y));\n  const unlit=r=>!(s.torches||[]).some(t=>t.ax>=r.x&&t.ax<r.x+r.w&&t.ay>=r.y&&t.ay<r.y+r.h);\n  rooms.sort((a,b)=>Number(unlit(b))-Number(unlit(a))||b.w*b.h-a.w*a.h);\n  const r=rooms[0]||s.rooms[0];\n  if(!r)throw Error('No generated room');\n  s.player.x=r.cx;s.player.y=r.cy;s.torchLightLevel=85;\n  updateVisibility();render();\n  window.__qaRoom={x:r.x,y:r.y,w:r.w,h:r.h,cx:r.cx,cy:r.cy,unlit:unlit(r)};\n  return {room:window.__qaRoom,furniture:props.length,floor:s.floor,light:torchLight()};\n },\n measure(){\n  const r=window.__qaRoom,c=camera(),data=ctx.getImageData(0,0,canvas.width,canvas.height).data,vals=[];\n  const blocked=new Set(v18RoomDecor().flatMap(p=>{const a=[];for(let y=p.y;y<p.y+p.h;y++)for(let x=p.x;x<p.x+p.w;x++)a.push(K(x,y));return a}));\n  for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){\n   if(!s.visible.has(K(x,y))||s.map[y]?.[x]==='#'||blocked.has(K(x,y)))continue;\n   const d=Math.hypot(x-s.player.x,y-s.player.y);if(d<2||d>5.1)continue;\n   const cx=Math.floor((x-c.sx+.5)*CELL),cy=Math.floor((y-c.sy+.5)*CELL);\n   if(cx<4||cy<4||cx>=canvas.width-4||cy>=canvas.height-4)continue;\n   let total=0,count=0;\n   for(let oy=-3;oy<=3;oy+=2)for(let ox=-3;ox<=3;ox+=2){\n    const i=((cy+oy)*canvas.width+(cx+ox))*4;\n    total+=data[i]*.2126+data[i+1]*.7152+data[i+2]*.0722;count++;\n   }\n   vals.push(total/count);\n  }\n  return {average:vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null,\n   tiles:vals.length,visible:s.visible.size,seen:s.seen.size,\n   torch:torchLight(),room:window.__qaRoom};\n }\n};";
const inject=s=>{assert.equal(s.split(anchor).length,2,'QA hook anchor');return s.replace(anchor,hook+'\n'+anchor)};
const scripts={baseline:inject(old),current:inject(now)};
new Function(scripts.baseline);new Function(scripts.current);
const mimes={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.json':'application/json'};
const server=http.createServer((req,res)=>{
 try{
  const u=decodeURIComponent(new URL(req.url,'http://localhost').pathname),m=u.match(/^\/(baseline|current)(\/.*)$/);
  if(!m){res.writeHead(404);return res.end()}
  let f=path.resolve(root,'.'+m[2]);if(!f.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
  if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');
  if(!fs.existsSync(f)){res.writeHead(404);return res.end(m[2])}
  res.writeHead(200,{'Content-Type':mimes[path.extname(f)]||'application/octet-stream'});
  if(m[2]==='/threshold-v18-preview/js/game.js')res.end(scripts[m[1]]);
  else fs.createReadStream(f).pipe(res);
 }catch(e){res.writeHead(500);res.end(String(e))}
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const spec of [{name:'desktop',width:1280,height:800,mobile:false},
    {name:'mobile',width:390,height:844,mobile:true}]){
   const results={};
   for(const which of ['baseline','current']){
    const context=await browser.newContext({viewport:{width:spec.width,height:spec.height},
      isMobile:spec.mobile,hasTouch:spec.mobile,reducedMotion:'reduce'});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:'+server.address().port+'/'+which+'/threshold-v18-preview/',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.querySelector('#dungeon-fixed')?.dataset.ready==='1');
    const start=await page.evaluate(()=>window.__qaLightingFixture.start(20261106));
    await page.waitForTimeout(150);
    const result=await page.evaluate(()=>window.__qaLightingFixture.measure());
    if(which==='current')assert.equal(await page.evaluate(()=>window.__thresholdBuild?.version),'v18.27');
    assert.equal(errors.length,0,which+' browser exceptions: '+errors.join('; '));
    await page.locator('#map').screenshot({path:'/tmp/threshold-lighting-'+spec.name+'-'+which+'.png'});
    results[which]={start,result};
    await context.close();
   }
   const a=results.current.result,b=results.baseline.result;
   assert.deepEqual(a.room,b.room,'Generated visual fixture must match before/after');
   assert.equal(a.seen,b.seen,'No change to explored fog');
   assert.equal(a.visible,b.visible,'No change to current visibility');
   assert.equal(a.torch,b.torch,'No change to light resource');
   assert.ok(a.tiles>=3&&b.tiles>=3,'Enough floor cells for luma comparison');
   assert.ok(a.average>b.average+1,'Expected room light improvement, before='+b.average+' after='+a.average);
   console.log('LIGHTING_QA '+JSON.stringify({viewport:spec.name,seed:20261106,
    mode:'generated floor with relocated player: controlled visual fixture',
    room:a.room,tiles:a.tiles,oldLuminance:b.average,newLuminance:a.average,
    delta:a.average-b.average,seen:a.seen,visible:a.visible,light:a.torch}));
  }
 }finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error('LIGHTING_QA_ERROR',e.stack||e);process.exitCode=1});
