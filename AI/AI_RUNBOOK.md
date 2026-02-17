# AI_RUNBOOK

## Setup/Install
- Prerequisiti:
  - Node.js compatibile con dipendenze (`@types/node` 22.x).
  - VS Code 1.107+ per sviluppo/host estensione.
- Installazione dipendenze:
  - `npm install`

Note Windows (PowerShell):
- Eseguire i comandi dalla root repo (`VSCode-custom-button`).
- Se policy script blocca tool npm, aprire PowerShell con policy adeguata per sessione (`Set-ExecutionPolicy -Scope Process`).

## Dev
- Compilazione continua:
  - `npm run watch`
- Solo bundler watch:
  - `npm run watch:esbuild`
- Solo typecheck watch:
  - `npm run watch:tsc`
- Debug host estensione:
  - In VS Code premere `F5` con configurazione `.vscode/launch.json` (`Run Extension`).

## Build
- Build sviluppo:
  - `npm run compile`
- Build produzione (prepublish):
  - `npm run package`
- Hook prepublish:
  - `npm run vscode:prepublish`

## Lint/Format/Typecheck
- Typecheck:
  - `npm run check-types`
- Lint:
  - `npm run lint`
- Formatter dedicato: non configurato in `package.json`.

## Test (unit/integration/e2e)
- Preparazione test (gia' inclusa in `pretest`):
  - `npm run compile-tests`
- Esecuzione test:
  - `npm test`

Nota: i test usano `@vscode/test-cli` e richiedono ambiente GUI/Extension Test Host disponibile.

### Baseline test runner (Windows, 2026-02-17)
- `npm install`: OK
- `npm run compile`: OK
- `npm run lint`: OK
- `npm test`: KO (runner non avviato)
- Errore osservato: `Code.exe non è riconosciuto come comando interno o esterno` su path `.vscode-test` con spazi.

## Packaging
- Bundle per marketplace locale:
  - `npm run package`
- Creazione VSIX (se `vsce` disponibile globalmente):
  - `vsce package`

## Quality gates (prima dei commit)
- `npm run compile`
- `npm run lint` (se non gia' eseguito tramite `compile`)
- `npm test` quando ambiente test host e' disponibile.
- Verifica manuale smoke in Extension Development Host (`F5`).

## Troubleshooting rapido
- Errore JSON args in UI: correggere input in fase add/edit (deve essere JSON valido).
- Pulsanti non persistono: verificare presenza workspace folder aperta.
- Sidebar vuota inattesa: controllare setting `myCommandSidebar.categories` in `.vscode/settings.json` o workspace settings.
- Se `npm test` fallisce con `Code.exe non è riconosciuto`, verificare path workspace con spazi e usare il runner aggiornato (STEP 002 in `AI/AI_TASKS.md`).

## Sezioni non deducibili (TODO)
- Comandi Python: `<<REQUIRED>>` (nessun `pyproject.toml`/`requirements.txt` trovato).
- Comandi Docker/Compose: `<<REQUIRED>>` (nessun `Dockerfile`/`docker-compose*` trovato).
- Target Makefile: `<<REQUIRED>>` (nessun `Makefile` trovato).

## Test runner overrides (STEP 009)
- VSCODE_TEST_USER_DATA_DIR: override cartella profilo del test host.
- VSCODE_TEST_EXTENSIONS_DIR: override cartella estensioni del test host.
- Il runner usa profili isolati e filtra il warning Error mutex already exists dall'output.

