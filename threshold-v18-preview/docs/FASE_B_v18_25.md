# Threshold v18.25 · Fase B — libreria di enigmi e oggetti

Data: 2 novembre 2026.

## Funzionalità
- **11 tipi di arredi interattivi:** sarcofago, lastra tombale, libreria, leggio, schedario, altare votivo, pietra runica, reliquiario, casse, barili, scrigno di gemme.
- **32 indovinelli** riutilizzabili: 8 per archivi, 8 per cripte, 8 per santuari e 8 generici, con ID stabile, tema, difficoltà, domanda, quattro risposte, risposta corretta e spiegazione.
- Gli arredi si attivano camminando contro di essi. Appaiono con ✦ soltanto quando visibili e non usati. Non cambiano gli ingombri o la generazione.
- Ricompense una tantum: oro, luce, cura, lieve riduzione dell'instabilità. Fallimento: +6 instabilità. Sarcofagi: rischio di trappola; casse: oro e +5 allarme; altari: offerta di 18 oro.
- La banca evita le ripetizioni finché possibile e può essere utilizzata in altri dungeon passando semplicemente `category`, `floor`, `used` e `random`.

## API riutilizzabile

```js
const bank=window.ThresholdRiddles;
const used=new Set();
const q=bank.pick({category:'crypt',floor:3,used,random:Math.random});
if(q){used.add(q.id);console.log(q.prompt,q.choices,q.answer,q.explanation)}
```

Il controller `window.ThresholdPhaseB.create({root,getRun,bank,random,effects})` separa interfaccia e logica di ricompense. In future generazioni di dungeon si possono sostituire `getRun` e `effects`, mantenendo lo stesso archivio di domande.

## Integrazione con le Soglie già presenti
P1 chiave, P2 stele + attesa, P3 percorso, P4 rune, P5 LUNA → LAMA → OCCHIO restano obbligatori e invariati. Le librerie mostrano un indizio tramite `lockedDoorHelp`, senza risolvere o saltare la prova.

## QA
Test statici e di controller in `tools/qa_v18_25_phaseb.cjs` e workflow `qa-threshold-v18.yml`. Da completare playtest su browser reali, dispositivi mobili e partite complete; la v17 stabile non viene modificata.
