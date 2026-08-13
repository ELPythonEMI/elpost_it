# El Post-it | Chrome Extension

Un'estensione per Google Chrome che funge da blocco note rapido e colorato per prendere appunti al volo direttamente dal browser. I dati vengono salvati in locale tramite l'API `chrome.storage.local`, garantendo che i tuoi appunti persistano anche dopo la chiusura del browser.

## Funzionalità

- Gestione note multiple: crea, rinomina ed elimina diversi Post-it. Passa da uno all'altro tramite un menu a tendina.
- Colori personalizzabili: scegli tra vari colori per organizzare i tuoi appunti visivamente.
- Salvataggio con timestamp: salva i tuoi appunti e visualizza l'ora dell'ultimo salvataggio.
- Esportazione: esporta il testo del Post-it corrente in un file `.txt`.
- Contatore caratteri: monitora in tempo reale la lunghezza del testo.
- Orologio e data: widget integrato che mostra data e ora aggiornate.
- UI in italiano: interfaccia utente completamente localizzata in italiano.

## Installazione

Per testare l'estensione su Chrome dal codice sorgente:

1. Clona il repository:
   ```bash
   git clone https://github.com/ELPythonEMI/elpost_it.git
   ```
2. Apri Google Chrome e vai su `chrome://extensions/`.
3. Attiva la **Modalità sviluppatore** in alto a destra.
4. Clicca su **Carica pacchetto non compresso** in alto a sinistra.
5. Seleziona la cartella `elpost_it` clonata in precedenza.

L'estensione apparirà nella barra degli strumenti di Chrome.

## Utilizzo

- Scrivi direttamente nell'area di testo; il contatore di caratteri si aggiornerà da solo.
- Clicca su Salva per memorizzare il testo. Apparirà l'ora del salvataggio.
- Clicca sui cerchi colorati in cima per cambiare il colore del Post-it.
- Clicca su Nuovo per creare una nota separata.
- Usa il menu a tendina in cima per passare da un Post-it all'altro.
- Clicca su Esporta per scaricare il contenuto della nota come file di testo.

## Struttura dei dati

L'estensione salva i dati in modo strutturato per non perdere traccia delle note:

- `postit_meta_v3`: contiene l'ID della nota corrente e l'array di tutte le note (ID, Nome, Colore).
- `postit_data_[ID]`: contiene il testo effettivo della nota.
- `postit_time_[ID]`: contiene il timestamp dell'ultimo salvataggio della nota.

## Licenza

Questo progetto è distribuito sotto la licenza MIT. Sentiti libero di usarlo, modificarlo e distribuirlo.
