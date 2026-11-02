# Threshold v18.26 — Verifica della fattibilità: risorse reali lungo cinque piani

**Data:** 2 novembre 2026  
**Stato:** completato; 200 partite reali in Chromium, nessuna modifica al motore o al bilanciamento.

## Domanda

Un bot che parte regolarmente dal primo piano arriva al Custode del piano 3 e al boss finale del piano 5 con sufficienti HP, pozioni e armi per replicare i successi già osservati nei test isolati dei boss?

## Metodologia e dati verificabili

- Esecuzione GitHub Actions: https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41476967971 — **20 shard × 10 run = 200** e job aggregatore completato con successo, **0 errori del runner**.
- **100 partite senza carte:** bot della Fase D, senza mazzo permanente.
- **100 partite con build Spada/Guardia:** Maestro di spada, Erborista, Bastione, Quartiermastro, Ultima resistenza, acquistate via interfaccia in un account di QA precedentemente sbloccato fino al rango IV. Il bot specializzato predilige la spada.
- Ogni tentativo comincia normalmente al **piano 1** con l'equipaggiamento iniziale del gioco; **nessuna manipolazione** di HP, loot, armi, nemici, incontri, boss o posizione.
- `tools/qa_resource_checkpoints.js`: lettura passiva delle osservazioni già visibili al bot, senza modificare le decisioni. Registra l'**ingresso** in ogni piano, il **primo avvistamento** del boss e la presenza sulle scale, oltre al minimo HP osservato per piano. Registra quantità/tipologie pozioni, HP, spade e durata, Allarme e Instabilità.
- Script di esecuzione: `tools/qa_resources_nocards_runner.cjs` e `tools/qa_resources_sword_runner.cjs`; consolidamento `tools/qa_resource_feasibility_aggregate.cjs`.
- Artifact GitHub Actions `threshold-200-resource-feasibility-report`: rapporto Markdown e JSON che conserva le istantanee di tutti e 200 i tentativi; `telemetry-nocards-0…9` e `telemetry-sword-0…9` contengono gli originali. Conservazione prevista: 30 giorni.

### Cautele

I dungeon delle due coorti **non hanno gli stessi seed**. Il salvataggio meta di prova evolve nel corso delle partite e può conferire gradualmente HP iniziali aggiuntivi; non si tratta di 100 nuovi account indipendenti. Le partite terminate per limite d'azioni o stallo sono **interrotte, non morti**. Il campione valuta il comportamento del bot, non predice il risultato di un giocatore esperto.

## Risultati complessivi

| Indicatore | Senza carte | Build Spada/Guardia |
|---|---:|---:|
| Partite effettive | 100 | 100 |
| Morti vere | 91 | 85 |
| Interruzioni del bot | 9 | 15 |
| Vittorie complete | 0 | 0 |
| Piano massimo raggiunto | 4 | 4 |
| Arrivate al piano 2 | 82 | 90 |
| Arrivate al piano 3 | 55 | 70 |
| Arrivate al piano 4 | **1** | **13** |
| Arrivate al piano 5 | **0** | **0** |

### Risorse all'ingresso dei piani

Le medie di ogni riga si riferiscono **solamente a chi ha raggiunto quel piano**, non alle 100 run complessive.

| Profilo | Piano | Arrivi | HP medi | Pozioni medie | Allarme medio |
|---|---:|---:|---:|---:|---:|
| Senza carte | 1 | 100 | 46,2 | 1,0 | 0,0 |
| Senza carte | 2 | 82 | 34,9 | 1,3 | 13,2 |
| Senza carte | 3 | 55 | 33,1 | **0,6** | 34,0 |
| Senza carte | 4 | 1 | 18,0 | **0,0** | 24,0 |
| Senza carte | 5 | 0 | — | — | — |
| Spada/Guardia | 1 | 100 | 47,5 | 1,0 | 0,0 |
| Spada/Guardia | 2 | 90 | 40,7 | 1,8 | 14,5 |
| Spada/Guardia | 3 | 70 | 38,8 | **1,7** | 37,5 |
| Spada/Guardia | 4 | 13 | **27,3** | **0,3** | **71,3** |
| Spada/Guardia | 5 | 0 | — | — | — |

### Risorse al primo avvistamento del Custode

| Indicatore | Senza carte | Spada/Guardia |
|---|---:|---:|
| Boss effettivamente avvistato | 22/100 | 31/100 |
| HP medi al primo avvistamento | 30,6 | 35,1 |
| Pozioni medie | **0,5** | **1,5** |
| Spade utilizzabili medie | 2,2 | 1,5 |
| Durabilità totale media delle spade | 5,2 | 2,9 |
| Allarme medio | **69,4** | **80,0** |
| Avvistamenti con HP ≥40 | 8 | 13 |
| Avvistamenti con ≥3 pozioni | **0** | **6** |
| Avvistamenti con ≥3 spade | 10 | 6 |
| Con tutte e tre le condizioni (40 HP, 3 pozioni, 3 spade) | **0** | **1** |
| Corrispondenti *esattamente o meglio* al profilo isolato intermedio (HP ≥40, ≥2 piccole + ≥1 grande, ≥3 spade lunghe/duellante) | **0** | **0** |

La soglia più permissiva (HP ≥40, tre pozioni, tre spade di qualunque qualità) è stata incontrata **una sola volta su 200 run**, al primo avvistamento del Custode. La soglia rigorosa del test isolato da 25/25 vittorie non è stata raggiunta da nessuna delle 200 run.

Questo non dimostra che una combinazione più debole non possa vincere, né che il boss sia invincibile; mostra però che il bot non preserva spesso le risorse con cui avevamo verificato vittorie affidabili in arena.

### Piano 5

**Nessuna delle 200 run ha raggiunto il piano 5**, quindi non esiste una statistica osservata sulle risorse prima del boss finale in questo lotto. Non sostituire tale assenza con risorse teoriche o con i profili predisposti degli scontri isolati.

## Verdetto tecnico

1. **Raggiungibilità logica:** già verificata in 500 piani generati e una progressione guidata separata. Le scale sono raggiungibili dopo aver risolto i varchi.
2. **Fattibilità degli scontri isolati:** già verificata in 200 battaglie, di cui 150 vinte con HP e consumabili normali, secondo il profilo di prova (75/100 per ciascun boss, ma dato condizionato alle risorse assegnate).
3. **Fattibilità dell'intera run con questo bot:** **non dimostrata**. I checkpoint indicano un deficit di pozioni e HP quando il Custode entra in vista, aggravato da Allarme elevato; 13/100 con build forte entrano al piano 4, già provati dalle battaglie precedenti.
4. **Giocabilità umana:** **non testata**. L'evidenza può essere spiegata da una politica di esplorazione inefficiente e dal consumo eccessivo di turni che peggiora Allarme, trappole, luce e risorse. Il campione non distingue in modo causale un bilanciamento troppo duro da un bot imperfetto.

## Raccomandazioni di sviluppo

**Prima correggere o valutare il comportamento di esplorazione del bot**: ridurre passi inutili e allarme, raccogliere cure importanti senza esporsi a pericoli gratuiti, non affrontare elite opzionali e valutare estrazioni.

**Poi verificare un aiuto mirato dopo il Custode**, se i test umani mostrano la stessa scarsità: un recupero controllato di HP/pozioni all'ingresso del piano 4 potrebbe prevenire l'accumulo di danni senza depotenziare i boss. Non è una modifica ancora implementata.

**Obiettivo di validazione ancora aperto:** almeno una vera vittoria completa dal piano 1 al piano 5, con risorse raccolte in gioco e carta/equipaggiamento legalmente sbloccati. La v18.26 giocabile e la v17 stabile non sono state toccate.
