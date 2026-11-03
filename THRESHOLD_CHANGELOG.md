# THRESHOLD — CHANGELOG DI CONTINUITÀ TRA CHAT

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
