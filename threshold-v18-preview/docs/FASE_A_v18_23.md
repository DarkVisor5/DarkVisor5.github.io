# Threshold v18.23 — Fase A · Integrazione sprite

Data: 2 novembre 2026

## PNG ereditati dalla v18.22
- guardStandard.png
- archiveLectern.png
- treasurePedestal.png
- sanctuaryStoneIdol.png
- armoryTrainingDummy.png
- healingAnatomyChart.png
- treasuryJewelryStand.png
- cryptOfferingNiche.png

## Prime 5 sagome da rifare
- cryptStele.svg
- sanctuarySundial.svg
- sanctuaryPrayerKneeler.svg
- treasuryRubyDisplay.svg
- healingHerbTable.svg

## Implementazione
- Gli asset sono nella cartella `assets/sprites/v18_23/`.
- `drawV18RoomDecor()` preferisce lo sprite Fase A quando disponibile; in caso contrario ripiega sul vecchio renderer.
- Dimensioni, ingombri e collisioni rimangono invariati.
- La v17 stabile non è stata modificata.

## Criteri per il QA successivo
1. Controllare in gioco tutti i 13 oggetti alla loro scala, desktop e mobile.
2. Testare a luce 85, 35 e 0 e non compromettere le Soglie.
3. Rivedere gli SVG se la resa vettoriale non è coerente con i PNG del gioco.
4. Eseguire generazione/combattimento/regressione e performance su dispositivi reali.
5. Solo dopo chiudere il primo sotto-lotto e procedere agli altri 6 arredi da rifare e 17 da rifinire.
