# Threshold v18.26 — Fase D: bot tattico e 200 partite vere

**Data:** 2 novembre 2026. **Ambito:** esclusivamente script di QA; nessuna modifica al codice del gioco, alla v18 giocabile o alla v17 stabile.

## Risultato principale

Il nuovo agente autonomo **ha raggiunto il quinto piano in due partite** partite dal primo piano con 5 carte acquistabili regolarmente; entrambi gli esiti sono stati morti effettive, non vittorie. Nei precedenti test della Fase C, con lo stesso numero di partite, il miglior piano era il 4.

Questo risultato **non dimostra che il dungeon sia bilanciato o facilmente battibile per giocatori umani**. Le prove sono esecuzioni reali nel browser con input UI e nebbia di guerra, ma il controller rimane un bot euristico.

## Miglioramenti effettivamente implementati

File: `tools/qa_phase_d_bot.js`, derivato separatamente dal bot della Fase C per mantenere confrontabile il codice precedente.

1. **Matchup delle cinque famiglie di armi.** Seleziona l'arma in base al bersaglio visibile e ai vantaggi dell'arma: lancia batte spada/pugnale, spada batte pugnale/ascia, pugnale batte ascia/martello, ascia batte martello/lancia, martello batte lancia/spada.
2. **Attacchi contestuali reali.** Usa colpi di lancia a due caselle quando la linea è libera e gli attacchi ad area dell'ascia attraverso i pulsanti del gioco, evitando attacchi con input non valido.
3. **Ritirata breve.** Se circondato o a rischio, valuta le quattro caselle esplorate adiacenti, rifiuta trappole/ostacoli/nemici e sceglie una fuga solo se riduce la minaccia. Limita ritirate ripetute.
4. **Consumo ragionato delle pozioni.** Distingue cura preventiva e cure d'emergenza, evita in parte lo spreco quando gli HP mancanti sono bassi; usare la cura non consuma un turno nemico, per le regole effettive del gioco.
5. **Equipaggiamento stabile.** Riduce il ciclo di cambi d'arma con un margine minimo di convenienza e una pausa di 15 decisioni fra cambi, salvo arma scarica. Nella prova preliminare il bot è passato da un massimo di oltre 100 a 5–13 cambi d'arma per partita.
6. **Percorsi bloccati.** Segna temporaneamente gli spostamenti che non producono movimento, impedendo di riprovare indefinitamente la stessa direzione.

Tutte le interazioni avvengono attraverso **tasti e pulsanti reali**. L'agente consulta soltanto la mappa già esplorata, i nemici attualmente visibili e l'inventario del giocatore. Non modifica HP, armi, nemici, boss, posizione, difficoltà o drop.

## Risultati verificati: 100 run senza carte e 100 con cinque carte

| Indicatore | Fase C senza carte | **Fase D senza carte** | Fase C con carte | **Fase D con carte** |
|---|---:|---:|---:|---:|
| Tentativi realmente giocati | 100 | **100** | 100 | **100** |
| Morti effettive | 90 | **95** | 84 | **92** |
| Interruzioni del bot | 10 | **5** | 16 | **8** |
| Vittorie | 0 | **0** | 0 | **0** |
| Piano massimo | 3 | **4** | 4 | **5** |
| Piano massimo medio | 2,05 | **2,38** | 2,19 | **2,60** |
| Piano 1 come massimo | 25 | **16** | 25 | **10** |
| Piano 2 come massimo | 45 | **32** | 33 | **30** |
| Piano 3 come massimo | 30 | **50** | 40 | **52** |
| Piano 4 come massimo | 0 | **2** | 2 | **6** |
| Piano 5 come massimo | 0 | **0** | 0 | **2** |
| KO registrati | 513 | **820** | 643 | **1.030** |
| Decisioni totali | 64.908 | **70.737** | 79.835 | **83.060** |
| Errori tecnici del test | 0 | **0** | 0 | **0** |

I dati mostrano una maggiore profondità media e meno tentativi interrotti, **non una minore letalità**: il bot infatti muore più spesso perché affronta più situazioni di pericolo prima di bloccarsi. I gruppi hanno seed casuali non appaiati, quindi il confronto è indicativo e non una prova statistica di efficacia.

## Utilizzo reale delle nuove tattiche

| Azione del bot | Fase D senza carte | Fase D con cinque carte |
|---|---:|---:|
| Attacchi d'ascia, inclusi diagonali | 711 | 833 |
| Colpi di lancia con portata 2 | 352 | 476 |
| Ritirate tattiche | 184 | 188 |
| Cambi d'arma | 689 | 851 |
| Cure | 450 | 523 |
| Attacchi normali | 1.631 | 2.044 |
| Attacchi al boss | 35 | 99 |

Sono registrati i **30 turni prima della morte per 95/95** sconfitte senza carte e **92/92** sconfitte con carte.

### Cause probabili del colpo finale

Queste etichette sono inferite dai messaggi più recenti del gioco e dai nemici visibili, **non sono categorie garantite dal motore**:

| Causa | Senza carte | Con carte |
|---|---:|---:|
| Nemici ordinari | 54 | 58 |
| Trappole | 26 | 15 |
| Boss visibili | 15 | 19 |

### Analisi delle due partite terminate al quinto piano

- **Partita 4 dello shard 7**, 1.226 decisioni: morte al piano 5 con 6 HP prima dell'ultima azione, a seguito di un attacco di un nemico élite di famiglia martello e tier viola (72 HP rimasti). L'ultimo colpo ha tolto 16 HP. L'attacco non è attribuito al boss finale.
- **Partita 5 dello shard 4**, 1.270 decisioni: morte al piano 5 con 5 HP prima dell'ultima azione, con un nemico di famiglia pugnale e tier blu (20 HP) nelle vicinanze. L'ultimo colpo ha tolto 6 HP. Anche questo non è attribuito al boss finale.

Queste diagnosi sono tratte dai dossier del bot: può esserci stata una precedente serie di ferite e scontri che ha portato alla situazione fatale.

## Prove verificabili

- **100 run Fase D senza carte**: https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41463454428
- **100 run Fase D con cinque carte**: https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41463484094
- **Seconda smoke test, dopo blocco cambi arma**: https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41463251768
- `tools/qa_phase_d_bot.js`
- `tools/qa_phase_d_runner.cjs`
- `tools/qa_phase_d_cards_runner.cjs`
- `tools/qa_phase_d_aggregate.cjs` e `tools/qa_phase_d_cards_aggregate.cjs`
- Workflow `.github/workflows/qa-phase-d-100.yml` e `.github/workflows/qa-phase-d-cards-100.yml`.

Su GitHub Actions, gli artifact per i dieci shard contengono i record delle partite, screenshot e dossier dei 30 turni; i due report consolidati contengono i riepiloghi e i 100 tracciati integrali. Conservazione configurata: 30 giorni.

## Priorità per Fase E

**Sopravvivenza al piano 5 e combattimento contro i nemici élite**: anticipare le situazioni pericolose quando gli HP sono bassi, evitare scontri con élite molto resistenti, gestire meglio l'Allarme e individuare una strategia legittima per affrontare il boss finale. L'obiettivo è la prima vittoria reale verificabile dal primo al quinto piano; non è ancora stata osservata.
