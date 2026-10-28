
(()=>{
const root=document.getElementById('dungeon-fixed');if(!root||root.dataset.ready)return;root.dataset.ready='1';
const canvas=root.querySelector('#map'),ctx=canvas.getContext('2d'),WORLD=52,DESKTOP_VIEW=15,MOBILE_VIEW=11,DESKTOP_CELL=34,MOBILE_CELL=46,MAX_FLOOR=5,STORE='dungeonCrawlerMetaV5';
let VIEW=DESKTOP_VIEW,CELL=DESKTOP_CELL;
const mobileUI=()=>window.matchMedia('(max-width:700px)').matches||(window.matchMedia('(pointer:coarse)').matches&&Math.min(window.innerWidth,window.innerHeight)<=700);let suppressCanvasClickUntil=0,mobilePointerStart=null;
function applyResponsiveBoard(){const mobile=mobileUI();VIEW=mobile?MOBILE_VIEW:DESKTOP_VIEW;CELL=mobile?MOBILE_CELL:DESKTOP_CELL;canvas.width=VIEW*CELL;canvas.height=VIEW*CELL;root.classList.toggle('mobile-board-mode',mobile)}
applyResponsiveBoard();
let uidCounter=1,enemyCounter=1,shopCat='explore',bank=0,owned=new Set(),deck=new Set(),objectiveClaims=new Set(),firstRun=true,previewEnabled=true,objectivesOpen=false,hudDetails=false,audioEnabled=true,guideSeen=false,guideOpen=false,audioCtx=null,audioMaster=null,s=null,fxFrame=0,toastTimer=0,floorSplashTimer=0,lastRunResult=null;
// v17.8 — animation/game-feel layer. It never changes combat or turn logic.
// v17.9 — torch lighting / darkness pass. Visual only; no gameplay logic changes.
let motionFrame=0;
const MOTION={playerMove:null,enemyMoves:new Map(),playerHit:null,enemyHits:new Map(),playerAttacks:[],enemyAttacks:new Map(),deaths:[],bursts:[]};
const CINEMA={shakes:[],zooms:[]};
const ICON_SRC={"fists": "./assets/images/039f3a7ecd88c3e0.png", "sword": "./assets/images/ecaeaaf6ed4695fb.png", "spear": "./assets/images/a5f41417e0e88c4f.png", "dagger": "./assets/images/33f6b75231e8e0ef.png", "axe": "./assets/images/582a1dfc498192b3.png", "hammer": "./assets/images/685e601d7ef0d0fa.png", "patrol": "./assets/images/f66e601bc482c52c.png", "sentry": "./assets/images/94e84fb6a993ed6f.png", "hunter": "./assets/images/e5e7326844287f57.png", "flanker": "./assets/images/20f0d7ad4e144945.png", "caller": "./assets/images/991f8c8a377fcde2.png", "boss": "./assets/images/87ba6676956784bd.png", "alert": "./assets/images/4bf0013957a391c0.png", "suspicious": "./assets/images/e58adb9c3f540b5e.png", "guard": "./assets/images/b5d44cc2c8b2630e.png", "riposte": "./assets/images/c55cb235243f2b1f.png", "backstab": "./assets/images/b4190acf0c9859f4.png", "extract": "./assets/images/ce8e611527fad9b3.png", "audio_on": "./assets/images/43078fc76fcba29e.png", "audio_off": "./assets/images/20d4997a18bbf44b.png", "armory": "./assets/images/48058d44bc56cffe.png", "treasury": "./assets/images/17706008c8c3e8f9.png", "infirmary": "./assets/images/e119265504280e7b.png", "sanctuary": "./assets/images/513befbf073bdc18.png", "guardroom": "./assets/images/4f590a3d37fd53c9.png", "coin": "./assets/images/92fd5911a2e892a9.png", "potion": "./assets/images/4e419b4976ead701.png", "chest": "./assets/images/3449e6b14ad967ac.png", "trap": "./assets/images/38f2e33055d61b6a.png", "stairs": "./assets/images/e169aa93316ff764.png", "key": "./assets/images/6993f9aeefa9f82d.png", "locked_door": "./assets/images/19deb80ea3b780a6.png", "open_door": "./assets/images/20ae79b68cc9005f.png", "rune_stele": "./assets/images/7b0a87bc9ea8d82d.png", "decoder_tablet": "./assets/images/c943288d3451db08.png", "shrine_sigil": "./assets/images/6c745b0d433b5f33.png", "central_gate": "./assets/images/ffc6304ef0ea5cf7.png", "moon_sigil": "./assets/images/22fe49b0e847fa98.png", "blade_sigil": "./assets/images/f87f52eacdba45b3.png", "eye_sigil": "./assets/images/59fd3dc1051fbda7.png", "shrine_event": "./assets/images/5149d261628a7e62.png", "cache_event": "./assets/images/fb47feaff5ed6f25.png", "cursed_event": "./assets/images/3d42cd5b40d45839.png", "fountain_event": "./assets/images/20b0d91bcedaafa4.png", "forge_event": "./assets/images/7b437054a6ca9681.png", "oracle_event": "./assets/images/3011b4fe35a83cfd.png", "bloodwell_event": "./assets/images/391192edd97cdc0f.png", "silence_event": "./assets/images/eab6c4efce2d2499.png", "monolith_event": "./assets/images/50d14e09e26c0c19.png", "hermit_event": "./assets/images/762b246f181f9adc.png", "roots_event": "./assets/images/65ef848b6f9c6444.png", "grave_event": "./assets/images/874b2ed82f8e2faa.png", "echo_event": "./assets/images/855d40824be25480.png", "prisoner_event": "./assets/images/7a31f66cbc4f930c.png", "player": "./assets/images/056056ab20251e3b.png",
  "player_unarmed": "./assets/images/962a0fbe72056761.png",
  "player_sword": "./assets/images/f0d88924ad27f911.png",
  "player_spear": "./assets/images/57cb22cf4932906b.png",
  "player_dagger": "./assets/images/ffcc986ebb994104.png",
  "player_axe": "./assets/images/3ab37ee56d685125.png",
  "player_hammer": "./assets/images/b24b3237c7dfab2c.png", "enemy_sword": "./assets/images/df1f591fbcbe6140.png", "enemy_spear": "./assets/images/c53041fb798bc79b.png", "enemy_dagger": "./assets/images/45620b70ba264e5b.png", "enemy_axe": "./assets/images/6f0f814dec10551c.png", "enemy_hammer": "./assets/images/d39d6c6a21459fbc.png"};
Object.assign(ICON_SRC,{"enemy_axe_walk0":"./assets/images/49206da455f13d21.png","enemy_axe_walk1":"./assets/images/9770a987c475ce38.png","enemy_dagger_walk0":"./assets/images/911af36ad7895f65.png","enemy_dagger_walk1":"./assets/images/7bb8087e20b2fb86.png","enemy_hammer_walk0":"./assets/images/6714033ed200b89d.png","enemy_hammer_walk1":"./assets/images/b13e8055f2a12070.png","enemy_spear_walk0":"./assets/images/614e38c72f558a16.png","enemy_spear_walk1":"./assets/images/3c58ea7f7d70ca79.png","enemy_sword_walk0":"./assets/images/3a61e70ccea588d4.png","enemy_sword_walk1":"./assets/images/a228f5918d696490.png","player_axe_walk0":"./assets/images/f6ddbace95d6365f.png","player_axe_walk1":"./assets/images/a2edacbe19b914d5.png","player_dagger_walk0":"./assets/images/3cee7aae26edb31f.png","player_dagger_walk1":"./assets/images/df10bf207a6c022d.png","player_hammer_walk0":"./assets/images/b02e00be9d4c8d4d.png","player_hammer_walk1":"./assets/images/33045b8f73ee13f9.png","player_spear_walk0":"./assets/images/8e95efe2a8dfb047.png","player_spear_walk1":"./assets/images/a14c67a33c129c9d.png","player_sword_walk0":"./assets/images/57d313ca250bb3a8.png","player_sword_walk1":"./assets/images/ca601c56d0f1f9b9.png","player_unarmed_walk0":"./assets/images/f23f977b4809b7f6.png","player_unarmed_walk1":"./assets/images/739ffc87831b8246.png"});
const ICON_IMG={};let iconRedrawQueued=false;
function queueIconRedraw(){if(iconRedrawQueued)return;iconRedrawQueued=true;requestAnimationFrame(()=>{iconRedrawQueued=false;if(s)render()})}
const WEAPON_ICON={unarmed:"fists",sword:"sword",spear:"spear",dagger:"dagger",axe:"axe",hammer:"hammer"};
const ROLE_ICON={patrol:"patrol",sentry:"sentry",hunter:"hunter",flanker:"flanker",caller:"caller",boss:"boss"};
const ROOM_ICON={armory:"armory",treasury:"treasury",infirmary:"infirmary",sanctuary:"sanctuary",guardroom:"guardroom"};
const EVENT_ICON={shrine:"shrine_event",cache:"cache_event",cursed:"cursed_event",fountain:"fountain_event",forge:"forge_event",oracle:"oracle_event",bloodwell:"bloodwell_event",silence:"silence_event",monolith:"monolith_event",hermit:"hermit_event",roots:"roots_event",grave:"grave_event",echo:"echo_event",prisoner:"prisoner_event",prisonerCache:"cache_event",monolithEcho:"monolith_event",graveEcho:"grave_event"};
const CARD_ICON={light:"stairs",sense:"oracle_event",silent:"silence_event",packrat:"chest",cartographer:"rune_stele",farsight:"oracle_event",pathfinder:"stairs",trapwise:"trap",spearMaster:"spear",swordMaster:"sword",daggerMaster:"dagger",axeMaster:"axe",hammerMaster:"hammer",armorer:"forge_event",careful:"guard",piercer:"spear",sureGrip:"axe",lastEdge:"forge_event",medic:"potion",predator:"backstab",bloodlust:"alert",duelist:"riposte",survivor:"guard",bulwark:"guard",adrenaline:"bloodwell_event",opening:"sword",scavenger:"cache_event",merchant:"coin",treasure:"chest",insurance:"extract",treasureMap:"decoder_tablet",quartermaster:"potion",bounty:"boss"};
const REWARD_ICON={power:"sword",shadow:"backstab",quietRun:"silence_event",vital:"potion",greedRun:"coin",execution:"axe",healerRun:"fountain_event",durableRun:"forge_event"};
const MISSION_ICON={backs:"backstab",kills:"boss",chests:"chest",gold:"coin",floor3:"stairs",axe:"axe",stun:"hammer",spear:"spear",ghost:"extract"};
const CAT_ICON={explore:"rune_stele",combat:"guard",weapon:"sword",wealth:"coin"};
function getIconImg(key){if(!ICON_SRC[key])return null;if(!ICON_IMG[key]){const img=new Image();img.onload=queueIconRedraw;img.src=ICON_SRC[key];ICON_IMG[key]=img}return ICON_IMG[key]}
for(const key of Object.keys(ICON_SRC))getIconImg(key)
function iconHTML(key,cls="icon-inline",label=""){return ICON_SRC[key]?`<img class="${cls}" alt="${label||key}" src="${ICON_SRC[key]}">`:""}
function drawIcon(key,x,y,size,alpha=1){const img=getIconImg(key);if(!img||!img.complete)return false;ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(img,x,y,size,size);ctx.restore();return true}
function weaponIconKey(fam){return WEAPON_ICON[fam]||"fists"}

const SPRITE_VARIANT_CACHE={};
function normalizeSpritePose(arg1=false,arg2=0,arg3=null){
 if(arg1&&typeof arg1==='object')return {walking:!!arg1.walking,frame:arg1.frame||0,attacking:!!arg1.attacking,attackFamily:arg1.attackFamily||arg1.family||null,attackPhase:arg1.attackPhase||0};
 return {walking:!!arg1,frame:arg2||0,attacking:false,attackFamily:null,attackPhase:0};
}
function spritePoseCacheKey(key,pose){
 const walk=pose.walking?'w'+(pose.frame?1:0):'w-';
 const atk=pose.attacking?('a'+(pose.attackFamily||'x')+'_'+(pose.attackPhase<.45?0:1)):'a-';
 return key+'__'+walk+'__'+atk;
}
function getAnimatedSpriteImg(key,arg1=false,arg2=0,arg3=null){
 const pose=normalizeSpritePose(arg1,arg2,arg3),img=getIconImg(key);if(!img||!img.complete)return img;
 if(pose.walking&&!pose.attacking){
   const walkImg=getIconImg(key+'_walk'+(pose.frame?1:0));
   if(walkImg&&walkImg.complete)return walkImg;
 }
 if(!pose.attacking)return img;
 const cacheKey=spritePoseCacheKey(key,pose);if(SPRITE_VARIANT_CACHE[cacheKey])return SPRITE_VARIANT_CACHE[cacheKey];
 const w=img.naturalWidth||img.width,h=img.naturalHeight||img.height,c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
 let rot=0,sx=.94,sy=.94,tx=0,ty=0,skewX=0;
 const stage=pose.attackPhase<.45?0:1,fam=pose.attackFamily||'sword';
 if(fam==='sword'){
   rot=stage?.12:-.12; sx=stage?1.00:.91; sy=stage?.92:.98; tx=stage?2.5:-2.5; ty=stage?1.5:0; skewX=stage?.04:-.035;
 }else if(fam==='spear'){
   rot=stage?.035:-.035; sx=stage?1.04:.88; sy=stage?.91:.99; tx=stage?3.0:-2.5; ty=stage?1.8:0; skewX=stage?.10:-.045;
 }else if(fam==='dagger'){
   rot=stage?.07:-.08; sx=stage?1.05:.90; sy=stage?.88:1.00; tx=stage?3.2:-1.8; ty=stage?3.0:0; skewX=stage?.12:-.035;
 }else if(fam==='axe'){
   rot=stage?.15:-.18; sx=stage?.98:.90; sy=stage?.90:.98; tx=stage?2.6:-2.0; ty=stage?2.3:-.7; skewX=stage?.05:-.06;
 }else if(fam==='hammer'){
   rot=stage?.10:-.14; sx=stage?1.01:.90; sy=stage?.84:1.00; tx=stage?1.5:-1.5; ty=stage?4.0:-1.0; skewX=stage?.025:-.03;
 }else{
   rot=stage?.06:-.06; sx=stage?1.00:.93; sy=stage?.90:.98; tx=stage?2:-1; ty=stage?2:0;
 }
 g.save();g.translate(w/2+tx,h/2+ty);g.rotate(rot);g.transform(1,0,skewX,1,0,0);g.scale(sx,sy);g.translate(-w/2,-h/2);g.drawImage(img,0,0,w,h);g.restore();
 SPRITE_VARIANT_CACHE[cacheKey]=c;return c;
}
function drawAnimatedIcon(key,x,y,size,alpha=1,arg1=false,arg2=0,arg3=null){
 const img=getAnimatedSpriteImg(key,arg1,arg2,arg3);if(!img||(!img.complete&&!img.getContext))return false;
 ctx.save();ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=true;ctx.drawImage(img,x,y,size,size);ctx.restore();return true;
}
function playerSpriteKey(fam){return ({unarmed:'player_unarmed',sword:'player_sword',spear:'player_spear',dagger:'player_dagger',axe:'player_axe',hammer:'player_hammer'})[fam||'unarmed']||'player_unarmed'}
function drawPlayerWeaponVisual(x,y,size,opts={}){
 const weapon=eqWeapon?eqWeapon():W.unarmed, fam=weapon?.family||'unarmed';
 const spriteKey=playerSpriteKey(fam);
 const pose={walking:!!opts.walking,frame:opts.frame||0,attacking:!!opts.attacking,attackFamily:opts.attackFamily||fam,attackPhase:opts.attackPhase||0};
 const spec=({unarmed:[1.00,0,0],sword:[1.04,-.02,-.02],spear:[1.09,-.045,-.045],dagger:[1.03,-.015,-.015],axe:[1.07,-.035,-.035],hammer:[1.07,-.035,-.035]})[fam]||[1,0,0];
 const ds=size*spec[0],dx=x+size*spec[1],dy=y+size*spec[2];
 if(drawAnimatedIcon(spriteKey,dx,dy,ds,1,pose))return true;
 let drew=false;
 if(drawIcon('player',x,y,size,1))drew=true;
 if(fam&&fam!=='unarmed'){
  const badge=Math.max(11,Math.round(size*.42)), bx=Math.round(x+size*.50), by=Math.round(y+size*.48), cx=bx+badge/2, cy=by+badge/2;
  ctx.save();ctx.fillStyle='rgba(7,10,14,.78)';ctx.beginPath();ctx.arc(cx,cy,badge*.56,0,Math.PI*2);ctx.fill();ctx.strokeStyle=FC[fam]||'#ffffff';ctx.lineWidth=Math.max(1.2,size*.05);ctx.beginPath();ctx.arc(cx,cy,badge*.56,0,Math.PI*2);ctx.stroke();
  if(!drawIcon(weaponIconKey(fam),bx,by,badge,.98)){ctx.fillStyle=FC[fam]||'#fff';ctx.font='bold '+Math.max(8,Math.round(badge*.52))+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(familyGlyph(fam),cx,cy+1)}
  ctx.restore();drew=true;
 }
 return drew;
}
function drawFacingNotch(dir,x,y,size,color='#ffffff'){
 ctx.save();
 ctx.fillStyle=color;
 ctx.strokeStyle='rgba(0,0,0,.45)';
 ctx.lineWidth=1;
 ctx.beginPath();
 if(dir==='up'){ctx.moveTo(x+size/2,y+2);ctx.lineTo(x+size/2-5,y+10);ctx.lineTo(x+size/2+5,y+10)}
 else if(dir==='down'){ctx.moveTo(x+size/2,y+size-2);ctx.lineTo(x+size/2-5,y+size-10);ctx.lineTo(x+size/2+5,y+size-10)}
 else if(dir==='left'){ctx.moveTo(x+2,y+size/2);ctx.lineTo(x+10,y+size/2-5);ctx.lineTo(x+10,y+size/2+5)}
 else {ctx.moveTo(x+size-2,y+size/2);ctx.lineTo(x+size-10,y+size/2-5);ctx.lineTo(x+size-10,y+size/2+5)}
 ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
}
function enemyFamilyIconKey(fam){return "enemy_"+(fam||"sword")}
function roleIconKey(role){return ROLE_ICON[role]||"patrol"}
function roomIconKey(type){return ROOM_ICON[type]||"armory"}
function eventIconKey(type){return EVENT_ICON[type]||"shrine_event"}
function cardIconKey(id){return CARD_ICON[id]||"shrine_sigil"}
function rewardIconKey(id){return REWARD_ICON[id]||"shrine_sigil"}
function missionIconKey(id){return MISSION_ICON[id]||"shrine_sigil"}
function soundIconKey(){return audioEnabled?"audio_on":"audio_off"}
function stateIconKey(state){return state==="alerted"?"alert":state==="suspicious"?"suspicious":null}
function hydrateMatchupIcons(){
 root.querySelectorAll('.matchup-family[data-family]').forEach(el=>{
   const fam=el.dataset.family;
   el.innerHTML=iconHTML(weaponIconKey(fam),'matchup-family-icon',F[fam]?.name||fam)
 })
}

let meta={kills:0,goldExtracted:0,extractions:0,clears:0,minibossKills:0,bossKills:0,deaths:0,bestGold:0,bestFloor:0,depthRewarded:1,bestMissions:0,bestBackstabs:0,winStreak:0,bestWinStreak:0,totalMissions:0,specialRooms:0,dangerWins:0,chestsOpened:0,healsUsed:0,eventsResolved:0,knownPuzzles:[]};

// --- v17.8 Animation Pass -------------------------------------------------
const prefersReducedMotion=()=>window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const animNow=()=>performance.now();
const clamp01=v=>Math.max(0,Math.min(1,v));
const easeOutCubic=t=>1-Math.pow(1-clamp01(t),3);
const easeInOut=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
function motionDuration(ms){return prefersReducedMotion()?0:ms}
function animLive(a,now=animNow()){return !!(a&&now-a.start<(a.dur||0))}
function requestMotionDraw(){if(prefersReducedMotion()||motionFrame)return;motionFrame=requestAnimationFrame(motionTick)}

function pruneCinema(now=animNow()){CINEMA.shakes=CINEMA.shakes.filter(a=>a.start+a.dur>now);CINEMA.zooms=CINEMA.zooms.filter(a=>a.start+a.dur>now)}
function hasCinema(now=animNow()){pruneCinema(now);return CINEMA.shakes.length>0||CINEMA.zooms.length>0}
function cameraPunch(amount=2,dur=140,delay=0){if(prefersReducedMotion())return;CINEMA.shakes.push({amount,start:animNow()+delay,dur});requestMotionDraw()}
function cameraZoom(amount=.035,dur=650,delay=0){if(prefersReducedMotion())return;CINEMA.zooms.push({amount,start:animNow()+delay,dur});requestMotionDraw()}
function cinemaState(now=animNow()){
 let dx=0,dy=0,zoom=1;
 for(const a of CINEMA.shakes){if(now<a.start||now>a.start+a.dur)continue;const t=(now-a.start)/a.dur,fall=1-t,ph=(now-a.start)*.17;dx+=Math.sin(ph*1.7)*a.amount*fall;dy+=Math.cos(ph*2.23)*a.amount*.72*fall}
 for(const z of CINEMA.zooms){if(now<z.start||now>z.start+z.dur)continue;const t=(now-z.start)/z.dur,p=Math.sin(Math.PI*t);zoom+=z.amount*p}
 return{dx,dy,zoom}
}
function attackProgress(a,now=animNow()){
 const elapsed=Math.max(0,now-a.start),base=a.baseDur||a.dur,hold=a.hold||0,stop=base*.46;
 if(!hold)return clamp01(elapsed/base);if(elapsed<stop)return clamp01(elapsed/base);if(elapsed<stop+hold)return .46;return clamp01((elapsed-hold)/base)
}
function pruneMotion(now=animNow()){
 pruneCinema(now);
 if(MOTION.playerMove&&!animLive(MOTION.playerMove,now))MOTION.playerMove=null;
 if(MOTION.playerHit&&!animLive(MOTION.playerHit,now))MOTION.playerHit=null;
 for(const [id,a] of MOTION.enemyMoves)if(!animLive(a,now))MOTION.enemyMoves.delete(id);
 for(const [id,a] of MOTION.enemyHits)if(!animLive(a,now))MOTION.enemyHits.delete(id);
 for(const [id,a] of MOTION.enemyAttacks)if(!animLive(a,now))MOTION.enemyAttacks.delete(id);
 MOTION.playerAttacks=MOTION.playerAttacks.filter(a=>animLive(a,now));
 MOTION.deaths=MOTION.deaths.filter(a=>animLive(a,now));
 MOTION.bursts=MOTION.bursts.filter(a=>animLive(a,now));
}
function hasMotion(now=animNow()){
 pruneMotion(now);
 return !!(MOTION.playerMove||MOTION.playerHit||MOTION.enemyMoves.size||MOTION.enemyHits.size||MOTION.playerAttacks.length||MOTION.enemyAttacks.size||MOTION.deaths.length||MOTION.bursts.length||hasCinema(now));
}
function motionTick(){motionFrame=0;if(!s)return;const now=animNow();pruneMotion(now);draw();if(hasMotion(now))motionFrame=requestAnimationFrame(motionTick)}
function clearMotion(){MOTION.playerMove=null;MOTION.enemyMoves.clear();MOTION.playerHit=null;MOTION.enemyHits.clear();MOTION.playerAttacks.length=0;MOTION.enemyAttacks.clear();MOTION.deaths.length=0;MOTION.bursts.length=0;CINEMA.shakes.length=0;CINEMA.zooms.length=0;if(motionFrame){cancelAnimationFrame(motionFrame);motionFrame=0}}
function beginPlayerMove(fx,fy,tx,ty){const dur=motionDuration(145);if(!dur)return;const now=animNow(),prev=moveState(MOTION.playerMove,now),fromX=prev?prev.x:fx,fromY=prev?prev.y:fy;MOTION.playerMove={fromX,fromY,toX:tx,toY:ty,start:now,dur};requestMotionDraw()}
function beginEnemyMove(e,fx,fy,tx,ty){if(!e)return;const dur=motionDuration(e.role==='hunter'?165:155);if(!dur)return;const now=animNow(),prevRaw=MOTION.enemyMoves.get(e.id),prev=moveState(prevRaw,now);MOTION.enemyMoves.set(e.id,{fromX:prev?prev.x:fx,fromY:prev?prev.y:fy,toX:tx,toY:ty,start:now,dur:prevRaw&&animLive(prevRaw,now)?Math.min(250,prevRaw.dur+70):dur});requestMotionDraw()}
function beginEnemyAttack(e){if(!e)return;const dur=motionDuration(e.boss?190:145);if(!dur)return;MOTION.enemyAttacks.set(e.id,{start:animNow(),dur,fromX:e.x,fromY:e.y,targetX:s?.player?.x??e.x,targetY:s?.player?.y??e.y,boss:!!e.boss});requestMotionDraw()}
function beginPlayerAttack(family,target,opts={}){const base=motionDuration(family==='hammer'?220:family==='axe'?190:family==='spear'?170:family==='dagger'?125:155);if(!base)return;const hold=opts.miss?0:motionDuration(family==='hammer'?82:family==='axe'?62:family==='sword'?38:family==='dagger'?24:22),dur=base+hold,impact=base*.43;MOTION.playerAttacks.push({family,start:animNow(),dur,baseDur:base,hold,fromX:s.player.x,fromY:s.player.y,toX:target?.x??s.player.x,toY:target?.y??s.player.y,facing:s.player.facing||'up',backstab:!!opts.backstab,riposte:!!opts.riposte,miss:!!opts.miss});if(!opts.miss){const amp=family==='hammer'?3.6:family==='axe'?2.8:family==='sword'?1.65:family==='spear'?1.15:.85;cameraPunch(amp,family==='hammer'?190:family==='axe'?155:120,impact)}requestMotionDraw()}
function beginPlayerHit(fromX=null,fromY=null){const dur=motionDuration(150);if(!dur)return;MOTION.playerHit={start:animNow(),dur,fromX:fromX??s.player.x,fromY:fromY??s.player.y};requestMotionDraw()}
function beginEnemyHit(e,fromX=null,fromY=null){if(!e)return;const dur=motionDuration(145);if(!dur)return;MOTION.enemyHits.set(e.id,{start:animNow(),dur,fromX:fromX??s.player.x,fromY:fromY??s.player.y});requestMotionDraw()}
function beginDeath(e){if(!e)return;const dur=motionDuration(e.boss?420:300);if(!dur)return;MOTION.deaths.push({start:animNow(),dur,x:e.x,y:e.y,family:e.family,boss:!!e.boss,dangerElite:!!e.dangerElite,facing:e.facing||'down'});cameraPunch(e.boss?5.0:1.25,e.boss?320:105,40);if(e.boss)cameraZoom(.055,720,20);requestMotionDraw()}
function burst(type,x,y,extra={}){const durations={guard:300,riposte:330,backstab:300,stun:420,push:260,resist:330,quake:480,parry:300,heal:420,chest:520,pickup:430,trap:460,door:650,secret:700,mechanism:650,alert:520,suspicious:480,bossIntro:900,phase2:950,stairs:520,rune:480,threshold:560,thresholdDeep:760,thresholdDoor:700};const dur=motionDuration(durations[type]||300);if(!dur)return;MOTION.bursts.push({type,x,y,start:animNow(),dur,...extra});if(type==='quake')cameraPunch(4.2,300,70);else if(type==='bossIntro'){cameraZoom(.045,820,0);cameraPunch(1.8,220,110)}else if(type==='phase2'){cameraZoom(.065,900,0);cameraPunch(4.5,380,90)}else if(type==='door'||type==='secret')cameraPunch(1.25,140,80);else if(type==='threshold')cameraPunch(.7,120,80);else if(type==='thresholdDeep'){cameraZoom(.02,220,0);cameraPunch(1.15,180,75)}else if(type==='thresholdDoor')cameraPunch(.9,150,75);requestMotionDraw()}
function moveState(move,now=animNow()){if(!animLive(move,now))return null;const t=clamp01((now-move.start)/move.dur),q=easeInOut(t);return{x:move.fromX+(move.toX-move.fromX)*q,y:move.fromY+(move.toY-move.fromY)*q,t,frame:t<.5?0:1,bob:Math.sin(t*Math.PI*2)*1.2}}
function playerVisualState(now=animNow()){
 let x=s.player.x,y=s.player.y,walking=false,frame=0,bob=0,rot=0,scale=1,hitX=0,hitY=0;
 const mv=moveState(MOTION.playerMove,now);if(mv){x=mv.x;y=mv.y;walking=true;frame=mv.frame;bob=mv.bob}
 else if(!prefersReducedMotion()){bob=Math.sin(now/430)*.45;scale=1+Math.sin(now/520)*.008}
 const hit=MOTION.playerHit;if(animLive(hit,now)){const t=(now-hit.start)/hit.dur,amp=Math.sin(t*Math.PI)*3.4,dx=Math.sign(s.player.x-hit.fromX),dy=Math.sign(s.player.y-hit.fromY);hitX=dx*amp+Math.sin(t*Math.PI*8)*1.4;hitY=dy*amp}
 const atk=[...MOTION.playerAttacks].reverse().find(a=>animLive(a,now));if(atk){const t=attackProgress(atk,now),l=Math.sin(Math.min(1,t)*Math.PI);const d=DIR[atk.facing]||DIR.up;x+=d.x*l*.11;y+=d.y*l*.11;if(atk.family==='axe')rot=(t-.5)*.22;else if(atk.family==='hammer')rot=(t-.5)*.13;scale*=1+l*.025}
 return{x,y,walking,frame,bob,rot,scale,hitX,hitY,attack:atk}
}
function enemyVisualState(e,now=animNow()){
 let x=e.x,y=e.y,walking=false,frame=0,bob=0,rot=0,scale=1,hitX=0,hitY=0;
 const mv=moveState(MOTION.enemyMoves.get(e.id),now);if(mv){x=mv.x;y=mv.y;walking=true;frame=mv.frame;bob=mv.bob}
 else if(!prefersReducedMotion()){const seed=(e.id||1)*.73;bob=Math.sin(now/510+seed)*.34;scale=1+Math.sin(now/640+seed)*.006}
 const atk=MOTION.enemyAttacks.get(e.id);if(animLive(atk,now)){const t=(now-atk.start)/atk.dur,l=Math.sin(t*Math.PI),dx=Math.sign(atk.targetX-atk.fromX),dy=Math.sign(atk.targetY-atk.fromY);x+=dx*l*.10;y+=dy*l*.10;scale*=1+l*.025}
 const hit=MOTION.enemyHits.get(e.id);if(animLive(hit,now)){const t=(now-hit.start)/hit.dur,amp=Math.sin(t*Math.PI)*3.0,dx=Math.sign(e.x-hit.fromX),dy=Math.sign(e.y-hit.fromY);hitX=dx*amp+Math.sin(t*Math.PI*7)*1.1;hitY=dy*amp;rot=Math.sin(t*Math.PI*6)*.035}
 return{x,y,walking,frame,bob,rot,scale,hitX,hitY,attack:atk}
}
function lpFloat(x,y,c){return{x:(x-c.sx)*CELL,y:(y-c.sy)*CELL}}
function drawWalkFeet(x,y,size,facing,frame,color='#9fd6ff',alpha=.9){
 if(!frame&&frame!==0)return;ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=color;const cx=x+size/2,cy=y+size*.77,step=frame?2.6:-2.6,w=Math.max(3,size*.10),h=Math.max(2,size*.055);
 if(facing==='left'||facing==='right'){ctx.beginPath();ctx.ellipse(cx+(facing==='right'?5:-5),cy-3+step,w,h,0,0,Math.PI*2);ctx.ellipse(cx+(facing==='right'?-1:1),cy+3-step,w,h,0,0,Math.PI*2);ctx.fill()}
 else{ctx.beginPath();ctx.ellipse(cx-4,cy+step,w,h,0,0,Math.PI*2);ctx.ellipse(cx+4,cy-step,w,h,0,0,Math.PI*2);ctx.fill()}
 ctx.restore()
}
function familyAngle(dir){return dir==='right'?0:dir==='down'?Math.PI/2:dir==='left'?Math.PI: -Math.PI/2}
function drawPlayerAttackEffects(c,now=animNow()){
 for(const a of MOTION.playerAttacks){if(!animLive(a,now))continue;const t=attackProgress(a,now),q=easeOutCubic(t),o=lpFloat(a.fromX,a.fromY,c),tc=lpFloat(a.toX,a.toY,c),cx=o.x+CELL/2,cy=o.y+CELL/2,tx=tc.x+CELL/2,ty=tc.y+CELL/2,col=FC[a.family]||'#ffffff',ang=familyAngle(a.facing);ctx.save();ctx.globalAlpha=Math.max(0,1-t*.88);ctx.lineCap='round';ctx.lineJoin='round';
  if(a.family==='axe'){const start=ang-Math.PI*.78,end=start+Math.PI*1.56*q;ctx.strokeStyle=col;ctx.lineWidth=Math.max(5,CELL*.14);ctx.shadowColor=col;ctx.shadowBlur=10;ctx.beginPath();ctx.arc(cx,cy,CELL*.68,start,end);ctx.stroke();ctx.lineWidth=2;ctx.globalAlpha*=.55;ctx.beginPath();ctx.arc(cx,cy,CELL*.84,start,end);ctx.stroke()}
  else if(a.family==='spear'){const ex=cx+(tx-cx)*q,ey=cy+(ty-cy)*q;ctx.strokeStyle=col;ctx.lineWidth=Math.max(3,CELL*.08);ctx.shadowColor=col;ctx.shadowBlur=8;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(ex,ey);ctx.stroke();ctx.fillStyle='#f4fbff';ctx.beginPath();ctx.arc(ex,ey,Math.max(2,CELL*.06),0,Math.PI*2);ctx.fill()}
  else if(a.family==='sword'){ctx.strokeStyle=col;ctx.lineWidth=Math.max(4,CELL*.10);ctx.shadowColor=col;ctx.shadowBlur=8;const start=ang-Math.PI*.58,end=start+Math.PI*1.06*q;ctx.beginPath();ctx.arc(cx,cy,CELL*.58,start,end);ctx.stroke()}
  else if(a.family==='dagger'){const dx=tx-cx,dy=ty-cy,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,ex=cx+dx*q,ey=cy+dy*q;ctx.strokeStyle=a.backstab?'#8ed39a':col;ctx.lineWidth=Math.max(2,CELL*.055);ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=7;for(const off of [-3,3]){ctx.beginPath();ctx.moveTo(cx+nx*off,cy+ny*off);ctx.lineTo(ex+nx*off,ey+ny*off);ctx.stroke()}}
  else if(a.family==='hammer'){const impact=Math.max(0,(t-.38)/.62),rr=CELL*(.12+.45*easeOutCubic(impact));ctx.strokeStyle=col;ctx.lineWidth=Math.max(4,CELL*.11);ctx.shadowColor=col;ctx.shadowBlur=9;ctx.beginPath();ctx.arc(tx,ty,rr,-Math.PI*.9,-Math.PI*.1);ctx.stroke();if(impact>0){ctx.globalAlpha=Math.max(0,1-impact);ctx.beginPath();ctx.arc(tx,ty,CELL*.52*impact,0,Math.PI*2);ctx.stroke()}}
  else{ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+(tx-cx)*q,cy+(ty-cy)*q);ctx.stroke()}
  if(a.riposte&&t>.45){ctx.strokeStyle='#f4d36f';ctx.lineWidth=2;ctx.beginPath();ctx.arc(tx,ty,CELL*.34*(1-t+.2),0,Math.PI*2);ctx.stroke()}
  if(a.miss&&t>.65){ctx.fillStyle='#c5cbd3';ctx.font=`900 ${Math.max(10,CELL*.25)}px sans-serif`;ctx.fillText('×',tx,ty)}
  ctx.restore()
 }
}
function drawBursts(c,now=animNow()){
 for(const b of MOTION.bursts){if(!animLive(b,now)||!inc(Math.round(b.x),Math.round(b.y),c))continue;const t=clamp01((now-b.start)/b.dur),q=easeOutCubic(t),p=lpFloat(b.x,b.y,c),cx=p.x+CELL/2,cy=p.y+CELL/2;ctx.save();ctx.globalAlpha=Math.max(0,1-t);ctx.lineCap='round';
  if(b.type==='guard'){ctx.strokeStyle='#82c8e8';ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,CELL*(.30+.24*q),0,Math.PI*2);ctx.stroke();ctx.globalAlpha*=.5;ctx.beginPath();ctx.arc(cx,cy,CELL*(.18+.17*q),0,Math.PI*2);ctx.stroke()}
  else if(b.type==='riposte'){ctx.strokeStyle='#f4d36f';ctx.lineWidth=3;for(const a of [0,Math.PI/2]){ctx.beginPath();ctx.moveTo(cx-Math.cos(a)*CELL*.3*q,cy-Math.sin(a)*CELL*.3*q);ctx.lineTo(cx+Math.cos(a)*CELL*.3*q,cy+Math.sin(a)*CELL*.3*q);ctx.stroke()}}
  else if(b.type==='backstab'){ctx.strokeStyle='#8ed39a';ctx.lineWidth=3;for(const a of [-.65,.65]){ctx.beginPath();ctx.moveTo(cx-CELL*.22,cy+Math.sin(a)*4);ctx.lineTo(cx+CELL*.22*q,cy-Math.sin(a)*8);ctx.stroke()}}
  else if(b.type==='stun'){ctx.fillStyle='#d9b3ff';ctx.font=`900 ${Math.max(10,CELL*.22)}px sans-serif`;for(let i=0;i<3;i++){const a=t*6+i*Math.PI*2/3,rr=CELL*.28;ctx.fillText('✦',cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}}
  else if(b.type==='push'){const dx=b.dx||0,dy=b.dy||0;ctx.strokeStyle='#e3c2ff';ctx.lineWidth=3;for(const off of [-5,0,5]){ctx.beginPath();ctx.moveTo(cx-dx*CELL*.34+dy*off,cy-dy*CELL*.34-dx*off);ctx.lineTo(cx+dx*CELL*.22*q+dy*off,cy+dy*CELL*.22*q-dx*off);ctx.stroke()}}
  else if(b.type==='resist'||b.type==='parry'){ctx.strokeStyle=b.type==='parry'?'#ffd166':'#f2d889';ctx.lineWidth=4;ctx.beginPath();ctx.arc(cx,cy,CELL*(.25+.20*q),Math.PI*1.1,Math.PI*1.9);ctx.stroke()}
  else if(b.type==='quake'){ctx.strokeStyle='#ff755f';ctx.lineWidth=3;for(const m of [.35,.62,.9]){ctx.globalAlpha=Math.max(0,(1-t)*(1.1-m*.4));ctx.beginPath();ctx.arc(cx,cy,CELL*m*q,0,Math.PI*2);ctx.stroke()}}
  else if(b.type==='heal'){ctx.fillStyle='#88e89a';ctx.strokeStyle='#bdf6c7';ctx.lineWidth=2;for(let i=0;i<5;i++){const a=i*Math.PI*2/5+.35,rr=CELL*(.10+.26*q),yy=cy-CELL*.34*q;ctx.beginPath();ctx.arc(cx+Math.cos(a)*rr,yy+Math.sin(a)*rr*.45,Math.max(1.5,CELL*.035),0,Math.PI*2);ctx.fill()}ctx.beginPath();ctx.arc(cx,cy,CELL*(.20+.15*q),0,Math.PI*2);ctx.stroke()}
  else if(b.type==='chest'){ctx.strokeStyle='#f2c96d';ctx.fillStyle='rgba(255,211,103,.28)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,CELL*(.18+.48*q),0,Math.PI*2);ctx.stroke();for(let i=0;i<6;i++){const a=i*Math.PI/3-.5,rr=CELL*.42*q;ctx.fillRect(cx+Math.cos(a)*rr-2,cy+Math.sin(a)*rr-2,4,4)}}
  else if(b.type==='pickup'){ctx.fillStyle=b.color||'#f4e3a2';for(let i=0;i<4;i++){const a=i*Math.PI/2+t*2,rr=CELL*(.10+.28*q);ctx.beginPath();ctx.arc(cx+Math.cos(a)*rr,cy-CELL*.20*q+Math.sin(a)*rr*.35,Math.max(1.4,CELL*.03),0,Math.PI*2);ctx.fill()}ctx.font=`900 ${Math.max(11,CELL*.25)}px sans-serif`;ctx.fillText(b.glyph||'✦',cx,cy-CELL*.28*q)}
  else if(b.type==='trap'){ctx.strokeStyle='#ff8d72';ctx.lineWidth=3;for(let i=-2;i<=2;i++){const xx=cx+i*CELL*.11;ctx.beginPath();ctx.moveTo(xx,cy+CELL*.24);ctx.lineTo(xx+(i%2?2:-2),cy-CELL*(.06+.35*q));ctx.stroke()}}
  else if(b.type==='door'){ctx.strokeStyle='#e5c47b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx-CELL*.28*(1-q),cy-CELL*.33);ctx.lineTo(cx-CELL*.28*(1-q),cy+CELL*.33);ctx.moveTo(cx+CELL*.28*(1-q),cy-CELL*.33);ctx.lineTo(cx+CELL*.28*(1-q),cy+CELL*.33);ctx.stroke();ctx.fillStyle='rgba(215,188,130,.7)';for(let i=0;i<5;i++){const a=i*1.7+b.x*.3,rr=CELL*.4*q;ctx.beginPath();ctx.arc(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,2.2*(1-t),0,Math.PI*2);ctx.fill()}}
  else if(b.type==='secret'){ctx.fillStyle='#b6aa91';for(let i=0;i<9;i++){const a=(i*2.17)+(b.x+b.y)*.2,rr=CELL*(.08+.48*q);const sz=Math.max(1,4*(1-t));ctx.fillRect(cx+Math.cos(a)*rr-sz/2,cy+Math.sin(a)*rr+CELL*.1*q-sz/2,sz,sz)}}
  else if(b.type==='mechanism'){ctx.strokeStyle='#e8c878';ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,CELL*.25,0,Math.PI*2);ctx.stroke();for(let i=0;i<6;i++){const a=t*8+i*Math.PI/3;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*CELL*.24,cy+Math.sin(a)*CELL*.24);ctx.lineTo(cx+Math.cos(a)*CELL*.38,cy+Math.sin(a)*CELL*.38);ctx.stroke()}if(Number.isFinite(b.toX)){const p2=lpFloat(b.toX,b.toY,c);ctx.globalAlpha*=.7;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(p2.x+CELL/2,p2.y+CELL/2);ctx.stroke();ctx.setLineDash([])}}
  else if(b.type==='alert'||b.type==='suspicious'){ctx.fillStyle=b.type==='alert'?'#ff6b6b':'#ffd166';ctx.font=`900 ${Math.max(16,CELL*.42)}px sans-serif`;ctx.fillText(b.type==='alert'?'!':'?',cx,cy-CELL*(.18+.30*q))}
  else if(b.type==='bossIntro'||b.type==='phase2'){const col=b.type==='phase2'?'#d78cff':'#f3c969';ctx.strokeStyle=col;ctx.lineWidth=4;for(const m of [.28,.55,.9]){ctx.globalAlpha=Math.max(0,(1-t)*(1.05-m*.35));ctx.beginPath();ctx.arc(cx,cy,CELL*m*q,0,Math.PI*2);ctx.stroke()}ctx.fillStyle=col;for(let i=0;i<7;i++){const a=i*Math.PI*2/7+t,rr=CELL*.55*q;ctx.beginPath();ctx.arc(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,2.4*(1-t),0,Math.PI*2);ctx.fill()}}
  else if(b.type==='stairs'){ctx.strokeStyle='#e6cf73';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(cx,cy,CELL*(.18+.42*q),0,Math.PI*2);ctx.stroke()}
  else if(b.type==='threshold'||b.type==='thresholdDeep'||b.type==='thresholdDoor'){const col=b.color||(b.type==='thresholdDeep'?'#a985f0':b.type==='thresholdDoor'?'#dfbf78':'#c97b7b');ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=b.type==='thresholdDeep'?3.5:2.5;ctx.beginPath();ctx.moveTo(cx,cy-CELL*(.10+.24*q));ctx.lineTo(cx+CELL*(.10+.24*q),cy);ctx.lineTo(cx,cy+CELL*(.10+.24*q));ctx.lineTo(cx-CELL*(.10+.24*q),cy);ctx.closePath();ctx.stroke();ctx.globalAlpha*=.75;ctx.beginPath();ctx.arc(cx,cy,CELL*(.16+.34*q),0,Math.PI*2);ctx.stroke();if(b.type==='thresholdDeep'){for(let i=0;i<4;i++){const a=i*Math.PI/2+t*4,rr=CELL*.36*q;ctx.beginPath();ctx.arc(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,Math.max(1.7,CELL*.034),0,Math.PI*2);ctx.fill()}}else if(b.type==='thresholdDoor'){ctx.beginPath();ctx.moveTo(cx,cy-CELL*.34*q);ctx.lineTo(cx,cy+CELL*.34*q);ctx.stroke();ctx.beginPath();ctx.arc(cx,cy,CELL*(.10+.18*q),-Math.PI/2,Math.PI/2);ctx.stroke()}else{for(const a of [0,Math.PI/2]){ctx.beginPath();ctx.moveTo(cx-Math.cos(a)*CELL*.34*q,cy-Math.sin(a)*CELL*.34*q);ctx.lineTo(cx+Math.cos(a)*CELL*.34*q,cy+Math.sin(a)*CELL*.34*q);ctx.stroke()}}ctx.globalAlpha=Math.max(.35,1-t);ctx.font=`900 ${Math.max(12,CELL*.30)}px serif`;ctx.fillText(b.glyph||'◈',cx,cy+1)}
  else if(b.type==='rune'){ctx.strokeStyle=b.color||'#d7b96b';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(cx,cy,CELL*(.14+.28*q),0,Math.PI*2);ctx.stroke();ctx.fillStyle=b.color||'#d7b96b';ctx.font=`900 ${Math.max(12,CELL*.30)}px serif`;ctx.fillText(b.glyph||'◇',cx,cy)}
  ctx.restore()
 }
}
function drawDeaths(c,now=animNow()){
 for(const d of MOTION.deaths){if(!animLive(d,now)||!inc(d.x,d.y,c))continue;const t=clamp01((now-d.start)/d.dur),q=easeOutCubic(t),p=lpFloat(d.x,d.y,c),cx=p.x+CELL/2,cy=p.y+CELL/2,scale=1-.38*q,alpha=1-t;ctx.save();ctx.globalAlpha=alpha;ctx.translate(cx,cy+q*CELL*.16);ctx.rotate((d.facing==='left'?-1:1)*q*.38);ctx.scale(scale,scale);const size=CELL*(d.boss?1.08:1);if(!drawIcon(enemyFamilyIconKey(d.family),-size/2,-size/2,size,1)){ctx.fillStyle=FC[d.family]||'#ddd';ctx.beginPath();ctx.arc(0,0,CELL*.27,0,Math.PI*2);ctx.fill()}ctx.restore();ctx.save();ctx.globalAlpha=alpha*.8;ctx.fillStyle=d.boss?'#f3c969':'#c8d0d8';for(let i=0;i<4;i++){const a=i*Math.PI/2+(d.x+d.y)*.3,rr=CELL*.12+CELL*.34*q;ctx.beginPath();ctx.arc(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,Math.max(1.5,CELL*.035)*(1-t),0,Math.PI*2);ctx.fill()}ctx.restore()}
}
// -------------------------------------------------------------------------
const DIR={up:{x:0,y:-1},right:{x:1,y:0},down:{x:0,y:1},left:{x:-1,y:0}};
const F={spear:{name:'Lancia',symbol:'L',beats:['sword','dagger']},sword:{name:'Spada',symbol:'S',beats:['dagger','axe']},dagger:{name:'Pugnale',symbol:'P',beats:['axe','hammer']},axe:{name:'Ascia',symbol:'A',beats:['hammer','spear']},hammer:{name:'Martello',symbol:'M',beats:['spear','sword']}};
const LOSES={spear:['axe','hammer'],sword:['spear','hammer'],dagger:['spear','sword'],axe:['sword','dagger'],hammer:['dagger','axe']},FC={sword:'#83a9e8',spear:'#77c7e8',dagger:'#8ed39a',axe:'#e3a15d',hammer:'#bd91df'};
const RUNE_MAP={A:'ᚨ',B:'ᛒ',C:'ᚲ',D:'ᛞ',E:'ᛖ',F:'ᚠ',G:'ᚷ',H:'ᚺ',I:'ᛁ',L:'ᛚ',M:'ᛗ',N:'ᚾ',O:'ᛟ',P:'ᛈ',R:'ᚱ',S:'ᛋ',T:'ᛏ',U:'ᚢ',V:'ᚡ'};
function runeEncode(t){return [...t.toUpperCase()].map(ch=>RUNE_MAP[ch]||ch).join('')}
function runeLegend(){return Object.entries(RUNE_MAP).map(([k,v])=>v+' = '+k).join('   ')}
const W={unarmed:{name:'Mani nude',family:'unarmed',min:1,max:2,uses:Infinity},rustySword:{name:'Spada arrugginita',family:'sword',min:5,max:6,uses:2},shortSword:{name:'Spada corta',family:'sword',min:6,max:7,uses:3},longSword:{name:'Spada lunga',family:'sword',min:7,max:8,uses:4},duelistSword:{name:'Spada del duellante',family:'sword',min:7,max:9,uses:5},crudeSpear:{name:'Lancia improvvisata',family:'spear',min:4,max:5,uses:2},spear:{name:'Lancia da guerra',family:'spear',min:5,max:6,uses:3},halberd:{name:'Alabarda',family:'spear',min:6,max:8,uses:4},hunterSpear:{name:'Lancia del cacciatore',family:'spear',min:7,max:8,uses:5},knife:{name:'Coltello',family:'dagger',min:2,max:3,crit:.20,uses:2},dagger:{name:'Pugnale',family:'dagger',min:3,max:4,crit:.25,uses:3},kukri:{name:'Kukri',family:'dagger',min:4,max:5,crit:.30,uses:4},assassin:{name:'Pugnale assassino',family:'dagger',min:4,max:6,crit:.35,uses:5},hatchet:{name:'Accetta',family:'axe',min:6,max:8,miss:.10,uses:2},axe:{name:'Ascia da guerra',family:'axe',min:7,max:10,miss:.13,uses:3},battleAxe:{name:'Bipenne',family:'axe',min:8,max:11,miss:.16,uses:4},executioner:{name:'Ascia del boia',family:'axe',min:9,max:12,miss:.18,uses:5},club:{name:'Mazza',family:'hammer',min:4,max:5,uses:1},hammer:{name:'Martello',family:'hammer',min:4,max:6,uses:2},warhammer:{name:'Martello da guerra',family:'hammer',min:5,max:7,uses:3},jailer:{name:'Martello del carceriere',family:'hammer',min:5,max:7,uses:4}};
const POOLS={sword:['rustySword','shortSword','longSword','duelistSword'],spear:['crudeSpear','spear','halberd','hunterSpear'],dagger:['knife','dagger','kukri','assassin'],axe:['hatchet','axe','battleAxe','executioner'],hammer:['club','hammer','warhammer','jailer']},HEALS={small:{name:'Pozione',heal:10},large:{name:'Pozione grande',heal:20}};

const ARTIFACT_MAX=3;
const ARTIFACTS={
 stone:{icon:'⬢',name:'Pelle di Pietra',desc:'Il prossimo colpo subito infligge solo il 25% del danno.'},
 silence:{icon:'🔔',name:'Campana del Silenzio',desc:'Riduce immediatamente l’Allarme di 20.'},
 eye:{icon:'👁',name:'Occhio della Soglia',desc:'Rivela il territorio vicino, trappole e muri segreti entro 10 caselle.'},
 returnSeal:{icon:'⌂',name:'Sigillo del Ritorno',desc:'Ti riporta all’ingresso del piano corrente.'},
 blood:{icon:'🩸',name:'Sangue Nero',desc:'+30% danni per 6 turni, ma genera +10 Allarme.'},
 heart:{icon:'✦',name:'Cuore della Soglia',desc:'+25% danni e nessuna perdita di durabilità per 8 turni.'}
};
const ARTIFACT_POOL=['stone','silence','eye','returnSeal','blood','stone','silence','eye','blood','heart'];
const TIERS={green:{hp:[8,13],dmg:[2,4],vision:4,color:'#5d9b62'},blue:{hp:[15,23],dmg:[4,7],vision:5,color:'#5d7ea6'},yellow:{hp:[25,36],dmg:[6,10],vision:6,color:'#c7aa4d'},red:{hp:[40,55],dmg:[9,14],vision:7,color:'#a94f4f'},purple:{hp:[70,85],dmg:[12,17],vision:8,color:'#815c9c'}};
const ENEMY_ROLES={patrol:{name:'Pattuglia',icon:'P',desc:'Comportamento standard.'},sentry:{name:'Sentinella',icon:'S',desc:'Presidia la posizione e ruota lo sguardo.'},hunter:{name:'Cacciatore',icon:'C',desc:'Insegue più a lungo e accelera a turni alterni.'},flanker:{name:'Fiancheggiatore',icon:'F',desc:'Cerca una casella laterale rispetto a te.'},caller:{name:'Vedetta',icon:'V',desc:'Alla prima scoperta alza l’Allarme e allerta i vicini.'},boss:{name:'Boss',icon:'★',desc:'Comportamento unico.'}};
const FLOOR_RULES={
 1:{name:'Avanscoperta',icon:'🧭',desc:'Segrete del castello: i primi 10 passi non generano Instabilità.'},
 2:{name:'Pattuglie attive',icon:'👣',desc:'Prigioni della guarnigione: i nemici in pattuglia si muovono più spesso.'},
 3:{name:'Fortezza del Custode',icon:'🏰',desc:'Tempio abbandonato: finché il Custode è vivo, ogni combattimento genera +1 Allarme.'},
 4:{name:'Frattura instabile',icon:'⚡',desc:'Chiostro spezzato: ogni sesto passo genera +1 Instabilità aggiuntiva. Un Varco Centrale sigillato separa il piano in due.'},
 5:{name:'La Caccia',icon:'👁️',desc:'Catacombe della Soglia: tutti i nemici normali hanno +1 casella di visione. Le scale sono oltre un Varco Centrale che richiede l’enigma del piano.'}
};
const ROLE_WEIGHTS={
 1:[['patrol',65],['sentry',35]],
 2:[['patrol',40],['sentry',20],['hunter',25],['caller',15]],
 3:[['patrol',25],['sentry',30],['hunter',25],['flanker',20]],
 4:[['patrol',15],['sentry',20],['hunter',25],['flanker',25],['caller',15]],
 5:[['patrol',10],['sentry',15],['hunter',25],['flanker',30],['caller',20]]
};
function roleForFloor(floor){const table=ROLE_WEIGHTS[floor]||ROLE_WEIGHTS[1];let r=Math.random()*100,n=0;for(const [id,w] of table){n+=w;if(r<=n)return id}return table[0][0]}
function floorRule(floor=s?.floor||1){return FLOOR_RULES[floor]||FLOOR_RULES[1]}

const CARDS=[
{id:'light',icon:'🥾',cat:'explore',name:'Passo leggero',cost:180,text:'Ogni 6 passi ignora 1 Instabilità.'},
{id:'sense',icon:'👁️',cat:'explore',name:'Sesto senso',cost:210,text:'Rivela le trappole vicine.'},
{id:'silent',icon:'🤫',cat:'explore',name:'Silenzioso',cost:240,text:'Combattere genera meno Allarme.'},
{id:'packrat',icon:'🎒',cat:'explore',name:'Zaino capiente',cost:260,text:'+2 slot inventario.'},
{id:'cartographer',icon:'🗺️',cat:'explore',name:'Cartografo',cost:520,text:'Rivela una stanza per piano.'},
{id:'farsight',icon:'🔭',cat:'explore',name:'Occhio lungo',cost:440,text:'+1 casella alla tua visuale.'},
{id:'pathfinder',icon:'🧭',cat:'explore',name:'Bussola spezzata',cost:500,text:'Le scale vengono segnate sulla mappa all’inizio di ogni piano.'},
{id:'trapwise',icon:'⚠️',cat:'explore',name:'Passo cauto',cost:420,text:'Le trappole infliggono il 40% di danni in meno.'},
{id:'spearMaster',icon:'🔱',cat:'weapon',name:'Maestro d’asta',cost:270,text:'+15% Lance. Affondo in linea: 50% danni al nemico subito dietro.'},
{id:'swordMaster',icon:'🗡️',cat:'weapon',name:'Maestro di spada',cost:270,text:'+15% Spade. Una Guardia riuscita prepara Riposta: +25% al prossimo colpo di Spada.'},
{id:'daggerMaster',icon:'🔪',cat:'weapon',name:'Maestro pugnali',cost:270,text:'+15% Pugnali. I Backstab non generano rumore né Allarme.'},
{id:'axeMaster',icon:'🪓',cat:'weapon',name:'Maestro d’ascia',cost:270,text:'+15% Asce. Più KO nello stesso fendente consumano solo 1 durata.'},
{id:'hammerMaster',icon:'🔨',cat:'weapon',name:'Maestro martello',cost:270,text:'+15% Martelli. Una spinta riuscita attiva Guardia.'},
{id:'armorer',icon:'🛠️',cat:'weapon',name:'Armaiolo',cost:400,text:'+1 KO per arma raccolta.'},
{id:'careful',icon:'👐',cat:'weapon',name:'Mano leggera',cost:460,text:'30% di non consumare l’arma su un KO.'},
{id:'piercer',icon:'🔱',cat:'weapon',name:'Punta temprata',cost:580,text:'+20% danni con la Lancia quando colpisci da 2 caselle.'},
{id:'sureGrip',icon:'🪓',cat:'weapon',name:'Presa sicura',cost:550,text:'Le Asce riducono di 7 punti percentuali la probabilità di mancare.'},
{id:'lastEdge',icon:'⚔️',cat:'weapon',name:'Ultimo filo',cost:650,text:'+20% danni quando l’arma equipaggiata ha 1 sola durata rimasta.'},
{id:'medic',icon:'🌿',cat:'combat',name:'Erborista',cost:300,text:'+25% cure.'},
{id:'predator',icon:'🩸',cat:'combat',name:'Predatore',cost:440,text:'+1 HP per KO.'},
{id:'bloodlust',icon:'🔥',cat:'combat',name:'Furia',cost:620,text:'+15% con Allarme ≥50.'},
{id:'duelist',icon:'⚔️',cat:'combat',name:'Duellante',cost:900,text:'Svantaggio ×0,85.'},
{id:'survivor',icon:'🛡️',cat:'combat',name:'Ultima resistenza',cost:1260,text:'Una volta resti a 1 HP.'},
{id:'bulwark',icon:'🛡️',cat:'combat',name:'Bastione',cost:700,text:'Guardia riduce il prossimo colpo al 40% invece che alla metà.'},
{id:'adrenaline',icon:'❤️',cat:'combat',name:'Adrenalina',cost:650,text:'+15% danni quando sei al 50% HP o meno.'},
{id:'opening',icon:'⚡',cat:'combat',name:'Primo sangue',cost:480,text:'+20% danni sul primo colpo contro un nemico a vita piena.'},
{id:'scavenger',icon:'📦',cat:'wealth',name:'Saccheggiatore',cost:480,text:'35%: arma extra dai forzieri.'},
{id:'merchant',icon:'💰',cat:'wealth',name:'Occhio per l’oro',cost:380,text:'+20% oro raccolto.'},
{id:'treasure',icon:'🧰',cat:'wealth',name:'Cacciatore tesori',cost:560,text:'+15 oro dai forzieri.'},
{id:'insurance',icon:'🏕️',cat:'wealth',name:'Assicurazione',cost:960,text:'Se muori, il 15% dell’oro della run torna comunque all’Accampamento.'},
{id:'treasureMap',icon:'🗺️',cat:'wealth',name:'Mappa del bottino',cost:750,text:'+1 forziere generato in ogni piano.'},
{id:'quartermaster',icon:'🧪',cat:'wealth',name:'Quartiermastro',cost:750,text:'+1 pozione generata in ogni piano.'},
{id:'bounty',icon:'👑',cat:'wealth',name:'Cacciatore di taglie',cost:1020,text:'Miniboss, boss ed Élite della Porta danno più oro.'}
];
const CARD_RANK={
 light:1,sense:1,silent:1,packrat:1,
 spearMaster:1,swordMaster:1,daggerMaster:1,axeMaster:1,hammerMaster:1,
 medic:1,merchant:1,

 cartographer:2,farsight:2,pathfinder:2,trapwise:2,
 armorer:2,careful:2,predator:2,opening:2,scavenger:2,treasure:2,

 piercer:3,sureGrip:3,lastEdge:3,bloodlust:3,bulwark:3,adrenaline:3,
 treasureMap:3,quartermaster:3,

 duelist:4,survivor:4,insurance:4,bounty:4
};
// v17.4 Economy Pass: prezzi scalati per rango per evitare che un singolo clear profondo svuoti quasi tutto il negozio.
const EXTRACTION_RATES={1:.50,2:.70,3:1.00,4:1.20,5:1.50};
const DEPTH_FIRST_REWARDS={2:50,3:75,4:100,5:150};
const ROMAN_RANK={1:'I',2:'II',3:'III',4:'IV'};
function cardRank(id){return CARD_RANK[id]||1}
function shopRankForDepth(depth=meta.bestFloor||0){return depth>=4?4:depth>=3?3:depth>=2?2:1}
function rankRequirement(rank){return rank<=1?'Disponibile subito':'Raggiungi il Piano '+rank}
function extractionRate(floor){return EXTRACTION_RATES[Math.max(1,Math.min(MAX_FLOOR,floor||1))]||1}
function extractionValue(coins,floor){return Math.max(0,Math.floor((coins||0)*extractionRate(floor)))}
function extractionPercent(floor){return Math.round(extractionRate(floor)*100)}
function depthFirstReward(runFloor){
  let total=0,from=Math.max(2,(Number.isFinite(meta.depthRewarded)?meta.depthRewarded:1)+1);
  for(let f=from;f<=Math.min(MAX_FLOOR,runFloor);f++){
    const reward=DEPTH_FIRST_REWARDS[f]||0;
    if(reward){total+=reward;meta.depthRewarded=f}
  }
  return total
}
const REWARDS=[{id:'power',icon:'⚔️',name:'Furia affilata',text:'+12% danni.'},{id:'shadow',icon:'🌑',name:'Predatore d’ombra',text:'Backstab ×2,4.'},{id:'quietRun',icon:'🤫',name:'Passi nel silenzio',text:'-1 Allarme dai combattimenti.'},{id:'vital',icon:'❤️',name:'Vigore',text:'+6 HP massimi.'},{id:'greedRun',icon:'🪙',name:'Febbre dell’oro',text:'+25% oro raccolto.'},{id:'execution',icon:'☠️',name:'Esecuzione',text:'+25% danni sotto 35% HP.'},{id:'healerRun',icon:'🧪',name:'Distillazione',text:'+35% cure.'},{id:'durableRun',icon:'🛠️',name:'Armi temprate',text:'25% KO senza consumo.'}];
const MISSIONS=[{id:'backs',icon:'🔪',name:'Colpo nell’ombra',desc:'Esegui 2 Backstab validi.',target:2,reward:55,get:s=>s.stats.backstabs},{id:'kills',icon:'☠️',name:'Sterminatore',desc:'Sconfiggi 6 nemici.',target:6,reward:40,get:s=>s.kills},{id:'chests',icon:'🧰',name:'Saccheggiatore',desc:'Apri 2 forzieri.',target:2,reward:35,get:s=>s.stats.chests},{id:'gold',icon:'🪙',name:'Avido',desc:'Raccogli 150 oro reale.',target:150,reward:50,get:s=>s.stats.goldCollected},{id:'floor3',icon:'⬇️',name:'In profondità',desc:'Raggiungi il piano 3.',target:3,reward:55,get:s=>s.floor},{id:'axe',icon:'🪓',name:'Macellaio',desc:'3 KO con Ascia.',target:3,reward:50,get:s=>s.stats.axeKills},{id:'stun',icon:'🔨',name:'Demolitore',desc:'2 STUN col Martello.',target:2,reward:45,get:s=>s.stats.hammerStuns},{id:'spear',icon:'🔱',name:'Tenere le distanze',desc:'3 KO con Lancia.',target:3,reward:45,get:s=>s.stats.spearKills},{id:'ghost',icon:'👻',name:'Fantasma',desc:'Raggiungi le scale senza allertare nessuno.',target:1,reward:65,get:s=>s.stats.stealthFloors}];
const EVENTS={
shrine:{icon:'✦',name:'Altare dimenticato',text:'L’altare pulsa debolmente.',choices:[
 {label:'❤️ Recupera 18 HP',apply:s=>healPlayer(18)},
 {label:'🔕 -18 Allarme',apply:s=>{s.alarm=Math.max(0,s.alarm-18)}}
]},
cache:{icon:'◆',name:'Deposito nascosto',text:'Una nicchia custodisce qualcosa di prezioso.',choices:[
 {label:'⚔️ Arma avanzata',apply:s=>grantAdvancedWeapon()},
 {label:'🧿 Artefatto raro',apply:s=>{const id=randomArtifactId();if(!grantArtifact(id,'deposito'))s.artifactDrops.push({x:s.player.x,y:s.player.y,id,seen:true})}},
 {label:'🪙 +45 oro',apply:s=>addGold(45,true)}
]},
cursed:{icon:'☠',name:'Forziere maledetto',text:'Qualcosa si muove all’interno.',choices:[
 {label:'🪙 +80 oro · +20 Allarme',apply:s=>{addGold(80,true);s.alarm=Math.min(100,s.alarm+20);threatEvents()}},
 {label:'🚪 Lascialo stare',apply:s=>{}}
]},
fountain:{icon:'◉',name:'Fonte instabile',text:'L’acqua cura, ma il dungeon reagisce.',choices:[
 {label:'❤️ Cura completa · +15 Instabilità',apply:s=>{healPlayer(0,true);s.instability=Math.min(100,s.instability+15);threatEvents()}},
 {label:'🧪 Cura 12 HP',apply:s=>healPlayer(12)}
]},
forge:{icon:'⚒',name:'Forgia spenta',text:'Le braci sono ancora abbastanza calde per lavorare un’arma.',choices:[
 {label:'🛠️ +2 KO all’arma equipaggiata',apply:s=>{const i=eqItem();if(i){i.uses+=2;log('⚒️ Arma riparata: +2 KO.')}else addGold(25,true)}},
 {label:'🪙 Recupera metallo · +35 oro',apply:s=>addGold(35,true)}
]},
oracle:{icon:'👁',name:'Occhio di pietra',text:'Per un istante percepisci la struttura dell’intero piano.',choices:[
 {label:'🗺️ Rivela la mappa · +12 Instabilità',apply:s=>{revealWholeFloor();s.instability=Math.min(100,s.instability+12);threatEvents()}},
 {label:'🌀 -12 Instabilità',apply:s=>{s.instability=Math.max(0,s.instability-12)}}
]},
bloodwell:{icon:'🩸',name:'Pozzo cremisi',text:'Qualcosa offre ricchezza in cambio di forza vitale.',choices:[
 {label:'🩸 -8 HP · +70 oro',apply:s=>{s.hp=Math.max(1,s.hp-8);addGold(70,true)}},
 {label:'🚪 Non toccarlo',apply:s=>{}}
]},
silence:{icon:'☾',name:'Camera del silenzio',text:'Il dungeon sembra trattenere il fiato.',choices:[
 {label:'🤫 -25 Allarme · +10 Instabilità',apply:s=>{s.alarm=Math.max(0,s.alarm-25);s.instability=Math.min(100,s.instability+10);threatEvents()}},
 {label:'❤️ Riposa · +10 HP',apply:s=>healPlayer(10)}
]},
monolith:{icon:'⬟',name:'Monolite del patto',text:'Una runa offre potere immediato, ma attira attenzioni.',choices:[
 {label:'🎴 Bonus casuale · +15 Allarme',apply:s=>{grantRandomRunBuff();if(s.floor<MAX_FLOOR)scheduleChain('monolith',MAX_FLOOR);s.alarm=Math.min(100,s.alarm+15);threatEvents()}},
 {label:'🪙 +30 oro',apply:s=>addGold(30,true)}
]},
hermit:{icon:'♟',name:'Eremita del sottosuolo',text:'Un vecchio esploratore conosce scorciatoie e nascondigli.',choices:[
 {label:'🧭 Rivela scale e stanze speciali',apply:s=>revealObjectives()},
 {label:'🧪 Pozione grande',apply:s=>grantHeal('large')}
]},
roots:{icon:'❧',name:'Radici luminose',text:'Una crescita impossibile attraversa la pietra.',choices:[
 {label:'❤️ +5 HP massimi e cura 5',apply:s=>{s.maxHp+=5;healPlayer(5)}},
 {label:'🔕 -10 Allarme e -6 Instabilità',apply:s=>{s.alarm=Math.max(0,s.alarm-10);s.instability=Math.max(0,s.instability-6)}}
]},
grave:{icon:'†',name:'Sepolcro del mercenario',text:'L’equipaggiamento è antico, ma ancora utilizzabile.',choices:[
 {label:'⚔️ Recupera un’arma',apply:s=>{grantAdvancedWeapon();if(s.floor<MAX_FLOOR)scheduleChain('grave',Math.min(MAX_FLOOR,s.floor+1))}},
 {label:'🧰 Recupera scorte · pozione + 20 oro',apply:s=>{grantHeal('small');addGold(20,true)}}
]},
echo:{icon:'◌',name:'Eco del piano precedente',text:'Un ricordo della run sembra materializzarsi davanti a te.',choices:[
 {label:'🛡️ Guardia immediata + 12 HP',apply:s=>{s.guard=true;healPlayer(12)}},
 {label:'🪙 Frantuma l’eco · +50 oro',apply:s=>addGold(50,true)}
]},
prisoner:{icon:'⛓',name:'Prigioniero ferito',text:'Un esploratore è incatenato dietro una grata spezzata.',choices:[
 {label:'🔓 Liberalo',apply:s=>{if(s.floor<MAX_FLOOR){scheduleChain('prisoner',Math.min(MAX_FLOOR,s.floor+2));log('⛓️ Il prigioniero promette di lasciarti delle scorte più in profondità.')}else{addGold(35,true);log('⛓️ Non c’è più tempo per ritrovarlo: ti lascia 35 oro.')}healPlayer(4)}},
 {label:'🪙 Prendi le sue scorte · +40 oro',apply:s=>addGold(40,true)}
]},
prisonerCache:{icon:'🎒',name:'Scorte dell’esploratore',text:'Il prigioniero ha mantenuto la promessa.',choices:[
 {label:'⚔️ Arma avanzata + pozione',apply:s=>{grantAdvancedWeapon();grantHeal('small')}},
 {label:'🪙 Prendi tutto · +85 oro',apply:s=>addGold(85,true)}
]},
monolithEcho:{icon:'⬟',name:'Eco del Monolite',text:'Il patto stretto in precedenza torna a reclamare la tua attenzione.',choices:[
 {label:'🌑 Accetta il potere · bonus casuale + 12 Allarme',apply:s=>{grantRandomRunBuff();s.alarm=Math.min(100,s.alarm+12);threatEvents()}},
 {label:'💥 Spezza il patto · +90 oro + 10 Instabilità',apply:s=>{addGold(90,true);s.instability=Math.min(100,s.instability+10);threatEvents()}}
]},
graveEcho:{icon:'†',name:'Spirito del mercenario',text:'Lo spirito del proprietario dell’arma ti raggiunge nel piano successivo.',choices:[
 {label:'🕯️ Onoralo · -20 Allarme',apply:s=>{s.alarm=Math.max(0,s.alarm-20)}},
 {label:'🪙 Ignoralo · +65 oro + 8 Allarme',apply:s=>{addGold(65,true);s.alarm=Math.min(100,s.alarm+8);threatEvents()}}
]}
};
const EVENT_VISUALS={
 shrine:{glyph:'✦',color:'#e2bd62',glow:'#f6d981',shape:'altar'},
 cache:{glyph:'◆',color:'#c79a57',glow:'#efc780',shape:'cache'},
 cursed:{glyph:'☠',color:'#a94d5b',glow:'#e06b79',shape:'chest'},
 fountain:{glyph:'≈',color:'#63b9c8',glow:'#93e0eb',shape:'fountain'},
 forge:{glyph:'⚒',color:'#cf7949',glow:'#f2a35e',shape:'forge'},
 oracle:{glyph:'◉',color:'#ad83d5',glow:'#d0a7f0',shape:'eye'},
 bloodwell:{glyph:'●',color:'#a93542',glow:'#e55c68',shape:'well'},
 silence:{glyph:'☾',color:'#7b8fc5',glow:'#b0c4f0',shape:'moon'},
 monolith:{glyph:'⬟',color:'#8d75bd',glow:'#c3a8f0',shape:'monolith'},
 hermit:{glyph:'♟',color:'#a58d6e',glow:'#d8c09d',shape:'person'},
 roots:{glyph:'❧',color:'#67a46e',glow:'#91d49b',shape:'roots'},
 grave:{glyph:'†',color:'#9d988d',glow:'#d4cec0',shape:'grave'},
 echo:{glyph:'◌',color:'#75a8c7',glow:'#a8d8ed',shape:'echo'},
 prisoner:{glyph:'⛓',color:'#8f9aa5',glow:'#c4d0db',shape:'cage'},
 prisonerCache:{glyph:'▣',color:'#b78d52',glow:'#e5bd7a',shape:'cache'},
 monolithEcho:{glyph:'⬟',color:'#9f68b6',glow:'#d692ee',shape:'monolith'},
 graveEcho:{glyph:'†',color:'#aa8d77',glow:'#dfbca0',shape:'grave'}
};
function familyGlyph(f){return f==='spear'?'🔱':f==='sword'?'🗡':f==='dagger'?'🔪':f==='axe'?'🪓':f==='hammer'?'🔨':'✊'}
function eventVisual(type){return EVENT_VISUALS[type]||{glyph:'✦',color:'#a47fbd',glow:'#d0abe6',shape:'altar'}}
const SPECIAL_ROOMS={
 armory:{name:'Armeria',icon:'⚔️',color:'#42566b',desc:'Più armi del normale.'},
 treasury:{name:'Tesoreria',icon:'🪙',color:'#6a5b2f',desc:'Oro e forzieri.'},
 infirmary:{name:'Infermeria',icon:'🧪',color:'#36595a',desc:'Pozioni e recupero.'},
 sanctuary:{name:'Santuario',icon:'✦',color:'#514a68',desc:'Riduce Allarme e Instabilità al primo ingresso.'},
 guardroom:{name:'Sala delle Guardie',icon:'🛡️',color:'#653f43',desc:'Più nemici, ma anche più bottino.'}
};

const DUNGEON_ARCHITECTURE={
 1:{id:'castle',icon:'🏰',name:'Segrete del Castello',desc:'Blocchi di celle, posti di guardia e depositi militari.'},
 2:{id:'castle',icon:'🏰',name:'Prigioni della Guarnigione',desc:'Le segrete diventano più operative: pattuglie, armi e stanze di servizio.'},
 3:{id:'temple',icon:'🏛️',name:'Tempio Abbandonato',desc:'Sale rituali, reliquiari e ambienti sacri crollati dal tempo.'},
 4:{id:'temple',icon:'🏛️',name:'Chiostro Spezzato',desc:'Un complesso sacro fratturato da un Varco Centrale e da antichi meccanismi.'},
 5:{id:'catacombs',icon:'⚰️',name:'Catacombe della Soglia',desc:'Cripte, camere sepolcrali e passaggi funerari custodiscono il cuore del dungeon.'}
};
const THEME_ROOM_VARIANTS={
 castle:{
   guardroom:['Corpo di Guardia','Posto di Sorveglianza'],
   armory:['Armeria della Guarnigione','Deposito d’Armi'],
   infirmary:['Infermeria delle Segrete','Dispensario del Carceriere'],
   treasury:['Camera del Tributo','Tesoro del Castellano'],
   sanctuary:['Cappella Dimenticata']
 },
 temple:{
   guardroom:['Sala dei Vigilanti','Anticamera dei Custodi'],
   armory:['Armeria Cerimoniale','Deposito dei Vessilli'],
   infirmary:['Vasca delle Abluzioni','Sala del Sollievo'],
   treasury:['Reliquiario','Tesoro del Sacrario'],
   sanctuary:['Santuario in Rovina','Cella dell’Oracolo']
 },
 catacombs:{
   guardroom:['Posto dei Custodi','Veglia dei Sepolti'],
   armory:['Armeria Funebre','Deposito Sepolcrale'],
   infirmary:['Sala dell’Imbalsamatore','Camera delle Bende'],
   treasury:['Camera Sepolcrale','Cripta del Corredo'],
   sanctuary:['Cripta Votiva','Altare dei Defunti']
 }
};
function dungeonThemeForFloor(floor=s?.floor||1){return DUNGEON_ARCHITECTURE[floor]||DUNGEON_ARCHITECTURE[1]}

const THEME_PALETTE={
 castle:{
   floorVisible:'#4e5963',floorSeen:'#252b31',
   wallVisible:'#56636f',wallSeen:'#252c33',
   wallEdgeVisible:'#20272d',wallEdgeSeen:'#12171b',
   mortarVisible:'rgba(18,23,28,.78)',mortarSeen:'rgba(8,11,14,.72)',
   highlightVisible:'rgba(210,221,231,.13)',highlightSeen:'rgba(150,160,170,.06)',
   accent:'#7890a3',accentSoft:'rgba(120,144,163,.17)',grid:'rgba(214,225,234,.045)'
 },
 temple:{
   floorVisible:'#665f4b',floorSeen:'#302d24',
   wallVisible:'#756b50',wallSeen:'#332f25',
   wallEdgeVisible:'#2e2a20',wallEdgeSeen:'#17140f',
   mortarVisible:'rgba(39,34,24,.78)',mortarSeen:'rgba(18,15,10,.72)',
   highlightVisible:'rgba(239,220,164,.14)',highlightSeen:'rgba(191,171,120,.06)',
   accent:'#c5ad68',accentSoft:'rgba(197,173,104,.16)',grid:'rgba(244,226,177,.045)'
 },
 catacombs:{
   floorVisible:'#514c55',floorSeen:'#27242a',
   wallVisible:'#615a64',wallSeen:'#2d2930',
   wallEdgeVisible:'#242127',wallEdgeSeen:'#141116',
   mortarVisible:'rgba(27,23,29,.80)',mortarSeen:'rgba(12,10,14,.74)',
   highlightVisible:'rgba(208,194,211,.12)',highlightSeen:'rgba(154,143,158,.06)',
   accent:'#9b879f',accentSoft:'rgba(155,135,159,.16)',grid:'rgba(224,210,226,.04)'
 }
};
function themePalette(){const id=(s?.theme||dungeonThemeForFloor())?.id||'castle';return THEME_PALETTE[id]||THEME_PALETTE.castle}
function specialRoomTint(type,visible){
 const p=themePalette(),base=SPECIAL_ROOMS[type]?.color||p.floorVisible;
 if(!visible)return p.floorSeen;
 return base
}
function themedRoomName(themeId,type,idx=0){
 const bucket=THEME_ROOM_VARIANTS[themeId]?.[type];
 if(bucket&&bucket.length)return bucket[Math.min(idx,bucket.length-1)];
 return SPECIAL_ROOMS[type]?.name||type
}
function roomProgressValue(room,start){return Math.abs(room.cx-start.cx)+Math.abs(room.cy-start.cy)}
function roomWing(room,gate){return !gate?'single':(room.cx<gate.x?'left':'right')}
function uniqueByName(arr){const seen=new Set();return arr.filter(v=>seen.has(v)?false:(seen.add(v),true))}
function pickRoomByMode(pool,mode,start,gate,refRoom){
 if(!pool.length)return null;
 const ordered=[...pool].sort((a,b)=>roomProgressValue(a,start)-roomProgressValue(b,start));
 const takeChunk=(from,to)=>{
   const chunk=ordered.slice(from,to).filter(Boolean);
   return chunk.length?choice(chunk):choice(ordered)
 };
 if(mode==='near')return takeChunk(0,Math.max(1,Math.ceil(ordered.length*.4)));
 if(mode==='mid'){
   const a=Math.floor(ordered.length*.25),b=Math.max(a+1,Math.ceil(ordered.length*.75));
   return takeChunk(a,b)
 }
 if(mode==='deep')return takeChunk(Math.max(0,Math.floor(ordered.length*.6)),ordered.length);
 if(mode==='nearRef'&&refRoom){
   const same=pool.filter(r=>roomWing(r,gate)===roomWing(refRoom,gate));
   const candidates=(same.length?same:pool).sort((a,b)=>{
     const da=Math.abs(a.cx-refRoom.cx)+Math.abs(a.cy-refRoom.cy);
     const db=Math.abs(b.cx-refRoom.cx)+Math.abs(b.cy-refRoom.cy);
     return da-db
   });
   return candidates[0]||null
 }
 return choice(pool)
}
const LAYOUT_STYLE_LABELS={chain:'Percorso',branching:'Bivi',looped:'Circuiti'};
function pickLayoutStyle(floor){
 const bag=floor===1?['chain','chain','branching','branching','looped']:
           floor<=3?['chain','branching','branching','looped','looped']:
           ['branching','branching','looped','looped','chain'];
 return choice(bag)
}
function roomCenterDist(a,b){return Math.abs(a.cx-b.cx)+Math.abs(a.cy-b.cy)}
function connectRoomSet(map,roomSet,style='branching'){
 const arr=[...(roomSet||[])];if(arr.length<2)return;
 if(style==='chain'){
   const axis=Math.random()<.5?'cx':'cy',ordered=[...arr].sort((a,b)=>a[axis]-b[axis]);
   for(let i=1;i<ordered.length;i++)corridor(map,{x:ordered[i-1].cx,y:ordered[i-1].cy},{x:ordered[i].cx,y:ordered[i].cy});
   return
 }
 const remaining=[...arr],connected=[remaining.splice(rand(0,remaining.length-1),1)[0]],edges=[];
 while(remaining.length){
   const candidates=[];
   for(const a of connected)for(const b of remaining)candidates.push({a,b,d:roomCenterDist(a,b)+Math.random()*7});
   candidates.sort((x,y)=>x.d-y.d);
   const pick=candidates[rand(0,Math.min(candidates.length-1,style==='looped'?3:2))],b=pick.b;
   corridor(map,{x:pick.a.cx,y:pick.a.cy},{x:b.cx,y:b.cy});edges.push([pick.a,b]);
   connected.push(b);remaining.splice(remaining.indexOf(b),1)
 }
 if(style==='looped'&&arr.length>=4){
   const edgeKey=(a,b)=>[arr.indexOf(a),arr.indexOf(b)].sort((x,y)=>x-y).join('-'),usedEdges=new Set(edges.map(([a,b])=>edgeKey(a,b)));
   const pairs=[];for(let i=0;i<arr.length;i++)for(let j=i+1;j<arr.length;j++){const k=i+'-'+j;if(!usedEdges.has(k))pairs.push({a:arr[i],b:arr[j],d:roomCenterDist(arr[i],arr[j])})}
   pairs.sort((a,b)=>a.d-b.d);const extras=Math.min(arr.length>=8?2:1,pairs.length);
   for(let n=0;n<extras;n++){const pool=pairs.slice(0,Math.min(6,pairs.length)),p=choice(pool);if(!p)break;corridor(map,{x:p.a.cx,y:p.a.cy},{x:p.b.cx,y:p.b.cy});pairs.splice(pairs.indexOf(p),1)}
 }
}
function buildThematicSpecialRooms(floor,rooms,start,far,progressionGate){
 const count=floor>=3?2:1,theme=dungeonThemeForFloor(floor),eligible=rooms.filter(r=>r!==start&&r!==far);
 if(!eligible.length)return [];
 const plansByFloor={
   1:[
     [{type:'guardroom',mode:'near'}],
     [{type:'infirmary',mode:'mid'}],
     [{type:'treasury',mode:'deep'}]
   ],
   2:[
     [{type:'armory',mode:'near'}],
     [{type:'guardroom',mode:'mid'}],
     [{type:'infirmary',mode:'mid'}],
     [{type:'treasury',mode:'deep'}]
   ],
   3:[
     [{type:'sanctuary',mode:'mid'},{type:'treasury',mode:'nearRef'}],
     [{type:'infirmary',mode:'mid'},{type:'guardroom',mode:'nearRef'}],
     [{type:'armory',mode:'mid'},{type:'sanctuary',mode:'nearRef'}],
     [{type:'treasury',mode:'mid'},{type:'guardroom',mode:'nearRef'}]
   ],
   4:[
     [{type:'sanctuary',mode:'mid'},{type:'guardroom',mode:'nearRef'}],
     [{type:'armory',mode:'mid'},{type:'treasury',mode:'nearRef'}],
     [{type:'infirmary',mode:'mid'},{type:'guardroom',mode:'nearRef'}],
     [{type:'treasury',mode:'mid'},{type:'sanctuary',mode:'nearRef'}]
   ],
   5:[
     [{type:'sanctuary',mode:'mid'},{type:'treasury',mode:'deep'}],
     [{type:'guardroom',mode:'mid'},{type:'infirmary',mode:'deep'}],
     [{type:'armory',mode:'mid'},{type:'treasury',mode:'deep'}],
     [{type:'sanctuary',mode:'mid'},{type:'guardroom',mode:'deep'}]
   ]
 };
 const fallback={
   castle:['guardroom','armory','infirmary','treasury','sanctuary'],
   temple:['sanctuary','treasury','guardroom','infirmary','armory'],
   catacombs:['sanctuary','treasury','guardroom','armory','infirmary']
 }[theme.id]||Object.keys(SPECIAL_ROOMS);
 const choices=plansByFloor[floor]||[],plan=(choices.length?choice(choices):[]).slice(0,count);
 while(plan.length<count){const type=fallback.find(id=>!plan.some(p=>p.type===id));if(!type)break;plan.push({type,mode:plan.length?'nearRef':'mid'})}
 const picked=[],taken=new Set();
 for(let i=0;i<plan.length;i++){
   const spec=plan[i];let pool=eligible.filter(r=>!taken.has(r));
   if(i>0&&picked[i-1]){const sameWing=pool.filter(r=>roomWing(r,progressionGate)===roomWing(picked[i-1],progressionGate));if(sameWing.length)pool=sameWing}
   const room=pickRoomByMode(pool,spec.mode,start,progressionGate,picked[i-1])||pickRoomByMode(eligible.filter(r=>!taken.has(r)),'mid',start,progressionGate,picked[i-1]);
   if(!room)continue;taken.add(room);picked.push({...room,type:spec.type,label:themedRoomName(theme.id,spec.type,i),themeId:theme.id,entered:false})
 }
 return picked
}
const OBJECTIVES=[
{id:'return1',icon:'🏕️',name:'Primo ritorno',target:1,get:m=>m.extractions,reward:60,badge:'Rientrato',text:'Completa la tua prima estrazione.'},
{id:'hunter25',icon:'☠️',name:'Cacciatore',target:25,get:m=>m.kills,reward:80,badge:'Cacciatore',text:'Sconfiggi 25 nemici in totale.'},
{id:'hunter75',icon:'⚔️',name:'Veterano del buio',target:75,get:m=>m.kills,reward:150,badge:'Veterano',text:'Sconfiggi 75 nemici in totale.'},
{id:'rooms5',icon:'🏛️',name:'Speleologo',target:5,get:m=>m.specialRooms,reward:90,badge:'Speleologo',text:'Visita 5 stanze speciali.'},
{id:'danger2',icon:'🚪',name:'Temerario',target:2,get:m=>m.dangerWins,reward:140,badge:'Temerario',text:'Vinci 2 sfide della Porta Pericolosa.'},
{id:'chests12',icon:'🧰',name:'Mani sul bottino',target:12,get:m=>m.chestsOpened,reward:110,badge:'Cercatore',text:'Apri 12 forzieri.'},
{id:'heals10',icon:'🧪',name:'Ancora vivo',target:10,get:m=>m.healsUsed,reward:80,badge:'Tenace',text:'Usa 10 pozioni.'},
{id:'missions10',icon:'🎯',name:'Affidabile',target:10,get:m=>m.totalMissions,reward:130,badge:'Affidabile',text:'Completa 10 missioni di run.'},
{id:'floor4',icon:'⬇️',name:'Dove la luce finisce',target:4,get:m=>m.bestFloor,reward:110,badge:'Disceso',text:'Raggiungi almeno il Piano 4.'},
{id:'floor5',icon:'🕯️',name:'Oltre la soglia',target:5,get:m=>m.bestFloor,reward:170,badge:'Oltre la Soglia',text:'Raggiungi il Piano 5.'},
{id:'mini1',icon:'🛡️',name:'Spezzacustode',target:1,get:m=>m.minibossKills,reward:120,badge:'Spezzacustode',text:'Sconfiggi il Custode.'},
{id:'boss1',icon:'👑',name:'Il fondo guarda indietro',target:1,get:m=>m.bossKills,reward:260,badge:'Conquistatore',text:'Sconfiggi il boss finale.'},
{id:'gold1000',icon:'🪙',name:'Tesoro di guerra',target:1000,get:m=>m.goldExtracted,reward:180,badge:'Ricco',text:'Estrai 1000 oro complessivo.'},
{id:'clears3',icon:'🏆',name:'Threshold',target:3,get:m=>m.clears,reward:320,badge:'Veterano della Soglia',text:'Completa il dungeon 3 volte.'}
];
const RESILIENCE_STEPS=[{count:3,hp:47,bonus:2},{count:6,hp:49,bonus:2},{count:10,hp:52,bonus:3},{count:14,hp:55,bonus:3}];
function completedObjectives(m=meta){return OBJECTIVES.filter(o=>o.get(m)>=o.target).length}
function resilienceMaxHp(m=meta){const n=completedObjectives(m);let hp=45;for(const r of RESILIENCE_STEPS)if(n>=r.count)hp=r.hp;return hp}
function resilienceNext(m=meta){const n=completedObjectives(m);return RESILIENCE_STEPS.find(r=>n<r.count)||null}
const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a,choice=a=>a[Math.floor(Math.random()*a.length)],K=(x,y)=>x+','+y,dist=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y),cheb=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y)),has=id=>s&&s.deck.has(id),hasBuff=id=>s&&s.buffs.has(id),maxInv=()=>10+(has('packrat')?2:0),card=id=>CARDS.find(c=>c.id===id);
const TORCH_MAX_LIGHT=100,TORCH_START_LIGHT=70,TORCH_RESTORE=40,TORCH_THRESHOLD_DRAIN=10;
function torchLight(){return Math.max(0,Math.min(TORCH_MAX_LIGHT,s?.torchLightLevel??0))}
function portableTorchActive(){return torchLight()>0}
function lightBand(){const l=torchLight();return l>75?'radiosa':l>50?'chiara':l>25?'fioca':l>0?'morente':'buio'}
function darknessFactor(){return 1-torchLight()/TORCH_MAX_LIGHT}
function activatePortableTorch(){if(!s)return;if((s.portableTorches||0)<=0){showToast('🔥 NESSUNA TORCIA');return}if(torchLight()>=TORCH_MAX_LIGHT){showToast('🔥 LUCE GIÀ AL MASSIMO');return}s.portableTorches--;const before=torchLight();s.torchLightLevel=Math.min(TORCH_MAX_LIGHT,before+TORCH_RESTORE);playSfx('event');burst('pickup',s.player.x,s.player.y,{glyph:'🔥',color:'#ffb34f'});log('🔥 Consumi una torcia: luce '+before+' → '+s.torchLightLevel+'.');showToast('🔥 LUCE '+s.torchLightLevel+'/100');updateVisibility();render()}
function roomGeometryAt(x,y){return (s?.rooms||[]).find(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h)||null}
function areaKindAt(x,y){return roomGeometryAt(x,y)?'room':'corridor'}
function darkLootBonus(){return 1+darknessFactor()*.50}
function safeDynamicSpotNear(x,y,kind){const candidates=[];for(let yy=Math.max(1,y-3);yy<=Math.min(WORLD-2,y+3);yy++)for(let xx=Math.max(1,x-3);xx<=Math.min(WORLD-2,x+3);xx++){if(s.map[yy]?.[xx]!=='.'||v18SolidDecorationAt(xx,yy))continue;if(kind&&areaKindAt(xx,yy)!==kind)continue;if(enemyAt(xx,yy)||s.traps.some(t=>!t.triggered&&t.x===xx&&t.y===yy)||s.coins.some(c=>c.x===xx&&c.y===yy)||s.loot.some(l=>l.x===xx&&l.y===yy))continue;if(xx===s.player.x&&yy===s.player.y)continue;candidates.push({x:xx,y:yy})}return candidates.length?choice(candidates):null}
function applyDarknessToThreshold(kind,key){if(!s)return;s._darkThresholds=s._darkThresholds||new Set();if(s._darkThresholds.has(key))return;s._darkThresholds.add(key);const d=darknessFactor();if(d<=.25)return;const trapChance=.015+d*.095,lootChance=.06+d*.28,darkTrapCap=Math.min(3,1+Math.floor((s.floor-1)/2)),darkTrapCount=(s.traps||[]).filter(t=>t.darkSpawn&&!t.triggered).length;if(darkTrapCount<darkTrapCap&&Math.random()<trapChance){const p=safeDynamicSpotNear(s.player.x,s.player.y,kind);if(p){s.traps.push({x:p.x,y:p.y,triggered:false,revealed:false,darkSpawn:true});log('🪤 Nel buio la Soglia nasconde un nuovo pericolo.')}}if(Math.random()<lootChance){const p=safeDynamicSpotNear(s.player.x,s.player.y,kind);if(p){const value=Math.round((18+s.floor*7)*darkLootBonus());s.coins.push({x:p.x,y:p.y,value,darkSpawn:true});log('🪙 Nel buio qualcosa luccica oltre la Soglia.')}}}
function crossPhysicalThreshold(fromX,fromY,toX,toY){if(!s)return;const a=areaKindAt(fromX,fromY),b=areaKindAt(toX,toY);if(a===b)return;playSfx('threshold');burst('thresholdDoor',toX,toY,{glyph:'⟐',color:'#bd9d71'});const before=torchLight();s.torchLightLevel=Math.max(0,before-TORCH_THRESHOLD_DRAIN);s._physicalThresholdCount=(s._physicalThresholdCount||0)+1;const room=roomGeometryAt(toX,toY),key=b+':'+(room?room.x+','+room.y:toX+','+toY);applyDarknessToThreshold(b,key);if(before>0&&s.torchLightLevel===0){playSfx('flameOut');showToast('🔥 LA LUCE SI SPEGNE');log('🔥 Attraversando la Soglia, la luce si spegne.')}else if(s._physicalThresholdCount===1)showToast('◇ PRIMA SOGLIA')}
function consumePortableTorchStep(){} // legacy: light now falls only when a physical threshold is crossed.
function healingMultiplier(){let m=1;if(has('medic'))m*=1.25;if(hasBuff('healerRun'))m*=1.35;return m}
function healPlayer(amount,full=false){if(!s)return 0;const before=s.hp;if(full)s.hp=s.maxHp;else s.hp=Math.min(s.maxHp,s.hp+Math.max(0,Math.round(amount*healingMultiplier())));const gained=s.hp-before;if(gained>0)burst('heal',s.player.x,s.player.y,{amount:gained});return gained}

function saveMeta(){try{localStorage.setItem(STORE,JSON.stringify({bank,owned:[...owned],deck:[...deck],objectiveClaims:[...objectiveClaims],firstRun,previewEnabled,objectivesOpen,audioEnabled,guideSeen,meta}))}catch(e){}}
function loadMeta(){try{const m=JSON.parse(localStorage.getItem(STORE)||'null');if(!m)return;bank=Number.isFinite(m.bank)?m.bank:0;const valid=new Set(CARDS.map(c=>c.id));owned=new Set((m.owned||[]).filter(x=>valid.has(x)));deck=new Set((m.deck||[]).filter(x=>owned.has(x)).slice(0,5));objectiveClaims=new Set((m.objectiveClaims||[]).filter(id=>OBJECTIVES.some(o=>o.id===id)));firstRun=m.firstRun!==false;if(typeof m.previewEnabled==='boolean')previewEnabled=m.previewEnabled;if(typeof m.objectivesOpen==='boolean')objectivesOpen=m.objectivesOpen;if(typeof m.audioEnabled==='boolean')audioEnabled=m.audioEnabled;if(typeof m.guideSeen==='boolean')guideSeen=m.guideSeen;if(m.meta&&typeof m.meta==='object'){const legacyDepth=!Number.isFinite(m.meta.depthRewarded);meta={...meta,...m.meta};if(legacyDepth)meta.depthRewarded=Math.max(1,meta.bestFloor||1)}}catch(e){}}

function cardUnlocked(id){const c=card(id);return !!c&&cardRank(id)<=shopRankForDepth()}
function claimObjective(id){const o=OBJECTIVES.find(x=>x.id===id);if(!o||objectiveClaims.has(id)||o.get(meta)<o.target)return;objectiveClaims.add(id);bank+=o.reward;playSfx('pickup');saveMeta();renderHub()}
function renderProgress(){
 const stats=root.querySelector('#progressStats'),msBox=root.querySelector('#milestones'),wrap=root.querySelector('#objectivesWrap'),toggle=root.querySelector('#objectivesToggle');if(!stats||!msBox)return;
 if(wrap)wrap.classList.toggle('hidden',!objectivesOpen);if(toggle)toggle.textContent=objectivesOpen?'🎯 Nascondi obiettivi':'🎯 Obiettivi';
 const objDone=completedObjectives(),baseHp=resilienceMaxHp(),nextRes=resilienceNext(),items=[['Vita base',baseHp+' HP'],['Obiettivi',objDone+'/'+OBJECTIVES.length],['Carte',owned.size+'/'+CARDS.length],['KO totali',meta.kills],['Oro estratto',meta.goldExtracted],['Estrazioni',meta.extractions],['Dungeon completati',meta.clears],['Boss finali',meta.bossKills],['Miglior oro',meta.bestGold],['Piano migliore',meta.bestFloor+'/5'],['Missioni totali',meta.totalMissions],['Backstab record',meta.bestBackstabs],['Serie vittorie',meta.winStreak+' · record '+meta.bestWinStreak]];
 stats.innerHTML=items.map(([k,v])=>`<div class="progress-stat"><span class="subtle">${k}</span><strong>${v}</strong></div>`).join('');
 msBox.innerHTML=`<div class="milestone unlocked"><strong>❤️ Resilienza · ${baseHp} HP</strong><div class="subtle" style="margin-top:3px">Gli Obiettivi aumentano permanentemente la Vita base. Il bonus entra in vigore dalla run successiva.</div><div class="meter"><div style="width:${nextRes?Math.round(objDone/nextRes.count*100):100}%;background:#c66f77"></div></div><div style="margin-top:5px">${nextRes?objDone+' / '+nextRes.count+' obiettivi per '+nextRes.hp+' HP':'Resilienza massima raggiunta · 55 HP'}</div></div>`;for(const o of OBJECTIVES){const raw=o.get(meta),v=Math.min(o.target,raw),done=raw>=o.target,claimed=objectiveClaims.has(o.id),el=document.createElement('div');el.className='milestone '+(done?'unlocked':'locked');el.innerHTML=`<strong>${o.icon} ${o.name}</strong><div class="subtle" style="margin-top:3px">${o.text}</div><div class="meter"><div style="width:${Math.round(v/o.target*100)}%;background:${done?'#6ab47a':'#78899b'}"></div></div><div style="margin-top:5px">${done?(claimed?'✓ Premio riscattato':'Completato · +'+o.reward+' oro'):v+' / '+o.target}</div>${claimed?`<span class="objective-badge">Medaglia: ${o.badge}</span>`:''}`;if(done&&!claimed){const b=document.createElement('button');b.type='button';b.className='objective-claim';b.textContent='Riscatta +'+o.reward+' oro';b.onclick=()=>claimObjective(o.id);el.appendChild(b)}msBox.appendChild(el)}
}
function showToast(text,kind=null){const el=root.querySelector('#runToast');if(!el)return;clearTimeout(toastTimer);el.textContent=text;const raw=String(text||'');if(!kind){if(/☠|CRITIC|PERICOLO|COLPO|TRAPPOLA|ALLARME/.test(raw))kind='bad';else if(/⚠|CARICA|INSTABIL|SFIDA/.test(raw))kind='warn';else if(/🏆|✅|SCONFITTO|COMPLETAT|BACKSTAB|RIPOSTA|GUARDIA|\+\d/.test(raw))kind='good';else kind='info'}el.classList.remove('toast-good','toast-warn','toast-bad','toast-info');el.classList.add('show','toast-'+kind);toastTimer=setTimeout(()=>el.classList.remove('show'),kind==='bad'||kind==='warn'?1900:1550)}
function pushFx(x,y,text,color='#ffffff'){if(!s)return;s.fx.push({x,y,text,color,start:performance.now(),ttl:850});if(!fxFrame)fxFrame=requestAnimationFrame(animateFx)}
function animateFx(){if(!s){fxFrame=0;return}const now=performance.now();s.fx=s.fx.filter(f=>now-f.start<f.ttl);draw();if(s.fx.length)fxFrame=requestAnimationFrame(animateFx);else fxFrame=0}
function revealWholeFloor(){for(let y=0;y<WORLD;y++)for(let x=0;x<WORLD;x++)s.seen.add(K(x,y));updateVisibility()}
function revealObjectives(){s.seen.add(K(s.stairs.x,s.stairs.y));for(const r of s.specialRooms||[])for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)s.seen.add(K(x,y))}
function grantHeal(id){if(s.inventory.length<maxInv()){s.inventory.push({kind:'heal',id});log('🧪 '+HEALS[id].name+' aggiunta.')}else{const gained=healPlayer(HEALS[id].heal);if(gained>0){meta.healsUsed++;saveMeta();log('🎒 Zaino pieno: la pozione viene usata subito (+'+gained+' HP).')}else{s.loot.push({x:s.player.x,y:s.player.y,kind:'heal',id,seen:true});log('🎒 Zaino pieno e vita al massimo: '+HEALS[id].name+' lasciata a terra.')}}}
function grantAdvancedWeapon(family=null){const f=family||choice(Object.keys(F)),pool=POOLS[f],id=pool[Math.min(3,Math.max(1,s.floor-1+rand(0,1)))],item=weaponItem(id);if(s.inventory.length<maxInv()){s.inventory.push(item);log('⚔️ Trovata '+W[id].name+'.')}else{s.loot.push({x:s.player.x,y:s.player.y,kind:'weapon',id,seen:true});log('🎒 Zaino pieno: '+W[id].name+' lasciata a terra.')}}
function grantRandomRunBuff(){const choices=REWARDS.filter(r=>!s.buffs.has(r.id));if(!choices.length){addGold(50,true);return}const r=choice(choices);s.buffs.add(r.id);if(r.id==='vital'){s.maxHp+=6;s.hp=Math.min(s.maxHp,s.hp+6)}log('🎴 Bonus ottenuto: '+r.name+'.');showToast('🎴 '+r.name)}
function scheduleChain(key,dueFloor){if(!s||s.chains[key])return;s.chains[key]={dueFloor:Math.max(s.floor+1,dueFloor),spawned:false,done:false}}
const FOLLOWUP_EVENT_TYPES=new Set(['prisonerCache','monolithEcho','graveEcho']);
function dueChainForFloor(floor){const map={prisoner:'prisonerCache',monolith:'monolithEcho',grave:'graveEcho'};for(const key of Object.keys(map)){const c=s?.chains?.[key];if(c&&!c.done&&!c.spawned&&c.dueFloor<=floor){c.spawned=true;return{key,type:map[key]}}}return null}
const EVENT_POOLS_BY_FLOOR={
 1:['shrine','cache','fountain','forge','hermit','roots','prisoner'],
 2:['cache','cursed','fountain','forge','hermit','prisoner','grave','shrine'],
 3:['shrine','oracle','roots','monolith','grave','silence','cache','echo'],
 4:['oracle','bloodwell','silence','monolith','grave','cursed','roots','echo'],
 5:['bloodwell','silence','monolith','grave','echo','cursed','oracle','cache']
};
function randomBaseEventType(floor=s?.floor||1){const pool=(EVENT_POOLS_BY_FLOOR[floor]||Object.keys(EVENTS)).filter(k=>EVENTS[k]&&!FOLLOWUP_EVENT_TYPES.has(k)&&(k!=='echo'||floor>1));return choice(pool)}
function weaponItem(id){return{kind:'weapon',id,uid:uidCounter++,uses:W[id].uses+(has('armorer')?1:0)}}function eqItem(){return s?s.inventory.find(i=>i.kind==='weapon'&&i.uid===s.equippedUid)||null:null}function eqWeapon(){const i=eqItem();return i?W[i.id]:W.unarmed}function enemyAt(x,y,except=null){return s.enemies.find(e=>e.hp>0&&e.id!==except&&e.x===x&&e.y===y)}

function randomArtifactId(){return choice(ARTIFACT_POOL)}
function grantArtifact(id,source='ritrovamento'){
 const a=ARTIFACTS[id];if(!a)return false;
 if(s.artifactBelt.length>=ARTIFACT_MAX){log('🧿 Cintura piena: '+a.name+' resta a terra.');showToast('🧿 CINTURA PIENA · MAX 3');return false}
 s.artifactBelt.push(id);playSfx('pickup');log('🧿 '+a.name+' raccolto ('+source+').');showToast(a.icon+' '+a.name.toUpperCase());return true
}
function pickupArtifactDrops(){
 const here=(s.artifactDrops||[]).filter(o=>o.x===s.player.x&&o.y===s.player.y);
 for(const o of here){if(grantArtifact(o.id,o.secret?'camera segreta':'dungeon'))s.artifactDrops.splice(s.artifactDrops.indexOf(o),1)}
}
function revealWithEye(){
 const r=10;
 for(let y=Math.max(0,s.player.y-r);y<=Math.min(WORLD-1,s.player.y+r);y++)for(let x=Math.max(0,s.player.x-r);x<=Math.min(WORLD-1,s.player.x+r);x++)if(Math.hypot(x-s.player.x,y-s.player.y)<=r)s.seen.add(K(x,y));
 for(const t of s.traps)if(dist(t,s.player)<=r){t.revealed=true;t.seen=true}
 for(const q of s.secrets||[])if(dist(q,s.player)<=r)q.seen=true;
 for(const o of s.artifactDrops||[])if(dist(o,s.player)<=r)o.seen=true;
 log('👁️ L’Occhio della Soglia rivela ciò che la pietra cercava di nascondere.');showToast('👁 SEGRETI VICINI RIVELATI')
}
function useArtifactAt(idx){
 if(!s||idx<0||idx>=s.artifactBelt.length||s.eventOpen||s.rewardOpen)return;
 if(s.artifactUsedThisTurn){log('🧿 Hai già usato un artefatto in questo turno. Agisci o aspetta prima di usarne un altro.');showToast('🧿 1 ARTEFATTO PER TURNO');return}
 const id=s.artifactBelt[idx],a=ARTIFACTS[id];if(!a)return;
 if(id==='stone'){s.artifactBuffs.stone=1;log('⬢ Pelle di Pietra attiva: il prossimo colpo sarà quasi annullato.')}
 if(id==='silence'){const before=s.alarm;s.alarm=Math.max(0,s.alarm-20);log('🔔 Campana del Silenzio: Allarme -'+(before-s.alarm)+'.')}
 if(id==='eye')revealWithEye();
 if(id==='returnSeal'){const boss=floorBoss();if(boss&&boss.hp>0){boss.hp=boss.maxHp;boss.telegraph=false;boss.armored=false;boss.phase=boss.bossKind==='final'?1:boss.phase;boss.turns=0;boss.state='idle';boss.lastSeen=null;log('👑 Fuggendo dal combattimento, il boss recupera tutta la vita.')}const p=s.startPos||s.player,occupied=enemyAt(p.x,p.y);if(occupied){const q=nearbyFree(p.x,p.y);if(q){s.player.x=q.x;s.player.y=q.y}}else{s.player.x=p.x;s.player.y=p.y}log('⌂ Il Sigillo ti riporta all’ingresso del piano.');showToast('⌂ RITORNO')}
 if(id==='blood'){s.artifactBuffs.blood=Math.max(s.artifactBuffs.blood||0,6);s.alarm=Math.min(100,s.alarm+10);threatEvents();log('🩸 Sangue Nero: +30% danni per 6 turni · +10 Allarme.');showToast('🩸 POTERE · 6 TURNI')}
 if(id==='heart'){s.artifactBuffs.power=Math.max(s.artifactBuffs.power||0,8);log('✦ Cuore della Soglia: arma esaltata per 8 turni.');showToast('✦ ARMA ESALTATA · 8 TURNI')}
 s.artifactBelt.splice(idx,1);s.artifactUsedThisTurn=true;updateVisibility();render();root.focus()
}
function tickArtifactBuffs(){
 if(!s?.artifactBuffs)return;
 for(const k of ['blood','power'])if(s.artifactBuffs[k]>0){s.artifactBuffs[k]--;if(s.artifactBuffs[k]===0)log(k==='blood'?'🩸 Il Sangue Nero si spegne.':'✦ Il Cuore della Soglia si spegne.')}
}
function renderArtifacts(){
 const box=root.querySelector('#artifactBelt'),cnt=root.querySelector('#artifactCount');if(!box||!cnt||!s)return;
 cnt.textContent=s.artifactBelt.length;box.innerHTML='';
 if(!s.artifactBelt.length)box.innerHTML='<div class="artifact-empty">Nessun artefatto. Cercali nei segreti, negli eventi e nelle profondità.</div>';
 s.artifactBelt.forEach((id,idx)=>{const a=ARTIFACTS[id],row=document.createElement('div');row.className='artifact-row';row.innerHTML=`<div class="artifact-symbol">${a.icon}</div><div class="artifact-main"><div class="artifact-name">${a.name}</div><div class="artifact-desc">${a.desc}</div></div>`;const b=document.createElement('button');b.type='button';b.className='artifact-use';b.textContent='Usa';b.onclick=()=>useArtifactAt(idx);row.appendChild(b);box.appendChild(row)});
 const active=[];if(s.artifactBuffs?.stone)active.push('⬢ Pelle di Pietra pronta');if(s.artifactBuffs?.blood>0)active.push('🩸 Sangue Nero '+s.artifactBuffs.blood+'t');if(s.artifactBuffs?.power>0)active.push('✦ Cuore '+s.artifactBuffs.power+'t');
 if(active.length){const el=document.createElement('div');el.className='artifact-active';el.textContent='Attivi: '+active.join(' · ');box.appendChild(el)}
}
function openSecret(sec){
 if(!s||!sec||sec.opened||!sec.seen)return;
 sec.opened=true;s.map[sec.y][sec.x]='.';s.open.push({x:sec.x,y:sec.y});s.seen.add(K(sec.x,sec.y));s.seen.add(K(sec.insideX,sec.insideY));burst('secret',sec.x,sec.y);playSfx('door');makeNoise(5);log('≋ La parete cede: hai aperto una camera segreta.');showToast('≋ PASSAGGIO SEGRETO APERTO');addThreat(true,false);enemyTurn();if(s){updateVisibility();render()}
}
function activateMechanism(){
 const m=s?.mechanism;if(!m||m.activated)return;
 m.activated=true;m.cache.seen=true;s.seen.add(K(m.cache.x,m.cache.y));s.chests.push({x:m.cache.x,y:m.cache.y,opened:false,bonus:35+s.floor*6,seen:true,mechanism:true});burst('mechanism',m.switch.x,m.switch.y,{toX:m.cache.x,toY:m.cache.y});burst('door',m.cache.x,m.cache.y);playSfx('door');log('⚙️ CLANK. Una grata si apre in un’altra parte del piano. Il deposito liberato è ora segnato sulla mappa.');showToast('⚙️ DEPOSITO SBLOCCATO · MAPPA AGGIORNATA');pushFx(m.cache.x,m.cache.y,'APERTA','#e8c878')
}
function log(m){const e=document.createElement('div');e.className='log-entry';e.textContent=m;root.querySelector('#log').prepend(e);while(root.querySelector('#log').children.length>18)root.querySelector('#log').lastChild.remove()}
function openMobileSheet(tab='gear'){const sheet=root.querySelector('#gameSideSheet'),back=root.querySelector('#mobileSheetBackdrop');if(!sheet)return;sheet.classList.add('mobile-open');document.body.classList.add('mobile-modal-open');if(back)back.classList.add('open');const btn=root.querySelector(`[data-tab="${tab}"]`);if(btn){root.querySelectorAll('.game-tab').forEach(x=>x.classList.remove('tab-on'));btn.classList.add('tab-on');root.querySelectorAll('.game-panel').forEach(x=>x.classList.add('hidden'));const panel=root.querySelector('#panel-'+tab);if(panel)panel.classList.remove('hidden')}}
function closeMobileSheet(){const sheet=root.querySelector('#gameSideSheet'),back=root.querySelector('#mobileSheetBackdrop');if(sheet)sheet.classList.remove('mobile-open');document.body.classList.remove('mobile-modal-open');if(back)back.classList.remove('open')}
function mobilePulse(ms=8){try{if(navigator.vibrate)navigator.vibrate(ms)}catch(e){}}
function showHub(){const w=root.querySelector('#welcome'),h=root.querySelector('#hub');if(w)w.classList.add('hidden');if(h)h.classList.remove('hidden')}
function onWelcomeStart(){playSfx('ui');showHub();root.focus()}
function openGuide(){guideOpen=true;closeMobileSheet();const g=root.querySelector('#guideOverlay');if(g)g.classList.remove('hidden');playSfx('ui')}
function closeGuide(markSeen=true){guideOpen=false;const g=root.querySelector('#guideOverlay');if(g)g.classList.add('hidden');if(markSeen&&!guideSeen){guideSeen=true;saveMeta()}root.focus()}
function showFloorSplash(){if(!s)return;const el=root.querySelector('#floorSplash'),r=floorRule(),theme=s.theme||dungeonThemeForFloor(s.floor);if(!el||!r)return;clearTimeout(floorSplashTimer);const title=el.querySelector('strong'),sub=el.querySelector('span');if(title)title.textContent='PIANO '+s.floor+' · '+r.name.toUpperCase();if(sub)sub.textContent=(theme.name+' — '+(s.floor<=2?'esplora, equipaggiati e trova le scale.':s.floor===3?'il Custode protegge questo piano. Preparati prima di affrontarlo.':s.floor===4?'risolvi il rituale per aprire il Varco Centrale.':'completa i sigilli, apri il Varco e raggiungi il cuore del dungeon.'));el.classList.add('show');floorSplashTimer=setTimeout(()=>el.classList.remove('show'),2200)}
function ensureAudio(){if(!audioEnabled)return null;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;if(!audioCtx){audioCtx=new AC();audioMaster=audioCtx.createGain();audioMaster.gain.value=.22;audioMaster.connect(audioCtx.destination)}if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});return audioCtx}
function audioTone(f1,f2,dur=.1,type='square',gain=.12,delay=0){const c=ensureAudio();if(!c||!audioMaster)return;const t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(Math.max(20,f1),t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.001,gain),t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(audioMaster);o.start(t);o.stop(t+dur+.02)}
function audioNoise(dur=.1,gain=.08,cutoff=900,mode='lowpass',delay=0){const c=ensureAudio();if(!c||!audioMaster)return;const sr=c.sampleRate,len=Math.max(1,Math.floor(sr*dur)),buf=c.createBuffer(1,len,sr),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain(),t=c.currentTime+delay;src.buffer=buf;f.type=mode;f.frequency.value=cutoff;g.gain.setValueAtTime(Math.max(.001,gain),t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);src.connect(f);f.connect(g);g.connect(audioMaster);src.start(t)}
function playSfx(name){if(!audioEnabled)return;switch(name){
 case'ui':audioTone(240,150,.05,'square',.05);break;
 case'start':audioNoise(.28,.09,700,'lowpass');audioTone(115,55,.34,'sawtooth',.11);audioTone(58,42,.42,'square',.05,.04);break;
 case'sword':audioNoise(.07,.06,2200,'highpass');audioTone(210,95,.08,'square',.09);break;
 case'spear':audioNoise(.06,.05,2600,'highpass');audioTone(290,150,.08,'square',.07);break;
 case'dagger':audioNoise(.045,.05,3600,'highpass');audioTone(420,210,.045,'square',.06);break;
 case'axe':audioNoise(.11,.09,850,'lowpass');audioTone(165,72,.13,'sawtooth',.12);break;
 case'hammer':audioNoise(.14,.11,520,'lowpass');audioTone(92,42,.17,'square',.14);break;
 case'miss':audioNoise(.12,.06,3000,'highpass');break;
 case'push':audioNoise(.06,.05,600,'lowpass');audioTone(105,70,.08,'square',.05);break;
 case'stun':audioTone(260,120,.05,'square',.08);audioTone(190,80,.08,'square',.07,.045);break;
 case'kill':audioNoise(.13,.11,420,'lowpass');audioTone(88,38,.15,'sawtooth',.09);break;
 case'bossKill':audioNoise(.35,.12,500,'lowpass');audioTone(120,42,.4,'sawtooth',.14);audioTone(180,60,.32,'square',.06,.08);break;
 case'hurt':audioNoise(.11,.08,700,'bandpass');audioTone(130,68,.18,'sawtooth',.10);break;
 case'trap':audioNoise(.16,.10,1200,'bandpass');audioTone(200,72,.18,'square',.08);break;
 case'coin':audioTone(650,900,.07,'square',.06);audioTone(900,1180,.06,'square',.045,.055);break;
 case'chest':audioTone(220,330,.11,'triangle',.06);audioTone(330,520,.13,'triangle',.06,.10);break;
 case'pickup':audioTone(420,690,.10,'triangle',.06);break;
 case'heal':audioTone(260,390,.12,'sine',.07);audioTone(390,620,.16,'sine',.06,.09);break;
 case'stairs':audioNoise(.25,.05,600,'lowpass');audioTone(210,68,.34,'sawtooth',.08);break;
 case'event':audioTone(460,230,.26,'sine',.07);audioTone(690,345,.22,'triangle',.04,.05);break;
 case'door':audioNoise(.24,.09,520,'lowpass');audioTone(82,48,.24,'square',.09);break;
 case'alarm':audioTone(210,150,.09,'square',.08);audioTone(210,150,.09,'square',.08,.13);break;
 case'bossWarn':audioTone(76,76,.12,'square',.11);audioTone(58,58,.12,'square',.10,.16);audioTone(76,76,.12,'square',.11,.32);break;
 case'extract':audioTone(260,390,.12,'triangle',.06);audioTone(390,590,.15,'triangle',.06,.11);break;
 case'death':audioNoise(.28,.08,400,'lowpass');audioTone(110,32,.38,'sawtooth',.12);break;
 case'stepRoom':audioNoise(.035,.025,520,'lowpass');audioTone(72,58,.035,'triangle',.018);break;
 case'stepCorridor':audioNoise(.055,.034,760,'bandpass');audioTone(86,62,.045,'triangle',.022);break;
 case'threshold':audioTone(155,78,.22,'sine',.07);audioTone(232,116,.18,'triangle',.035,.04);audioNoise(.18,.028,430,'lowpass',.02);break;
 case'torchTake':audioNoise(.08,.05,1800,'highpass');audioTone(310,170,.09,'triangle',.055);break;
 case'torchBoost':audioNoise(.16,.045,1050,'bandpass');audioTone(180,360,.20,'sine',.05);audioTone(360,510,.12,'triangle',.028,.10);break;
 case'flameOut':audioNoise(.28,.07,720,'lowpass');audioTone(94,45,.28,'sine',.055);break;
 case'roomEnter':audioTone(130,104,.10,'triangle',.026);audioTone(196,156,.13,'sine',.018,.04);break;
 case'alertSpot':audioTone(480,240,.07,'square',.055);audioTone(520,260,.07,'square',.045,.075);break;
 case'instability':audioTone(92,138,.24,'sawtooth',.045);audioTone(205,102,.20,'sine',.025,.05);audioNoise(.22,.025,380,'lowpass');break;
 case'weaponSwitch':audioNoise(.055,.035,2100,'highpass');audioTone(250,330,.06,'triangle',.04);break;
 case'break':audioNoise(.15,.08,2400,'highpass');audioTone(260,90,.11,'square',.065);break;
 case'lowLight':audioTone(74,58,.26,'sine',.035);audioTone(51,42,.30,'sine',.025,.08);break;
 case'puzzle':audioTone(210,315,.13,'triangle',.04);audioTone(315,472,.13,'triangle',.035,.12);break;
 case'backstab':audioNoise(.055,.045,3200,'highpass');audioTone(360,130,.07,'triangle',.045);break;
 case'guard':audioTone(190,240,.06,'square',.045);audioNoise(.06,.025,1200,'bandpass');break;
 }}
function syncSoundButtons(){const html=iconHTML(soundIconKey(),'icon-inline icon-md');for(const id of ['soundToggleHub','soundToggleGame']){const b=root.querySelector('#'+id);if(b){b.innerHTML=html;b.setAttribute('aria-pressed',String(audioEnabled))}}}
function toggleAudio(){audioEnabled=!audioEnabled;if(audioEnabled){ensureAudio();playSfx('ui')}else if(audioCtx&&audioCtx.state==='running'){audioCtx.suspend().catch(()=>{})}saveMeta();syncSoundButtons()}

let ambientSfxTimer=null;
function startAmbientSfx(){if(ambientSfxTimer)return;ambientSfxTimer=setInterval(()=>{if(!audioEnabled||!s||document.hidden)return;const game=root.querySelector('#game');if(!game||game.classList.contains('hidden'))return;const light=typeof torchLight==='function'?torchLight():100;const roll=Math.random();if(light<=20&&roll<.55)playSfx('lowLight');else if(light<=45&&roll<.28){audioNoise(.30,.018,360,'lowpass');audioTone(54,48,.32,'sine',.016,.04)}else if(roll<.10){audioNoise(.18,.012,520,'bandpass');}},6500)}
startAmbientSfx();
function syncHudDetails(){const wrap=root.querySelector('#hudExtra'),btn=root.querySelector('#hudToggleBtn');if(wrap)wrap.classList.toggle('hidden',!hudDetails);root.querySelectorAll('.hud-detail').forEach(el=>el.classList.toggle('hidden',!hudDetails));if(btn)btn.textContent=hudDetails?'ℹ️ Meno info':'ℹ️ Più info'}
function renderHub(){
 root.querySelector('#bank').textContent=bank;renderProgress();root.querySelector('#deckCount').textContent=deck.size;root.querySelector('#hubMsg').textContent=firstRun?'Una run, cinque piani. Più scendi, più vale l’estrazione.':'Scegli fino a 5 carte. La profondità sblocca nuovi ranghi del Negozio.';const frb=root.querySelector('#firstRunBanner');if(frb)frb.classList.toggle('hidden',!firstRun);const eb=root.querySelector('#enterBtn');if(eb)eb.textContent=firstRun?(mobileUI()?'🚪 Prima run':'🚪 Inizia la prima run'):'🚪 Entra';
 const slots=root.querySelector('#deckSlots'),ds=[...deck].map(card);slots.innerHTML='';for(let i=0;i<5;i++){const e=document.createElement('div'),c=ds[i];e.className='deck-slot';e.innerHTML=c?`<div>${iconHTML(cardIconKey(c.id),'icon-inline icon-lg')}</div><div class="deck-name">${c.name}</div>`:'＋';slots.appendChild(e)}
 const ob=root.querySelector('#ownedCards');ob.innerHTML='';if(!owned.size)ob.innerHTML='<div class="empty-note">Nessuna carta posseduta.</div>';CARDS.filter(c=>owned.has(c.id)).forEach(c=>{const b=document.createElement('button');b.type='button';b.disabled=firstRun;b.className='owned-card'+(deck.has(c.id)?' selected-card':'');b.innerHTML=iconHTML(cardIconKey(c.id),'icon-inline icon-md')+' '+c.name;b.onclick=()=>{if(firstRun)return;if(deck.has(c.id))deck.delete(c.id);else if(deck.size<5)deck.add(c.id);saveMeta();renderHub()};ob.appendChild(b)});
 const tabs=root.querySelector('#shopTabs');tabs.innerHTML='';[['explore','Esplora'],['combat','Combatti'],['weapon','Armi'],['wealth','Oro']].forEach(([id,l])=>{const b=document.createElement('button');b.type='button';b.className='shop-tab'+(shopCat===id?' tab-on':'');b.innerHTML=iconHTML(CAT_ICON[id],'icon-inline icon-md')+' '+l;b.onclick=()=>{playSfx('ui');shopCat=id;renderHub()};tabs.appendChild(b)});
 const currentRank=shopRankForDepth(),rankStatus=root.querySelector('#shopRankStatus');if(rankStatus){const next=currentRank<4?currentRank+1:null;rankStatus.innerHTML=`<strong>Negozio · Rango ${ROMAN_RANK[currentRank]}</strong><span>${next?'Prossimo rango: raggiungi il Piano '+next:'Rango massimo sbloccato'}</span>`}
 const sh=root.querySelector('#shop');sh.innerHTML='';const catLabel={explore:'Esplorazione',combat:'Combattimento',weapon:'Armi',wealth:'Ricchezza'};CARDS.filter(c=>c.cat===shopCat).forEach(c=>{const rank=cardRank(c.id),unlocked=rank<=currentRank||owned.has(c.id),w=document.createElement('div');w.className='shop-item'+(!unlocked?' shop-locked':'');w.innerHTML=`<div class="shop-card-top"><div class="shop-icon">${iconHTML(cardIconKey(c.id),'icon-inline icon-xl')}</div><div class="shop-meta"><div class="shop-title">${c.name}</div><div class="shop-cat">${catLabel[c.cat]||c.cat} · Rango ${ROMAN_RANK[rank]}</div></div></div><div class="shop-desc">${c.text}</div><div class="shop-foot"><div class="shop-price">$ ${c.cost}</div><div class="shop-requirement">${unlocked?'Disponibile':rankRequirement(rank)}</div></div>`;const b=document.createElement('button');b.type='button';b.className='shop-action';if(owned.has(c.id)){w.classList.add('shop-owned');b.textContent='✓ Posseduta';b.disabled=true}else if(!unlocked){b.textContent='🔒 '+rankRequirement(rank);b.disabled=true}else if(bank<c.cost){b.textContent='Oro insufficiente';b.disabled=true}else{b.textContent='Compra';b.onclick=()=>{playSfx('pickup');bank-=c.cost;owned.add(c.id);saveMeta();renderHub()}}w.appendChild(b);sh.appendChild(w)})
}
function blank(){return Array.from({length:WORLD},()=>Array(WORLD).fill('#'))}function overlap(a,b){return a.x-1<b.x+b.w&&a.x+a.w+1>b.x&&a.y-1<b.y+b.h&&a.y+a.h+1>b.y}function carve(m,r){for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)m[y][x]='.'}function corridor(m,a,b){let x=a.x,y=a.y;while(x!==b.x){m[y][x]='.';x+=x<b.x?1:-1}while(y!==b.y){m[y][x]='.';y+=y<b.y?1:-1}m[y][x]='.'}
function tierFor(f){const t=[[['green',70],['blue',25],['yellow',5]],[['green',40],['blue',45],['yellow',15]],[['green',15],['blue',50],['yellow',30],['red',5]],[['blue',35],['yellow',45],['red',20]],[['blue',20],['yellow',45],['red',30],['purple',5]]][f-1];let r=Math.random()*100,n=0;for(const[k,p]of t){n+=p;if(r<=n)return k}return t[0][0]}
function makeEnemy(x,y,tier,role=null,floorOverride=null){const floor=floorOverride||s?.floor||1,tn=tier||tierFor(floor),t=TIERS[tn],family=choice(Object.keys(F)),hp=rand(t.hp[0],t.hp[1]),depthMin=floor>=5?1:0,depthMax=floor>=4?1:0;return{id:enemyCounter++,x,y,tier:tn,family,hp,maxHp:hp,min:t.dmg[0]+depthMin,max:t.dmg[1]+depthMax,vision:t.vision,role:role||roleForFloor(floor),called:false,roleTick:0,stunned:false,facing:choice(Object.keys(DIR)),state:'idle',search:0,lastSeen:null,patrol:rand(0,2)}}
function makeBoss(x,y,kind){if(kind==='mini'){const e=makeEnemy(x,y,'red','boss');Object.assign(e,{boss:true,bossKind:'mini',role:'boss',name:'Custode del Terzo Piano',hp:78,maxHp:78,min:8,max:12,vision:6,family:'hammer',turns:0,armored:false});return e}const e=makeEnemy(x,y,'purple','boss');Object.assign(e,{boss:true,bossKind:'final',role:'boss',name:'Signore del Profondo',hp:150,maxHp:150,min:13,max:19,vision:7,family:'sword',turns:0,telegraph:false,phase:1});return e}
function floorBoss(){return s?s.enemies.find(e=>e.boss&&e.hp>0)||null:null}
function bossAlive(){return !!floorBoss()}
function bossAtFloor(floor){return floor===3?'mini':floor===5?'final':null}
function roomContains(r,p){return p.x>=r.x&&p.x<r.x+r.w&&p.y>=r.y&&p.y<r.y+r.h}
function roomAt(x,y){return (s.specialRooms||[]).find(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h)||null}
function enterSpecialRoom(){const r=roomAt(s.player.x,s.player.y);if(!r||r.entered)return;r.entered=true;playSfx('roomEnter');s.stats.specialRooms++;meta.specialRooms++;saveMeta();const d=SPECIAL_ROOMS[r.type],roomName=r.label||d.name;log(d.icon+' Entri in: '+roomName+'.');showToast(d.icon+' '+roomName);showThresholdDialogue('room',s.player.x,s.player.y);if(r.type==='sanctuary'){s.alarm=Math.max(0,s.alarm-10);s.instability=Math.max(0,s.instability-8);log('✦ Santuario: -10 Allarme, -8 Instabilità.')}if(r.type==='infirmary'){const gained=healPlayer(6);if(gained)log('🧪 Infermeria: +'+gained+' HP.')}}
function nearbyFree(x,y){const spots=[];for(let r=1;r<=4;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.abs(dx)+Math.abs(dy)!==r)continue;const nx=x+dx,ny=y+dy;if(nx>0&&ny>0&&nx<WORLD-1&&ny<WORLD-1&&s.map[ny]?.[nx]!=='#'&&!occupiedForSpawn(nx,ny))spots.push({x:nx,y:ny})}return spots.length?choice(spots):freeSpot(2)}
function dangerEliteProfile(floor){const profiles={2:{tier:'yellow',hp:1.10,dmg:.95,alarm:10,reward:70,label:'Alta'},3:{tier:'red',hp:.95,dmg:.90,alarm:12,reward:85,label:'Alta'},4:{tier:'red',hp:1.10,dmg:.95,alarm:12,reward:100,label:'Molto alta'},5:{tier:'purple',hp:.90,dmg:.85,alarm:15,reward:115,label:'Estrema'}};return profiles[floor]||profiles[5]}
function dangerEliteActive(){const id=s?.dangerDoor?.enemyId;return !!(id&&s.enemies.some(e=>e.id===id&&e.hp>0))}
function openDangerDoor(){playSfx('door');const dd=s.dangerDoor;if(!dd||dd.used||dd.declined)return;s.eventOpen=true;s.dangerOpen=true;const panel=root.querySelector('#dangerPanel'),box=root.querySelector('#dangerChoices'),prof=dangerEliteProfile(s.floor),base=TIERS[prof.tier],hpMin=Math.round(base.hp[0]*prof.hp),hpMax=Math.round(base.hp[1]*prof.hp);panel.classList.remove('hidden');box.innerHTML='';root.querySelector('#dangerText').textContent=`Sfida ${prof.label}: élite da circa ${hpMin}-${hpMax} HP · +${prof.alarm} Allarme. Finché l’élite è viva, l’Allarme non richiama altri nemici. Ricompensa: ${prof.reward} oro + arma di livello massimo.`;const accept=document.createElement('button');accept.type='button';accept.className='primary';accept.textContent='⚔️ Accetta la sfida';accept.onclick=()=>{const p=nearbyFree(dd.x,dd.y);if(!p){log('⚠️ Nessuno spazio libero per generare l’élite.');showToast('⚠️ Sfida non avviata');return}dd.used=true;s.eventOpen=false;s.dangerOpen=false;panel.classList.add('hidden');const e=makeEnemy(p.x,p.y,prof.tier,'patrol');e.hp=Math.round(e.hp*prof.hp);e.maxHp=e.hp;const eliteBase=TIERS[prof.tier].dmg;e.min=Math.max(1,Math.round(eliteBase[0]*prof.dmg));e.max=Math.max(e.min,Math.round(eliteBase[1]*prof.dmg));e.dangerElite=true;e.name='Élite della Porta';e.state='suspicious';e.lastSeen={x:s.player.x,y:s.player.y};e.search=3;dd.enemyId=e.id;dd.reward=prof.reward;s.enemies.push(e);s.alarm=Math.min(100,s.alarm+prof.alarm);log(`🚪 La Porta Pericolosa libera un’élite (${e.hp} HP). I rinforzi da Allarme restano sospesi finché è viva.`);showToast('⚠️ SFIDA ATTIVA · '+e.hp+' HP');updateVisibility();render();root.focus()};const leave=document.createElement('button');leave.type='button';leave.textContent='🚶 Lasciala chiusa';leave.onclick=()=>{dd.declined=true;s.eventOpen=false;s.dangerOpen=false;panel.classList.add('hidden');log('🚪 Hai ignorato la Porta Pericolosa.');render();root.focus()};box.append(accept,leave);render()}
function rewardDangerElite(e){const dd=s.dangerDoor;if(!dd||dd.rewarded||dd.enemyId!==e.id)return;dd.rewarded=true;meta.dangerWins++;saveMeta();const reward=(dd.reward||dangerEliteProfile(s.floor).reward)+(has('bounty')?25:0),g=addGold(reward,true),family=choice(Object.keys(F)),id=POOLS[family][3];if(s.inventory.length<maxInv())s.inventory.push(weaponItem(id));else{s.loot.push({x:e.x,y:e.y,kind:'weapon',id,seen:true})}log('🚪 Sfida completata: +'+g+' oro e '+W[id].name+'.');showToast('🏆 PORTA COMPLETATA · +'+g+' ORO')}
function weaponFor(f,floor){const p=POOLS[f],maxIdx=floor<=1?1:floor===2?2:3,minIdx=floor>=5?2:floor>=3?1:0;return p[rand(minIdx,maxIdx)]}
function chooseMissions(){const p=[...MISSIONS],out=[];while(out.length<3&&p.length)out.push({...p.splice(rand(0,p.length-1),1)[0],done:false});return out}
function generateFloor(floor){
 const map=blank(),rooms=[];let tries=0,targetRooms=9+floor,progressionGate=null,firstHalfRooms=null,secondHalfRooms=null,layoutStyle=pickLayoutStyle(floor);
 if(floor>=4){
   const barrierX=Math.floor(WORLD/2),leftTarget=Math.ceil(targetRooms/2),rightTarget=targetRooms-leftTarget,left=[],right=[];
   const placeSide=(arr,count,minCell,maxCell)=>{let localTries=0;while(arr.length<count&&localTries++<5000){const r={w:rand(5,8),h:rand(4,8)};const maxStart=maxCell-r.w+1;if(maxStart<minCell)continue;r.x=rand(minCell,maxStart);r.y=rand(1,WORLD-r.h-2);if(rooms.some(q=>overlap(r,q)))continue;r.cx=Math.floor(r.x+r.w/2);r.cy=Math.floor(r.y+r.h/2);arr.push(r);rooms.push(r);carve(map,r)}};
   placeSide(left,leftTarget,1,barrierX-2);placeSide(right,rightTarget,barrierX+2,WORLD-2);
   connectRoomSet(map,left,layoutStyle);connectRoomSet(map,right,layoutStyle);
   if(!left.length||!right.length){throw new Error('Impossibile generare le due metà del dungeon')}
   const leftBridge=left.reduce((best,r)=>r.cx>best.cx?r:best,left[0]),rightBridge=right.reduce((best,r)=>r.cx<best.cx?r:best,right[0]);
   const gateY=Math.max(2,Math.min(WORLD-3,Math.round((leftBridge.cy+rightBridge.cy)/2)));
   corridor(map,{x:leftBridge.cx,y:leftBridge.cy},{x:barrierX-1,y:gateY});corridor(map,{x:barrierX+1,y:gateY},{x:rightBridge.cx,y:rightBridge.cy});map[gateY][barrierX]='.';
   progressionGate={x:barrierX,y:gateY,progression:true};firstHalfRooms=left;secondHalfRooms=right;
 }else{
   while(rooms.length<targetRooms&&tries++<900){const r={w:rand(5,10),h:rand(4,9)};r.x=rand(1,WORLD-r.w-2);r.y=rand(1,WORLD-r.h-2);if(rooms.some(q=>overlap(r,q)))continue;r.cx=Math.floor(r.x+r.w/2);r.cy=Math.floor(r.y+r.h/2);rooms.push(r);carve(map,r)}
   connectRoomSet(map,rooms,layoutStyle);
 }
 const gateRef=progressionGate||{x:rooms[0]?.cx||1,y:rooms[0]?.cy||1};
 const start=floor>=4?firstHalfRooms.reduce((best,r)=>dist(r,gateRef)>dist(best,gateRef)?r:best,firstHalfRooms[0]):rooms.reduce((best,r)=>r.cx<best.cx?r:best,rooms[0]);
 const far=floor>=4?secondHalfRooms.reduce((best,r)=>dist(r,gateRef)>dist(best,gateRef)?r:best,secondHalfRooms[0]):rooms.reduce((best,r)=>dist({x:start.cx,y:start.cy},{x:r.cx,y:r.cy})>dist({x:start.cx,y:start.cy},{x:best.cx,y:best.cy})?r:best,rooms[0]);
 const player={x:start.cx,y:start.cy,facing:'up'},stairs={x:far.cx,y:far.cy};map[stairs.y][stairs.x]='>';
 const open=[];for(let y=1;y<WORLD-1;y++)for(let x=1;x<WORLD-1;x++)if(map[y][x]==='.')open.push({x,y});
 const used=new Set([K(player.x,player.y),K(stairs.x,stairs.y)]);if(progressionGate)used.add(K(progressionGate.x,progressionGate.y));
 const reserve=p=>{if(!p)return null;used.add(K(p.x,p.y));return p};
 const spot=min=>{for(let i=0;i<300;i++){const p=choice(open);if(p&&!used.has(K(p.x,p.y))&&dist(p,player)>=min)return reserve(p)}return null};
 const roomSpot=(r,min=0)=>{if(!r)return spot(min);const candidates=[];for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++)if(map[y][x]==='.'&&!used.has(K(x,y))&&dist({x,y},player)>=min)candidates.push({x,y});return candidates.length?reserve(choice(candidates)):spot(min)};
 const sideRoomSpot=(r,sideRooms,min=0)=>{const collect=rs=>{const candidates=[];for(const rr of rs||[])for(let y=rr.y+1;y<rr.y+rr.h-1;y++)for(let x=rr.x+1;x<rr.x+rr.w-1;x++)if(map[y][x]==='.'&&!used.has(K(x,y))&&dist({x,y},player)>=min)candidates.push({x,y});return candidates};const primary=r?collect([r]):[];if(primary.length)return reserve(choice(primary));const side=collect(sideRooms);return side.length?reserve(choice(side)):null};
 const specialRooms=buildThematicSpecialRooms(floor,rooms,start,far,progressionGate);
 const enemies=[],loot=[],coins=[],chests=[],traps=[],artifactDrops=[];
 for(const sr of specialRooms){
   if(sr.type==='armory'){for(let i=0;i<2;i++){const p=roomSpot(sr,2);if(p){const f=choice(Object.keys(F));loot.push({x:p.x,y:p.y,kind:'weapon',id:weaponFor(f,Math.min(5,floor+1))})}}}
   if(sr.type==='treasury'){for(let i=0;i<3;i++){const p=roomSpot(sr,2);if(p)coins.push({x:p.x,y:p.y,value:rand(20,35+floor*7)})}const p=roomSpot(sr,2);if(p)chests.push({x:p.x,y:p.y,opened:false,bonus:20})}
   if(sr.type==='infirmary'){for(let i=0;i<2;i++){const p=roomSpot(sr,2);if(p)loot.push({x:p.x,y:p.y,kind:'heal',id:i?'large':'small'})}}
   if(sr.type==='guardroom'){for(let i=0;i<2;i++){const p=roomSpot(sr,4),role=i===0?'sentry':floor>=3?'caller':'patrol',guardTier=floor===1?'blue':floor>=4?'red':'yellow';if(p)enemies.push(makeEnemy(p.x,p.y,guardTier,role,floor))}const p=roomSpot(sr,2);if(p)coins.push({x:p.x,y:p.y,value:rand(25,45)})}
 }
 for(let i=0;i<6+floor*2;i++){const p=spot(5);if(p)enemies.push(makeEnemy(p.x,p.y,null,null,floor))}
 const bossKind=bossAtFloor(floor);if(bossKind){const bp=roomSpot(far,5)||spot(5);if(bp){const boss=makeBoss(bp.x,bp.y,bossKind);boss.arena={x:far.x,y:far.y,w:far.w,h:far.h};enemies.push(boss)}}
 for(const family of Object.keys(F)){const p=spot(2);if(p)loot.push({x:p.x,y:p.y,kind:'weapon',id:weaponFor(family,floor)})}
 for(let i=0;i<1;i++){const p=spot(2),family=choice(Object.keys(F));if(p)loot.push({x:p.x,y:p.y,kind:'weapon',id:weaponFor(family,Math.min(5,floor+1))})}
 const healId=()=>Math.random()<.7?'small':'large';
 if(floor<4){
   const healCount=(floor===1?2:3)+(has('quartermaster')?1:0);
   for(let i=0;i<healCount;i++){const p=spot(2);if(p)loot.push({x:p.x,y:p.y,kind:'heal',id:healId()})}
 }else{
   const sideHeal=(sideRooms,count)=>{for(let i=0;i<count;i++){const pool=(sideRooms||[]).filter(Boolean),r=pool.length?choice(pool):null,p=r?roomSpot(r,2):spot(2);if(p)loot.push({x:p.x,y:p.y,kind:'heal',id:healId()})}};
   sideHeal(firstHalfRooms,2+(has('quartermaster')?1:0));
   sideHeal(secondHalfRooms,2);
 }
 // Torce portatili: risorsa separata dallo zaino. Il P1 ne insegna sempre una; più in profondità possono comparirne anche due.
 // Le torce non compaiono più come pickup a terra: si staccano direttamente dai supporti a muro.
 const coinPlan={1:{count:5,min:18,max:50},2:{count:6,min:20,max:53},3:{count:6,min:22,max:70},4:{count:7,min:24,max:72},5:{count:7,min:26,max:89}}[floor];
 for(let i=0;i<coinPlan.count;i++){const p=spot(2);if(p)coins.push({x:p.x,y:p.y,value:rand(coinPlan.min,coinPlan.max)})}
 for(let i=chests.length;i<2+(has('treasureMap')?1:0);i++){const p=spot(4);if(p)chests.push({x:p.x,y:p.y,opened:false})}
 for(let i=0;i<2+floor;i++){const p=spot(3);if(p)traps.push({x:p.x,y:p.y,triggered:false,revealed:false})}
 let rareEvent=null;const chained=dueChainForFloor(floor);if(chained){const p=spot(4);if(p)rareEvent={x:p.x,y:p.y,type:chained.type,chainKey:chained.key,used:false}}else if(Math.random()<.65){const p=spot(4);if(p)rareEvent={x:p.x,y:p.y,type:randomBaseEventType(floor),used:false}}
 let keyPuzzle=null;
 const puzzleRoom=floor>=4?null:choice(rooms.filter(r=>r!==start&&r!==far));
 const puzzleDoor=progressionGate?{...progressionGate}:puzzleRoom?roomSpot(puzzleRoom,6):spot(8);
 const rewardForFloor={1:{gold:45,weapon:false,heal:'small'},2:{gold:65,weapon:true,heal:'small'},3:{gold:90,weapon:true,heal:'large'},4:{gold:125,weapon:true,heal:'large'},5:{gold:180,weapon:true,heal:'large'}}[floor];
 if(puzzleDoor){
   keyPuzzle={floor,type:'simple',mandatory:floor>=4,door:{x:puzzleDoor.x,y:puzzleDoor.y,open:false,claimed:false,seen:false,progression:floor>=4},key:null,tablet:null,decoder:null,shrine:null,anchor:null,route:null,routeProgress:0,routeActive:false,waits:0,sigils:[],sigilProgress:0,finalSeal:null,keyFound:false,reward:rewardForFloor};
   if(floor===1){const p=spot(5);if(p)keyPuzzle.key={x:p.x,y:p.y,available:true,seen:false};}
   if(floor===2){keyPuzzle.type='plain';keyPuzzle.tablet=spot(4);keyPuzzle.shrine=spot(9);}
   if(floor===3){
     keyPuzzle.type='route';
     const findRoute=anchor=>{const seen=new Set([K(anchor.x,anchor.y)]),route=[];const dfs=(x,y,depth)=>{if(depth===5)return true;const opts=Object.entries(DIR).filter(([n,d])=>{const nx=x+d.x,ny=y+d.y,k=K(nx,ny);return map[ny]?.[nx]==='.'&&!(nx===stairs.x&&ny===stairs.y)&&!(nx===keyPuzzle.door.x&&ny===keyPuzzle.door.y)&&!used.has(k)&&!seen.has(k)}).sort(()=>Math.random()-.5);for(const [n,d] of opts){const nx=x+d.x,ny=y+d.y,k=K(nx,ny);seen.add(k);route.push(n);if(dfs(nx,ny,depth+1))return true;route.pop();seen.delete(k)}return false};return dfs(anchor.x,anchor.y,0)?route.slice():null};
     const candidates=open.filter(p=>!used.has(K(p.x,p.y))&&dist(p,player)>=5).sort(()=>Math.random()-.5);let chosen=null,route=null;for(const a of candidates){const r=findRoute(a);if(r){chosen=a;route=r;break}}
     if(chosen&&route){keyPuzzle.anchor=reserve({x:chosen.x,y:chosen.y});keyPuzzle.tablet=keyPuzzle.anchor;keyPuzzle.route=route;let cur={x:chosen.x,y:chosen.y};for(const n of route){const d=DIR[n];cur={x:cur.x+d.x,y:cur.y+d.y};used.add(K(cur.x,cur.y))}}
   }
   if(floor===4){
     keyPuzzle.type='runes';
     const gate=progressionGate||gateRef,pr=[...(firstHalfRooms||rooms)].filter(r=>r!==start).sort((a,b)=>dist(b,gate)-dist(a,gate));
     const early=pr[0]||start,mid=pr[Math.floor(pr.length/2)]||early,nearGate=pr[pr.length-1]||mid;
     keyPuzzle.tablet=sideRoomSpot(early,firstHalfRooms,0);
     keyPuzzle.decoder=sideRoomSpot(mid,firstHalfRooms,0);
     keyPuzzle.shrine=sideRoomSpot(nearGate,firstHalfRooms,0);
   }
   if(floor===5){
     keyPuzzle.type='sequence';
     const gate=progressionGate||gateRef,pr=[...(firstHalfRooms||rooms)].filter(r=>r!==start).sort((a,b)=>dist(b,gate)-dist(a,gate));
     const at=i=>pr[Math.max(0,Math.min(pr.length-1,i))]||start;
     keyPuzzle.tablet=sideRoomSpot(at(0),firstHalfRooms,0);
     keyPuzzle.decoder=sideRoomSpot(at(Math.min(1,pr.length-1)),firstHalfRooms,0);
     const names=[['LUNA','☾'],['LAMA','†'],['OCCHIO','◉']];
     const sigilIdx=[Math.min(2,pr.length-1),Math.min(3,pr.length-1),Math.max(0,pr.length-1)],sigilRooms=[];
     for(const idx of sigilIdx){const r=at(idx);if(r&&!sigilRooms.includes(r))sigilRooms.push(r)}
     for(const r of pr)if(sigilRooms.length<3&&!sigilRooms.includes(r))sigilRooms.push(r);
     for(let i=0;i<names.length;i++){const [name,icon]=names[i],rp=sigilRooms[i]||at(i+2),p=sideRoomSpot(rp,firstHalfRooms,0);if(p)keyPuzzle.sigils.push({x:p.x,y:p.y,name,icon,seen:false})}
     const gateApproach={x:gate.x-1,y:gate.y};
     keyPuzzle.finalSeal=(map[gateApproach.y]?.[gateApproach.x]==='.'&&!used.has(K(gateApproach.x,gateApproach.y)))?reserve(gateApproach):sideRoomSpot(at(pr.length-1),firstHalfRooms,0);
   }
 }
 
 /* Artefatti: pochi, importanti, indipendenti dallo zaino. */
 if(Math.random()<.72){const p=spot(4);if(p)artifactDrops.push({x:p.x,y:p.y,id:randomArtifactId(),seen:false})}

 /* Segreti: una parete realmente chiusa nasconde una piccola nicchia. Avvicinandoti compaiono crepe. */
 const secrets=[],secretTarget=floor>=4?2:1;
 for(let n=0;n<secretTarget;n++){
   let made=false;
   for(let tries=0;tries<700&&!made;tries++){
     const base=choice(open),d=choice(Object.values(DIR));if(!base||used.has(K(base.x,base.y)))continue;
     const dx=base.x+d.x,dy=base.y+d.y,ix=base.x+d.x*2,iy=base.y+d.y*2;
     if(ix<=1||iy<=1||ix>=WORLD-2||iy>=WORLD-2)continue;
     if(map[dy]?.[dx]!=='#'||map[iy]?.[ix]!=='#')continue;
     const sideNeighbors=Object.values(DIR).map(v=>({x:ix+v.x,y:iy+v.y})).filter(q=>!(q.x===dx&&q.y===dy));
     if(sideNeighbors.some(q=>map[q.y]?.[q.x]!=='#'))continue;
     if(progressionGate){const gx=progressionGate.x,baseSide=base.x<gx?-1:base.x>gx?1:0,insideSide=ix<gx?-1:ix>gx?1:0,doorSide=dx<gx?-1:dx>gx?1:0;if(!baseSide||!insideSide||!doorSide||baseSide!==insideSide||doorSide!==baseSide)continue;if(dx===progressionGate.x&&dy===progressionGate.y)continue}
     map[iy][ix]='.';used.add(K(dx,dy));used.add(K(ix,iy));
     const sec={x:dx,y:dy,insideX:ix,insideY:iy,opened:false,seen:false};
     secrets.push(sec);artifactDrops.push({x:ix,y:iy,id:randomArtifactId(),seen:false,secret:true});made=true;
   }
 }

 /* Meccanismo alla Hexen: una leva modifica una zona lontana del piano. */
 let mechanism=null;
 if(floor>=2){const sw=spot(5),cache=spot(8);if(sw&&cache)mechanism={switch:{x:sw.x,y:sw.y,seen:false},cache:{x:cache.x,y:cache.y,seen:false},activated:false}}

 let dangerDoor=null;if(floor>=2){const p=spot(5);if(p)dangerDoor={x:p.x,y:p.y,used:false,declined:false,rewarded:false,enemyId:null}}
 const torches=buildTorchSet(rooms,map,start,far,progressionGate,floor);
 return{map,rooms,player,stairs,open,enemies,loot,coins,chests,traps,artifactDrops,secrets,mechanism,startPos:{x:player.x,y:player.y},rareEvent,dangerDoor,keyPuzzle,specialRooms,torches,theme:dungeonThemeForFloor(floor),layoutStyle,seen:new Set(),visible:new Set(),_visionOverlayCache:null,_v18Layer2Decor:null,_v18WallShields:null}
}

function startRun(){closeThresholdDialogue();closeMobileSheet();playSfx('start');const active=firstRun?new Set():new Set(deck),baseHp=resilienceMaxHp();s={floor:1,hp:baseHp,maxHp:baseHp,resilienceHpStart:baseHp,steps:0,kills:0,runCoins:0,alarm:0,instability:0,alarmStage:0,instStage:0,equippedUid:null,inventory:[],artifactBelt:[],artifactBuffs:{stone:0,blood:0,power:0},artifactUsedThisTurn:false,deck:active,buffs:new Set(),guard:false,riposteReady:false,atStairs:false,eventOpen:false,dangerOpen:false,rewardOpen:false,targetMode:false,targetIds:[],targetIndex:0,survivorUsed:false,fx:[],ambushId:null,floorAlerted:false,floorStealthCounted:false,discoveredRoles:new Set(),chains:{},stats:{backstabs:0,chests:0,goldCollected:0,axeKills:0,spearKills:0,hammerStuns:0,stealthFloors:0,specialRooms:0,minibossKills:0,bossKills:0},portableTorches:0,torchStepsRemaining:0,torchLightLevel:TORCH_START_LIGHT,_physicalThresholdCount:0,_darkThresholds:new Set(),missions:chooseMissions()};s.objectivesAtStart=new Set(OBJECTIVES.filter(o=>o.get(meta)>=o.target).map(o=>o.id));const starter=weaponItem('rustySword');s.inventory.push(starter,{kind:'heal',id:'small'});s.equippedUid=starter.uid;Object.assign(s,generateFloor(1));v18RoomDecor();initAmbientRoutines();root.querySelector('#welcome').classList.add('hidden');root.querySelector('#hub').classList.add('hidden');root.querySelector('#runSummary').classList.add('hidden');root.querySelector('#game').classList.remove('hidden');root.querySelector('#stairsPanel').classList.add('hidden');root.querySelector('#rewardPanel').classList.add('hidden');root.querySelector('#eventPanel').classList.add('hidden');root.querySelector('#puzzlePanel').classList.add('hidden');root.querySelector('#targetPanel').classList.add('hidden');root.querySelector('#log').innerHTML='';applyCartographer();applyPathfinder();updateVisibility();log('🚪 La run comincia.');log('🗝️ In questo piano è nascosta una Camera della Soglia opzionale.');render();showFloorSplash();if(!guideSeen)setTimeout(()=>openGuide(),350);root.focus()}
function applyCartographer(){if(!has('cartographer'))return;const r=choice(s.rooms.slice(1));if(!r)return;for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)s.seen.add(K(x,y));log('🗺️ Cartografo rivela una stanza.')}
function applyPathfinder(){if(!has('pathfinder')||!s?.stairs)return;s.seen.add(K(s.stairs.x,s.stairs.y));if(s.keyPuzzle?.door?.mandatory)s.keyPuzzle.door.seen=true;log('🧭 Bussola spezzata: le scale sono segnate sulla mappa.')}
function inBounds(x,y){return x>=0&&y>=0&&x<WORLD&&y<WORLD}
function isWall(x,y){const pd=s?.keyPuzzle?.door;return !inBounds(x,y)||s.map[y][x]==='#'||!!(pd&&!pd.open&&x===pd.x&&y===pd.y)||!!v18SolidDecorationAt(x,y)}
function visionRadius(){return (s.instability>=75?4:6)+(has('farsight')?1:0)}
function supercoverLine(x0,y0,x1,y1){
  const pts=[{x:x0,y:y0}],dx=x1-x0,dy=y1-y0,nx=Math.abs(dx),ny=Math.abs(dy),sx=dx===0?0:(dx>0?1:-1),sy=dy===0?0:(dy>0?1:-1);
  let x=x0,y=y0,ix=0,iy=0;
  while(ix<nx||iy<ny){
    const lhs=(1+2*ix)*ny,rhs=(1+2*iy)*nx;
    if(lhs===rhs){x+=sx;y+=sy;ix++;iy++}
    else if(lhs<rhs){x+=sx;ix++}
    else{y+=sy;iy++}
    pts.push({x,y});
  }
  return pts;
}
function hasLineOfSight(ax,ay,bx,by){
  if(!inBounds(ax,ay)||!inBounds(bx,by))return false;
  const pts=supercoverLine(ax,ay,bx,by);
  for(let i=1;i<pts.length;i++){
    const prev=pts[i-1],p=pts[i],sx=p.x-prev.x,sy=p.y-prev.y;
    if(sx!==0&&sy!==0&&isWall(prev.x+sx,prev.y)&&isWall(prev.x,prev.y+sy))return false;
    if(i<pts.length-1&&isWall(p.x,p.y))return false;
  }
  return true;
}
function updateVisibility(){
  s.visible=new Set();
  const r=visionRadius();
  for(let y=s.player.y-r;y<=s.player.y+r;y++)for(let x=s.player.x-r;x<=s.player.x+r;x++){
    if(!inBounds(x,y))continue;
    const dx=x-s.player.x,dy=y-s.player.y;
    if(Math.hypot(dx,dy)>r+.2)continue;
    if(hasLineOfSight(s.player.x,s.player.y,x,y)){const key=K(x,y);s.visible.add(key);s.seen.add(key)}
  }
  {const key=K(s.player.x,s.player.y);s.visible.add(key);s.seen.add(key)};
  if(has('sense'))for(const t of s.traps)if(dist(t,s.player)<=2&&hasLineOfSight(s.player.x,s.player.y,t.x,t.y))t.revealed=true;
  rememberVisibleObjects();
}
function rememberVisibleObjects(){
 const remember=o=>{if(o&&s.visible.has(K(o.x,o.y)))o.seen=true};const announce=(o,msg,toast)=>{if(!o||!s.visible.has(K(o.x,o.y)))return;const fresh=!o.seen;o.seen=true;if(fresh&&!o.announced){o.announced=true;if(msg)log(msg);if(toast)showToast(toast)}};
 for(const o of s.coins)remember(o);for(const o of s.loot)remember(o);for(const o of s.artifactDrops||[])remember(o);for(const o of s.chests)remember(o);for(const o of s.traps)remember(o);for(const q of s.secrets||[]){if(!q.opened&&s.visible.has(K(q.x,q.y))&&dist(q,s.player)<=2&&!q.seen){q.seen=true;log('≋ Noti crepe innaturali nella parete. Prova a spingerti contro.');showToast('≋ MURO SOSPETTO')}}const mech=s.mechanism;if(mech){announce(mech.switch,'⚙️ Hai individuato una leva antica. Azionala camminandoci sopra.','⚙️ LEVA INDIVIDUATA');if(mech.activated)remember(mech.cache)}for(const e of s.enemies){remember(e);if(!e.boss&&e.seen&&e.role)s.discoveredRoles?.add(e.role)}remember(s.rareEvent);remember(s.dangerDoor);const p=s.keyPuzzle;if(p){if(p.floor===1)announce(p.key,'🗝️ Hai individuato la Chiave della Soglia: camminaci sopra per raccoglierla automaticamente.','🗝️ CHIAVE INDIVIDUATA');announce(p.door,p.mandatory?'🚪 Hai individuato il Varco Centrale: è il passaggio obbligatorio verso la seconda metà.':'🚪 Hai individuato la Camera della Soglia. Finché è chiusa devi completare la Soglia del piano.',p.door?.open?'🚪 PORTA APERTA':'🔒 PORTA INDIVIDUATA');announce(p.tablet,'🗿 Hai individuato una Stele/Iscrizione: camminaci sopra per leggerla.','🗿 STELE INDIVIDUATA');announce(p.decoder,'📜 Hai individuato la Tavola delle Rune: camminaci sopra per consultarla.','📜 DECODER INDIVIDUATO');announce(p.shrine,'◇ Hai individuato il Sigillo dorato: è parte del rituale della Soglia.','◇ SIGILLO INDIVIDUATO');remember(p.anchor);remember(p.finalSeal);for(const q of p.sigils||[])announce(q,'✦ Hai individuato il Sigillo '+q.name+'.',q.icon+' '+q.name)}
}
function effectiveEnemyVision(e){return e.vision+(s?.floor===5&&!e.boss?1:0)}
function enemyCanSeeTile(e,x,y){
  if(!inBounds(x,y))return false;
  const d=DIR[e.facing],dx=x-e.x,dy=y-e.y,forward=dx*d.x+dy*d.y,side=Math.abs(dx*d.y-dy*d.x),vision=effectiveEnemyVision(e);
  if(forward<=0||Math.hypot(dx,dy)>vision+.2||side>forward)return false;
  return hasLineOfSight(e.x,e.y,x,y);
}
function canSeePlayer(e){return enemyCanSeeTile(e,s.player.x,s.player.y)}
function faceToward(e,pos){const dx=pos.x-e.x,dy=pos.y-e.y;if(dx===0&&dy===0)return;if(Math.abs(dx)>=Math.abs(dy))e.facing=dx>=0?'right':'left';else e.facing=dy>=0?'down':'up'}function behindTile(e){const d=DIR[e.facing];return{x:e.x-d.x,y:e.y-d.y}}function isBehind(e){const b=behindTile(e);return s.player.x===b.x&&s.player.y===b.y}function daggerAdv(e){return F.dagger.beats.includes(e.family)}function behindFree(e){const b=behindTile(e);return b.x>=0&&b.y>=0&&b.x<WORLD&&b.y<WORLD&&s.map[b.y]?.[b.x]!=='#'&&!enemyAt(b.x,b.y,e.id)}function canBackstab(e){return eqWeapon().family==='dagger'&&e.hp>0&&e.state!=='alerted'&&daggerAdv(e)&&behindFree(e)&&dist(e,s.player)===1&&isBehind(e)}
function matchup(a,b){if(a==='unarmed'||a===b)return 1;if(F[a].beats.includes(b))return 1.35;return has('duelist')?0.85:0.65}function enemyMult(a,b){if(b==='unarmed'||a===b)return 1;if(F[a].beats.includes(b))return 1.2;return .8}function mastery(f){const id=f==='spear'?'spearMaster':f==='sword'?'swordMaster':f==='dagger'?'daggerMaster':f==='axe'?'axeMaster':'hammerMaster';return has(id)?1.15:1}
function setAlert(e){const changed=e.state!=='alerted';if(changed)s.floorAlerted=true;e.state='alerted';e.search=3;e.lastSeen={x:s.player.x,y:s.player.y};if(changed)burst('alert',e.x,e.y)}function setSuspicious(e,pos,turns=2){if(e.state==='alerted')return;const changed=e.state!=='suspicious';e.state='suspicious';e.search=Math.max(e.search,turns);e.lastSeen={x:pos.x,y:pos.y};if(changed)burst('suspicious',e.x,e.y)}function reactToHit(e){if(e.hp<=0)return;beginEnemyHit(e,s.player.x,s.player.y);setAlert(e);e.search=4;faceToward(e,s.player);log('❗ Il nemico si gira e va in Allerta.')}function makeNoise(radius){for(const e of s.enemies){if(e.hp<=0||e.state==='alerted')continue;if(dist(e,s.player)<=radius)setSuspicious(e,s.player,2)}}
function bossArenaContains(e,x,y){return !e.boss||!e.arena||(x>=e.arena.x&&x<e.arena.x+e.arena.w&&y>=e.arena.y&&y<e.arena.y+e.arena.h)}
function enemyTileBlocked(e,x,y){const pd=s?.keyPuzzle?.door;return !inBounds(x,y)||s.map[y]?.[x]==='#'||!!(pd&&!pd.open&&x===pd.x&&y===pd.y)||!!v18SolidDecorationAt(x,y)||!bossArenaContains(e,x,y)||!!enemyAt(x,y,e.id)||(x===s.player.x&&y===s.player.y)}
function nextStepToward(e,target){
 if(!target)return null;
 const dirs=Object.values(DIR),goals=[];
 if(!enemyTileBlocked(e,target.x,target.y))goals.push({x:target.x,y:target.y});
 else for(const d of dirs){const gx=target.x+d.x,gy=target.y+d.y;if(!enemyTileBlocked(e,gx,gy))goals.push({x:gx,y:gy})}
 if(!goals.length||goals.some(g=>g.x===e.x&&g.y===e.y))return null;
 const goalKeys=new Set(goals.map(g=>K(g.x,g.y))),q=[{x:e.x,y:e.y,first:null}],seen=new Set([K(e.x,e.y)]);
 for(let qi=0;qi<q.length;qi++){
  const cur=q[qi];
  for(const d of dirs){
   const nx=cur.x+d.x,ny=cur.y+d.y,key=K(nx,ny);if(seen.has(key)||enemyTileBlocked(e,nx,ny))continue;
   const first=cur.first||{x:nx,y:ny};if(goalKeys.has(key))return first;seen.add(key);q.push({x:nx,y:ny,first});
  }
 }
 return null
}
function stepToward(e,target){const p=nextStepToward(e,target);if(!p||enemyTileBlocked(e,p.x,p.y))return false;const ox=e.x,oy=e.y;faceToward(e,p);e.x=p.x;e.y=p.y;beginEnemyMove(e,ox,oy,e.x,e.y);return true}
function flankerTarget(e){const candidates=Object.values(DIR).map(d=>({x:s.player.x+d.x,y:s.player.y+d.y})).filter(p=>inBounds(p.x,p.y)&&s.map[p.y]?.[p.x]!=='#'&&!v18SolidDecorationAt(p.x,p.y)&&!enemyAt(p.x,p.y,e.id)&&(p.x!==s.player.x||p.y!==s.player.y));if(!candidates.length)return s.player;const approachX=Math.sign(e.x-s.player.x),approachY=Math.sign(e.y-s.player.y);const lateral=candidates.filter(p=>{const rx=p.x-s.player.x,ry=p.y-s.player.y;return rx*approachX+ry*approachY===0});const pool=lateral.length?lateral:candidates;return pool.sort((a,b)=>dist(e,a)-dist(e,b))[0]}
function callerAlarm(e){if(e.role!=='caller'||e.called)return;playSfx('alarm');e.called=true;s.alarm=Math.min(100,s.alarm+8);for(const other of s.enemies){if(other.id!==e.id&&other.hp>0&&other.state!=='alerted'&&dist(other,e)<=7)setSuspicious(other,s.player,3)}threatEvents();log('📯 Una Vedetta dà l’allarme: +8 Allarme.');showToast('📯 VEDETTA: +8 ALLARME')}
/* v17.1 — ambient AI: Pokémon-style calm routines, autonomous from player turns. */
const AMBIENT_AI_MS=850;
function ambientRoutineKind(e){
 if(e.role==='sentry')return Math.random()<.82?'look':'pace';
 if(e.role==='caller')return Math.random()<.62?'look':'pace';
 if(e.role==='hunter')return Math.random()<.62?'room':'pace';
 if(e.role==='flanker')return Math.random()<.58?'room':'wander';
 const r=Math.random();return r<.24?'look':r<.52?'pace':r<.82?'room':'wander'
}
function ambientRoomFor(e){return (s?.rooms||[]).find(r=>roomContains(r,e))||null}
function initEnemyAmbient(e){
 if(!e||e.boss)return null;
 const room=ambientRoomFor(e),kind=ambientRoutineKind(e);
 e.ambient={kind,wakeStep:(s?.steps||0)+rand(2,6),active:false,pauseTicks:rand(1,4),moveLeft:0,blocked:0,dir:e.facing,target:null,homeRoom:room?{x:room.x,y:room.y,w:room.w,h:room.h}:null};
 return e.ambient
}
function initAmbientRoutines(){if(!s)return;for(const e of s.enemies||[])if(e&&!e.boss&&!e.ambient)initEnemyAmbient(e)}
function ambientPaused(){
 if(!s||document.visibilityState!=='visible')return true;
 const game=root.querySelector('#game');if(!game||game.classList.contains('hidden'))return true;
 if(s.eventOpen||s.rewardOpen||s.atStairs||s.targetMode||guideOpen)return true;
 if(document.body.classList.contains('discreet-active'))return true;
 if(root.querySelector('#gameSideSheet')?.classList.contains('mobile-open'))return true;
 return false
}
function ambientOpenDirections(e){return Object.entries(DIR).filter(([,d])=>!enemyTileBlocked(e,e.x+d.x,e.y+d.y)).map(([k])=>k)}
function ambientChooseFacing(e,preferOpen=false){
 const pool=preferOpen?ambientOpenDirections(e):Object.keys(DIR);if(!pool.length)return false;
 e.facing=choice(pool);return true
}
function ambientRoomTarget(e,a){
 const r=a.homeRoom||ambientRoomFor(e);if(!r)return null;
 a.homeRoom={x:r.x,y:r.y,w:r.w,h:r.h};const candidates=[];
 for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++){
  if((x===e.x&&y===e.y)||s.map[y]?.[x]==='#'||v18SolidDecorationAt(x,y)||enemyAt(x,y,e.id)||(x===s.player.x&&y===s.player.y))continue;
  candidates.push({x,y})
 }
 return candidates.length?choice(candidates):null
}
function ambientMoveForward(e,a){
 const d=DIR[a.dir]||DIR[e.facing],nx=e.x+d.x,ny=e.y+d.y;e.facing=a.dir||e.facing;
 if(!enemyTileBlocked(e,nx,ny)){const ox=e.x,oy=e.y;e.x=nx;e.y=ny;beginEnemyMove(e,ox,oy,e.x,e.y);a.blocked=0;return true}
 a.blocked=(a.blocked||0)+1;return false
}
function ambientAct(e){
 if(!e||e.hp<=0||e.boss||e.state!=='idle')return false;
 const a=e.ambient||initEnemyAmbient(e);if(!a)return false;
 if(!a.active){if((s.steps||0)<a.wakeStep)return false;a.active=true;a.pauseTicks=rand(0,2);a.dir=e.facing;a.moveLeft=0}
 if(a.pauseTicks>0){a.pauseTicks--;return false}
 let changed=false;
 if(a.kind==='look'){
  /* Deliberately allow wall-facing moments: they are stealth/backstab opportunities. */
  changed=ambientChooseFacing(e,false);a.pauseTicks=rand(2,5)
 }else if(a.kind==='pace'){
  if(a.moveLeft<=0){a.moveLeft=rand(2,5);if(!a.dir)a.dir=e.facing}
  if(ambientMoveForward(e,a)){a.moveLeft--;changed=true}
  else{
   const d=DIR[a.dir]||DIR[e.facing],reverse=Object.entries(DIR).find(([,v])=>v.x===-d.x&&v.y===-d.y)?.[0];
   if(reverse&&!enemyTileBlocked(e,e.x+DIR[reverse].x,e.y+DIR[reverse].y)){a.dir=reverse;e.facing=reverse;a.blocked=0;changed=true}
   else{ambientChooseFacing(e,true);a.dir=e.facing;a.moveLeft=rand(1,3);changed=true}
  }
  if(a.moveLeft<=0){a.pauseTicks=rand(2,4);a.dir=e.facing}
 }else if(a.kind==='room'){
  if(!a.target||Math.abs(e.x-a.target.x)+Math.abs(e.y-a.target.y)===0)a.target=ambientRoomTarget(e,a);
  if(a.target){const moved=stepToward(e,a.target);if(moved){changed=true;a.blocked=0}else{a.blocked++;a.target=null;ambientChooseFacing(e,false);changed=true}}
  else{ambientChooseFacing(e,false);changed=true}
  if(a.blocked>=2){a.target=null;a.blocked=0;a.pauseTicks=rand(1,3)}
  else if(a.target&&e.x===a.target.x&&e.y===a.target.y){a.target=null;a.pauseTicks=rand(2,5)}
 }else{
  if(a.moveLeft<=0){ambientChooseFacing(e,true);a.dir=e.facing;a.moveLeft=rand(1,3)}
  if(ambientMoveForward(e,a)){a.moveLeft--;changed=true}else{ambientChooseFacing(e,true);a.dir=e.facing;a.moveLeft=rand(1,2);changed=true}
  if(a.moveLeft<=0)a.pauseTicks=rand(2,4)
 }
 return changed
}
function ambientAITick(){
 if(ambientPaused())return;initAmbientRoutines();let changed=false;
 for(const e of [...s.enemies]){
  if(!e||e.hp<=0||e.boss||e.state!=='idle')continue;
  const acted=ambientAct(e);if(acted)changed=true;
  if(canSeePlayer(e)){
   if(e.state!=='alerted')log('❗ Un nemico ti vede durante la sua ronda.');
   setAlert(e);callerAlarm(e);changed=true
  }
 }
 if(changed&&s){updateVisibility();render()}
}
setInterval(ambientAITick,AMBIENT_AI_MS);
// Idle breathing/bobbing is visual-only and capped at 12 fps.
setInterval(()=>{if(!s||prefersReducedMotion()||document.visibilityState!=='visible')return;const game=root.querySelector('#game');if(game&&!game.classList.contains('hidden')&&!s.eventOpen&&!s.rewardOpen&&!guideOpen)draw()},83);
function occupiedForSpawn(x,y){if(v18SolidDecorationAt(x,y))return true;if(x===s.player.x&&y===s.player.y)return true;if(x===s.stairs.x&&y===s.stairs.y)return true;if(enemyAt(x,y))return true;if(s.loot.some(o=>o.x===x&&o.y===y)||s.coins.some(o=>o.x===x&&o.y===y)||(s.artifactDrops||[]).some(o=>o.x===x&&o.y===y)||s.chests.some(o=>!o.opened&&o.x===x&&o.y===y)||s.traps.some(o=>!o.triggered&&o.x===x&&o.y===y))return true;if(s.mechanism&&((s.mechanism.switch.x===x&&s.mechanism.switch.y===y)||(s.mechanism.cache.x===x&&s.mechanism.cache.y===y)))return true;if(s.rareEvent&&!s.rareEvent.used&&s.rareEvent.x===x&&s.rareEvent.y===y)return true;if(s.dangerDoor&&!s.dangerDoor.declined&&!s.dangerDoor.rewarded&&s.dangerDoor.x===x&&s.dangerDoor.y===y)return true;return false}function freeSpot(min){const a=s.open.filter(p=>dist(p,s.player)>=min&&!occupiedForSpawn(p.x,p.y));return a.length?choice(a):null}
function addGold(amount,count=true){let v=amount;if(has('merchant'))v=Math.round(v*1.2);if(hasBuff('greedRun'))v=Math.round(v*1.25);s.runCoins+=v;if(count)s.stats.goldCollected+=v;return v}function checkMissions(){for(const m of s.missions){if(!m.done&&m.get(s)>=m.target){m.done=true;s.runCoins+=m.reward;meta.totalMissions++;saveMeta();log('🎯 '+m.name+' completata · +'+m.reward+' oro.');showToast('🎯 '+m.name+' · +'+m.reward+' oro')}}}
function addThreat(move,combat){if(move){s.steps++;let gain=0;if(!(s.floor===1&&s.steps<=10)&&s.steps%3===0)gain=1;if(s.floor===4&&s.steps%6===0)gain+=1;if(has('light')&&s.steps%6===0)gain=Math.max(0,gain-1);s.instability=Math.min(100,s.instability+gain)}if(combat){let a=has('silent')?2:3;if(hasBuff('quietRun'))a=Math.max(1,a-1);if(s.floor===3&&bossAlive())a+=1;s.alarm=Math.min(100,s.alarm+a)}threatEvents()}function threatEvents(){const a=Math.floor(s.alarm/25),i=Math.floor(s.instability/25);if(!dangerEliteActive()){while(s.alarmStage<a){s.alarmStage++;const p=freeSpot(6);if(!p)break;const tier=s.alarmStage===1?'blue':s.alarmStage===2?'yellow':s.alarmStage===3?'purple':'red',e=makeEnemy(p.x,p.y,tier);e.state='suspicious';e.lastSeen={x:s.player.x,y:s.player.y};e.search=2;s.enemies.push(e);playSfx('alarm');log('⚠️ L’Allarme richiama un '+tier+'.')}}while(s.instStage<i){s.instStage++;for(let n=0;n<(s.instStage===2?2:s.instStage===4?3:1);n++){const p=freeSpot(3);if(!p)break;s.traps.push({x:p.x,y:p.y,triggered:false,revealed:false})}playSfx('instability');log('▲ L’Instabilità crea nuove trappole.')}}
function consumeWeaponUid(uid){if(!uid)return;const i=s.inventory.find(x=>x.kind==='weapon'&&x.uid===uid);if(!i)return;if(s.artifactBuffs?.power>0)return;if((has('careful')&&Math.random()<.30)||(hasBuff('durableRun')&&Math.random()<.25)){log('👐 Durata preservata.');return}i.uses--;if(i.uses<=0){const name=W[i.id].name;s.inventory.splice(s.inventory.indexOf(i),1);if(s.equippedUid===uid){const n=s.inventory.find(x=>x.kind==='weapon');s.equippedUid=n?n.uid:null}playSfx('break');log('💥 '+name+' si rompe.')}}
function damageEnemy(e,w,bonus=1){let d=rand(w.min,w.max)*matchup(w.family,e.family)*mastery(w.family)*bonus;if(has('bloodlust')&&s.alarm>=50)d*=1.15;if(has('adrenaline')&&s.hp/s.maxHp<=.5)d*=1.15;if(has('opening')&&e.hp===e.maxHp)d*=1.20;if(has('piercer')&&w.family==='spear'&&dist(e,s.player)===2)d*=1.20;const wi=eqItem();if(has('lastEdge')&&wi&&wi.uses===1)d*=1.20;if(hasBuff('power'))d*=1.12;if(s.artifactBuffs?.blood>0)d*=1.30;if(s.artifactBuffs?.power>0)d*=1.25;if(hasBuff('execution')&&e.hp/e.maxHp<=.35)d*=1.25;if(w.crit&&Math.random()<w.crit){d*=2;log('💥 Critico!')}if(e.bossKind==='mini'&&e.armored){d*=.6;e.armored=false;log('🛡️ Il Custode assorbe parte del colpo.');pushFx(e.x,e.y,'PARATA','#ffd166');burst('parry',e.x,e.y)}return Math.max(1,Math.round(d))}
function checkBossPhase(e){
 if(!e||e.hp<=0||e.bossKind!=='final'||(e.phase||1)>=2||e.hp>e.maxHp*.5)return;
 e.phase=2;e.turns=0;e.telegraph=false;
 log('👑 Il Signore del Profondo entra in FASE II: i Colpi Sismici arrivano più spesso.');
 showToast('👑 FASE II · LA SOGLIA TREMA');
 burst('phase2',e.x,e.y);pushFx(e.x,e.y,'FASE II','#d78cff');
}

function kill(e,ctx={}){
 beginDeath(e);playSfx(e.bossKind?'bossKill':'kill');s.kills++;meta.kills++;
 if(ctx.axe)s.stats.axeKills++;if(ctx.spear)s.stats.spearKills++;
 const g=addGold(rand(3,8)+({green:0,blue:3,yellow:7,red:15,purple:30}[e.tier]||0),true);
 consumeWeaponUid(ctx.weaponUid);if(has('predator'))healPlayer(1);
 if(e.bossKind==='mini'){meta.minibossKills++;s.stats.minibossKills++;const bossGold=addGold(80+(has('bounty')?30:0),true);log('👑 Miniboss sconfitto · +'+bossGold+' oro.');showToast('👑 MINIBOSS SCONFITTO')}
 if(e.bossKind==='final'){meta.bossKills++;s.stats.bossKills++;const bossGold=addGold(180+(has('bounty')?75:0),true);log('👑 Boss finale sconfitto · +'+bossGold+' oro.');showToast('🏆 BOSS FINALE SCONFITTO')}
 if(e.dangerElite)rewardDangerElite(e);
 log('☠️ KO · +'+g+' oro.');saveMeta();checkMissions()
}

function hammerPush(e){const dx=Math.sign(e.x-s.player.x),dy=Math.sign(e.y-s.player.y),nx=e.x+dx,ny=e.y+dy,blocked=nx<0||ny<0||nx>=WORLD||ny>=WORLD||s.map[ny]?.[nx]==='#'||!!v18SolidDecorationAt(nx,ny)||!bossArenaContains(e,nx,ny)||enemyAt(nx,ny,e.id);if(blocked){if(e.boss){playSfx('stun');log('👑 Il boss resiste allo STUN del Martello.');pushFx(e.x,e.y,'RESISTE','#ffd166');burst('resist',e.x,e.y);return 'bossResist'}playSfx('stun');e.stunned=true;s.stats.hammerStuns++;log('🔨 STUN.');pushFx(e.x,e.y,'STUN','#bd91df');burst('stun',e.x,e.y);checkMissions();return 'stun'}playSfx('push');const ox=e.x,oy=e.y;e.x=nx;e.y=ny;beginEnemyMove(e,ox,oy,e.x,e.y);faceToward(e,s.player);e.lastSeen={x:s.player.x,y:s.player.y};log(e.boss?'🔨 Il boss viene spinto di 1.':'🔨 Spinta di 1.');pushFx(e.x,e.y,'SPINTA','#e3c2ff');burst('push',e.x,e.y,{dx,dy});return 'push'}
function spearHit(e){const dx=e.x-s.player.x,dy=e.y-s.player.y;if(!((dx===0&&Math.abs(dy)>=1&&Math.abs(dy)<=2)||(dy===0&&Math.abs(dx)>=1&&Math.abs(dx)<=2)))return false;const d=Math.abs(dx)+Math.abs(dy);if(d===2){const mx=s.player.x+Math.sign(dx),my=s.player.y+Math.sign(dy);if(s.map[my]?.[mx]==='#'||v18SolidDecorationAt(mx,my)||enemyAt(mx,my))return false}return true}
function targetInRange(e,w=eqWeapon()){if(!s||!e||e.hp<=0)return false;if(w.family==='axe')return cheb(e,s.player)===1;if(w.family==='spear')return spearHit(e);return dist(e,s.player)===1}
function targetAttackable(e,w=eqWeapon()){return targetInRange(e,w)&&s.visible.has(K(e.x,e.y))}
function validTargets(){const w=eqWeapon();const list=s.enemies.filter(e=>targetInRange(e,w));return w.family==='spear'?list.sort((a,b)=>dist(a,s.player)-dist(b,s.player)):list}
function currentTarget(){if(!s?.targetMode)return null;const alive=s.targetIds.map(id=>s.enemies.find(e=>e.id===id)).filter(e=>targetAttackable(e));if(!alive.length){cancelTargeting(false);return null}s.targetIds=alive.map(e=>e.id);s.targetIndex=Math.max(0,Math.min(s.targetIndex,s.targetIds.length-1));return alive[s.targetIndex]}
function cancelTargeting(doRender=true){if(!s)return;s.targetMode=false;s.targetIds=[];s.targetIndex=0;const p=root.querySelector('#targetPanel');if(p)p.classList.add('hidden');if(doRender)render()}
function cycleTarget(delta){if(!s?.targetMode)return;const n=s.targetIds.length;if(!n)return;s.targetIndex=(s.targetIndex+delta+n)%n;render()}
function confirmTarget(){const e=currentTarget();if(!e){log('🎯 Bersaglio non più valido.');cancelTargeting();return}attackSingle(e)}
function renderTargetPanel(){const panel=root.querySelector('#targetPanel'),box=root.querySelector('#targetChoices');if(!panel||!box)return;if(!s.targetMode){panel.classList.add('hidden');return}panel.classList.remove('hidden');box.innerHTML='';s.targetIds.forEach((id,idx)=>{const e=s.enemies.find(x=>x.id===id&&x.hp>0);if(!e)return;const b=document.createElement('button');b.type='button';b.className='target-btn'+(idx===s.targetIndex?' selected':'');const role=ENEMY_ROLES[e.role]?.name||'Pattuglia';const state=e.state==='alerted'?'Allertato':e.state==='suspicious'?'Sospetto':'Calmo';b.innerHTML=`<strong>${iconHTML(e.boss?'boss':roleIconKey(e.role),'icon-inline icon-md')} ${e.boss?e.name:role}</strong><div class="inv-meta">${iconHTML(weaponIconKey(e.family),'icon-inline icon-sm')} ${F[e.family].name} · ${e.hp}/${e.maxHp} HP · ${stateIconKey(e.state)?iconHTML(stateIconKey(e.state),'icon-inline icon-sm'):''} ${state}</div>`;b.onclick=()=>{s.targetIndex=idx;confirmTarget();root.focus()};box.appendChild(b)})}
const THRESHOLD_LINES={
 enemy50:[
  'La Soglia si è aperta nella ferita.',
  'Il sangue gli ha mostrato la Soglia.',
  'La Soglia ha preso misura di lui.'
 ],
 enemy25:[
  'È troppo vicino alla Soglia per tornare intero.',
  'La Soglia non è più davanti a lui.',
  'La Soglia ha già cominciato a passargli attraverso.'
 ],
 player50:[
  'Hai sentito la Soglia nella ferita.',
  'Il tuo sangue conosce la Soglia.',
  'La Soglia è più vicina di prima.'
 ],
 player25:[
  'La Soglia ora passa attraverso di te.',
  'Sei abbastanza vicino da vedere la Soglia.',
  'Alla Soglia non importa da quale lato ti trovi.'
 ],
 room:[
  'La Soglia era qui prima della porta.',
  'Ogni stanza ha una Soglia. Questa è stata attraversata.',
  'La porta è alle tue spalle. La Soglia no.'
 ]
};
let thresholdDialogueTimer=null;
const THRESHOLD_OMENS={
 enemy50:{title:'SOGLIA',text:'FERITA I',glyph:'◈',color:'#b96e6e',burst:'threshold'},
 enemy25:{title:'SOGLIA',text:'FERITA II',glyph:'◉',color:'#9e79d9',burst:'thresholdDeep'},
 player50:{title:'SOGLIA',text:'SANGUE I',glyph:'◈',color:'#d8b86f',burst:'threshold'},
 player25:{title:'SOGLIA',text:'SANGUE II',glyph:'◉',color:'#d9c6ff',burst:'thresholdDeep'},
 room:{title:'SOGLIA',text:'VARCO',glyph:'⟐',color:'#dfbf78',burst:'thresholdDoor'}
};
function showThresholdDialogue(kind,x=null,y=null){const cfg=THRESHOLD_OMENS[kind];if(!cfg)return;playSfx('threshold');const box=root.querySelector('#thresholdDialogue'),txt=root.querySelector('#thresholdDialogueText'),title=root.querySelector('#thresholdDialogueTitle'),glyph=root.querySelector('#thresholdDialogueGlyph');if(box&&txt&&title&&glyph){title.textContent=cfg.title;txt.textContent=cfg.text;glyph.textContent=cfg.glyph;box.style.setProperty('--omen-color',cfg.color);box.classList.remove('show');void box.offsetWidth;box.classList.add('show')}if(Number.isFinite(x)&&Number.isFinite(y)){burst(cfg.burst||'rune',x,y,{glyph:cfg.glyph,color:cfg.color})}clearTimeout(thresholdDialogueTimer);thresholdDialogueTimer=setTimeout(closeThresholdDialogue,1050)}
function closeThresholdDialogue(){const box=root.querySelector('#thresholdDialogue');if(box)box.classList.remove('show');clearTimeout(thresholdDialogueTimer);thresholdDialogueTimer=null}
function checkEnemyThreshold(e,beforeHp){if(!e||e.hp<=0||!e.maxHp)return;e._thresholdMarks=e._thresholdMarks||{};const before=beforeHp/e.maxHp,after=e.hp/e.maxHp;if(before>.5&&after<=.5&&!e._thresholdMarks.half){e._thresholdMarks.half=true;showThresholdDialogue('enemy50',e.x,e.y)}if(before>.25&&after<=.25&&!e._thresholdMarks.quarter){e._thresholdMarks.quarter=true;showThresholdDialogue('enemy25',e.x,e.y)}}
function checkPlayerThreshold(beforeHp){if(!s||!s.maxHp)return;s._thresholdMarks=s._thresholdMarks||{};const before=beforeHp/s.maxHp,after=s.hp/s.maxHp;if(before>.5&&after<=.5&&!s._thresholdMarks.half){s._thresholdMarks.half=true;showThresholdDialogue('player50',s.player.x,s.player.y)}if(before>.25&&after<=.25&&!s._thresholdMarks.quarter){s._thresholdMarks.quarter=true;showThresholdDialogue('player25',s.player.x,s.player.y)}}
function attackSingle(e){if(!s||s.eventOpen||s.rewardOpen||s.atStairs||!e||e.hp<=0)return;const w=eqWeapon();if(!targetAttackable(e,w)){log('🎯 Bersaglio non più valido.');cancelTargeting();return}cancelTargeting(false);playSfx(w.family);const uid=eqItem()?.uid||null,preDist=dist(e,s.player),back=canBackstab(e)&&(s.ambushId===e.id||isBehind(e)),silentBackstab=back&&has('daggerMaster');if(!silentBackstab)makeNoise(5);else log('🌑 Backstab silenzioso.');const missed=!!(w.miss&&Math.random()<w.miss);if(missed){beginPlayerAttack(w.family,e,{backstab:back,miss:true});playSfx('miss');s.ambushId=null;log('❌ Colpo mancato.');if(!silentBackstab)addThreat(false,true);enemyTurn();if(s){updateVisibility();render()}return}let bonus=1,hammerResult=null,riposte=false;if(back){playSfx('backstab');bonus=hasBuff('shadow')?2.4:2;s.stats.backstabs++;log('🔪 BACKSTAB ×'+bonus+'!');pushFx(e.x,e.y,'BACKSTAB ×'+bonus,'#8ed39a');burst('backstab',e.x,e.y);checkMissions()}if(w.family==='sword'&&has('swordMaster')&&s.riposteReady){bonus*=1.25;s.riposteReady=false;riposte=true;log('⚔️ RIPOSTA +25%!');pushFx(e.x,e.y,'RIPOSTA','#9ec5ff');burst('riposte',e.x,e.y)}beginPlayerAttack(w.family,e,{backstab:back,riposte});const dmg=damageEnemy(e,w,bonus),beforeHp=e.hp;e.hp-=dmg;checkEnemyThreshold(e,beforeHp);checkBossPhase(e);log('⚔️ '+dmg+' danni.');pushFx(e.x,e.y,'-'+dmg,'#ffffff');if(w.family==='spear'&&has('spearMaster')&&preDist===2){const dx=Math.sign(e.x-s.player.x),dy=Math.sign(e.y-s.player.y),rear=enemyAt(e.x+dx,e.y+dy);if(rear&&s.visible.has(K(rear.x,rear.y))){const splash=Math.max(1,Math.round(dmg*.5)),rearBeforeHp=rear.hp;rear.hp-=splash;checkEnemyThreshold(rear,rearBeforeHp);checkBossPhase(rear);beginEnemyHit(rear,e.x,e.y);log('🔱 Affondo in linea: '+splash+' danni al secondo bersaglio.');pushFx(rear.x,rear.y,'-'+splash,'#77c7e8');if(rear.hp<=0)kill(rear,{spear:true,weaponUid:uid});else reactToHit(rear)}}if(w.family==='sword'){playSfx('guard');s.guard=true;burst('guard',s.player.x,s.player.y);log('🛡️ Guardia pronta.')}if(e.hp<=0)kill(e,{spear:w.family==='spear',weaponUid:uid});else{reactToHit(e);if(w.family==='hammer'){hammerResult=hammerPush(e);if(hammerResult==='push'&&has('hammerMaster')){s.guard=true;burst('guard',s.player.x,s.player.y);log('🔨 Presa salda: Guardia attiva.')}}}s.ambushId=null;if(!silentBackstab)addThreat(false,true);enemyTurn(hammerResult==='push'?e.id:null);if(s){updateVisibility();render()}}
function axeAttack(){if(!s||s.eventOpen||s.rewardOpen||s.atStairs)return;cancelTargeting(false);const w=eqWeapon(),uid=eqItem()?.uid||null,targets=s.enemies.filter(e=>targetAttackable(e,w));if(!targets.length){log('Nessun bersaglio visibile nell’area.');return}beginPlayerAttack('axe',targets[0]||null,{});playSfx('axe');makeNoise(6);const killed=[];for(const e of targets){if(w.miss&&!(s.artifactBuffs?.power>0)&&Math.random()<Math.max(0,w.miss-(has('sureGrip')?.07:0))){log('❌ L’Ascia manca un bersaglio.');continue}const dmg=damageEnemy(e,w),beforeHp=e.hp;e.hp-=dmg;checkEnemyThreshold(e,beforeHp);checkBossPhase(e);beginEnemyHit(e,s.player.x,s.player.y);log('🪓 '+dmg+' danni a '+F[e.family].name+'.');pushFx(e.x,e.y,'-'+dmg,'#e3a15d');if(e.hp<=0)killed.push(e);else reactToHit(e)}for(let idx=0;idx<killed.length;idx++)kill(killed[idx],{axe:true,weaponUid:has('axeMaster')?(idx===0?uid:null):uid});if(has('axeMaster')&&killed.length>1)log('🪓 Tecnica ampia: '+killed.length+' KO, 1 sola durata consumata.');addThreat(false,true);enemyTurn();if(s){updateVisibility();render()}}
function attack(){if(!s||s.eventOpen||s.rewardOpen||s.atStairs)return;if(eqWeapon().family==='axe'){axeAttack();return}const ts=validTargets().filter(e=>targetAttackable(e));if(s.ambushId){const a=ts.find(e=>e.id===s.ambushId);if(a){attackSingle(a);return}}if(!ts.length){log('Nessun bersaglio a portata.');return}if(ts.length===1){attackSingle(ts[0]);return}s.targetMode=true;s.targetIds=ts.map(e=>e.id);s.targetIndex=0;log('🎯 Scegli il bersaglio.');render()}
function damagePlayer(amount,label='💢',source='enemy'){const thresholdBeforeHp=s?.hp??0;playSfx(source==='trap'?'trap':'hurt');let dmg=Math.max(1,Math.round(amount));if(source==='trap'&&has('trapwise'))dmg=Math.max(1,Math.round(dmg*.6));let stone=false;if(s.artifactBuffs?.stone>0){stone=true;s.artifactBuffs.stone=0;dmg=Math.max(1,Math.ceil(dmg*.25));log('⬢ Pelle di Pietra assorbe il 75% del colpo.');showToast('⬢ PELLE DI PIETRA')}if(s.guard&&!stone){const guardMult=has('bulwark')?.4:.5;dmg=Math.max(1,Math.ceil(dmg*guardMult));s.guard=false;burst('guard',s.player.x,s.player.y);log(has('bulwark')?'🛡️ Bastione assorbe il 60% del colpo.':'🛡️ Guardia dimezza il colpo.');if(source==='enemy'&&has('swordMaster')){s.riposteReady=true;burst('riposte',s.player.x,s.player.y);log('⚔️ Riposta pronta.')}}s.hp-=dmg;checkPlayerThreshold(thresholdBeforeHp);beginPlayerHit();log(label+' -'+dmg+' HP.');pushFx(s.player.x,s.player.y,'-'+dmg,'#ff8c8c');if(s.hp<=0){if(has('survivor')&&!s.survivorUsed){s.survivorUsed=true;s.hp=1;log('🛡️ Ultima resistenza!');showToast('🛡️ ULTIMA RESISTENZA')}else{die();return false}}return true}
function enemyTurn(skipId=null){
 for(const e of [...s.enemies]){
  if(e.hp<=0||e.id===skipId)continue;
  if(e.stunned){e.stunned=false;log('💫 Un nemico perde il turno.');continue}
  const sees=canSeePlayer(e);if(sees){if(e.state!=='alerted'){playSfx('alertSpot');log('❗ Un nemico ti vede.')}setAlert(e);callerAlarm(e)}
  if(e.boss){
   if(sees||e.state==='alerted')e.turns=(e.turns||0)+1;
   if(e.bossKind==='final'&&e.telegraph){
    faceToward(e,s.player);
    const quakeMin=(e.phase||1)>=2?20:17,quakeMax=(e.phase||1)>=2?26:23;
    if(dist(e,s.player)<=1&&hasLineOfSight(e.x,e.y,s.player.x,s.player.y)){beginEnemyAttack(e);burst('quake',e.x,e.y);log('💥 Il Signore del Profondo scatena il Colpo Sismico!');if(!damagePlayer(rand(quakeMin,quakeMax),'💥','enemy'))return}else{burst('quake',e.x,e.y);log('💨 Il Colpo Sismico manca il bersaglio.')}
    e.telegraph=false;continue
   }
   const quakeEvery=(e.phase||1)>=2?2:3;
   if(e.bossKind==='final'&&sees&&dist(e,s.player)<=2&&e.turns%quakeEvery===0){e.telegraph=true;playSfx('bossWarn');faceToward(e,s.player);log((e.phase||1)>=2?'⚠️ FASE II: il Signore del Profondo CARICA di nuovo!':'⚠️ Il Signore del Profondo CARICA: allontanati!');pushFx(e.x,e.y,'⚠ CARICA','#ffd166');continue}
   if(e.bossKind==='mini'&&sees&&e.turns%3===0&&!e.armored){e.armored=true;log('🛡️ Il Custode assume una posizione difensiva.');pushFx(e.x,e.y,'GUARDIA','#ffd166')}
  }
  if(e.state==='alerted'){
   if(sees)e.lastSeen={x:s.player.x,y:s.player.y};
   if(dist(e,s.player)===1&&sees){faceToward(e,s.player);beginEnemyAttack(e);const dmg=rand(e.min,e.max)*enemyMult(e.family,eqWeapon().family);if(!damagePlayer(dmg,'💢','enemy'))return;continue}
   if(e.role==='sentry'&&!e.boss){if(e.lastSeen)faceToward(e,e.lastSeen);if(!sees){e.search--;if(e.search<=0){e.state='suspicious';e.search=2}}continue}
   if(e.lastSeen){
    const target=e.role==='flanker'&&sees?flankerTarget(e):e.lastSeen;
    const moved=stepToward(e,target);if(!moved)faceToward(e,target);
    if(e.role==='hunter'){e.roleTick=(e.roleTick||0)+1;if(e.roleTick%2===0&&dist(e,s.player)>1){const moved2=stepToward(e,e.lastSeen);if(moved2)pushFx(e.x,e.y,'CACCIA','#ffb36b')}}
    if(e.x===e.lastSeen.x&&e.y===e.lastSeen.y&&!canSeePlayer(e)){e.state='suspicious';e.search=e.role==='hunter'?4:2}
   }
  }else if(e.state==='suspicious'){
   if(e.role==='sentry'){if(e.lastSeen)faceToward(e,e.lastSeen);e.search--;if(e.search<=0){e.state='idle';e.lastSeen=null}continue}
   if(e.lastSeen&&!(e.x===e.lastSeen.x&&e.y===e.lastSeen.y)){const target=e.role==='flanker'?flankerTarget(e):e.lastSeen,moved=stepToward(e,target);if(!moved){faceToward(e,target);e.search--}}else{e.search--;if(Math.random()<.35)e.facing=choice(Object.keys(DIR))}
   if(e.search<=0){e.state='idle';e.lastSeen=null}
  }else {
   /* Calmi: il movimento è gestito dal clock ambientale autonomo. */
  }
 }
 if(s){tickArtifactBuffs();s.artifactUsedThisTurn=false;}
}

function openEvent(ev){playSfx('event');const d=EVENTS[ev.type];s.eventOpen=true;cancelTargeting(false);root.querySelector('#eventPanel').classList.remove('hidden');root.querySelector('#eventTitle').innerHTML=iconHTML(eventIconKey(ev.type),'icon-inline icon-md')+' '+d.name;root.querySelector('#eventText').textContent=d.text;const box=root.querySelector('#eventChoices');box.innerHTML='';d.choices.forEach(ch=>{const b=document.createElement('button');b.type='button';b.textContent=ch.label;b.onclick=()=>{ch.apply(s);ev.used=true;if(ev.chainKey&&s.chains[ev.chainKey])s.chains[ev.chainKey].done=true;meta.eventsResolved++;saveMeta();s.eventOpen=false;root.querySelector('#eventPanel').classList.add('hidden');log('✦ Evento risolto.');checkMissions();updateVisibility();render();root.focus()};box.appendChild(b)});render()}
function puzzleObjectSeen(o){return !!(o&&s.visible.has(K(o.x,o.y)))}
function openPuzzlePanel(title,text,note=''){s.eventOpen=true;playSfx('event');const p=root.querySelector('#puzzlePanel');root.querySelector('#puzzleTitle').textContent=title;root.querySelector('#puzzleText').textContent=text;root.querySelector('#puzzleNote').textContent=note;p.classList.remove('hidden');render()}
function closePuzzlePanel(){const p=root.querySelector('#puzzlePanel');if(p)p.classList.add('hidden');if(s){s.eventOpen=false;render()}root.focus()}
function routeGlyphs(route){const g={up:'↑',down:'↓',left:'←',right:'→'};return (route||[]).map(x=>g[x]||'?').join('  ')}

function puzzleKnown(floor){return Array.isArray(meta.knownPuzzles)&&meta.knownPuzzles.includes(floor)}
function markPuzzleKnown(floor){if(!Array.isArray(meta.knownPuzzles))meta.knownPuzzles=[];if(!meta.knownPuzzles.includes(floor)){meta.knownPuzzles.push(floor);saveMeta()}}
function compactPuzzleMessage(p,kind='tablet'){
 if(!p)return '';
 if(p.floor===2)return kind==='decoder'?'📜 Indizio già noto: trova ◇ e usa Aspetta ×1.':'◇ SIGILLO → ASPETTA ×1';
 if(p.floor===3)return '↔ '+routeGlyphs(p.route);
 if(p.floor===4)return kind==='decoder'?'📜 Rune già note: sul ◇ usa Aspetta ×3.':'◇ SIGILLO → ASPETTA ×3';
 if(p.floor===5)return kind==='decoder'?'📜 Ordine noto: ☾ → † → ◉ → VARCO':'☾ → † → ◉ → VARCO';
 return '🗝️ Trova la Chiave della Soglia'
}
function lockedDoorHelp(p){
 if(!p)return ['🔒 Porta sigillata','Questa porta è ancora chiusa.',''];
 if(p.floor===1)return ['🔒 Camera della Soglia','Trova l’icona 🗝️ nel piano e camminaci sopra: la chiave viene raccolta automaticamente e questa porta si apre subito, anche se è lontana.','Quando la porta è aperta, camminaci sopra per entrare nella Camera e ricevere la ricompensa.'];
 if(p.floor===2)return ['🔒 Camera della Soglia','Qui non esiste una chiave fisica. Leggi la 🗿 Stele, trova il ◇ Sigillo dorato e usa Aspetta una volta mentre sei sul sigillo.','Il rituale apre automaticamente la porta; poi raggiungila e camminaci sopra per la ricompensa.'];
 if(p.floor===3)return ['🔒 Camera della Soglia','Qui non esiste una chiave fisica. Leggi la 🗿 Stele: dalla sua stessa casella segui esattamente le 5 direzioni mostrate.','Completata la sequenza, la porta si apre automaticamente.'];
 if(p.floor===4)return ['🔒 Varco Centrale','Il Varco è obbligatorio e separa le due metà del piano. Non usa una chiave fisica: leggi l’Iscrizione 🗿, consulta la Tavola delle Rune 📜 e sul Sigillo dorato usa Aspetta 3 volte.','Il Varco si apre automaticamente e riduce l’Instabilità. Attraversalo per raggiungere la seconda metà.'];
 return ['🔒 Varco Centrale','Il Varco è obbligatorio. Non usa una chiave fisica: decifra l’Iscrizione 🗿 con la Tavola 📜, poi avanza sui sigilli nell’ordine LUNA → LAMA → OCCHIO. Infine raggiungi il Sigillo del Varco e usa Aspetta.','Il rituale è disposto lungo il percorso verso la porta: non devi tornare all’inizio.'];
}
function puzzleStatus(){const p=s?.keyPuzzle;if(!p)return null;if(p.door?.claimed)return{icon:'✓',title:'Soglia completata',text:p.mandatory?'Il Varco Centrale è aperto: puoi attraversarlo liberamente.':'La Camera della Soglia è stata saccheggiata.',step:'FATTO'};if(p.door?.open)return{icon:'🚪',title:p.mandatory?'Varco Centrale aperto':'Camera della Soglia aperta',text:p.mandatory?'Raggiungi il varco e attraversalo. Entrandoci ricevi automaticamente la ricompensa.':'Raggiungi la porta aperta e camminaci sopra: entrerai nella Camera e prenderai automaticamente la ricompensa.',step:'APERTA'};
 if(p.floor===1)return{icon:'🗝️',title:'Trova la Chiave della Soglia',text:'Passaci sopra per raccoglierla automaticamente. Non devi usare un oggetto: la Camera si aprirà subito.',step:'1/2'};
 if(p.floor===2)return{icon:p.tabletRead?'◇':'🗿',title:p.tabletRead?'Trova il Sigillo dorato':'Leggi la Stele',text:p.tabletRead?'Sul Sigillo usa Aspetta una volta. Non c’è una chiave fisica.':'Cammina sulla Stele per leggere l’indizio. Dal Piano 2 le “chiavi” sono rituali, non oggetti.',step:p.tabletRead?'2/2':'1/2'};
 if(p.floor===3){if(p.routeActive)return{icon:'↔',title:'Sequenza attiva',text:'Segui le frecce senza deviare. Progresso '+p.routeProgress+'/'+(p.route?.length||5)+'.',step:p.routeProgress+'/'+(p.route?.length||5)};return{icon:'🗿',title:p.tabletRead?'Riparti dalla Stele':'Leggi la Stele',text:p.tabletRead?'Torna sulla stessa casella della Stele e segui le 5 direzioni indicate.':'Cammina sulla Stele per vedere la sequenza. Non c’è una chiave fisica.',step:p.tabletRead?'2/2':'1/2'};}
 if(p.floor===4){if(!p.tabletRead)return{icon:'🗿',title:'Trova l’Iscrizione',text:'Leggila: contiene il rituale in rune.',step:'1/3'};if(!p.decoderRead)return{icon:'📜',title:'Trova la Tavola delle Rune',text:'Usala per tradurre l’Iscrizione.',step:'2/3'};return{icon:'◇',title:'Raggiungi il Sigillo dorato',text:'Resta sul Sigillo e usa Aspetta 3 volte. Progresso '+p.waits+'/3.',step:'3/3'};}
 if(p.floor===5){if(!p.tabletRead)return{icon:'🗿',title:'Trova l’Iscrizione',text:'Leggila: contiene l’ordine del rituale.',step:'1/4'};if(!p.decoderRead)return{icon:'📜',title:'Trova la Tavola delle Rune',text:'Usala per tradurre l’ordine.',step:'2/4'};if(p.sigilProgress<3){const next=p.sigils?.[p.sigilProgress];return{icon:next?.icon||'◇',title:'Attiva i tre Sigilli',text:'Camminaci sopra nell’ordine LUNA → LAMA → OCCHIO. Prossimo: '+(next?.name||'sigillo')+'.',step:(p.sigilProgress+1)+'/3'}}return{icon:'◇',title:'Raggiungi il Sigillo del Varco',text:'Con i tre sigilli attivi, continua verso il Varco e usa Aspetta una volta sul sigillo davanti alla porta.',step:'4/4'}}
 return null}
function renderThresholdStatus(){const box=root.querySelector('#thresholdStrip');if(!box)return;const st=puzzleStatus();box.classList.toggle('hidden',!st);if(!st)return;root.querySelector('#thresholdIcon').textContent=st.icon;root.querySelector('#thresholdTitle').textContent=st.title;root.querySelector('#thresholdText').textContent=st.text;root.querySelector('#thresholdStep').textContent=st.step||''}
function unlockPuzzleDoor(){const p=s?.keyPuzzle;if(!p||p.keyFound)return;p.keyFound=true;p.door.open=true;p.door.seen=true;markPuzzleKnown(p.floor);burst('door',p.door.x,p.door.y);burst('rune',p.door.x,p.door.y,{glyph:'◇'});playSfx('event');if(p.mandatory){const relief=Math.min(20,s.instability);s.instability=Math.max(0,s.instability-20);log('🚪 VARCO APERTO: il rituale ha sbloccato il Varco Centrale. Ora puoi attraversarlo; entrando nel varco ricevi automaticamente la ricompensa.'+(relief?' Instabilità -'+relief+'.':''));showToast('🚪 VARCO APERTO · ATTRAVERSALO')}else{log('🚪 PORTA APERTA: la Camera della Soglia è ora accessibile. Non serve usare una chiave: raggiungi la porta aperta e camminaci sopra per entrare e prendere la ricompensa.');showToast('🚪 CAMERA APERTA · RAGGIUNGILA')}}
function claimPuzzleReward(){const p=s?.keyPuzzle;if(!p||!p.door.open||p.door.claimed)return;p.door.claimed=true;playSfx('chest');const g=addGold(p.reward.gold,true);log((p.mandatory?'🏆 Hai attraversato il Varco Centrale. Ricompensa automatica: +':'🏆 Sei entrato nella Camera della Soglia. Ricompensa automatica: +')+g+' oro.');if(p.reward.heal){if(s.inventory.length<maxInv()){s.inventory.push({kind:'heal',id:p.reward.heal});log('🧪 Hai trovato '+HEALS[p.reward.heal].name+'.')}else s.loot.push({x:s.player.x,y:s.player.y,kind:'heal',id:p.reward.heal,seen:true})}if(p.reward.weapon){const fam=choice(Object.keys(F)),id=POOLS[fam][Math.min(3,Math.max(1,s.floor-1))];if(s.inventory.length<maxInv()){s.inventory.push(weaponItem(id));log('⚔️ Reliquia: '+W[id].name+'.')}else s.loot.push({x:s.player.x,y:s.player.y,kind:'weapon',id,seen:true})}showToast(p.mandatory?'🏆 VARCO SUPERATO':'🏆 CAMERA SEGRETA')}
function puzzleTabletText(p){
 if(p.floor===2)return ['Stele consumata','LA CHIAVE NON È QUI.\nCERCA IL SIGILLO DORATO E RESTA IMMOBILE PER UN TURNO.','Non esiste una chiave fisica in questo piano. Raggiungi il Sigillo dorato e usa Aspetta una volta: la Camera si aprirà automaticamente.'];
 if(p.floor===3)return ['Percorso inciso','DAL SIGILLO SEGUI:  '+routeGlyphs(p.route),'Questa Stele è il punto di partenza. Dopo averla letta, parti dalla sua casella e compi esattamente i 5 passi indicati. Se sbagli, torna qui e ricomincia.'];
 if(p.floor===4)return ['Iscrizione runica',runeEncode('SUL SIGILLO ATTENDI TRE VOLTE'),'Non c’è una chiave fisica. Il Varco Centrale è obbligatorio: trova la Tavola delle Rune, traduci il messaggio, raggiungi il Sigillo dorato e usa Aspetta 3 volte.'];
 if(p.floor===5)return ['Iscrizione runica',runeEncode('LUNA LAMA OCCHIO POI VARCO E ATTENDI'),'Non c’è una chiave fisica. Decifra l’ordine e avanza verso il Varco: LUNA → LAMA → OCCHIO. Il Sigillo del Varco è subito prima della porta; raggiungilo e usa Aspetta.'];
 return ['Stele','Una chiave è nascosta nel piano.',''];
}
function puzzleDecoderText(){return ['Tavola delle Rune',runeLegend(),'La tavola non risolve l’enigma al posto tuo: usala per tradurre l’iscrizione.']}
function onPuzzleStep(dx,dy){const p=s?.keyPuzzle;if(!p||p.keyFound)return;
 if(p.type==='runes'&&p.waits>0)p.waits=0;
 if(p.type==='route'&&p.anchor){if(s.player.x===p.anchor.x&&s.player.y===p.anchor.y){p.routeActive=true;p.routeProgress=0;showToast('◇ SIGILLO ATTIVO');return}if(p.routeActive){const n=dx===1?'right':dx===-1?'left':dy===1?'down':'up';if(n===p.route[p.routeProgress]){p.routeProgress++;showToast('◇ '+p.routeProgress+'/'+p.route.length);if(p.routeProgress>=p.route.length){p.routeActive=false;unlockPuzzleDoor()}}else{p.routeActive=false;p.routeProgress=0;showToast('✕ Sequenza interrotta')}}}
 if(p.type==='sequence'&&p.sigils.length){const hit=p.sigils.find(q=>q.x===s.player.x&&q.y===s.player.y);if(hit){const expected=p.sigils[p.sigilProgress];if(hit===expected){p.sigilProgress++;playSfx('event');const relief=Math.min(10,s.instability);s.instability=Math.max(0,s.instability-10);showToast(hit.icon+' '+p.sigilProgress+'/3 · -'+relief+' INST.');log('✦ Sigillo '+hit.name+' attivato.'+(relief?' Instabilità -'+relief+'.':''))}else{p.sigilProgress=0;showToast('✕ Ordine errato');log('✦ I sigilli si spengono.')}}}
}
function onPuzzleWait(){const p=s?.keyPuzzle;if(!p||p.keyFound)return false;
 if(p.type==='plain'&&p.shrine&&s.player.x===p.shrine.x&&s.player.y===p.shrine.y){unlockPuzzleDoor();return true}
 if(p.type==='runes'&&p.shrine&&s.player.x===p.shrine.x&&s.player.y===p.shrine.y){p.waits++;showToast('◇ '+p.waits+'/3');if(p.waits>=3)unlockPuzzleDoor();return true}else if(p.type==='runes')p.waits=0;
 if(p.type==='sequence'&&p.finalSeal&&s.player.x===p.finalSeal.x&&s.player.y===p.finalSeal.y){if(p.sigilProgress===3){unlockPuzzleDoor();return true}showToast('◇ Il Varco resta muto');return true}
 return false}
function interactPuzzle(){const p=s?.keyPuzzle;if(!p)return;
 if(p.key&&p.key.available&&s.player.x===p.key.x&&s.player.y===p.key.y){p.key.available=false;playSfx('pickup');log('🗝️ CHIAVE RACCOLTA AUTOMATICAMENTE: ci sei passato sopra. Non va equipaggiata né usata manualmente.');showToast('🗝️ CHIAVE RACCOLTA AUTOMATICAMENTE');unlockPuzzleDoor();return}
 if(p.door&&p.door.open&&!p.door.claimed&&s.player.x===p.door.x&&s.player.y===p.door.y){claimPuzzleReward();return}
 if(p.decoder&&s.player.x===p.decoder.x&&s.player.y===p.decoder.y){p.decoderRead=true;if(puzzleKnown(p.floor)){const msg=compactPuzzleMessage(p,'decoder');showToast(msg);log(msg);render()}else{const [a,b,c]=puzzleDecoderText();openPuzzlePanel('📜 '+a,b,c)}return}
 if(p.tablet&&s.player.x===p.tablet.x&&s.player.y===p.tablet.y){p.tabletRead=true;if(p.type==='route'&&p.anchor){p.routeActive=true;p.routeProgress=0;showToast('◇ SEQUENZA ATTIVA · PARTI DA QUI')}if(puzzleKnown(p.floor)){const msg=compactPuzzleMessage(p,'tablet');showToast(msg);log(msg);render()}else{const [a,b,c]=puzzleTabletText(p);openPuzzlePanel('🗿 '+a,b,c)}return}
 if(p.type==='plain'&&p.shrine&&s.player.x===p.shrine.x&&s.player.y===p.shrine.y)showToast('◇ Il sigillo attende');
 if(p.type==='runes'&&p.shrine&&s.player.x===p.shrine.x&&s.player.y===p.shrine.y)showToast('◇ Un sigillo dorato');
 if(p.type==='sequence'&&p.finalSeal&&s.player.x===p.finalSeal.x&&s.player.y===p.finalSeal.y)showToast('◇ VARCO');
}
function pickupGroundLoot(){
 const here=s.loot.filter(o=>o.x===s.player.x&&o.y===s.player.y);if(!here.length)return;
 // Torches are a dedicated resource and never consume backpack slots.
 const torches=here.filter(l=>l.kind==='torch');
 for(const l of torches){const before=torchLight();s.torchLightLevel=Math.min(TORCH_MAX_LIGHT,before+TORCH_RESTORE);burst('pickup',l.x,l.y,{glyph:'🔥',color:'#ffb34f'});s.loot.splice(s.loot.indexOf(l),1);log('🔥 La torcia alimenta subito la luce: '+before+' → '+s.torchLightLevel+'.');showToast('🔥 LUCE '+s.torchLightLevel+'/100')}
 let picked=0;const remaining=here.filter(l=>l.kind!=='torch');
 for(const l of remaining){if(s.inventory.length>=maxInv())break;if(l.kind==='weapon'){const item=weaponItem(l.id);if(Number.isFinite(l.uses))item.uses=Math.max(1,l.uses);s.inventory.push(item);log('⚔️ '+W[l.id].name+' raccolta.')}else{s.inventory.push({kind:'heal',id:l.id});log('🧪 '+HEALS[l.id].name+' raccolta.')}burst('pickup',l.x,l.y,{glyph:l.kind==='weapon'?familyGlyph(W[l.id].family):'✚',color:l.kind==='weapon'?(FC[W[l.id].family]||'#f4e3a2'):'#8fe69d'});s.loot.splice(s.loot.indexOf(l),1);picked++}
 if(torches.length||picked>0)playSfx('pickup');if(picked<remaining.length)log('🎒 Inventario pieno: '+(remaining.length-picked)+' oggett'+(remaining.length-picked===1?'o':'i')+' restano a terra.')
}

function wallTorchAt(x,y){return (s?.torches||[]).find(t=>t.harvestable&&!t.harvested&&t.x===x&&t.y===y)}
function collectWallTorchAt(x,y){
 const t=wallTorchAt(x,y);if(!t)return false;
 t.harvested=true;const before=torchLight();s.torchLightLevel=Math.min(TORCH_MAX_LIGHT,before+TORCH_RESTORE);playSfx('torchTake');playSfx('torchBoost');burst('pickup',s.player.x,s.player.y,{glyph:'🔥',color:'#ffb34f'});
 log('🔥 Stacchi una torcia dal muro: luce '+before+' → '+s.torchLightLevel+'.');showToast('🔥 LUCE '+s.torchLightLevel+'/100');updateVisibility();render();return true
}
function interact(){
 const c=s.coins.find(o=>o.x===s.player.x&&o.y===s.player.y);if(c){playSfx('coin');const darkBonus=Math.max(1,Math.round(darkLootBonus()*100)/100),g=addGold(Math.round(c.value*darkBonus),true);burst('pickup',c.x,c.y,{glyph:'$',color:'#f4d36f'});s.coins.splice(s.coins.indexOf(c),1);log('🪙 +'+g+' oro.');showToast('🪙 +'+g);checkMissions()}
 pickupGroundLoot();pickupArtifactDrops();
 const ch=s.chests.find(o=>!o.opened&&o.x===s.player.x&&o.y===s.player.y);if(ch){playSfx('chest');ch.opened=true;burst('chest',ch.x,ch.y);s.stats.chests++;meta.chestsOpened++;saveMeta();const g=addGold(Math.round((rand(20,45)+s.floor*10+(has('treasure')?15:0)+(ch.bonus||0))*darkLootBonus()),true);log('🧰 +'+g+' oro.');showToast('🧰 +'+g+' oro');if(has('scavenger')&&Math.random()<.35){const f=choice(Object.keys(F)),id=weaponFor(f,Math.min(5,s.floor+1));if(s.inventory.length<maxInv()){s.inventory.push(weaponItem(id));log('📦 Anche '+W[id].name+'.')}else{s.loot.push({x:s.player.x,y:s.player.y,kind:'weapon',id,seen:true});log('📦 Zaino pieno: '+W[id].name+' resta a terra.')}}s.alarm=Math.min(100,s.alarm+2);makeNoise(4);threatEvents();checkMissions()}
 const t=s.traps.find(o=>!o.triggered&&o.x===s.player.x&&o.y===s.player.y);if(t){t.triggered=true;burst('trap',t.x,t.y);const dmg=rand(5,9)+s.floor;if(!damagePlayer(dmg,'⚠️ Trappola:','trap'))return;makeNoise(5)}
 enterSpecialRoom();
 const mech=s.mechanism;if(mech&&!mech.activated&&s.player.x===mech.switch.x&&s.player.y===mech.switch.y)activateMechanism();
 interactPuzzle();if(s.eventOpen)return;
 if(s.rareEvent&&!s.rareEvent.used&&s.player.x===s.rareEvent.x&&s.player.y===s.rareEvent.y){openEvent(s.rareEvent);return}
 if(s.dangerDoor&&!s.dangerDoor.used&&!s.dangerDoor.declined&&s.player.x===s.dangerDoor.x&&s.player.y===s.dangerDoor.y){openDangerDoor();return}
}

function completeStealthFloor(){if(!s.floorStealthCounted&&!s.floorAlerted){s.floorStealthCounted=true;s.stats.stealthFloors++;log('👻 Piano completato senza allerta.');checkMissions()}}
function move(dx,dy){if(!s||s.atStairs||s.eventOpen||s.rewardOpen)return;if(dx>0)s.player.facing='right';else if(dx<0)s.player.facing='left';else if(dy>0)s.player.facing='down';else if(dy<0)s.player.facing='up';if(s.targetMode)cancelTargeting(false);s.ambushId=null;const nx=s.player.x+dx,ny=s.player.y+dy;if(nx<0||ny<0||nx>=WORLD||ny>=WORLD)return;const secret=(s.secrets||[]).find(q=>!q.opened&&q.x===nx&&q.y===ny);if(secret&&secret.seen){openSecret(secret);return}if(s.map[ny][nx]==='#'){if(collectWallTorchAt(nx,ny))return;return}const solidProp=v18SolidDecorationAt(nx,ny);if(solidProp){const hint=solidProp.type==='weaponRack'?'RASTRELLIERA':solidProp.type==='armorStand'?'ARMATURA':solidProp.type==='workbench'?'TAVOLO DA LAVORO':solidProp.type==='archiveBookshelf'?'LIBRERIA':solidProp.type==='archiveWritingDesk'?'SCRITTOIO':'SARCOFAGO';s._v18DecorBlockedHints=s._v18DecorBlockedHints||new Set();if(!s._v18DecorBlockedHints.has(solidProp.type)){s._v18DecorBlockedHints.add(solidProp.type);showToast('⛔ '+hint+' · PASSAGGIO BLOCCATO')}return}const pd=s.keyPuzzle?.door;if(pd&&!pd.open&&nx===pd.x&&ny===pd.y){pd.seen=true;const kp=s.keyPuzzle,[a,b,c]=lockedDoorHelp(kp);log('🔒 '+b);if(puzzleKnown(kp.floor)){showToast(compactPuzzleMessage(kp,'door'))}else if(!pd.explained){pd.explained=true;openPuzzlePanel(a,b,c)}else showToast(pd.progression?'🔒 VARCO SIGILLATO · SEGUI LA SOGLIA':'🔒 CAMERA SIGILLATA · TROVA LA CHIAVE');return}const target=enemyAt(nx,ny);if(target){if(eqWeapon().family==='axe'){axeAttack();return}const ts=validTargets().filter(e=>targetAttackable(e));if(ts.length<=1){attackSingle(target);return}s.targetMode=true;s.targetIds=ts.map(e=>e.id);s.targetIndex=Math.max(0,ts.findIndex(e=>e.id===target.id));log('🎯 Più bersagli a portata: scegli chi colpire.');render();return}if(eqWeapon().family==='spear'){const fx=s.player.x+dx*2,fy=s.player.y+dy*2,far=inBounds(fx,fy)?enemyAt(fx,fy):null;if(far&&targetAttackable(far)){log('🔱 Affondo a distanza.');attackSingle(far);return}}const px0=s.player.x,py0=s.player.y;s.player.x=nx;s.player.y=ny;beginPlayerMove(px0,py0,nx,ny);playSfx(areaKindAt(nx,ny)==='corridor'?'stepCorridor':'stepRoom');crossPhysicalThreshold(px0,py0,nx,ny);onPuzzleStep(dx,dy);updateVisibility();interact();if(!s)return;if(s.eventOpen){addThreat(true,false);enemyTurn();if(s){updateVisibility();checkMissions();render()}return}if(s.map[ny][nx]==='>'){if(bossAlive()){log('🔒 Le scale sono sigillate finché il boss del piano è vivo.');showToast('🔒 SCONFIGGI IL BOSS');addThreat(true,false);enemyTurn();if(s){updateVisibility();render()}return}completeStealthFloor();playSfx('stairs');s.atStairs=true;root.querySelector('#stairsPanel').classList.remove('hidden');render();return}addThreat(true,false);let ambush=null;if(eqWeapon().family==='dagger')ambush=s.enemies.find(e=>canBackstab(e));if(ambush){s.ambushId=ambush.id;log('🔪 Imboscata pronta.')}enemyTurn(ambush?ambush.id:null);if(!s)return;updateVisibility();checkMissions();render()}
function useHealItem(item){if(!s||s.eventOpen||s.rewardOpen||!item||item.kind!=='heal')return;if(s.hp>=s.maxHp){log('❤️ Vita già al massimo.');return}const idx=s.inventory.indexOf(item);if(idx<0)return;playSfx('heal');const h=HEALS[item.id],gained=healPlayer(h.heal);s.inventory.splice(idx,1);meta.healsUsed++;saveMeta();log('🧪 '+h.name+': +'+gained+' HP.');render()}
function useHeal(){if(!s||s.eventOpen||s.rewardOpen)return;const item=s.inventory.find(i=>i.kind==='heal');if(!item){log('Nessuna pozione.');return}useHealItem(item)}
function discardItem(item){if(!s||!item)return;const idx=s.inventory.indexOf(item);if(idx<0)return;if(item.kind==='weapon'){const name=W[item.id].name,wasEq=s.equippedUid===item.uid;s.inventory.splice(idx,1);s.loot.push({x:s.player.x,y:s.player.y,kind:'weapon',id:item.id,uses:item.uses,seen:true});if(wasEq){const next=s.inventory.find(x=>x.kind==='weapon');s.equippedUid=next?next.uid:null}s.ambushId=null;log('🗑️ Lasci a terra '+name+' ('+item.uses+' KO rimasti).')}else{s.inventory.splice(idx,1);s.loot.push({x:s.player.x,y:s.player.y,kind:'heal',id:item.id,seen:true});log('🗑️ Lasci a terra '+HEALS[item.id].name+'.')}render()}
function equip(uid){playSfx('weaponSwitch');const i=s.inventory.find(x=>x.kind==='weapon'&&x.uid===uid);if(!i)return;cancelTargeting(false);s.equippedUid=uid;s.ambushId=null;log('⚔️ Equipaggi '+W[i.id].name+'.');render()}

function weaponExpectedScore(item){
 const w=W[item.id];if(!w)return -1;
 let avg=(w.min+w.max)/2;
 if(w.crit)avg*=1+w.crit;
 if(w.miss)avg*=1-w.miss;
 return avg*100+Math.max(0,item.uses||0)*8
}
function bestWeaponOfFamily(family){
 return s.inventory.filter(i=>i.kind==='weapon'&&W[i.id]?.family===family&&i.uses>0).sort((a,b)=>weaponExpectedScore(b)-weaponExpectedScore(a))[0]||null
}
function quickEquipFamily(family){
 if(!s||s.eventOpen||s.rewardOpen||s.atStairs)return;
 const item=bestWeaponOfFamily(family);
 if(!item){showToast('⚔️ Nessuna '+F[family].name);return}
 equip(item.uid);showToast(familyGlyph(family)+' '+W[item.id].name)
}
function renderQuickWeapons(){
 const box=root.querySelector('#quickWeapons');if(!box||!s)return;
 const order=['spear','sword','dagger','axe','hammer'],active=eqWeapon().family;
 box.innerHTML='';
 for(const family of order){
   const item=bestWeaponOfFamily(family),b=document.createElement('button');
   b.type='button';b.className='quick-weapon-btn'+(family===active?' active':'')+(!item?' empty':'');
   b.title=item?('Equipaggia '+W[item.id].name):('Nessuna '+F[family].name);
   b.innerHTML=`${iconHTML(weaponIconKey(family),'quick-family-icon',F[family].name)}${item?`<span class="quick-weapon-uses">${item.uses}</span>`:''}`;
   b.disabled=!item;b.onclick=()=>quickEquipFamily(family);box.appendChild(b)
 }
}
function openReward(){playSfx('event');root.querySelector('#stairsPanel').classList.add('hidden');root.querySelector('#rewardPanel').classList.remove('hidden');s.rewardOpen=true;const c=REWARDS.filter(r=>!s.buffs.has(r.id)),p=[];while(p.length<3&&c.length)p.push(c.splice(rand(0,c.length-1),1)[0]);const box=root.querySelector('#rewardChoices');box.innerHTML='';p.forEach(r=>{const b=document.createElement('button');b.type='button';b.innerHTML=`<div class="reward-icon">${iconHTML(rewardIconKey(r.id),'icon-inline icon-xl')}</div><div class="reward-name">${r.name}</div><div class="reward-desc">${r.text}</div>`;b.onclick=()=>{s.buffs.add(r.id);if(r.id==='vital'){s.maxHp+=6;s.hp=Math.min(s.maxHp,s.hp+6)}s.rewardOpen=false;root.querySelector('#rewardPanel').classList.add('hidden');descend();root.focus()};box.appendChild(b)})}
function descend(){clearMotion();root.querySelector('#dangerPanel').classList.add('hidden');for(const c of Object.values(s.chains||{}))if(c.spawned&&!c.done)c.spawned=false;cancelTargeting(false);s.floor++;s.torchLightLevel=Math.max(0,torchLight()-15);s.alarm=Math.max(0,s.alarm-20);s.instability=0;s.alarmStage=Math.floor(s.alarm/25);s.instStage=0;s.atStairs=false;s.floorAlerted=false;s.floorStealthCounted=false;s.ambushId=null;s.guard=false;s.riposteReady=false;s.artifactUsedThisTurn=false;s.discoveredRoles=new Set();Object.assign(s,generateFloor(s.floor));v18RoomDecor();initAmbientRoutines();applyCartographer();applyPathfinder();updateVisibility();checkMissions();log('⬇️ Piano '+s.floor+'.');const pmsg=s.floor===2?'🗿 Soglia: nessuna chiave fisica. Leggi la Stele, trova il Sigillo dorato e usa Aspetta una volta.':s.floor===3?'🗿 Soglia: leggi la Stele e segui dalla sua casella le 5 direzioni indicate.':s.floor===4?'🚪 Varco Centrale obbligatorio: decifra le rune e usa Aspetta 3 volte sul Sigillo dorato.':'🚪 Varco Centrale obbligatorio: avanza LUNA → LAMA → OCCHIO, poi usa Aspetta sul Sigillo del Varco davanti alla porta.';log(pmsg);render();showFloorSplash()}
function finishRun(kind,clear=false){
 const run=s;if(!run)return;clearMotion();
 const missions=run.missions.filter(m=>m.done).length,rawGold=run.runCoins,oldBestFloor=meta.bestFloor||0,oldShopRank=shopRankForDepth(oldBestFloor),rate=extractionRate(run.floor);
 const insured=kind==='death'&&has('insurance')?Math.floor(rawGold*.15):0,saved=kind==='death'?insured:extractionValue(rawGold,run.floor),lost=kind==='death'?Math.max(0,rawGold-insured):Math.max(0,rawGold-saved);
 if(kind==='death'){if(saved>0)bank+=saved;meta.deaths++;meta.winStreak=0}else{bank+=saved;meta.extractions++;meta.goldExtracted+=saved;if(clear){meta.clears++;meta.winStreak++}else meta.winStreak=0}
 meta.bestGold=Math.max(meta.bestGold,saved);meta.bestFloor=Math.max(meta.bestFloor,run.floor);meta.bestMissions=Math.max(meta.bestMissions,missions);meta.bestBackstabs=Math.max(meta.bestBackstabs,run.stats.backstabs);meta.bestWinStreak=Math.max(meta.bestWinStreak,meta.winStreak);firstRun=false;
 const depthBonus=depthFirstReward(run.floor);if(depthBonus>0)bank+=depthBonus;
 const newShopRank=shopRankForDepth(meta.bestFloor),shopRankGain=newShopRank>oldShopRank?newShopRank:0;
 const newUnlocks=OBJECTIVES.filter(o=>o.get(meta)>=o.target&&!run.objectivesAtStart.has(o.id)).map(o=>o.name),newBaseHp=resilienceMaxHp(),resilienceGain=Math.max(0,newBaseHp-(run.resilienceHpStart||45));
 lastRunResult={kind,clear,floor:run.floor,kills:run.kills,rawGold,rate,saved,lost,depthBonus,shopRankGain,missions,backstabs:run.stats.backstabs,specialRooms:run.stats.specialRooms,miniboss:run.stats.minibossKills,boss:run.stats.bossKills,newUnlocks,resilienceGain,newBaseHp};playSfx(kind==='death'?'death':'extract');saveMeta();s=null;showRunSummary(lastRunResult)
}
function extract(clear=false){finishRun('extract',clear)}function die(){finishRun('death',false)}
function showRunSummary(r){root.querySelector('#game').classList.add('hidden');root.querySelector('#hub').classList.add('hidden');const box=root.querySelector('#runSummary');box.classList.remove('hidden');const title=r.kind==='death'?'☠️ Run terminata':r.clear?'🏆 Dungeon completato':'🏕️ Estrazione riuscita';root.querySelector('#summaryTitle').textContent=title;root.querySelector('#summarySubtitle').textContent=r.kind==='death'?(r.saved>0?'Assicurazione: una parte dell’oro è tornata all’Accampamento.':'L’oro della run è andato perduto.'):`Piano ${r.floor}: ${Math.round(r.rate*100)}% dell’oro della run è stato bancato.`;const stats=[['Piano',r.floor+'/5'],['KO',r.kills],['Oro raccolto',r.rawGold],['Tasso estrazione',r.kind==='death'?'—':Math.round(r.rate*100)+'%'],['Oro salvato',r.saved],['Oro perso',r.lost],['Missioni',r.missions+'/3'],['Backstab',r.backstabs],['Stanze speciali',r.specialRooms],['Boss',r.boss?'Finale':r.miniboss?'Miniboss':'—']];root.querySelector('#summaryStats').innerHTML=stats.map(([k,v])=>`<div class="summary-stat"><span>${k}</span><strong>${v}</strong></div>`).join('');const u=root.querySelector('#summaryUnlocks');const notes=[];if(r.shopRankGain)notes.push(`<div class="record-note progression-pop"><strong>🛒 NUOVO LIVELLO NEGOZIO · Rango ${ROMAN_RANK[r.shopRankGain]}</strong><br>Nuove carte sono disponibili all’Accampamento.</div>`);if(r.depthBonus>0)notes.push(`<div class="record-note progression-pop"><strong>⬇️ Ricompensa profondità · +${r.depthBonus} oro permanente</strong><br>Premio unico per aver raggiunto una nuova profondità.</div>`);if(r.newUnlocks.length)notes.push(`<div><strong>🎯 Nuovi obiettivi completati</strong><div class="record-note">${r.newUnlocks.join(' · ')} · riscatta i premi all’Accampamento</div></div>`);else notes.push(`<div><strong>📈 Record permanenti</strong><div class="record-note">Miglior oro ${meta.bestGold} · Piano ${meta.bestFloor}/5 · Missioni ${meta.bestMissions}/3 · Backstab ${meta.bestBackstabs} · Serie ${meta.bestWinStreak}</div></div>`);if(r.resilienceGain>0)notes.push(`<div class="record-note" style="margin-top:8px"><strong>❤️ Resilienza aumentata</strong> · Vita base permanente +${r.resilienceGain} → ${r.newBaseHp} HP dalla prossima run.</div>`);u.innerHTML=notes.join('');const verdict=runSummaryVerdict(r),vb=root.querySelector('#summaryVerdict');if(vb)vb.innerHTML=`<strong>${verdict.title}</strong><span>${verdict.text}</span>`}
function returnToHub(){root.querySelector('#runSummary').classList.add('hidden');root.querySelector('#hub').classList.remove('hidden');const banner=root.querySelector('#banner');if(lastRunResult){banner.classList.remove('hidden');banner.textContent=lastRunResult.kind==='death'?'☠️ Ultima run: morte al piano '+lastRunResult.floor:lastRunResult.clear?'🏆 Ultima run: dungeon completato · +'+lastRunResult.saved+' oro':'🏕️ Ultima run: +'+lastRunResult.saved+' oro bancati al '+Math.round(lastRunResult.rate*100)+'%.'}renderHub()}

function renderInv(){const box=root.querySelector('#inventory');box.innerHTML='';s.inventory.forEach(i=>{const row=document.createElement('div');row.className='inv-row';const main=document.createElement('div');main.className='inv-main';const actions=document.createElement('div');actions.className='inv-actions';if(i.kind==='weapon'){const w=W[i.id];main.innerHTML=`<div class="inv-title">${iconHTML(weaponIconKey(w.family),'icon-inline icon-md')} ${w.name}</div><div class="inv-meta">${w.min}-${w.max} danni · ${i.uses} KO</div>`;const use=document.createElement('button');use.type='button';use.textContent=s.equippedUid===i.uid?'✓ Equipaggiata':'Equipaggia';use.disabled=s.equippedUid===i.uid;use.onclick=()=>{equip(i.uid);root.focus()};const drop=document.createElement('button');drop.type='button';drop.className='danger-action';drop.textContent='Lascia';drop.onclick=()=>{discardItem(i);root.focus()};actions.append(use,drop)}else{main.innerHTML=`<div class="inv-title">${iconHTML('potion','icon-inline icon-md')} ${HEALS[i.id].name}</div><div class="inv-meta">Cura base ${HEALS[i.id].heal} HP · azione gratuita</div>`;const use=document.createElement('button');use.type='button';use.textContent='Usa';use.disabled=s.hp>=s.maxHp;use.onclick=()=>{useHealItem(i);root.focus()};const drop=document.createElement('button');drop.type='button';drop.className='danger-action';drop.textContent='Lascia';drop.onclick=()=>{discardItem(i);root.focus()};actions.append(use,drop)}row.append(main,actions);box.appendChild(row)})}
function renderMissions(){let done=0;const boxes=[root.querySelector('#missionStrip'),root.querySelector('#missionStripSheet')].filter(Boolean);boxes.forEach(box=>box.innerHTML='');s.missions.forEach(m=>{if(m.done)done++;const p=Math.min(m.target,m.get(s));boxes.forEach(box=>{const el=document.createElement('div');el.className='mission-card';el.innerHTML=`<div class="mission-head"><strong>${iconHTML(missionIconKey(m.id),'icon-inline icon-md')} ${m.name}</strong><span>${m.done?'✓':p+'/'+m.target}</span></div><div class="mission-desc">${m.desc}</div><div class="mission-progress"><div style="width:${Math.round(p/m.target*100)}%"></div></div><div class="mission-reward">+${m.reward} oro</div>`;box.appendChild(el)})});const count=done+'/3';const mc=root.querySelector('#missionCount');if(mc)mc.textContent=count;const mcs=root.querySelector('#missionCountSheet');if(mcs)mcs.textContent=count}
function renderBuffs(){const box=root.querySelector('#runBuffs');box.innerHTML='';if(!s.buffs.size){box.innerHTML='<span class="empty-note">Nessun bonus temporaneo.</span>';return}for(const id of s.buffs){const r=REWARDS.find(x=>x.id===id),sp=document.createElement('span');sp.className='buff-chip';sp.innerHTML=iconHTML(rewardIconKey(r.id),'icon-inline icon-md')+' '+r.name;box.appendChild(sp)}}
function camera(){const h=Math.floor(VIEW/2);return{sx:Math.max(0,Math.min(WORLD-VIEW,s.player.x-h)),sy:Math.max(0,Math.min(WORLD-VIEW,s.player.y-h))}}
function lp(x,y,c){return{x:(x-c.sx)*CELL,y:(y-c.sy)*CELL}}
function inc(x,y,c){return x>=c.sx&&y>=c.sy&&x<c.sx+VIEW&&y<c.sy+VIEW}
function fillTile(x,y,c,color,stroke){if(!inc(x,y,c)||!s.visible.has(K(x,y)))return;const p=lp(x,y,c);ctx.fillStyle=color;ctx.fillRect(p.x+2,p.y+2,CELL-4,CELL-4);ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.strokeRect(p.x+3,p.y+3,CELL-6,CELL-6)}
function drawBossTelegraph(c){const b=floorBoss();if(!b||b.bossKind!=='final'||!b.telegraph)return;for(const d of Object.values(DIR)){const x=b.x+d.x,y=b.y+d.y;if(!inBounds(x,y)||s.map[y][x]==='#'||!s.visible.has(K(x,y))||!inc(x,y,c))continue;const p=lp(x,y,c);ctx.save();ctx.fillStyle='rgba(225,74,62,.28)';ctx.fillRect(p.x+2,p.y+2,CELL-4,CELL-4);ctx.strokeStyle='#ff755f';ctx.lineWidth=3;ctx.strokeRect(p.x+4,p.y+4,CELL-8,CELL-8);ctx.fillStyle='#ffd4cc';ctx.font='bold 10px sans-serif';ctx.fillText('PERICOLO',p.x+CELL/2,p.y+CELL/2);ctx.restore()}}
function enemyVisionOverlay(){
 const signature=s.floor+'|'+s.player.x+','+s.player.y+'|'+(s.instability>=75?1:0)+'|'+s.enemies.filter(e=>e.hp>0).map(e=>e.id+':'+e.x+','+e.y+','+e.facing+','+e.state).join(';');
 if(s._visionOverlayCache?.signature===signature)return s._visionOverlayCache.cells;
 const cells=[];
 for(const e of s.enemies){
  if(e.hp<=0||!s.visible.has(K(e.x,e.y)))continue;
  if(mobileUI()&&cheb(e,s.player)>5&&e.state!=='alerted')continue;
  const color=e.state==='alerted'?'rgba(220,64,64,.22)':e.state==='suspicious'?'rgba(232,151,55,.18)':'rgba(215,115,70,.13)';
  for(let y=e.y-e.vision;y<=e.y+e.vision;y++)for(let x=e.x-e.vision;x<=e.x+e.vision;x++)if(s.visible.has(K(x,y))&&enemyCanSeeTile(e,x,y))cells.push({x,y,color});
 }
 s._visionOverlayCache={signature,cells};return cells
}
function drawEnemyVision(c){for(const cell of enemyVisionOverlay()){if(!inc(cell.x,cell.y,c))continue;const p=lp(cell.x,cell.y,c);ctx.fillStyle=cell.color;ctx.fillRect(p.x+2,p.y+2,CELL-4,CELL-4)}}
function drawWeaponPreview(c){if(!previewEnabled)return;const w=eqWeapon();if(w.family==='spear'){for(const d of Object.values(DIR))for(let n=1;n<=2;n++){const x=s.player.x+d.x*n,y=s.player.y+d.y*n;if(s.map[y]?.[x]==='#'||v18SolidDecorationAt(x,y))break;fillTile(x,y,c,'rgba(80,180,225,.20)','#77c7e8');const hit=enemyAt(x,y);if(hit){if(has('spearMaster')){const rx=x+d.x,ry=y+d.y;if(inBounds(rx,ry)&&s.map[ry]?.[rx]!=='#'&&enemyAt(rx,ry)&&s.visible.has(K(rx,ry)))fillTile(rx,ry,c,'rgba(120,220,255,.30)','#a8eaff')}break}}}else if(w.family==='axe'){for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(dx||dy){const x=s.player.x+dx,y=s.player.y+dy;if(s.map[y]?.[x]!=='#')fillTile(x,y,c,'rgba(225,145,65,.20)','#e3a15d')}}else if(w.family==='sword'){for(const d of Object.values(DIR)){const x=s.player.x+d.x,y=s.player.y+d.y;if(s.map[y]?.[x]!=='#')fillTile(x,y,c,'rgba(90,130,220,.18)','#83a9e8')}const p=lp(s.player.x,s.player.y,c);drawIcon('guard',p.x+CELL-14,p.y+2,12,0.95)}else if(w.family==='dagger'){for(const e of s.enemies){if(e.hp<=0||!s.visible.has(K(e.x,e.y))||e.state==='alerted'||!daggerAdv(e)||!behindFree(e))continue;const b=behindTile(e);fillTile(b.x,b.y,c,'rgba(90,190,105,.30)','#8ed39a')}}else if(w.family==='hammer'){for(const d of Object.values(DIR)){const x=s.player.x+d.x,y=s.player.y+d.y;if(s.map[y]?.[x]==='#')continue;fillTile(x,y,c,'rgba(160,100,210,.18)','#bd91df');const e=enemyAt(x,y);if(e){const px=e.x+d.x,py=e.y+d.y,blocked=px<0||py<0||px>=WORLD||py>=WORLD||s.map[py]?.[px]==='#'||!bossArenaContains(e,px,py)||enemyAt(px,py,e.id),p=lp(e.x,e.y,c);ctx.fillStyle=blocked?'#f1a0bd':'#e3c2ff';ctx.font=blocked?'bold 7px sans-serif':'bold 16px sans-serif';ctx.fillText(blocked?(e.boss?'RESISTE':'STUN'):d.x>0?'→':d.x<0?'←':d.y>0?'↓':'↑',p.x+CELL/2,p.y+6)}}}}
function drawWeaponPickup(l,c){const w=W[l.id],p=lp(l.x,l.y,c);ctx.save();ctx.fillStyle='rgba(16,18,24,.85)';ctx.beginPath();ctx.roundRect(p.x+4,p.y+4,CELL-8,CELL-8,6);ctx.fill();ctx.strokeStyle=FC[w.family];ctx.lineWidth=2;ctx.stroke();drawIcon(weaponIconKey(w.family),p.x+5,p.y+5,CELL-10,s.visible.has(K(l.x,l.y))?1:.55);ctx.restore()}

// v17.14.1 — original character images restored; animation transforms now act directly on them.
function drawEnemy(e,c,now=animNow()){
 if(e.boss&&!e._worldIntro){e._worldIntro=true;burst('bossIntro',e.x,e.y)}
 const vs=enemyVisualState(e,now),p=lpFloat(vs.x,vs.y,c),r=Math.max(0,e.hp/e.maxHp),selected=s.targetMode&&currentTarget()?.id===e.id,baseX=p.x+vs.hitX,baseY=p.y+vs.hitY+vs.bob;
 drawGroundShadowPx(p.x+CELL/2,p.y+CELL*.79,e.boss?1.18:.86,e.boss?.34:.24);
 ctx.save();ctx.translate(baseX+CELL/2,baseY+CELL/2);ctx.rotate(vs.rot);ctx.scale(vs.scale,vs.scale);ctx.translate(-CELL/2,-CELL/2);
 ctx.fillStyle='rgba(10,12,18,.62)';ctx.beginPath();ctx.roundRect(3,3,CELL-6,CELL-6,8);ctx.fill();
 const borderColor=selected?'#78a9ff':e.boss?'#f3c969':e.dangerElite?'#ff8b98':e.state==='alerted'?'#ff6b6b':e.state==='suspicious'?'#ffd166':'rgba(15,18,22,.95)';ctx.strokeStyle=borderColor;ctx.lineWidth=selected?5:e.boss?4:3;ctx.strokeRect(4,4,CELL-8,CELL-8);
 // Original enemy image with alternate walk frame while moving.
 drawAnimatedIcon(enemyFamilyIconKey(e.family),0,-1,CELL,1,{walking:vs.walking&&!vs.attack,frame:vs.frame,attacking:!!vs.attack,attackFamily:e.family,attackPhase:vs.attack?((now-vs.attack.start)/vs.attack.dur):0});
 if(vs.attack&&animLive(vs.attack,now)){const at=(now-vs.attack.start)/vs.attack.dur,aq=Math.sin(at*Math.PI),ad=DIR[e.facing]||DIR.down;ctx.save();ctx.globalAlpha=Math.max(0,1-at);ctx.strokeStyle=FC[e.family]||'#ff9b8f';ctx.lineWidth=Math.max(2,CELL*.07);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(CELL/2-ad.x*CELL*.05,CELL/2-ad.y*CELL*.05);ctx.lineTo(CELL/2+ad.x*CELL*.35*aq,CELL/2+ad.y*CELL*.35*aq);ctx.stroke();ctx.restore()}
 drawFacingNotch(e.facing,0,0,CELL,e.state==='alerted'?'#ffb1b1':e.state==='suspicious'?'#ffe29b':'#eef3ff');
 const hbX=3,hbY=CELL-7,hbW=CELL-6,hbH=5;ctx.fillStyle='rgba(0,0,0,.72)';ctx.fillRect(hbX,hbY,hbW,hbH);ctx.fillStyle=r>.5?'#7fcf83':r>.25?'#d4b65b':'#d66a6a';ctx.fillRect(hbX+1,hbY+1,Math.max(0,(hbW-2)*r),hbH-2);
 if(targetAttackable(e)){const m=matchup(eqWeapon().family,e.family);ctx.beginPath();ctx.arc(CELL-7,7,6,0,Math.PI*2);ctx.fillStyle=m>1?'#67d27a':m<1?'#e46a6a':'#aab3bd';ctx.fill();ctx.strokeStyle='#111';ctx.lineWidth=1;ctx.stroke()}
 if(canBackstab(e))drawIcon('backstab',CELL-15,-15,14,1);ctx.restore()
}
function drawRareEventObject(ev,c,alpha=1){if(!ev||ev.used||!inc(ev.x,ev.y,c))return;const d=EVENTS[ev.type],p=lp(ev.x,ev.y,c),cx=p.x+CELL/2,cy=p.y+CELL/2;ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle='rgba(12,14,18,.82)';ctx.strokeStyle='rgba(230,230,255,.15)';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(p.x+4,p.y+4,CELL-8,CELL-8,7);ctx.fill();ctx.stroke();drawIcon(eventIconKey(ev.type),p.x+3,p.y+3,CELL-6,s.visible.has(K(ev.x,ev.y))?1:.65);if(s.visible.has(K(ev.x,ev.y))&&cheb(ev,s.player)<=2&&d){ctx.font='bold 9px sans-serif';const label=d.name.length>22?d.name.slice(0,21)+'…':d.name;const w=Math.min(CELL*4.2,ctx.measureText(label).width+18),lx=Math.max(2,Math.min(canvas.width-w-2,cx-w/2)),ly=Math.max(2,p.y-16);ctx.fillStyle='rgba(6,8,11,.88)';ctx.fillRect(lx,ly,w,14);ctx.strokeStyle='rgba(255,255,255,.16)';ctx.lineWidth=1;ctx.strokeRect(lx,ly,w,14);ctx.fillStyle='#f2eee5';ctx.fillText(label,lx+w/2,ly+7)}ctx.restore();}

function roomTorchCandidates(r,map){
  const out=[];
  const add=(x,y,side,ax,ay)=>{if(!inBounds(x,y)||map[y]?.[x]!=='#')return;out.push({x,y,side,ax,ay})};
  add(r.cx,r.y-1,'top',r.cx,r.y);
  add(r.cx,r.y+r.h,'bottom',r.cx,r.y+r.h-1);
  add(r.x-1,r.cy,'left',r.x,r.cy);
  add(r.x+r.w,r.cy,'right',r.x+r.w-1,r.cy);
  return out;
}
function oppositeTorchSide(side){return side==='top'?'bottom':side==='bottom'?'top':side==='left'?'right':'left'}
function themedRoomLight(room,map,floor){
  const area=room.w*room.h,h=((room.cx*73856093)^(room.cy*19349663)^(floor*83492791)^(area*2654435761))>>>0;
  const chance=area>=56?.40:area>=36?.29:area>=24?.18:.08;
  if(((h%1000)/1000)>chance)return null;
  const spots=[];
  for(let y=room.y+1;y<room.y+room.h-1;y++)for(let x=room.x+1;x<room.x+room.w-1;x++)if(map[y]?.[x]==='.')spots.push({x,y});
  if(!spots.length)return null;
  // Avoid always using the centre: pick deterministic edge/interior positions.
  spots.sort((a,b)=>Math.abs(b.x-room.cx)+Math.abs(b.y-room.cy)-Math.abs(a.x-room.cx)-Math.abs(a.y-room.cy));
  const pick=spots[(h>>>4)%Math.max(1,Math.ceil(spots.length*.72))],choice=(h>>>3)%5;
  if(floor===1)return {kind:'lantern',x:pick.x,y:pick.y,ax:pick.x,ay:pick.y,side:'free',radius:3.75,seed:h,colorCore:'rgba(255,231,170,.96)',colorMid:'rgba(255,198,112,.84)',colorGlowA:'rgba(255,188,88,.28)',colorGlowB:'rgba(255,138,48,.12)'};
  if(floor===2)return {kind:'fungus',x:pick.x,y:pick.y,ax:pick.x,ay:pick.y,side:'free',radius:3.90,seed:h,colorCore:'rgba(195,255,198,.92)',colorMid:'rgba(116,255,170,.82)',colorGlowA:'rgba(92,255,170,.32)',colorGlowB:'rgba(48,170,122,.14)'};
  if(floor===3)return {kind:'orb',x:pick.x,y:pick.y,ax:pick.x,ay:pick.y,side:'free',radius:4.00,seed:h,colorCore:'rgba(239,214,255,.94)',colorMid:'rgba(191,122,255,.84)',colorGlowA:'rgba(167,92,255,.31)',colorGlowB:'rgba(96,54,170,.14)'};
  if(floor===4){
    if(choice%2===0)return {kind:'fungus',x:pick.x,y:pick.y,ax:pick.x,ay:pick.y,side:'free',radius:3.80,seed:h,colorCore:'rgba(208,255,255,.92)',colorMid:'rgba(124,214,255,.82)',colorGlowA:'rgba(112,168,255,.28)',colorGlowB:'rgba(86,64,170,.12)'};
    return {kind:'orb',x:pick.x,y:pick.y,ax:pick.x,ay:pick.y,side:'free',radius:3.95,seed:h,colorCore:'rgba(224,212,255,.94)',colorMid:'rgba(144,122,255,.86)',colorGlowA:'rgba(118,102,255,.30)',colorGlowB:'rgba(80,52,170,.13)'};
  }
  if(choice%2===0)return {kind:'brazier',x:pick.x,y:pick.y,ax:pick.x,ay:pick.y,side:'free',radius:4.00,seed:h,colorCore:'rgba(255,206,196,.94)',colorMid:'rgba(255,92,82,.86)',colorGlowA:'rgba(255,72,92,.32)',colorGlowB:'rgba(124,26,46,.15)'};
  return {kind:'orb',x:pick.x,y:pick.y,ax:pick.x,ay:pick.y,side:'free',radius:3.95,seed:h,colorCore:'rgba(242,206,255,.94)',colorMid:'rgba(198,92,255,.86)',colorGlowA:'rgba(168,72,255,.29)',colorGlowB:'rgba(102,34,140,.13)'};
}
function buildTorchSet(rooms,map,start,far,progressionGate,floorOverride=null){
  const lights=[],used=new Set(),floor=floorOverride??s?.floor??1;
  const roomAt=(x,y)=>rooms.find(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h)||null;
  const isRoomTile=(x,y)=>!!roomAt(x,y);
  const addLight=(obj)=>{if(!obj)return;const key=K(obj.x,obj.y)+'|'+(obj.kind||'torch');if(used.has(key))return;used.add(key);lights.push(obj)};
  const addTorch=(cand,radius=.3,room=null,extra={})=>{if(!cand)return;const seed=((cand.x*73856093)^(cand.y*19349663))>>>0;addLight({kind:'torch',harvestable:true,harvested:false,x:cand.x,y:cand.y,ax:cand.ax,ay:cand.ay,side:cand.side,radius,seed,roomCx:room?.cx??cand.ax,roomCy:room?.cy??cand.ay,colorCore:'rgba(255,244,194,.92)',colorMid:'rgba(255,141,40,.97)',colorGlowA:'rgba(255,178,78,.20)',colorGlowB:'rgba(255,95,20,.08)',...extra})};
  const roomHasSource=r=>lights.some(t=>t.ax>=r.x&&t.ax<r.x+r.w&&t.ay>=r.y&&t.ay<r.y+r.h);
  const corridorLightFor=(x,y)=>{
    const h=((x*73856093)^(y*19349663)^(floor*83492791))>>>0;
    if(floor===1)return {kind:'lantern',x,y,ax:x,ay:y,side:'free',radius:4.15,seed:h,reveal:'corridorOnly',colorCore:'rgba(255,231,170,.96)',colorMid:'rgba(255,198,112,.84)',colorGlowA:'rgba(255,188,88,.30)',colorGlowB:'rgba(255,138,48,.13)'};
    if(floor===2)return {kind:'fungus',x,y,ax:x,ay:y,side:'free',radius:4.25,seed:h,reveal:'corridorOnly',colorCore:'rgba(195,255,198,.92)',colorMid:'rgba(116,255,170,.82)',colorGlowA:'rgba(92,255,170,.34)',colorGlowB:'rgba(48,170,122,.15)'};
    if(floor===3)return {kind:'orb',x,y,ax:x,ay:y,side:'free',radius:4.35,seed:h,reveal:'corridorOnly',colorCore:'rgba(239,214,255,.94)',colorMid:'rgba(191,122,255,.84)',colorGlowA:'rgba(167,92,255,.35)',colorGlowB:'rgba(96,54,170,.15)'};
    if(floor===4)return {kind:'orb',x,y,ax:x,ay:y,side:'free',radius:4.20,seed:h,reveal:'corridorOnly',colorCore:'rgba(224,236,255,.92)',colorMid:'rgba(124,182,255,.82)',colorGlowA:'rgba(112,168,255,.30)',colorGlowB:'rgba(86,64,170,.13)'};
    return {kind:'brazier',x,y,ax:x,ay:y,side:'free',radius:4.25,seed:h,reveal:'corridorOnly',colorCore:'rgba(255,206,196,.94)',colorMid:'rgba(255,92,82,.86)',colorGlowA:'rgba(255,72,92,.35)',colorGlowB:'rgba(124,26,46,.15)'};
  };
  for(const room of rooms){
    const candidates=roomTorchCandidates(room,map);if(!candidates.length)continue;
    const area=room.w*room.h,hash=((room.cx*73856093)^(room.cy*19349663)^(area*83492791))>>>0,roll=((hash>>>6)%1000)/1000;
    let desired=0;
    if(area>=58) desired=roll<.55?2:roll<.88?1:0;
    else if(area>=36) desired=roll<.62?1:0;
    else if(area>=24) desired=roll<.38?1:0;
    else desired=roll<.15?1:0;
    if(desired){
      const first=candidates[hash%candidates.length];addTorch(first,area>=48?3.95:3.35,room);
      if(desired>1){const opp=candidates.find(c=>c.side===oppositeTorchSide(first.side))||candidates[(hash+1)%candidates.length];addTorch(opp,3.65,room)}
    }
    const extra=themedRoomLight(room,map,floor);if(extra)addLight(extra);
  }
  // Corridor lights: occasional, sparse, and visible only when the player actually enters the corridor.
  const corridorCandidates=[];
  for(let y=1;y<map.length-1;y++)for(let x=1;x<map[0].length-1;x++){
    if(map[y][x]!=='.' || isRoomTile(x,y))continue;
    const n=map[y-1][x]==='.', s2=map[y+1][x]==='.', e=map[y][x+1]==='.', w=map[y][x-1]==='.';
    const count=(n?1:0)+(s2?1:0)+(e?1:0)+(w?1:0);
    if(count<2||count>3)continue;
    const straight=(n&&s2&&!e&&!w)||(e&&w&&!n&&!s2);
    const corner=(count===2)&&!straight;
    const junction=count===3;
    if(!(straight||corner||junction))continue;
    const h=((x*73856093)^(y*19349663)^(floor*83492791))>>>0;
    const nearRoom = !!roomAt(x-1,y)||!!roomAt(x+1,y)||!!roomAt(x,y-1)||!!roomAt(x,y+1);
    if(nearRoom)continue; // avoid immediately lighting room thresholds
    corridorCandidates.push({x,y,h,priority:junction?3:(corner?2:1)});
  }
  corridorCandidates.sort((a,b)=>a.h-b.h);
  const wanted=Math.max(1,Math.round(corridorCandidates.length*(floor<=2?.020:floor===3?.024:.028)));
  for(const cand of corridorCandidates){
    if(lights.filter(t=>t.reveal==='corridorOnly').length>=wanted)break;
    const roll=((cand.h>>>7)%1000)/1000, pass=cand.priority===3?roll<.35:cand.priority===2?roll<.20:roll<.10;
    if(!pass)continue;
    if(lights.some(t=>Math.abs(t.ax-cand.x)+Math.abs(t.ay-cand.y)<7))continue;
    addLight(corridorLightFor(cand.x,cand.y));
  }
  const startRoom=rooms.find(r=>start.x>=r.x&&start.x<r.x+r.w&&start.y>=r.y&&start.y<r.y+r.h);
  if(startRoom&&!roomHasSource(startRoom)){
    const cs=roomTorchCandidates(startRoom,map);if(cs.length)addTorch(cs[((startRoom.cx*31+startRoom.cy*17)>>>0)%cs.length],3.35,startRoom);
  }
  const farRoom=rooms.find(r=>far&&far.x>=r.x&&far.x<r.x+r.w&&far.y>=r.y&&far.y<r.y+r.h);
  if(farRoom&&!roomHasSource(farRoom)){
    const special=themedRoomLight({...farRoom,w:Math.max(farRoom.w,8),h:Math.max(farRoom.h,7)},map,floor);
    if(special)addLight(special);else{const cs=roomTorchCandidates(farRoom,map);if(cs.length)addTorch(cs[0],3.55,farRoom)}
  }
  if(progressionGate){
    const gateTorch={x:progressionGate.x-1,y:progressionGate.y,side:'left',ax:progressionGate.x-1,ay:progressionGate.y};
    const gateTorch2={x:progressionGate.x+1,y:progressionGate.y,side:'right',ax:progressionGate.x+1,ay:progressionGate.y};
    if(map[gateTorch.y]?.[gateTorch.x]==='.')addTorch({x:gateTorch.x-1,y:gateTorch.y,side:'left',ax:gateTorch.x,ay:gateTorch.y},3.55,null);
    if(map[gateTorch2.y]?.[gateTorch2.x]==='.')addTorch({x:gateTorch2.x+1,y:gateTorch2.y,side:'right',ax:gateTorch2.x,ay:gateTorch2.y},3.55,null);
  }
  return lights;
}
function playerInRoom(){return !!s?.rooms?.some(r=>s.player.x>=r.x&&s.player.x<r.x+r.w&&s.player.y>=r.y&&s.player.y<r.y+r.h)}
function playerInCorridor(){return !!s && !playerInRoom()}
function torchKnown(t){
  const visible=!!(s.visible.has(K(t.ax,t.ay))||s.visible.has(K(t.x,t.y)));
  const seen=!!(s.seen.has(K(t.ax,t.ay))||s.seen.has(K(t.x,t.y)));
  if(t.reveal==='corridorOnly') return playerInCorridor() && visible;
  if(t.reveal==='visibleOnly') return visible;
  return visible||seen;
}
function torchPixel(t,c,now=animNow()){
  const p=lp(t.x,t.y,c),
        flicker=prefersReducedMotion()?0:(Math.sin(now/118+t.seed*.0017)*.45+Math.sin(now/83+t.seed*.0031)*.25),
        swayX=prefersReducedMotion()?0:(Math.sin(now/260+t.seed*.0049)*1.15+Math.sin(now/160+t.seed*.0023)*.55),
        swayY=prefersReducedMotion()?0:(Math.cos(now/310+t.seed*.0037)*.35),
        pulse=prefersReducedMotion()?0:(Math.sin(now/145+t.seed*.0021)*.22),
        off=CELL*.38;
  let ox=0,oy=0;
  if(t.side==='top')oy=off;else if(t.side==='bottom')oy=-off;else if(t.side==='left')ox=off;else if(t.side==='right')ox=-off;
  if(t.side==='free' || !t.side){ox+=Math.sin(now/420+t.seed*.0011)*.4; oy+=Math.cos(now/470+t.seed*.0019)*.25;}
  const baseX=p.x+CELL/2+ox,baseY=p.y+CELL/2+oy;
  return{x:baseX+swayX,y:baseY+swayY,flicker,swayX,swayY,flamePulse:pulse,baseX,baseY};
}
function drawTorchSconces(c,now=animNow()){
  if(!s?.torches?.length)return;
  for(const t of s.torches){
    if(t.harvested)continue;
    if(!inc(t.x,t.y,c)||!torchKnown(t))continue;
    const tp=torchPixel(t,c,now),vis=s.visible.has(K(t.ax,t.ay))||s.visible.has(K(t.x,t.y)),a=vis?1:.5;
    const warmStroke='rgba(68,45,26,.95)', warmFill='rgba(88,61,35,.98)';
    ctx.save();ctx.globalAlpha=a;ctx.lineWidth=Math.max(1.7,CELL*.06);ctx.lineCap='round';
    if((t.kind||'torch')==='torch'){
      ctx.strokeStyle=warmStroke;ctx.fillStyle=warmFill;
      if(t.side==='top'||t.side==='bottom'){
        const sy=t.side==='top'?tp.baseY-CELL*.22:tp.baseY+CELL*.22,dir=t.side==='top'?1:-1;
        ctx.beginPath();ctx.moveTo(tp.baseX,sy);ctx.lineTo(tp.baseX,tp.baseY-dir*CELL*.08);ctx.stroke();
        ctx.fillRect(tp.baseX-CELL*.11,sy-CELL*.05,CELL*.22,CELL*.09);
      }else{
        const sx=t.side==='left'?tp.baseX-CELL*.22:tp.baseX+CELL*.22,dir=t.side==='left'?1:-1;
        ctx.beginPath();ctx.moveTo(sx,tp.baseY);ctx.lineTo(tp.baseX-dir*CELL*.08,tp.baseY);ctx.stroke();
        ctx.fillRect(sx-CELL*.05,tp.baseY-CELL*.11,CELL*.09,CELL*.22);
      }
      const fl=3.35+Math.max(-.8,Math.min(.8,tp.flicker))*1.18+tp.flamePulse*.9;
      ctx.shadowColor=t.colorMid||'rgba(255,176,64,.95)';ctx.shadowBlur=13+fl*2.4;
      ctx.fillStyle='rgba(255,132,34,.28)';ctx.beginPath();ctx.arc(tp.x,tp.y+1.2,fl*2.8,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=t.colorMid||'rgba(255,141,40,.97)';ctx.beginPath();ctx.ellipse(tp.x,tp.y+1.15,fl*1.05,fl*1.55,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=t.colorCore||'rgba(255,214,108,.96)';ctx.beginPath();ctx.ellipse(tp.x,tp.y-.25,fl*.6,fl*.92,0,0,Math.PI*2);ctx.fill();
    }else if(t.kind==='lantern'){
      ctx.strokeStyle='rgba(92,74,36,.95)';ctx.fillStyle='rgba(120,96,48,.98)';
      ctx.beginPath();ctx.moveTo(tp.baseX,tp.baseY-CELL*.24);ctx.lineTo(tp.baseX,tp.baseY-CELL*.02);ctx.stroke();
      ctx.fillRect(tp.baseX-CELL*.12,tp.baseY-CELL*.04,CELL*.28,CELL*.28);
      ctx.clearRect(tp.baseX-CELL*.07,tp.baseY+CELL*.01,CELL*.14,CELL*.12);
      ctx.shadowColor=t.colorMid;ctx.shadowBlur=12;
      ctx.fillStyle=t.colorMid;ctx.beginPath();ctx.ellipse(tp.x,tp.y+3,6.4,7.8,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=t.colorCore;ctx.beginPath();ctx.ellipse(tp.x,tp.y+2.2,3.5,5.0,0,0,Math.PI*2);ctx.fill();
    }else if(t.kind==='fungus'){
      const pulse=1+tp.flamePulse*.14;
      ctx.fillStyle='rgba(92,74,114,.55)';ctx.fillRect(tp.baseX-1.5,tp.baseY+4,3,5);
      for(let i=0;i<3;i++){
        const offx=(i-1)*5, offy=i===1?-1:1, cap=5.8+(i===1?2.2:0);
        ctx.shadowColor=t.colorMid;ctx.shadowBlur=10;
        ctx.fillStyle=t.colorMid;ctx.beginPath();ctx.ellipse(tp.x+offx,tp.y+offy,cap*pulse,3.4*pulse,0,Math.PI,0,true);ctx.fill();
        ctx.fillStyle=t.colorCore;ctx.beginPath();ctx.ellipse(tp.x+offx,tp.y+offy+.4,cap*.5*pulse,1.6*pulse,0,0,Math.PI*2);ctx.fill();
      }
    }else if(t.kind==='orb'){
      const bob=Math.sin(now/300+t.seed*.01)*2.2;
      ctx.strokeStyle='rgba(110,96,150,.42)';ctx.beginPath();ctx.moveTo(tp.baseX,tp.baseY+CELL*.18);ctx.lineTo(tp.baseX,tp.baseY-2);ctx.stroke();
      ctx.shadowColor=t.colorMid;ctx.shadowBlur=16;
      ctx.fillStyle=t.colorMid;ctx.beginPath();ctx.arc(tp.x,tp.y-4+bob,7.6+tp.flamePulse*1.35,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=t.colorCore;ctx.beginPath();ctx.arc(tp.x-1.2,tp.y-5.2+bob,3.9,0,Math.PI*2);ctx.fill();
    }else if(t.kind==='brazier'){
      ctx.strokeStyle='rgba(101,52,48,.9)';ctx.fillStyle='rgba(121,68,56,.95)';
      ctx.fillRect(tp.baseX-2,tp.baseY+5,4,6);ctx.beginPath();ctx.ellipse(tp.baseX,tp.baseY+3,7,3.8,0,0,Math.PI*2);ctx.fill();
      ctx.shadowColor=t.colorMid;ctx.shadowBlur=15;
      ctx.fillStyle=t.colorMid;ctx.beginPath();ctx.ellipse(tp.x,tp.y,6.7,9.0,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=t.colorCore;ctx.beginPath();ctx.ellipse(tp.x,tp.y-1.1,3.6,5.4,0,0,Math.PI*2);ctx.fill();
    }
    if(!prefersReducedMotion()){
      const sp=((now/220)+(t.seed%100)/100)%1, rise=(1-sp)*CELL*.34, side=Math.sin(now/170+t.seed*.01)*1.1;
      ctx.globalAlpha*=.5;ctx.fillStyle=t.colorCore||'rgba(255,202,120,.92)';ctx.beginPath();ctx.arc(tp.x+side,tp.y-rise,1.15,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
}
function punchLight(cx,cy,radius){
  const g=ctx.createRadialGradient(cx,cy,radius*.18,cx,cy,radius);
  g.addColorStop(0,'rgba(0,0,0,1)');
  g.addColorStop(.34,'rgba(0,0,0,.78)');
  g.addColorStop(.72,'rgba(0,0,0,.28)');
  g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.fill();
}

// v17.12 — occluded torch light + floor color grading. Visual only.
function torchWorldSource(t){
 let x=(t.ax??t.x)+.5,y=(t.ay??t.y)+.5,edge=.40;
 if(t.side==='top')y=(t.ay??t.y)+.08;else if(t.side==='bottom')y=(t.ay??t.y)+.92;else if(t.side==='left')x=(t.ax??t.x)+.08;else if(t.side==='right')x=(t.ax??t.x)+.92;
 return{x,y}
}
function torchOcclusionPolygon(t,c,radiusTiles){
 const src=torchWorldSource(t),points=[],rays=mobileUI()?64:88,step=.115;
 for(let i=0;i<rays;i++){
   const a=(i/rays)*Math.PI*2,cs=Math.cos(a),sn=Math.sin(a);let wx=src.x,wy=src.y,lastX=wx,lastY=wy;
   for(let d=step;d<=radiusTiles;d+=step){
     wx=src.x+cs*d;wy=src.y+sn*d;const cx=Math.floor(wx),cy=Math.floor(wy);
     if(!inBounds(cx,cy)){break}
     if(s.map[cy]?.[cx]==='#'){break}
     lastX=wx;lastY=wy
   }
   points.push({x:(lastX-c.sx)*CELL,y:(lastY-c.sy)*CELL})
 }
 return points
}
function clipTorchOcclusion(t,c,radiusTiles,fn){
 const pts=torchOcclusionPolygon(t,c,radiusTiles);if(pts.length<3)return;ctx.save();ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x,pts[i].y);ctx.closePath();ctx.clip();fn();ctx.restore()
}
const FLOOR_GRADES={
 1:{fill:'rgba(35,58,78,.055)',edge:'rgba(15,26,38,.12)'},
 2:{fill:'rgba(28,68,61,.065)',edge:'rgba(14,31,29,.14)'},
 3:{fill:'rgba(112,79,37,.060)',edge:'rgba(54,36,17,.12)'},
 4:{fill:'rgba(72,50,104,.075)',edge:'rgba(36,22,56,.16)'},
 5:{fill:'rgba(88,28,62,.090)',edge:'rgba(43,10,30,.20)'}
};
function drawFloorColorGrade(){
 const g=FLOOR_GRADES[s?.floor||1]||FLOOR_GRADES[1];ctx.save();ctx.fillStyle=g.fill;ctx.fillRect(0,0,canvas.width,canvas.height);
 const vg=ctx.createRadialGradient(canvas.width/2,canvas.height/2,canvas.width*.24,canvas.width/2,canvas.height/2,canvas.width*.76);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,g.edge);ctx.fillStyle=vg;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.restore()
}
function drawThreatVisuals(now=animNow()){
 if(!s)return;const a=Math.min(100,Math.max(0,s.alarm||0))/100, i=Math.min(100,Math.max(0,s.instability||0))/100;
 if(a<.35&&i<.35)return;
 ctx.save();
 if(a>.35){const k=(a-.35)/.65, pulse=1+Math.sin(now/(a>.75?155:360))*.22;
 const g=ctx.createRadialGradient(canvas.width/2,canvas.height/2,canvas.width*.24,canvas.width/2,canvas.height/2,canvas.width*.72);
 g.addColorStop(0,'rgba(95,0,0,0)');g.addColorStop(1,`rgba(153,19,31,${Math.min(.20,k*.17*pulse)})`);ctx.fillStyle=g;ctx.fillRect(0,0,canvas.width,canvas.height)}
 if(i>.35){const k=(i-.35)/.65, wobble=Math.sin(now/650)*.5+.5;ctx.globalAlpha=k*(.07+.07*wobble);ctx.strokeStyle='#c291ff';ctx.lineWidth=1.2;
 for(let n=0;n<4;n++){const offset=(n*113+Math.floor(now/800)*3)%Math.floor(canvas.height), y=offset+.5;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(canvas.width,y+Math.sin(n*2+now/500)*4);ctx.stroke()}}
 ctx.restore();
}
function drawTorchDarkness(c,now=animNow()){
  if(!s)return;
  ctx.save();
  ctx.fillStyle=mobileUI()?'rgba(1,2,5,.83)':'rgba(1,2,5,.88)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.globalCompositeOperation='destination-out';
  const pvs=playerVisualState(now),pp=lpFloat(pvs.x,pvs.y,c);punchLight(pp.x+CELL/2,pp.y+CELL/2,CELL*(mobileUI()?1.52:1.38));
  if(portableTorchActive()){const pt={x:pvs.x,y:pvs.y,ax:pvs.x,ay:pvs.y,side:'free'},intensity=.28+.72*(torchLight()/100),rr=(mobileUI()?4.85:5.15)*intensity;clipTorchOcclusion(pt,c,rr,()=>punchLight(pp.x+CELL/2,pp.y+CELL/2,CELL*rr))}
  for(const t of s.torches||[]){
    if(t.harvested)continue;
    if(!inc(t.x,t.y,c)||!torchKnown(t))continue;
    const tp=torchPixel(t,c,now),radiusTiles=(t.radius||3.2)+(tp.flicker*.055),radius=CELL*radiusTiles;
    clipTorchOcclusion(t,c,radiusTiles,()=>punchLight(tp.x,tp.y,radius));
  }
  ctx.restore();
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const t of s.torches||[]){
    if(t.harvested)continue;
    if(!inc(t.x,t.y,c)||!torchKnown(t))continue;
    const tp=torchPixel(t,c,now),radiusTiles=(t.radius||3.2)*.86,radius=CELL*radiusTiles;
    clipTorchOcclusion(t,c,radiusTiles,()=>{const g=ctx.createRadialGradient(tp.x,tp.y,0,tp.x,tp.y,radius);g.addColorStop(0,t.colorGlowA||'rgba(255,178,78,.20)');g.addColorStop(.46,t.colorGlowB||'rgba(255,126,44,.065)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(tp.x,tp.y,radius,0,Math.PI*2);ctx.fill()});
  }
  if(portableTorchActive()){const pvs2=playerVisualState(now),pp2=lpFloat(pvs2.x,pvs2.y,c),pt={x:pvs2.x,y:pvs2.y,ax:pvs2.x,ay:pvs2.y,side:'free'},intensity=.28+.72*(torchLight()/100),rr=(mobileUI()?4.35:4.65)*intensity;clipTorchOcclusion(pt,c,rr,()=>{const g=ctx.createRadialGradient(pp2.x+CELL/2,pp2.y+CELL/2,0,pp2.x+CELL/2,pp2.y+CELL/2,CELL*rr);g.addColorStop(0,'rgba(255,188,88,.28)');g.addColorStop(.40,'rgba(255,126,44,.11)');g.addColorStop(1,'rgba(255,84,20,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(pp2.x+CELL/2,pp2.y+CELL/2,CELL*rr,0,Math.PI*2);ctx.fill()})}
  ctx.restore();
}

// v17.11 — Environment Art Pass. Deterministic decoration only: no collision/gameplay changes.
function envHash(x,y,salt=0){let h=((x*73856093)^(y*19349663)^((s?.floor||1)*83492791)^(salt*2654435761))>>>0;h^=h>>>13;h=Math.imul(h,1274126177)>>>0;return h}
function envRand(x,y,salt=0){return (envHash(x,y,salt)%10000)/10000}
function drawGroundShadowPx(cx,cy,scale=1,alpha=.25){ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(cx,cy,CELL*.25*scale,CELL*.105*scale,0,0,Math.PI*2);ctx.fill();ctx.restore()}
function drawFloorDecor(x,y,px,py,visible,sr=null){
 if(!visible)return;
 const theme=(s.theme||dungeonThemeForFloor())?.id||'castle',h=envHash(x,y,3),r=(h%1000)/1000,variant=(h>>>7)%4;
 const zoneHash=envHash(Math.floor(x/3),Math.floor(y/3),27), zone=((zoneHash>>>4)%5), veinHash=envHash(Math.floor(x/2),Math.floor(y/2),39);
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 // Macro material pass: larger 2x2 / 3x3 neighborhoods share a common mood so floors feel less like isolated tiles.
 if(theme==='castle'){
   const shades=['rgba(74,82,90,.13)','rgba(111,104,91,.11)','rgba(44,53,61,.18)','rgba(91,98,103,.10)'];
   ctx.fillStyle=shades[variant];ctx.fillRect(px+2,py+2,CELL-4,CELL-4);
   const zoneTint=['rgba(134,121,102,.05)','rgba(72,79,86,.06)','rgba(41,47,54,.08)','rgba(106,96,85,.05)','rgba(60,68,76,.07)'][zone];
   ctx.fillStyle=zoneTint;ctx.fillRect(px+1,py+1,CELL-2,CELL-2);
   if(((x+y)%3)!==1){ctx.strokeStyle='rgba(188,194,198,.06)';ctx.lineWidth=1;ctx.strokeRect(px+3,py+3,CELL-6,CELL-6)}
   if((Math.floor(x/3)+Math.floor(y/3))%2===0){ctx.strokeStyle='rgba(30,36,41,.10)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(px+CELL*.03,py+CELL*.35);ctx.lineTo(px+CELL*.97,py+CELL*.35);ctx.moveTo(px+CELL*.03,py+CELL*.69);ctx.lineTo(px+CELL*.97,py+CELL*.69);ctx.stroke()}
   if(variant===0){ctx.strokeStyle='rgba(190,196,199,.11)';ctx.strokeRect(px+4,py+4,CELL-8,CELL-8)}
   if(variant===1){ctx.fillStyle='rgba(109,82,55,.14)';ctx.beginPath();ctx.ellipse(px+CELL*.56,py+CELL*.58,CELL*.30,CELL*.12,(h%7)*.17,0,Math.PI*2);ctx.fill()}
   if(variant===2){ctx.strokeStyle='rgba(16,21,25,.50)';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(px+CELL*.14,py+CELL*.72);ctx.lineTo(px+CELL*.36,py+CELL*.54);ctx.lineTo(px+CELL*.51,py+CELL*.60);ctx.lineTo(px+CELL*.78,py+CELL*.34);ctx.stroke()}
   if(variant===3){ctx.strokeStyle='rgba(142,149,153,.16)';ctx.beginPath();ctx.moveTo(px+CELL*.5,py+3);ctx.lineTo(px+CELL*.5,py+CELL-3);ctx.moveTo(px+3,py+CELL*.52);ctx.lineTo(px+CELL-3,py+CELL*.52);ctx.stroke()}
   if((veinHash%5)===0){ctx.strokeStyle='rgba(25,29,33,.18)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px+CELL*.08,py+CELL*.18);ctx.lineTo(px+CELL*.32,py+CELL*.26);ctx.lineTo(px+CELL*.49,py+CELL*.18);ctx.lineTo(px+CELL*.70,py+CELL*.30);ctx.lineTo(px+CELL*.92,py+CELL*.24);ctx.stroke()}
   if(s.floor>=2&&r>.78){ctx.fillStyle='rgba(85,67,46,.44)';for(let i=0;i<3;i++){const ox=((h>>>(i*4))%17)+5,oy=((h>>>(i*5+2))%16)+7;ctx.fillRect(px+ox,py+oy,Math.max(2,CELL*.08),Math.max(1,CELL*.04))}}
 }else if(theme==='temple'){
   const shades=['rgba(165,132,74,.12)','rgba(94,78,63,.17)','rgba(196,171,111,.09)','rgba(68,76,67,.14)'];ctx.fillStyle=shades[variant];ctx.fillRect(px+2,py+2,CELL-4,CELL-4);
   const zoneTint=['rgba(198,168,108,.05)','rgba(83,103,78,.06)','rgba(112,88,66,.06)','rgba(209,188,132,.04)','rgba(101,87,63,.05)'][zone];ctx.fillStyle=zoneTint;ctx.fillRect(px+1,py+1,CELL-2,CELL-2);
   if(Math.floor(x/2)%2===0){ctx.strokeStyle='rgba(214,188,123,.06)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px+CELL*.06,py+CELL*.5);ctx.lineTo(px+CELL*.94,py+CELL*.5);ctx.stroke()}
   if(Math.floor(y/2)%2===1){ctx.strokeStyle='rgba(214,188,123,.05)';ctx.beginPath();ctx.moveTo(px+CELL*.5,py+CELL*.06);ctx.lineTo(px+CELL*.5,py+CELL*.94);ctx.stroke()}
   if(variant===0){ctx.strokeStyle='rgba(221,193,118,.34)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(px+CELL/2,py+CELL/2,CELL*.24,0,Math.PI*2);ctx.moveTo(px+CELL*.28,py+CELL*.5);ctx.lineTo(px+CELL*.72,py+CELL*.5);ctx.stroke()}
   if(variant===1){ctx.fillStyle='rgba(196,165,91,.14)';ctx.fillRect(px+CELL*.12,py+CELL*.12,CELL*.32,CELL*.32);ctx.fillRect(px+CELL*.56,py+CELL*.56,CELL*.22,CELL*.22)}
   if(variant===2){ctx.strokeStyle='rgba(89,112,74,.30)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(px+CELL*.11,py+CELL*.84);ctx.quadraticCurveTo(px+CELL*.45,py+CELL*.47,px+CELL*.90,py+CELL*.70);ctx.stroke()}
   if(variant===3){ctx.strokeStyle='rgba(225,206,146,.19)';ctx.strokeRect(px+5,py+5,CELL-10,CELL-10);ctx.strokeRect(px+9,py+9,CELL-18,CELL-18)}
   if((veinHash%4)===0){ctx.fillStyle='rgba(84,112,70,.12)';ctx.beginPath();ctx.ellipse(px+CELL*.34,py+CELL*.71,CELL*.24,CELL*.10,.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(px+CELL*.71,py+CELL*.29,CELL*.18,CELL*.08,-.2,0,Math.PI*2);ctx.fill()}
 }else{
   const shades=['rgba(96,70,98,.14)','rgba(67,55,66,.20)','rgba(113,63,76,.14)','rgba(69,78,83,.12)'];ctx.fillStyle=shades[variant];ctx.fillRect(px+2,py+2,CELL-4,CELL-4);
   const zoneTint=['rgba(110,67,87,.06)','rgba(66,76,86,.06)','rgba(144,117,158,.05)','rgba(58,48,61,.07)','rgba(121,78,90,.05)'][zone];ctx.fillStyle=zoneTint;ctx.fillRect(px+1,py+1,CELL-2,CELL-2);
   if((Math.floor(x/3)+Math.floor(y/3))%2===0){ctx.strokeStyle='rgba(170,160,184,.04)';ctx.lineWidth=1;ctx.strokeRect(px+3,py+3,CELL-6,CELL-6)}
   if(variant===0){ctx.strokeStyle='rgba(205,196,208,.33)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(px+CELL*.4,py+CELL*.45,CELL*.10,0,Math.PI*2);ctx.moveTo(px+CELL*.48,py+CELL*.50);ctx.lineTo(px+CELL*.67,py+CELL*.70);ctx.stroke()}
   if(variant===1){ctx.fillStyle='rgba(74,30,34,.38)';ctx.beginPath();ctx.ellipse(px+CELL*.55,py+CELL*.62,CELL*.26,CELL*.12,(h%6)*.2,0,Math.PI*2);ctx.fill()}
   if(variant===2){ctx.strokeStyle='rgba(129,102,137,.42)';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(px+CELL*.20,py+CELL*.26);ctx.lineTo(px+CELL*.39,py+CELL*.43);ctx.lineTo(px+CELL*.29,py+CELL*.63);ctx.lineTo(px+CELL*.57,py+CELL*.76);ctx.stroke()}
   if(variant===3){ctx.fillStyle='rgba(164,156,168,.09)';ctx.fillRect(px+CELL*.15,py+CELL*.16,CELL*.70,CELL*.14);ctx.fillRect(px+CELL*.28,py+CELL*.60,CELL*.44,CELL*.11)}
   if((veinHash%3)===0){ctx.strokeStyle='rgba(123,86,126,.16)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px+CELL*.06,py+CELL*.18);ctx.lineTo(px+CELL*.30,py+CELL*.28);ctx.lineTo(px+CELL*.46,py+CELL*.20);ctx.lineTo(px+CELL*.64,py+CELL*.31);ctx.lineTo(px+CELL*.89,py+CELL*.24);ctx.stroke()}
 }
 if((h%11)===0){ctx.fillStyle='rgba(0,0,0,.10)';ctx.fillRect(px+4,py+CELL-6,CELL-8,2)}
 if(sr){ctx.strokeStyle='rgba(255,235,188,.11)';ctx.lineWidth=2;ctx.strokeRect(px+4,py+4,CELL-8,CELL-8)}
 ctx.restore()
}
function drawWallDecor(x,y,px,py,visible){
 if(!visible)return;const theme=(s.theme||dungeonThemeForFloor())?.id||'castle',h=envHash(x,y,9),r=(h%1000)/1000;ctx.save();
 if(theme==='castle'){
  if(r<.12){ctx.fillStyle='rgba(28,34,38,.55)';ctx.fillRect(px+CELL*.48,py+CELL*.12,2,CELL*.54);ctx.fillStyle='rgba(118,92,61,.50)';ctx.fillRect(px+CELL*.42,py+CELL*.58,CELL*.16,3)}
  if(s.floor>=2&&r>.91){ctx.strokeStyle='rgba(117,121,122,.35)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(px+CELL*.28,py+CELL*.25,3,0,Math.PI*2);ctx.moveTo(px+CELL*.28,py+CELL*.28);ctx.lineTo(px+CELL*.34,py+CELL*.70);ctx.stroke()}
 }else if(theme==='temple'){
  if(r<.14){ctx.fillStyle='rgba(181,157,91,.22)';ctx.fillRect(px+CELL*.28,py+CELL*.11,CELL*.44,CELL*.56);ctx.strokeStyle='rgba(225,206,146,.20)';ctx.strokeRect(px+CELL*.31,py+CELL*.14,CELL*.38,CELL*.50)}
  if(s.floor>=4&&r>.87){ctx.strokeStyle='rgba(87,115,73,.38)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px+CELL*.12,py+CELL*.05);ctx.quadraticCurveTo(px+CELL*.34,py+CELL*.34,px+CELL*.23,py+CELL*.82);ctx.moveTo(px+CELL*.16,py+CELL*.38);ctx.lineTo(px+CELL*.39,py+CELL*.27);ctx.stroke()}
 }else{
  if(r<.16){ctx.fillStyle='rgba(34,31,36,.70)';ctx.beginPath();ctx.roundRect(px+CELL*.18,py+CELL*.16,CELL*.64,CELL*.62,4);ctx.fill();ctx.strokeStyle='rgba(164,151,167,.18)';ctx.strokeRect(px+CELL*.22,py+CELL*.20,CELL*.56,CELL*.54)}
  if(r>.90){ctx.strokeStyle='rgba(203,198,205,.28)';ctx.beginPath();ctx.moveTo(px+CELL*.18,py+CELL*.18);ctx.lineTo(px+CELL*.42,py+CELL*.46);ctx.lineTo(px+CELL*.31,py+CELL*.78);ctx.stroke()}
 }
 ctx.restore()
}
function drawForegroundDepth(c,now=animNow()){
 if(prefersReducedMotion()&&mobileUI())return;const theme=(s.theme||dungeonThemeForFloor())?.id||'castle';ctx.save();ctx.pointerEvents='none';
 if(theme==='castle'){
   ctx.strokeStyle='rgba(14,16,19,.38)';ctx.lineWidth=Math.max(2,CELL*.06);for(let i=0;i<3;i++){const seed=envHash(c.sx+i,c.sy,41),x=((seed%1000)/1000)*canvas.width;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+Math.sin(now/700+seed)*3,CELL*(.55+(seed%40)/100));ctx.stroke()}
 }else if(theme==='temple'){
   ctx.fillStyle='rgba(16,13,11,.18)';ctx.beginPath();ctx.ellipse(canvas.width*.08,canvas.height*.88,CELL*.9,CELL*.38,-.4,0,Math.PI*2);ctx.ellipse(canvas.width*.92,canvas.height*.13,CELL*.75,CELL*.30,.5,0,Math.PI*2);ctx.fill()
 }else{
   ctx.strokeStyle='rgba(210,205,215,.07)';ctx.lineWidth=1;for(let i=0;i<4;i++){const sx=i%2?canvas.width:0,sy=(i+1)*canvas.height/5;ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo(canvas.width*.5,sy+Math.sin(i)*CELL,canvas.width-sx,sy+CELL*.6);ctx.stroke()}
 }
 ctx.restore()
}
function drawDungeonAtmosphere(c){
  const inst=Math.max(0,Math.min(100,s.instability||0)),alarm=Math.max(0,Math.min(100,s.alarm||0));
  if(mobileUI()&&inst<75){if(alarm>=50){ctx.save();ctx.strokeStyle=`rgba(190,54,54,${.12+(alarm-50)/50*.28})`;ctx.lineWidth=alarm>=75?8:4;ctx.strokeRect(ctx.lineWidth/2,ctx.lineWidth/2,canvas.width-ctx.lineWidth,canvas.height-ctx.lineWidth);ctx.restore()}return}
  if(inst>=25){const density=.035+(inst/100)*.13;ctx.save();ctx.strokeStyle=inst>=75?'rgba(190,105,218,.38)':'rgba(150,105,190,.26)';ctx.lineWidth=1;for(let vy=0;vy<VIEW;vy++)for(let vx=0;vx<VIEW;vx++){const x=c.sx+vx,y=c.sy+vy;if(!inBounds(x,y)||!s.visible.has(K(x,y))||s.map[y][x]==='#')continue;const h=((x*73856093)^(y*19349663)^(s.floor*83492791))>>>0;if((h%1000)/1000>density)continue;const px=vx*CELL,py=vy*CELL,ox=5+(h%17),oy=5+((h>>>5)%17);ctx.beginPath();ctx.moveTo(px+ox,py+oy);ctx.lineTo(px+ox+5,py+oy+3);ctx.lineTo(px+ox+2,py+oy+8);ctx.lineTo(px+ox+7,py+oy+11);ctx.stroke()}ctx.restore()}
  if(inst>=50){ctx.save();const g=ctx.createRadialGradient(canvas.width/2,canvas.height/2,canvas.width*.25,canvas.width/2,canvas.height/2,canvas.width*.72);g.addColorStop(0,'rgba(116,64,145,0)');g.addColorStop(1,`rgba(126,61,155,${.08+(inst-50)/50*.13})`);ctx.fillStyle=g;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.restore()}
  if(alarm>=50){ctx.save();ctx.strokeStyle=`rgba(190,54,54,${.12+(alarm-50)/50*.28})`;ctx.lineWidth=alarm>=75?8:4;ctx.strokeRect(ctx.lineWidth/2,ctx.lineWidth/2,canvas.width-ctx.lineWidth,canvas.height-ctx.lineWidth);ctx.restore()}
}
function drawPortableTorchPickup(p,alpha=1,bob=0,now=animNow()){
 const cx=p.x+CELL/2,cy=p.y+CELL/2+bob;ctx.save();ctx.globalAlpha=alpha;ctx.translate(cx,cy);ctx.rotate(-.52);ctx.lineCap='round';ctx.strokeStyle='rgba(115,72,36,.98)';ctx.lineWidth=Math.max(3,CELL*.095);ctx.beginPath();ctx.moveTo(-1,CELL*.22);ctx.lineTo(0,-CELL*.08);ctx.stroke();ctx.rotate(.52);const pulse=prefersReducedMotion()?0:Math.sin(now/140)*.8;ctx.shadowColor='rgba(255,154,46,.95)';ctx.shadowBlur=11+pulse*2;ctx.fillStyle='rgba(255,122,30,.96)';ctx.beginPath();ctx.ellipse(0,-CELL*.18,CELL*.10,CELL*.16,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,220,112,.98)';ctx.beginPath();ctx.ellipse(0,-CELL*.21,CELL*.055,CELL*.09,0,0,Math.PI*2);ctx.fill();ctx.restore()
}
function drawStaticObjects(c){
  const now=animNow(),reduce=prefersReducedMotion(),alphaFor=(x,y)=>s.visible.has(K(x,y))?1:.38;
  for(const o of s.coins)if(inc(o.x,o.y,c)&&o.seen){const p=lp(o.x,o.y,c);drawGroundShadowPx(p.x+CELL/2,p.y+CELL*.72,.55,.17);const seed=((o.x*31+o.y*17)%17),bob=reduce?0:Math.sin(now/260+seed)*2.0,sc=reduce?1:(.92+Math.sin(now/310+seed)*.08);ctx.save();ctx.translate(p.x+CELL/2,p.y+CELL/2+bob);ctx.scale(sc,1);drawIcon('coin',-CELL/2+3,-CELL/2+3,CELL-6,alphaFor(o.x,o.y));ctx.restore()}
  for(const l of s.loot)if(inc(l.x,l.y,c)&&l.seen){const p=lp(l.x,l.y,c);drawGroundShadowPx(p.x+CELL/2,p.y+CELL*.75,.72,.20);const seed=((l.x*19+l.y*43)%23),bob=reduce?0:Math.sin(now/350+seed)*1.6;if(l.kind==='weapon'){ctx.save();ctx.translate(0,bob);drawWeaponPickup(l,c);ctx.restore()}else if(l.kind==='torch'){drawPortableTorchPickup(p,alphaFor(l.x,l.y),bob,now)}else{ctx.save();ctx.globalAlpha=alphaFor(l.x,l.y);const pulse=reduce?0:Math.max(0,Math.sin(now/430+seed));ctx.shadowColor='rgba(126,231,154,.9)';ctx.shadowBlur=pulse*10;drawIcon('potion',p.x+3,p.y+3+bob,CELL-6,1);ctx.restore()}}
  const glyph=(o,g,color='#e4c47a',size=Math.max(16,CELL*.52),alpha=1,bob=0,glow=0)=>{if(!o||!inc(o.x,o.y,c))return;const p=lp(o.x,o.y,c);ctx.save();ctx.globalAlpha=alpha;ctx.shadowColor=color;ctx.shadowBlur=glow;ctx.fillStyle='rgba(5,7,10,.68)';ctx.beginPath();ctx.arc(p.x+CELL/2,p.y+CELL/2+bob,Math.max(9,CELL*.28),0,Math.PI*2);ctx.fill();ctx.fillStyle=color;ctx.font=`900 ${size}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(g,p.x+CELL/2,p.y+CELL/2+1+bob);ctx.restore()};
  for(const a of s.artifactDrops||[])if(a.seen){const ap=lp(a.x,a.y,c);drawGroundShadowPx(ap.x+CELL/2,ap.y+CELL*.77,.75,.22);const seed=((a.x*53+a.y*29)%31),bob=reduce?0:Math.sin(now/420+seed)*2.4,glow=reduce?4:8+Math.sin(now/330+seed)*4;glyph(a,ARTIFACTS[a.id]?.icon||'✦','#dfc6ff',Math.max(15,CELL*.45),alphaFor(a.x,a.y),bob,glow)}
  for(const q of s.secrets||[])if(q.seen&&!q.opened)glyph(q,'≋','#d9c6a3',Math.max(17,CELL*.5),s.visible.has(K(q.x,q.y))?1:.45,0,reduce?0:4+Math.sin(now/300+q.x)*3);
  if(s.mechanism?.switch?.seen&&!s.mechanism.activated){const m=s.mechanism.switch,p=lp(m.x,m.y,c),spin=reduce?0:now/650;ctx.save();ctx.translate(p.x+CELL/2,p.y+CELL/2);ctx.rotate(spin);ctx.fillStyle='#e6c06a';ctx.font=`900 ${Math.max(15,CELL*.44)}px sans-serif`;ctx.fillText('⚙',0,0);ctx.restore()}
  for(const ch of s.chests)if(!ch.opened&&inc(ch.x,ch.y,c)&&ch.seen){const p=lp(ch.x,ch.y,c);drawGroundShadowPx(p.x+CELL/2,p.y+CELL*.79,.95,.26);const seed=(ch.x*7+ch.y*11),pulse=reduce?0:Math.max(0,Math.sin(now/520+seed));ctx.save();ctx.shadowColor='rgba(238,195,94,.75)';ctx.shadowBlur=pulse*6;drawIcon('chest',p.x+3,p.y+3,CELL-6,alphaFor(ch.x,ch.y));ctx.restore()}
  for(const t of s.traps)if((t.revealed||t.triggered)&&inc(t.x,t.y,c)&&(t.seen||s.visible.has(K(t.x,t.y)))){const p=lp(t.x,t.y,c);ctx.save();if(t.revealed&&!t.triggered&&!reduce){ctx.globalAlpha=.72+.28*Math.sin(now/300+t.x+t.y)}drawIcon('trap',p.x+3,p.y+3,CELL-6,alphaFor(t.x,t.y));ctx.restore()}
  {const pu=s.keyPuzzle;if(pu){const drawObj=(o,key,size=CELL-6,glyphChar=null)=>{if(!o||!o.seen||!inc(o.x,o.y,c))return;const q=lp(o.x,o.y,c),pulse=reduce?0:Math.max(0,Math.sin(now/480+o.x*.4+o.y*.7));ctx.save();ctx.shadowColor='rgba(218,190,111,.78)';ctx.shadowBlur=(glyphChar?10:5)*pulse;drawIcon(key,q.x+(CELL-size)/2,q.y+(CELL-size)/2,size,alphaFor(o.x,o.y));ctx.restore()};if(pu.key?.available)drawObj(pu.key,'key');if(pu.door&&!pu.door.claimed)drawObj(pu.door,pu.door.open?'open_door':'locked_door',CELL-4);drawObj(pu.tablet,'rune_stele',CELL-6,'◇');drawObj(pu.decoder,'decoder_tablet',CELL-6,'◇');drawObj(pu.shrine,'shrine_sigil',CELL-6,'◇');if(pu.anchor&&pu.anchor!==pu.tablet)drawObj(pu.anchor,'shrine_sigil',CELL-6,'◇');drawObj(pu.finalSeal,'shrine_sigil',CELL-6,'◇');for(const sg of pu.sigils||[])drawObj(sg,sg.name==='LUNA'?'moon_sigil':sg.name==='LAMA'?'blade_sigil':'eye_sigil',CELL-6,'◇')}}
  if(s.rareEvent&&!s.rareEvent.used&&s.rareEvent.seen)drawRareEventObject(s.rareEvent,c,alphaFor(s.rareEvent.x,s.rareEvent.y));
  for(const r of s.specialRooms||[]){const cx=r.cx,cy=r.cy;if(inc(cx,cy,c)&&s.seen.has(K(cx,cy))){const p=lp(cx,cy,c);drawIcon(roomIconKey(r.type),p.x+4,p.y+4,CELL-8,s.visible.has(K(cx,cy))?.95:.4)}}
  if(s.dangerDoor&&!s.dangerDoor.declined&&!s.dangerDoor.rewarded&&inc(s.dangerDoor.x,s.dangerDoor.y,c)&&s.dangerDoor.seen){const p=lp(s.dangerDoor.x,s.dangerDoor.y,c);drawIcon('central_gate',p.x+2,p.y+2,CELL-4,s.visible.has(K(s.dangerDoor.x,s.dangerDoor.y))?1:.4)}
}

function drawWorldAmbience(c,now=animNow()){
  if(prefersReducedMotion()||!s)return;
  const themeId=(s.theme||dungeonThemeForFloor())?.id;
  ctx.save();
  for(let vy=0;vy<VIEW;vy++)for(let vx=0;vx<VIEW;vx++){
    const x=c.sx+vx,y=c.sy+vy;if(!inBounds(x,y)||!s.visible.has(K(x,y))||s.map[y]?.[x]==='#')continue;
    const h=((x*73856093)^(y*19349663)^(s.floor*83492791))>>>0;
    if(h%19===0){const p=lp(x,y,c),tt=(now/2400+(h%997)/997)%1;ctx.globalAlpha=.12*(1-Math.abs(tt-.5)*1.5);ctx.fillStyle=themeId==='catacombs'?'#c7d8df':'#d7cbb3';ctx.beginPath();ctx.arc(p.x+CELL*((h%71)/71),p.y+CELL*(1-tt),1.2,0,Math.PI*2);ctx.fill()}
    if(themeId==='catacombs'&&h%37===0){const p=lp(x,y,c),tt=(now/1450+(h%541)/541)%1;ctx.globalAlpha=.11;ctx.strokeStyle='#91a8b0';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.x+CELL*((h%43)/43),p.y+tt*CELL*.55);ctx.lineTo(p.x+CELL*((h%43)/43),p.y+tt*CELL*.55+4);ctx.stroke()}
  }
  if((s.floor>=4||themeId==='catacombs')){ctx.globalAlpha=.045;ctx.fillStyle='#b9c6d2';const drift=(now/5000)%1;for(let i=0;i<3;i++){const yy=canvas.height*(.28+i*.22),xx=((drift+i*.31)%1)*canvas.width;ctx.beginPath();ctx.ellipse(xx,yy,canvas.width*.22,CELL*.32,0,0,Math.PI*2);ctx.fill()}}
  ctx.restore();
}
function drawWallTile(vx,vy,visible,x,y){const px=vx*CELL,py=vy*CELL,pal=themePalette(),base=visible?pal.wallVisible:pal.wallSeen,edge=visible?pal.wallEdgeVisible:pal.wallEdgeSeen,mortar=visible?pal.mortarVisible:pal.mortarSeen,highlight=visible?pal.highlightVisible:pal.highlightSeen;ctx.fillStyle=base;ctx.fillRect(px,py,CELL,CELL);ctx.strokeStyle=edge;ctx.lineWidth=1.5;ctx.strokeRect(px+.75,py+.75,CELL-1.5,CELL-1.5);const rowOffset=((y&1)?8:3),rowOffset2=((x&1)?12:6);ctx.strokeStyle=mortar;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px+1,py+10.5);ctx.lineTo(px+CELL-1,py+10.5);ctx.moveTo(px+1,py+20.5);ctx.lineTo(px+CELL-1,py+20.5);ctx.moveTo(px+rowOffset+.5,py+1);ctx.lineTo(px+rowOffset+.5,py+10);ctx.moveTo(px+rowOffset2+.5,py+10);ctx.lineTo(px+rowOffset2+.5,py+20);ctx.moveTo(px+(CELL-rowOffset)+.5,py+20);ctx.lineTo(px+(CELL-rowOffset)+.5,py+CELL-1);ctx.stroke();ctx.fillStyle=highlight;const h=((x*73856093)^(y*19349663))>>>0;ctx.fillRect(px+5+(h%7),py+4+((h>>>3)%5),4,2);ctx.fillRect(px+17+((h>>>5)%5),py+14+((h>>>8)%4),3,2);ctx.fillRect(px+8+((h>>>11)%6),py+24+((h>>>14)%3),4,2);if(visible&&h%7===0){ctx.strokeStyle=pal.highlightVisible;ctx.beginPath();ctx.moveTo(px+7+(h%8),py+7+((h>>>4)%5));ctx.lineTo(px+10+(h%8),py+11+((h>>>4)%5));ctx.stroke()}drawWallDecor(x,y,px,py,visible);if(visible){ctx.save();ctx.fillStyle='rgba(0,0,0,.24)';ctx.fillRect(px+1,py+CELL-5,CELL-2,4);ctx.fillStyle='rgba(235,224,204,.10)';ctx.fillRect(px+2,py+2,CELL-4,2);ctx.restore()}}


// v18.1 — Visual art pass: deterministic material, depth and architectural thresholds.
// Canvas decoration only: movement, collision, visibility, spawning and balance unchanged.
function v18Stone(x,y,px,py,room){
 const h=envHash(x,y,117),theme=(s.theme||dungeonThemeForFloor())?.id||'castle';
 ctx.save();
 if(room){
  // A restrained stone bevel, shared by neighboring tiles instead of random noise.
  ctx.fillStyle=theme==='temple'?'rgba(211,176,109,.08)':theme==='catacombs'?'rgba(164,138,166,.065)':'rgba(169,179,185,.075)';
  ctx.fillRect(px+2,py+2,CELL-4,2);
  ctx.fillStyle='rgba(0,0,0,.24)';ctx.fillRect(px+2,py+CELL-4,CELL-4,2);
  ctx.strokeStyle='rgba(0,0,0,.27)';ctx.lineWidth=1;
  if(((x+y)&1)===0){ctx.beginPath();ctx.moveTo(px+CELL*.10,py+CELL*.54);ctx.lineTo(px+CELL*.87,py+CELL*.54);ctx.stroke()}
  // Rare handmade motifs, no new interactive object.
  if(h%29===0){const cx=px+CELL/2,cy=py+CELL/2;ctx.strokeStyle=theme==='temple'?'rgba(212,187,120,.27)':'rgba(183,172,177,.19)';
   ctx.lineWidth=1.25;ctx.beginPath();ctx.arc(cx,cy,CELL*.23,0,Math.PI*2);ctx.moveTo(cx-CELL*.13,cy);ctx.lineTo(cx+CELL*.13,cy);ctx.moveTo(cx,cy-CELL*.13);ctx.lineTo(cx,cy+CELL*.13);ctx.stroke()}
 }else{
  // Corridors are worn, narrow and architectural rather than only darker tiles.
  ctx.fillStyle='rgba(0,0,0,.22)';ctx.fillRect(px+1,py+1,CELL-2,CELL-2);
  ctx.strokeStyle='rgba(12,14,16,.46)';ctx.lineWidth=2;ctx.strokeRect(px+2,py+2,CELL-4,CELL-4);
  if(((x+y)&1)===0){ctx.strokeStyle='rgba(180,172,155,.12)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px+CELL*.22,py+CELL*.53);ctx.lineTo(px+CELL*.78,py+CELL*.53);ctx.stroke()}
 }
 ctx.restore();
}
function v18ArchitecturalDoor(x,y,px,py){
 if(!s?.visible?.has(K(x,y)))return;
 // Paint threshold jambs on passable tiles that join corridor and room.
 const room=!!roomGeometryAt(x,y),neighbors=[[1,0],[-1,0],[0,1],[0,-1]];
 let threshold=false;
 for(const [dx,dy] of neighbors){
  const nx=x+dx,ny=y+dy;
  if(!inBounds(nx,ny)||s.map[ny]?.[nx]==='#')continue;
  if(!!roomGeometryAt(nx,ny)!==room){threshold=true;break}
 }
 if(!threshold)return;
 const theme=(s.theme||dungeonThemeForFloor())?.id||'castle';
 ctx.save();ctx.strokeStyle=theme==='temple'?'rgba(210,178,116,.49)':theme==='catacombs'?'rgba(169,139,187,.46)':'rgba(178,168,146,.48)';
 ctx.lineWidth=2.5;ctx.strokeRect(px+3,py+3,CELL-6,CELL-6);
 ctx.strokeStyle='rgba(5,6,9,.76)';ctx.lineWidth=1;ctx.strokeRect(px+5.5,py+5.5,CELL-11,CELL-11);
 ctx.fillStyle='rgba(220,192,137,.30)';
 for(let j=0;j<3;j++)ctx.fillRect(px+CELL*.40+j*CELL*.065,py+CELL*.45,Math.max(1,CELL*.026),CELL*.11);
 ctx.restore();
}


// v18.5 — shared room identity for painted decor and physical props.
function v18RoomStyle(room){
 const theme=(s?.theme||dungeonThemeForFloor())?.id||'castle';
 const special=(s?.specialRooms||[]).find(q=>q.x===room.x&&q.y===room.y&&q.w===room.w&&q.h===room.h);
 // On the catacombs floor, burial chambers have precedence over random props.
 if(theme==='catacombs'&&(special?.type==='treasury'||special?.type==='sanctuary'))return 2;
 if(special?.type==='armory')return 0; // recognizable military room, with a physical weapons rack
 return envHash(room.x,room.y,801)%8;
}
// v18.2 — room identities: decoration follows room geometry, not random tile noise.
// Props occupy existing walkable tiles only as artwork; they never change collision.
function v18RoomProps(x,y,px,py,room){
 if(!room||!Number.isFinite(room.x)||!Number.isFinite(room.y)||!Number.isFinite(room.w)||!Number.isFinite(room.h))return;
 if(room.w<4||room.h<4)return;
 const rx=x-room.x,ry=y-room.y,seed=envHash(room.x,room.y,801),style=v18RoomStyle(room);
 const cx=Math.floor(room.w/2),cy=Math.floor(room.h/2);
 // Reserve both the edge-door tiles and central movement lanes.
 const atCenter=(rx===cx&&ry===cy), atLeft=(rx===1&&ry===1),
 atRight=(rx===room.w-2&&ry===1),atBottom=(rx===room.w-2&&ry===room.h-2);
 let variant=-1;
 if(atCenter)variant=0;
 else if(atLeft && room.w>=6&&room.h>=6)variant=1;
 else if(atRight && room.w>=7&&room.h>=6)variant=2;
 else if(atBottom && room.w>=7&&room.h>=7&&seed%3===0)variant=3;
 if(variant<0)return;
 // The full-size Layer-2 sarcophagus replaces the tiny central crypt symbol.
 if(variant===0&&(style===2||style===1)&&v18RoomDecor().some(p=>p.room.x===room.x&&p.room.y===room.y))return;
 const theme=(s.theme||dungeonThemeForFloor())?.id||'castle';
 const warm=theme==='temple'?'#9b8761':theme==='catacombs'?'#746577':'#756756';
 const accent=theme==='temple'?'#bca36d':theme==='catacombs'?'#b093aa':'#ae9e83';
 const fx=px+CELL/2,fy=py+CELL/2;
 const a=CELL/32;
 ctx.save();ctx.translate(fx,fy);ctx.scale(a,a);ctx.lineJoin='round';ctx.lineCap='round';
 const slab=(w,h,fill=warm)=>{ctx.fillStyle='rgba(0,0,0,.42)';ctx.beginPath();ctx.ellipse(1,9,w*.55,h*.31,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=fill;ctx.fillRect(-w/2,-h/2,w,h);ctx.fillStyle='rgba(236,218,180,.16)';ctx.fillRect(-w/2+1,-h/2+1,w-2,2);ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(-w/2+1,h/2-3,w-2,2)};
 const stroke=(col=accent,w=1.6)=>{ctx.strokeStyle=col;ctx.lineWidth=w};
 const barrel=(xx,yy)=>{ctx.save();ctx.translate(xx,yy);ctx.fillStyle='#4f3525';ctx.beginPath();ctx.ellipse(0,0,6,7,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#b09a7b';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,-2,5,3,0,0,Math.PI*2);ctx.moveTo(-5,3);ctx.lineTo(5,3);ctx.stroke();ctx.restore()};
 // A distinct room centerpiece. Each room chooses one recognizable function.
 if(variant===0){
  if(style===0){ // abandoned guard room — weapon display
    slab(23,19,'#4c413a');stroke();ctx.beginPath();ctx.moveTo(-9,-7);ctx.lineTo(9,7);ctx.moveTo(9,-7);ctx.lineTo(-9,7);ctx.stroke();
    stroke('#bdb7a6',2);ctx.beginPath();ctx.moveTo(-8,-9);ctx.lineTo(8,8);ctx.moveTo(8,-9);ctx.lineTo(-8,8);ctx.stroke();
  }else if(style===1){ // archive — books and shelves
    slab(25,21,'#493b32');for(let i=0;i<5;i++){ctx.fillStyle=['#79634e','#5f544c','#50495c'][i%3];ctx.fillRect(-11+i*5,-8,4,16);ctx.fillStyle='#c2a97b';ctx.fillRect(-11+i*5,-7,1,13)}
  }else if(style===2){ // crypt — sarcophagus
    slab(20,26,theme==='temple'?'#857963':'#5d5960');stroke('#c7b29a',1.5);ctx.strokeRect(-8,-11,16,22);ctx.beginPath();ctx.moveTo(0,-7);ctx.lineTo(0,6);ctx.moveTo(-4,-1);ctx.lineTo(4,-1);ctx.stroke()
  }else if(style===3){ // ritual ring
    stroke(theme==='temple'?'#d5b879':'#9c769f',2);ctx.beginPath();ctx.arc(0,0,12,0,Math.PI*2);ctx.moveTo(-10,0);ctx.lineTo(10,0);ctx.moveTo(0,-10);ctx.lineTo(0,10);ctx.stroke();
    ctx.fillStyle='rgba(166,84,104,.33)';ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill()
  }else if(style===4){ // provisions and barrels
    slab(23,18,'#594738');barrel(-6,-3);barrel(6,2);barrel(4,-6)
  }else if(style===5){ // rubble
    for(let i=0;i<7;i++){const h=envHash(room.x+i,room.y,819);ctx.save();ctx.translate((h%19)-9,((h>>>5)%17)-8);ctx.rotate((h%13)*.16);ctx.fillStyle=i%2?'#5a5b61':'#777069';ctx.fillRect(-3,-2,6,5);ctx.restore()}
  }else if(style===6){ // feasting room
    slab(25,14,'#604535');stroke('#b39b79',1.2);ctx.beginPath();ctx.moveTo(-9,0);ctx.lineTo(9,0);ctx.stroke();for(let i=-1;i<=1;i++){ctx.fillStyle='#91816d';ctx.beginPath();ctx.arc(i*8,-2,2.3,0,Math.PI*2);ctx.fill()}
  }else{ // roots and overgrowth
    ctx.fillStyle='rgba(66,79,51,.55)';ctx.beginPath();ctx.ellipse(0,0,13,9,.2,0,Math.PI*2);ctx.fill();stroke('#81916a',2);for(let i=0;i<5;i++){const xx=-10+i*5;ctx.beginPath();ctx.moveTo(xx,10);ctx.quadraticCurveTo(xx+9,-2,xx+2,-12);ctx.stroke()}
  }
 }else if(variant===1){
  // Left corner: secondary environmental clue.
  if(style===1||style===6){slab(19,9,'#514139');for(let i=0;i<4;i++){ctx.fillStyle=i%2?'#7c5e49':'#857664';ctx.fillRect(-8+i*4,-7,3,6)}}
  else if(style===2){slab(19,10,'#666069');stroke('#9e929b');ctx.strokeRect(-7,-3,14,7)}
  else if(style===4){barrel(-4,0);barrel(6,3)}
  else if(style===7){stroke('#657b54',2);for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-8+i*8,9);ctx.quadraticCurveTo(-10+i*8,-6,-3+i*8,-10);ctx.stroke()}}
  else {slab(16,11,'#5c544d')}
 }else if(variant===2){
  if(style===3){stroke('#b49a72',1.4);ctx.beginPath();ctx.arc(0,0,9,0,Math.PI*2);ctx.moveTo(-6,-6);ctx.lineTo(6,6);ctx.stroke()}
  else if(style===5){slab(12,10,'#605f61');ctx.save();ctx.rotate(.45);slab(9,11,'#77736f');ctx.restore()}
  else if(style===0){stroke('#a99a89',2);ctx.beginPath();ctx.moveTo(-9,7);ctx.lineTo(7,-8);ctx.moveTo(8,7);ctx.lineTo(-7,-8);ctx.stroke()}
  else{slab(13,11)}
 }else if(variant===3){
  if(style===4){barrel(-4,0);barrel(5,-3)}
  else if(style===7){stroke('#798966',2.3);ctx.beginPath();ctx.moveTo(-10,8);ctx.quadraticCurveTo(0,-15,10,8);ctx.stroke()}
  else{slab(16,10,style===2?'#716872':'#61584d')}
 }
 ctx.restore();
}


// v18.3 independent environment sprite. The artwork loads from an actual asset file.
const v18Sarcophagus=new Image();
v18Sarcophagus.src='./assets/sprites/sarcophagus_closed.png';
v18Sarcophagus.addEventListener('load',()=>{if(s)render()});
// A Layer-2 decoration has a footprint independent from its sprite artwork.
// Interactable (Layer-3) objects use a separate interaction system.
// v18.6 - Physical Layer-2 props. All types share one safe placement system.
function v18SolidDecorationAt(x,y){
 if(!s)return null;
 return v18RoomDecor().find(p=>p.solid&&x>=p.x&&x<p.x+p.w&&y>=p.y&&y<p.y+p.h)||null;
}
function v18RoomDecor(){
 if(!s)return [];
 if(Array.isArray(s._v18Layer2Decor))return s._v18Layer2Decor;
 const placed=[];
 s._v18Layer2Decor=placed;
 const start=s.startPos||s.player;
 const same=(o,x,y)=>o&&o.x===x&&o.y===y;
 const exists=(list,x,y)=>Array.isArray(list)&&list.some(o=>same(o,x,y));
 const puzzleRoute=new Set(),puzzle=s.keyPuzzle;
 if(puzzle?.anchor&&Array.isArray(puzzle.route)){
  let x=puzzle.anchor.x,y=puzzle.anchor.y;
  puzzleRoute.add(K(x,y));
  for(const dir of puzzle.route){
   const d=DIR[dir];if(!d)break;
   x+=d.x;y+=d.y;puzzleRoute.add(K(x,y));
  }
 }
 const hasObject=(x,y)=>{
  return same(start,x,y)||same(s.stairs,x,y)||exists(s.enemies,x,y)||
   exists(s.loot,x,y)||exists(s.coins,x,y)||exists(s.artifactDrops,x,y)||
   exists(s.chests,x,y)||exists(s.traps,x,y)||exists(s.torches,x,y)||
   exists(s.secrets,x,y)||same(s.mechanism?.switch,x,y)||
   same(s.mechanism?.cache,x,y)||same(s.rareEvent,x,y)||
   same(s.dangerDoor,x,y)||same(puzzle?.door,x,y)||
   same(puzzle?.key,x,y)||same(puzzle?.tablet,x,y)||
   same(puzzle?.decoder,x,y)||same(puzzle?.shrine,x,y)||
   same(puzzle?.anchor,x,y)||same(puzzle?.finalSeal,x,y)||
   exists(puzzle?.sigils,x,y)||puzzleRoute.has(K(x,y))||
   placed.some(p=>x>=p.x&&x<p.x+p.w&&y>=p.y&&y<p.y+p.h);
 };
 const inRoom=(r,x,y)=>x>=r.x&&y>=r.y&&x<r.x+r.w&&y<r.y+r.h;
 const leavesPathsOpen=(r,blocked)=>{
  // All previously installed solid props in this room must also be impassable.
  const occupied=new Set(blocked);
  for(const prop of placed)if(inRoom(r,prop.x,prop.y)&&prop.solid)
   for(let dy=0;dy<prop.h;dy++)for(let dx=0;dx<prop.w;dx++)
    occupied.add(K(prop.x+dx,prop.y+dy));
  let first=null;
  for(let y=r.y;y<r.y+r.h&&!first;y++)for(let x=r.x;x<r.x+r.w;x++){
   if(s.map[y]?.[x]!=='#'&&!occupied.has(K(x,y))){first=[x,y];break}
  }
  if(!first)return false;
  const seen=new Set([K(first[0],first[1])]),q=[first];
  for(let i=0;i<q.length;i++){
   const [x,y]=q[i];
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const nx=x+dx,ny=y+dy,k=K(nx,ny);
    if(inRoom(r,nx,ny)&&s.map[ny]?.[nx]!=='#'&&!occupied.has(k)&&!seen.has(k)){
     seen.add(k);q.push([nx,ny]);
    }
   }
  }
  for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){
   const k=K(x,y);
   if(s.map[y]?.[x]!=='#'&&!occupied.has(k)&&!seen.has(k))return false;
  }
  return true;
 };
 for(const r of s.rooms||[]){
  if(!r||r.w<5||r.h<4)continue;
  const special=(s.specialRooms||[]).find(q=>q.x===r.x&&q.y===r.y&&q.w===r.w&&q.h===r.h);
  const style=v18RoomStyle(r),rack=special?.type==='armory',crypt=style===2,archive=style===1&&!special;
  if(!rack&&!crypt&&!archive)continue;
  if(inRoom(r,start.x,start.y)||inRoom(r,s.stairs.x,s.stairs.y))continue;
  if(archive){
   // v18.10: a single 2x1 shelf against the north interior wall of archives.
   // Existing item/spawn/door/puzzle reservations and pathing remain unchanged.
   let shelf=null,shelfScore=Infinity;
   const yy=r.y+1;
   for(let xx=r.x+1;xx<=r.x+r.w-3;xx++){
    const blocked=new Set(),w=2;
    let valid=true;
    for(let dx=0;dx<w;dx++){
     const x=xx+dx;
     if(s.map[yy]?.[x]!=='.'||hasObject(x,yy)){valid=false;break}
     blocked.add(K(x,yy));
    }
    if(!valid||!leavesPathsOpen(r,blocked))continue;
    const score=Math.abs(xx+.5-r.cx)+(xx%3)*.001;
    if(score<shelfScore){shelfScore=score;shelf={x:xx,y:yy}}
   }
   if(shelf)placed.push({
    type:'archiveBookshelf',x:shelf.x,y:shelf.y,w:2,h:1,
    solid:true,interactive:false,room:{x:r.x,y:r.y,w:r.w,h:r.h}
   });
   // v18.11 — a single writing desk opposite the archives' bookshelf.
   // Reuse collision, puzzle reservations and cumulative path checks.
   if(shelf&&r.w>=6&&r.h>=5){
    const deskY=r.y+r.h-2;
    let desk=null,deskScore=Infinity;
    for(let xx=r.x+1;xx<=r.x+r.w-3;xx++){
     const blocked=new Set(),w=2;
     let valid=true;
     for(let dx=0;dx<w;dx++){
      const x=xx+dx;
      if(s.map[deskY]?.[x]!=='.'||hasObject(x,deskY)){valid=false;break}
      blocked.add(K(x,deskY));
     }
     if(!valid||!leavesPathsOpen(r,blocked))continue;
     const score=Math.abs(xx+.5-r.cx)+((xx+2)%3)*.001;
     if(score<deskScore){deskScore=score;desk={x:xx,y:deskY}}
    }
    if(desk)placed.push({
     type:'archiveWritingDesk',x:desk.x,y:desk.y,w:2,h:1,
     solid:true,interactive:false,room:{x:r.x,y:r.y,w:r.w,h:r.h}
    });
   }
   continue;
  }
  const w=2,h=rack?1:2;
  let best=null,bestScore=Infinity;
  // Restrict props to the room interior, away from all wall entrances.
  // Weapon racks stand against the north interior wall, never in doorways.
  for(let y=r.y+1;y<=r.y+r.h-h-1;y++){
   if(rack&&y!==r.y+1)continue;
   for(let x=r.x+1;x<=r.x+r.w-w-1;x++){
    const blocked=new Set();let valid=true;
    for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){
     if(s.map[yy]?.[xx]!=='.'||hasObject(xx,yy)||
        (special&&xx===special.cx&&yy===special.cy)){valid=false;break}
     blocked.add(K(xx,yy));
    }
    if(!valid||!leavesPathsOpen(r,blocked))continue;
    const score=rack?Math.abs(x+(w-1)/2-r.cx)+((x+y)%3)*.001:
     Math.abs(x+.5-r.cx)+Math.abs(y+.5-r.cy)+((x+y)%3)*.001;
    if(score<bestScore){bestScore=score;best={x,y}}
   }
  }
  if(best)placed.push({
   type:rack?'weaponRack':'sarcophagus',x:best.x,y:best.y,w,h,
   solid:true,interactive:false,room:{x:r.x,y:r.y,w:r.w,h:r.h}
  });
  if(rack){
   // v18.8: one 1x1 armor display next to a side wall of an armory.
   // It must not overlap the weapons rack, any pickup, or the player's route.
   let armor=null,armorScore=Infinity;
   for(let yy=r.y+2;yy<r.y+r.h-1;yy++)
    for(let xx=r.x+1;xx<r.x+r.w-1;xx++){
     if(xx!==r.x+1&&xx!==r.x+r.w-2)continue;
     if(s.map[yy]?.[xx]!=='.'||hasObject(xx,yy)||
        (special&&xx===special.cx&&yy===special.cy))continue;
     const block=new Set([K(xx,yy)]);
     if(!leavesPathsOpen(r,block))continue;
     const score=Math.abs(yy-(r.y+Math.floor(r.h/2)))+
       (xx===r.x+1?0:0.12)+(Math.abs(xx-r.cx)*.005);
     if(score<armorScore){armorScore=score;armor={x:xx,y:yy}}
    }
   if(armor)placed.push({
    type:'armorStand',x:armor.x,y:armor.y,w:1,h:1,
    solid:true,interactive:false,room:{x:r.x,y:r.y,w:r.w,h:r.h}
   });
   // v18.9: an individual 2x1 workbench against the south interior wall.
   // Safe even when the rack and display armor were already placed.
   let table=null,tableScore=Infinity;
   const tableY=r.y+r.h-2;
   for(let xx=r.x+1;xx<=r.x+r.w-3;xx++){
    const block=new Set(),yy=tableY;
    let valid=true;
    for(let dx=0;dx<2;dx++){
     const x=xx+dx;
     if(s.map[yy]?.[x]!=='.'||hasObject(x,yy)||
        (special&&x===special.cx&&yy===special.cy)){valid=false;break}
     block.add(K(x,yy));
    }
    if(!valid||!leavesPathsOpen(r,block))continue;
    const score=Math.abs(xx+.5-r.cx)+(xx%3)*.001;
    if(score<tableScore){tableScore=score;table={x:xx,y:yy}}
   }
   if(table)placed.push({
    type:'workbench',x:table.x,y:table.y,w:2,h:1,
    solid:true,interactive:false,room:{x:r.x,y:r.y,w:r.w,h:r.h}
   });
  }
 }
 return placed;
}
// Original pixel-art prop. 64x32 grid, rendered without image smoothing.
function drawV18WeaponRack(px,py){
 ctx.save();ctx.translate(px,py);ctx.scale(CELL/32,CELL/32);
 ctx.fillStyle='rgba(3,5,9,.50)';ctx.fillRect(4,6,57,25);
 ctx.fillStyle='#30241f';ctx.fillRect(3,3,58,26);
 ctx.fillStyle='#1c191a';ctx.fillRect(7,5,50,21);
 ctx.fillStyle='#634638';ctx.fillRect(5,5,4,23);ctx.fillRect(55,5,4,23);
 ctx.fillStyle='#96745b';ctx.fillRect(5,5,54,3);ctx.fillRect(5,23,54,4);
 ctx.fillStyle='#c0a081';ctx.fillRect(8,6,48,1);ctx.fillRect(8,24,48,1);
 ctx.fillStyle='#433127';ctx.fillRect(11,9,42,3);ctx.fillRect(11,20,42,3);
 // Two hanging swords with silvery guards and contrasting leather grips.
 for(const x of [17,34]){
  ctx.fillStyle='#a9c0c6';ctx.fillRect(x,6,3,12);
  ctx.fillStyle='#e0e4df';ctx.fillRect(x+1,7,1,9);
  ctx.fillStyle='#6c7f8b';ctx.fillRect(x,18,3,2);
  ctx.fillStyle='#c2a272';ctx.fillRect(x-3,19,9,2);
  ctx.fillStyle='#a17b4e';ctx.fillRect(x,21,3,5);
  ctx.fillStyle='#e1ba79';ctx.fillRect(x,26,3,1);
 }
 // Long-handled axe and a steel head with a bright cutting edge.
 ctx.fillStyle='#9c7852';ctx.fillRect(47,9,3,17);
 ctx.fillStyle='#d3d5cd';ctx.fillRect(43,8,8,5);
 ctx.fillStyle='#eef0dc';ctx.fillRect(42,9,2,3);
 ctx.fillStyle='#667981';ctx.fillRect(50,10,2,3);
 ctx.fillStyle='#d1ad79';ctx.fillRect(12,3,43,2);
 ctx.restore();
}
// v18.8 — a single suit of steel armor on an oak display stand (32×32).
// Pixel art drawn in the same canvas/palette as the weapons rack.
function drawV18ArmorStand(px,py){
 ctx.save();ctx.translate(px,py);ctx.scale(CELL/32,CELL/32);
 // Footprint: shadow and a dark oak mannequin.
 ctx.fillStyle='rgba(3,5,9,.55)';ctx.fillRect(6,28,21,3);
 ctx.fillStyle='#312821';ctx.fillRect(14,8,4,19);ctx.fillRect(10,27,12,2);
 ctx.fillStyle='#916742';ctx.fillRect(15,10,2,18);
 // Plumed helmet, steel rim and deep visor.
 ctx.fillStyle='#a77945';ctx.fillRect(15,1,3,3);
 ctx.fillStyle='#e1c782';ctx.fillRect(14,2,2,2);
 ctx.fillStyle='#5c717d';ctx.fillRect(12,4,8,2);
 ctx.fillStyle='#a5bac2';ctx.fillRect(10,6,12,5);
 ctx.fillStyle='#d5dbd2';ctx.fillRect(11,6,9,1);
 ctx.fillStyle='#293943';ctx.fillRect(12,9,8,3);
 ctx.fillStyle='#d0a969';ctx.fillRect(11,12,10,2);
 ctx.fillStyle='#b7cbd1';ctx.fillRect(13,10,2,1);ctx.fillRect(18,10,2,1);
 // Broad shoulder plates with dark recesses.
 ctx.fillStyle='#344956';ctx.fillRect(6,13,5,9);ctx.fillRect(21,13,5,9);
 ctx.fillStyle='#92a9b4';ctx.fillRect(6,13,6,5);ctx.fillRect(20,13,6,5);
 ctx.fillStyle='#c9d9d9';ctx.fillRect(7,13,4,1);ctx.fillRect(21,13,4,1);
 ctx.fillStyle='#647e8b';ctx.fillRect(7,18,4,6);ctx.fillRect(21,18,4,6);
 ctx.fillStyle='#b5c2c7';ctx.fillRect(8,19,2,4);ctx.fillRect(22,19,2,4);
 // Breastplate, dark joints, and heraldic gold clasp.
 ctx.fillStyle='#30434e';ctx.fillRect(11,14,10,12);
 ctx.fillStyle='#879da9';ctx.fillRect(12,14,8,9);
 ctx.fillStyle='#c7d2d1';ctx.fillRect(12,15,3,6);ctx.fillRect(19,15,1,5);
 ctx.fillStyle='#647985';ctx.fillRect(15,15,4,7);
 ctx.fillStyle='#d8b478';ctx.fillRect(15,17,2,3);ctx.fillRect(14,20,4,1);
 ctx.fillStyle='#9c7552';ctx.fillRect(11,23,10,2);
 ctx.fillStyle='#d8bc82';ctx.fillRect(15,23,3,2);
 // Leg guards and boot tips, slightly separated for a readable silhouette.
 ctx.fillStyle='#4b606b';ctx.fillRect(11,25,4,4);ctx.fillRect(18,25,4,4);
 ctx.fillStyle='#9aadb5';ctx.fillRect(11,25,3,3);ctx.fillRect(18,25,3,3);
 ctx.fillStyle='#dae1da';ctx.fillRect(11,25,2,1);ctx.fillRect(18,25,2,1);
 ctx.fillStyle='#3d4850';ctx.fillRect(9,28,6,2);ctx.fillRect(18,28,6,2);
 ctx.restore();
}
// v18.9 — wooden armory workbench (2x1 tiles); anvil, hammer and metal fittings
// are drawn directly onto the same piece of furniture, not independent objects.
// v18.9.1 — Armory forge bench: silhouetted trestle, steel anvil, hot blade and tooling.
// Original 64x32 pixel art, no smoothing and no additional gameplay objects.
function drawV18Workbench(px,py){
 ctx.save();ctx.translate(px,py);ctx.scale(CELL/32,CELL/32);
 // Strong legs and an open, shadowed space under the table.
 ctx.fillStyle='rgba(4,5,8,.58)';ctx.fillRect(5,26,55,5);
 ctx.fillStyle='#241913';ctx.fillRect(8,18,9,12);ctx.fillRect(48,18,9,12);
 ctx.fillStyle='#69412a';ctx.fillRect(10,19,5,10);ctx.fillRect(50,19,5,10);
 ctx.fillStyle='#b07b4a';ctx.fillRect(10,20,2,8);ctx.fillRect(50,20,2,8);
 ctx.fillStyle='#422b20';ctx.fillRect(15,24,36,3);
 ctx.fillStyle='#8d603d';ctx.fillRect(16,25,31,2);
 // Heavy oak table with a real front edge, rather than a flat rectangular tile.
 ctx.fillStyle='#281b17';ctx.beginPath();ctx.moveTo(5,10);ctx.lineTo(53,6);ctx.lineTo(61,13);ctx.lineTo(61,21);ctx.lineTo(13,24);ctx.lineTo(4,18);ctx.closePath();ctx.fill();
 ctx.fillStyle='#785036';ctx.beginPath();ctx.moveTo(5,11);ctx.lineTo(52,7);ctx.lineTo(60,13);ctx.lineTo(12,18);ctx.closePath();ctx.fill();
 ctx.fillStyle='#be8a57';ctx.beginPath();ctx.moveTo(8,11);ctx.lineTo(51,8);ctx.lineTo(56,11);ctx.lineTo(13,15);ctx.closePath();ctx.fill();
 ctx.fillStyle='#d4a46a';ctx.fillRect(12,10,22,1);ctx.fillRect(34,9,15,1);
 ctx.fillStyle='#543421';ctx.beginPath();ctx.moveTo(12,18);ctx.lineTo(60,13);ctx.lineTo(60,20);ctx.lineTo(13,24);ctx.closePath();ctx.fill();
 ctx.fillStyle='#906039';ctx.fillRect(15,20,40,2);ctx.fillRect(17,23,34,1);
 ctx.fillStyle='#36221a';ctx.fillRect(12,17,2,6);ctx.fillRect(58,15,2,6);
 // Thick iron binding and rivets at the visible corners.
 ctx.fillStyle='#3e4546';ctx.fillRect(7,13,3,5);ctx.fillRect(54,14,4,6);
 ctx.fillStyle='#bbc4bb';ctx.fillRect(8,14,1,1);ctx.fillRect(56,16,1,1);
 // Large dark blue steel anvil with a recognisable horn and a raised top.
 ctx.fillStyle='#17232d';ctx.fillRect(26,9,25,9);
 ctx.fillStyle='#394f5e';ctx.fillRect(30,8,18,9);
 ctx.fillStyle='#879da4';ctx.fillRect(25,7,24,4);
 ctx.fillStyle='#dce3df';ctx.fillRect(27,7,18,2);
 ctx.fillStyle='#879da4';ctx.fillRect(20,9,8,3);
 ctx.fillStyle='#c5d0cc';ctx.fillRect(21,9,5,1);
 ctx.fillStyle='#465b64';ctx.fillRect(31,11,13,5);
 ctx.fillStyle='#9baeb2';ctx.fillRect(31,11,3,4);
 ctx.fillStyle='#21303b';ctx.fillRect(34,16,11,3);
 ctx.fillStyle='#788993';ctx.fillRect(38,16,5,1);
 // Red-hot short blade resting on the anvil: a bright warm focal point.
 ctx.fillStyle='#ef812e';ctx.fillRect(30,9,11,2);
 ctx.fillStyle='#ffd078';ctx.fillRect(31,9,8,1);
 ctx.fillStyle='#5c3c2b';ctx.fillRect(41,9,7,2);
 // Smith's hammer on the left, with angled wood handle and steel head.
 ctx.save();ctx.translate(17,12);ctx.rotate(-.51);
 ctx.fillStyle='#c69b69';ctx.fillRect(-1,-5,3,15);
 ctx.fillStyle='#755036';ctx.fillRect(0,1,2,7);
 ctx.fillStyle='#a8b8bd';ctx.fillRect(-6,-7,12,5);
 ctx.fillStyle='#eff0dc';ctx.fillRect(-5,-7,9,1);
 ctx.fillStyle='#596f7c';ctx.fillRect(-6,-3,12,1);
 ctx.restore();
 // Open iron tongs, tucked near the right end of the bench.
 ctx.strokeStyle='#c7b48f';ctx.lineWidth=1.5;ctx.beginPath();
 ctx.moveTo(49,10);ctx.lineTo(54,15);ctx.lineTo(58,15);
 ctx.moveTo(51,9);ctx.lineTo(56,13);ctx.lineTo(59,12);ctx.stroke();
 ctx.fillStyle='#dfbd83';ctx.fillRect(17,22,2,1);ctx.fillRect(53,19,2,1);
 ctx.restore();
}
// v18.10 — Archive bookshelf, original 64×32 pixel art.
function drawV18ArchiveBookshelf(px,py){
 ctx.save();ctx.translate(px,py);ctx.scale(CELL/32,CELL/32);
 // A raised, deep oak bookshelf with visible planks, supports and shadow.
 ctx.fillStyle='rgba(3,4,8,.54)';ctx.fillRect(3,6,59,25);
 ctx.fillStyle='#251a16';ctx.fillRect(2,3,60,25);
 ctx.fillStyle='#4a2f23';ctx.fillRect(4,4,56,22);
 ctx.fillStyle='#a77a4c';ctx.fillRect(4,4,56,3);
 ctx.fillStyle='#c29a67';ctx.fillRect(6,5,52,1);
 ctx.fillStyle='#2b2220';ctx.fillRect(7,8,50,15);
 // Shelves seen from above: two book rows, divided by oak runners.
 ctx.fillStyle='#8b5e3b';ctx.fillRect(7,14,50,2);ctx.fillRect(7,23,50,3);
 ctx.fillStyle='#c49961';ctx.fillRect(7,14,50,1);ctx.fillRect(7,23,50,1);
 const colors=['#974d4b','#627b64','#4c637d','#a38b4e','#80647d','#ae7955','#475e60'];
 for(let row=0;row<2;row++){
  const baseY=row===0?8:17;
  for(let i=0;i<17;i++){
   const x=8+i*3,seed=(i*11+row*7)%colors.length,height=(i%5===0?5:6);
   ctx.fillStyle=colors[seed];ctx.fillRect(x,baseY+(6-height),2,height);
   ctx.fillStyle='#d1b98a';ctx.fillRect(x,baseY+(6-height),1,1);
   if(i%4===0){ctx.fillStyle='#cab68d';ctx.fillRect(x+1,baseY+3,1,1)}
  }
 }
 // Vertical frame and central joint; prevents books looking like floor loot.
 ctx.fillStyle='#8d633e';ctx.fillRect(3,5,4,21);ctx.fillRect(57,5,4,21);
 ctx.fillStyle='#bc925d';ctx.fillRect(4,5,1,20);ctx.fillRect(58,5,1,20);
 ctx.fillStyle='#66442e';ctx.fillRect(31,7,2,16);
 ctx.fillStyle='#d0aa76';ctx.fillRect(31,7,1,15);
 ctx.fillStyle='#65422d';ctx.fillRect(4,26,6,3);ctx.fillRect(54,26,6,3);
 ctx.fillStyle='#d0b78a';ctx.fillRect(9,25,46,1);
 ctx.restore();
}
// v18.11 — Archive scribe's desk, 64x32 pixel-art canvas sprite.
function drawV18ArchiveWritingDesk(px,py){
 ctx.save();ctx.translate(px,py);ctx.scale(CELL/32,CELL/32);
 // Legs, open air under the desktop, and a soft grounding shadow.
 ctx.fillStyle='rgba(3,4,7,.55)';ctx.fillRect(5,27,54,4);
 ctx.fillStyle='#241a18';ctx.fillRect(7,18,7,12);ctx.fillRect(51,18,7,12);
 ctx.fillStyle='#725035';ctx.fillRect(9,20,4,9);ctx.fillRect(52,20,4,9);
 ctx.fillStyle='#c0975f';ctx.fillRect(9,20,1,8);ctx.fillRect(52,20,1,8);
 ctx.fillStyle='#38261f';ctx.fillRect(13,24,39,3);
 // Sloped oak writing surface — a visible front edge instead of a flat tile.
 ctx.fillStyle='#261c19';ctx.beginPath();
 ctx.moveTo(6,9);ctx.lineTo(52,5);ctx.lineTo(61,13);
 ctx.lineTo(60,23);ctx.lineTo(13,26);ctx.lineTo(4,19);ctx.closePath();ctx.fill();
 ctx.fillStyle='#73503a';ctx.beginPath();
 ctx.moveTo(5,10);ctx.lineTo(52,6);ctx.lineTo(59,13);
 ctx.lineTo(12,19);ctx.closePath();ctx.fill();
 ctx.fillStyle='#c39762';ctx.beginPath();
 ctx.moveTo(7,10);ctx.lineTo(51,7);ctx.lineTo(56,11);
 ctx.lineTo(13,16);ctx.closePath();ctx.fill();
 ctx.fillStyle='#e2b579';ctx.fillRect(9,10,30,1);
 ctx.fillStyle='#523525';ctx.beginPath();
 ctx.moveTo(12,19);ctx.lineTo(59,13);ctx.lineTo(59,22);
 ctx.lineTo(13,25);ctx.closePath();ctx.fill();
 ctx.fillStyle='#a4784d';ctx.fillRect(16,21,40,2);
 ctx.fillStyle='#c9a16c';ctx.fillRect(17,24,34,1);
 // Open parchment sheet with readable ink lines and folded warm edge.
 ctx.fillStyle='#65513c';ctx.beginPath();
 ctx.moveTo(17,10);ctx.lineTo(40,8);ctx.lineTo(44,15);
 ctx.lineTo(21,18);ctx.closePath();ctx.fill();
 ctx.fillStyle='#ead5a7';ctx.beginPath();
 ctx.moveTo(17,9);ctx.lineTo(39,7);ctx.lineTo(43,14);
 ctx.lineTo(21,17);ctx.closePath();ctx.fill();
 ctx.fillStyle='#fff0c8';ctx.fillRect(20,9,15,1);
 ctx.strokeStyle='#756551';ctx.lineWidth=1;ctx.beginPath();
 ctx.moveTo(23,12);ctx.lineTo(37,10);ctx.moveTo(24,14);ctx.lineTo(39,12);
 ctx.moveTo(27,15);ctx.lineTo(36,14);ctx.stroke();
 // Rolled parchment to the left, tied with a dark leather band.
 ctx.fillStyle='#4a3025';ctx.fillRect(6,13,11,5);
 ctx.fillStyle='#e2c08b';ctx.fillRect(7,12,10,4);
 ctx.fillStyle='#fff0bc';ctx.fillRect(7,12,10,1);
 ctx.fillStyle='#906047';ctx.fillRect(12,12,2,4);
 // Black glass inkwell with a brass lip on the right.
 ctx.fillStyle='#192730';ctx.fillRect(47,12,7,7);
 ctx.fillStyle='#4f6670';ctx.fillRect(48,11,5,6);
 ctx.fillStyle='#d6b475';ctx.fillRect(47,11,7,2);
 ctx.fillStyle='#12232b';ctx.fillRect(49,13,3,3);
 // White quill pen, tilted in the inkwell.
 ctx.save();ctx.translate(49,9);ctx.rotate(.31);
 ctx.fillStyle='#e7dfc6';ctx.fillRect(0,-7,2,13);
 ctx.fillStyle='#f6efd8';ctx.fillRect(-2,-6,5,6);
 ctx.fillStyle='#9b8c72';ctx.fillRect(0,1,1,5);ctx.restore();
 // Brass drawer handle and oak dowels.
 ctx.fillStyle='#d5b078';ctx.fillRect(36,22,6,2);
 ctx.fillStyle='#5a3929';ctx.fillRect(37,22,4,1);
 ctx.fillStyle='#c6a06e';ctx.fillRect(7,17,2,2);ctx.fillRect(56,17,2,2);
 ctx.restore();
}
// Draw the same static prop in the normal lighting pass and again with a
// near-player visibility lift, clipped to revealed tiles and its own room.
function drawV18RoomDecor(c,relight=false){
 if(!s)return;
 for(const prop of v18RoomDecor()){
  if(prop.type==='sarcophagus'&&(!v18Sarcophagus.complete||!v18Sarcophagus.naturalWidth))continue;
  if(!inc(prop.x,prop.y,c)&&!inc(prop.x+prop.w-1,prop.y+prop.h-1,c))continue;
  const cells=[];
  for(let dy=0;dy<prop.h;dy++)for(let dx=0;dx<prop.w;dx++)cells.push([dx,dy]);
  if(!cells.some(([dx,dy])=>s.seen.has(K(prop.x+dx,prop.y+dy))))continue;
  const r=prop.room,px=(prop.x-c.sx)*CELL,py=(prop.y-c.sy)*CELL;
  let lift=0;
  if(relight){
   const distance=Math.hypot(prop.x+(prop.w-1)/2-s.player.x,prop.y+(prop.h-1)/2-s.player.y);
   lift=Math.max(0,Math.min(1,(4.5-distance)/3.2));
   if(lift<=0||!cells.some(([dx,dy])=>s.visible.has(K(prop.x+dx,prop.y+dy))))continue;
  }
  ctx.save();ctx.beginPath();
  ctx.rect((r.x-c.sx)*CELL+1,(r.y-c.sy)*CELL+1,r.w*CELL-2,r.h*CELL-2);
  ctx.clip();
  if(relight){
   ctx.beginPath();
   for(const [dx,dy] of cells)if(s.visible.has(K(prop.x+dx,prop.y+dy)))
    ctx.rect((prop.x+dx-c.sx)*CELL,(prop.y+dy-c.sy)*CELL,CELL,CELL);
   ctx.clip();
   ctx.globalAlpha=.10+.54*lift;
   ctx.filter='brightness(1.65) contrast(1.12)';
  }
  ctx.imageSmoothingEnabled=false;
  if(prop.type==='weaponRack')drawV18WeaponRack(px,py);
  else if(prop.type==='armorStand')drawV18ArmorStand(px,py);
  else if(prop.type==='workbench')drawV18Workbench(px,py);
  else if(prop.type==='archiveBookshelf')drawV18ArchiveBookshelf(px,py);
  else if(prop.type==='archiveWritingDesk')drawV18ArchiveWritingDesk(px,py);
  else if(prop.type==='sarcophagus')
   ctx.drawImage(v18Sarcophagus,px+CELL*.175,py,CELL*1.65,CELL*2);
  ctx.restore();
 }
}

// v18.7 - Decorative wall shield: one heraldic plaque per eligible military room.
// The shield occupies a real wall tile, never consumes a passable square or an exit.
function v18WallShields(){
 if(!s)return [];
 if(Array.isArray(s._v18WallShields))return s._v18WallShields;
 const out=[];
 s._v18WallShields=out;
 const obstructed=(x,y)=>
  (s.torches||[]).some(t=>t.x===x&&t.y===y)||
  (s.secrets||[]).some(t=>t.x===x&&t.y===y)||
  (s.dangerDoor&&s.dangerDoor.x===x&&s.dangerDoor.y===y)||
  (s.keyPuzzle?.door&&s.keyPuzzle.door.x===x&&s.keyPuzzle.door.y===y);
 for(const room of s.specialRooms||[]){
  if(room.type!=='armory'&&room.type!=='guardroom')continue;
  const candidates=[];
  const consider=(x,y,insideX,insideY,side)=>{
   if(!inBounds(x,y)||!inBounds(insideX,insideY))return;
   if(s.map[y]?.[x]!=='#'||s.map[insideY]?.[insideX]!=='.')return;
   if(obstructed(x,y))return;
   // Never mount a plaque on a corridor-opening, even if it touches the room.
   const score=(side==='north'?0:side==='west'||side==='east'?100:200)+
      Math.abs(insideX-room.cx)+Math.abs(insideY-room.cy)*.4;
   candidates.push({x,y,side,score});
  };
  for(let x=room.x+1;x<room.x+room.w-1;x++){
   consider(x,room.y-1,x,room.y,'north');
   consider(x,room.y+room.h,x,room.y+room.h-1,'south');
  }
  for(let y=room.y+1;y<room.y+room.h-1;y++){
   consider(room.x-1,y,room.x,y,'west');
   consider(room.x+room.w,y,room.x+room.w-1,y,'east');
  }
  candidates.sort((a,b)=>a.score-b.score||a.y-b.y||a.x-b.x);
  if(candidates.length){
   const p=candidates[0];
   out.push({type:'wallShield',x:p.x,y:p.y,side:p.side,roomType:room.type,
     solid:false,interactive:false});
  }
 }
 return out;
}
function drawV18WallShieldSprite(px,py){
 ctx.save();ctx.translate(px,py);ctx.scale(CELL/32,CELL/32);
 // Hanging strap, dark backplate and readable brass silhouette.
 ctx.fillStyle='rgba(0,0,0,.54)';ctx.fillRect(5,4,23,26);
 ctx.fillStyle='#342720';ctx.fillRect(9,3,14,3);ctx.fillRect(15,1,3,4);
 ctx.fillStyle='#7e633e';ctx.fillRect(6,5,20,15);
 ctx.fillStyle='#cfb47c';
 ctx.beginPath();ctx.moveTo(16,3);ctx.lineTo(27,7);ctx.lineTo(26,20);
 ctx.lineTo(23,25);ctx.lineTo(16,30);ctx.lineTo(9,25);ctx.lineTo(6,20);
 ctx.lineTo(5,7);ctx.closePath();ctx.fill();
 ctx.fillStyle='#2d4055';
 ctx.beginPath();ctx.moveTo(16,6);ctx.lineTo(24,9);ctx.lineTo(23,19);
 ctx.lineTo(21,23);ctx.lineTo(16,27);ctx.lineTo(11,23);ctx.lineTo(9,19);
 ctx.lineTo(8,9);ctx.closePath();ctx.fill();
 ctx.fillStyle='#a34845';ctx.fillRect(16,7,7,15);
 ctx.fillStyle='#c17c62';ctx.fillRect(18,9,4,11);
 // The crest: a pale steel tower with crossbar, stays legible at 34px.
 ctx.fillStyle='#e5dfc8';ctx.fillRect(14,10,4,12);
 ctx.fillRect(11,13,10,3);ctx.fillRect(12,9,8,2);
 ctx.fillStyle='#83949e';ctx.fillRect(15,11,1,10);
 ctx.fillStyle='#f7e3aa';ctx.fillRect(9,8,2,2);
 ctx.fillStyle='#e8cc91';ctx.fillRect(22,8,2,2);ctx.fillRect(14,25,4,2);
 ctx.restore();
}
// Separate from solid furniture: the shield is fixed to a stone wall tile.
function drawV18WallShields(c,relight=false){
 if(!s)return;
 for(const prop of v18WallShields()){
  if(!inc(prop.x,prop.y,c)||!s.seen.has(K(prop.x,prop.y)))continue;
  const visible=s.visible.has(K(prop.x,prop.y));
  if(relight&&!visible)continue;
  const distToPlayer=Math.hypot(prop.x-s.player.x,prop.y-s.player.y);
  const lift=Math.max(0,Math.min(1,(5.5-distToPlayer)/3.8));
  if(relight&&lift<=0)continue;
  const px=(prop.x-c.sx)*CELL,py=(prop.y-c.sy)*CELL;
  ctx.save();ctx.beginPath();ctx.rect(px,py,CELL,CELL);ctx.clip();
  ctx.globalAlpha=relight?(.15+.63*lift):(visible?1:.34);
  if(relight)ctx.filter='brightness(1.45) contrast(1.14)';
  ctx.imageSmoothingEnabled=false;
  drawV18WallShieldSprite(px,py);
  ctx.restore();
 }
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#07090d';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.textAlign='center';ctx.textBaseline='middle';const c=camera(),now=performance.now(),cine=cinemaState(now);ctx.save();ctx.translate(canvas.width/2+cine.dx,canvas.height/2+cine.dy);ctx.scale(cine.zoom,cine.zoom);ctx.translate(-canvas.width/2,-canvas.height/2);
  for(let vy=0;vy<VIEW;vy++)for(let vx=0;vx<VIEW;vx++){
    const x=c.sx+vx,y=c.sy+vy,key=K(x,y),seen=s.seen.has(key),visible=s.visible.has(key),tile=s.map[y][x];
    let color='#080a0d',pal=themePalette(),sr=null;
    if(seen){
      if(visible)color=tile==='#'?pal.wallVisible:tile==='>'?'#c5ad56':pal.floorVisible;
      else color=tile==='#'?pal.wallSeen:tile==='>'?'#5c512e':pal.floorSeen;
      sr=(s.specialRooms||[]).find(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h);
      if(sr&&tile!=='#')color=specialRoomTint(sr.type,visible)
    }
    if(seen&&tile==='#')drawWallTile(vx,vy,visible,x,y);else{
      const px=vx*CELL,py=vy*CELL;
      ctx.fillStyle=color;ctx.fillRect(px,py,CELL,CELL);
      const geomRoom=roomGeometryAt(x,y);if(tile!=='#'&&!geomRoom&&seen){ctx.save();ctx.fillStyle=visible?'rgba(4,8,12,.19)':'rgba(0,0,0,.14)';ctx.fillRect(px+2,py+2,CELL-4,CELL-4);ctx.strokeStyle=visible?'rgba(185,199,210,.10)':'rgba(120,130,140,.05)';ctx.lineWidth=1;ctx.beginPath();if(((x+y)&1)===0){ctx.moveTo(px+CELL*.15,py+CELL*.5);ctx.lineTo(px+CELL*.85,py+CELL*.5)}else{ctx.moveTo(px+CELL*.5,py+CELL*.15);ctx.lineTo(px+CELL*.5,py+CELL*.85)}ctx.stroke();ctx.restore()}
      if(visible){
        ctx.strokeStyle=pal.grid;ctx.strokeRect(px,py,CELL,CELL);
        const themeId=(s.theme||dungeonThemeForFloor())?.id;
        ctx.save();ctx.globalAlpha=.22;ctx.strokeStyle=pal.accent;ctx.lineWidth=1;
        if(themeId==='castle'&&((x+y)%4===0)){ctx.beginPath();ctx.moveTo(px+5,py+CELL-5);ctx.lineTo(px+CELL-5,py+CELL-5);ctx.stroke()}
        if(themeId==='temple'&&((x*3+y)%7===0)){ctx.beginPath();ctx.arc(px+CELL/2,py+CELL/2,Math.max(3,CELL*.12),0,Math.PI*2);ctx.stroke()}
        if(themeId==='catacombs'&&((x+y*2)%6===0)){ctx.beginPath();ctx.moveTo(px+CELL*.32,py+CELL*.28);ctx.lineTo(px+CELL*.48,py+CELL*.44);ctx.lineTo(px+CELL*.39,py+CELL*.62);ctx.stroke()}
        ctx.restore()
        drawFloorDecor(x,y,px,py,visible,sr);
        v18Stone(x,y,px,py,!!roomGeometryAt(x,y));
        v18ArchitecturalDoor(x,y,px,py);
        v18RoomProps(x,y,px,py,roomGeometryAt(x,y));
      }
      if(sr&&visible){
        ctx.strokeStyle='rgba(255,255,255,.10)';ctx.lineWidth=1.2;ctx.strokeRect(px+2.5,py+2.5,CELL-5,CELL-5)
      }
      if(seen&&tile==='>'){drawIcon('stairs',px+3,py+3,CELL-6,visible?1:.55);if(visible&&!prefersReducedMotion()){const pulse=.5+.5*Math.sin(animNow()/420+(x+y));ctx.save();ctx.globalAlpha=.18+.18*pulse;ctx.strokeStyle='#e6cf73';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px+CELL/2,py+CELL/2,CELL*(.24+.14*pulse),0,Math.PI*2);ctx.stroke();ctx.restore()}}
    }
  }
  drawV18RoomDecor(c); // LAYER 2: solid room-specific furniture
  drawV18WallShields(c); // LAYER 2: wall-mounted heraldry
  drawDungeonAtmosphere(c);drawWorldAmbience(c,now);drawTorchDarkness(c,now);drawFloorColorGrade();drawV18RoomDecor(c,true);drawV18WallShields(c,true);drawThreatVisuals(now);drawTorchSconces(c,now);drawBossTelegraph(c);drawEnemyVision(c);drawWeaponPreview(c);drawStaticObjects(c);
  for(const e of s.enemies)if(e.hp>0&&s.visible.has(K(e.x,e.y))&&inc(e.x,e.y,c))drawEnemy(e,c,now);drawDeaths(c,now);
  const pv=playerVisualState(now),p=lpFloat(pv.x,pv.y,c),r=Math.max(0,s.hp/s.maxHp),pf=eqWeapon().family,basePX=p.x+pv.hitX,basePY=p.y+pv.hitY+pv.bob;drawGroundShadowPx(p.x+CELL/2,p.y+CELL*.80,.92,.27);ctx.save();ctx.translate(basePX+CELL/2,basePY+CELL/2);ctx.rotate(pv.rot);ctx.scale(pv.scale,pv.scale);ctx.translate(-CELL/2,-CELL/2);if(s.guard){ctx.strokeStyle='#82c8e8';ctx.lineWidth=3;ctx.beginPath();ctx.arc(CELL/2,CELL/2,15,0,Math.PI*2);ctx.stroke()}ctx.fillStyle='rgba(6,8,11,.55)';ctx.beginPath();ctx.arc(CELL/2,CELL/2,12,0,Math.PI*2);ctx.fill();if(pf&&pf!=='unarmed'){ctx.strokeStyle=FC[pf]||'#9fc3ff';ctx.lineWidth=mobileUI()?3:2.5;ctx.beginPath();ctx.arc(CELL/2,CELL/2,mobileUI()?15:14,0,Math.PI*2);ctx.stroke()}const spritePad=mobileUI()?0:1;if(!drawPlayerWeaponVisual(spritePad,spritePad,CELL-spritePad*2,{walking:pv.walking&&!pv.attack,frame:pv.frame,attacking:!!pv.attack,attackFamily:pv.attack?pv.attack.family:pf,attackPhase:pv.attack?attackProgress(pv.attack,now):0})){ctx.fillStyle='#78a9ff';ctx.beginPath();ctx.arc(CELL/2,CELL/2,10,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();if(pf&&pf!=='unarmed'){ctx.fillStyle=FC[pf]||'#fff';ctx.font='bold 10px sans-serif';ctx.fillText(familyGlyph(pf),CELL-8,8)}}drawFacingNotch(s.player.facing||'up',0,0,CELL,'#9fd6ff');if(s.riposteReady){drawIcon('riposte',CELL-13,1,12,1)||(()=>{ctx.fillStyle='#f4d36f';ctx.font='bold 13px sans-serif';ctx.fillText('✦',CELL-6,7)})()}ctx.restore();const playerHpW=mobileUI()?CELL+8:CELL-4,playerHpH=mobileUI()?11:8,playerHpX=p.x+(CELL-playerHpW)/2,playerHpY=p.y-(mobileUI()?14:10);ctx.save();ctx.fillStyle='rgba(0,0,0,.86)';ctx.beginPath();ctx.roundRect(playerHpX,playerHpY,playerHpW,playerHpH,3);ctx.fill();ctx.save();ctx.beginPath();ctx.roundRect(playerHpX+1,playerHpY+1,Math.max(0,(playerHpW-2)*r),playerHpH-2,2);ctx.clip();ctx.fillStyle=r>.5?'#71c981':r>.25?'#d3b452':'#df6666';ctx.fillRect(playerHpX+1,playerHpY+1,playerHpW-2,playerHpH-2);ctx.restore();ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=1;ctx.strokeRect(playerHpX+.5,playerHpY+.5,playerHpW-1,playerHpH-1);ctx.fillStyle='#fff';ctx.font=`900 ${mobileUI()?7.5:6.5}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.shadowColor='rgba(0,0,0,.85)';ctx.shadowBlur=2;ctx.fillText(`${s.hp} HP`,playerHpX+playerHpW/2,playerHpY+playerHpH/2+.2);ctx.restore();drawPlayerAttackEffects(c,now);drawBursts(c,now);
  for(const f of s.fx||[]){if(!inc(f.x,f.y,c))continue;const q=lp(f.x,f.y,c),age=(now-f.start)/f.ttl;ctx.save();ctx.globalAlpha=Math.max(0,1-age);ctx.fillStyle=f.color;ctx.font='bold 13px sans-serif';ctx.fillText(f.text,q.x+CELL/2,q.y+5-age*12);ctx.restore()}
  drawForegroundDepth(c,now);
  ctx.restore();
}
function roomDiscovered(r){if(r.entered)return true;for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)if(s.seen.has(K(x,y)))return true;return false}
function dangerDiscovered(){const d=s.dangerDoor;return !!(d&&d.seen)}
function renderRoomLegend(){const box=root.querySelector('#roomLegend');if(!box)return;const chips=(s.specialRooms||[]).map(r=>roomDiscovered(r)?`<span class="room-chip discovered">${iconHTML(roomIconKey(r.type),'icon-inline icon-sm')} ${r.label||SPECIAL_ROOMS[r.type].name}</span>`:'<span class="room-chip unknown">? Stanza sconosciuta</span>');if(s.dangerDoor&&!s.dangerDoor.declined&&!s.dangerDoor.rewarded)chips.push(dangerDiscovered()?`<span class="room-chip discovered">${iconHTML('central_gate','icon-inline icon-sm')} Porta Pericolosa</span>`:'<span class="room-chip unknown">? Presenza sconosciuta</span>');const kp=s.keyPuzzle;if(kp?.door?.seen&&!kp.door.claimed)chips.push(`<span class="room-chip discovered">${iconHTML(kp.door.open?'open_door':'locked_door','icon-inline icon-sm')} ${kp.mandatory?'Varco Centrale':'Camera della Soglia'}</span>`);if((s.secrets||[]).some(q=>q.seen&&!q.opened))chips.push('<span class="room-chip discovered">≋ Parete sospetta</span>');if((s.secrets||[]).some(q=>q.opened))chips.push('<span class="room-chip discovered">✦ Camera segreta</span>');if(s.mechanism?.switch?.seen)chips.push(`<span class="room-chip discovered">⚙ ${s.mechanism.activated?'Deposito sbloccato':'Leva antica'}</span>`);box.innerHTML=chips.join('')}
function renderFloorRule(){const box=root.querySelector('#floorRule'),sheetBox=root.querySelector('#floorRuleSheet');if(!box||!s)return;const r=floorRule(),theme=s.theme||dungeonThemeForFloor(s.floor),pal=themePalette();const roles=[...(s.discoveredRoles||new Set())];const html=`<div class="floor-rule-main" style="border-left:3px solid ${pal.accent};padding-left:9px"><div class="floor-rule-title">${r.icon} Piano ${s.floor}: ${r.name}</div><div class="floor-rule-desc">${r.desc}</div><div class="subtle" style="margin-top:4px">${theme.icon} <strong>${theme.name}</strong> · ${theme.desc}<br>🧩 Struttura: <strong>${LAYOUT_STYLE_LABELS[s.layoutStyle]||'Variabile'}</strong><br>🔥 Luce: <strong>ogni passaggio stanza ↔ corridoio consuma intensità</strong> · il buio aumenta rischio e bottino</div></div><div class="role-legend">${roles.map(id=>`<span class="role-chip">${iconHTML(roleIconKey(id),'icon-inline icon-sm')} ${ENEMY_ROLES[id]?.name||id}</span>`).join('')}</div>`;box.innerHTML=html;if(sheetBox)sheetBox.innerHTML=`<strong>${r.icon} ${r.name}</strong><br>${r.desc}<br><br>${theme.icon} <strong>${theme.name}</strong> · ${theme.desc}`}
function previewText(){const f=eqWeapon().family;if(f==='spear')return '🔱 Raggio 2; muri e nemici bloccano.'+(has('spearMaster')?' Maestro: 50% danni al bersaglio dietro.':'');if(f==='axe')return '🪓 Colpisce tutte le 8 caselle adiacenti.'+(has('axeMaster')?' Maestro: multi-KO costa 1 durata.':'');if(f==='sword')return '🗡️ Attacco adiacente + Guardia.'+(has('swordMaster')?' Maestro: Guardia prepara Riposta.':'');if(f==='dagger')return '🔪 Verde = Backstab valido solo contro Ascia/Martello.'+(has('daggerMaster')?' Maestro: Backstab silenzioso.':'');if(f==='hammer')return '🔨 Freccia = spinta · STUN = arretramento bloccato. I boss resistono allo STUN.'+(has('hammerMaster')?' Maestro: spinta attiva Guardia.':'');return 'Attacco adiacente.'}
function nearbyVisibleEnemy(){if(!s)return null;return s.enemies.filter(e=>e.hp>0&&s.visible.has(K(e.x,e.y))).sort((a,b)=>cheb(a,s.player)-cheb(b,s.player))[0]||null}
function matchupContext(enemy,w=eqWeapon()){if(!enemy||!w||w.family==='unarmed')return null;const m=matchup(w.family,enemy.family);return m>1?{kind:'good',label:'▲ Vantaggio',text:`${F[w.family].name} batte ${F[enemy.family].name}`}:(m<1?{kind:'bad',label:'▼ Svantaggio',text:`${F[enemy.family].name} resiste · prova ${LOSES[enemy.family].map(f=>F[f].name).join(' / ')}`}:{kind:'neutral',label:'◆ Neutro',text:`${F[w.family].name} contro ${F[enemy.family].name}`})}
function runSummaryVerdict(r){if(r.kind==='death')return r.saved>0?{title:'🛡️ Sconfitta mitigata',text:'Hai perso la run, ma Assicurazione ha salvato parte dell’oro. Valuta se la profondità raggiunta giustificava il rischio.'}:{title:'☠️ Rischio non convertito',text:'La run non ha prodotto oro permanente. Nella prossima valuta prima l’estrazione quando vita e risorse iniziano a scarseggiare.'};if(r.clear)return{title:'🏆 Clear completo',text:'Hai superato tutti e 5 i piani. Ora il valore della run dipende soprattutto da build, obiettivi e qualità dell’esplorazione.'};if(r.floor>=4)return{title:'🏕️ Estrazione profonda',text:'Hai convertito una run ad alto rischio in progresso permanente. È una buona uscita quando le risorse non garantiscono il boss finale.'};if(r.floor>=2)return{title:'🏕️ Estrazione prudente',text:'Hai salvato progresso senza forzare la run. Scendere più a fondo aumenta molto il rendimento quando la build è pronta.'};return{title:'🏕️ Estrazione iniziale',text:'Hai messo al sicuro l’oro, ma il Piano 1 resta la profondità meno efficiente per progredire.'}}
function render(){
  if(!s)return;
  if(!s.player.facing)s.player.facing='up';
  syncHudDetails();
  const hr=Math.max(0,s.hp/s.maxHp),alarm=Math.max(0,Math.min(100,s.alarm)),inst=Math.max(0,Math.min(100,s.instability)),alarmLabel=alarm<25?'Calmo':alarm<50?'Attenzione':alarm<75?'Pericolo':'Critico',instLabel=inst<25?'Stabile':inst<50?'Irrequieto':inst<75?'Instabile':'Vista ridotta',w=eqWeapon(),i=eqItem();
  root.querySelector('#floor').textContent=s.floor;root.querySelector('#hpText').textContent=s.hp+'/'+s.maxHp;root.querySelector('#hpBar').style.width=hr*100+'%';root.querySelector('#hpBar').style.background=hr>.5?'#71c981':hr>.25?'#d3b452':'#df6666';root.querySelector('#hpCard').classList.toggle('hp-low',hr<=.25);
  const miniFloor=root.querySelector('#miniFloor');if(miniFloor)miniFloor.textContent=s.floor+'/'+MAX_FLOOR;
  root.querySelector('#runCoins').textContent=s.runCoins;const miniGold=root.querySelector('#miniGold');if(miniGold)miniGold.textContent=s.runCoins;const torchHud=root.querySelector('#portableTorchHud'),torchMeta=root.querySelector('#portableTorchMeta');if(torchHud&&torchMeta){const light=torchLight(),band=lightBand(),risk=Math.round(darknessFactor()*100);torchHud.classList.remove('active','bright','dim','dark');torchHud.classList.add(light>60?'bright':light>25?'dim':'dark');torchMeta.innerHTML=`Luce <strong>${light}/100</strong> · ${band}<div class="light-level-bar"><div style="width:${light}%"></div></div><div class="light-risk">Buio ${risk}% · più rischio, <strong>più bottino</strong></div>`;const miniTorch=root.querySelector('#miniTorch'),miniTorchState=root.querySelector('#miniTorchState');if(miniTorch)miniTorch.textContent=light;if(miniTorchState)miniTorchState.textContent=band}const projected=extractionValue(s.runCoins,s.floor),ratePct=extractionPercent(s.floor),extractEl=root.querySelector('#extractCoins'),rateHint=root.querySelector('#extractRateHint');if(extractEl)extractEl.textContent=projected;if(rateHint)rateHint.innerHTML=`Estrazione Piano ${s.floor}: <strong>${ratePct}%</strong> · ${s.runCoins} → ${projected} oro permanente`;root.querySelector('#alarmText').textContent=alarm;root.querySelector('#instabilityText').textContent=inst;const miniAlarm=root.querySelector('#miniAlarm'),miniAlarmState=root.querySelector('#miniAlarmState'),miniInstability=root.querySelector('#miniInstability'),miniInstabilityState=root.querySelector('#miniInstabilityState');if(miniAlarm)miniAlarm.textContent=alarm;if(miniAlarmState)miniAlarmState.textContent=alarmLabel;if(miniInstability)miniInstability.textContent=inst;if(miniInstabilityState)miniInstabilityState.textContent=instLabel;const alarmChip=miniAlarm?.closest('.board-chip'),instChip=miniInstability?.closest('.board-chip'),lightChip=root.querySelector('#miniTorchCard');const syncSignal=(el,level,klass,color)=>{if(!el)return;el.classList.remove('signal-normal','signal-warning','signal-critical','signal-unstable','signal-dark','signal-bright');el.classList.add(klass);el.style.setProperty('--fill',Math.min(100,Math.max(0,level))+'%');if(color)el.style.setProperty('--signal',color)};syncSignal(alarmChip,alarm,alarm>=75?'signal-critical':alarm>=40?'signal-warning':'signal-normal');syncSignal(instChip,inst,inst>=65?'signal-unstable':inst>=35?'signal-warning':'signal-normal');syncSignal(lightChip,torchLight(),torchLight()<25?'signal-dark':torchLight()<55?'signal-warning':'signal-bright');
  const alarmBar=root.querySelector('#alarmBar'),instBar=root.querySelector('#instabilityBar');if(alarmBar){alarmBar.style.width=alarm+'%';alarmBar.style.background=alarm<25?'#65bf7a':alarm<50?'#d4b452':alarm<75?'#dd8a46':'#dc5f5f'}if(instBar){instBar.style.width=inst+'%';instBar.style.background=inst<25?'#6fb3c8':inst<50?'#678fc9':inst<75?'#8975c6':'#b06bb9'}
  const boss=floorBoss(),bossBanner=root.querySelector('#bossBanner');if(bossBanner){if(boss){bossBanner.classList.remove('hidden');root.querySelector('#bossName').textContent=boss.name;root.querySelector('#bossHpText').textContent=boss.hp+'/'+boss.maxHp;root.querySelector('#bossHpBar').style.width=Math.max(0,boss.hp/boss.maxHp*100)+'%';root.querySelector('#bossHpBar').style.background=boss.bossKind==='final'?'#b56bd0':'#d39a58';root.querySelector('#bossState').textContent=boss.bossKind==='final'?(boss.telegraph?((boss.phase||1)>=2?'⚠️ FASE II · Colpo Sismico potenziato: esci dalle caselle rosse!':'⚠️ Caselle rosse = Colpo Sismico: allontanati!'):((boss.phase||1)>=2?'FASE II · carica un Colpo Sismico ogni 2 turni di ingaggio.':'Ogni terzo turno può caricare un colpo devastante.')):(boss.armored?'🛡️ Difesa attiva: il prossimo colpo è ridotto.':'Ogni terzo turno può assumere una posizione difensiva.')}else bossBanner.classList.add('hidden')}
  renderRoomLegend();renderThresholdStatus();
  const as=root.querySelector('#alarmState'),is=root.querySelector('#instabilityState'),vs=root.querySelector('#visionText');if(as)as.textContent=alarmLabel;if(is)is.textContent=instLabel;if(vs)vs.textContent='Vista '+visionRadius()+' caselle';
  root.querySelector('#weaponName').textContent=w.name;root.querySelector('#familyText').textContent=w.family==='unarmed'?'Nessuna':F[w.family].name;root.querySelector('#damageText').textContent=w.min+'-'+w.max;root.querySelector('#usesText').textContent=i?(i.uses<=0?'○':(i.uses<=6?'◆'.repeat(i.uses):'◆×'+i.uses)):'∞';root.querySelector('#statusText').textContent=s.ambushId?'IMBOSCATA':s.riposteReady?'RIPOSTA':s.guard?'Guardia':'—';root.querySelector('#invCount').textContent=s.inventory.length;root.querySelector('#invMax').textContent=maxInv();root.querySelector('#weaponPreviewLabel').textContent=previewText();const previewToggle=root.querySelector('#previewToggle');if(previewToggle){previewToggle.textContent=previewEnabled?'🎯 Area attacco: ON':'🎯 Area attacco: OFF';previewToggle.setAttribute('aria-pressed',String(previewEnabled));}
  const quickName=root.querySelector('#weaponQuickName'),quickMeta=root.querySelector('#weaponQuickMeta'),quickGlyph=root.querySelector('#weaponQuickGlyph'),quickEffect=root.querySelector('#weaponQuickEffect');if(quickName)quickName.textContent=w.name;if(quickMeta)quickMeta.textContent=(w.family==='unarmed'?'Nessuna':F[w.family].name)+' · '+w.min+'-'+w.max+' danni · '+(i?i.uses:'∞')+' KO';if(quickGlyph)quickGlyph.innerHTML=iconHTML(weaponIconKey(w.family),'icon-inline icon-lg');if(quickEffect)quickEffect.textContent=previewText();
  root.querySelector('#currentMatchup').innerHTML=w.family==='unarmed'?'—':`<div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><span class="good" title="Vantaggio">▲ ${F[w.family].beats.map(x=>`<span class=\"visual-cue-key\" title=\"${F[x].name}\">${familyGlyph(x)}</span>`).join(' ')}</span><span class="bad" title="Svantaggio">▼ ${LOSES[w.family].map(x=>`<span class=\"visual-cue-key\" title=\"${F[x].name}\">${familyGlyph(x)}</span>`).join(' ')}</span></div>`;
  renderInv();renderQuickWeapons();renderArtifacts();renderMissions();renderBuffs();renderTargetPanel();renderFloorRule();root.querySelector('#descendBtn').textContent=s.floor>=MAX_FLOOR?'🏆 Completa dungeon':'🎴 Bonus + scendi';
  const lockedAction=!!(s.eventOpen||s.rewardOpen||s.atStairs),healCount=s.inventory.filter(x=>x.kind==='heal').length,attackCount=eqWeapon().family==='axe'?s.enemies.filter(e=>targetAttackable(e,eqWeapon())).length:validTargets().filter(e=>targetAttackable(e)).length;
  const attackBtn=root.querySelector('#attackBtn'),healBtn=root.querySelector('#healBtn'),bagBtn=root.querySelector('#mobileSheetBtn');attackBtn.disabled=lockedAction;root.querySelector('#waitBtn').disabled=lockedAction;healBtn.disabled=lockedAction||healCount===0||s.hp>=s.maxHp;
  if(!s.targetMode&&!s.ambushId)attackBtn.innerHTML=attackCount>0?`⚔️ Attacca <span class="action-count">${attackCount}</span>`:'⚔️ Attacca';
  healBtn.innerHTML=`🧪 Cura <span class="action-count">${healCount}</span>`;healBtn.classList.toggle('action-urgent',hr<=.35&&healCount>0&&!healBtn.disabled);attackBtn.classList.toggle('action-ready',attackCount>0&&!lockedAction);if(bagBtn)bagBtn.innerHTML=`🎒 Menu <span class="action-count">${s.inventory.length}/${maxInv()}</span>`;
  const pressureCards=root.querySelectorAll('.stat-alarm,.stat-instability');pressureCards.forEach(card=>card.classList.remove('pressure-warn','pressure-danger'));if(alarm>=50)root.querySelector('.stat-alarm')?.classList.add(alarm>=75?'pressure-danger':'pressure-warn');if(inst>=50)root.querySelector('.stat-instability')?.classList.add(inst>=75?'pressure-danger':'pressure-warn');
  const hint=root.querySelector('#combatHint'),ambush=s.ambushId?s.enemies.find(x=>x.id===s.ambushId&&x.hp>0):null;if(!ambush)s.ambushId=null;
  const hudFocus=root.querySelector('#hudFocus');
  const mobileBoardFocus=root.querySelector('#mobileBoardFocus');
  if(s.targetMode){if(mobileBoardFocus)mobileBoardFocus.innerHTML='<div><strong>Bersaglio</strong><small>Tocca il nemico o usa le frecce per confermare.</small></div><button id="mobileInfoBtn" type="button">ℹ️ Info</button>';hint.textContent='🎯 Seleziona il nemico da colpire.';root.querySelector('#attackBtn').textContent='🎯 Conferma bersaglio';if(hudFocus)hudFocus.innerHTML='Scegli con calma il bersaglio.<small>Puoi usare frecce, WASD o cliccare il nemico.</small>'}else if(s.dangerOpen){hint.textContent='🚪 Porta Pericolosa: la scelta è gratuita.';if(hudFocus)hudFocus.innerHTML='Decidi se accettare il rischio.<small>La Porta Pericolosa aumenta la pressione ma offre una ricompensa forte.</small>'}else if(s.eventOpen){hint.textContent='✦ Evento raro: la scelta è gratuita.';if(hudFocus)hudFocus.innerHTML='Evento raro attivo.<small>Scegli una risposta e valuta il rapporto rischio/ricompensa.</small>'}else if(s.rewardOpen){hint.textContent='🎴 Scegli il bonus.';if(hudFocus)hudFocus.innerHTML='Scegli 1 bonus per la run.<small>Prendi quello che aiuta di più la tua situazione attuale.</small>'}else if(s.atStairs){hint.textContent='⬇️ Sei sulle scale.';root.querySelector('#attackBtn').textContent='⚔️ Attacca';if(hudFocus)hudFocus.innerHTML="Hai trovato le scale.<small>Puoi estrarre l'oro oppure scendere al piano successivo.</small>"}else if(ambush){hint.textContent='🔪 BACKSTAB pronto contro '+F[ambush.family].name;root.querySelector('#attackBtn').textContent='🔪 BACKSTAB';if(hudFocus)hudFocus.innerHTML='Hai un backstab pronto.<small>Attacca ora per sfruttare il vantaggio.</small>'}else{const nearEvent=s.rareEvent&&!s.rareEvent.used&&s.rareEvent.seen&&cheb(s.rareEvent,s.player)<=2?s.rareEvent:null;hint.textContent=hr<=.25?'❤️ Vita critica.':(mobileUI()?'Scorri sulla mappa o usa le frecce · Tocca un nemico per attaccare.':'Frecce/WASD per muoverti · F attacca.');root.querySelector('#attackBtn').textContent='⚔️ Attacca';const nearEnemy=nearbyVisibleEnemy(),mx=matchupContext(nearEnemy,w),bagFull=s.inventory.length>=maxInv();if(!nearEvent&&nearEnemy&&mx)hint.innerHTML=`<span class="context-matchup ${mx.kind}">${mx.label}</span> · ${mx.text}`;else if(!nearEvent&&bagFull&&hr>.25)hint.textContent='🎒 Zaino pieno: raccogliere altro richiederà una scelta.';if(hudFocus)hudFocus.innerHTML=nearEvent?`${iconHTML(eventIconKey(nearEvent.type),'icon-inline icon-sm')} ${EVENTS[nearEvent.type].name}<small>È un elemento del dungeon: raggiungilo per interagire.</small>`:hr<=.25?'Sei ferito: gioca con prudenza.<small>Cura, evita scontri inutili e punta alle scale.</small>':(nearEnemy&&mx?`${mx.label}: ${F[nearEnemy.family].name}<small>${mx.text}. ${bagFull?'Zaino pieno.':''}</small>`:(bagFull?'Zaino pieno.<small>Lascia, usa o sostituisci qualcosa prima del prossimo loot.</small>':'Esplora, trova risorse e raggiungi le scale.<small>Il dungeon comunica soprattutto attraverso simboli, colori e oggetti sulla mappa.</small>')); if(mobileBoardFocus){const objective=puzzleStatus();const right=nearEnemy?('<small><span class="weakness">Debole a: '+LOSES[nearEnemy.family].map(f=>familyGlyph(f)).join(' ')+'</span> · '+ENEMY_ROLES[nearEnemy.role].name+'</small>'):(nearEvent?'<small>Elemento vicino: interagisci raggiungendolo.</small>':(objective?('<small>'+objective.text+'</small>'):'<small>Muoviti, raccogli risorse e cerca le scale.</small>'));const title=nearEnemy?('Nemico: '+F[nearEnemy.family].name):(nearEvent?EVENTS[nearEvent.type].name:(objective?(objective.icon+' '+objective.title+(objective.step?(' · '+objective.step):'')):'Esplora'));mobileBoardFocus.innerHTML='<div><strong>'+title+'</strong>'+right+'</div><button id="mobileInfoBtn" type="button">ℹ️ Info</button>'}}
  const miniTitle=root.querySelector('#enemyTooltipTitle'),miniMeta=root.querySelector('#enemyTooltipMeta'),miniIcon=root.querySelector('#enemyTooltipIcon'),miniCard=root.querySelector('#enemyTooltipMini');
  if(miniTitle&&miniMeta){
    const visibleEnemy=s.enemies.filter(e=>e.hp>0&&s.visible.has(K(e.x,e.y))).sort((a,b)=>cheb(a,s.player)-cheb(b,s.player))[0]||null;
    const nearEventCtx=s.rareEvent&&!s.rareEvent.used&&s.rareEvent.seen&&cheb(s.rareEvent,s.player)<=2?s.rareEvent:null;
    const objectiveCtx=puzzleStatus();
    if(visibleEnemy){
      miniTitle.textContent='Nemico: '+F[visibleEnemy.family].name;
      miniMeta.textContent='Debole a: '+LOSES[visibleEnemy.family].map(f=>familyGlyph(f)).join('  ')+' · '+(ENEMY_ROLES[visibleEnemy.role]?.name||visibleEnemy.role);
      if(miniIcon)miniIcon.textContent='⚔️';
      if(miniCard)miniCard.classList.add('enemy-present');
    }else if(nearEventCtx){
      miniTitle.textContent=EVENTS[nearEventCtx.type].name;miniMeta.textContent='Elemento vicino: raggiungilo per interagire.';if(miniIcon)miniIcon.textContent='✦';if(miniCard)miniCard.classList.remove('enemy-present');
    }else if(objectiveCtx){
      miniTitle.textContent=objectiveCtx.icon+' '+objectiveCtx.title+(objectiveCtx.step?(' · '+objectiveCtx.step):'');miniMeta.textContent=objectiveCtx.text;if(miniIcon)miniIcon.textContent='🗝️';if(miniCard)miniCard.classList.remove('enemy-present');
    }else{
      miniTitle.textContent='Esplora';miniMeta.textContent='Muoviti, raccogli risorse e cerca le scale.';if(miniIcon)miniIcon.textContent='👁️';if(miniCard)miniCard.classList.remove('enemy-present');
    }
  }
  draw();
  mobileInfoBtnBind();
}
function waitTurn(){if(!s||s.atStairs||s.eventOpen||s.rewardOpen)return;cancelTargeting(false);s.ambushId=null;onPuzzleWait();addThreat(true,false);enemyTurn();if(s){updateVisibility();checkMissions();render()}}
function handleKey(e){if(guideOpen)return;if(!s||s.eventOpen||s.rewardOpen)return;if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;const k=e.key.toLowerCase();if(s.targetMode){let h=true;if(k==='arrowup'||k==='w'||k==='arrowleft'||k==='a')cycleTarget(-1);else if(k==='arrowdown'||k==='s'||k==='arrowright'||k==='d')cycleTarget(1);else if(k==='f'||k==='enter')confirmTarget();else if(k==='escape')cancelTargeting();else h=false;if(h)e.preventDefault();return}let h=true;if(k==='arrowup'||k==='w')move(0,-1);else if(k==='arrowdown'||k==='s')move(0,1);else if(k==='arrowleft'||k==='a')move(-1,0);else if(k==='arrowright'||k==='d')move(1,0);else if(k==='f')attack();else if(k===' ')waitTurn();else h=false;if(h)e.preventDefault()}
const thresholdDialogueEl=root.querySelector('#thresholdDialogue');if(thresholdDialogueEl)thresholdDialogueEl.onclick=()=>closeThresholdDialogue();root.addEventListener('keydown',handleKey);root.querySelector('#enterBtn').onclick=startRun;root.querySelector('#previewToggle').onclick=()=>{previewEnabled=!previewEnabled;saveMeta();if(s)render();root.focus()};root.querySelector('#attackBtn').onclick=()=>{if(s?.targetMode)confirmTarget();else attack();root.focus()};root.querySelector('#healBtn').onclick=()=>{useHeal();root.focus()};root.querySelector('#extractBtn').onclick=()=>extract(s&&s.floor===MAX_FLOOR);root.querySelector('#descendBtn').onclick=()=>{if(s.floor>=MAX_FLOOR)extract(true);else openReward()};root.querySelector('#continueExploreBtn').onclick=()=>{if(!s)return;s.atStairs=false;root.querySelector('#stairsPanel').classList.add('hidden');log('↩ Continui a esplorare.');render();root.focus()};root.querySelector('#cancelTargetBtn').onclick=()=>{cancelTargeting();root.focus()};root.querySelector('#summaryCampBtn').onclick=returnToHub;root.querySelector('#summaryRunBtn').onclick=()=>{root.querySelector('#runSummary').classList.add('hidden');root.querySelector('#hub').classList.remove('hidden');renderHub();startRun()};root.querySelector('#waitBtn').onclick=()=>{waitTurn();root.focus()};root.querySelectorAll('[data-dir]').forEach(b=>b.onclick=()=>{const d=b.dataset.dir;if(s?.targetMode){cycleTarget((d==='up'||d==='left')?-1:1)}else{if(d==='up')move(0,-1);if(d==='down')move(0,1);if(d==='left')move(-1,0);if(d==='right')move(1,0)}root.focus()});root.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{root.querySelectorAll('.game-tab').forEach(x=>x.classList.remove('tab-on'));b.classList.add('tab-on');root.querySelectorAll('.game-panel').forEach(x=>x.classList.add('hidden'));root.querySelector('#panel-'+b.dataset.tab).classList.remove('hidden');if(mobileUI())openMobileSheet(b.dataset.tab);root.focus()});const mobileSheetBtn=root.querySelector('#mobileSheetBtn'),mobileMissionBtn=root.querySelector('#mobileMissionBtn'),mobileSheetClose=root.querySelector('#mobileSheetClose'),mobileSheetBackdrop=root.querySelector('#mobileSheetBackdrop');if(mobileSheetBtn)mobileSheetBtn.onclick=()=>{openMobileSheet('gear');mobilePulse()};if(mobileMissionBtn)mobileMissionBtn.onclick=()=>{openMobileSheet('missions');mobilePulse()};if(mobileSheetClose)mobileSheetClose.onclick=()=>{closeMobileSheet();root.focus()};if(mobileSheetBackdrop)mobileSheetBackdrop.onclick=()=>{closeMobileSheet();root.focus()};canvas.addEventListener('click',ev=>{if(guideOpen)return;if(Date.now()<suppressCanvasClickUntil){ev.preventDefault();return}if(!s||s.eventOpen||s.rewardOpen||s.atStairs){root.focus();return}const rect=canvas.getBoundingClientRect(),px=(ev.clientX-rect.left)*canvas.width/rect.width,py=(ev.clientY-rect.top)*canvas.height/rect.height,c=camera(),x=c.sx+Math.floor(px/CELL),y=c.sy+Math.floor(py/CELL),enemy=enemyAt(x,y);if(enemy&&s.visible.has(K(x,y))&&eqWeapon().family!=='axe'&&validTargets().some(t=>t.id===enemy.id)){attackSingle(enemy);mobilePulse(12)}else if(mobileUI()&&!s.targetMode){const dx=x-s.player.x,dy=y-s.player.y;if(Math.abs(dx)+Math.abs(dy)===1){move(dx,dy);mobilePulse()}}else root.focus()});
canvas.addEventListener('pointerdown',ev=>{if(guideOpen)return;if(!mobileUI()||!s||!['touch','pen'].includes(ev.pointerType))return;mobilePointerStart={x:ev.clientX,y:ev.clientY,id:ev.pointerId};try{canvas.setPointerCapture(ev.pointerId)}catch(e){}});
canvas.addEventListener('pointerup',ev=>{if(guideOpen){mobilePointerStart=null;return}if(!mobilePointerStart||mobilePointerStart.id!==ev.pointerId)return;const dx=ev.clientX-mobilePointerStart.x,dy=ev.clientY-mobilePointerStart.y,ax=Math.abs(dx),ay=Math.abs(dy);mobilePointerStart=null;if(Math.max(ax,ay)<26)return;suppressCanvasClickUntil=Date.now()+420;ev.preventDefault();if(!s||s.eventOpen||s.rewardOpen||s.atStairs)return;if(s.targetMode){cycleTarget((ax>ay?dx:dy)<0?-1:1);mobilePulse();return}if(ax>ay)move(dx>0?1:-1,0);else move(0,dy>0?1:-1);mobilePulse(9)});
canvas.addEventListener('pointercancel',()=>{mobilePointerStart=null});const mobileInfoBtnBind=()=>{const b=root.querySelector('#mobileInfoBtn');if(b)b.onclick=()=>{const hudBtn=root.querySelector('#hudToggleBtn');if(hudBtn&&hudDetails===false){hudDetails=true;syncHudDetails()}openMobileSheet('gear');mobilePulse()}};mobileInfoBtnBind();window.addEventListener('resize',()=>{applyResponsiveBoard();if(s)render();if(!mobileUI())closeMobileSheet()});const welcomeStartBtn=root.querySelector('#welcomeStartBtn');if(welcomeStartBtn)welcomeStartBtn.onclick=onWelcomeStart;
for(const id of ['guideHubBtn','guideGameBtn']){const b=root.querySelector('#'+id);if(b)b.onclick=openGuide}
const guideCloseBtn=root.querySelector('#guideCloseBtn');if(guideCloseBtn)guideCloseBtn.onclick=()=>closeGuide(true);
const guidePlayBtn=root.querySelector('#guidePlayBtn');if(guidePlayBtn)guidePlayBtn.onclick=()=>closeGuide(true);
const objectivesToggle=root.querySelector('#objectivesToggle');if(objectivesToggle)objectivesToggle.onclick=()=>{objectivesOpen=!objectivesOpen;saveMeta();renderProgress()};
const hudToggleBtn=root.querySelector('#hudToggleBtn');if(hudToggleBtn)hudToggleBtn.onclick=()=>{hudDetails=!hudDetails;syncHudDetails()};
for(const id of ['soundToggleHub','soundToggleGame']){const b=root.querySelector('#'+id);if(b)b.onclick=toggleAudio}
const puzzleCloseBtn=root.querySelector('#puzzleCloseBtn');if(puzzleCloseBtn)puzzleCloseBtn.onclick=closePuzzlePanel;
loadMeta();syncSoundButtons();hydrateMatchupIcons();renderHub();
})();
// v16.6 — modalità discreta / foglio appunti
const DISCREET_NOTES_KEY='thresholdDiscreetNotesV1';
let discreetActive=false;
let discreetPrevTitle=document.title;

function setDiscreetMode(on){
  const overlay=document.getElementById('discreetOverlay');
  const notes=document.getElementById('discreetNotes');
  if(!overlay)return;
  discreetActive=!!on;
  overlay.classList.toggle('active',discreetActive);
  overlay.setAttribute('aria-hidden',discreetActive?'false':'true');
  document.body.classList.toggle('discreet-active',discreetActive);
  if(discreetActive){
    discreetPrevTitle=document.title;
    document.title='Note';
    try{notes.value=localStorage.getItem(DISCREET_NOTES_KEY)||''}catch(_){}
    setTimeout(()=>notes?.focus(),0);
  }else{
    document.title=discreetPrevTitle||'Threshold';
    document.getElementById('dungeon-fixed')?.focus?.();
  }
}

function toggleDiscreetMode(){setDiscreetMode(!discreetActive)}

document.addEventListener('DOMContentLoaded',()=>{
  const notes=document.getElementById('discreetNotes');
  const back=document.getElementById('discreetReturnBtn');
  try{if(notes)notes.value=localStorage.getItem(DISCREET_NOTES_KEY)||''}catch(_){}
  notes?.addEventListener('input',()=>{
    try{localStorage.setItem(DISCREET_NOTES_KEY,notes.value)}catch(_){}
  });
  back?.addEventListener('click',()=>setDiscreetMode(false));
});

window.addEventListener('keydown',(e)=>{
  if(e.key==='F9'){
    e.preventDefault();
    e.stopPropagation();
    toggleDiscreetMode();
    return;
  }
  if(discreetActive){
    // while notes are visible, game shortcuts never reach the game
    return;
  }
},true);


// v16.7 — personal phone build
let thresholdInstallPrompt=null;
let thresholdWakeLock=null;

function thresholdIsStandalone(){
  return window.matchMedia?.('(display-mode: standalone)')?.matches ||
         window.navigator.standalone === true;
}

async function thresholdRequestWakeLock(){
  try{
    if(thresholdWakeLock || !('wakeLock' in navigator) || document.visibilityState!=='visible')return;
    thresholdWakeLock=await navigator.wakeLock.request('screen');
    thresholdWakeLock?.addEventListener?.('release',()=>{thresholdWakeLock=null},{once:true});
  }catch(_){thresholdWakeLock=null}
}

async function thresholdInstall(){
  const btn=document.getElementById('mobileInstallBtn');
  if(thresholdInstallPrompt){
    thresholdInstallPrompt.prompt();
    try{await thresholdInstallPrompt.userChoice}catch(_){}
    thresholdInstallPrompt=null;
    btn?.classList.remove('show');
    return;
  }
  const isiOS=/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
  if(isiOS){
    alert('Su iPhone/iPad: apri il menu Condividi del browser e scegli “Aggiungi alla schermata Home”.');
  }else{
    alert('Per installare Threshold come app, apri questa build da un sito HTTPS e usa “Installa app” / “Aggiungi a schermata Home” nel menu del browser.');
  }
}

window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();
  thresholdInstallPrompt=e;
  document.getElementById('mobileInstallBtn')?.classList.add('show');
});
window.addEventListener('appinstalled',()=>{
  thresholdInstallPrompt=null;
  document.getElementById('mobileInstallBtn')?.classList.remove('show');
});
document.addEventListener('DOMContentLoaded',()=>{
  const b=document.getElementById('mobileInstallBtn');
  if(b){
    b.onclick=thresholdInstall;
    if(thresholdIsStandalone())b.style.display='none';
  }
  if(location.protocol==='https:' || location.hostname==='localhost'){
    navigator.serviceWorker?.register('./sw.js').catch(()=>{});
  }
  const start=document.getElementById('welcomeStartBtn');
  start?.addEventListener('click',thresholdRequestWakeLock,{passive:true});
});
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState!=='visible'){thresholdWakeLock=null;return}
  const welcome=document.getElementById('welcome'),game=document.getElementById('game');
  if(welcome && !welcome.classList.contains('hidden'))return;
  if(game && !game.classList.contains('hidden'))thresholdRequestWakeLock();
});

