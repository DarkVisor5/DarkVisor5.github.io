# Threshold QA Fase F: 5.000 azioni e sblocco loop verso scale

**Change ID** `THR-20261103-003` · **Data** 03/11/2026 · **Preview giocabile** v18.26 invariata · **Stabile** v17.17.0 invariata · **Area** soltanto QA/bot

## Versione e ambiente
- GitHub HEAD iniziale verificato: `04d60cd49b1deaef09421872d82140fbd2fc1fe8`.
- Commit QA limite 5.000: `106921d15e3e63eb32fd5982afb1cfd01ea06dae`.
- Commit QA navigazione su dati delle run: `902ac2e4aeb58b21d5f2621d926127473f9b7897`.
- File modificati: `tools/qa_phase_f_bot.js`, `tools/qa_phase_f_worker.cjs`, `tools/qa_phase_f_paired_runner.cjs`, `tools/qa_phase_f_unit.cjs`, `.github/workflows/qa-threshold-phase-f.yml`.
- Configurazione: `THRESHOLD_TURN_LIMIT=5000` per l'**intera** partita, non per piano. Limite massimo configurabile dal runner 10.000. Timeout processo worker 10 minuti, workflow 45 minuti.
- Controlli SHA motore/stabile: `threshold-v18-preview/js/game.js` `4cfaa7390f34522c73aa0057287d135c45ef1497`; `threshold/index.html` `7a6978e341d3c7ad7fd57363edf1ca761b2aa7a4`. Non modificati.
- Metodologia: vero Chromium Playwright headless, comandi reali nel gioco, stesso profilo QA di cinque carte acquistate/attivate via UI, generazione iniziale dello stesso seed per le due policy. **Niente teletrasporto, HP potenziati, modifiche a bottino/boss/IA, stati fixture preparati o partite umane**.
- Seed nuovi per questo sprint: 20261113–20261122. 10 coppie baseline/Fase F per iterazione. Confronti appaiati solo **allo stato iniziale** visibile; i sorteggi successivi possono divergere. Esecuzioni ripetute sugli stessi seed NON costituiscono campioni indipendenti.

## Prima esecuzione: solo limite 5.000
[GitHub Actions 41658958316](https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41658958316): **success**. 13/13 test policy, 10/10 coppie iniziali, 20 tentativi Chromium, 0 errori runner.

| Metrica | Baseline | Fase F |
|---|---:|---:|
| Vittorie P1→P5 | 0 | 0 |
| Morti effettive | 8 | 8 |
| Interruzioni (limite o stallo) | 2 | 2 |
| Piano massimo | P4 | P4 |
| Piano medio raggiunto | 2,5 | 2,7 |
| Turni medi | 1.091,6 | 2.000,5 |
| Movimenti osservati medi | 1.040,4 | 1.949,6 |

**Diagnosi da artifact originale:** seed 20261118, entrambe le policy, raggiunto limite 5.000 sul P1 con 37/45 HP e 4 pozioni, 642 caselle conosciute. I contatori delle azioni riportavano `stairs: 3582`, ma **`stairs` etichetta passi pianificati VERSO le scale, non clic sul pulsante**. Le ultime tracce mostravano un circuito di 4 caselle (28,8 → 28,9 → 29,9 → 29,8 → 28,8), senza aumenti di `knownCount`; un nemico blu compariva visibile solo a un vertice e rendeva momentaneamente non raggiungibile il percorso. Si trattava di un difetto di policy di esplorazione, NON prova che le scale o il generatore fossero impossibili.

## Correzione conservativa della navigazione
1. In `tools/qa_phase_f_bot.js`, storico su 12 posizioni; rileva cicli di periodo 2, 3 o 4 ripetuti tre volte **solo se la mappa conosciuta non cresce**; sospende temporaneamente un arco per 160 azioni. Non vieta permanentemente backtracking.
2. Se le scale **già conosciute** sono momentaneamente irraggiungibili nel grafo e un nemico **ordinario visibile** a distanza massima 5 può bloccare il passaggio, il bot valuta una casella ortogonale raggiungibile accanto al nemico. Lo fa soltanto con HP >=65% e almeno una pozione reale. Le élite non vengono affrontate deliberatamente tramite questa regola, e non si usano coordinate nemiche nascoste.
3. I dati dei cicli interrotti (`loopBreaks`) sono inclusi nei risultati Fase F; il bot baseline è invariato.

## Seconda esecuzione: 5.000 + fix navigazione
[GitHub Actions 41660443057](https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41660443057): **success**. **16/16** test di policy, **20/20** run browser iniziate, **10/10** coppie con stato iniziale corrispondente, nessun errore del runner.

| Metrica | Baseline | Fase F con fix |
|---|---:|---:|
| Vittorie complete P1→P5 | **0** | **0** |
| Morti effettive | 8 | 10 |
| Interruzioni, inclusi action_limit e stuck | 2 | 0 |
| Piano massimo raggiunto | P3 | **P5** |
| Piano medio raggiunto | 2,2 | **3,2** |
| Turni medi | 1.238,9 | 926,1 |
| Movimenti osservati medi | 1.190,2 | 854,1 |
| Confronto piano massimo per coppia | migliore in 1 | migliore in 7, pari in 2 |

**P5 documentato** nel seed **20261117**, con progressione reale dal P1: al primo ingresso sul P5 **22/51 HP, 0 pozioni, 0 luce, Allarme 80**, 9 armi nell'inventario, una spada con 2 usi. Primo ingresso P4 nello stesso tentativo: 19 HP, 0 pozioni e Allarme 75. Al primo boss visto al P3: 40 HP, 2 cure, Allarme 64. Il bot è morto effettivamente al P5, senza documentazione di scontro con il boss finale in questo tentativo. **Raggiungere P5 non significa vincere**.

**Stallo P1 corretto nel caso osservato**: seed 20261118, Fase F raggiunge P4, morte reale, 741 turni / 652 movimenti osservati / 1 azione `blocker`; baseline resta `action_limit` P1 con 5.000 azioni. La differenza nei singoli risultati è compatibile con la correzione, ma le run non hanno sorteggi successivi completamente vincolati.

## Conclusioni e next step
- L'aumento di azioni è attivo e verificato in CI. Il fix Fase F ha migliorato profondità in questo **piccolo campione**, senza vittorie; non esistono ancora stime affidabili di win-rate.
- **Problema nuovo più urgente:** al P4/P5 l'inventario è pieno soprattutto di armi, mentre HP e cure sono esauriti. L'osservazione non giustifica modificare motore, HP, boss, equipaggiamento iniziale o loot.
- Valutare nel prossimo intervento **gestione intelligente degli slot** tramite UI reale (scarto di armi inutili, raccolta cure visibili), controllo di Allarme/luce e priorità uscita. Servono ulteriori seed holdout, confronto più ampio (>=100 coppie) e un playtest umano.
- Gli artifact RAW sono disponibili dai workflow GitHub Actions (retention 30 giorni). Esecuzioni precedenti da 1.800 azioni e la v18.26 giocabile non sono state sovrascritte.
