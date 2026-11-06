# THRESHOLD — CHANGELOG DI CONTINUITÀ TRA CHAT

## THR-20261106-002 — v18.28 Reset Artistico (4 stanze pilota) — 2026-11-06
- **Preview giocabile:** v18.27 → **v18.28**, **ID nel menu + debug**; **stabile v17.17.0 protetta**. Base GitHub `b7c454a98d8c6c56c1f25df1fc3e0d4f245f5449`; codice grafico e generatori fino a `a593b6dfe82f73f635abaaf275bf5d79e950c9a0`, QA HEAD prima del report `c697b374a3414e005ff537063536c3cf5985dbaf`.
- **Implementato:** palette e pavimenti architettonici riconoscibili per **Cripta, Archivio, Infermeria, Santuario**; firma cromatica post-oscurità soltanto in stanza visibile illuminata, sprite leggermente più saturi, uno scenario principale preferenziale, massimo 2–3 arredi L2 per stanza pilota. Non aumentate torce, non modificati combattimento/HP/IA/boss/loot.
- **Attenzione gameplay ambientale:** arredi solidi e opportunità interattive facoltative possono variare. Preservati controlli di collisione, connettività e puzzle obbligatori. Altre quattro categorie NON ancora modificate.
- **File:** `threshold-v18-preview/js/game.js`, `threshold-v18-preview/index.html`, `tools/qa_v18_24_furniture.cjs`, `tools/qa_v18_27_lighting.cjs`, `tools/qa_v18_28_art_direction.cjs`, `.github/workflows/qa-threshold-v18.yml`, `threshold-v18-preview/docs/QA_v18_28_RESET_ARTISTICO_2026-11-06.md`, `THRESHOLD_CHANGELOG.md`, `threshold-project-state.json`.
- **QA reali:** [Actions 42202696558](https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/42202696558) **SUCCESS**: regressioni JS, smoke Chromium desktop/mobile, 8 confronti visivi guidati (4 categorie × 2 viewport) con 16 screenshot, 500 piani generati / 500 enigmi obbligatori risolti / 1.000 nicchie / 13.874 props. Deviazione RGB rispetto alla grafica precedente 60–78 punti nel campione (NON voto estetico). Nessuna vittoria autonoma P1→P5 testata.
- **Limiti:** accettazione estetica umana non raccolta; confronti con seed iniziale uguale non garantiscono `seen/visible` identici dopo inizializzazione opzionale; collisione/arredi facoltativi modificati; performance smartphone reale non collaudate.
- **Report:** `threshold-v18-preview/docs/QA_v18_28_RESET_ARTISTICO_2026-11-06.md`; screenshot nel workflow Actions (30 giorni).
- **Next:** approvazione visiva di 4 stanze, test meccanismi opzionali, palette/landmark delle altre 4, eventuale vero rifacimento sprite.

## THR-20261106-001 — v18.27 Room Light Bounce e arredi illuminati — 2026-11-06
- **Build giocabile:** v18.26-preview → **v18.27-preview**. Stabile `v17.17.0` invariata. **ID nel menu Accampamento e nel debug** (`window.__thresholdBuild`). Commit code: `2bb117831442a5be2f8999c38a916c9802258af8` (base `3a3e64aefbc1a09e2994b7def977de66de075885`).
- **Causa verificata:** raggi fermati dai muri, NON dagli arredi; stanze senza sorgenti garantite; overlay scuro 74–78%; gli sprite arredi venivano ravvivati soltanto per prossimità giocatore.
- **Implementato:** riflessione tenue limitata alle celle già visibili della stanza, lampade reali e luce portatile; relighting degli arredi in base alle sorgenti della propria stanza; nessun cambiamento a vision radius, nebbia di guerra, quantità di torce, Allarme, enigmi, HP, loot, IA o boss.
- **File:** `threshold-v18-preview/js/game.js`, `threshold-v18-preview/index.html`, `tools/qa_v18_24_furniture.cjs`, `tools/qa_v18_27_lighting.cjs`, `.github/workflows/qa-threshold-v18.yml`, `threshold-v18-preview/docs/QA_v18_27_ROOM_LIGHTING_2026-11-06.md`, `THRESHOLD_CHANGELOG.md`, `threshold-project-state.json`.
- **Test GitHub reali:** [42193228121](https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/42193228121) **SUCCESS**: statiche, regressioni arredi/puzzle, Chromium desktop/mobile, 500 piani/500 enigmi, 993 nicchie, 15.547 arredi. Screenshot comparativi visual fixture seed 20261106 (non run P1–P5): desktop luma **53,63 → 55,49**, mobile **56,58 → 58,24**, visibilità e intensità torcia invariate. Miglioramento quantitativo ma lieve.
- **Limiti:** nessun collaudo umano; regolazione luce e performance mobile da verificare; la prima vittoria autentica bot P1–P5 NON è dimostrata. L'ultima QA bot del 03/11 (ID `THR-20261103-005`) era su GitHub ma non ancora trascritta nel precedente manifest. Corretto test obsoleto che cercava solo URL build ≤18.26.
- **Evidenze:** `threshold-v18-preview/docs/QA_v18_27_ROOM_LIGHTING_2026-11-06.md`; suite screenshot canvas vera ripetuta su [42193446431](https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/42193446431).
- **Prossimo:** confronti visivi reali delle 8 categorie di stanza e smartphone, eventuale calibrazione solo grafica; riprendere separatamente QA bot.

## THR-20261103-004 — Bot Fase F: efficienza risorse e torce tramite UI reale — 2026-11-03
- **Ambito:** esclusivamente codice QA/bot, **v18.26 preview e v17.17.0 stabile NON modificate**. Base `7d69206ddc1d82f557d7baaf3efa0f542d57430f`, HEAD codice testato `04d899a6fb4af05c531895d1e3947a6107f9da10`.
- **Implementato:** `Lascia` per armi deboli con priorità agli slot cura, memoria loot scartato, raccolta più prioritaria di pozioni note, piccole/grandi selezionate via UI, recupero torce a muro solo se già scoperte; controller v003 congelato per A/B.
- **File:** `tools/qa_phase_f_bot.js`, `tools/qa_phase_f_previous_bot.js`, `tools/qa_phase_c_view.js`, `tools/qa_phase_f_worker.cjs`, `tools/qa_phase_f_paired_runner.cjs`, `tools/qa_phase_f_unit.cjs`, `.github/workflows/qa-threshold-phase-f.yml`, `threshold-v18-preview/docs/QA_EFFICIENZA_RISORSE_2026-11-03.md`, `THRESHOLD_CHANGELOG.md`, `threshold-project-state.json`.
- **Test reale:** [GitHub Actions 41669384219](https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41669384219) **success**, 21/21 test policy, 20 browser reali, 10/10 seed iniziali appaiati (20261123–20261132), limite 5000 azioni, 0 errori harness.
- **Risultati:** controllo F v003 0 vittorie/8 morti/2 interruzioni, piano max P4, profondità media 2,7, turni medi 1798,2; nuova F v004 0 vittorie/10 morti/0 interruzioni, piano max P4, profondità media 3,0, turni medi 806,4; 3 seed meglio, 2 peggio, 5 pari. **Nessuna vittoria P1→P5**, turni ridotti in parte per 2 timeout del controllo; non dimostra win-rate superiore.
- **Problemi aperti:** P4 ancora spesso senza pozioni, Allarme finale alto; lo scarto può essere raccolto nuovamente attraversando la stessa casella; azioni verso torce non misurano ricariche effettive. Nuovo campione necessario, il gioco non è stato ribilanciato.
- **Prossimi passi:** misurare detour/torce effettive, limitare consumo cure P3→P4, almeno 100 seed nuovi, poi umano.
- **Report:** `threshold-v18-preview/docs/QA_EFFICIENZA_RISORSE_2026-11-03.md`.

## THR-20261103-003 — QA bot 5.000 azioni e sblocco loop visibile — 2026-11-03
- **Area:** bot/QA soltanto. **v18.26 preview e v17.17.0 stabile invariate**. Base GitHub `04d60cd49b1deaef09421872d82140fbd2fc1fe8`, commit codice finale `902ac2e4aeb58b21d5f2621d926127473f9b7897`.
- **Implementato:** massimo predefinito di **5.000 azioni per partita completa**, in bot/worker/runner/workflow; nuovi seed 20261113–20261122; rilevamento cicli 2–4 celle; ingaggio prudente di nemico ordinario visibile che blocca scale conosciute (solo HP >=65% e almeno una pozione), mai nemico occulto. Nessun bilanciamento modificato.
- **File:** `tools/qa_phase_f_bot.js`, `tools/qa_phase_f_worker.cjs`, `tools/qa_phase_f_paired_runner.cjs`, `tools/qa_phase_f_unit.cjs`, `.github/workflows/qa-threshold-phase-f.yml`, `threshold-v18-preview/docs/QA_FASE_F_5000_AZIONI_2026-11-03.md`, `THRESHOLD_CHANGELOG.md`, `threshold-project-state.json`.
- **Test reali:** [prima CI 41658958316](https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41658958316) success, 13/13 unit, 20 Chromium; Fase F P4 max, 0/10 vittorie, riscontrato ciclo 4 celle sul P1. [CI finale 41660443057](https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41660443057) success, 16/16 unit, 20 Chromium, 10/10 condizioni iniziali appaiate, 0 errori.
- **Risultato finale:** baseline P3 max, 2,2 piani medi, 8 morti/2 interruzioni, 0 vittorie; Fase F **P5 max, 3,2 piani medi**, 10 morti/0 interruzioni, **0 vittorie**. Seed 20261117 raggiunge P5 con 22 HP e **0 pozioni**. Seed 20261118 supera precedente stallo P1, arriva a P4 ma muore.
- **Limiti:** 10 coppie, sorteggi successivi non appaiati, nessuna vittoria P1→P5, HP/pozioni esauriti dopo P3, troppo inventario di armi; nessuna prova umana.
- **Prossimo passo:** gestione slot e cure tramite UI normale, 100 seed holdout con telemetria di piani e RNG più replicabile, poi playtest umano.
- **Evidenze:** `threshold-v18-preview/docs/QA_FASE_F_5000_AZIONI_2026-11-03.md` e artifact GitHub Actions (30 giorni).

## THR-20261103-002 — Sprint 1 bot Fase F: telemetria terminale e navigazione prudente — 2026-11-03
- **Area:** solo bot e QA; **v18.26 preview e v17.17.0 stabile invariate**.
- **Base:** `d02961c7c3a4a884f0b2cca7011006b498a2def9`; **ultimo commit codice QA:** `67aa331e8408130e4df8b7d8ec7076322920c343`.
- **Implementato:** osservatore terminale delle mosse per entrambe le policy, snapshot pre-morte HP/Allarme/pozioni, pulizia obiettivi tra piani, fallback più sicuro su trappole/porte, penalità frontiere già viste senza impedirne il passaggio, recupero cure già osservate entro limiti prudenti vicino al boss P3.
- **File:** `tools/qa_phase_f_bot.js`, `tools/qa_phase_f_worker.cjs`, `tools/qa_phase_f_paired_runner.cjs`, `tools/qa_phase_f_unit.cjs`, `threshold-v18-preview/docs/QA_SPRINT1_PHASE_F_2026-11-03.md`, `THRESHOLD_CHANGELOG.md`, `threshold-project-state.json`.
- **Test reali:** 3 iterazioni CI Chromium (10 coppie iniziali per iterazione, **non campioni indipendenti**). Finale [GitHub Actions 41650718387](https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41650718387): **13/13 policy, 20/20 browser, 0 errori runner, 10/10 match iniziali; 19 morti, 1 interruzione, 0 vittorie**. 20/20 movimenti positivi; 19/19 morti con snapshot terminale.
- **Risultato finale:** piani medi baseline 2,4 e Fase F 2,4; 1 seed migliore, 1 peggiore, 8 pari. Non dichiarare un incremento di vittorie/efficienza.
- **Iterazioni scartate:** 93ab4922 (Fase F 2,4 vs baseline 2,7), e895f41d (2,5 vs 2,8; un bot bloccato con risorse residue). L'esclusione definitiva delle frontiere è stata rimossa.
- **Problemi residui:** 0 vittorie P1→P5, esplorazione/Allarme/pozioni critici, seed solo inizialmente appaiati, mancano prova umana e mobile.
- **Next:** 100 coppie su seed holdout con osservazione per piano; analisi dei percorsi, poi playtest umano. Mai modificare HP/loot/boss per far risultare il bot migliore.
- **Report:** `threshold-v18-preview/docs/QA_SPRINT1_PHASE_F_2026-11-03.md`.

## THR-20261103-001 — Fase F conservativa con QA seed appaiati — 2026-11-03
- **Area:** solo bot e infrastruttura QA, NON gioco.
- **Versioni:** v18.26 preview invariata; v17.17.0 stabile invariata. Nessuna v18.27 giocabile.
- **Base commit:** `a50a27d48d32aff6e6f1fc03fe984ffaa94ca9e2`.
- **Modifiche implementate:** controller `tools/qa_phase_f_bot.js` derivato da Spada/Guardia; breve deviazione verso cure critiche già viste, bottino P3 consentito durante il blocco del Custode, minore interesse per forzieri rumorosi, lieve penalità su nemici forti già visibili. Niente alterazione di HP, loot, mappe, boss o IA.
- **Codice QA:** `tools/qa_phase_f_bot.js` (revisione conservativa `f45fdbe853575270d78cba4405d031694838ceb0`), `tools/qa_phase_f_worker.cjs`, `tools/qa_phase_f_paired_runner.cjs`, `tools/qa_phase_f_unit.cjs`, `.github/workflows/qa-threshold-phase-f.yml`.
- **Test effettivo definitivo:** 7/7 test Node passati; [GitHub Actions 41630726729](https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41630726729) successo. 10 seed con stato iniziale/mappa visibile corrispondenti, 20 partite Chromium dal P1. **0 errori harness, 0 vittorie, 20 morti reali, 0 interruzioni.** Baseline: piano medio 2,6, turni medi 852, max P4; Phase F: piano medio 2,7, turni medi 756, max P4. 1 seed migliore, 9 pari, 0 peggiori.
- **Interpretazione:** segnale preliminare soltanto; campione troppo piccolo per dimostrare miglioramento significativo. Non dichiarare vittorie end-to-end né giocabilità umana dimostrata.
- **Dettagli:** `threshold-v18-preview/docs/QA_FASE_F_2026-11-03.md` (commit `f0d86930d8508d783db89391fad3dd5672446ce7`).
- **Problemi aperti:** niente vittoria completa; Allarme e risorse critiche; `steps=0` nel sommario di alcune morti per reset stato finale; playtest umano e mobile mancanti.
- **Next:** correggere telemetria passi, campione 100 seed appaiati se opportuno, analizzare HP/pozioni al P3 prima di qualsiasi modifica al bilanciamento.

## THR-20261103-BASELINE-001 — Archivio storico e protocollo di handoff — 2026-11-03
- **Tipo:** documentazione, non patch gameplay.
- **Versione giocabile:** v18.26 preview; **stabile:** v17.17.0, entrambe invariate.
- **Ultimo commit prima della Fase F:** `a50a27d48d32aff6e6f1fc03fe984ffaa94ca9e2`.
- **Contenuto:** ricostruzione chat Programmazione avanzata 1–4, roadmap 35 funzioni, 33 carte, 5 famiglie di armi, rapporti QA e protocollo di continuità.
- **Risultati storici:** 500 mappe/piani controllati; 150/200 scontri isolati boss vinti; nessuna vittoria autonoma del bot con risorse ottenute da P1 lungo tutti i 5 piani.
- **Stato:** archivio iniziale locale, non commit del gioco.
