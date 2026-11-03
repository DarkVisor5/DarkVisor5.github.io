# THRESHOLD — CHANGELOG DI CONTINUITÀ TRA CHAT

## THR-20261103-001 — Fase F, strategia bot e QA su seed appaiati — 2026-11-03
- **Area:** strumenti di test e bot, NON gameplay.
- **Gioco prima/dopo:** v18.26 preview **invariata**; v17.17.0 stabile **invariata**.
- **Base GitHub:** `a50a27d48d32aff6e6f1fc03fe984ffaa94ca9e2`.
- **Codice originale implementato:** `ca5fe9f9d4558ff45bc7d5aa28ea82591379a5f4` — creato `tools/qa_phase_f_bot.js`; correzione successiva dei limiti delle deviazioni e dei livelli di pericolo `35a860636520e381415e1abf1c3e22678d4a8dac`.
- **Runner e test:** `tools/qa_phase_f_worker.cjs`, `tools/qa_phase_f_paired_runner.cjs`, `tools/qa_phase_f_unit.cjs`, `.github/workflows/qa-threshold-phase-f.yml`. CI estesa a 10 coppie nel commit `513ff8ff5b4ba4510ae7012cc3215ec7afcecaae`.
- **Implementazione:** priorità a cure, armi e torce già visibili, con detour limitati; evita casse rumorose quando Allarme elevato; sfavorisce percorsi vicini a nemici di rango alto visibili. Al P3 il blocco delle scale non impedisce al bot di cercare risorse.
- **Test eseguiti:** 7/7 controlli automatici di decisione passati; test Chromium su due seed iniziali appaiati passati senza errori tecnici — [run 41629150837](https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41629150837). Primo confronto (PRIMA della correzione 35a8606): baseline arriva al P3 su entrambi, Fase F al P1 su un seed e P3 sull'altro con interruzione per 1800 turni; zero vittorie da entrambe. **Prima iterazione non migliore**; non promuovere risultati.
- **Correzione in esame:** ridotti detour opzionali e migliorata la penalità per tier red/purple; CI a 10 coppie di partite, esito da registrare dopo completamento.
- **Problemi aperti:** prima vittoria autonoma P1→P5 mai dimostrata; scelte esplorative e allarme possono ancora peggiorare la run; campione numerico insufficiente per confronto robusto; test umano assente.
- **Passo successivo:** analizzare dieci seed, poi estendere a 100 seed appaiati se la nuova politica è promettente e controllare HP/pozioni al Custode. Non modificare loot, boss, IA, HP per alterare i risultati.

## THR-20261103-BASELINE-001 — Archivio storico e protocollo di handoff — 2026-11-03
- **Tipo:** documentazione, non patch gameplay.
- **Versione giocabile:** v18.26 preview; **stabile:** v17.17.0, entrambe invariate.
- **Ultimo commit prima della Fase F:** `a50a27d48d32aff6e6f1fc03fe984ffaa94ca9e2`.
- **Contenuto:** ricostruzione chat Programmazione avanzata 1–4, roadmap 35 funzioni, 33 carte, 5 famiglie di armi, rapporti QA e protocollo di continuità.
- **Risultati storici:** 500 mappe/piani controllati; 150/200 scontri isolati boss vinti; nessuna vittoria autonoma del bot con risorse ottenute da P1 lungo tutti i 5 piani.
- **Stato:** archivio iniziale locale, non commit del gioco.
