# Threshold v18.26 — 100 partite browser reali
**Data:** 2 novembre 2026  
**Test GitHub Actions:** https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41452086503  
**Metodo:** 10 sessioni Chromium isolate × 10 run ognuna, con comandi reali da tastiera e click su interfaccia. Il bot riceve solo una vista **di lettura** delle caselle viste, degli arredi scoperti, di nemici visibili e dei dati normalmente accessibili al giocatore. Niente teletrasporti, HP amplificati, modifica di inventario o attacco diretto tramite API di gioco. Il bot non è un essere umano: usa euristiche di percorso.

## Esito ufficiale dei 100 tentativi

| Indicatore | Valore |
|---|---:|
| Partite avviate | **100/100** |
| Morti reali del personaggio | **62** |
| Estrazioni volontarie | **0** |
| Dungeon completati | **0** |
| Partite interrotte dal bot al tetto di 1.800 decisioni | **38** |
| Errori dell'harness | **0** |
| Piano massimo raggiunto | **3 su 5** |
| Piano massimo medio | **1,62** |
| Decisioni medie per partita | **1.026** |
| Decisioni totali | **102.634** |
| Azioni di combattimento ingaggiate | **1.290** |
| Azioni di cura | **307** |

I 38 **abbandoni** non sono morti e non devono essere trattati come sconfitte in una stima di sopravvivenza. I risultati esprimono il rendimento dell'attuale bot, non il tasso di successo di giocatori umani.

## Distribuzione dei 100 tentativi secondo il piano massimo raggiunto

| Piano massimo | Totale | Morte | Abbandono dopo limite |
|---|---:|---:|---:|
| 1 | **48** | 22 | 26 |
| 2 | **42** | 32 | 10 |
| 3 | **10** | 8 | 2 |
| 4 | **0** | 0 | 0 |
| 5 | **0** | 0 | 0 |

## Principali osservazioni

- Il motore ha gestito 100 avvii reali del gioco e oltre 100 mila decisioni del bot senza errori del test.
- Il bot riesce ad esplorare, affrontare nemici e utilizzare pozioni, inventario e scale; alcune run raggiungono il terzo piano.
- Il comportamento rimane imperfetto: il bot può inseguire continuamente frontiere, scale o bottino quando sarebbe opportuno abbandonare l'obiettivo e scegliere un'altra strategia. Un tetto di 1.800 decisioni interrompe solo i tentativi che non hanno terminato naturalmente.
- Mancano completamenti del dungeon, ma **non si può concludere che sia impossibile vincere**: il bot non costituisce un benchmark di giocatori esperti, non garantisce combattimenti ottimali e non dimostra la fattibilità in condizioni di gioco normale fino al piano 5.
- Prima di giudicare il bilanciamento dei boss e dell'endgame è necessario migliorare il percorso delle run (risoluzione coerente degli indovinelli, gestione dell'inventario e decisione di estrarre) e poi confrontare i risultati con playtest umani.

## Riproducibilità

Il workflow `.github/workflows/qa-threshold-player100.yml` usa:
- `tools/qa_100_player_view.js`: proiezione dei soli dati visibili/sperimentati;
- `tools/qa_100_player_bot.js`: strategia e input da tastiera / UI;
- `tools/qa_100_player_runner.cjs`: 10 partite reali per processo Chromium;
- `tools/qa_100_player_aggregate.cjs`: controllo finale dei 100 report.

L'esecuzione di GitHub Actions conserva dieci artifact con registri `results.json`, `results-partial.json` e screenshot del primo tentativo di ogni gruppo, più un artifact **threshold-play100-consolidated-report** contenente i risultati completi e il rapporto aggregato. Gli artifact hanno durata configurata a 30 giorni.

**Conclusione:** prova reale del motore riuscita, ma bilanciamento della v18.26 **non validato**; nessuna promozione alla versione stabile. La v17 rimane invariata.
