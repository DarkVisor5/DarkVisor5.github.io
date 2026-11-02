# Threshold v18.26 — Verifica della fattibilità dei combattimenti contro i boss

**Data:** 2 novembre 2026  
**Versione:** v18.26, codice del gioco invariato.  
**Esito:** **entrambi i boss sono sconfiggibili con HP e consumabili ordinari del gioco in arene isolate**. **La probabilità di vincere una run intera rimane ignota.**

## Prova verificabile

- Workflow concluso con successo: https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/41472380046
- 200 incontri in Chromium: 100 al piano 3 e 100 al piano 5.
- Dieci shard, 20 incontri ciascuno. Zero errori tecnici, zero combattimenti rimasti inconclusi.
- Artefatti degli shard: `boss-feasibility-evidence-0` … `boss-feasibility-evidence-9`.
- Riepilogo, intervalli statistici e tracce individuali: `threshold-200-boss-feasibility-report`.
- Runner: `tools/qa_boss_feasibility_runner.cjs`; arena QA: `tools/qa_boss_arena_fixture.js`; aggregatore: `tools/qa_boss_feasibility_aggregate.cjs`.

## Condizioni effettive

Ogni incontro usa il **vero codice di combattimento** del gioco: `attackSingle`, `damageEnemy`, `enemyTurn`, `damagePlayer`, Guardia, Bastione, danno casuale, cure, durabilità e AI del boss. Gli attacchi e le cure sono eseguiti attraverso i normali pulsanti di gioco e le mosse attraverso eventi tastiera. Non vengono impiegati 10.000 HP, né armi con durabilità ampliata, né danni o HP del boss modificati.

Il profilo QA include le cinque carte del mazzo: **Maestro di spada, Erborista, Bastione, Quartiermastro, Ultima resistenza**. Sono carte ottenibili dopo lo sblocco del negozio di rango IV; il test le preimposta in un account QA, senza simulare l'accumulo dei 3.280 oro necessari.

**L'isolamento non è una run completa:** si genera realmente il piano 3 o 5, si posiziona il giocatore accanto al boss, si rimuovono dalla situazione iniziale altri nemici e trappole, si impostano solo HP/inventario di un profilo raggiungibile e si inizia lo scontro. I puzzle e i combattimenti precedenti non vengono giocati. Le regole di Allarme e l'IA del boss restano quelle del motore.

La strategia adottata è **spada in mischia + Guardia/Bastione + cure quando necessarie**, senza allontanarsi a ogni avvertimento di Colpo Sismico. La prima politica di fuga è stata scartata perché il controller si incastrava nella navigazione e non permetteva di isolare il problema del bilanciamento del boss.

## Profili di partenza

| Profilo | HP | Armi (durabilità nominale) | Pozioni iniziali | Scopo |
|---|---:|---|---|---|
| Scarso | 25/45 | Spada lunga ×1, Spada corta ×1 | Piccola ×1 | Arrivare malridotti |
| Intermedio | 40/45 | Spada lunga ×2, Spada del duellante ×1 | Piccola ×2, Grande ×1 | Preparazione ragionevole, non garantita |
| Preparato | 45/45 | Spada del duellante ×4 | Grande ×3 | Risorse abbondanti |
| Veterano | 55/55 | Spada del duellante ×5 | Grande ×4 | Scenario superiore possibile ma raro |

Tutte le armi sono oggetti autentici di `W` e `weaponItem`. Nessun inventario supera il limite del gioco (10 posti). Il massimo di 55 HP è consentito dagli obiettivi persistenti, ma **non** è il valore di partenza di un nuovo giocatore (45 HP).

## Risultati: 25 incontri per ciascuna coppia profilo/boss

| Profilo | Custode, P3 | Boss finale, P5 |
|---|---:|---:|
| Scarso | **0 vittorie / 25** | **0 vittorie / 25** |
| Intermedio | **25 / 25** | **25 / 25** |
| Preparato | **25 / 25** | **25 / 25** |
| Veterano | **25 / 25** | **25 / 25** |
| **Totale** | **75 / 100** | **75 / 100** |

- 150 successi, 50 morti reali, zero esaurimenti del limite d'azioni, zero errori di automazione.
- Intervallo Wilson 95% per una singola categoria 25/25: **86,7%–100%**; per 0/25: **0%–13,3%**. Questi intervalli riguardano solo il test artificiale con quell'inventario e quella strategia.
- **Piano 3:** HP medi rimasti nelle vittorie: intermedio 18,3; preparato 37,8; veterano 44,9. Cure medie rispettivamente 3, 2,96 e 2,28.
- **Piano 5:** HP medi rimasti nelle vittorie: intermedio 12,2; preparato 36,4; veterano 48,7. Cure medie rispettivamente 3, 3 e 2,84.
- In entrambi i livelli il profilo scarso muore sempre. Il **75% aggregato è fissato dalla scelta di provare esattamente 25 volte ciascun profilo**, non rappresenta la probabilità di vittoria nel dungeon normale.

## Le risorse sono ottenibili nel dungeon?

Verifica del generatore `generateFloor`:

- Con **Quartiermastro**, il generatore tenta di collocare *3 pozioni al piano 1, 4 al piano 2, 4 al piano 3, 5 al piano 4 e 5 al piano 5*, **21 pozioni potenziali lungo cinque piani**, più eventuali Infermerie/eventi/forzieri. La distribuzione generata non significa che il giocatore riuscirà a raggiungerle o raccoglierle senza subire danni.
- È previsto almeno **un drop di spada per piano** (un drop per ciascuna famiglia), oltre a un'arma extra casuale. Il tipo di spada dipende dal piano e dalla casualità. Avere quattro o cinque Spade del duellante nello stesso inventario è teoricamente possibile ma non dimostrato comune.
- I posti inventario sono limitati a **10**: il profilo intermedio usa sei posti; quello veterano nove.
- La **durabilità delle armi si consuma su KO, non su ogni colpo inferto**. Quindi una spada può infliggere molti colpi a un boss prima di consumare un punto di durata per l'uccisione. È un elemento importante del bilanciamento.
- Il mazzo ottimizzato richiede **rango IV** e 3.280 oro. Chi non ha ancora raggiunto il quarto piano non può utilizzarlo integralmente.

## Valutazione corretta

**Sì: il codice e le meccaniche permettono di battere entrambi i boss con risorse autentiche.** Quindi non c'è evidenza di un boss matematicamente invincibile, e non serve indebolirli sulla base dei test disponibili.

**Non sappiamo ancora quanto sia fattibile una run completa.** Nei precedenti campioni end-to-end del bot non è stata registrata alcuna vittoria reale dal piano 1 al 5. Il problema potrebbe essere la gestione delle risorse prima dei boss, la navigazione, i danni cumulativi, l'Allarme, la strategia del bot o una combinazione di questi fattori.

**Prossimo test determinante:** misurare in run non alterate quanto spesso si arriva al Custode e al boss finale con almeno le risorse del profilo intermedio (HP, pozioni, arma), e verificare una prima vittoria end-to-end reale. Se quasi nessuno arriva in quelle condizioni, è il percorso che va bilanciato o la strategia del bot che va migliorata, non necessariamente il boss.
