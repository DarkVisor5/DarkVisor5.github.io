# Threshold — Reset artistico v18.28 (Lotto pilota di quattro categorie)

**Patch:** `THR-20261106-002` · **Data:** 06/11/2026 · **Preview giocabile:** `v18.28` · **Stabile protetta:** `v17.17.0` · **Repository:** `DarkVisor5/DarkVisor5.github.io`

## Obiettivo e diagnosi

Problema segnalato dall'utente: le stanze risultavano anonime, con troppo grigio/marrone, arredi piccoli e sparsi, difficile riconoscere dove si trova il personaggio. Il codice v18.27 conteneva già 8 categorie, ciascuna con pavimenti e materiali differenziati, ma gran parte delle forme e dei colori veniva attenuata dal passaggio di oscurità. Il generatore sceglieva fino a 5 oggetti solidi da cataloghi molto ampi, con primo oggetto scelto attraverso un indice hash quasi casuale.

**Nuovo ordine progettuale:** identità cromatica → pattern architettonico → un elemento caratteristico → 1–2 complementi. Non aggiungere altri 80 oggetti prima di verificarne la leggibilità sul canvas a 34/46 pixel.

| Categoria pilota | Palette riconoscibile | Motivo L1 principale | Primo arredo preferito | Limite arredi |
|---|---|---|---|---|
| Cripta | Indaco/viola, turchese, pietra chiara | Lastre funerarie, spina lapidea e segno rituale | Sarcofago; fallback se non entra | 2–3 |
| Archivio | Verde petrolio, ottone/ambra, pergamena | Tavole longitudinali e zona di lettura | Grande libreria | 2–3 |
| Infermeria | Verde salvia, avorio, rosso desaturato | Mattonelle ordinate, fascia di passaggio e croce non interattiva | Lettino da cura | 2–3 |
| Santuario | Blu lapislazzuli, oro antico, azzurro | Mosaico votivo, navata e simbolo a terra | Altare votivo | 2–3 |

Le altre quattro famiglie sono ancora sulla grafica v18.27: **Armeria, Sala delle Guardie, Tesoreria, Magazzino**. Direzione proposta, NON implementata: armeria ferro/rosso brace con fornace come landmark; guardroom blu acciaio/rosso stendardo, rastrelliera; tesoreria ambra/bronzo/vino, pedana del tesoro; magazzino ocra/legno/corda, scaffale merci. Non inferire che siano già state rifatte.

## Implementazione reale

- **Base verificata:** commit `b7c454a98d8c6c56c1f25df1fc3e0d4f245f5449`, preview v18.27.
- **Codice giocabile aggiornato in** `threshold-v18-preview/js/game.js`: `V18_ART_PILOT`, `drawV18ArtPilotTile()` e `drawV18ArtPilotAtmosphere()` differenziano le quattro categorie a livello di materiali, colori, motivi e lavaggio cromatico *dopo* il velo di oscurità.
- Il colore post-oscurità si applica **solo alla stanza in cui si trova il personaggio e alle caselle già visibili**, con intensità proporzionale alla carica di luce esistente; senza luce non si aggiunge alcun alone gratuito. Corridoi e categorie rimanenti mantengono il vecchio trattamento; nessuna modifica alla funzione di visibilità, alle torce disponibili o al dark-loot bonus.
- Il generatore degli arredi L2 conserva le verifiche di posizionamento, collisione, riserva di spawn, scale, boss, percorso degli enigmi e **flood fill di connettività**. Nei quattro gruppi pilota abbassa a 2 o 3 il tetto degli arredi per stanza (oppure meno per stanza iniziale/scale/boss) e prova come primo elemento quello distintivo della categoria. Se il pezzo principale non può essere collocato, passa agli altri oggetti: non si forza alcuna collisione.
- Solo per gli sprite di queste categorie è stata incrementata moderatamente saturazione/contrasto nel normale e nel secondo passaggio di rendering.
- **Conseguenza importante:** meno arredi L2 solidi significa che **l'occupazione di caselle e la disponibilità di alcune interazioni facoltative possono cambiare**. È un intervento artistico con effetto ambientale reale, non va descritto come sola variazione di CSS. Non sono state modificate armi, HP, IA, boss, loot base, premi o enigmi obbligatori.
- `threshold-v18-preview/index.html` mostra **v18.28 e `THR-20261106-002`**; cache busting `game.js` aggiornato; il debug `window.__thresholdBuild` riporta version e ID.

## QA realmente svolto

**GitHub Actions [42202696558](https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/42202696558): SUCCESS.**

- Sintassi Node JS e test statici v18.24/v18.25/v18.26: **PASS**.
- Chromium reale desktop **1280×800** e mobile **390×844**: avvio partita, movimento, 32 indovinelli, 16 interazioni e 5 leve disponibili, nessun pageerror o asset mancante nello smoke: **PASS**.
- **Test visivo guidato su mondo generato**, NON run normale autonoma e NON playtest umano: seed iniziale 20261106, posizionamento controllato del giocatore nelle quattro categorie, luce 85/100 in entrambi i rami, confronto screenshot veri del **canvas** v18.27 vs v18.28 con stessa geometria della stanza selezionata; **8 coppie di immagini** desktop/mobile, **16 immagini PNG** nell'artifact `threshold-v18-28-art-reset-before-after`. Dopo il primo fallimento di contrasto in Cripta, il passaggio cromatico è stato aggiustato e verificato.
- Scarto cromatico medio RGB (norma euclidea su campioni di pavimento, non una valutazione estetica umana) **desktop:** Cripta 61,84; Archivio 62,72; Infermeria 78,46; Santuario 73,55. **Mobile:** Cripta 60,14; Archivio 60,94; Infermeria 74,05; Santuario 74,39. In tutte le categorie i quattro colori campionati risultano distinguibili dal test automatizzato.
- **Nota correttiva importante:** stesso seed e stanza geometrica selezionata NON garantiscono mappe identiche dopo inizializzazione di oggetti facoltativi, perché il generatore degli arredi è stato modificato. Nei casi Archivio, Infermeria e Santuario il conteggio di `s.seen` e `s.visible` differisce tra v18.27 e v18.28 nel confronto guidato. **Non affermare che le celle rivelate sono identiche tra le due run.** La funzione di LOS non è stata modificata e ciascuna fixture verifica che le celle visibili siano non nulle e correttamente registrate; questo non sostituisce un test completo di non-regressione della fog-of-war.
- Verifica reale di generazione: **500 piani** con **500 enigmi obbligatori risolti**, **1.000 nicchie facoltative** e **13.874 arredi L2** analizzati, percorso obbligatorio superato in tutti i 500 test. Non assumere una riduzione percentuale degli arredi rispetto ad altri seed non appaiati.
- Serie QA iniziali fallite e risolte: test statico precedente fermo al vecchio parametro versione, test visivo della Cripta troppo poco diverso, poi confronti troppo rigidi tra visuali con RNG opzionale divergente. Conservate nel registro GitHub Actions, NON conteggiate come test finali passati.
- Artifact screenshot: [GitHub Actions, 16 PNG](https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/42202696558). Retention 30 giorni.

## Esito e problemi aperti

**Accettazione tecnica: PASS. Accettazione estetica dell'utente: NON ancora raccolta.** I pavimenti e le palette sono visivamente più distinti, ma la qualità degli sprite ereditati, il dettaglio a 34/46 pixel e l'illuminazione complessiva potrebbero richiedere ancora un vero rifacimento. Il test su Chromium non sostituisce la valutazione visiva del proprietario o un telefono fisico.

**Non modificata:** `threshold/` v17.17.0 stabile. **Non eseguita:** una run autonoma P1→P5 del bot per questa patch. La prima vittoria completa resta da verificare; non usare i test di 500 piani come vittorie del bot.

**Prossimo sprint:** raccogliere feedback visivo su prima/dopo delle quattro categorie, controllare leggibilità di sprite e interattivi con colori nuovi, stressare distribuzione dei meccanismi facoltativi dopo riduzione dell'arredo, poi allargare la direzione artistica alle altre quattro categorie. Successivamente valutare lo sprite atlas originale/nuovo e il salvataggio della run separatamente.
