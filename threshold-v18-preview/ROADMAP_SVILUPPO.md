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
- **Versione sperimentale:** Threshold v18.17.1 in threshold-v18-preview/.
- **Lavoro Layer 2 già avviato e implementato:** otto categorie di stanze (armerie, archivi, cripte, santuari, infermerie, sale delle guardie/caserme, tesorerie, magazzini) con **10 tipologie di arredi distinte ciascuna: 80 in totale**. La v18.16 ha introdotto 43 nuovi arredi con sagome specifiche e maggiore varietà di composizione.
- **Punto da completare nel Layer 2:** passaggio a tileset distinti e coerenti per pavimenti e muri; valutazione dell'arredo delle caserme (bauli) e controlli visivi reali in browser.
- **Layer 3:** oggetti attuali prevalentemente decorativi/solidi; introdurre esplicitamente le interazioni richieste dalla roadmap senza assumere che vecchi meccanismi soddisfino automaticamente ciascuna voce.
- **Altre fasi:** implementazione e stato di avanzamento da valutare singolarmente rispetto a queste definizioni.

## Regole di sviluppo

1. Ogni nuova funzionalità deve riferirsi a una voce della roadmap, mantenendo la v17 stabile separata.
2. Evitare modifiche non necessarie a combattimento, bilanciamento, loot e progressione.
3. Oggetti solidi non devono bloccare scale, porte, puzzle, nemici o percorsi.
4. Verificare codice, generazione, resa mobile e immagini in-game quando disponibili.
5. Annotare l'avanzamento effettivo; non confondere gli elementi selezionati nella checklist con quelli già implementati.

## Checkpoint v18.16 — ampliamento degli arredi (28/10/2026)

- Otto categorie × dieci tipi diversi = **80 arredi di catalogo** (tra nuovi e preesistenti).
- Nuovi tipi aggiunti nella v18.16: **43**.
- Composizione variabile tra stanze della stessa categoria; non sono collocati tutti e dieci contemporaneamente.
- Verifiche simulate: 200 mappe, 2.400 stanze, nessun errore nei controlli di collisione e connettività; tutti i dieci tipi di ogni categoria sono comparsi almeno una volta.
- Rimane necessario il collaudo visuale nel browser pubblicato e sui dispositivi mobile.

## Checkpoint v18.17.1 — Lotto 2 e ambienti tematici (29/10/2026)

- Rielaborati e integrati come PNG trasparenti 32×32 cinque sprite: lapide funeraria, urna cineraria, cassettiera delle mappe, cesta di bende e bilancia d'oro. Disegni vecchi mantenuti come fallback quando i PNG non sono disponibili.
- Nuova resa ambientale per **otto categorie**: pavimentazioni, materiali, bordi, dettagli di muratura e motivi riconoscibili per armeria, archivio, sala delle guardie, infermeria, santuario, tesoreria, cripta e magazzino.
- I layer ambientali non aggiungono ostacoli; scala, puzzle e personaggi rimangono sopra il pavimento, e l'illuminazione esistente continua a operare.
- QA statico: sintassi JavaScript verificata; cinque asset PNG confermati su GitHub; renderer di ogni categoria verificato isolatamente; 150 mappe e 1.800 stanze simulate con 5.296 arredi senza fallimenti dei controlli di sovrapposizione e raggiungibilità.
- **Da verificare**: collaudo visivo del sito GitHub Pages pubblicato e su smartphone prima di considerare finito il polish.

## Checkpoint v18.20 — Lotto 3, leggibilità e materiali (29/10/2026)

- Terzo lotto grafico: **otto sprite nuovi** con sagome più distinguibili e atlante trasparente (32×32, tranne il piedistallo 64×32): stendardo delle guardie, leggio, piedistallo del tesoro, idolo di pietra, manichino d'allenamento, tavola anatomica, espositore di gioielli, nicchia funeraria.
- I due lotti precedenti restano installati; la v18.20 aggiunge un terzo atlas e conserva il fallback dei disegni originari.
- Pareti tematiche: meno emblemi ripetuti (circa 1/6 dei blocchi) e pilastri meno fitti.
- Pavimenti: eliminati gli overlay generici delle stanze categorizzate, mantenendoli nei corridoi, senza alterare la mappa logica.
- Leggibilità: oscurità canvas ridotta da 0,88 a 0,80 desktop e da 0,83 a 0,76 mobile; invariati raggi, torce, visibilità logica e rischi del buio.
- QA: JavaScript valido, atlante PNG presente su GitHub, rendering delle 8 finestre corretto (una 64×32), 5/5 piani generati e disegnati dal motore senza eccezioni.
- Galleria di confronto dedicata: `threshold-v18-preview/lotto3-gallery.html`.
- **Ancora necessario**: screenshot e playtest del sito GitHub Pages in un browser reale e su dispositivi mobile; la galleria è illustrativa e non sostituisce questo test.

## Checkpoint v18.21 — Torcia e orientamento (29/10/2026)

- Feedback tester: l'oscurità intenzionale era troppo forte per capire **dove si può camminare**, anche dopo i Lotti grafici 1–3.
- Ribilanciamento luce: avvio **85/100** (da 70), costo soglia **8** (da 10), recupero da torcia **45** (da 40), costo discesa piano **12** (da 15).
- Raggio torcia mobile/desktop aumentato di circa mezza casella a piena carica; lieve potenziamento a bassa luce.
- Anche a torcia esaurita resta un alone personale di circa 2 caselle (invece di 1,4–1,5), senza estendere il raggio **logico** di visione (6 caselle).
- `drawLocalWayfinding` evidenzia soltanto caselle **già visibili, libere e vicine** (distanza Manhattan ≤2). Non rivela zone dietro muri né la mappa, il bottino o gli avversari nascosti.
- Luci di corridoio un po' meno rare; effetto di oscurità appena ammorbidito (mobile 0,74; desktop 0,78).
- Quando la luce è sotto 35, l'interfaccia spiega come ricaricare la torcia interagendo con una torcia a muro.
- Nessun intervento su HP, IA nemica, trappole, ricompense, collisioni, generazione della mappa e controllo di visibilità.
- QA eseguito sul motore v18.21 con canvas simulato: sintassi valida, avvio a 85 luce, attraversamento della soglia -8, nuovo overlay testato anche a luce zero, generazione e rendering **5/5 piani** senza eccezioni.
- **Ancora da verificare in browser e su smartphone:** leggibilità reale con torce, frame rate e feedback dei tester. La v17 stabile è separata e invariata.
