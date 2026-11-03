# Threshold v18.26 — QA Sprint efficienza, controller Fase F
**Change ID** `THR-20261103-004` · **03/11/2026** · **Solo QA/bot** · **v18.26 preview NON modificata** · **v17.17.0 stabile NON modificata**

## Obiettivo, base e perimetro
Lo scopo operativo è aumentare l'efficienza del bot in una **vera run autonoma P1→P5**, conservando HP e pozioni. Nessuna modifica a nemici, boss, torce del motore, loot, armi, carte, HP, save o versione giocabile.

- Repository: `DarkVisor5/DarkVisor5.github.io` `main`.
- HEAD verificato prima dell'intervento: `7d69206ddc1d82f557d7baaf3efa0f542d57430f`.
- Codice e CI testati: `04d899a6fb4af05c531895d1e3947a6107f9da10`.
- Sorgente controllo **prior**: `tools/qa_phase_f_previous_bot.js`, copia congelata del controller Fase F `THR-20261103-003`, non il vecchio bot Spada/Guardia. I test sui seed precedenti NON sono usati per la conclusione.
- File QA cambiati: `tools/qa_phase_f_bot.js`, `tools/qa_phase_f_previous_bot.js`, `tools/qa_phase_c_view.js`, `tools/qa_phase_f_worker.cjs`, `tools/qa_phase_f_paired_runner.cjs`, `tools/qa_phase_f_unit.cjs`, `.github/workflows/qa-threshold-phase-f.yml`.
- Confronto su **seed nuovi 20261123–20261132**, 10 coppie, limite **5.000 azioni per l'intera run**, stesso profilo QA di cinque carte ottenute usando l'interfaccia e gli stessi stati iniziali visibili. Gli esiti successivi **non** hanno identici sorteggi garantiti.
- Nessun test umano eseguito.

## Modifiche implementate nel controller
1. **Spazio cure:** quando il numero di armi utilizzabili supera 4 sui piani profondi (5 nei primi piani) e lo zaino è vicino a pieno oppure c'è una pozione conosciuta nelle vicinanze, il bot lascia tramite il normale pulsante `Lascia` l'arma peggiore non equipaggiata. Conserva, ove possibile, le due migliori armi e le due migliori spade osservate. Non altera l'inventario direttamente e non scarta in presenza di nemici entro 2 caselle.
2. **Memoria degli scarti:** il controller non sceglie la stessa arma appena lasciata come obiettivo opzionale; il sistema del motore può comunque raccoglierla incidentalmente se si attraversa la sua casella (problema residuo).
3. **Cure visibili:** maggiore priorità a pozioni già scoperte, su tragitti brevi e senza minacce visibili vicine, soprattutto quando restano 0–1 cure ai piani 2–5. Nessuna anticipazione delle posizioni nascoste.
4. **Scelta della pozione:** usa l'interfaccia reale per privilegiare una piccola quando basta e una grande in caso di danno ingente imminente.
5. **Torce note:** il view QA espone solo torce a muro già scoperte e ancora prelevabili. Il bot può raggiungere una casella adiacente ed effettuare l'effettivo movimento contro la parete per ricaricarsi con la regola del gioco. I conteggi delle azioni etichettate `wall_torch` comprendono passi **verso** la torcia, non sono un conteggio verificato di ricariche riuscite.

## Test eseguiti davvero
**GitHub Actions [41669384219](https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41669384219): completed/success.**
- **21/21** controlli policy Node + sintassi JS superati, compresi scarto via UI, pozione conosciuta, torcia visibile, conservazione arma equipaggiata e regressioni della navigazione.
- **20/20** reali tentativi Chromium headless (10 policy congelata v003, 10 nuova policy v004), **10/10 stati iniziali comparabili**, **0 errori del runner**. Partite eseguite tramite i controlli reali del gioco, non simulate matematicamente.
- Artifact RAW: `threshold-phase-f-paired-evidence` nel workflow, retention 30 giorni.

| Indicatore | Controllo v003 | Ottimizzato v004 |
|---|---:|---:|
| Vittorie reali P1→P5 | 0 | **0** |
| Morti reali | 8 | 10 |
| Interruzioni `action_limit` / `stuck` | 2 | 0 |
| Piano più profondo | P4 | P4 |
| Piano medio più profondo | 2,7 | **3,0** |
| Turni medi per tentativo | 1.798,2 | **806,4** |
| Spostamenti reali osservati medi | 1.743,0 | 723,2 |
| Armi lasciate tramite UI per run | non misurato | 3,9 |
| HP medi all'ultimo stato osservato | 10,3 | 1,0 |
| Allarme medio all'ultimo stato osservato | 70,1 | 87,9 |
| Pozioni medie all'ultimo stato osservato | 0,1 | 0,0 |

**Lettura corretta:** 3 seed in cui la nuova policy scende più in profondità, 2 seed in cui il vecchio bot è migliore, 5 pareggi. In due tentativi il controllo v003 ha raggiunto le 5.000 azioni senza morire al P1; la nuova policy ha invece continuato e successivamente è morta. La drastica differenza nei turni medi è dunque in parte effetto delle vecchie interruzioni, **non prova da sola maggiore efficienza o sopravvivenza**. Non è dimostrato un aumento statisticamente affidabile della probabilità di completamento.

### Checkpoint materiali
- La nuova policy ha effettivamente eseguito scarti (`weaponDrops` 0–10 per run, media 3,9), e in molte run l'inventario a P3 presenta meno armi.
- Seed **20261130**, nuova policy: ingresso P4 con **28 HP, 0 pozioni, 4 armi, luce 57, Allarme 80**. Controllo v003 fermo al P3. Il bot v004 muore poi al P4.
- Seed **20261132**, nuova policy: ingresso P4 con **51 HP, 0 pozioni, 4 armi, luce 33, Allarme 80**. Anche qui muore al P4. Il controllo v003 ha raggiunto P4 con 47 HP, 0 cure, 6 armi, luce 0.
- Entrambi i controller **0 vittorie e nessun ingresso P5 in questo specifico lotto**. Un precedente tentativo v003 nel lotto 20261113–20261122 aveva raggiunto il P5 con 0 pozioni: non confondere i due campioni.
- La telemetria `averageWeaponDrops` indica clic del bot sul pulsante `Lascia`, non certifica che ogni successivo reingresso non riprenda l'oggetto.
- Vengono ricercate torce già note tramite la API di visibilità filtrata; manca una misura separata dei **prelievi effettivamente riusciti**, distinta dai passi verso la torcia.

## Conclusione
**Tecnica: PASS. Vittoria autonoma: NON dimostrata. Valutazione strategica: PARZIALE / IN OSSERVAZIONE.** Il controllo degli slot è migliore, ma l'Allarme rimane alto e il bot consuma le cure soprattutto fra P3 e P4. Il campione è troppo piccolo e con aleatorietà successiva non appaiata per promuovere la nuova policy come certamente più vincente.

## Azioni successive consigliate
1. Raffinare ulteriore QA sulla spesa effettiva di torce e sugli scarti ripresi involontariamente; valutare costi di detour e Allarme ai checkpoint prima di cambiare policy.
2. Eseguire confronto su almeno 100 nuovi seed appaiati inizialmente, analizzando separatamente morti, interruzioni, piani raggiunti e riserve all'ingresso P3/P4/P5; migliorare riproducibilità RNG.
3. Playtest umano P1→P5 e collaudo mobile della leggibilità. Non cambiare HP/loot/boss per favorire il bot.

**Versione giocabile invariata:** [v18.26 preview](https://darkvisor5.github.io/threshold-v18-preview/). **Stabile v17.17.0 protetta**.
