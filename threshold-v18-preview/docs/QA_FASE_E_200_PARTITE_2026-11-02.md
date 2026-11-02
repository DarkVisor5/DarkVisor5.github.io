# Threshold v18.26 — Fase E: difesa, élite, allarme e artefatti

**Data:** 2 novembre 2026  
**Stato:** codice sperimentale completato, **200 partite reali eseguite**, efficacia mista.  
**Il gioco v18.26 e la versione stabile v17 NON sono stati modificati.**

## Interventi del bot, non del gioco

- `tools/qa_phase_e_bot.js`: variante della Fase D con calcolo della pericolosità dei nemici *già visibili* sul percorso, soprattutto élite rossi e viola quando la salute è bassa.
- Schivata del Colpo Sismico del boss finale se l'animazione di carica è visibile e una casella adiacente sicura è raggiungibile.
- Migliore soglia per usare pozioni prima di un possibile colpo mortale; ritirata mirata contro élite pericolosi e gruppi.
- Utilizzo degli artefatti **soltanto tramite i normali pulsanti dell'inventario**. Pelle di Pietra contro colpi imminenti, Campana del Silenzio prima che l'Allarme salga troppo, Cuore della Soglia durante un boss, Occhio della Soglia per esplorazione, Sangue Nero se vantaggioso. Il bot non li crea artificialmente.
- `tools/qa_phase_e_view.js`: offre al bot il contenuto della cintura degli artefatti, lo stato dei buff del giocatore e gli avvertimenti di carica/guardia dei **boss visibili**, non coordinate o statistiche di nemici nascosti.
- Runner Chromium da piano 1: `tools/qa_phase_e_runner.cjs` (nessuna carta) e `tools/qa_phase_e_cards_runner.cjs` (cinque carte acquistate tramite negozio, nessun potenziamento artificiale di HP o armi).
- Aggregatori QA `tools/qa_phase_e_aggregate.cjs` e `tools/qa_phase_e_cards_aggregate.cjs` con registri degli ultimi 30 turni prima delle morti.

## Esecuzioni complete e verificabili

- **100 partite senza carte:** https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41465977653
- **100 partite con 5 carte:** https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41466011506
- **Smoke test di 6 partite:** https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41465762555

Uno dei 10 shard della serie senza carte ha temporaneamente rallentato durante l'installazione del browser. Il workflow originale è **poi terminato con successo** ed è stato aggregato su 100 tentativi. Una ulteriore esecuzione di recupero da 10 partite, creata cautelativamente durante il rallentamento, è separata e **non** è stata conteggiata nelle 200 partite principali: https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41466891523.

## Confronto Fase D / Fase E, 100 partite per ogni condizione

| Metrica | D senza carte | E senza carte | D 5 carte | E 5 carte |
|---|---:|---:|---:|---:|
| Tentativi realmente giocati | 100 | **100** | 100 | **100** |
| Morti effettive | 95 | 95 | 92 | **91** |
| Interruzioni per bot / limite decisioni | 5 | 5 | 8 | **9** |
| Vittorie complete | 0 | 0 | 0 | 0 |
| Piano massimo | 4 | **4** | **5** | 4 |
| Piano medio | 2,38 | **2,34** | 2,60 | **2,72** |
| Piano 1 come massimo | 16 | 16 | 10 | **4** |
| Piano 2 come massimo | 32 | 35 | 30 | **27** |
| Piano 3 come massimo | 50 | 48 | 52 | **62** |
| Piano 4 come massimo | 2 | **1** | 6 | **7** |
| Piano 5 come massimo | 0 | **0** | **2** | 0 |
| Azioni / decisioni registrate | 70.737 | 70.360 | 83.060 | 82.547 |
| Errori tecnici del runner | 0 | **0** | 0 | **0** |

**Il risultato non giustifica la sostituzione del bot della Fase D con quello E.** L'aumento del piano medio nel profilo con carte (+0,12) è controbilanciato dalla mancata progressione al piano 5. Il risultato senza carte cambia pochissimo (-0,04 di piano medio). Inoltre i dungeon sono diversi fra campioni, senza seed appaiati: sono descrizioni sperimentali, non stime causali definitive.

## Comportamenti confermati nelle 200 run Fase E

| Azione del bot | 100 senza carte | 100 con carte |
|---|---:|---:|
| Utilizzo Pelle di Pietra | 14 | 12 |
| Utilizzo Campana del Silenzio | 12 | 8 |
| Utilizzo Cuore della Soglia | 2 | 2 |
| Utilizzo Occhio della Soglia | 0 | 1 |
| Ritirate tattiche | 224 | 243 |
| Attacchi con ascia | 703 | 1.014 |
| Colpi a distanza di lancia | 289 | 397 |
| Cure | 478 | 502 |

Non sono state osservate vittorie e **non c'è evidenza che la schivata della carica del boss finale abbia migliorato i risultati**, perché nessuna partita E ha raggiunto il piano 5. Questo aspetto resta un comportamento implementato ma non validato in condizioni finali.

## Diagnosi del colpo finale

Etichette inferite dal diario visibile e dalle vicinanze dei nemici, non categorie certe prodotte dal motore:

| Causa probabile | Senza carte E | Con carte E |
|---|---:|---:|
| Nemici ordinari | 57 | 53 |
| Boss visibili | 12 | 30 |
| Trappole | 26 | 8 |
| Morti totali | **95** | **91** |

Tutte le **186 morti** hanno un dossier degli ultimi 30 turni; due report JSON contengono le registrazioni complete.

## Decisione tecnica e prossimo esperimento

1. **Mantenere la Fase D come baseline di gioco automatico** (è l'unica a essere arrivata realmente al piano 5) e la Fase E come variante sperimentale. Il codice del gioco rimane identico.
2. Usare **seed appaiati** e il medesimo account di carte per distinguere l'effetto della politica del bot dal diverso dungeon generato.
3. Concentrarsi sugli scontri di élite e boss con test dedicati, osservando HP residui, arma, artefatti e allarme.
4. Non alterare il bilanciamento di Threshold finché non viene chiarito quanto dipenda dal bot e quanto dal gioco.
5. L'obiettivo della prima vittoria reale dal piano 1 al 5 **rimane aperto**.

I due workflow CI conservano i registri per partita e gli artifact aggregati `phase-e-100-report` e `phase-e-cards-100-report` (conservazione configurata: 30 giorni).
