/* Threshold v18.25 Phase B — optional interactive furniture.
 * Cross-dungeon controller: consumers inject run state and effects;
 * mandatory seals and puzzles remain entirely owned by the game.
 */
(function(global){
'use strict';
const OBJECTS=Object.freeze({
 sarcophagus:{kind:'crypt',icon:'⚰️',title:'Sarcofago',text:'Sul coperchio è inciso un enigma. Potresti decifrarlo oppure forzare il sepolcro.'},
 cryptTombSlab:{kind:'crypt',icon:'⚰️',title:'Lastra tombale',text:'La lastra custodisce una formula: chi sa rispondere riceve un dono.'},
 archiveBookshelf:{kind:'archive',icon:'📚',title:'Libreria antica',text:'Fra i volumi impolverati emerge una pagina di indovinelli.'},
 archiveLectern:{kind:'archive',icon:'📖',title:'Leggio',text:'Un manoscritto aperto domanda di essere interpretato.'},
 archiveScrollCabinet:{kind:'archive',icon:'📜',title:'Schedario di pergamene',text:'Un fascicolo contiene indizi sulla logica delle Soglie.'},
 votiveAltar:{kind:'sanctuary',icon:'🕯️',title:'Altare votivo',text:'L’altare offre una benedizione a chi interpreta il suo messaggio.'},
 sanctuaryRuneStone:{kind:'sanctuary',icon:'◇',title:'Pietra runica',text:'Segni antichi chiedono una risposta o un’offerta.'},
 sanctuaryReliquary:{kind:'sanctuary',icon:'✧',title:'Reliquiario',text:'Una piccola luce pulsa dietro il vetro del reliquiario.'},
 storeCratePile:{kind:'cache',icon:'📦',title:'Casse del magazzino',text:'Puoi forzare le casse oppure leggere i simboli sull’imballaggio.'},
 storeBarrelStack:{kind:'cache',icon:'🛢️',title:'Barili sigillati',text:'I barili nascondono qualcosa: una scritta avverte dei rischi.'},
 treasuryGemChest:{kind:'cache',icon:'💎',title:'Scrigno delle gemme',text:'Il piccolo scrigno è protetto da una breve iscrizione.'}
});
function makeController(args){
 const mount=args.root,getRun=args.getRun,effects=args.effects||{},bank=args.bank,random=args.random||Math.random;
 let panel=null,activeKey=null,activeProp=null;
 const keyFor=(run,prop)=>[run.floor,prop.type,prop.x,prop.y].join(':');
 const state=()=>getRun();
 const ensureRun=run=>{
   if(!(run._phaseBUsed instanceof Set))run._phaseBUsed=new Set();
   if(!(run._phaseBHistory instanceof Set))run._phaseBHistory=new Set();
   if(!(run._phaseBQuestions instanceof Map))run._phaseBQuestions=new Map();
 };
 const emit=(name,...values)=>typeof effects[name]==='function'?effects[name](...values):null;
 function canInteract(prop){
   const run=state();
   return !!(run&&prop&&OBJECTS[prop.type]&&!(run._phaseBUsed instanceof Set&&run._phaseBUsed.has(keyFor(run,prop))));
 }
 function dom(){
   if(panel)return panel;
   const doc=mount.ownerDocument||document;
   panel=doc.createElement('div');
   panel.id='phaseBOverlay';panel.className='phase-b-overlay';panel.hidden=true;
   panel.innerHTML='<section class="phase-b-card" role="dialog" aria-modal="true" aria-labelledby="phaseBTitle"><div class="phase-b-head"><div><small id="phaseBLabel">INCONTRO</small><h2 id="phaseBTitle">Oggetto</h2></div><button type="button" class="phase-b-close" id="phaseBClose" aria-label="Chiudi">✕</button></div><p id="phaseBText"></p><p id="phaseBNote" class="phase-b-note" hidden></p><div id="phaseBChoices" class="phase-b-actions"></div><small class="phase-b-foot">Interazione facoltativa · avvicinati e muoviti verso l’oggetto per aprirla.</small></section>';
   mount.appendChild(panel);
   panel.querySelector('#phaseBClose').addEventListener('click',close);
   panel.addEventListener('click',e=>{if(e.target===panel)close()});
   panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();e.preventDefault();close()}});
   return panel;
 }
 function close(){
   if(!panel||panel.hidden)return;
   panel.hidden=true;activeKey=null;activeProp=null;
   const run=state();if(run)run.eventOpen=false;
   emit('render');mount.focus?.();
 }
 function setup(title,text,label){
   const p=dom();p.querySelector('#phaseBTitle').textContent=title;
   p.querySelector('#phaseBText').textContent=text;
   p.querySelector('#phaseBLabel').textContent=label||'FASE B · INCONTRO';
   const note=p.querySelector('#phaseBNote');note.hidden=true;note.textContent='';
   p.querySelector('#phaseBChoices').replaceChildren();
   p.hidden=false;
 }
 function addChoice(label,action,disabled=false,sub=''){
   const b=(mount.ownerDocument||document).createElement('button');
   b.type='button';b.textContent=label;b.disabled=disabled;
   if(sub)b.title=sub;
   b.addEventListener('click',action);
   panel.querySelector('#phaseBChoices').appendChild(b);
   return b;
 }
 function showNote(message){
   const note=panel.querySelector('#phaseBNote');note.textContent=message;note.hidden=false;
 }
 function finalize(message){
   const run=state();
   if(run){ensureRun(run);run._phaseBUsed.add(activeKey)}
   close();
   if(message)emit('log',message);
   if(message)emit('toast',message);
   if(state()){emit('visibility');emit('render')}
 }
 function questionFor(run,prop){
   ensureRun(run);
   const k=keyFor(run,prop);
   let qid=run._phaseBQuestions.get(k),q=qid&&bank?.get?.(qid);
   if(!q){
     q=bank?.pick?.({category:OBJECTS[prop.type].kind==='cache'?'generic':OBJECTS[prop.type].kind,floor:run.floor,used:run._phaseBHistory,random})||null;
     if(q){run._phaseBQuestions.set(k,q.id);run._phaseBHistory.add(q.id)}
   }
   return q;
 }
 function question(prop){
   const run=state();if(!run)return close();
   const q=questionFor(run,prop);
   if(!q){setup('Iscrizione illeggibile','Le parole sono state consumate dal tempo. Nessuna ricompensa è perduta.','INDOVINELLO');addChoice('Indietro',()=>menu(prop));return}
   setup('❖ '+OBJECTS[prop.type].title,q.prompt,'INDOVINELLO · '+q.theme.toUpperCase());
   q.choices.forEach((answer,i)=>addChoice((i+1)+'. '+answer,()=>{
     const live=state();if(!live)return close();
     const correct=i===q.answer,origin=OBJECTS[prop.type].kind;
     if(correct){
       if(origin==='sanctuary'){const light=emit('light',14)||0,heal=emit('heal',5)||0;showResult('✓ La prova è superata. Luce +'+light+', vita +'+heal+'. '+q.explanation,true)}
       else{const payout=emit('gold',12+live.floor*7+(origin==='crypt'?8:0))||0;if(origin==='crypt')emit('stability',-5);showResult('✓ La prova è superata. Ricevi '+payout+' oro. '+q.explanation,true)}
     }else{
       emit('stability',6);
       showResult('✕ Il sigillo si spegne. Instabilità +6. '+q.explanation,false);
     }
   }));
   addChoice('↩ Torna alle scelte',()=>menu(prop));
 }
 function showResult(text,success){
   setup(success?'Risposta corretta':'Risposta errata',text,success?'PROVA SUPERATA':'PROVA FALLITA');
   addChoice('Continua',()=>finalize(success?'✦ Enigma risolto.':'✕ Enigma non risolto.'));
 }
 function risk(prop){
   const run=state();if(!run)return close();
   if(random()<.28){
     const cost=5+run.floor*2;showResult('Una trappola scatta sotto il coperchio! Subisci '+cost+' danni.',false);
     // A trap may end the run: hide the dialog before dealing damage.
     finalize('⚠️ La ricerca ha risvegliato una trappola.');
     emit('damage',cost);
     if(state())emit('render');
     return;
   }
   const gold=emit('gold',18+run.floor*10)||0;
   showResult('Dentro trovi '+gold+' oro, ma la tua ricerca fa rumore.',true);
   emit('noise',4);
 }
 function smash(){
   const run=state();if(!run)return close();
   const payout=emit('gold',10+run.floor*5)||0;
   emit('alarm',5);emit('noise',4);
   showResult('Il contenitore cede. Trovi '+payout+' oro, ma aumenti l’allarme di 5.',true);
 }
 function offering(){
   const run=state();if(!run)return close();
   const cost=18;
   if(run.runCoins<cost){showNote('Non possiedi abbastanza oro della run per fare un’offerta.');return}
   emit('spend',cost);
   const gained=emit('light',20)||0,healed=emit('heal',7)||0;
   showResult('L’offerta di '+cost+' oro dona luce +'+gained+' e vita +'+healed+'.',true);
 }
 function hint(prop){
   const text=emit('hint')||'Cerca le iscrizioni e osserva i simboli della Soglia.';
   showNote('Indizio sulle prove già presenti nel piano: '+text);
 }
 function menu(prop){
   const run=state();if(!run||!canInteract(prop))return close();
   const def=OBJECTS[prop.type];setup(def.icon+' '+def.title,def.text,'FASE B · OGGETTO INTERATTIVO');
   addChoice(def.kind==='archive'?'📜 Risolvi l’indovinello':def.kind==='sanctuary'?'◇ Interpreta il sigillo':'❖ Decifra l’iscrizione',()=>question(prop));
   if(def.kind==='archive')addChoice('🗝️ Cerca indizi sulla Soglia',()=>hint(prop));
   if(def.kind==='crypt')addChoice('⚒️ Forza il sepolcro (rischio)',()=>risk(prop));
   if(def.kind==='sanctuary')addChoice('🕯️ Offri 18 oro per luce e cura',()=>offering(),run.runCoins<18,'Serve oro raccolto in questa run');
   if(def.kind==='cache')addChoice('⚒️ Apri con forza (+allarme)',()=>smash());
   addChoice('Lascia stare',close);
   panel.querySelector('#phaseBChoices button')?.focus();
 }
 function open(prop){
   const run=state();if(!run||run.eventOpen||!canInteract(prop))return false;
   ensureRun(run);activeKey=keyFor(run,prop);activeProp=prop;run.eventOpen=true;
   emit('play','event');menu(prop);emit('render');return true;
 }
 return Object.freeze({open,close,canInteract,types:Object.keys(OBJECTS)});
}
global.ThresholdPhaseB=Object.freeze({create:makeController,types:Object.keys(OBJECTS)});
})(typeof globalThis!=='undefined'?globalThis:this);
