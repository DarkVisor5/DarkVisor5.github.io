# Threshold v18.26 — 100 partite reali con partenza dal terzo piano

**Data:** 2 novembre 2026  
**Esecuzione GitHub Actions:** https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41453809455  
**Scenario:** ingresso direttamente al terzo piano, con normale equipaggiamento iniziale; **non** sono stati giocati i piani 1 e 2.

## Metodo

Un runner Playwright/Chromium crea una nuova partita tramite l'interfaccia e, **solo all'avvio**, sostituisce il dungeon iniziale con un piano 3 generato dal motore vero del gioco. Gli HP, l'equipaggiamento, la pozione, l'allarme, gli oggetti del mondo, i mostri e i boss non sono potenziati, manomessi o eliminati. Dopo questo unico ingresso speciale il bot utilizza i comandi veri, una vista di sola lettura della nebbia di guerra e le interazioni tramite pulsanti; nessun teletrasporto durante la partita.

**Equipaggiamento all'ingresso:** spada arrugginita, una pozione piccola, HP normali di avvio, nessun potenziamento dei primi due piani. Questo rende il test **più severo di un normale arrivo al terzo piano**: non include armi, carte e risorse che un giocatore potrebbe aver accumulato.

10 sessioni isolate × 10 partite ciascuna, al massimo 1.800 decisioni per partita. I casi interrotti a questo limite sono **abbandoni del test**, non morti del personaggio.

## Esito verificato

| Indicatore | Risultato |
|---|---:|
| Tentativi realmente giocati | **100/100** |
| Morti del personaggio | **82** |
| Interruzioni per limite di decisioni | **18** |
| Estrazioni volontarie | **0** |
| Vittorie / dungeon completati | **0** |
| Piano massimo raggiunto | **4** |
| Piano massimo medio | **3,01** |
| Piano 3 come massimo raggiunto | **99 partite** |
| Piano 4 come massimo raggiunto | **1 partita**, poi morte |
| Piano 5 raggiunto | **0 partite** |
| Decisioni totali | **59.336** |
| Decisioni medie per tentativo | **593** |
| Azioni di combattimento | **1.176** |
| Azioni di cura | **226** |
| Errori del test browser | **0** |

### Comportamento del bot

- 46 partite contenevano azioni dirette alla stele/tablet; 43 partite contenevano almeno un passo del puzzle delle cinque direzioni; per un totale di **203 azioni 'route_step'**.
- **56 delle 82 morti** si sono verificate prima di 300 decisioni.
- Le azioni di esplorazione di nuove frontiere dominano: **49.070**, seguite da 4.391 azioni dirette al bottino, 1.914 alle casse e 1.859 alle scale. Il bot può ancora perdere tempo su obiettivi o percorsi inefficienti.
- I campi 'kills', 'steps' e 'hp' dell'ultimo snapshot dopo morte **non sono sempre affidabili** perché la schermata finale può terminare lo stato della run; pertanto i totali di KO non vengono usati per conclusioni.

## Interpretazione

**Il terzo piano è molto impegnativo per questo bot se affrontato con il kit iniziale del primo piano.** Un solo tentativo ha raggiunto il quarto piano, e nessuno ha raggiunto il quinto. Non è dimostrato che il terzo piano sia impossibile o mal bilanciato per un giocatore umano: il bot usa euristiche di movimento e combattimento non ottimizzate, oltre a partire senza le risorse ottenibili ai piani 1–2.

Per valutare il bilanciamento effettivo raccomandiamo due campioni distinti: (1) partenza al terzo piano **con equipaggiamento plausibile da fine piano 2**, definito in anticipo senza potenziamenti eccessivi, e (2) run complete con equipaggiamento accumulato naturalmente, confrontate con tester umani.

## Riproducibilità

- Workflow: `.github/workflows/qa-threshold-floor3-100.yml`
- Runner: `tools/qa_100_floor3_runner.cjs`
- Aggregatore: `tools/qa_100_floor3_aggregate.cjs`
- Bot azioni UI: `tools/qa_100_player_bot.js`
- Dati visibili al bot: `tools/qa_100_player_view.js`

GitHub Actions conserva gli artifact `floor3-evidence-0` ... `floor3-evidence-9` contenenti registri JSON e schermate iniziali di ogni gruppo, più l'artifact `floor3-100-consolidated-report`. La durata di conservazione configurata è di 30 giorni.

La **v17 stabile** e il codice di gioco **v18.26** sono rimasti invariati: i meccanismi di avvio speciale e gli script del bot sono esclusivamente file di test.
