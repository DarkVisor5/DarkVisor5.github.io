# Threshold v18.26 — 100 partite dal piano 3 con cinque carte

**Data:** 2 novembre 2026  
**Workflow completo, 100/100 partite:** https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41455087615  
**Controllo iniziale di acquisto e scelta delle carte:** https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41454919227  
**Confronto senza carte, 100/100 partite:** https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41453809455

## Precisazione sulle armi

Le **armi non costituiscono un potenziamento permanente**: il loro inventario riparte da quello iniziale a ogni nuova run. Le carte, invece, rimangono acquistate e sono equipaggiabili fino a un massimo di **5** all'accampamento.

Questo test confronta 100 partite direttamente dal piano 3 con e senza carte. In entrambi i casi, il personaggio parte con gli HP normali, **spada arrugginita e una pozione piccola**, senza armi supplementari, HP di prova, o bonus raccolti ai piani 1 e 2.

## Il mazzo impiegato

Un profilo di test con **rango negozio II** (`meta.bestFloor=2`) e **1.930 oro iniziali nell'account** acquista le carte **tramite i veri pulsanti del negozio**; le cinque vengono selezionate mediante i pulsanti del mazzo prima della prima run. L'acquisto costa interamente il budget iniziale. Questo account è una condizione preparatoria del test, non un salvataggio ottenuto attraverso le 100 partite.

| Carta | Costo | Rango | Effetto |
|---|---:|---:|---|
| Maestro di spada | 270 | I | +15% alle spade e riposta |
| Erborista | 300 | I | Cure +25% |
| Passo cauto | 420 | II | Danni da trappole -40% |
| Occhio lungo | 440 | II | Visione +1 casella |
| Bussola spezzata | 500 | II | Scala segnata sulla mappa all'inizio del piano |
| **Totale** | **1.930** | | **5/5** |

Il runner verifica che il mazzo selezionato rimanga persistente in sessione e l'aggregatore rifiuta una partita che non riporti gli esatti cinque ID previsti.

## Risultati reali (100 partite per condizione)

| Metrica | Senza carte | Con 5 carte |
|---|---:|---:|
| Partite | 100 | 100 |
| Morti effettive | **82** | **74** |
| Interruzioni a 1.800 decisioni (non sono morti) | **18** | **26** |
| Vittorie | 0 | 0 |
| Estrazioni | 0 | 0 |
| Piano massimo raggiunto | **4** | **3** |
| Piano massimo medio | 3,01 | 3,00 |
| Decisioni medie per tentativo | 593 | 716 |
| Decisioni totali | 59.336 | 71.572 |
| Azioni di combattimento | 1.176 | 1.205 |
| Azioni di cura | 226 | 225 |
| Errori harness | 0 | 0 |

Tutte e 100 le partite con le carte si sono fermate al **piano 3**: 74 morti effettive, 26 tentativi interrotti al tetto di decisioni, 0 vittorie e 0 estrazioni. **51 delle 74 morti** con le carte sono arrivate prima di 300 decisioni. La prova complessiva include **71.572** decisioni del bot.

## Interpretazione corretta

Non è scientificamente corretto concludere che il mazzo migliori la sopravvivenza dell'8% dal solo calo delle morti **82 → 74**, perché le interruzioni sono salite **18 → 26**: tali tentativi non hanno un esito di gioco e vanno tenuti distinti. Inoltre i due gruppi usano generazioni casuali diverse (non seed appaiati).

Le cinque carte aumentano le scelte e i benefici ottenibili, ma questo bot **non dimostra un miglioramento robusto**: nessuna partita arriva al piano 4 con il mazzo, rispetto a una sola senza carte; la differenza di un tentativo è insufficiente a stabilire un peggioramento reale.

Il bot usa le azioni UI reali ma presenta ancora limiti strategici di esplorazione, mantenimento degli obiettivi e gestione delle situazioni di pericolo. È un test di **agente automatico nel gioco reale**, non una misura della difficoltà per un umano esperto.

## Riproduzione e prove

- `tools/qa_100_floor3_cards_runner.cjs`: server locale in Chromium; preparazione del profilo e acquisto tramite shop; inizio test al piano 3; azioni tramite bot UI.
- `tools/qa_100_floor3_cards_aggregate.cjs`: controlla le 100 partite e la corrispondenza del mazzo.
- `.github/workflows/qa-threshold-floor3-cards100.yml`: 10 shard, 10 partite ciascuno.
- Nel workflow GitHub Actions, artifact **`floor3-cards-evidence-0` … `floor3-cards-evidence-9`**: registri per partita e screenshot, più **`floor3-cards-100-consolidated-report`** con riepilogo completo. Conservazione prevista: 30 giorni.

La v17 stabile e il codice di gioco v18.26 **non sono stati modificati**; tutti i preparativi del profilo e gli script sono esclusivamente nei test.
