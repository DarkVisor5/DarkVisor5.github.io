(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 root.ThresholdRiddles=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const questions=[
 {
  "id": "a01",
  "category": "archive",
  "theme": "soglia",
  "tier": 1,
  "prompt": "Scrivo percorsi senza muovermi. Ho fiumi ma non acqua. Che cosa sono?",
  "choices": [
   "Una mappa",
   "Un diario",
   "Uno specchio",
   "Una porta"
  ],
  "answer": 0,
  "explanation": "Una mappa disegna strade e fiumi senza contenerli."
 },
 {
  "id": "a02",
  "category": "archive",
  "theme": "memory",
  "tier": 1,
  "prompt": "Più ne fai uso, più aumenta. Non si può mettere in uno zaino.",
  "choices": [
   "L'oro",
   "La conoscenza",
   "La torcia",
   "L'armatura"
  ],
  "answer": 1,
  "explanation": "La conoscenza cresce quando la eserciti."
 },
 {
  "id": "a03",
  "category": "archive",
  "theme": "path",
  "tier": 1,
  "prompt": "Segno il nord ma non cammino mai. Che cosa sono?",
  "choices": [
   "Un sigillo",
   "Una campana",
   "Una bussola",
   "Una lama"
  ],
  "answer": 2,
  "explanation": "La bussola indica una direzione senza percorrerla."
 },
 {
  "id": "a04",
  "category": "archive",
  "theme": "runes",
  "tier": 2,
  "prompt": "Da solo sono muto; in una fila di segni posso raccontare una storia.",
  "choices": [
   "Una parete",
   "Un simbolo",
   "Un'ombra",
   "Una moneta"
  ],
  "answer": 1,
  "explanation": "I simboli acquistano significato quando vengono letti insieme."
 },
 {
  "id": "a05",
  "category": "archive",
  "theme": "soglia",
  "tier": 2,
  "prompt": "Lo attraversi senza possederlo. Dietro di me un luogo diventa un altro.",
  "choices": [
   "Una spada",
   "Un baule",
   "Un varco",
   "Un elmo"
  ],
  "answer": 2,
  "explanation": "Un varco divide e collega due luoghi."
 },
 {
  "id": "a06",
  "category": "archive",
  "theme": "path",
  "tier": 2,
  "prompt": "Cinque passi incisi sulla pietra: cosa devi conservare per completarli?",
  "choices": [
   "L'ordine",
   "L'oro",
   "Il silenzio",
   "Il peso"
  ],
  "answer": 0,
  "explanation": "Nei percorsi incisi la sequenza delle direzioni è decisiva."
 },
 {
  "id": "a07",
  "category": "archive",
  "theme": "runes",
  "tier": 3,
  "prompt": "Non cambia la pietra, ma rende leggibile un'iscrizione sconosciuta.",
  "choices": [
   "Una chiave",
   "Una tavola di decifrazione",
   "Un martello",
   "Una torcia spenta"
  ],
  "answer": 1,
  "explanation": "La tavola delle rune traduce i segni: non li sposta."
 },
 {
  "id": "a08",
  "category": "archive",
  "theme": "memory",
  "tier": 3,
  "prompt": "Mi cerchi in un archivio: custodisco risposte ma non pongo domande.",
  "choices": [
   "Un libro",
   "Un mostro",
   "Un pozzo",
   "Un'armatura"
  ],
  "answer": 0,
  "explanation": "Un libro conserva conoscenze che possono aiutare il viaggiatore."
 },
 {
  "id": "c01",
  "category": "crypt",
  "theme": "shadow",
  "tier": 1,
  "prompt": "Ti seguo alla luce; nel buio assoluto scompaio.",
  "choices": [
   "Il silenzio",
   "La polvere",
   "L'ombra",
   "Il nome"
  ],
  "answer": 2,
  "explanation": "Un'ombra ha bisogno di una sorgente luminosa."
 },
 {
  "id": "c02",
  "category": "crypt",
  "theme": "time",
  "tier": 1,
  "prompt": "Mi consumi senza toccarmi, e nessun tesoro può restituirmi.",
  "choices": [
   "Il tempo",
   "Una fiamma",
   "Una mappa",
   "Una corda"
  ],
  "answer": 0,
  "explanation": "Il tempo trascorso non si recupera."
 },
 {
  "id": "c03",
  "category": "crypt",
  "theme": "sound",
  "tier": 1,
  "prompt": "Ripeto le tue parole senza conoscere la lingua.",
  "choices": [
   "Un fantasma",
   "Un'eco",
   "Un guardiano",
   "Una campana"
  ],
  "answer": 1,
  "explanation": "L'eco ripete un suono riflesso."
 },
 {
  "id": "c04",
  "category": "crypt",
  "theme": "memory",
  "tier": 2,
  "prompt": "Rimango anche quando il mio proprietario non parla più.",
  "choices": [
   "Il respiro",
   "Un'impronta",
   "Il ricordo",
   "La fame"
  ],
  "answer": 2,
  "explanation": "Il ricordo può sopravvivere a chi lo ha creato."
 },
 {
  "id": "c05",
  "category": "crypt",
  "theme": "light",
  "tier": 2,
  "prompt": "Mi accendi e divento più piccola ogni minuto.",
  "choices": [
   "Una candela",
   "Una pietra",
   "Una chiave",
   "Una tomba"
  ],
  "answer": 0,
  "explanation": "La candela si consuma mentre brucia."
 },
 {
  "id": "c06",
  "category": "crypt",
  "theme": "soglia",
  "tier": 2,
  "prompt": "Ho un coperchio e custodisco silenzio, ma non sono uno scrigno.",
  "choices": [
   "Una porta",
   "Un sarcofago",
   "Un sigillo",
   "Un altare"
  ],
  "answer": 1,
  "explanation": "Il sarcofago custodisce una sepoltura."
 },
 {
  "id": "c07",
  "category": "crypt",
  "theme": "secret",
  "tier": 3,
  "prompt": "Sono sotto i tuoi piedi, ma puoi conoscermi senza vedermi.",
  "choices": [
   "La notte",
   "Il vento",
   "Un passaggio nascosto",
   "La luce"
  ],
  "answer": 2,
  "explanation": "Crepe e indizi possono rivelare un passaggio non visibile."
 },
 {
  "id": "c08",
  "category": "crypt",
  "theme": "time",
  "tier": 3,
  "prompt": "Non posso essere uccisa da un'arma e nascondo le forme lontane quando la luce manca.",
  "choices": [
   "La profondità",
   "La pioggia",
   "La memoria",
   "La notte"
  ],
  "answer": 3,
  "explanation": "La notte limita la visibilità, ma una torcia accesa può vincerne una parte."
 },
 {
  "id": "s01",
  "category": "sanctuary",
  "theme": "light",
  "tier": 1,
  "prompt": "Più ne condividi, meno buio rimane, ma non si esaurisce come l'oro.",
  "choices": [
   "La luce",
   "La paura",
   "Il rumore",
   "La cenere"
  ],
  "answer": 0,
  "explanation": "Accendere un'altra fiamma non sottrae luce alla prima."
 },
 {
  "id": "s02",
  "category": "sanctuary",
  "theme": "runes",
  "tier": 1,
  "prompt": "Segno una promessa nella pietra e resto fermo per secoli.",
  "choices": [
   "Una scala",
   "Una runa",
   "Un ponte",
   "Un tamburo"
  ],
  "answer": 1,
  "explanation": "Una runa incisa rimane anche se chi la scrisse scompare."
 },
 {
  "id": "s03",
  "category": "sanctuary",
  "theme": "soglia",
  "tier": 1,
  "prompt": "Non è un passo né una parola: a volte è l'unica azione che apre un sigillo.",
  "choices": [
   "Colpire",
   "Correre",
   "Attendere",
   "Nascondersi"
  ],
  "answer": 2,
  "explanation": "Alcuni sigilli reagiscono quando rimani fermo e aspetti."
 },
 {
  "id": "s04",
  "category": "sanctuary",
  "theme": "choice",
  "tier": 2,
  "prompt": "Non mi serve la forza, ma scegliere di rinunciare a qualcosa.",
  "choices": [
   "Un'offerta",
   "Una ferita",
   "Una moneta falsa",
   "Una lama"
  ],
  "answer": 0,
  "explanation": "Una vera offerta comporta una scelta."
 },
 {
  "id": "s05",
  "category": "sanctuary",
  "theme": "runes",
  "tier": 2,
  "prompt": "Quale sequenza è un ordine, non un oggetto?",
  "choices": [
   "Luna, lama, occhio",
   "Armatura, peso, ferro",
   "Torcia, olio, cenere",
   "Elmo, scudo, porta"
  ],
  "answer": 0,
  "explanation": "Tre segni in sequenza possono rappresentare un rituale."
 },
 {
  "id": "s06",
  "category": "sanctuary",
  "theme": "light",
  "tier": 2,
  "prompt": "Mi riempi senza versare acqua; più splendo, più indico vie.",
  "choices": [
   "Una coppa",
   "Una torcia",
   "Un'urna",
   "Un libro"
  ],
  "answer": 1,
  "explanation": "Una torcia accesa illumina il terreno vicino."
 },
 {
  "id": "s07",
  "category": "sanctuary",
  "theme": "balance",
  "tier": 3,
  "prompt": "Fra rischio e premio tengo due piatti, ma non decido al posto tuo.",
  "choices": [
   "Un altare",
   "Un sigillo",
   "Una bilancia",
   "Un baule"
  ],
  "answer": 2,
  "explanation": "La bilancia rappresenta la valutazione di scelte e conseguenze."
 },
 {
  "id": "s08",
  "category": "sanctuary",
  "theme": "soglia",
  "tier": 3,
  "prompt": "Sono il limite che separa ciò che conosci da ciò che ancora devi esplorare.",
  "choices": [
   "Il bottino",
   "Il buio inesplorato",
   "Una pozione",
   "Un'arma"
  ],
  "answer": 1,
  "explanation": "La zona sconosciuta è una soglia tra conoscenza e scoperta."
 },
 {
  "id": "g01",
  "category": "generic",
  "theme": "light",
  "tier": 1,
  "prompt": "Se mi togli dalla stanza, tutto rimane ma non riesci più a vederlo.",
  "choices": [
   "Il rumore",
   "La luce",
   "La polvere",
   "Il pavimento"
  ],
  "answer": 1,
  "explanation": "Senza luce gli oggetti possono esserci, anche se non li distingui."
 },
 {
  "id": "g02",
  "category": "generic",
  "theme": "path",
  "tier": 1,
  "prompt": "Mi trovi quando mi cerchi, ma sparisco dopo che mi hai percorso.",
  "choices": [
   "Una porta",
   "Una chiave",
   "Un cammino da scegliere",
   "Un baule"
  ],
  "answer": 2,
  "explanation": "Un percorso da scegliere smette di essere incerto quando lo percorri."
 },
 {
  "id": "g03",
  "category": "generic",
  "theme": "time",
  "tier": 1,
  "prompt": "Non avanza da sola; in un dungeon cambia tutto quando la compi.",
  "choices": [
   "Una scelta",
   "Una parete",
   "Una moneta",
   "Una torcia"
  ],
  "answer": 0,
  "explanation": "Una scelta può cambiare l'esito di una run."
 },
 {
  "id": "g04",
  "category": "generic",
  "theme": "soglia",
  "tier": 2,
  "prompt": "Sono aperta, ma non sono una bocca; collego due stanze.",
  "choices": [
   "Una scala",
   "Una porta",
   "Una fiamma",
   "Una campana"
  ],
  "answer": 1,
  "explanation": "Una porta aperta collega gli ambienti."
 },
 {
  "id": "g05",
  "category": "generic",
  "theme": "runes",
  "tier": 2,
  "prompt": "Mi componi con simboli; se inverti l'ordine cambio significato.",
  "choices": [
   "Un rituale",
   "Una trappola",
   "Un martello",
   "Una corazza"
  ],
  "answer": 0,
  "explanation": "La disposizione dei simboli determina il rituale."
 },
 {
  "id": "g06",
  "category": "generic",
  "theme": "combat",
  "tier": 2,
  "prompt": "La mia virtù è colpire prima che l'avversario si accorga di me.",
  "choices": [
   "La difesa",
   "La fuga",
   "L'imboscata",
   "Il rumore"
  ],
  "answer": 2,
  "explanation": "Un'imboscata premia il posizionamento silenzioso."
 },
 {
  "id": "g07",
  "category": "generic",
  "theme": "balance",
  "tier": 3,
  "prompt": "Più ne prendi, più puoi perdere se non torni vivo.",
  "choices": [
   "L'oro della run",
   "La vita massima",
   "La mappa",
   "La luce"
  ],
  "answer": 0,
  "explanation": "Portare più oro senza estrarlo aumenta il rischio della perdita."
 },
 {
  "id": "g08",
  "category": "generic",
  "theme": "path",
  "tier": 3,
  "prompt": "Non sei obbligato a visitarmi per arrivare alle scale, ma posso cambiare la tua sorte.",
  "choices": [
   "Un muro",
   "Una stanza secondaria",
   "Un confine esterno",
   "Un tasto"
  ],
  "answer": 1,
  "explanation": "Esplorare stanze facoltative offre risorse e rischi."
 }
];
 for(const q of questions){Object.freeze(q.choices);Object.freeze(q)}
 Object.freeze(questions);
 const categories=Object.freeze(['archive','crypt','sanctuary','generic']);
 function pick(options={}){
   const used=options.used instanceof Set?options.used:new Set(options.used||[]);
   const category=categories.includes(options.category)?options.category:'generic';
   const floor=Math.max(1,Number(options.floor)||1);
   const maxTier=Math.min(3,1+Math.floor((floor-1)/2));
   const rng=typeof options.random==='function'?options.random:Math.random;
   const unused=q=>!used.has(q.id);
   const prefer=questions.filter(q=>q.category===category&&q.tier<=maxTier&&unused(q));
   const alt=questions.filter(q=>q.category==='generic'&&q.tier<=maxTier&&unused(q));
   const fallback=questions.filter(q=>q.tier<=maxTier&&unused(q));
   const pool=prefer.length?prefer:alt.length?alt:fallback.length?fallback:questions.filter(q=>q.tier<=maxTier);
   const n=Math.max(0,Math.min(pool.length-1,Math.floor(Math.max(0,Math.min(.999999,Number(rng())||0))*pool.length)));
   return pool[n]||null;
 }
 function get(id){return questions.find(q=>q.id===id)||null}
 return Object.freeze({version:'1.0',questions,categories,pick,get});
});
