# Threshold v18.24 — Fase A, secondo sprint grafico

Data: 2 novembre 2026

## Obiettivo e realizzazione
Terminare la **produzione e integrazione** degli arredi problematici identificati nell'audit v18.21: 11 da rifare e 17 da rifinire. I primi 5 rifacimenti erano stati completati nella v18.23, e con questa versione sono stati creati tutti i restanti 23 asset.

### 6 da rifare (v18.24)
- `archiveBookCart`
- `healingMedicineCart`
- `sanctuaryReliquary`
- `treasurySilverCabinet`
- `cryptSkullColumn`
- `storeChainHoist`

### 17 da rifinire (v18.24)
- `armoryChainRack`
- `armoryQuiver`
- `armoryHelmetShelf`
- `armoryBellows`
- `archiveScrollTable`
- `archiveClock`
- `guardWeaponBench`
- `guardMapBoard`
- `guardHelmStand`
- `guardSupplyLocker`
- `healingWashBasin`
- `cryptBonePile`
- `cryptCandleTomb`
- `storeCart`
- `storePotteryRack`
- `storeWineCrates`
- `storeRopeCoils`

## Architettura
- Path degli asset: `threshold-v18-preview/assets/sprites/v18_24/` con un file SVG per ciascun ID.
- Dimensioni: 32×32 per oggetti 1×1, 64×32 per oggetti 2×1. Lo stile è a forme geometriche nitide con sfondi trasparenti.
- `V18_24_SPRITES` viene caricato senza bloccare il gioco. Ogni sprite è preferito a v18.23, atlas e procedural; il fallback resta operativo.
- `index.html` usa una nuova query di versione per evitare cache vecchie.
- La galleria `fase-a-gallery.html` contiene 36 asset della Fase A (13 precedenti + 23 nuovi), con filtri.

## Test di accettazione ancora richiesti
1. Sintassi e integrità degli asset: `node tools/qa_v18_24_furniture.cjs`.
2. Browser reale: 36/36 asset caricati in galleria desktop/mobile; assenza errori console.
3. Dungeon reale: verificare gli oggetti nella categoria corretta, overlay torcia 85/35/0, visibilità/occlusione, sprite nativi 34px e 46px.
4. Test con utenti su smartphone e performance; conferma di collisioni, raggiungibilità, AI e puzzle.
5. Solo dopo aggiornare gli status grafici a **OK definitivo** e procedere al Layer 3.

**Nota:** i test automatici verificano riferimenti e struttura ma non certificano l'estetica o il gameplay in browser.
