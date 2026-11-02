# Threshold v18.26 — Mazzo Spada / Guardia / Sopravvivenza applicato al bot

**Data:** 2 novembre 2026  
**Obiettivo:** applicare la build a cinque carte identificata nei test v18 del 29 ottobre e validarla con 100 vere partite browser dal piano 1 al piano 5.

## Build esatta, verificata nel codice v18.26

| Carta | ID | Rango negozio | Prezzo | Effetto |
|---|---|---:|---:|---|
| Maestro di spada | `swordMaster` | I | 270 | +15% danni delle spade; riposta +25% dopo Guardia |
| Erborista | `medic` | I | 300 | +25% cure |
| Bastione | `bulwark` | III | 700 | Guardia: 60% del danno bloccato (subisci il 40%) |
| Quartiermastro | `quartermaster` | III | 750 | Una pozione aggiuntiva generata per piano |
| Ultima resistenza | `survivor` | IV | 1260 | Sopravvive una volta al colpo letale, restando a 1 HP |
| **Totale** | | **IV necessario** | **3280** | **5/5 carte** |

Il negozio IV richiede di avere già raggiunto almeno il piano 4 in una precedente partita. Il profilo QA ha `meta.bestFloor=4` e 3280 oro non speso, come fixture esplicita: le carte **non vengono introdotte direttamente nello stato della partita**, ma comprate con i pulsanti del vero negozio. La console del test preliminare ha verificato esattamente:

`CARD_DECK_SELECTED {"ids":["swordMaster","medic","bulwark","quartermaster","survivor"],"cost":3280,"rank":4,"bank":"0","cards":["Maestro di spada","Erborista","Bastione","Quartiermastro","Ultima resistenza"]}`

La run comincia sempre dal piano 1 con l'arma standard **Spada arrugginita**, **una pozione piccola** e **45 HP base**, salvo progressione da obiettivi raggiunta durante la stessa sessione; niente teletrasporti o trucchi sui danni. Le carte acquistate restano selezionate nel salvataggio della sessione QA.

## Perché si è scelto questo mazzo

Le analisi del 29 ottobre indicavano **10541/11000 = 95,83%** nella simulazione di 11.000 prove; tale percentuale è una **metrica del vecchio modello simulato, non il tasso atteso o dimostrato nelle run integrali**. La sinergia è difensiva: gli attacchi di spada attivano Guardia; Bastione riduce il prossimo colpo a 40% del danno, Maestro di spada permette la Riposta, Erborista potenzia le cure, Quartiermastro aumenta le pozioni disponibili e Ultima resistenza evita una morte una volta per run.

Il nuovo bot `tools/qa_optimal_sword_build_bot.js` deriva dal bot Fase D, ma assegna priorità alla spada negli scontri ravvicinati e considera il bonus di Erborista per non sprecare le pozioni. Può ricorrere a un'altra famiglia di armi se la spada è esaurita o non è vantaggiosa. Usa solo pulsanti/tasti UI e mappa già esplorata.

## Prove eseguite

- Smoke: cinque partite reali, selezione e acquisto confermati: https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41468002802
- Campione completo: **100 partite reali**, 10 shard × 10 partite, job di aggregazione terminato con successo: https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41468410060

| Risultato | Build ottimizzata, bot Spada Fase D | Vecchio mazzo esplorativo, bot Fase D |
|---|---:|---:|
| Tentativi | 100 | 100 |
| Morti effettive | **88** | 92 |
| Interruzioni (limite decisioni/stallo) | **12** | 8 |
| Vittorie | **0** | 0 |
| Arrivate almeno al piano 3 | **65** | 60 |
| Arrivate almeno al piano 4 | **9** | 8 |
| Arrivate al piano 5 | **0** | 2 |
| Piano medio massimo | **2,64** | 2,60 |
| Massimo piano raggiunto | **4** | 5 |
| Decisioni totali | 90.424 | 83.060 |
| KO registrati | 1.093 | 1.030 |
| Cure usate | 648 | 523 |
| Morti con ultimi 30 turni registrati | 88/88 | 92/92 |
| Errori di harness | 0 | 0 |

La maggiore profondità media e i 9 accessi al piano 4 non provano un vantaggio statistico: sono sessioni casuali diverse e anche la politica di scelta arma è stata specializzata per questa build. Non esiste un confronto con seed appaiati e politica identica. Le 12 interruzioni sono tentativi **non completati**, non morti del personaggio.

### Distribuzione dei risultati — nuova build

- Piano 1 come massimo raggiunto: 10 (4 morti, 6 interruzioni).
- Piano 2: 25 (22 morti, 3 interruzioni).
- Piano 3: 56 (53 morti, 3 interruzioni).
- Piano 4: 9 (9 morti).
- Piano 5: 0.

Cause **probabili** delle 88 morti inferite dal diario a schermo e nemici visibili: 51 nemici comuni, 23 boss, 14 trappole. Sono etichette euristiche; non attribuzioni certe del motore.

## Conclusione

**La build esatta è stata applicata al bot, acquistata regolarmente e testata in 100 partite reali.** La configurazione difensiva ha dato più accessi ai piani 3 e 4 rispetto al vecchio mazzo, ma non ha prodotto vittorie né raggiunto il quinto piano. Non è corretto trasferire il precedente valore 95,83% ai risultati reali.

Raccomandazione per QA: mantenere sia il bot Fase D originale con mazzo esplorativo sia il bot Spada/Guardia con questa build, e confrontare in seguito run con stessi seed e stessa strategia per isolare il contributo delle carte.

**Nessun file del gioco `threshold-v18-preview/js/game.js` e nessun file della v17 stabile è stato modificato.** Non si è acceduto al salvataggio locale del browser dell'utente, quindi l'applicazione della build riguarda il bot di test e il suo profilo QA, non un account personale.

## File e prove

- `tools/qa_optimal_sword_build_bot.js`
- `tools/qa_optimal_sword_build_runner.cjs`
- `tools/qa_optimal_sword_build_aggregate.cjs`
- `.github/workflows/qa-optimal-sword-build-100.yml`
- Artifacts per le dieci serie, screenshot della prima partita di ciascun gruppo, 100 registri individuali e artifact `optimal-sword-build-100-consolidated-report`, conservati secondo configurazione del workflow per 30 giorni.
