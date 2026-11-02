# Threshold v18.26 — Fase B · Meccanismi, porte animate, trappole e stanze dinamiche

Data: 2 novembre 2026.

## Meccaniche realizzate

1. **Nicchie laterali**: per ogni piano il generatore tenta fino a due porte opzionali, ciascuna ricavata in una *parete cieca*, già esistente. Sono scelte solo pareti con un'unica casella aperta adiacente e verifiche contro varchi obbligatori, torce, segreti e porte principali. Fino alla risoluzione la parete resta un muro. Quando una prova apre la nicchia, il gioco scava solo quel singolo blocco, apre le ante con animazione su Canvas (640 ms) e colloca una ricompensa raccoglibile camminandoci sopra. Le scale e le connessioni obbligatorie sono immutate.
2. **Cinque meccanismi contestuali**: banco armeria, orologio astronomico, campana del santuario, argano del magazzino e cassaforte a manovella. Attivarli produce una ricompensa modesta, alimenta la luce, neutralizza eventuali trappole Phase B nella stessa stanza e tenta di aprire la nicchia dello stesso ambiente.
3. **Trappole da indovinello**: dopo una risposta errata il sistema può creare una nuova trappola *già visibile*, in una posizione interna secondaria della stanza, fuori da scale, sigilli, obiettivi, arredi e casella occupata del giocatore. Non è una barriera di progressione, e il meccanismo della stanza può disarmarla.
4. **Persistenza per piano**: gli esiti di ciascun oggetto, porte già aperte e trappole restano nello stato della run. La discesa rigenera la configurazione e azzera soltanto gli elementi del nuovo piano.
5. **Sistema modulare**: `js/phase-b-world.js` espone `ThresholdPhaseBWorld.create({getRun,getFurniture,now,effects})`. La banca di 32 domande e il controller di UI rimangono indipendenti.

## Compatibilità

Non viene mai aggiunto un muro sulle caselle già percorribili: le porte sono bonus e non alterano i puzzle P1–P5, la raggiungibilità delle scale o i boss. I disegni Fase A continuano a funzionare con lo stesso renderer; v17 stabile invariata.

## QA residuo

Eseguire test statici del motore di mondo, test generazione su più mappe e browser/playtest veri (desktop e smartphone), compreso oscuramento, animazioni, raccolta ricompensa, fuga e trappole.
