'use strict';
// THRESHOLD_CHANGE_ID: THR-20261106-002 — four-room visual regression via
// real Chromium. Engine-generated map with player REPOSITIONED as a visual
// fixture; this is NOT a normal bot run or human playtest.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),relative='threshold-v18-preview/js/game.js';
const old=execFileSync('git',['show','b7c454a98d8c6c56c1f25df1fc3e0d4f245f5449:'+relative],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024});
const now=fs.readFileSync(path.join(root,relative),'utf8');
const anchor='loadMeta();syncSoundButtons();hydrateMatchupIcons();renderHub();\n})();';
const hook="window.__qaArtRoom={\n init(seed,kind){\n  let n=seed>>>0;\n  Math.random=()=>{n=(n+0x6d2b79f5)|0;let z=Math.imul(n^(n>>>15),1|n);z=(z+Math.imul(z^(z>>>7),61|z))^z;return ((z^(z>>>14))>>>0)/4294967296};\n  startRun();closeGuide(true);root.querySelector('#floorSplash')?.classList.remove('show');\n  const room=s.roomCategories.filter(r=>r.type===kind&&r.w>=5&&r.h>=4)\n   .sort((a,b)=>b.w*b.h-a.w*a.h)[0];\n  if(!room)return null;\n  s.player.x=room.x+Math.floor(room.w/2);\n  s.player.y=room.y+Math.floor(room.h/2);\n  s.torchLightLevel=85;updateVisibility();render();\n  const furniture=v18RoomDecor().filter(p=>p.room.x===room.x&&p.room.y===room.y)\n   .map(p=>({type:p.type,x:p.x,y:p.y,w:p.w,h:p.h}));\n  window.__qaArtSelected={...room};\n  return {room,furniture,seen:s.seen.size,visible:s.visible.size,\n   light:torchLight(),canvasWidth:canvas.width};\n },\n measure(){\n  const room=window.__qaArtSelected,c=camera(),data=ctx.getImageData(0,0,canvas.width,canvas.height).data;\n  const furniture=new Set(v18RoomDecor().flatMap(p=>{\n   const xs=[];for(let y=p.y;y<p.y+p.h;y++)for(let x=p.x;x<p.x+p.w;x++)xs.push(K(x,y));return xs;\n  }));\n  const points=[];\n  for(let y=room.y;y<room.y+room.h;y++)for(let x=room.x;x<room.x+room.w;x++){\n   if(!s.visible.has(K(x,y))||s.map[y]?.[x]==='#'||furniture.has(K(x,y)))continue;\n   if(Math.hypot(x-s.player.x,y-s.player.y)<1.7)continue;\n   const cx=Math.floor((x-c.sx+.5)*CELL),cy=Math.floor((y-c.sy+.5)*CELL);\n   if(cx<4||cy<4||cx>=canvas.width-4||cy>=canvas.height-4)continue;\n   const i=(cy*canvas.width+cx)*4;points.push([data[i],data[i+1],data[i+2]]);\n  }\n  const rgb=points.length?[0,1,2].map(k=>points.reduce((s,p)=>s+p[k],0)/points.length):null;\n  return {rgb,count:points.length,seen:s.seen.size,visible:s.visible.size,light:torchLight(),\n   image:canvas.toDataURL('image/png')};\n }\n};";
function inject(s){assert.equal(s.split(anchor).length,2,'QA fixture anchor');return s.replace(anchor,hook+'\n'+anchor)}
const scripts={old:inject(old),current:inject(now)};
new Function(scripts.old);new Function(scripts.current);
const mimes={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.json':'application/json'};
const server=http.createServer((req,res)=>{
 try{
  const u=decodeURIComponent(new URL(req.url,'http://localhost').pathname),m=u.match(/^\/(old|current)(\/.*)$/);
  if(!m){res.writeHead(404);return res.end()}
  let f=path.resolve(root,'.'+m[2]);if(!f.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
  if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');
  if(!fs.existsSync(f)){res.writeHead(404);return res.end(m[2])}
  res.writeHead(200,{'Content-Type':mimes[path.extname(f)]||'application/octet-stream'});
  if(m[2]==='/'+relative)res.end(scripts[m[1]]);
  else fs.createReadStream(f).pipe(res);
 }catch(e){res.writeHead(500);res.end(String(e))}
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const categories=['crypt','archive','infirmary','sanctuary'];
  for(const device of [{name:'desktop',w:1280,h:800,mobile:false},{name:'mobile',w:390,h:844,mobile:true}]){
   const results={};
   for(const kind of categories){
    const rec={};
    for(const mode of ['old','current']){
     const context=await browser.newContext({viewport:{width:device.w,height:device.h},isMobile:device.mobile,hasTouch:device.mobile,reducedMotion:'reduce'});
     const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
     await page.goto('http://127.0.0.1:'+server.address().port+'/'+mode+'/threshold-v18-preview/',{waitUntil:'domcontentloaded'});
     await page.waitForFunction(()=>document.querySelector('#dungeon-fixed')?.dataset.ready==='1');
     const before=await page.evaluate(kind=>window.__qaArtRoom.init(20261106,kind),kind);
     assert.ok(before&&before.room,'Category absent '+kind);
     const after=await page.evaluate(()=>window.__qaArtRoom.measure());
     assert.equal(errors.length,0,mode+' console errors: '+errors.join('; '));
     const file='/tmp/threshold-art-'+device.name+'-'+kind+'-'+mode+'.png';
     fs.writeFileSync(file,Buffer.from(after.image.slice(after.image.indexOf(',')+1),'base64'));
     delete after.image;rec[mode]={...before,measure:after};
     await context.close();
    }
    const a=rec.current,b=rec.old;
    assert.deepEqual(a.room,b.room,'Seeded room changed '+kind);
    assert.ok(a.seen>=a.visible&&b.seen>=b.visible,'Invalid fog bookkeeping '+kind);
    // Initial revealed history may differ after prop-anchored optional setup;
    // visibility from the identical relocated cell must remain equal.
    console.log('ART_FOG_COMPARISON '+JSON.stringify({device:device.name,kind,oldSeen:b.seen,newSeen:a.seen,oldVisible:b.visible,newVisible:a.visible}));
    assert.equal(a.visible,b.visible,'Visible map changed '+kind);
    assert.equal(a.light,b.light,'Torch resource changed '+kind);
    assert.ok(a.measure.count>=3&&b.measure.count>=3,'Insufficient floor samples '+kind);
    const contrast=Math.hypot(...a.measure.rgb.map((v,i)=>v-b.measure.rgb[i]));
    assert.ok(contrast>10,'Art must create category identity '+kind+': color delta '+contrast);
    if(['crypt','archive','infirmary','sanctuary'].includes(kind)){
      assert.ok(a.furniture.length<=3,'Too many props in pilot '+kind);
    }
    results[kind]={room:a.room,rgb:a.measure.rgb,delta:contrast,
      propsBefore:b.furniture.length,propsAfter:a.furniture.length};
    console.log('ART_QA '+JSON.stringify({device:device.name,kind,...results[kind]}));
   }
   const types=Object.keys(results);
   for(let i=0;i<types.length;i++)for(let j=i+1;j<types.length;j++){
    const d=Math.hypot(...results[types[i]].rgb.map((v,k)=>v-results[types[j]].rgb[k]));
    assert.ok(d>7,'Two themes still too similar in sampled room '+types[i]+', '+types[j]+': '+d);
   }
   console.log('ART_QA_DEVICE_OK '+device.name+' 4 distinct palettes, stable visibility, screenshots');
  }
 }finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error('ART_QA_FAILED',e.stack||e);process.exitCode=1});
