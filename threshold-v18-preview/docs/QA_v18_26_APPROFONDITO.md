# Threshold v18.26 — rapporto QA approfondito
**Data:** 2 novembre 2026  
**Versione verificata:** ramo `main`, preview `threshold-v18-preview/`  
**Esecuzione automatica:** [GitHub Actions — QA profondo](https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41448582232)

## Risultati

| Verifica | Risultato | Stato |
|---|---:|---|
| Seed reali di dungeon | 100 | Superato |
| Piani realmente generati (5 per seed) | 500 | 500/500 |
| Obiettivi dei puzzle principali raggiungibili senza attraversare il varco ancora bloccato | 500 piani controllati | Superato |
| Puzzle principali sbloccati tramite callback reali | 500 | 500/500 |
| Scale raggiungibili una volta aperti gli eventuali varchi | 500 | 500/500 |
| Varchi Centrali dei piani 4–5 non aggirabili prima dell'apertura | 200 piani | Superato |
| Nicchie laterali valutate | 993 | Superato |
| Arredi effettivamente generati nelle mappe testate | 15.547 | Superato |
| Percorsi di cinque piani con discese e completamento run | 1 progressione guidata | Superato |
| Custode piano 3 | 20 attacchi, 20 colpi a segno | Sconfitto in ambiente isolato |
| Boss finale piano 5 | 20 attacchi, 20 colpi a segno | Sconfitto in ambiente isolato |
| Avvio Chromium desktop e mobile | 1280×800 e 390×844 | Superato |
| Regressione precedente su riddle/interazioni e mappe sintetiche | Suite v18.24–v18.26 | Superato |

## Metodologia e limiti

1. **Generatore effettivo:** i test sfruttano il codice reale `generateFloor` mediante una strumentazione temporanea del server locale di Playwright; le API di debug **non vengono aggiunte alla distribuzione di gioco**.
2. **Raggiungibilità:** BFS sulla mappa reale, considerando impassabili muri, arredi solidi e, fino alla risoluzione, il varco principale. Sono verificati scale, chiavi, stele, sigilli, decoder e percorsi guidati.
3. **Risoluzione automatizzata:** per testare i callback dei puzzle, il personaggio viene spostato direttamente sui punti corretti; la raggiungibilità fisica viene verificata separatamente dalla BFS. Quindi non è una partita vinta da un giocatore autonomo con spostamenti e gestione risorse normali.
4. **Combattimento reale ma isolato:** i boss vengono colpiti con il vero `attackSingle`, insieme a `enemyTurn`, `damageEnemy` e `kill`. Il personaggio riceve **10.000 HP** e un'arma con durabilità di prova per isolare i comportamenti di attacco, IA e morte. Il Custode ha ridotto gli HP del giocatore di **121**; il boss finale di **107**, con personaggio fermo accanto al nemico: queste misure non stimano i danni di una strategia ottimale.
5. **Nessuna prova di equilibrio:** non sono verificati la riuscita di un combattimento a HP normali, il farming, l'inventario lungo cinque piani, la probabilità di sopravvivenza o la manovrabilità tattica del boss.
6. **V17 invariata:** la strumentazione QA opera sulla preview e nel runner; nessuna modifica alla v17.

## Elementi corretti durante il QA

La prima versione del controllo segnalava erroneamente le nicchie della seconda metà dei piani 4 e 5 come irraggiungibili prima dell'apertura del Varco Centrale. Il test è stato aggiornato per richiedere la raggiungibilità **dopo** l'apertura: si trattava di un falso positivo del test, non di una correzione della geometria di gioco.

## Valutazione di rilascio

**Esito: preview tecnicamente promettente, ma ancora non promuovibile automaticamente a stabile.** I test automatici non hanno rilevato blocchi nella generazione dei 500 piani campionati. Rimane necessaria almeno una serie di run end-to-end con risorse normali, combattimento e gestione inventario, più collaudo UX reale su smartphone e approvazione grafica/leggibilità.

Comando locale per ripetere il QA (dopo avere installato Playwright e Chromium):

```bash
node tools/qa_v18_27_deep.cjs
```

Per aumentare i seed a 200 (1.000 piani):

```bash
THRESHOLD_QA_LAYOUTS=200 node tools/qa_v18_27_deep.cjs
```

Le verifiche ricorrenti sono integrate nel workflow `.github/workflows/qa-threshold-v18.yml`.
