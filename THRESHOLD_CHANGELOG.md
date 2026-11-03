# THRESHOLD — CHANGELOG DI CONTINUITÀ TRA CHAT

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
