# AI_PROJECT

## Scope
- Obiettivo principale: rendere la repo "AI-ready" compilando e mantenendo aggiornati i file del kit `AI/` per una estensione VS Code chiamata `custom-command-sidebar`.
- Ambito incluso: documentazione operativa (`AI_PROJECT`, `AI_PRD`, `AI_RUNBOOK`, `AI_INVENTORY`, `AI_TASKS`, `METADATA`), knowledge graph (`KNOWLEDGE.yaml`), decisioni tecniche (`DECISIONS.md`) e verifica minima dei comandi di build/lint/typecheck presenti in `package.json`.

## Non-goals
- Fuori scope: modifiche funzionali all'estensione (`src/extension.ts`), redesign UI webview, introduzione nuove feature, nuove dipendenze o pipeline CI/CD non esistenti.

## Vincoli
- Modifiche minime necessarie.
- Nessuna nuova dipendenza senza richiesta esplicita.
- Nessun segreto reale nei file del repository.
- Rispettare i comandi realmente definiti in `package.json` senza inventare script.
- Compatibilita' ambiente primario: Windows + PowerShell + VS Code Extension Host.

## DoD
- Tutti i file core del kit `AI/` sono compilati con contenuti pertinenti al repository.
- Nessun placeholder obbligatorio nei file in `AI/`.
- `AI_TASKS.md` contiene step reali, verificabili e chiusi con stato `DONE`.
- `AI/KNOWLEDGE.yaml` aggiornato con entita', relazioni e `changes_log` per ogni step.
- `AI/DECISIONS.md` aggiornato quando emergono scelte non ovvie.
- Audit finale prodotto senza diff.

## Quality gates
- Build: `npm run compile`
- Lint/Format: `npm run lint` (incluso anche in `compile`)
- Unit test: `npm test` (runner `@vscode/test-cli`, richiede ambiente Extension Test Host)
- Integration/E2E: non presenti in questa repo.

## Sicurezza e Privacy
- Dati sensibili coinvolti: nessun dato sensibile applicativo gestito dall'estensione; usa configurazione locale di workspace.
- Gestione secret: non committare token/chiavi nelle impostazioni workspace o nei file `AI/`.
- Regole data handling: i pulsanti/command id sono salvati in `settings.json` del workspace (`myCommandSidebar.categories`), non su servizi remoti.

## Logging e Observability
- Logging standard: messaggi utente tramite `vscode.window.showInformationMessage/showErrorMessage`; log build via `esbuild-problem-matcher`.
- Metriche minime: non previste metriche runtime applicative.
- Alerting/tracing: non implementati.


