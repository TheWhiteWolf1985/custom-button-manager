# custom-command-sidebar

Estensione VS Code che aggiunge una sidebar `Commands` con categorie e tile cliccabili per eseguire comandi VS Code o comandi terminale.

## Funzionalita principali

- View `Commands` nella Activity Bar.
- Layout a tile verticali 1-per-riga per tutte le categorie.
- Azione globale `Aggiungi categoria`.
- Menu categoria `...` con azioni:
  - `Aggiungi pulsante`
  - `Rinomina`
  - `Elimina` (con conferma hard se la categoria non e vuota)
- Validazione nomi case-insensitive:
  - nome categoria univoco globale
  - nome pulsante univoco dentro la categoria
- Starter pack categorie:
  - `AI`
  - `Workspace`
  - `Github`
  - `Build/Test`
  - `Utils`
- Starter pack azioni:
  - GitHub: `Fetch`, `Pull`, `Push`, `Remote`, `Branches Remote`, `Status`
  - AI: `Crea struttura AI`
  - Utils: `Reload Window`

## Prerequisiti

- VS Code `^1.107.0`
- Node.js 22 LTS consigliato
- npm

Verifica rapida:

```powershell
node -v
npm -v
```

## Setup sviluppo

1. Apri la repository in VS Code.
2. Installa dipendenze:

```powershell
npm install
```

3. Compila:

```powershell
npm run compile
```

4. Avvia Extension Development Host:
   - `Run and Debug`
   - configurazione `Run Extension`
   - `F5`

## Script utili

- `npm run compile`: typecheck + lint + bundle
- `npm run watch`: watch completo (tsc + esbuild)
- `npm run check-types`: typecheck
- `npm run lint`: lint sorgenti
- `npm test`: test extension host
- `npm run package`: bundle produzione

## Configurazione

Setting principale:

- `myCommandSidebar.categories`

Esempio:

```json
{
  "myCommandSidebar.categories": [
    {
      "id": "ai",
      "label": "AI",
      "buttons": [
        {
          "label": "Crea struttura AI",
          "title": "Crea struttura AI",
          "description": "Crea AI/ e i file base del kit",
          "icon": "folder-library",
          "command": "workbench.action.terminal.new",
          "terminalCommand": "powershell -ExecutionPolicy Bypass -File \"<path-script>\""
        }
      ]
    },
    {
      "id": "github",
      "label": "Github",
      "buttons": [
        {
          "label": "Git Fetch",
          "title": "Fetch",
          "description": "Aggiorna refs dal remoto",
          "icon": "arrow-down",
          "command": "workbench.action.terminal.new",
          "terminalCommand": "git fetch"
        }
      ]
    }
  ]
}
```

Campi supportati per bottone:

- `label` (obbligatorio)
- `command` (obbligatorio)
- `title` (opzionale, fallback su `label`)
- `description` (opzionale)
- `icon` (opzionale, Codicon senza prefisso `codicon-`)
- `args` (opzionale, JSON qualsiasi)
- `terminalCommand` (opzionale, se presente viene eseguito nel terminale dedicato)

## Bootstrap AI da pulsante

Il pulsante `Crea struttura AI` usa lo script:

- `scripts/create-ai-structure.ps1`

Sorgente template:

- `AI_structure/`

Comportamento:

- crea `AI/` nel workspace target copiando il template
- se `AI/` esiste gia, la rinomina in `AI_new`, `AI_new_2`, `AI_new_3`, ...
- su sistemi non Windows mostra messaggio di funzione non disponibile

## Note operative

- Per salvare configurazione serve una cartella workspace aperta.
- La chiave legacy `myCommandSidebar.buttons` viene migrata automaticamente nella categoria `AI`.
- I bottoni con `terminalCommand` usano/riusano un terminale VS Code chiamato `Custom Button Manager`.

## Troubleshooting

- Sidebar non visibile:
  - avvia `Run Extension` con `F5`
  - controlla la Debug Console
- Salvataggio pulsanti non riuscito:
  - apri una workspace folder (non finestra vuota)
  - verifica permessi su `.vscode/settings.json`
- Script AI non parte:
  - verifica presenza cartella `AI_structure/` nel root repo dell'estensione
  - verifica esistenza file `scripts/create-ai-structure.ps1`
  - verifica che l'host sia Windows
