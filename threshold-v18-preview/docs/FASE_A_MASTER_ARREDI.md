# Threshold v18.21 — Fase A | Inventario master degli sprite

**Data:** 29 ottobre 2026. **Versione sorgente:** `threshold-v18-preview/js/game.js` SHA `dd4b91e2ae3fc0e87bae5a5436943f459ea80b5f`.

> **Valutazione preliminare, non certificazione visiva.** Ho verificato il catalogo, il renderer e gli asset dei Lotti 1–3; per i disegni già visti nelle anteprime ho considerato anche la leggibilità a 34 px. I giudizi sui procedurali sono ipotesi motivate dalla forma generata nel codice, da confermare in uno screenshot reale in dungeon a luminosità alta/bassa. “OK provvisorio” non significa che tutti gli 80 sprite abbiano superato un test visivo indipendente.

## Risultati

- **80 arredi distinti**, da **81 voci di collocazione**: `sarcophagus` è elencato due volte nella categoria `crypt` (in posizioni differenti). L'eventuale frequenza di apparizione va verificata prima di modificare il catalogo.
- **24 sprite negli atlanti grafici recenti** (Lotti 1–3), **3 PNG individuali attivi** non sostituiti da atlante, **14 arredi con render dedicato**, **39 disegni procedurali generici**.
- Conteggio per valutazione: **52 OK provvisori**, **17 da rifinire**, **11 da rifare**.
- **Nessuna modifica a collisioni o gameplay**: questo documento è una base decisionale per la successiva produzione grafica.

### Sintesi per categoria

| Categoria | OK provvisorio | Da rifinire | Da rifare | Totale |
|---|---:|---:|---:|---:|
| Armeria | 6 | 4 | 0 | 10 |
| Archivio | 7 | 2 | 1 | 10 |
| Sala guardie | 6 | 4 | 0 | 10 |
| Infermeria | 7 | 1 | 2 | 10 |
| Santuario | 7 | 0 | 3 | 10 |
| Tesoreria | 8 | 0 | 2 | 10 |
| Cripta | 6 | 2 | 2 | 10 |
| Magazzino | 5 | 4 | 1 | 10 |

## Priorità immediata — rifacimento

1. **Carrello dei volumi** (`archiveBookCart`, Archivio) — Stesso carrello dei rimedi e merci; mancano libri riconoscibili.
2. **Tavolo delle erbe** (`healingHerbTable`, Infermeria) — Stesso tavolo generico delle mappe; non comunica erbe.
3. **Carrello dei rimedi** (`healingMedicineCart`, Infermeria) — Stesso carrello genericamente riempito; medicinali poco distinti.
4. **Inginocchiatoio** (`sanctuaryPrayerKneeler`, Santuario) — Stessa panca delle armi; manca posizione da preghiera.
5. **Reliquiario** (`sanctuaryReliquary`, Santuario) — Condivide la sagoma generica con vetrina dei rubini.
6. **Meridiana votiva** (`sanctuarySundial`, Santuario) — Ricicla la forma dell'orologio; non sembra una meridiana.
7. **Vetrina dei rubini** (`treasuryRubyDisplay`, Tesoreria) — Stessa forma generica del reliquiario.
8. **Vetrina d'argento** (`treasurySilverCabinet`, Tesoreria) — Stessa forma dell'armadietto guardie; mancano argenti riconoscibili.
9. **Stele funeraria** (`cryptStele`, Cripta) — È disegnata con la stessa figura dell'idolo: stele non riconoscibile.
10. **Colonna di teschi** (`cryptSkullColumn`, Cripta) — Statua generica senza cranio leggibile.
11. **Argano di carico** (`storeChainHoist`, Magazzino) — Il disegno è un semplice telaio; argano e catena poco evidenti.

## Inventario completo

| Categoria | Sprite | ID | Caselle | Tecnologia | Stato | Nota di controllo |
|---|---|---|---|---|---|---|
| Armeria | Rastrelliera armi | `weaponRack` | 2×1 | Disegno dedicato | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Armeria | Armatura su supporto | `armorStand` | 1×1 | Disegno dedicato | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Armeria | Banco da lavoro | `workbench` | 2×1 | Disegno dedicato | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Armeria | Forgia | `armoryFurnace` | 2×1 | Disegno procedurale | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Armeria | Scudi impilati | `armoryShieldStack` | 2×1 | Disegno procedurale | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Armeria | Manichino d'allenamento | `armoryTrainingDummy` | 1×1 | Lotto grafico 3 | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Armeria | Cotte di maglia | `armoryChainRack` | 2×1 | Disegno procedurale | **DA RIFINIRE** | Cotte poco distinguibili dai ripiani |
| Armeria | Faretra | `armoryQuiver` | 1×1 | Disegno procedurale | **DA RIFINIRE** | Faretra confondibile con fascio di aste |
| Armeria | Ripiano degli elmi | `armoryHelmetShelf` | 2×1 | Disegno procedurale | **DA RIFINIRE** | Elmi minuscoli e simili a vasi |
| Armeria | Mantice | `armoryBellows` | 1×1 | Disegno procedurale | **DA RIFINIRE** | Mantice troppo astratto a 32 px |
| Archivio | Libreria | `archiveBookshelf` | 2×1 | Disegno dedicato | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Archivio | Scrittoio | `archiveWritingDesk` | 2×1 | Disegno dedicato | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Archivio | Leggio | `archiveLectern` | 1×1 | Lotto grafico 3 | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Archivio | Schedario pergamene | `archiveScrollCabinet` | 1×1 | Lotto grafico 2 | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Archivio | Astrolabio | `archiveAstrolabe` | 1×1 | Lotto grafico 2 | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Archivio | Cassettiera mappe | `archiveMapChest` | 1×1 | Lotto grafico 2 | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Archivio | Globo celeste | `archiveGlobe` | 1×1 | Disegno procedurale | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Archivio | Tavolo delle mappe | `archiveScrollTable` | 2×1 | Disegno procedurale | **DA RIFINIRE** | Srotolare una vera mappa invece del pannello generico |
| Archivio | Carrello dei volumi | `archiveBookCart` | 2×1 | Disegno procedurale | **DA RIFARE** | Stesso carrello dei rimedi e merci; mancano libri riconoscibili |
| Archivio | Orologio astronomico | `archiveClock` | 1×1 | Disegno procedurale | **DA RIFINIRE** | Icona orologio leggibile, ma poco astronomica |
| Sala guardie | Branda | `guardBunk` | 2×1 | Disegno dedicato | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Sala guardie | Stendardo | `guardStandard` | 1×1 | Lotto grafico 3 | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Sala guardie | Fascio di lance | `guardSpearBundle` | 1×1 | Disegno dedicato | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Sala guardie | Tamburo militare | `guardWarDrum` | 1×1 | Lotto grafico 2 | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Sala guardie | Baule militare | `guardFootlocker` | 2×1 | Disegno procedurale | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Sala guardie | Panca delle armi | `guardWeaponBench` | 2×1 | Disegno procedurale | **DA RIFINIRE** | Stessa panca dell'inginocchiatoio |
| Sala guardie | Corno d'allarme | `guardSignalHorn` | 1×1 | Disegno procedurale | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Sala guardie | Mappa delle pattuglie | `guardMapBoard` | 2×1 | Disegno procedurale | **DA RIFINIRE** | Carta simile a un pannello generico |
| Sala guardie | Supporto per elmo | `guardHelmStand` | 1×1 | Disegno procedurale | **DA RIFINIRE** | Contorni dell'elmo da irrobustire |
| Sala guardie | Armadietto delle guardie | `guardSupplyLocker` | 1×1 | Disegno procedurale | **DA RIFINIRE** | Armadietto generico poco militare |
| Infermeria | Lettino da cura | `healingCot` | 2×1 | Disegno dedicato | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Infermeria | Armadietto medicinali | `medicineCupboard` | 1×1 | Lotto grafico 1 | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Infermeria | Essiccatoio erbe | `healingHerbDryer` | 1×1 | Lotto grafico 2 | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Infermeria | Cesta di bende | `healingBandageBasket` | 1×1 | Lotto grafico 1 | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Infermeria | Strumenti cerusico | `healingSurgicalTray` | 1×1 | Lotto grafico 1 | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Infermeria | Bacinella d'acqua | `healingWashBasin` | 1×1 | Disegno procedurale | **DA RIFINIRE** | Dare maggiore contrasto all'acqua |
| Infermeria | Tavolo delle erbe | `healingHerbTable` | 2×1 | Disegno procedurale | **DA RIFARE** | Stesso tavolo generico delle mappe; non comunica erbe |
| Infermeria | Lettiga con ruote | `healingWheelStretcher` | 2×1 | Disegno procedurale | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Infermeria | Tavola anatomica | `healingAnatomyChart` | 1×1 | Lotto grafico 3 | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Infermeria | Carrello dei rimedi | `healingMedicineCart` | 2×1 | Disegno procedurale | **DA RIFARE** | Stesso carrello genericamente riempito; medicinali poco distinti |
| Santuario | Altare votivo | `votiveAltar` | 2×1 | Disegno dedicato | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Santuario | Braciere incenso | `incenseBrazier` | 1×1 | Lotto grafico 1 | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Santuario | Idolo di pietra | `sanctuaryStoneIdol` | 1×1 | Lotto grafico 3 | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Santuario | Coppa offerte | `sanctuaryOfferingBowl` | 1×1 | Lotto grafico 1 | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Santuario | Candeliere votivo | `sanctuaryCandelabrum` | 1×1 | Lotto grafico 2 | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Santuario | Pietra runica | `sanctuaryRuneStone` | 1×1 | PNG individuale | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Santuario | Inginocchiatoio | `sanctuaryPrayerKneeler` | 2×1 | Disegno procedurale | **DA RIFARE** | Stessa panca delle armi; manca posizione da preghiera |
| Santuario | Reliquiario | `sanctuaryReliquary` | 1×1 | Disegno procedurale | **DA RIFARE** | Condivide la sagoma generica con vetrina dei rubini |
| Santuario | Campana rituale | `sanctuaryBell` | 1×1 | Disegno procedurale | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Santuario | Meridiana votiva | `sanctuarySundial` | 1×1 | Disegno procedurale | **DA RIFARE** | Ricicla la forma dell'orologio; non sembra una meridiana |
| Tesoreria | Piedistallo tesoro | `treasurePedestal` | 2×1 | Lotto grafico 3 | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Tesoreria | Bilancia oro | `goldBalance` | 1×1 | Lotto grafico 1 | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Tesoreria | Scrigno gemme | `treasuryGemChest` | 1×1 | Lotto grafico 1 | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Tesoreria | Urna monete | `treasuryCoinUrn` | 1×1 | Lotto grafico 1 | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Tesoreria | Pile di monete | `treasuryCoinStacks` | 2×1 | Disegno procedurale | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Tesoreria | Vetrina dei rubini | `treasuryRubyDisplay` | 1×1 | Disegno procedurale | **DA RIFARE** | Stessa forma generica del reliquiario |
| Tesoreria | Cassaforte | `treasuryGoldSafe` | 2×1 | Disegno procedurale | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Tesoreria | Corona su velluto | `treasuryCrownCushion` | 1×1 | Disegno procedurale | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Tesoreria | Vetrina d'argento | `treasurySilverCabinet` | 2×1 | Disegno procedurale | **DA RIFARE** | Stessa forma dell'armadietto guardie; mancano argenti riconoscibili |
| Tesoreria | Espositore di gioielli | `treasuryJewelryStand` | 1×1 | Lotto grafico 3 | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Cripta | Sarcofago | `sarcophagus` | 2×2 | Disegno dedicato | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Cripta | Lastra tombale | `cryptTombSlab` | 2×1 | Disegno dedicato | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Cripta | Urna cineraria | `cryptAshUrn` | 1×1 | Lotto grafico 2 | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Cripta | Lapide funeraria | `cryptGravestone` | 1×1 | PNG individuale | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Cripta | Stele funeraria | `cryptStele` | 1×1 | Disegno dedicato | **DA RIFARE** | È disegnata con la stessa figura dell'idolo: stele non riconoscibile |
| Cripta | Ossa accatastate | `cryptBonePile` | 2×1 | Disegno procedurale | **DA RIFINIRE** | Le ossa sembrano forme ovali |
| Cripta | Sepolcro a candele | `cryptCandleTomb` | 2×1 | Disegno procedurale | **DA RIFINIRE** | Candeliere e lapide poco distinguibili |
| Cripta | Nicchia funeraria | `cryptOfferingNiche` | 1×1 | Lotto grafico 3 | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Cripta | Bara di quercia | `cryptCoffin` | 2×1 | Disegno procedurale | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Cripta | Colonna di teschi | `cryptSkullColumn` | 1×1 | Disegno procedurale | **DA RIFARE** | Statua generica senza cranio leggibile |
| Magazzino | Scaffale merci | `storeSupplyShelf` | 2×1 | Lotto grafico 2 | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Magazzino | Barili di legno | `storeBarrelStack` | 2×1 | Disegno dedicato | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Magazzino | Casse di rifornimento | `storeCratePile` | 2×1 | Disegno dedicato | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Magazzino | Sacchi di grano | `storeGrainSacks` | 1×1 | PNG individuale | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Magazzino | Balle di fieno | `storeHayBales` | 2×1 | Disegno procedurale | **OK PROVVISORIO** | Sagoma specifica o sprite dedicato: mantenere e verificare a luce bassa |
| Magazzino | Carretto delle merci | `storeCart` | 2×1 | Disegno procedurale | **DA RIFINIRE** | Carretto generico da differenziare da quelli di archivio/infermeria |
| Magazzino | Scaffale di giare | `storePotteryRack` | 2×1 | Disegno procedurale | **DA RIFINIRE** | Giare troppo simili agli elmi dello scaffale |
| Magazzino | Casse di vino | `storeWineCrates` | 2×1 | Disegno procedurale | **DA RIFINIRE** | Casse poco distinguibili dalle casse generiche |
| Magazzino | Argano di carico | `storeChainHoist` | 2×1 | Disegno procedurale | **DA RIFARE** | Il disegno è un semplice telaio; argano e catena poco evidenti |
| Magazzino | Matasse di corda | `storeRopeCoils` | 1×1 | Disegno procedurale | **DA RIFINIRE** | Fune in cerchi: dare volume e bordo |

## Criteri della Fase A

1. **Silhouette:** deve comunicare l'oggetto prima dei micro-dettagli.
2. **Dimensione vera:** test a 34 px per 1 casella, 68×34 per 2×1 e 68×68 per 2×2.
3. **Contrasto reale:** verifiche con e senza torcia, su pavimento della propria categoria.
4. **Differenziazione:** oggetti che condividono forme procedurali (panca, carrello, vetrina, orologio) richiedono sagome proprie.
5. **Accettazione:** un pezzo passa a OK definitivo soltanto dopo la prova in-game a luce alta/bassa senza errori.

**Prossimo sprint consigliato:** primo sotto-lotto di 5 sagome ad alta priorità: `cryptStele`, `sanctuarySundial`, `sanctuaryPrayerKneeler`, `treasuryRubyDisplay`, `healingHerbTable`. Successivo: 6 rimanenti, poi 17 rifiniture. Confrontare sempre alla scala nativa prima di sostituire il renderer.

