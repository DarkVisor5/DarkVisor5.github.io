# Threshold v18.26 — Fase C: diagnosi delle morti, bot migliorato e 200 partite reali

**Data:** 2 novembre 2026  
**Stato:** test completati; gioco e versione stabile invariati.

## Che cosa è stato implementato

Tutti i cambiamenti sono confinati ai file di QA, non al gioco pubblicato.

1. `tools/qa_phase_c_view.js`: osservazione di sola lettura dei dati effettivamente esplorati o visibili al giocatore, includendo gli ultimi messaggi del diario.
2. `tools/qa_phase_c_bot.js`: il bot non tratta più come obbligatori gli enigmi opzionali dei piani 1–3; considera la reale necessità di sconfiggere il Custode per attraversare le scale del terzo piano; cerca obiettivi raggiungibili e limita i rimbalzi in percorsi già battuti; sceglie bonus e cure da normali pulsanti UI.
3. `tools/qa_phase_c_runner.cjs`: una partita vera alla volta, da piano 1, attraverso Chromium, con risorse normali e senza accedere alle coordinate degli elementi nascosti; conserva gli ultimi 30 stati osservati di ogni run, inclusi HP, arma, nemici a schermo, minacce e messaggi d'impatto. Il dossier della morte è raccolto prima che lo stato della run venga chiuso.
4. `tools/qa_phase_c_cards_runner.cjs`: profilo QA con rango negozio II e 1.930 oro di budget acquista **tramite interfaccia** 5 carte di rango I–II. Si parte comunque dal piano 1 con spada arrugginita, una pozione e HP normali. Non vengono aggiunte armi o potenziamenti non previsti.
5. Due aggregatori separati documentano tutte le partite e distinguono morti da interruzioni per limite di 1.800 decisioni.

## Condizioni dei test

Il test **senza carte** è l'originale giocatore migliorato con il primo mazzo vuoto. Il secondo inizia con cinque carte permanenti acquistate: `farsight` (Occhio lungo), `pathfinder` (Bussola spezzata), `trapwise` (Passo cauto), `swordMaster` (Maestro di spada), `medic` (Erborista). In entrambi l'arma iniziale è la spada arrugginita e tutte le mosse sono normali input UI; non ci sono teletrasporti tra livelli, boss eliminati dal runner, o HP extra.

**I due gruppi non hanno seed appaiati**, quindi le differenze sono descrittive e non costituiscono un effetto causale verificato delle carte.

## Esiti delle 200 partite della Fase C

| Indicatore | Bot migliorato, nessuna carta | Bot migliorato, 5 carte |
|---|---:|---:|
| Partite realmente eseguite | **100** | **100** |
| Morti vere | 90 | 84 |
| Abbandoni a 1.800 decisioni o stallo del bot | 10 | 16 |
| Vittorie complete | 0 | 0 |
| Estrazioni | 0 | 0 |
| Piano massimo 1 | 25 | 25 |
| Piano massimo 2 | 45 | 33 |
| Piano massimo 3 | 30 | 40 |
| Piano massimo 4 | 0 | **2** |
| Piano massimo 5 | 0 | 0 |
| Piano massimo medio | 2,05 | 2,19 |
| Decisioni medie | 649 | 798 |
| Decisioni totali | 64.908 | 79.835 |
| KO totali riportati dal bot | 513 | 643 |
| Azioni di combattimento | 1.759 | 2.140 |
| Cure utilizzate | 399 | 443 |
| Errori harness | **0** | **0** |
| Dossier delle morti con ultimi 30 turni | 90/90 | 84/84 |

Il fatto di aver raggiunto il **quarto piano in due partite complete con le carte** è una prova importante di progressione reale: il gioco impedisce l'accesso alle scale del terzo piano mentre il miniboss Custode è vivo.

### Cause probabili del colpo letale

Il classificatore usa **il messaggio più recente del diario di gioco** e gli avversari visibili prima del colpo: le etichette sono indicative, non dati registrati direttamente come categorie di morte dal motore.

| Causa probabile | Senza carte | Con carte |
|---|---:|---:|
| Nemici comuni | 63 | 66 |
| Trappole | 22 | 7 |
| Boss | 5 | 11 |
| Totale morti | **90** | **84** |

La diminuzione delle morti associate alle trappole è coerente con l'effetto della carta `trapwise` (-40% danni da trappole), ma **non prova** che sia stata causata dalla carta: le mappe e le situazioni delle due serie differivano. L'aumento delle morti associate ai boss può dipendere dal maggior numero di partite che raggiungono e affrontano il miniboss.

## Confronto con il primissimo bot (100 partite senza carte)

| Indicatore | Bot originale | Fase C senza carte |
|---|---:|---:|
| Raggiunte almeno le profondità del piano 3 | 10 | **30** |
| Abbandoni | 38 | **10** |
| Piano massimo medio | 1,62 | **2,05** |
| Vittorie | 0 | 0 |

Il principale progresso è nel **bot di collaudo**, non in una modifica al bilanciamento del gioco. Si arriva più spesso in profondità ed è più difficile confondere un test bloccato con una morte vera.

## Conclusioni e prossimi problemi tecnici

- **Problema dominante:** combattimenti contro nemici ordinari e boss. Nel secondo lotto 66 morti sono state associate a nemici comuni e 11 a boss; nessun completamento fino al piano 5.
- **Tattica migliorabile:** bot ancora incline ad affrontare nemici già troppo pericolosi, spesso senza una via di fuga. Occorre introdurre scelte di ritirata, priorità di cure e tattiche per il boss, senza HP artificiali e senza mappa nascosta.
- **Navigazione:** ridotti gli stalli, ma non eliminati; i 16 abbandoni nella serie con carte non devono essere trasformati in morti.
- **Bilanciamento:** non ridurre ancora i danni ai giocatori o la salute dei boss solo per far vincere il bot. Prima è necessario confrontare un agente migliore e, possibilmente, partite umane.
- **Obiettivo non ancora raggiunto:** almeno una run completa, dal piano 1 al 5, con equipaggiamento realmente guadagnato.

## Prove e riproducibilità

- **100 senza carte:** https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41459386193
- **100 con carte:** https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41459986257
- **Smoke con sei partite e dossier delle morti:** https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41458969282
- Workflow: `.github/workflows/qa-threshold-phase-c-100.yml`, `.github/workflows/qa-threshold-phase-c-cards100.yml`.
- Artifacts: `phase-c-evidence-0` ... `phase-c-evidence-9`, `phase-c-cards-evidence-0` ... `phase-c-cards-evidence-9`; report aggregati `threshold-phase-c-100-diagnostic-report` e `threshold-phase-c-cards100-report` con JSON completi. Conservazione prevista: 30 giorni.

**Codice v18.26 e v17 stabile non modificati.** 
