# Threshold — Roadmap di sviluppo (riferimento principale)

> Roadmap dettata dall'utente il 28 ottobre 2026. Questo file conserva le **35 funzionalità originali** e funge da riferimento per gli aggiornamenti futuri alla preview v18.
> La dicitura originale **0/35** indicava nessuna funzionalità *selezionata nella checklist interattiva*, non che non fosse stato svolto alcun lavoro.

## Checklist originale: 0/35 selezionate

## 1. Ambientazioni e identità delle stanze
_Priorità alta · Layer 2_

- [ ] **Armerie** — Rastrelliere, scudi, armature e tavoli da lavoro
- [ ] **Biblioteche e archivi** — Scaffali, libri, pergamene e scrivanie
- [ ] **Cripte** — Sarcofagi, tombe, urne e lapidi
- [ ] **Santuari** — Altari, statue, candele e simboli rituali
- [ ] **Infermerie** — Letti, medicinali, bende e strumenti
- [ ] **Caserme** — Letti militari, bauli e stendardi
- [ ] **Magazzini** — Barili, casse, sacchi e scaffali
- [ ] **Pavimenti e muri tematici** — Tileset diversi per castello, tempio e catacombe

## 2. Oggetti interattivi
_Priorità alta · Layer 3_

- [ ] **Sarcofagi apribili** — Alcuni contengono tesori, altri sorprese
- [ ] **Librerie consultabili** — Indizi sulla storia e sui puzzle
- [ ] **Altari utilizzabili** — Benedizioni, sacrifici o effetti temporanei
- [ ] **Leve e meccanismi** — Attivazione di porte e passaggi
- [ ] **Oggetti distruttibili** — Barili e casse con possibili ricompense
- [ ] **Trappole ambientali** — Pavimenti instabili e piastre a pressione
- [ ] **Porte e cancelli animati** — Apertura e chiusura visibile

## 3. Atmosfera e feedback
_Priorità media · Effetti e audio_

- [ ] **Illuminazione degli oggetti** — Visibilità coerente con distanza e torce
- [ ] **Ombre dinamiche** — Profondità visiva per muri e oggetti
- [ ] **Animazioni ambientali** — Candele tremolanti, polvere e fumo
- [ ] **Suoni dei materiali** — Passi diversi su pietra, metallo e legno
- [ ] **Suoni degli oggetti** — Apertura tombe, scrigni e porte
- [ ] **Musiche ambientali originali** — Temi distinti per ogni piano
- [ ] **Eventi narrativi visivi** — Dialoghi e piccole scene quando si entra in luoghi importanti

## 4. Gameplay e varietà
_Priorità media · Espansioni_

- [ ] **Nuovi comportamenti nemici** — Guardie, pattuglie e custodi di stanze
- [ ] **Nemici legati all'ambiente** — Non morti nelle cripte e custodi nei santuari
- [ ] **Segreti ambientali** — Pareti mobili e stanze nascoste
- [ ] **Puzzle contestuali** — Enigmi legati alla funzione della stanza
- [ ] **Eventi a scelta** — Rischi e ricompense con conseguenze
- [ ] **Mini-boss tematici** — Guardiani di stanze importanti
- [ ] **Nuovi artefatti** — Effetti legati alla luce, all'esplorazione e ai segreti

## 5. Qualità e rifinitura
_Prima di una release stabile_

- [ ] **Test della generazione** — Controllare centinaia di mappe senza uscite bloccate
- [ ] **Collisioni complete** — Personaggi, nemici e attacchi rispettano gli ostacoli
- [ ] **Priorità visive** — Oggetti, personaggi e muri disegnati nell'ordine corretto
- [ ] **Ottimizzazione mobile** — Controlli e rendering fluidi su Redmi, iPhone e Samsung
- [ ] **Salvataggio delle run** — Continuare una partita interrotta
- [ ] **Tutorial aggiornato** — Spiegare interazioni, oggetti e simboli

## Stato del progetto al 28/10/2026

- **Versione stabile:** v17, da non modificare in questa roadmap.
- **Versione sperimentale:** Threshold v18.15 in threshold-v18-preview/.
- **Lavoro Layer 2 già avviato e implementato:** armerie, archivi, cripte, santuari, infermerie, caserme/sale guardie, magazzini e categorie delle stanze con arredi tematici.
- **Punto da completare nel Layer 2:** passaggio a tileset distinti e coerenti per pavimenti e muri; valutazione dell'arredo delle caserme (bauli) e controlli visivi reali in browser.
- **Layer 3:** oggetti attuali prevalentemente decorativi/solidi; introdurre esplicitamente le interazioni richieste dalla roadmap senza assumere che vecchi meccanismi soddisfino automaticamente ciascuna voce.
- **Altre fasi:** implementazione e stato di avanzamento da valutare singolarmente rispetto a queste definizioni.

## Regole di sviluppo

1. Ogni nuova funzionalità deve riferirsi a una voce della roadmap, mantenendo la v17 stabile separata.
2. Evitare modifiche non necessarie a combattimento, bilanciamento, loot e progressione.
3. Oggetti solidi non devono bloccare scale, porte, puzzle, nemici o percorsi.
4. Verificare codice, generazione, resa mobile e immagini in-game quando disponibili.
5. Annotare l'avanzamento effettivo; non confondere gli elementi selezionati nella checklist con quelli già implementati.
