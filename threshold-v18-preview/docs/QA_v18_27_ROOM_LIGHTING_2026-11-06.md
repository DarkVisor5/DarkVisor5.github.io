# Threshold v18.27 — illuminazione ambientale nelle stanze (QA)

**ID:** `THR-20261106-001` · **Data:** 06/11/2026 · **Anteprima:** `v18.27` · **Stabile protetta:** `v17.17.0`

## Diagnosi dal codice v18.26 precedente
La critica riguarda stanze arredate con luce percepita come troppo concentrata e arredi poco leggibili. Prima dell'intervento, in `threshold-v18-preview/js/game.js`:
- `torchOcclusionPolygon()` interrompe i raggi quando incontra `#` nella mappa. **Gli arredi non bloccavano i raggi**, quindi NON era corretto attribuire a un mobile solido una nuova ombra geometrica.
- `buildTorchSet()` non colloca necessariamente una sorgente in ogni stanza: la probabilità varia anche con la superficie; i punti dei corridoi sono generati in modo sparso, con regole separate. Generare altre torce raccoglibili avrebbe alterato la disponibilità delle risorse.
- `drawTorchDarkness()` applica un velo scuro di opacità 0,78 su desktop e 0,74 su mobile, poi sottrae al velo i gradienti delle luci. Nessuna riflessione diffusa specifica per la stanza arredata.
- `drawV18RoomDecor(c,true)` rischiarava gli sprite vicini al giocatore, in funzione della sola distanza, non considerando le sorgenti effettivamente presenti nella stanza.

## Correzione applicata, soltanto rendering
**Commit codice GitHub verificato:** `2bb117831442a5be2f8999c38a916c9802258af8` (base `3a3e64aefbc1a09e2994b7def977de66de075885`).

1. Nuova funzione `drawVisibleRoomBounce(c)`: riflessione morbida della torcia portatile e delle lampade realmente osservate **entro la stanza del personaggio**. La luce è ritagliata sulle sole caselle `s.visible` della stanza, non sui corridoi, muri, celle inesplorate o stanze attigue. Con luce portatile a zero e senza torce fisse visibili non si crea una sorgente gratuita.
2. Nuova funzione `v18FurnitureLightLift(prop)`: il passaggio di ravvivamento degli arredi tiene conto sia della vicinanza del personaggio sia delle torce reali, note e non prelevate nella medesima stanza.
3. Versione del menu `v18.27` e identificativo `THR-20261106-001` visibili nell'Accampamento; `window.__thresholdBuild` espone versione e change ID nel debug. Aggiornato parametro di cache busting per `game.js`.
4. **Nessuna modifica** a `s.visible`, `updateVisibility()`, `hasLineOfSight()`, durata o quantità torce, consumo luce quando si attraversano le soglie, Allarme, HP, boss, loot, puzzle, IA, armi o generazione di stanze. `threshold/index.html` stabile non è stato toccato.

## QA eseguito realmente
**CI [GitHub Actions 42193228121](https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/42193228121): SUCCESS.**
- `node --check` del motore, regressioni arredi v18.24, enigmi Fase B v18.25, meccanismi v18.26: success. Iniziale incompatibilità del vecchio test con il parametro cache di v18.27 corretta in `tools/qa_v18_24_furniture.cjs` (non era un errore di sintassi).
- Browser **Chromium desktop 1280×800 e mobile 390×844**: avvio, movimento, asset e console senza errori nel controllo ordinario `tools/qa_v18_26_browser.cjs`.
- **Confronto reale prima/dopo in Chromium**, `tools/qa_v18_27_lighting.cjs`: fixture VISIVA guidata, mappa P1 effettivamente generata con seed `20261106` e personaggio ricollocato nella stessa stanza 9×5 senza torce fisse, luce impostata a 85 in ENTRAMBE le build. **Non è una partita P1→P5 di bot né un playtest umano.**
- Media luminanza nel test su 29 caselle del pavimento visibile: desktop **53,6255 → 55,4872** (+1,8617); mobile **56,5835 → 58,2354** (+1,6520). In entrambi i casi stessa stanza, `seen=103`, `visible=57` e `torch=85`.
- Stress QA di **500 piani effettivamente generati**, **500 enigmi principali risolti**, **993 nicchie opzionali** e **15.547 arredi** analizzati, nessuna regressione segnalata nel workflow.
- Primo artifact di screenshot del test aveva la guida sovrapposta all'elemento canvas pur con confronto numerico corretto. Il test corrente salva invece i **pixel reali** mediante `canvas.toDataURL()`; verifica CI di questa correzione avviata nel workflow [42193446431](https://github.com/DarkVisor5/DarkVisor5.github.io/actions/runs/42193446431). Non considerare valide le precedenti schermate con guida sovrapposta.

## Valutazione, limitazioni e prossimi controlli
Il miglioramento è **verificato quantitativamente, ma modesto**. Non dichiarare una rivoluzione grafica né una qualità approvata da giocatori. La nuova riflessione riguarda soltanto la stanza in cui si trova il personaggio, non un modello fisico completo dell'illuminazione dell'intero dungeon. I raggi delle torce restano ostruiti dai muri come in v18.26; gli arredi sono rischiarati per leggibilità e non generano automaticamente nuove sorgenti.

**Problemi aperti:** valutazione qualitativa con screenshot corretti di cripte, infermerie, archivi e stanze grandi; test umano su smartphone; verifica del carico di rendering su dispositivi economici; eventuale regolazione del coefficiente di riflessione senza compromettere il buio intenzionale. **La prima vittoria completa del bot P1→P5 resta non dimostrata**; questo QA non contiene partite complete del bot.

**Tracciabilità:** modifiche a `threshold-v18-preview/js/game.js`, `threshold-v18-preview/index.html`, `tools/qa_v18_24_furniture.cjs`, `tools/qa_v18_27_lighting.cjs`, `.github/workflows/qa-threshold-v18.yml`; report, changelog, manifest. Il codice stabile v17 resta separato.

**Avviso continuità:** prima di questa patch, il repository conteneva codice QA bot `THR-20261103-005` su HEAD `3a3e64a...` mentre il manifest era rimasto a `THR-20261103-004`. Non interpretare tale mancata sincronizzazione come una nuova build v18.
