# custom-command-sidebar

Estensione VS Code che aggiunge una sidebar `Commands` con pulsanti personalizzabili per eseguire comandi VS Code (anche con argomenti JSON).

## Cosa fa

- Mostra una view `Commands` nella Activity Bar.
- Organizza i pulsanti in categorie (`Preferiti`, `Workspace`, `Github` di default).
- Permette di aggiungere, modificare e rimuovere pulsanti dalla UI.
- Salva la configurazione in `.vscode/settings.json` del workspace.

## Prerequisiti ambiente

- `VS Code` (Engine estensione: `^1.107.0`)
- `Node.js` 22 LTS consigliato
- `npm` (incluso con Node.js)
- `git` (opzionale, ma consigliato)

Verifica rapida:

```powershell
node -v
npm -v
```

## Setup rapido (sviluppo locale)

1. Clona/apri la repository in VS Code.
2. Installa le dipendenze:

```powershell
npm install
```

3. Compila l'estensione:

```powershell
npm run compile
```

4. Avvia in debug:
- Apri tab `Run and Debug`
- Seleziona `Run Extension`
- Premi `F5`
- Si aprira' una nuova finestra `Extension Development Host` con l'estensione caricata

## Comandi utili

- Build completa: `npm run compile`
- Watch (TS + esbuild): `npm run watch`
- Typecheck: `npm run check-types`
- Lint: `npm run lint`
- Test estensione: `npm test`
- Package produzione: `npm run package`

## Configurazione estensione

Impostazione principale:

- `myCommandSidebar.categories`: array di categorie con pulsanti.

Esempio da inserire in `.vscode/settings.json`:

```json
{
  "myCommandSidebar.categories": [
    {
      "id": "favorites",
      "label": "Preferiti",
      "buttons": [
        {
          "label": "Nuovo file",
          "command": "workbench.action.files.newUntitledFile",
          "icon": "new-file"
        },
        {
          "label": "Apri terminale",
          "command": "workbench.action.terminal.new",
          "icon": "terminal"
        }
      ]
    },
    {
      "id": "workspace",
      "label": "Workspace",
      "buttons": []
    }
  ]
}
```

Schema pulsante:

- `label` (string, obbligatorio): testo del pulsante.
- `command` (string, obbligatorio): command id VS Code da eseguire.
- `icon` (string, opzionale): nome Codicon senza prefisso `codicon-`.
- `args` (qualunque JSON, opzionale): argomenti passati al comando.

## Note operative

- Il salvataggio richiede una cartella workspace aperta (non funziona in finestra vuota).
- Se in passato usavi la chiave legacy `myCommandSidebar.buttons`, viene migrata automaticamente in `Preferiti`.

## Troubleshooting

- La sidebar non appare:
  - verifica di aver avviato la finestra `Extension Development Host` con `F5`
  - controlla che non ci siano errori nella `Debug Console`
- I pulsanti non salvano:
  - assicurati di avere un workspace folder aperto
  - verifica i permessi di scrittura su `.vscode/settings.json`
- Un comando fallisce:
  - controlla che il `command` sia un command id valido
  - se usi `args`, assicurati che sia JSON valido
