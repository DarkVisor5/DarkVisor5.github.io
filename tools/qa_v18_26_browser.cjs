'use strict';
const http=require('node:http'),path=require('node:path'),fs=require('node:fs');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const mimes={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.ico':'image/x-icon'};
const server=http.createServer((req,res)=>{
 try {
  const raw=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let full=path.resolve(root,'.'+raw);
  if(full!==root&&!full.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
  if(fs.existsSync(full)&&fs.statSync(full).isDirectory())full=path.join(full,'index.html');
  if(!fs.existsSync(full)){res.writeHead(404);return res.end('Not found: '+raw)}
  res.writeHead(200,{'Content-Type':mimes[path.extname(full)]||'application/octet-stream'});
  fs.createReadStream(full).pipe(res);
 }catch(error){res.writeHead(500);res.end(String(error))}
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const port=server.address().port,url='http://127.0.0.1:'+port+'/threshold-v18-preview/';
 let browser;
 try {
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  for(const spec of [{name:'desktop',width:1280,height:800,isMobile:false},{name:'mobile',width:390,height:844,isMobile:true}]){
   const context=await browser.newContext({viewport:{width:spec.width,height:spec.height},isMobile:spec.isMobile,hasTouch:spec.isMobile});
   const page=await context.newPage(),errors=[],missing=[];
   page.on('pageerror',error=>errors.push(error.message));
   page.on('response',response=>{if(response.status()>=400&&response.url().startsWith('http://127.0.0.1:'+port))missing.push(response.status()+' '+response.url())});
   await page.goto(url,{waitUntil:'domcontentloaded',timeout:25000});
   await page.waitForFunction(()=>document.querySelector('#dungeon-fixed')?.dataset.ready==='1',{timeout:12000});
   const apis=await page.evaluate(()=>({bank:window.ThresholdRiddles?.questions?.length,types:window.ThresholdPhaseB?.types?.length,levers:window.ThresholdPhaseBWorld?.levers?.length}));
   assert.deepEqual(apis,{bank:32,types:16,levers:5},'Browser APIs '+spec.name);
   await page.evaluate(()=>document.querySelector('#enterBtn').click());
   await page.waitForFunction(()=>!document.querySelector('#game')?.classList.contains('hidden'),{timeout:10000});
   await page.locator('#dungeon-fixed').focus();
   for(const key of ['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'])await page.keyboard.press(key);
   await page.waitForTimeout(350);
   assert.equal(errors.length,0,'Page errors '+spec.name+': '+errors.join('; '));
   assert.equal(missing.length,0,'Missing assets '+spec.name+': '+missing.join('; '));
   assert.ok(await page.locator('#map').evaluate(el=>el.width>0&&el.height>0),'Canvas '+spec.name);
   await page.screenshot({path:'/tmp/threshold-v18-26-'+spec.name+'.png'});
   console.log('PASS '+spec.name+': started dungeon, moved, 32 riddles, 16 interactions, 5 levers, canvas and assets OK');
   await context.close();
  }
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve))}
})().catch(error=>{console.error(error);process.exitCode=1});
