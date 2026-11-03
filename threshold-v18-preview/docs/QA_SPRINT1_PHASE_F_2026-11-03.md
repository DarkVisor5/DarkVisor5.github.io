# THRESHOLD Sprint 1 — Bot Fase F, telemetria e navigazione
**Change ID:** `THR-20261103-002` | **Data:** 03/11/2026 | **Versione giocabile:** v18.26 preview INVARIATA | **Stabile:** v17.17.0 INVARIATA

## Ambito e commit
- Base verificata prima delle modifiche: `d02961c7c3a4a884f0b2cca7011006b498a2def9`.
- Revisione QA iniziale: `93ab4922a738e9169adf7c5263b009822c34af81` (telemetria/risorse/navigazione).
- Revisione successiva: `e895f41d0542dd7691739116c3a73ee936e8fc4a` (deviazioni cure ridotte, prima versione del controllo frontiere).
- **Revisione QA definitiva esaminata:** `67aa331e8408130e4df8b7d8ec7076322920c343` (backtracking frontiere nuovamente consentito, penalizzato; etichetta contatore passi corretta).
- File codice modificati: `tools/qa_phase_f_bot.js`, `tools/qa_phase_f_worker.cjs`, `tools/qa_phase_f_paired_runner.cjs`, `tools/qa_phase_f_unit.cjs`.
- Esclusioni verificate: `threshold/index.html` SHA `7a6978e341d3c7ad7fd57363edf1ca761b2aa7a4`, `threshold-v18-preview/js/game.js` SHA `4cfaa7390f34522c73aa0057287d135c45ef1497`: entrambi **immutati**.
- Nessun cambiamento a HP, loot, mappe, IA, boss, metaprogressione o motore giocabile.

## Implementazione QA
1. Il runner osserva **entrambe** le policy attraverso la stessa API di visuale del giocatore. Conta esclusivamente cambiamenti di posizione di **una casella tra osservazioni**, memorizza `lastAlive` (HP, Allarme, Instabilità, pozioni, luce, posizione, piano, contatore passi del gioco) e lo snapshot immediatamente precedente alla schermata finale. `observedMoves` non significa tutti i turni né include movimenti terminali non osservabili.
2. Il bot Fase F conserva il tracciamento dell'ultimo stato valido, così la schermata di morte non sostituisce erroneamente i passi con `0`. Il contatore originale del motore è etichettato `gameReportedSteps`, senza affermare che sia limitato al piano.
3. La navigazione azzera goal/gate/bans *prima* del calcolo della nuova mappa, penalizza maggiormente frontiere già ripercorse ma **non le vieta**, evita mosse di fallback verso trappole, porte note chiuse e celle occupate; riconosce `elite` nelle minacce visibili.
4. La ricerca di pozioni resta conservativa: già viste, percorso corto, nessuna minaccia immediata; un percorso di preparazione extra è ammesso soltanto se il gate P3 è noto bloccato. Nessuna conoscenza nascosta del dungeon.

## Test REALI — esecuzione GitHub Actions
Tre revisioni sono state testate con Playwright Chromium usando input del gioco, stesso mazzo QA Spada/Guardia ottenuto tramite interfaccia in un profilo meta già sbloccato, 10 coppie di condizioni iniziali visibili uguali (seed 20261103–20261112), limite 1.800 azioni. Non sono 60 test indipendenti e il comportamento casuale **dopo la partenza** può divergere. Morti, interruzioni e vittorie sono conteggiate separatamente.

| Revisione | Run CI | Node policy | Baseline piano medio | Fase F piano medio | Vittorie B/F | Morti B/F | Interruzioni B/F | Note |
|---|---|---:|---:|---:|---:|---:|---:|---|
| Iniziale `93ab4922` | [41649514855](https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41649514855) | 12/12 | 2,7 | 2,4 | 0/0 | 9/8 | 1/2 | Deviazioni cure troppo ampie, risultati peggiori |
| Intermedia `e895f41d` | [41650045315](https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41650045315) | 13/13 | 2,8 | 2,5 | 0/0 | 9/9 | 1/1 | `stuck_no_known_path` con 34 HP e 2 pozioni, frontiere escluse erroneamente |
| **Finale `67aa331e`** | [41650718387](https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41650718387) | **13/13** | **2,4** | **2,4** | **0/0** | **9/10** | **1/0** | 10/10 coppie iniziali validate, 20/20 tentativi avviati, zero errori runner |

### Risultati dettagliati dell'ultima revisione
- Workflow e job conclusi con `success`; sintassi Node e **13/13** test di policy passati.
- **20** run browser P1, **19** morti autentiche, **1** limite di azioni e **0** vittorie P1→P5. Nessuna run è arrivata al P5 in questo lotto; massimo P3 per entrambe le policy.
- Ogni run ha `observedMoves > 0` (**20/20**); le **19/19** morti hanno snapshot `terminalSnapshot.lastAlive` e movimenti osservati positivi. Il precedente `steps=0` da reset finale è diagnosticato/corretto nella telemetria QA.
- Baseline: 2,4 piani medi, 711,6 turni medi, 663,9 movimenti medi osservati, 9 morti e 1 limite azioni.
- Fase F: 2,4 piani medi, 706,4 turni medi, 656,1 movimenti medi osservati, 10 morti e 0 interruzioni.
- Confronti profondità per seed: **1 favorevole alla Fase F, 1 favorevole alla baseline, 8 pareggi**. Non è dimostrato un aumento della probabilità di vittoria o una riduzione causale dei passi.
- Allarme medio dell'ultimo stato valido: baseline 74,2, Fase F 84,8. Pozioni residue medie: 0,2 baseline e 0 Fase F. Questi valori aggregano condizioni finali diverse, NON misurano i soli checkpoint P3.
- Risultati delle tre esecuzioni della baseline sullo stesso intervallo di seed **differiscono**: le stesse condizioni iniziali non garantiscono lo stesso decorso casuale. È necessaria migliore riproducibilità per attribuzioni causali.
- Evidenze originali: artifact `threshold-phase-f-paired-evidence` allegato al workflow [41650718387](https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41650718387), retention prevista 30 giorni.

## Conclusione QA e problemi aperti
**Accettato:** correzione della telemetria, bug di reset navigazione, controlli di fallback e regressioni unit. **Non dimostrato:** superiorità della nuova strategia di gioco, sopravvivenza al P5, fattibilità dell'intera run per un essere umano.

Rischi: esplorazione ancora molto lunga; esaurimento pozioni e Allarme alto; differenze del RNG successive all'avvio; 10 coppie insufficienti e ricalcate in più revisioni. Non usare i turni più bassi come prova di maggiore efficienza, perché può dipendere anche da morti più precoci.

## Prossime azioni
1. Stabilire un protocollo di confronto con **seed holdout mai usati, telemetria per piano e RNG riproducibile**; poi 100 coppie, separando vittorie/morti/timeout.
2. Diagnosticare priorità all'uscita, uso di pozioni ed élite su trace individuali; non cambiare il bilanciamento per abbellire la misura.
3. Organizzare playtest umano P1→P5 e QA mobile su torce, 36 asset, interazioni Fase B prima di promuovere v18.
